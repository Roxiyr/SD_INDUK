const pool = require('../config/database');
const { isHomeroomForStudent } = require('./studentController');

/** Memvalidasi nilai semester yang diperbolehkan. @param {string} semester Nama semester. @returns {boolean} True jika nilai valid. */
function validSemester(semester) { return semester === 'Ganjil' || semester === 'Genap'; }

/** Memuat roster unik beserta nilai mapel terpilih, P5, dan ekskul untuk satu semester. @param {Object} req Query kelas, tahun, semester, dan mapel. @param {Object} res JSON roster atau respons validasi. */
async function getClassSheet(req, res) {
  const { id_kelas, id_mapel, tahun_pelajaran, semester } = req.query;
  if (!id_kelas || !tahun_pelajaran || !validSemester(semester)) return res.status(400).json({ message: 'Kelas, tahun pelajaran, dan semester wajib dipilih.' });
  if (req.user.role === 'GURU') {
    const wali = await isHomeroomForClass(req.user.id_referensi, id_kelas);
    if (id_mapel) { const [assignments] = await pool.execute('SELECT 1 FROM penugasan_guru_mapel WHERE id_guru=? AND id_kelas=? AND id_mapel=? AND tahun_pelajaran=?', [req.user.id_referensi, id_kelas, id_mapel, tahun_pelajaran]); if (!assignments.length) return res.status(403).json({ message: 'Anda tidak ditugaskan pada kelas dan mata pelajaran ini.' }); }
    else if (!wali) return res.status(403).json({ message: 'Guru Mapel harus memilih penugasan mapel; roster tanpa filter hanya tersedia bagi wali kelas.' });
  }
  try {
    const [rows] = await pool.execute(`
      SELECT s.nisn,s.nis,s.nama_lengkap,k.id_kelas,k.nama_kelas,k.tingkat,k.fase,k.tahun_pelajaran,
        r.id_rapor,
        (SELECT JSON_ARRAYAGG(JSON_OBJECT('id_mapel',m.id_mapel,'nama_mapel',m.nama_mapel,'nilai_akhir',n.nilai_akhir,'capaian_kompetensi',n.capaian_kompetensi)) FROM nilai_mapel n JOIN mapel m ON m.id_mapel=n.id_mapel WHERE n.id_rapor=r.id_rapor AND (? IS NULL OR n.id_mapel=?)) AS nilai_mapel,
        (SELECT JSON_ARRAYAGG(JSON_OBJECT('dimensi',p.dimensi,'elemen',p.elemen,'sub_elemen',p.sub_elemen,'target_pencapaian',p.target_pencapaian)) FROM profil_pancasila p WHERE p.id_rapor=r.id_rapor) AS profil_pancasila,
        (SELECT JSON_ARRAYAGG(JSON_OBJECT('id_ekskul_master',x.id_ekskul_master,'nama_ekskul',e.nama_ekskul,'predikat',x.predikat,'keterangan',x.keterangan)) FROM nilai_ekstrakurikuler x JOIN ekstrakurikuler e ON e.id_ekskul_master=x.id_ekskul_master WHERE x.id_rapor=r.id_rapor) AS nilai_ekstrakurikuler,
        r.absensi_sakit,r.absensi_izin,r.absensi_tanpa_ket,r.catatan_wali_kelas
      FROM siswa s JOIN kelas k ON k.id_kelas=s.id_kelas
      LEFT JOIN rapor_capaian r ON r.nisn=s.nisn AND r.tahun_pelajaran=? AND r.semester=?
      WHERE s.id_kelas=? AND k.tahun_pelajaran=? AND s.status_siswa='AKTIF' ORDER BY s.nis ASC`, [id_mapel||null,id_mapel||null,tahun_pelajaran,semester,id_kelas,tahun_pelajaran]);
    return res.json({ data: rows });
  } catch (error) { return res.status(500).json({ message: 'Gagal memuat roster nilai.', detail: error.message }); }
}

/** Memeriksa apakah guru menjadi wali pada kelas tertentu. @param {number} guruId ID guru. @param {number} kelasId ID kelas. @returns {Promise<boolean>} Status perwalian. */
async function isHomeroomForClass(guruId, kelasId){const [rows]=await pool.execute('SELECT 1 FROM kelas WHERE id_kelas=? AND id_wali_kelas=?',[kelasId,guruId]);return rows.length>0;}

