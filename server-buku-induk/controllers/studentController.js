const pool = require('../config/database');

const studentFields = ['nis','nik','no_kk','id_kelas','nama_lengkap','nama_panggilan','jenis_kelamin','tempat_lahir','tanggal_lahir','agama','kewarganegaraan','anak_ke','jumlah_saudara','status_dalam_keluarga','bahasa_sehari_hari','golongan_darah','alamat','nomor_telepon','bertempat_tinggal_pada','jarak_sekolah','foto_url','status_siswa'];
const familyFields = ['nama_ayah','pendidikan_ayah','pekerjaan_ayah','penghasilan_ayah','nama_ibu','pendidikan_ibu','pekerjaan_ibu','penghasilan_ibu','alamat_orang_tua','no_hp_orang_tua','nama_wali','hubungan_wali','pendidikan_wali','pekerjaan_wali','alamat_wali'];
const historyFields = ['status_masuk','asal_tk_nama','tgl_sttb_tk','no_sttb_tk','asal_sekolah_pindahan','dari_tingkat','diterima_di_kelas','tgl_diterima'];

/** Mencari siswa dengan filter pencarian/status/kelas dan batas kelas perwalian guru. @param {Object} req Query pencarian dan user aktif. @param {Object} res Daftar siswa terurut NIS. */
async function getAllStudents(req, res) {
  try {
    const values = []; let where = 'WHERE 1=1';
    if (req.query.search) { where += ' AND (s.nama_lengkap LIKE ? OR s.nis LIKE ? OR s.nisn LIKE ?)'; const term = `%${req.query.search}%`; values.push(term, term, term); }
    if (req.query.status) { where += ' AND s.status_siswa=?'; values.push(req.query.status); }
    if (req.user.role === 'GURU') { where += ' AND k.id_wali_kelas=?'; values.push(req.user.id_referensi); }
    else if (req.query.id_kelas) { where += ' AND s.id_kelas=?'; values.push(req.query.id_kelas); }
    const [rows] = await pool.execute(`SELECT s.*,k.nama_kelas FROM siswa s LEFT JOIN kelas k ON k.id_kelas=s.id_kelas ${where} ORDER BY s.nis ASC`, values);
    return res.json({ data: rows });
  } catch (error) { return res.status(500).json({ message: 'Gagal memuat data siswa.', detail: error.message }); }
}

/** Memastikan siswa berada pada kelas perwalian guru. @param {number} guruId ID guru. @param {string} nisn NISN siswa. @returns {Promise<boolean>} Apakah siswa binaan guru. */
async function isHomeroomForStudent(guruId, nisn) { const [rows] = await pool.execute('SELECT 1 FROM siswa s JOIN kelas k ON k.id_kelas=s.id_kelas WHERE s.nisn=? AND k.id_wali_kelas=?', [nisn, guruId]); return rows.length > 0; }

/** Memuat detail siswa dengan semua riwayat pendidikan dan data keluarga. @param {Object} req NISN siswa. @param {Object} res Data detail atau 403/404. */
async function getStudentDetail(req, res) {
  const [rows] = await pool.execute('SELECT s.*,k.nama_kelas,r.status_masuk,r.asal_tk_nama,r.tgl_sttb_tk,r.no_sttb_tk,r.asal_sekolah_pindahan,r.dari_tingkat,r.diterima_di_kelas,r.tgl_diterima,f.nama_ayah,f.pendidikan_ayah,f.pekerjaan_ayah,f.penghasilan_ayah,f.nama_ibu,f.pendidikan_ibu,f.pekerjaan_ibu,f.penghasilan_ibu,f.alamat_orang_tua,f.no_hp_orang_tua,f.nama_wali,f.hubungan_wali,f.pendidikan_wali,f.pekerjaan_wali,f.alamat_wali FROM siswa s LEFT JOIN kelas k ON k.id_kelas=s.id_kelas LEFT JOIN riwayat_masuk_siswa r ON r.nisn=s.nisn LEFT JOIN keluarga_siswa f ON f.nisn=s.nisn WHERE s.nisn=?', [req.params.nisn]);
  if (!rows[0]) return res.status(404).json({ message: 'Siswa tidak ditemukan.' });
  if (req.user.role === 'GURU' && !await isHomeroomForStudent(req.user.id_referensi, req.params.nisn)) return res.status(403).json({ message: 'Siswa bukan binaan Anda.' });
  return res.json({ data: rows[0] });
}

