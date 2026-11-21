const db = require('../config/database');
const { success, fail } = require('../utils/http');

async function profile(req, res) {
  if (!req.user.nisn) return fail(res, 403, 'Akun siswa belum terhubung ke data siswa.');
  const [rows] = await db.execute('SELECT s.*, k.nama_ayah,k.pendidikan_ayah,k.pekerjaan_ayah,k.nama_ibu,k.pendidikan_ibu,k.pekerjaan_ibu,k.nama_wali,k.hubungan_wali,k.pendidikan_wali,k.pekerjaan_wali,m.status_masuk,m.asal_tk_nama,m.tgl_sttb_tk,m.no_sttb_tk,m.asal_sekolah_pindahan,m.dari_tingkat,m.tgl_diterima FROM siswa s LEFT JOIN keluarga_siswa k ON k.nisn=s.nisn LEFT JOIN riwayat_masuk_siswa m ON m.nisn=s.nisn WHERE s.nisn=?', [req.user.nisn]);
  if (!rows.length) return fail(res, 404, 'Profil siswa tidak ditemukan.');
  return success(res, rows[0]);
}
async function report(req, res) {
  if (!req.user.nisn) return fail(res, 403, 'Akun siswa belum terhubung ke data siswa.');
  const [rows] = await db.execute(
    `SELECT r.* FROM rapor_capaian r
     WHERE r.nisn = ?
       AND (SELECT rv.status FROM riwayat_verifikasi_rapor rv
            WHERE rv.id_rapor = r.id_rapor
            ORDER BY rv.id_verifikasi DESC LIMIT 1) = 'Disetujui'
     ORDER BY r.kelas, r.tahun_pelajaran, r.semester`,
    [req.user.nisn],
  );
  const results = await Promise.all(rows.map(async (r) => {
    const [[mapel],[p5],[ekskul]] = await Promise.all([
      db.execute('SELECT * FROM nilai_mapel WHERE id_rapor=?', [r.id_rapor]), db.execute('SELECT * FROM profil_pancasila WHERE id_rapor=?', [r.id_rapor]), db.execute('SELECT * FROM nilai_ekstrakurikuler WHERE id_rapor=?', [r.id_rapor])
    ]);
    return { ...r, nilai_mapel:mapel, profil_pancasila:p5, nilai_ekstrakurikuler:ekskul };
  }));
  return success(res, results);
}
module.exports = { profile, report };
