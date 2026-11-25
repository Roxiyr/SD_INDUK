const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

/** Memeriksa ekstensi dan mime type workbook sebelum menyimpan file di memori. @param {Object} req Request unggahan. @param {Object} file Metadata file. @param {Function} done Callback multer. */
function excelFileFilter(_req, file, done) { const ok = /\.(xlsx|xls)$/i.test(file.originalname) && /spreadsheet|excel|octet-stream/i.test(file.mimetype); const error=ok?null:Object.assign(new Error('Gunakan file Excel .xlsx atau .xls.'),{status:400});done(error, ok); }

/** Memeriksa tipe dan ekstensi gambar untuk foto siswa atau kop sekolah. @param {Object} req Request unggahan. @param {Object} file Metadata file. @param {Function} done Callback multer. */
function imageFileFilter(_req, file, done) { const ext = path.extname(file.originalname).toLowerCase(); const allowed = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' }; const ok = allowed[ext] === file.mimetype; const error=ok?null:Object.assign(new Error('Gunakan gambar JPG, PNG, atau WebP yang sesuai tipe filenya.'),{status:400});done(error, ok); }

/** Mengizinkan unggahan Excel ke memory dengan batas ukuran 5 MB. @returns {Function} Middleware unggah workbook. */
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: excelFileFilter });

/** Menyimpan gambar pada folder uploads dengan nama acak agar nama file tidak berbenturan. @returns {Function} Middleware unggah gambar. */
const imageUpload = multer({ storage: multer.diskStorage({ destination: path.join(__dirname, '..', 'uploads'), filename: (_req, file, done) => done(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`) }), limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: imageFileFilter });

module.exports = upload;
module.exports.imageUpload = imageUpload;
