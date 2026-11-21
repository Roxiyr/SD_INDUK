const db = require('../config/database');
const { success, fail } = require('../utils/http');
const headerFields = ['nisn','id_user','kelas','fase','semester','tahun_pelajaran','absensi_sakit','absensi_izin','absensi_tanpa_ket','catatan_wali_kelas','keputusan_akhir'];
const tables = { mapel: ['nilai_mapel',['kategori_mapel','nama_mapel','nilai_akhir','capaian_kompetensi'],'id_nilai_mapel'], p5: ['profil_pancasila',['dimensi','elemen','sub_elemen','target_pencapaian'],'id_profil'], ekskul: ['nilai_ekstrakurikuler',['rumpun_ekskul','nama_ekskul','predikat','keterangan'],'id_ekskul'] };

async function canAccessStudent(user, nisn) {
  if (user.role === 'OPERATOR') return true;
  const [rows] = await db.execute(
    `SELECT 1
     FROM guru g
     JOIN penugasan_guru pg
       ON pg.id_guru = g.id_guru AND pg.status = 'Aktif'
     JOIN siswa_kelas sk
       ON sk.id_kelas = pg.id_kelas
      AND sk.id_tahun_ajaran = pg.id_tahun_ajaran
      AND sk.status = 'Aktif'
     JOIN tahun_ajaran ta
       ON ta.id_tahun_ajaran = sk.id_tahun_ajaran AND ta.status = 'Aktif'
     WHERE g.id_user = ? AND g.status = 'Aktif' AND sk.nisn = ?
     LIMIT 1`,
    [user.id_user, nisn],
  );
  return rows.length > 0;
}

async function canAccessReport(user, idRapor) {
  const [rows] = await db.execute(
    'SELECT nisn FROM rapor_capaian WHERE id_rapor = ?',
    [idRapor],
  );
  if (!rows.length) return null;
  return await canAccessStudent(user, rows[0].nisn) ? rows[0].nisn : false;
}

async function reportVerificationStatus(idRapor) {
  const [[row]] = await db.execute(
    `SELECT status, catatan, created_at
     FROM riwayat_verifikasi_rapor
     WHERE id_rapor = ?
     ORDER BY id_verifikasi DESC
     LIMIT 1`,
    [idRapor],
  );
  return row || { status: 'Belum Diajukan', catatan: null, created_at: null };
}

async function ensureEditable(req, res, idRapor) {
  if (req.user.role === 'OPERATOR') return true;
  const verification = await reportVerificationStatus(idRapor);
  if (['Diajukan', 'Disetujui'].includes(verification.status)) {
    fail(res, 409, 'Rapor sedang ditinjau atau sudah disetujui sehingga tidak dapat diubah.');
    return false;
  }
  return true;
}