/** Menyimpan nilai akhir dan capaian kompetensi dengan validasi penugasan dan transaksi rapor. @param {Object} req Data siswa, mapel, kelas, semester, dan nilai. @param {Object} res Status simpan atau kesalahan. */
async function upsertNilaiMapel(req, res) {
  const b = req.body || {};
  const score = Number(b.nilai_akhir);
  if (!b.nisn || !b.id_kelas || !b.id_mapel || !b.tahun_pelajaran || !validSemester(b.semester)) return res.status(400).json({ message: 'Data siswa, kelas, mapel, tahun ajaran, dan semester wajib diisi.' });
  if (b.nilai_akhir === '' || b.nilai_akhir === null || b.nilai_akhir === undefined || !Number.isInteger(score) || score < 0 || score > 100) return res.status(400).json({ message: 'Nilai akhir harus berupa bilangan 0 sampai 100.' });
  if (req.user.role === 'GURU') {
    const [assignments] = await pool.execute('SELECT 1 FROM penugasan_guru_mapel WHERE id_guru=? AND id_kelas=? AND id_mapel=? AND tahun_pelajaran=?', [req.user.id_referensi, b.id_kelas, b.id_mapel, b.tahun_pelajaran]);
    if (!assignments.length) return res.status(403).json({ message: 'Penugasan mapel tidak cocok.' });
  }
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [[kelas]] = await connection.execute('SELECT nama_kelas,tingkat,fase FROM kelas WHERE id_kelas=? AND tahun_pelajaran=?', [b.id_kelas,b.tahun_pelajaran]);
    const [[siswa]] = await connection.execute("SELECT nisn FROM siswa WHERE nisn=? AND id_kelas=? AND status_siswa='AKTIF'", [b.nisn, b.id_kelas]);
    const [[mapel]] = await connection.execute('SELECT id_mapel FROM mapel WHERE id_mapel=?', [b.id_mapel]);
    if (!kelas || !siswa || !mapel) { await connection.rollback(); return res.status(400).json({ message: 'Kelas, mapel, atau siswa aktif pada kelas tersebut tidak ditemukan.' }); }
    await connection.execute('INSERT INTO rapor_capaian (nisn,id_user,kelas,tingkat,fase,semester,tahun_pelajaran) VALUES (?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE id_rapor=LAST_INSERT_ID(id_rapor),id_user=VALUES(id_user),kelas=VALUES(kelas),tingkat=VALUES(tingkat),fase=VALUES(fase)', [b.nisn, req.user.id_user, kelas.nama_kelas, kelas.tingkat, kelas.fase, b.semester, b.tahun_pelajaran]);
    const [[rapor]] = await connection.execute('SELECT id_rapor FROM rapor_capaian WHERE nisn=? AND semester=? AND tahun_pelajaran=?', [b.nisn, b.semester, b.tahun_pelajaran]);
    await connection.execute('INSERT INTO nilai_mapel (id_rapor,id_mapel,nilai_akhir,capaian_kompetensi) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE nilai_akhir=VALUES(nilai_akhir),capaian_kompetensi=VALUES(capaian_kompetensi)', [rapor.id_rapor, b.id_mapel, score, b.capaian_kompetensi || null]);
    await connection.commit();
    return res.json({ message: 'Nilai tersimpan.' });
  } catch (error) { await connection.rollback(); return res.status(400).json({ message: 'Nilai gagal disimpan.', detail: error.message }); }
  finally { connection.release(); }
}

