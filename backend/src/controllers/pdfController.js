const PDFDocument = require('pdfkit');
const db = require('../config/database');
const { fail } = require('../utils/http');

async function renderBook(req, res) {
  const nisn = req.params.nisn || req.user.nisn;
  if (!nisn) return fail(res, 403, 'Akun siswa belum terhubung ke data siswa.');
  const [students] = await db.execute('SELECT s.*,k.*,m.status_masuk,m.asal_tk_nama,m.asal_sekolah_pindahan,m.tgl_diterima,x.status_keluar,x.tanggal_keluar,x.no_ijazah_sttb,x.sekolah_lanjutan_tujuan FROM siswa s LEFT JOIN keluarga_siswa k ON k.nisn=s.nisn LEFT JOIN riwayat_masuk_siswa m ON m.nisn=s.nisn LEFT JOIN riwayat_keluar_siswa x ON x.nisn=s.nisn WHERE s.nisn=?', [nisn]);
  if (!students.length) return fail(res, 404, 'Siswa tidak ditemukan.');
  const student = students[0];
  const [reports] = req.user.role === 'SISWA'
    ? await db.execute(
      `SELECT r.* FROM rapor_capaian r
       WHERE r.nisn = ?
         AND (SELECT rv.status FROM riwayat_verifikasi_rapor rv
              WHERE rv.id_rapor = r.id_rapor
              ORDER BY rv.id_verifikasi DESC LIMIT 1) = 'Disetujui'
       ORDER BY r.kelas, r.tahun_pelajaran, r.semester`,
      [nisn],
    )
    : await db.execute(
      'SELECT * FROM rapor_capaian WHERE nisn=? ORDER BY kelas, tahun_pelajaran, semester',
      [nisn],
    );
  const reportData = await Promise.all(reports.map(async (r) => {
    const [[mapel],[p5],[ekskul]] = await Promise.all([
      db.execute('SELECT * FROM nilai_mapel WHERE id_rapor=? ORDER BY id_nilai_mapel', [r.id_rapor]), db.execute('SELECT * FROM profil_pancasila WHERE id_rapor=? ORDER BY id_profil', [r.id_rapor]), db.execute('SELECT * FROM nilai_ekstrakurikuler WHERE id_rapor=? ORDER BY id_ekskul', [r.id_rapor])
    ]);
    return { ...r, mapel, p5, ekskul };
  }));
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="buku-induk-${nisn}.pdf"`);
  const doc = new PDFDocument({ size: 'A4', margin: 48, bufferPages: true }); doc.pipe(res);
  doc.fontSize(16).font('Helvetica-Bold').text('BUKU INDUK SISWA', { align:'center' }).moveDown(0.4);
  doc.fontSize(10).font('Helvetica').text('SDN Batu Ampar 12 Pagi — Jakarta Timur', { align:'center' }).moveDown(1);
  doc.fontSize(12).font('Helvetica-Bold').text('A. IDENTITAS SISWA').moveDown(0.4);
  const details = [['NISN',student.nisn],['NIS',student.nis],['Nama lengkap',student.nama_lengkap],['Jenis kelamin',student.jenis_kelamin],['Tempat, tanggal lahir',`${student.tempat_lahir || ''}, ${student.tanggal_lahir || ''}`],['Agama',student.agama],['Alamat',student.alamat],['Status',student.status_siswa],['Nama ayah',student.nama_ayah],['Nama ibu',student.nama_ibu],['Wali',student.nama_wali || '-'],['Asal masuk',student.status_masuk || '-']];
  for (const [label,value] of details) doc.font('Helvetica-Bold').text(`${label}: `,{continued:true}).font('Helvetica').text(String(value ?? '-'));
  if (student.status_keluar) doc.moveDown(0.4).text(`Riwayat keluar: ${student.status_keluar} — ${student.tanggal_keluar}`);
  for (const r of reportData) {
    doc.addPage(); doc.fontSize(14).font('Helvetica-Bold').text(`RAPOR KELAS ${r.kelas} — ${r.semester} ${r.tahun_pelajaran}`).moveDown(0.6);
    doc.fontSize(10).font('Helvetica').text(`Fase ${r.fase} | Sakit ${r.absensi_sakit} hari | Izin ${r.absensi_izin} hari | Tanpa keterangan ${r.absensi_tanpa_ket} hari`);
    if (r.catatan_wali_kelas) doc.moveDown(0.4).text(`Catatan wali kelas: ${r.catatan_wali_kelas}`);
    if (r.keputusan_akhir) doc.text(`Keputusan: ${r.keputusan_akhir}`);
    doc.moveDown(0.7).font('Helvetica-Bold').text('Nilai mata pelajaran'); doc.font('Helvetica');
    for (const item of r.mapel) doc.text(`${item.nama_mapel} (${item.kategori_mapel}): ${item.nilai_akhir}${item.capaian_kompetensi ? ` — ${item.capaian_kompetensi}` : ''}`);
    doc.moveDown(0.5).font('Helvetica-Bold').text('Profil Pelajar Pancasila'); doc.font('Helvetica');
    for (const item of r.p5) doc.text(`${item.dimensi} / ${item.elemen} / ${item.sub_elemen}: ${item.target_pencapaian}`);
    doc.moveDown(0.5).font('Helvetica-Bold').text('Ekstrakurikuler'); doc.font('Helvetica');
    for (const item of r.ekskul) doc.text(`${item.nama_ekskul} (${item.rumpun_ekskul}): ${item.predikat}${item.keterangan ? ` — ${item.keterangan}` : ''}`);
  }
  doc.end();
}

async function backupSql(req, res) {
  const tables = ['siswa','pengguna','keluarga_siswa','riwayat_masuk_siswa','riwayat_keluar_siswa','rapor_capaian','nilai_mapel','profil_pancasila','nilai_ekstrakurikuler'];
  const lines = ['SET NAMES utf8mb4;','SET FOREIGN_KEY_CHECKS=0;'];
  for (const table of tables) {
    const [definition] = await db.query(`SHOW CREATE TABLE \`${table}\``);
    lines.push(`DROP TABLE IF EXISTS \`${table}\`;`, `${definition[0]['Create Table']};`);
    const [rows] = await db.query(`SELECT * FROM \`${table}\``);
    const [columns] = await db.query(`SHOW COLUMNS FROM \`${table}\``);
    lines.push(`-- Data for ${table}`);
    for (const row of rows) {
      const values = columns.map(({Field}) => row[Field] === null ? 'NULL' : db.escape(row[Field]));
      lines.push(`INSERT INTO \`${table}\` (${columns.map(({Field})=>`\`${Field}\``).join(',')}) VALUES (${values.join(',')});`);
    }
  }
  lines.push('SET FOREIGN_KEY_CHECKS=1;');
  res.setHeader('Content-Type','application/sql; charset=utf-8'); res.setHeader('Content-Disposition','attachment; filename="backup-buku-induk.sql"');
  return res.send(lines.join('\n'));
}
module.exports = { renderBook, backupSql };
