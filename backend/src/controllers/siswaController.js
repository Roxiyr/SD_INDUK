const db = require('../config/database');
const { success, fail } = require('../utils/http');
const STUDENT_FIELDS = ['nisn','nis','nik','no_kk','nama_lengkap','nama_panggilan','jenis_kelamin','tempat_lahir','tanggal_lahir','agama','kewarganegaraan','jumlah_saudara','bahasa_sehari_hari','golongan_darah','alamat','nomor_telepon','bertempat_tinggal_pada','jarak_sekolah','status_siswa'];
const FAMILY_FIELDS = ['nama_ayah','pendidikan_ayah','pekerjaan_ayah','nama_ibu','pendidikan_ibu','pekerjaan_ibu','nama_wali','hubungan_wali','pendidikan_wali','pekerjaan_wali'];
const ENTRY_FIELDS = ['status_masuk','asal_tk_nama','tgl_sttb_tk','no_sttb_tk','asal_sekolah_pindahan','dari_tingkat','tgl_diterima'];

function validateStudent(s, partial = false) {
  const errors = [];
  if (!partial || s.nisn !== undefined) if (!/^\d{10}$/.test(s.nisn || '')) errors.push({ field: 'nisn', detail: 'NISN harus terdiri dari 10 digit.' });
  if (!partial || s.nik !== undefined) if (!/^\d{16}$/.test(s.nik || '')) errors.push({ field: 'nik', detail: 'NIK harus terdiri dari 16 digit.' });
  if (!partial || s.nis !== undefined) if (!s.nis) errors.push({ field: 'nis', detail: 'NIS wajib diisi.' });
  if (!partial || s.nama_lengkap !== undefined) if (!s.nama_lengkap) errors.push({ field: 'nama_lengkap', detail: 'Nama lengkap wajib diisi.' });
  return errors;
}
function insertSql(table, data, allowed) {
  const entries = Object.entries(data || {}).filter(([key]) => allowed.includes(key));
  return { sql: `INSERT INTO ${table} (${entries.map(([key]) => `\`${key}\``).join(',')}) VALUES (${entries.map(() => '?').join(',')})`, values: entries.map(([, value]) => value) };
}
async function upsertRelation(conn, table, data, allowed) {
  const entries = Object.entries(data).filter(([key]) => allowed.includes(key));
  if (entries.length <= 1) return;
  const cols = entries.map(([key]) => `\`${key}\``);
  const updates = entries.filter(([key]) => key !== 'nisn').map(([key]) => `\`${key}\`=VALUES(\`${key}\`)`);
  await conn.execute(`INSERT INTO ${table} (${cols.join(',')}) VALUES (${entries.map(()=>'?').join(',')}) ON DUPLICATE KEY UPDATE ${updates.join(',')}`, entries.map(([,value])=>value));
}