/** Menyimpan absensi, catatan, P5, dan ekskul untuk siswa yang benar-benar berada di kelas terpilih. @param {Object} req Form asesmen wali dan identitas pengguna. @param {Object} res Status simpan atau penolakan akses. */
async function upsertWaliKelas(req, res) {
  const b = req.body || {};
  if (!b.nisn || !b.id_kelas || !b.tahun_pelajaran || !validSemester(b.semester)) return res.status(400).json({ message: 'Siswa, kelas, tahun pelajaran, dan semester wajib diisi.' });
  for (const field of ['absensi_sakit', 'absensi_izin', 'absensi_tanpa_ket']) {
    const value = Number(b[field] ?? 0);
    if (!Number.isInteger(value) || value < 0) return res.status(400).json({ message: `${field} harus bilangan bulat non-negatif.` });
  }
  for (const p of b.p5 || []) if (!p.dimensi || !p.elemen || !p.sub_elemen || !['BB', 'MB', 'BSH', 'SB'].includes(p.target_pencapaian)) return res.status(400).json({ message: 'Data P5 tidak lengkap atau target tidak valid.' });
  for (const x of b.ekskul || []) if (!x.id_ekskul_master || !['Sangat Baik', 'Baik', 'Cukup', 'Kurang'].includes(x.predikat)) return res.status(400).json({ message: 'Data ekstrakurikuler tidak lengkap atau predikat tidak valid.' });
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [[kelas]] = await connection.execute('SELECT id_kelas,id_wali_kelas,nama_kelas,tingkat,fase FROM kelas WHERE id_kelas=? AND tahun_pelajaran=?', [b.id_kelas, b.tahun_pelajaran]);
    if (!kelas) { await connection.rollback(); return res.status(404).json({ message: 'Kelas pada tahun pelajaran tersebut tidak ditemukan.' }); }
    if (req.user.role === 'GURU' && Number(kelas.id_wali_kelas) !== Number(req.user.id_referensi)) { await connection.rollback(); return res.status(403).json({ message: 'Hanya wali kelas yang ditetapkan dapat mengubah asesmen ini.' }); }
    const [[siswa]] = await connection.execute("SELECT nisn FROM siswa WHERE nisn=? AND id_kelas=? AND status_siswa='AKTIF'", [b.nisn, b.id_kelas]);
    if (!siswa) { await connection.rollback(); return res.status(400).json({ message: 'Siswa bukan siswa aktif pada kelas terpilih.' }); }
    await connection.execute('INSERT INTO rapor_capaian (nisn,id_user,kelas,tingkat,fase,semester,tahun_pelajaran,absensi_sakit,absensi_izin,absensi_tanpa_ket,catatan_wali_kelas) VALUES (?,?,?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE id_rapor=LAST_INSERT_ID(id_rapor),id_user=VALUES(id_user),kelas=VALUES(kelas),tingkat=VALUES(tingkat),fase=VALUES(fase),absensi_sakit=VALUES(absensi_sakit),absensi_izin=VALUES(absensi_izin),absensi_tanpa_ket=VALUES(absensi_tanpa_ket),catatan_wali_kelas=VALUES(catatan_wali_kelas)', [b.nisn, req.user.id_user, kelas.nama_kelas, kelas.tingkat, kelas.fase, b.semester, b.tahun_pelajaran, Number(b.absensi_sakit || 0), Number(b.absensi_izin || 0), Number(b.absensi_tanpa_ket || 0), b.catatan_wali_kelas || null]);
    const [[rapor]] = await connection.execute('SELECT id_rapor FROM rapor_capaian WHERE nisn=? AND semester=? AND tahun_pelajaran=?', [b.nisn, b.semester, b.tahun_pelajaran]);
    if (Array.isArray(b.p5)) { await connection.execute('DELETE FROM profil_pancasila WHERE id_rapor=?', [rapor.id_rapor]); for (const p of b.p5) await connection.execute('INSERT INTO profil_pancasila (id_rapor,dimensi,elemen,sub_elemen,target_pencapaian) VALUES (?,?,?,?,?)', [rapor.id_rapor, p.dimensi, p.elemen, p.sub_elemen, p.target_pencapaian]); }
    if (Array.isArray(b.ekskul)) { await connection.execute('DELETE FROM nilai_ekstrakurikuler WHERE id_rapor=?', [rapor.id_rapor]); for (const x of b.ekskul) await connection.execute('INSERT INTO nilai_ekstrakurikuler (id_rapor,id_ekskul_master,predikat,keterangan) VALUES (?,?,?,?)', [rapor.id_rapor, x.id_ekskul_master, x.predikat, x.keterangan || null]); }
    await connection.commit();
    return res.json({ message: 'Asesmen wali kelas tersimpan.' });
  } catch (error) { await connection.rollback(); return res.status(400).json({ message: 'Asesmen wali kelas gagal disimpan.', detail: error.message }); }
  finally { connection.release(); }
}

