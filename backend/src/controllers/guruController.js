const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { success, fail } = require('../utils/http');

async function list(req, res) {
  const [rows] = await db.execute(
    `SELECT g.id_guru, g.id_user, g.nip, g.nuptk, g.nama_lengkap,
            g.gelar_depan, g.gelar_belakang, g.nomor_telepon, g.email,
            g.status, u.username, COALESCE(a.penugasan, 'Belum ditugaskan') AS penugasan
     FROM guru g
     LEFT JOIN pengguna u ON u.id_user = g.id_user
     LEFT JOIN (
       SELECT pg.id_guru,
              GROUP_CONCAT(DISTINCT CONCAT(k.nama_kelas, ' (', pg.peran, ')')
                           ORDER BY k.nama_kelas SEPARATOR ', ') AS penugasan
       FROM penugasan_guru pg
       JOIN kelas k ON k.id_kelas = pg.id_kelas AND k.id_tahun_ajaran = pg.id_tahun_ajaran
       JOIN tahun_ajaran ta ON ta.id_tahun_ajaran = pg.id_tahun_ajaran
       WHERE pg.status = 'Aktif' AND k.status = 'Aktif' AND ta.status = 'Aktif'
       GROUP BY pg.id_guru
     ) a ON a.id_guru = g.id_guru
     UNION ALL
     SELECT NULL AS id_guru, u.id_user, NULL AS nip, NULL AS nuptk, u.nama_lengkap,
            NULL AS gelar_depan, NULL AS gelar_belakang, NULL AS nomor_telepon,
            NULL AS email, 'Perlu Profil' AS status, u.username,
            'Belum ditugaskan' AS penugasan
     FROM pengguna u
     LEFT JOIN guru g ON g.id_user = u.id_user
     WHERE u.role = 'GURU' AND g.id_guru IS NULL
     ORDER BY nama_lengkap`,
  );
  return success(res, rows);
}

async function update(req, res) {
  const id = Number(req.params.id);
  const {
    nama_lengkap: namaLengkap,
    nip,
    nuptk,
    gelar_depan: gelarDepan,
    gelar_belakang: gelarBelakang,
    nomor_telepon: nomorTelepon,
    email,
  } = req.body || {};
  const name = typeof namaLengkap === 'string' ? namaLengkap.trim() : '';
  const optionalFields = [nip, nuptk, gelarDepan, gelarBelakang, nomorTelepon, email];
  if (!Number.isInteger(id) || id < 1) return fail(res, 400, 'ID guru tidak valid.');
  if (!name || name.length > 100
      || optionalFields.some((value) => value !== undefined && value !== null && typeof value !== 'string')) {
    return fail(res, 400, 'Nama atau data tambahan guru tidak valid.');
  }
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [existing] = await conn.execute(
      'SELECT id_user FROM guru WHERE id_guru = ? FOR UPDATE',
      [id],
    );
    if (!existing.length) {
      await conn.rollback();
      return fail(res, 404, 'Profil guru tidak ditemukan.');
    }
    await conn.execute(
      `UPDATE guru
       SET nama_lengkap = ?, nip = ?, nuptk = ?, gelar_depan = ?, gelar_belakang = ?,
           nomor_telepon = ?, email = ?
       WHERE id_guru = ?`,
      [
        name, nip?.trim() || null, nuptk?.trim() || null, gelarDepan?.trim() || null,
        gelarBelakang?.trim() || null, nomorTelepon?.trim() || null, email?.trim() || null, id,
      ],
    );
    if (existing[0].id_user) {
      await conn.execute('UPDATE pengguna SET nama_lengkap = ? WHERE id_user = ?', [name, existing[0].id_user]);
    }
    await conn.commit();
    return success(res, { id_guru: id }, 'Data guru berhasil diperbarui.');
  } catch (error) {
    await conn.rollback();
    if (error.code === 'ER_DUP_ENTRY') return fail(res, 409, 'NIP atau NUPTK sudah digunakan.');
    throw error;
  } finally {
    conn.release();
  }
}

