const XLSX = require('xlsx');
const pool = require('../config/database');

const schemas = {
  siswa: {
    table: 'siswa',
    key: 'nisn',
    fields: [
      'nisn',
      'nis',
      'nik',
      'no_kk',
      'id_kelas',
      'nama_lengkap',
      'nama_panggilan',
      'jenis_kelamin',
      'tempat_lahir',
      'tanggal_lahir',
      'agama',
      'kewarganegaraan',
      'anak_ke',
      'jumlah_saudara',
      'status_dalam_keluarga',
      'bahasa_sehari_hari',
      'golongan_darah',
      'alamat',
      'nomor_telepon',
      'bertempat_tinggal_pada',
      'jarak_sekolah',
      'foto_url',
      'status_siswa',
    ],
    history: [
      'status_masuk',
      'asal_tk_nama',
      'tgl_sttb_tk',
      'no_sttb_tk',
      'asal_sekolah_pindahan',
      'dari_tingkat',
      'diterima_di_kelas',
      'tgl_diterima',
    ],
    family: [
      'nama_ayah',
      'pendidikan_ayah',
      'pekerjaan_ayah',
      'penghasilan_ayah',
      'nama_ibu',
      'pendidikan_ibu',
      'pekerjaan_ibu',
      'penghasilan_ibu',
      'alamat_orang_tua',
      'no_hp_orang_tua',
      'nama_wali',
      'hubungan_wali',
      'pendidikan_wali',
      'pekerjaan_wali',
      'alamat_wali',
    ],
  },
  guru: {
    table: 'guru',
    key: 'nomor_induk_guru',
    fields: [
      'nomor_induk_guru',
      'nama_lengkap',
      'jenis_kelamin',
      'no_hp',
      'status_kepegawaian',
    ],
  },
  admin: {
    table: 'admin',
    key: 'nomor_induk_admin',
    fields: [
      'nomor_induk_admin',
      'nama_lengkap',
      'jabatan',
      'status_kepegawaian',
    ],
  },
};

/** Mengubah nilai tanggal Excel atau teks lokal menjadi format DATE MySQL. @param {any} value Nilai tanggal sheet. @returns {string|null} YYYY-MM-DD atau null bila tidak valid. */
function parseExcelDate(value) {
  const formatDate = (year, month, day) => {
    const date = new Date(Date.UTC(year, month - 1, day));
    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() + 1 !== month ||
      date.getUTCDate() !== day
    )
      return null;
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };
  if (value instanceof Date && !Number.isNaN(value.valueOf()))
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
  if (typeof value === 'number') {
    const date = XLSX.SSF.parse_date_code(value);
    if (date)
      return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
  }
  if (typeof value !== 'string' || !value.trim()) return null;
  const text = value.trim();
  let match = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (match)
    return formatDate(Number(match[1]), Number(match[2]), Number(match[3]));
  match = text.match(/^(\d{1,2})[/.](\d{1,2})[/.](\d{4})$/);
  if (match)
    return formatDate(Number(match[3]), Number(match[2]), Number(match[1]));
  return null;
}

/** Membuat statement insert/upsert dengan kolom statis yang telah didefinisikan. @param {string} table Nama tabel internal. @param {string[]} fields Daftar kolom. @param {string} key Kolom unik. @returns {string} SQL parametrik. */
function makeUpsertSql(table, fields, key) {
  const updates = fields
    .filter((field) => field !== key)
    .map((field) => `${field}=VALUES(${field})`);
  return `INSERT INTO ${table} (${fields.join(',')}) VALUES (${fields.map(() => '?').join(',')}) ON DUPLICATE KEY UPDATE ${updates.join(',')}`;
}