/** Mengagregasi profil sekolah, biodata lengkap, keluarga, riwayat masuk, dan seluruh rapor siswa. @param {string} nisn NISN siswa. @returns {Promise<Object|null>} Data lengkap untuk lembar buku induk. */
async function fetchBukuInduk(nisn) {
  const [students] = await pool.execute(`SELECT s.*,k.nama_kelas,g.nama_lengkap AS nama_wali_kelas,r.status_masuk,r.asal_tk_nama,r.tgl_sttb_tk,r.no_sttb_tk,r.asal_sekolah_pindahan,r.dari_tingkat,r.diterima_di_kelas,r.tgl_diterima,
    f.nama_ayah,f.pendidikan_ayah,f.pekerjaan_ayah,f.penghasilan_ayah,f.nama_ibu,f.pendidikan_ibu,f.pekerjaan_ibu,f.penghasilan_ibu,f.alamat_orang_tua,f.no_hp_orang_tua,f.nama_wali,f.hubungan_wali,f.pendidikan_wali,f.pekerjaan_wali,f.alamat_wali
    FROM siswa s LEFT JOIN kelas k ON k.id_kelas=s.id_kelas LEFT JOIN guru g ON g.id_guru=k.id_wali_kelas LEFT JOIN riwayat_masuk_siswa r ON r.nisn=s.nisn LEFT JOIN keluarga_siswa f ON f.nisn=s.nisn WHERE s.nisn=?`, [nisn]);
  if (!students[0]) return null;
  const [schools] = await pool.query('SELECT * FROM profil_sekolah ORDER BY id_profil LIMIT 1');
  const [rapor] = await pool.execute(`SELECT r.*,
    (SELECT JSON_ARRAYAGG(JSON_OBJECT('id_mapel',m.id_mapel,'nama_mapel',m.nama_mapel,'nilai_akhir',n.nilai_akhir,'capaian_kompetensi',n.capaian_kompetensi)) FROM nilai_mapel n JOIN mapel m ON m.id_mapel=n.id_mapel WHERE n.id_rapor=r.id_rapor) AS nilai_mapel,
    (SELECT JSON_ARRAYAGG(JSON_OBJECT('dimensi',p.dimensi,'elemen',p.elemen,'sub_elemen',p.sub_elemen,'target_pencapaian',p.target_pencapaian)) FROM profil_pancasila p WHERE p.id_rapor=r.id_rapor) AS profil_pancasila,
    (SELECT JSON_ARRAYAGG(JSON_OBJECT('nama_ekskul',e.nama_ekskul,'predikat',x.predikat,'keterangan',x.keterangan)) FROM nilai_ekstrakurikuler x JOIN ekstrakurikuler e ON e.id_ekskul_master=x.id_ekskul_master WHERE x.id_rapor=r.id_rapor) AS nilai_ekstrakurikuler
    FROM rapor_capaian r WHERE r.nisn=? ORDER BY r.tingkat,FIELD(r.semester,'Ganjil','Genap')`, [nisn]);
  return { profil_sekolah: schools[0] || {}, siswa: students[0], rapor };
}

/** Mengotorisasi dan mengembalikan lembar buku induk satu siswa. @param {Object} req NISN dan user aktif. @param {Object} res Data lembar atau 403/404. */
async function getBukuIndukByNisn(req, res) {
  const { nisn } = req.params;
  if (req.user.role === 'GURU' && !await isHomeroomForStudent(req.user.id_referensi, nisn)) return res.status(403).json({ message: 'Cetak hanya tersedia untuk siswa binaan.' });
  try { const data = await fetchBukuInduk(nisn); return data ? res.json({ data }) : res.status(404).json({ message: 'Siswa tidak ditemukan.' }); }
  catch (error) { return res.status(500).json({ message: 'Gagal memuat buku induk.', detail: error.message }); }
}

/** Mengambil profil, detail kelas, dan seluruh siswa aktif terurut NIS untuk cetak massal. @param {Object} req ID kelas dan user. @param {Object} res Dataset cetak kelas atau 403/404. */
async function getBukuIndukByClass(req, res) {
  const { id_kelas } = req.params;
  try {
    const [classes] = await pool.execute('SELECT k.*,g.nama_lengkap AS nama_wali_kelas FROM kelas k LEFT JOIN guru g ON g.id_guru=k.id_wali_kelas WHERE k.id_kelas=?', [id_kelas]);
    const kelas = classes[0];
    if (!kelas) return res.status(404).json({ message: 'Kelas tidak ditemukan.' });
    if (req.user.role === 'GURU' && Number(kelas.id_wali_kelas) !== Number(req.user.id_referensi)) return res.status(403).json({ message: 'Cetak kelas hanya tersedia untuk wali kelasnya.' });
    const [students] = await pool.execute("SELECT nisn FROM siswa WHERE id_kelas=? AND status_siswa='AKTIF' ORDER BY nis ASC", [id_kelas]);
    const data = await Promise.all(students.map(({ nisn }) => fetchBukuInduk(nisn)));
    const [schools] = await pool.query('SELECT * FROM profil_sekolah ORDER BY id_profil LIMIT 1');
    return res.json({ data: { profil_sekolah: schools[0] || {}, kelas, siswa: data.filter(Boolean).map(item=>({...item,kelas})) } });
  } catch (error) { return res.status(500).json({ message: 'Gagal menyiapkan export kelas.', detail: error.message }); }
}

module.exports = { getClassSheet, upsertNilaiMapel, upsertWaliKelas, getBukuIndukByNisn, getBukuIndukByClass, fetchBukuInduk };