async function remove(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) return fail(res, 400, 'ID guru tidak valid.');
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [teachers] = await conn.execute(
      'SELECT id_guru FROM guru WHERE id_guru = ? FOR UPDATE',
      [id],
    );
    if (!teachers.length) {
      await conn.rollback();
      return fail(res, 404, 'Profil guru tidak ditemukan.');
    }
    await conn.execute("UPDATE guru SET status = 'Nonaktif' WHERE id_guru = ?", [id]);
    await conn.execute(
      `UPDATE penugasan_guru
       SET status = 'Selesai', tanggal_selesai = CURRENT_DATE()
       WHERE id_guru = ? AND status = 'Aktif'`,
      [id],
    );
    await conn.commit();
    return success(res, null, 'Profil guru dinonaktifkan; riwayat penugasan tetap tersimpan.');
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

async function formOptions(req, res) {
  const [classes] = await db.execute(
    `SELECT k.id_kelas, k.nama_kelas, k.tingkat, k.fase, ta.nama_tahun_ajaran,
            EXISTS (
              SELECT 1 FROM penugasan_guru pg
              WHERE pg.id_kelas = k.id_kelas
                AND pg.id_tahun_ajaran = k.id_tahun_ajaran
                AND pg.peran = 'Wali Kelas' AND pg.status = 'Aktif'
            ) AS has_wali_kelas
     FROM kelas k
     JOIN tahun_ajaran ta ON ta.id_tahun_ajaran = k.id_tahun_ajaran
     WHERE k.status = 'Aktif' AND ta.status = 'Aktif'
     ORDER BY k.tingkat, k.nama_kelas`,
  );
  const [subjects] = await db.execute(
    "SELECT id_mapel, nama_mapel FROM mata_pelajaran WHERE status = 'Aktif' ORDER BY nama_mapel",
  );
  return success(res, { classes, subjects });
}