/** Membuat biodata, riwayat masuk, dan keluarga secara atomik. @param {Object} req Data lengkap siswa. @param {Object} res NISN tersimpan atau pesan validasi. */
async function createStudent(req, res) {
  const s = req.body || {}; const required = ['nisn','nis','nama_lengkap','jenis_kelamin','tempat_lahir','tanggal_lahir','agama','alamat'];
  if (required.some(key => !s[key])) return res.status(400).json({ message: 'NISN, NIS, nama, jenis kelamin, tempat/tanggal lahir, agama, dan alamat wajib diisi.' });
  if (!/^\d{10}$/.test(String(s.nisn))) return res.status(400).json({ message: 'NISN harus terdiri dari 10 digit.' });
  if (!['L','P'].includes(s.jenis_kelamin)) return res.status(400).json({ message: 'Jenis kelamin harus L atau P.' });
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const student = { ...s, kewarganegaraan:s.kewarganegaraan||'Indonesia', jumlah_saudara:s.jumlah_saudara??0, status_dalam_keluarga:s.status_dalam_keluarga||'Anak Kandung', bahasa_sehari_hari:s.bahasa_sehari_hari||'Bahasa Indonesia', bertempat_tinggal_pada:s.bertempat_tinggal_pada||'Orang Tua', status_siswa:s.status_siswa||'AKTIF' };
    const baseFields = ['nisn',...studentFields];
    await connection.execute(`INSERT INTO siswa (${baseFields.join(',')}) VALUES (${baseFields.map(()=>'?').join(',')})`, [s.nisn,...studentFields.map(field=>student[field]??null)]);
    const history = { ...s, status_masuk:s.status_masuk||'Baru', diterima_di_kelas:s.diterima_di_kelas||1, tgl_diterima:s.tgl_diterima||new Date().toISOString().slice(0,10) };
    const historyCols = ['nisn',...historyFields];
    await connection.execute(`INSERT INTO riwayat_masuk_siswa (${historyCols.join(',')}) VALUES (${historyCols.map(()=>'?').join(',')})`, [s.nisn,...historyFields.map(field=>history[field]??null)]);
    const family = { ...s, nama_ayah:s.nama_ayah||'-', nama_ibu:s.nama_ibu||'-' };
    const familyCols = ['nisn',...familyFields];
    await connection.execute(`INSERT INTO keluarga_siswa (${familyCols.join(',')}) VALUES (${familyCols.map(()=>'?').join(',')})`, [s.nisn,...familyFields.map(field=>family[field]??null)]);
    await connection.commit();
    return res.status(201).json({ message:'Data siswa tersimpan.',nisn:s.nisn });
  } catch (error) { await connection.rollback(); return res.status(400).json({ message:'Data siswa gagal disimpan.',detail:error.message }); }
  finally { connection.release(); }
}

/** Memperbarui siswa, keluarga, dan riwayat tanpa menghapus kolom yang tidak dikirim. @param {Object} req NISN dan perubahan. @param {Object} res Status pembaruan. */
async function updateStudent(req, res) {
  const b = req.body || {}; const student = studentFields.filter(field=>b[field]!==undefined); const family = familyFields.filter(field=>b[field]!==undefined); const history = historyFields.filter(field=>b[field]!==undefined);
  if (!student.length&&!family.length&&!history.length) return res.status(400).json({message:'Tidak ada kolom yang diperbarui.'});
  const connection=await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [[exists]]=await connection.execute('SELECT nisn FROM siswa WHERE nisn=? FOR UPDATE',[req.params.nisn]);
    if(!exists){await connection.rollback();return res.status(404).json({message:'Siswa tidak ditemukan.'});}
    if(student.length) await connection.execute(`UPDATE siswa SET ${student.map(field=>`${field}=?`).join(',')} WHERE nisn=?`,[...student.map(field=>b[field]??null),req.params.nisn]);
    if(family.length){const [[old]]=await connection.execute('SELECT * FROM keluarga_siswa WHERE nisn=?',[req.params.nisn]);const values={...(old||{}),...b,nama_ayah:b.nama_ayah??old?.nama_ayah??'-',nama_ibu:b.nama_ibu??old?.nama_ibu??'-'};const cols=['nisn',...familyFields];await connection.execute(`INSERT INTO keluarga_siswa (${cols.join(',')}) VALUES (${cols.map(()=>'?').join(',')}) ON DUPLICATE KEY UPDATE ${family.map(field=>`${field}=VALUES(${field})`).join(',')}`,[req.params.nisn,...familyFields.map(field=>values[field]??null)]);}
    if(history.length){const [[old]]=await connection.execute('SELECT * FROM riwayat_masuk_siswa WHERE nisn=?',[req.params.nisn]);const values={...(old||{}),...b,status_masuk:b.status_masuk??old?.status_masuk??'Baru',diterima_di_kelas:b.diterima_di_kelas??old?.diterima_di_kelas??1,tgl_diterima:b.tgl_diterima??old?.tgl_diterima??new Date().toISOString().slice(0,10)};const cols=['nisn',...historyFields];await connection.execute(`INSERT INTO riwayat_masuk_siswa (${cols.join(',')}) VALUES (${cols.map(()=>'?').join(',')}) ON DUPLICATE KEY UPDATE ${history.map(field=>`${field}=VALUES(${field})`).join(',')}`,[req.params.nisn,...historyFields.map(field=>values[field]??null)]);}
    await connection.commit();return res.json({message:'Data siswa diperbarui.'});
  } catch(error){await connection.rollback();return res.status(400).json({message:'Perubahan siswa gagal disimpan.',detail:error.message});}
  finally{connection.release();}
}

/** Menghapus siswa; foreign key cascade membersihkan keluarga, riwayat, rapor, dan nilai. @param {Object} req NISN siswa. @param {Object} res Status penghapusan. */
async function deleteStudent(req, res) { const [result]=await pool.execute('DELETE FROM siswa WHERE nisn=?',[req.params.nisn]);return result.affectedRows?res.json({message:'Data siswa dihapus.'}):res.status(404).json({message:'Siswa tidak ditemukan.'}); }

module.exports={getAllStudents,getStudentDetail,createStudent,updateStudent,deleteStudent,isHomeroomForStudent};