async function list(req, res) {
  const { search = '', status, limit = '100', offset = '0' } = req.query;
  const size = Math.min(Math.max(Number(limit) || 100, 1), 500); const start = Math.max(Number(offset) || 0, 0);
  const conditions = []; const params = [];
  if (search) { conditions.push('(nisn LIKE ? OR nis LIKE ? OR nama_lengkap LIKE ?)'); params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
  if (status) { conditions.push('status_siswa = ?'); params.push(status); }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const [rows] = await db.execute(
    `SELECT s.nisn, s.nis, s.nama_lengkap, s.jenis_kelamin, s.tanggal_lahir, s.status_siswa,
            (
              SELECT k.nama_kelas
              FROM siswa_kelas sk
              JOIN kelas k ON k.id_kelas = sk.id_kelas AND k.id_tahun_ajaran = sk.id_tahun_ajaran
              JOIN tahun_ajaran ta ON ta.id_tahun_ajaran = sk.id_tahun_ajaran
              WHERE sk.nisn = s.nisn AND sk.status = 'Aktif'
                AND k.status = 'Aktif' AND ta.status = 'Aktif'
              ORDER BY sk.tanggal_mulai DESC
              LIMIT 1
            ) AS nama_kelas
     FROM siswa s ${where} ORDER BY s.nama_lengkap LIMIT ? OFFSET ?`,
    [...params, size, start],
  );
  const [[count]] = await db.execute(`SELECT COUNT(*) AS total FROM siswa ${where}`, params);
  return success(res, { items: rows, pagination: { total: count.total, limit: size, offset: start } });
}

async function detail(req, res) {
  const [rows] = await db.execute(`SELECT s.*, k.id_keluarga, k.nama_ayah, k.pendidikan_ayah, k.pekerjaan_ayah, k.nama_ibu, k.pendidikan_ibu, k.pekerjaan_ibu, k.nama_wali, k.hubungan_wali, k.pendidikan_wali, k.pekerjaan_wali, m.id_riwayat, m.status_masuk, m.asal_tk_nama, m.tgl_sttb_tk, m.no_sttb_tk, m.asal_sekolah_pindahan, m.dari_tingkat, m.tgl_diterima FROM siswa s LEFT JOIN keluarga_siswa k ON k.nisn=s.nisn LEFT JOIN riwayat_masuk_siswa m ON m.nisn=s.nisn WHERE s.nisn=?`, [req.params.nisn]);
  if (!rows.length) return fail(res, 404, 'Siswa tidak ditemukan.');
  const [keluar] = await db.execute('SELECT * FROM riwayat_keluar_siswa WHERE nisn=?', [req.params.nisn]);
  const [placement] = await db.execute(
    `SELECT sk.id_kelas
     FROM siswa_kelas sk
     JOIN kelas k ON k.id_kelas = sk.id_kelas AND k.id_tahun_ajaran = sk.id_tahun_ajaran
     JOIN tahun_ajaran ta ON ta.id_tahun_ajaran = sk.id_tahun_ajaran
     WHERE sk.nisn = ? AND sk.status = 'Aktif'
       AND k.status = 'Aktif' AND ta.status = 'Aktif'
     ORDER BY sk.tanggal_mulai DESC
     LIMIT 1`,
    [req.params.nisn],
  );
  return success(res, { ...rows[0], id_kelas: placement[0]?.id_kelas ?? '', riwayat_keluar: keluar[0] || null });
}

async function create(req, res) {
  const s = req.body?.siswa || req.body || {}; const keluarga = req.body?.keluarga || {}; const masuk = req.body?.riwayat_masuk || {};
  const requestedClass = req.body?.id_kelas;
  const hasClass = requestedClass !== undefined && requestedClass !== null && requestedClass !== '';
  const classId = hasClass ? Number(requestedClass) : null;
  const errors = validateStudent(s);
  if (hasClass && (!Number.isInteger(classId) || classId < 1)) errors.push({ field: 'id_kelas', detail: 'Kelas tidak valid.' });
  if (!keluarga.nama_ayah || !keluarga.nama_ibu) errors.push({ field: 'keluarga', detail: 'Nama ayah dan ibu wajib diisi.' });
  if (!['Baru','Pindahan'].includes(masuk.status_masuk)) errors.push({ field: 'status_masuk', detail: 'Status masuk harus Baru atau Pindahan.' });
  if (errors.length) return fail(res, 400, 'Validasi data siswa gagal.', errors);
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
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
    }
    let q = insertSql('siswa', s, STUDENT_FIELDS); await conn.execute(q.sql, q.values);
    q = insertSql('keluarga_siswa', { ...keluarga, nisn: s.nisn }, ['nisn', ...FAMILY_FIELDS]); await conn.execute(q.sql, q.values);
    q = insertSql('riwayat_masuk_siswa', { ...masuk, nisn: s.nisn }, ['nisn', ...ENTRY_FIELDS]); await conn.execute(q.sql, q.values);
    let akun = null;
    if (req.body?.buat_akun === true) {
      const username = s.nisn; const password = String(s.tanggal_lahir || '').replaceAll('-', '').split('').reverse().join('').slice(0, 8);
      // Default password format DDMMYYYY derived from DATE YYYY-MM-DD.
      const d = String(s.tanggal_lahir || '').slice(0, 10).split('-'); const defaultPassword = d.length === 3 ? `${d[2]}${d[1]}${d[0]}` : password;
      const bcrypt = require('bcryptjs');
      const passwordHash = await bcrypt.hash(defaultPassword, 10);
      const [existingAccounts] = await conn.execute(
        'SELECT id_user FROM pengguna WHERE username = ? AND role = \'SISWA\' AND nisn IS NULL LIMIT 1',
        [username],
      );
      if (existingAccounts.length) {
        await conn.execute(
          'UPDATE pengguna SET password = ?, nama_lengkap = ?, nisn = ? WHERE id_user = ?',
          [passwordHash, s.nama_lengkap, s.nisn, existingAccounts[0].id_user],
        );
        akun = { id_user: existingAccounts[0].id_user, username, password_default: defaultPassword };
      } else {
        const [result] = await conn.execute(
          'INSERT INTO pengguna (username,password,role,nama_lengkap,nisn) VALUES (?, ?, \'SISWA\', ?, ?)',
          [username, passwordHash, s.nama_lengkap, s.nisn],
        );
        akun = { id_user: result.insertId, username, password_default: defaultPassword };
      }
    }
    if (activeClass) {
      await conn.execute(
        `INSERT INTO siswa_kelas (nisn, id_kelas, id_tahun_ajaran, tanggal_mulai, status)
         VALUES (?, ?, ?, CURRENT_DATE(), 'Aktif')`,
        [s.nisn, classId, activeClass.id_tahun_ajaran],
      );
    }
    await conn.commit();
    return success(res, { nisn: s.nisn, nis: s.nis, nama_lengkap: s.nama_lengkap, akun }, 'Data siswa berhasil disimpan.', 201);
  } catch (error) { await conn.rollback(); throw error; } finally { conn.release(); }
}