async function linkAccountProfile(req, res) {
  const idUser = Number(req.params.id_user);
  const {
    nama_lengkap: namaLengkap,
    nip,
    nuptk,
    gelar_depan: gelarDepan,
    gelar_belakang: gelarBelakang,
    nomor_telepon: nomorTelepon,
    email,
    id_kelas: idKelas,
    id_mapel: idMapel,
    peran = 'Guru Mapel',
  } = req.body || {};
  const name = typeof namaLengkap === 'string' ? namaLengkap.trim() : '';
  const optionalFields = [nip, nuptk, gelarDepan, gelarBelakang, nomorTelepon, email];
  const hasClass = idKelas !== undefined && idKelas !== null && idKelas !== '';
  const classId = hasClass ? Number(idKelas) : null;
  const subjectId = idMapel === undefined || idMapel === null || idMapel === '' ? null : Number(idMapel);
  if (!Number.isInteger(idUser) || idUser < 1 || !name || name.length > 100
      || optionalFields.some((value) => value !== undefined && value !== null && typeof value !== 'string')
      || (hasClass && (!Number.isInteger(classId) || classId < 1))
      || (hasClass && !['Wali Kelas', 'Guru Mapel'].includes(peran))
      || (hasClass && peran === 'Guru Mapel' && (!Number.isInteger(subjectId) || subjectId < 1))) {
    return fail(res, 400, 'Data profil guru atau penugasan tidak valid.');
  }
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [accounts] = await conn.execute(
      `SELECT u.id_user, u.nama_lengkap
       FROM pengguna u
       LEFT JOIN guru g ON g.id_user = u.id_user
       WHERE u.id_user = ? AND u.role = 'GURU' AND g.id_guru IS NULL
       FOR UPDATE`,
      [idUser],
    );
    if (!accounts.length) {
      await conn.rollback();
      return fail(res, 409, 'Akun guru tidak ditemukan atau sudah memiliki profil.');
    }

    let activeClass = null;
    if (hasClass) {
      const [classRows] = await conn.execute(
        `SELECT k.id_kelas, k.id_tahun_ajaran
         FROM kelas k
         JOIN tahun_ajaran ta ON ta.id_tahun_ajaran = k.id_tahun_ajaran
         WHERE k.id_kelas = ? AND k.status = 'Aktif' AND ta.status = 'Aktif'
         LIMIT 1`,
        [classId],
      );
      if (!classRows.length) {
        await conn.rollback();
        return fail(res, 400, 'Kelas tidak ditemukan atau tidak berada pada tahun ajaran aktif.');
      }
      activeClass = classRows[0];
      if (peran === 'Wali Kelas') {
        const [waliRows] = await conn.execute(
          `SELECT id_penugasan FROM penugasan_guru
           WHERE id_kelas = ? AND id_tahun_ajaran = ?
             AND peran = 'Wali Kelas' AND status = 'Aktif'
           LIMIT 1`,
          [classId, activeClass.id_tahun_ajaran],
        );
        if (waliRows.length) {
          await conn.rollback();
          return fail(res, 409, 'Kelas tersebut sudah memiliki wali kelas.');
        }
      } else {
        const [subjectRows] = await conn.execute(
          "SELECT id_mapel FROM mata_pelajaran WHERE id_mapel = ? AND status = 'Aktif' LIMIT 1",
          [subjectId],
        );
        if (!subjectRows.length) {
          await conn.rollback();
          return fail(res, 400, 'Mata pelajaran tidak ditemukan atau tidak aktif.');
        }
      }
    }

    const [teacher] = await conn.execute(
      `INSERT INTO guru
        (id_user, nip, nuptk, nama_lengkap, gelar_depan, gelar_belakang,
         nomor_telepon, email, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Aktif')`,
      [
        idUser, nip?.trim() || null, nuptk?.trim() || null, name,
        gelarDepan?.trim() || null, gelarBelakang?.trim() || null,
        nomorTelepon?.trim() || null, email?.trim() || null,
      ],
    );
    await conn.execute('UPDATE pengguna SET nama_lengkap = ? WHERE id_user = ?', [name, idUser]);
    if (activeClass) {
      await conn.execute(
        `INSERT INTO penugasan_guru
          (id_guru, id_kelas, id_tahun_ajaran, id_mapel, peran, tanggal_mulai, status)
         VALUES (?, ?, ?, ?, ?, CURRENT_DATE(), 'Aktif')`,
        [
          teacher.insertId,
          classId,
          activeClass.id_tahun_ajaran,
          peran === 'Guru Mapel' ? subjectId : null,
          peran,
        ],
      );
    }
    await conn.commit();
    return success(res, { id_guru: teacher.insertId, id_user: idUser }, 'Profil guru berhasil ditautkan.', 201);
  } catch (error) {
    await conn.rollback();
    if (error.code === 'ER_DUP_ENTRY') return fail(res, 409, 'NIP atau NUPTK sudah digunakan.');
    throw error;
  } finally {
    conn.release();
  }
}