/** Memvalidasi dan mengimpor spreadsheet siswa/guru/admin dalam satu transaksi; siswa juga mengisi keluarga dan riwayat. @param {Object} req File dan jenis entitas. @param {Object} res Ringkasan atau daftar baris bermasalah. */
async function importExcel(req, res) {
  const entity = req.params.entity;
  const schema = schemas[entity];
  if (!schema)
    return res.status(400).json({ message: 'Jenis import tidak didukung.' });
  if (!req.file)
    return res.status(400).json({ message: 'Berkas Excel wajib dipilih.' });
  let rows;
  try {
    const workbook = XLSX.read(req.file.buffer, {
      type: 'buffer',
      cellDates: true,
    });
    rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {
      defval: '',
    });
  } catch {
    return res
      .status(400)
      .json({ message: 'Berkas Excel tidak dapat dibaca.' });
  }
  if (!rows.length)
    return res.status(400).json({ message: 'Sheet tidak berisi baris data.' });
  const required =
    entity === 'siswa'
      ? [
          'nisn',
          'nis',
          'nama_lengkap',
          'jenis_kelamin',
          'tempat_lahir',
          'tanggal_lahir',
          'agama',
          'alamat',
        ]
      : entity === 'guru'
        ? ['nomor_induk_guru', 'nama_lengkap', 'jenis_kelamin']
        : ['nomor_induk_admin', 'nama_lengkap'];
  const normalized = [];
  const errors = [];
  rows.forEach((raw, index) => {
    const row = { ...raw };
    const line = index + 2;
    if (entity === 'siswa' && /^\d+$/.test(String(row.nisn)))
      row.nisn = String(row.nisn).padStart(10, '0');
    for (const field of required)
      if (row[field] === '' || row[field] === undefined || row[field] === null)
        errors.push(`Baris ${line}: kolom ${field} wajib diisi.`);
    if (entity === 'siswa') {
      if (row.nisn && !/^\d{10}$/.test(String(row.nisn)))
        errors.push(`Baris ${line}: NISN harus terdiri dari 10 digit.`);
      if (
        row.jenis_kelamin &&
        !['L', 'P'].includes(String(row.jenis_kelamin).toUpperCase())
      )
        errors.push(`Baris ${line}: jenis_kelamin harus L atau P.`);
      const date = parseExcelDate(row.tanggal_lahir);
      if (!date)
        errors.push(
          `Baris ${line}: tanggal_lahir tidak valid (gunakan YYYY-MM-DD atau DD/MM/YYYY).`,
        );
      else row.tanggal_lahir = date;
      if (row.tgl_sttb_tk) {
        row.tgl_sttb_tk = parseExcelDate(row.tgl_sttb_tk);
        if (!row.tgl_sttb_tk)
          errors.push(`Baris ${line}: tgl_sttb_tk tidak valid.`);
      }
      if (row.tgl_diterima) {
        row.tgl_diterima = parseExcelDate(row.tgl_diterima);
        if (!row.tgl_diterima)
          errors.push(`Baris ${line}: tgl_diterima tidak valid.`);
      }
    }
    if (
      entity === 'guru' &&
      row.jenis_kelamin &&
      !['L', 'P'].includes(String(row.jenis_kelamin).toUpperCase())
    )
      errors.push(`Baris ${line}: jenis_kelamin harus L atau P.`);
    if (!errors.some((error) => error.startsWith(`Baris ${line}:`)))
      normalized.push(row);
  });
  if (errors.length)
    return res.status(400).json({ message: 'Validasi Excel gagal.', errors });
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    for (const row of normalized) {
      if (entity === 'siswa') {
        const student = Object.fromEntries(
          schema.fields.map((field) => [
            field,
            row[field] === '' || row[field] === undefined ? null : row[field],
          ]),
        );
        student.nisn = String(row.nisn);
        student.nama_lengkap = row.nama_lengkap;
        student.jenis_kelamin = String(row.jenis_kelamin).toUpperCase();
        student.kewarganegaraan ||= 'Indonesia';
        student.jumlah_saudara ??= 0;
        student.status_dalam_keluarga ||= 'Anak Kandung';
        student.bahasa_sehari_hari ||= 'Bahasa Indonesia';
        student.bertempat_tinggal_pada ||= 'Orang Tua';
        student.status_siswa ||= 'AKTIF';
        await connection.execute(
          makeUpsertSql(schema.table, schema.fields, schema.key),
          schema.fields.map((field) => student[field] ?? null),
        );
        const historyFields = ['nisn', ...schema.history];
        const history = {
          nisn: student.nisn,
          ...Object.fromEntries(
            schema.history.map((field) => [
              field,
              row[field] === '' || row[field] === undefined ? null : row[field],
            ]),
          ),
        };
        history.status_masuk ||= 'Baru';
        history.diterima_di_kelas ||= 1;
        history.tgl_diterima ||= new Date().toISOString().slice(0, 10);
        await connection.execute(
          makeUpsertSql('riwayat_masuk_siswa', historyFields, 'nisn'),
          historyFields.map((field) => history[field] ?? null),
        );
        const familyFields = ['nisn', ...schema.family];
        const family = {
          nisn: student.nisn,
          ...Object.fromEntries(
            schema.family.map((field) => [
              field,
              row[field] === '' || row[field] === undefined ? null : row[field],
            ]),
          ),
        };
        family.nama_ayah ||= '-';
        family.nama_ibu ||= '-';
        await connection.execute(
          makeUpsertSql('keluarga_siswa', familyFields, 'nisn'),
          familyFields.map((field) => family[field] ?? null),
        );
      } else {
        const values = schema.fields.map((field) =>
          row[field] === '' || row[field] === undefined ? null : row[field],
        );
        if (entity === 'guru') {
          const idx = schema.fields.indexOf('jenis_kelamin');
          values[idx] = String(row.jenis_kelamin).toUpperCase();
          if (!row.status_kepegawaian)
            values[schema.fields.indexOf('status_kepegawaian')] = 'ASN';
        }
        if (entity === 'admin' && !row.status_kepegawaian)
          values[schema.fields.indexOf('status_kepegawaian')] = 'Honorer';
        await connection.execute(
          makeUpsertSql(schema.table, schema.fields, schema.key),
          values,
        );
      }
    }
    await connection.commit();
    return res.json({
      message: `${normalized.length} baris berhasil diimpor.`,
      count: normalized.length,
    });
  } catch (error) {
    await connection.rollback();
    return res
      .status(400)
      .json({
        message: 'Import dibatalkan; tidak ada baris yang disimpan.',
        detail: error.message,
      });
  } finally {
    connection.release();
  }
}

/** Menghasilkan workbook template sesuai seluruh kolom import tiap entitas. @param {Object} req Jenis template. @param {Object} res Mengirim file xlsx. */
function downloadTemplate(req, res) {
  const schema = schemas[req.params.entity];
  if (!schema)
    return res.status(404).json({ message: 'Template tidak tersedia.' });
  const fields =
    req.params.entity === 'siswa'
      ? [...schema.fields, ...schema.history, ...schema.family]
      : schema.fields;
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet([fields]), 'Data');
  const buffer = XLSX.write(book, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=template-${req.params.entity}.xlsx`,
  );
  return res
    .type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    .send(buffer);
}

module.exports = {
  importExcel,
  downloadTemplate,
  schemas,
  parseExcelDate,
  makeUpsertSql,
};