async function listByStudent(req, res) {
  if (!(await canAccessStudent(req.user, req.params.nisn))) {
    return fail(res, 403, 'Anda tidak memiliki akses ke rapor siswa tersebut.');
  }
  const [rows] = await db.execute(
    `SELECT r.*,
            COALESCE((SELECT rv.status FROM riwayat_verifikasi_rapor rv
                      WHERE rv.id_rapor = r.id_rapor
                      ORDER BY rv.id_verifikasi DESC LIMIT 1), 'Belum Diajukan') AS status_verifikasi,
            (SELECT rv.catatan FROM riwayat_verifikasi_rapor rv
             WHERE rv.id_rapor = r.id_rapor
             ORDER BY rv.id_verifikasi DESC LIMIT 1) AS catatan_verifikasi
     FROM rapor_capaian r
     WHERE r.nisn = ?
     ORDER BY r.kelas, r.tahun_pelajaran, r.semester`,
    [req.params.nisn],
  );
  return success(res, rows);
}
async function detail(req, res) {
  const access = await canAccessReport(req.user, req.params.id_rapor);
  if (access === null) return fail(res, 404, 'Rapor tidak ditemukan.');
  if (access === false) return fail(res, 403, 'Anda tidak memiliki akses ke rapor tersebut.');
  const [rows] = await db.execute('SELECT * FROM rapor_capaian WHERE id_rapor=?', [req.params.id_rapor]);
  const rapor = rows[0];
  const [[mapel],[p5],[ekskul],[verificationHistory]] = await Promise.all([
    db.execute('SELECT * FROM nilai_mapel WHERE id_rapor=? ORDER BY id_nilai_mapel', [rapor.id_rapor]),
    db.execute('SELECT * FROM profil_pancasila WHERE id_rapor=? ORDER BY id_profil', [rapor.id_rapor]),
    db.execute('SELECT * FROM nilai_ekstrakurikuler WHERE id_rapor=? ORDER BY id_ekskul', [rapor.id_rapor]),
    db.execute('SELECT id_verifikasi, status, catatan, created_at FROM riwayat_verifikasi_rapor WHERE id_rapor=? ORDER BY id_verifikasi DESC', [rapor.id_rapor]),
  ]);
  return success(res, {
    ...rapor,
    status_verifikasi: verificationHistory[0]?.status || 'Belum Diajukan',
    catatan_verifikasi: verificationHistory[0]?.catatan || null,
    riwayat_verifikasi: verificationHistory,
    nilai_mapel: mapel,
    profil_pancasila: p5,
    nilai_ekstrakurikuler: ekskul,
  });
}
async function create(req, res) {
  const data = { ...(req.body || {}), id_user: req.user.id_user }; const errors = [];
  for (const field of ['nisn','kelas','fase','semester','tahun_pelajaran']) if (!data[field]) errors.push({ field, detail: `${field} wajib diisi.` });
  if (!['A','B','C'].includes(data.fase)) errors.push({ field:'fase', detail:'Fase harus A, B, atau C.' });
  if (!['Ganjil','Genap'].includes(data.semester)) errors.push({ field:'semester', detail:'Semester harus Ganjil atau Genap.' });
  if (errors.length) return fail(res, 400, 'Validasi rapor gagal.', errors);
  if (!(await canAccessStudent(req.user, data.nisn))) {
    return fail(res, 403, 'Anda tidak memiliki akses untuk membuat rapor siswa tersebut.');
  }
  const cols = headerFields.filter((field) => data[field] !== undefined);
  try {
    const [result] = await db.execute(`INSERT INTO rapor_capaian (${cols.map((f)=>`\`${f}\``).join(',')}) VALUES (${cols.map(()=>'?').join(',')})`, cols.map((f)=>data[f]));
    return success(res, { id_rapor: result.insertId }, 'Header rapor berhasil dibuat.', 201);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return fail(res, 409, 'Rapor untuk siswa, semester, dan tahun pelajaran tersebut sudah ada.');
    throw error;
  }
}
async function update(req, res) {
  const access = await canAccessReport(req.user, req.params.id_rapor);
  if (access === null) return fail(res, 404, 'Rapor tidak ditemukan.');
  if (access === false) return fail(res, 403, 'Anda tidak memiliki akses untuk mengubah rapor tersebut.');
  if (!(await ensureEditable(req, res, req.params.id_rapor))) return undefined;
  const allowed = headerFields.filter((f) => !['nisn','id_user'].includes(f)); const cols = allowed.filter((f)=>req.body?.[f] !== undefined);
  if (!cols.length) return fail(res, 400, 'Tidak ada field rapor yang dapat diperbarui.');
  const [result] = await db.execute(`UPDATE rapor_capaian SET ${cols.map((f)=>`\`${f}\`=?`).join(',')} WHERE id_rapor=?`, [...cols.map((f)=>req.body[f]), req.params.id_rapor]);
  if (!result.affectedRows) return fail(res, 404, 'Rapor tidak ditemukan.');
  return success(res, { id_rapor: Number(req.params.id_rapor) }, 'Rapor berhasil diperbarui.');
}
async function saveItems(req, res, type) {
  const [table, allowed] = tables[type]; const rows = Array.isArray(req.body?.data) ? req.body.data : (Array.isArray(req.body) ? req.body : [req.body || {}]);
  if (!rows.length) return fail(res, 400, 'Data item wajib diisi.');
  if (type === 'mapel' && rows.some((r)=>!r.nama_mapel || !r.kategori_mapel || !Number.isInteger(Number(r.nilai_akhir)) || Number(r.nilai_akhir)<0 || Number(r.nilai_akhir)>100)) return fail(res, 400, 'Nilai mapel harus bilangan bulat 0 sampai 100 dan nama serta kategori wajib diisi.');
  if (type === 'p5' && rows.some((r)=>!['BB','MB','BSH','SB'].includes(r.target_pencapaian))) return fail(res, 400, 'Target pencapaian P5 harus BB, MB, BSH, atau SB.');
  if (type === 'ekskul' && rows.some((r)=>!['Krida','Karya Ilmiah','Latihan Olah Bakat dan Minat','Keagamaan'].includes(r.rumpun_ekskul) || !['Sangat Baik','Baik','Cukup'].includes(r.predikat))) return fail(res, 400, 'Rumpun atau predikat ekstrakurikuler tidak valid.');
  const access = await canAccessReport(req.user, req.params.id_rapor);
  if (access === null) return fail(res, 404, 'Rapor tidak ditemukan.');
  if (access === false) return fail(res, 403, 'Anda tidak memiliki akses untuk mengubah rapor tersebut.');
  if (!(await ensureEditable(req, res, req.params.id_rapor))) return undefined;
  const conn=await db.getConnection();
  try { await conn.beginTransaction(); const saved=[];
    for (const item of rows) {
      const values = allowed.map((field)=>item[field] ?? null); const idField = tables[type][2]; const existingId = item[idField];
      if (existingId) {
        const updateFields=allowed.filter((field)=>item[field] !== undefined);
        const [result]=await conn.execute(`UPDATE ${table} SET ${updateFields.map((f)=>`\`${f}\`=?`).join(',')} WHERE ${idField}=? AND id_rapor=?`, [...updateFields.map((f)=>item[f]),existingId,req.params.id_rapor]);
        if (!result.affectedRows) throw Object.assign(new Error('Item rapor tidak ditemukan.'), { status:404 }); saved.push(existingId);
      } else {
        const [result]=await conn.execute(`INSERT INTO ${table} (id_rapor,${allowed.map((f)=>`\`${f}\``).join(',')}) VALUES (${[req.params.id_rapor,...values].map(()=>'?').join(',')})`,[req.params.id_rapor,...values]); saved.push(result.insertId);
      }
    }
    await conn.commit(); return success(res,{items:saved},'Data rapor berhasil disimpan.');
  } catch(error) { await conn.rollback(); if(error.status) return fail(res,error.status,error.message); throw error; } finally { conn.release(); }
}

async function removeItem(req, res) {
  const definition = tables[req.params.type];
  if (!definition) return fail(res, 400, 'Jenis item rapor tidak valid.');
  const itemId = Number(req.params.id_item);
  if (!Number.isInteger(itemId) || itemId < 1) return fail(res, 400, 'ID item rapor tidak valid.');
  const access = await canAccessReport(req.user, req.params.id_rapor);
  if (access === null) return fail(res, 404, 'Rapor tidak ditemukan.');
  if (access === false) return fail(res, 403, 'Anda tidak memiliki akses untuk mengubah rapor tersebut.');
  if (!(await ensureEditable(req, res, req.params.id_rapor))) return undefined;
  const [table, , idField] = definition;
  const [result] = await db.execute(
    `DELETE FROM ${table} WHERE ${idField} = ? AND id_rapor = ?`,
    [itemId, req.params.id_rapor],
  );
  if (!result.affectedRows) return fail(res, 404, 'Item rapor tidak ditemukan.');
  return success(res, null, 'Item rapor berhasil dihapus.');
}

async function listClassReports(req, res) {
  const classId = Number(req.params.id_kelas);
  const semester = req.query.semester;
  if (!Number.isInteger(classId) || classId < 1 || !['Ganjil', 'Genap'].includes(semester)) {
    return fail(res, 400, 'Kelas dan semester yang valid wajib dipilih.');
  }
  const [[year]] = await db.execute(
    "SELECT id_tahun_ajaran, nama_tahun_ajaran FROM tahun_ajaran WHERE status = 'Aktif' LIMIT 1",
  );
  if (!year) return success(res, { students: [], subjects: [], academicYear: null });
  const [classes] = await db.execute(
    `SELECT k.id_kelas, k.nama_kelas, k.tingkat, k.fase
     FROM kelas k
     WHERE k.id_kelas = ? AND k.id_tahun_ajaran = ? AND k.status = 'Aktif'
       AND (? = 'OPERATOR' OR EXISTS (
         SELECT 1 FROM penugasan_guru pg
         JOIN guru g ON g.id_guru = pg.id_guru
         WHERE pg.id_kelas = k.id_kelas AND pg.id_tahun_ajaran = k.id_tahun_ajaran
           AND pg.status = 'Aktif' AND g.status = 'Aktif' AND g.id_user = ?
       ))
     LIMIT 1`,
    [classId, year.id_tahun_ajaran, req.user.role, req.user.id_user],
  );
  if (!classes.length) return fail(res, 403, 'Kelas tidak ditugaskan kepada akun Anda.');
  const [rows] = await db.execute(
    `SELECT s.nisn, s.nama_lengkap, r.id_rapor, r.kelas, r.fase, r.semester,
            r.tahun_pelajaran, r.updated_at,
            COALESCE(rv.status, 'Belum Diajukan') AS status_verifikasi,
            rv.catatan AS catatan_verifikasi,
            COUNT(nm.id_nilai_mapel) AS jumlah_mapel,
            COALESCE(MAX(pp.total), 0) AS jumlah_p5,
            ROUND(AVG(nm.nilai_akhir), 1) AS nilai_rata_rata
     FROM siswa_kelas sk
     JOIN siswa s ON s.nisn = sk.nisn
     LEFT JOIN rapor_capaian r
       ON r.nisn = s.nisn AND r.semester = ? AND r.tahun_pelajaran = ?
     LEFT JOIN riwayat_verifikasi_rapor rv
       ON rv.id_verifikasi = (
         SELECT MAX(rv2.id_verifikasi) FROM riwayat_verifikasi_rapor rv2
         WHERE rv2.id_rapor = r.id_rapor
       )
     LEFT JOIN nilai_mapel nm ON nm.id_rapor = r.id_rapor
       LEFT JOIN (
         SELECT id_rapor, COUNT(*) AS total FROM profil_pancasila GROUP BY id_rapor
       ) pp ON pp.id_rapor = r.id_rapor
     WHERE sk.id_kelas = ? AND sk.id_tahun_ajaran = ?
       AND sk.status = 'Aktif' AND s.status_siswa = 'Aktif'
     GROUP BY s.nisn, s.nama_lengkap, r.id_rapor, r.kelas, r.fase, r.semester,
              r.tahun_pelajaran, r.updated_at, rv.status, rv.catatan
     ORDER BY s.nama_lengkap`,
    [semester, year.nama_tahun_ajaran, classId, year.id_tahun_ajaran],
  );
  const reportIds = rows.map((row) => row.id_rapor).filter(Boolean);
  let scoreRows = [];
  if (reportIds.length) {
    const placeholders = reportIds.map(() => '?').join(', ');
    [scoreRows] = await db.execute(
      `SELECT id_rapor, kategori_mapel, nama_mapel, nilai_akhir
       FROM nilai_mapel WHERE id_rapor IN (${placeholders}) ORDER BY nama_mapel`,
      reportIds,
    );
  }
  const scoresByReport = new Map();
  for (const score of scoreRows) {
    if (!scoresByReport.has(score.id_rapor)) scoresByReport.set(score.id_rapor, []);
    scoresByReport.get(score.id_rapor).push(score);
  }
  const students = rows.map((row) => ({
    ...row,
    jumlah_mapel: Number(row.jumlah_mapel),
    nilai_rata_rata: row.nilai_rata_rata === null ? null : Number(row.nilai_rata_rata),
    nilai_mapel: scoresByReport.get(row.id_rapor) || [],
  }));
  const subjects = [...new Set(scoreRows.map((row) => row.nama_mapel))].sort((a, b) => a.localeCompare(b, 'id'));
  return success(res, { class: classes[0], semester, academicYear: year.nama_tahun_ajaran, students, subjects });
}

async function listPendingVerification(req, res) {
  const [[year]] = await db.execute(
    "SELECT nama_tahun_ajaran FROM tahun_ajaran WHERE status = 'Aktif' LIMIT 1",
  );
  if (!year) return success(res, []);
  const [rows] = await db.execute(
    `SELECT r.id_rapor, r.nisn, s.nama_lengkap, r.kelas, r.fase, r.semester,
            r.tahun_pelajaran, r.catatan_wali_kelas, rv.catatan AS catatan_pengajuan,
            rv.created_at AS diajukan_pada, COUNT(DISTINCT nm.id_nilai_mapel) AS jumlah_mapel,
            COUNT(DISTINCT pp.id_profil) AS jumlah_p5
     FROM rapor_capaian r
     JOIN siswa s ON s.nisn = r.nisn
     JOIN riwayat_verifikasi_rapor rv
       ON rv.id_verifikasi = (
         SELECT MAX(rv2.id_verifikasi) FROM riwayat_verifikasi_rapor rv2
         WHERE rv2.id_rapor = r.id_rapor
       ) AND rv.status = 'Diajukan'
     LEFT JOIN nilai_mapel nm ON nm.id_rapor = r.id_rapor
     LEFT JOIN profil_pancasila pp ON pp.id_rapor = r.id_rapor
     WHERE r.tahun_pelajaran = ?
     GROUP BY r.id_rapor, r.nisn, s.nama_lengkap, r.kelas, r.fase, r.semester,
              r.tahun_pelajaran, r.catatan_wali_kelas, rv.catatan, rv.created_at
     ORDER BY rv.created_at`,
    [year.nama_tahun_ajaran],
  );
  return success(res, rows);
}

async function listApprovedReports(req, res) {
  const [[year]] = await db.execute(
    "SELECT nama_tahun_ajaran FROM tahun_ajaran WHERE status = 'Aktif' LIMIT 1",
  );
  if (!year) return success(res, []);
  const [rows] = await db.execute(
    `SELECT r.id_rapor, r.nisn, s.nama_lengkap, r.kelas, r.fase, r.semester,
            r.tahun_pelajaran, r.catatan_wali_kelas, rv.catatan AS catatan_persetujuan,
            rv.created_at AS disetujui_pada, COUNT(DISTINCT nm.id_nilai_mapel) AS jumlah_mapel,
            COUNT(DISTINCT pp.id_profil) AS jumlah_p5
     FROM rapor_capaian r
     JOIN siswa s ON s.nisn = r.nisn
     JOIN riwayat_verifikasi_rapor rv
       ON rv.id_verifikasi = (
         SELECT MAX(rv2.id_verifikasi) FROM riwayat_verifikasi_rapor rv2
         WHERE rv2.id_rapor = r.id_rapor
       ) AND rv.status = 'Disetujui'
     LEFT JOIN nilai_mapel nm ON nm.id_rapor = r.id_rapor
     LEFT JOIN profil_pancasila pp ON pp.id_rapor = r.id_rapor
     WHERE r.tahun_pelajaran = ?
     GROUP BY r.id_rapor, r.nisn, s.nama_lengkap, r.kelas, r.fase, r.semester,
              r.tahun_pelajaran, r.catatan_wali_kelas, rv.catatan, rv.created_at
     ORDER BY rv.created_at DESC`,
    [year.nama_tahun_ajaran],
  );
  return success(res, rows);
}

async function submitForVerification(req, res) {
  const access = await canAccessReport(req.user, req.params.id_rapor);
  if (access === null) return fail(res, 404, 'Rapor tidak ditemukan.');
  if (access === false) return fail(res, 403, 'Anda tidak memiliki akses untuk mengajukan rapor tersebut.');
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [reports] = await conn.execute(
      'SELECT id_rapor FROM rapor_capaian WHERE id_rapor = ? FOR UPDATE',
      [req.params.id_rapor],
    );
    if (!reports.length) {
      await conn.rollback();
      return fail(res, 404, 'Rapor tidak ditemukan.');
    }
    const [history] = await conn.execute(
      `SELECT status FROM riwayat_verifikasi_rapor
       WHERE id_rapor = ? ORDER BY id_verifikasi DESC LIMIT 1`,
      [req.params.id_rapor],
    );
    if (history.length && ['Diajukan', 'Disetujui', 'Ditolak'].includes(history[0].status)) {
      await conn.rollback();
      return fail(res, 409, 'Rapor tidak dapat diajukan ulang pada status tersebut.');
    }
    const [grades] = await conn.execute(
      'SELECT COUNT(*) AS total FROM nilai_mapel WHERE id_rapor = ?',
      [req.params.id_rapor],
    );
    if (!Number(grades[0].total)) {
      await conn.rollback();
      return fail(res, 409, 'Isi setidaknya satu nilai mata pelajaran sebelum mengajukan rapor.');
    }
    await conn.execute(
      `INSERT INTO riwayat_verifikasi_rapor (id_rapor, id_user, status, catatan)
       VALUES (?, ?, 'Diajukan', ?)`,
      [req.params.id_rapor, req.user.id_user, typeof req.body?.catatan === 'string' ? req.body.catatan.trim() || null : null],
    );
    await conn.commit();
    return success(res, { id_rapor: Number(req.params.id_rapor), status: 'Diajukan' }, 'Rapor berhasil dikirim untuk ditinjau.');
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

async function reopenApprovedForRevision(req, res) {
  const idRapor = Number(req.params.id_rapor);
  const catatan = req.body?.catatan;
  if (!Number.isInteger(idRapor) || idRapor < 1
      || typeof catatan !== 'string' || !catatan.trim() || catatan.trim().length > 2000) {
    return fail(res, 400, 'ID rapor dan catatan revisi yang valid wajib diisi.');
  }
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [reports] = await conn.execute(
      'SELECT id_rapor FROM rapor_capaian WHERE id_rapor = ? FOR UPDATE',
      [idRapor],
    );
    if (!reports.length) {
      await conn.rollback();
      return fail(res, 404, 'Rapor tidak ditemukan.');
    }
    const [history] = await conn.execute(
      'SELECT status FROM riwayat_verifikasi_rapor WHERE id_rapor = ? ORDER BY id_verifikasi DESC LIMIT 1',
      [idRapor],
    );
    if (!history.length || history[0].status !== 'Disetujui') {
      await conn.rollback();
      return fail(res, 409, 'Hanya rapor yang sudah disetujui yang dapat dibuka kembali untuk revisi.');
    }
    await conn.execute(
      `INSERT INTO riwayat_verifikasi_rapor (id_rapor, id_user, status, catatan)
       VALUES (?, ?, 'Perlu Revisi', ?)`,
      [idRapor, req.user.id_user, catatan.trim()],
    );
    await conn.commit();
    return success(res, { id_rapor: idRapor, status: 'Perlu Revisi' }, 'Rapor dibuka kembali untuk revisi.');
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

async function reviewVerification(req, res) {
  const idRapor = Number(req.params.id_rapor);
  const status = req.body?.status;
  const catatan = req.body?.catatan;
  if (!Number.isInteger(idRapor) || idRapor < 1
      || !['Perlu Revisi', 'Disetujui', 'Ditolak'].includes(status)
      || (catatan !== undefined && typeof catatan !== 'string')
      || (status !== 'Disetujui' && !catatan?.trim())) {
    return fail(res, 400, 'Status tinjauan atau catatan tidak valid.');
  }
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [reports] = await conn.execute(
      'SELECT id_rapor FROM rapor_capaian WHERE id_rapor = ? FOR UPDATE',
      [idRapor],
    );
    if (!reports.length) {
      await conn.rollback();
      return fail(res, 404, 'Rapor tidak ditemukan.');
    }
    const [history] = await conn.execute(
      'SELECT status FROM riwayat_verifikasi_rapor WHERE id_rapor = ? ORDER BY id_verifikasi DESC LIMIT 1',
      [idRapor],
    );
    if (!history.length || history[0].status !== 'Diajukan') {
      await conn.rollback();
      return fail(res, 409, 'Rapor ini tidak sedang menunggu verifikasi.');
    }
    await conn.execute(
      'INSERT INTO riwayat_verifikasi_rapor (id_rapor, id_user, status, catatan) VALUES (?, ?, ?, ?)',
      [idRapor, req.user.id_user, status, catatan?.trim() || null],
    );
    await conn.commit();
    return success(res, { id_rapor: idRapor, status }, 'Status rapor berhasil diperbarui.');
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

module.exports = {
  listByStudent,
  detail,
  create,
  update,
  saveItems,
  removeItem,
  listClassReports,
  listPendingVerification,
  listApprovedReports,
  submitForVerification,
  reopenApprovedForRevision,
  reviewVerification,
};