async function create(req, res) {
  const {
    username,
    password,
    nama_lengkap: namaLengkap,
    nip,
    nuptk,
    gelar_depan: gelarDepan,
    gelar_belakang: gelarBelakang,
    nomor_telepon: nomorTelepon,
    email,
    id_kelas: idKelas,
    id_mapel: idMapel,
    peran = 'Guru Mapel',
  } = req.body || {};
  const usernameValue = typeof username === 'string' ? username.trim() : '';
  const nameValue = typeof namaLengkap === 'string' ? namaLengkap.trim() : '';
  if (!usernameValue || usernameValue.length > 50 || !nameValue || nameValue.length > 100
      || typeof password !== 'string' || password.length < 8) {
    return fail(res, 400, 'Nama, username, dan kata sandi minimal 8 karakter wajib diisi.');
  }
  const optionalFields = [nip, nuptk, gelarDepan, gelarBelakang, nomorTelepon, email];
  if (optionalFields.some((value) => value !== undefined && value !== null && typeof value !== 'string')) {
    return fail(res, 400, 'Data tambahan guru tidak valid.');
  }
  const hasClass = idKelas !== undefined && idKelas !== null && idKelas !== '';
  const classId = hasClass ? Number(idKelas) : null;
  const subjectId = idMapel === undefined || idMapel === null || idMapel === '' ? null : Number(idMapel);
  if ((hasClass && (!Number.isInteger(classId) || classId < 1))
      || (hasClass && !['Wali Kelas', 'Guru Mapel'].includes(peran))
      || (hasClass && peran === 'Guru Mapel' && (!Number.isInteger(subjectId) || subjectId < 1))) {
    return fail(res, 400, 'Penugasan kelas dan mata pelajaran tidak valid.');
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    let activeClass = null;
    if (hasClass) {
      const [classRows] = await connection.execute(
        `SELECT k.id_kelas, k.id_tahun_ajaran
         FROM kelas k
         JOIN tahun_ajaran ta ON ta.id_tahun_ajaran = k.id_tahun_ajaran
         WHERE k.id_kelas = ? AND k.status = 'Aktif' AND ta.status = 'Aktif'
         LIMIT 1`,
        [classId],
      );
      if (!classRows.length) {
        await connection.rollback();
        return fail(res, 400, 'Kelas tidak ditemukan atau tidak berada pada tahun ajaran aktif.');
      }
      activeClass = classRows[0];
      if (peran === 'Wali Kelas') {
        const [waliRows] = await connection.execute(
          `SELECT id_penugasan FROM penugasan_guru
           WHERE id_kelas = ? AND id_tahun_ajaran = ?
             AND peran = 'Wali Kelas' AND status = 'Aktif'
           LIMIT 1`,
          [classId, activeClass.id_tahun_ajaran],
        );
        if (waliRows.length) {
          await connection.rollback();
          return fail(res, 409, 'Kelas tersebut sudah memiliki wali kelas. Pilih peran Guru Mapel atau kelas lain.');
        }
      } else {
        const [subjectRows] = await connection.execute(
          "SELECT id_mapel FROM mata_pelajaran WHERE id_mapel = ? AND status = 'Aktif' LIMIT 1",
          [subjectId],
        );
        if (!subjectRows.length) {
          await connection.rollback();
          return fail(res, 400, 'Mata pelajaran tidak ditemukan atau tidak aktif.');
        }
      }
    }

    const [account] = await connection.execute(
      'INSERT INTO pengguna (username, password, role, nama_lengkap) VALUES (?, ?, \'GURU\', ?)',
      [usernameValue, await bcrypt.hash(password, 10), nameValue],
    );
    const [teacher] = await connection.execute(
      `INSERT INTO guru
        (id_user, nip, nuptk, nama_lengkap, gelar_depan, gelar_belakang,
         nomor_telepon, email, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Aktif')`,
      [
        account.insertId,
        nip?.trim() || null,
        nuptk?.trim() || null,
        nameValue,
        gelarDepan?.trim() || null,
        gelarBelakang?.trim() || null,
        nomorTelepon?.trim() || null,
        email?.trim() || null,
      ],
    );
    if (activeClass) {
      await connection.execute(
        `INSERT INTO penugasan_guru
          (id_guru, id_kelas, id_tahun_ajaran, id_mapel, peran, tanggal_mulai, status)
         VALUES (?, ?, ?, ?, ?, CURRENT_DATE(), 'Aktif')`,
        [
          teacher.insertId,
          classId,
          activeClass.id_tahun_ajaran,
          peran === 'Guru Mapel' ? subjectId : null,
          peran,
        ],
      );
    }
    await connection.commit();
    return success(res, {
      id_guru: teacher.insertId,
      id_user: account.insertId,
      username: usernameValue,
      nama_lengkap: nameValue,
      penugasan: activeClass ? { id_kelas: classId, peran, id_mapel: peran === 'Guru Mapel' ? subjectId : null } : null,
    }, 'Data guru dan akun berhasil disimpan.', 201);
  } catch (error) {
    await connection.rollback();
    if (error.code === 'ER_DUP_ENTRY') {
      return fail(res, 409, 'Username, NIP, atau NUPTK sudah digunakan.');
    }
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = { list, formOptions, linkAccountProfile, create, update, remove };