async function update(req, res) {
  const nisn = req.params.nisn; const s = req.body?.siswa || req.body || {}; const keluarga = req.body?.keluarga || {}; const masuk = req.body?.riwayat_masuk || {};
  const requestedClass = req.body?.id_kelas;
  const hasClass = requestedClass !== undefined && requestedClass !== null && requestedClass !== '';
  const classId = hasClass ? Number(requestedClass) : null;
  const errors = validateStudent(s, true); if (errors.length) return fail(res, 400, 'Validasi data siswa gagal.', errors);
  if (hasClass && (!Number.isInteger(classId) || classId < 1)) return fail(res, 400, 'Kelas tidak valid.');
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
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
    }
    const [existingStudents] = await conn.execute(
      'SELECT nisn FROM siswa WHERE nisn = ? LIMIT 1',
      [nisn],
    );
    if (!existingStudents.length) {
      await conn.rollback();
      return fail(res, 404, 'Siswa tidak ditemukan.');
    }
    const entries = Object.entries(s).filter(([key]) => STUDENT_FIELDS.includes(key) && key !== 'nisn');
    if (entries.length) await conn.execute(`UPDATE siswa SET ${entries.map(([key]) => `\`${key}\`=?`).join(',')} WHERE nisn=?`, [...entries.map(([,v]) => v), nisn]);
    if (Object.keys(keluarga).some((key) => FAMILY_FIELDS.includes(key))) await upsertRelation(conn, 'keluarga_siswa', { ...keluarga, nisn }, ['nisn', ...FAMILY_FIELDS]);
    if (Object.keys(masuk).some((key) => ENTRY_FIELDS.includes(key))) await upsertRelation(conn, 'riwayat_masuk_siswa', { ...masuk, nisn }, ['nisn', ...ENTRY_FIELDS]);
    if (activeClass) {
      const [currentPlacement] = await conn.execute(
        `SELECT id_siswa_kelas, id_kelas, (tanggal_mulai = CURRENT_DATE()) AS started_today
         FROM siswa_kelas
         WHERE nisn = ? AND id_tahun_ajaran = ? AND status = 'Aktif'
         ORDER BY tanggal_mulai DESC
         LIMIT 1`,
        [nisn, activeClass.id_tahun_ajaran],
      );
      if (currentPlacement[0]?.id_kelas !== classId) {
        if (currentPlacement[0]?.started_today) {
          await conn.execute(
            'UPDATE siswa_kelas SET id_kelas = ? WHERE id_siswa_kelas = ?',
            [classId, currentPlacement[0].id_siswa_kelas],
          );
        } else if (currentPlacement.length) {
          await conn.execute(
            `UPDATE siswa_kelas
             SET status = 'Pindah', tanggal_selesai = CURRENT_DATE()
             WHERE id_siswa_kelas = ?`,
            [currentPlacement[0].id_siswa_kelas],
          );
        }
        if (!currentPlacement[0]?.started_today) {
          await conn.execute(
            `INSERT INTO siswa_kelas (nisn, id_kelas, id_tahun_ajaran, tanggal_mulai, status)
             VALUES (?, ?, ?, CURRENT_DATE(), 'Aktif')`,
            [nisn, classId, activeClass.id_tahun_ajaran],
          );
        }
      }
    }
    await conn.commit(); return success(res, { nisn }, 'Data siswa berhasil diperbarui.');
  } catch (error) { await conn.rollback(); throw error; } finally { conn.release(); }
}

async function recordExit(req, res) {
  const { status_keluar, tanggal_keluar, no_ijazah_sttb, sekolah_lanjutan_tujuan, alasan_keluar } = req.body || {};
  if (!['Lulus','Pindah','Keluar'].includes(status_keluar) || !tanggal_keluar) return fail(res, 400, 'Status dan tanggal keluar wajib diisi dengan format valid.');
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.execute('UPDATE siswa SET status_siswa=? WHERE nisn=?', [status_keluar, req.params.nisn]);
    if (!result.affectedRows) { await conn.rollback(); return fail(res, 404, 'Siswa tidak ditemukan.'); }
    await conn.execute(`INSERT INTO riwayat_keluar_siswa (nisn,status_keluar,tanggal_keluar,no_ijazah_sttb,sekolah_lanjutan_tujuan,alasan_keluar) VALUES (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE status_keluar=VALUES(status_keluar),tanggal_keluar=VALUES(tanggal_keluar),no_ijazah_sttb=VALUES(no_ijazah_sttb),sekolah_lanjutan_tujuan=VALUES(sekolah_lanjutan_tujuan),alasan_keluar=VALUES(alasan_keluar)`, [req.params.nisn,status_keluar,tanggal_keluar,no_ijazah_sttb || null,sekolah_lanjutan_tujuan || null,alasan_keluar || null]);
    await conn.commit(); return success(res, { nisn: req.params.nisn, status_siswa: status_keluar }, 'Riwayat keluar siswa berhasil dicatat.');
  } catch (error) { await conn.rollback(); throw error; } finally { conn.release(); }
}

async function remove(req, res) {
  const [result] = await db.execute('DELETE FROM siswa WHERE nisn=?', [req.params.nisn]);
  if (!result.affectedRows) return fail(res, 404, 'Siswa tidak ditemukan.');
  return success(res, null, 'Data siswa berhasil dihapus.');
}

async function importStudents(req, res) {
  if (!req.file) return fail(res, 400, 'File CSV atau XLSX wajib diunggah dengan field file.');
  const XLSX = require('xlsx'); const workbook = XLSX.read(req.file.buffer, { type: 'buffer', cellDates: true });
  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: null, raw: false });
  const results = { imported: 0, failed: [] };
  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    const siswa = {}; for (const field of STUDENT_FIELDS) if (row[field] !== undefined) siswa[field] = row[field];
    if (siswa.tanggal_lahir) siswa.tanggal_lahir = String(siswa.tanggal_lahir).slice(0,10);
    if (validateStudent(siswa).length) { results.failed.push({ row: index + 2, detail: 'Kolom identitas siswa wajib lengkap dan valid.' }); continue; }
    const conn = await db.getConnection();
    try { await conn.beginTransaction(); let q = insertSql('siswa', siswa, STUDENT_FIELDS); await conn.execute(q.sql,q.values);
      const family = {}; for (const f of FAMILY_FIELDS) if (row[f] !== undefined) family[f]=row[f];
      if (family.nama_ayah && family.nama_ibu) { q=insertSql('keluarga_siswa',{...family,nisn:siswa.nisn},['nisn',...FAMILY_FIELDS]); await conn.execute(q.sql,q.values); }
      if (['Baru','Pindahan'].includes(row.status_masuk)) { const entry={}; for(const f of ENTRY_FIELDS) if(row[f]!==undefined) entry[f]=row[f]; q=insertSql('riwayat_masuk_siswa',{...entry,nisn:siswa.nisn},['nisn',...ENTRY_FIELDS]); await conn.execute(q.sql,q.values); }
      await conn.commit(); results.imported += 1;
    } catch (error) { await conn.rollback(); results.failed.push({ row:index+2, detail:error.code==='ER_DUP_ENTRY'?'NISN, NIS, atau NIK sudah terdaftar.':'Gagal menyimpan baris.' }); }
    finally { conn.release(); }
  }
  return success(res, results, 'Impor selesai.');
}

module.exports = { list, detail, create, update, recordExit, remove, importStudents };
