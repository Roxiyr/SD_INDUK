# PROJECT BLUEPRINT: SISTEM INFORMASI BUKU INDUK SISWA (E-BUKU INDUK)

**Mitra:** SDN Batu Ampar 12 Pagi
**Standar Akademik:** Kurikulum Merdeka (Sekolah Dasar)
**Target Deployment:** Local School Infrastructure (XAMPP / MySQL + Node.js + React SPA)
**Arsitektur Repositori:** Multi-Repo Terpisah (`server-buku-induk` & `client-buku-induk`) — **DILARANG MENGGUNAKAN MONOREPO**

---

## 01. SYSTEM OVERVIEW & CORE CONSTRAINTS (AGENTIC AI GUARDRAILS)

1. **Pemisahan Repositori Ketat:**
   * Repositori Backend: `server-buku-induk/` (Node.js + Express.js + MySQL)
   * Repositori Frontend: `client-buku-induk/` (React + Vite + Tailwind CSS)
   * Kedua repositori berdiri sendiri dengan `package.json` masing-masing dan berkomunikasi via RESTful JSON API (`http://localhost:5000/api/v1`).

2. **Aktor & Batasan Hak Akses (RBAC):**
   * Sistem beroperasi secara lokal di sekolah. **Tidak ada portal login untuk Siswa maupun Orang Tua/Wali.** Rangkuman performa diberikan melalui lembar cetak Buku Induk fisik.
   * Hanya terdapat **2 peran login utama** di tabel `pengguna`:
     1. `ADMIN` (Administrator / Tata Usaha): Mengelola seluruh master data (Siswa, Guru, Admin, Profil Sekolah, Kelas, Mapel, Ekskul), manajemen akun Guru, pemetaan Wali Kelas & Guru Mapel, import Excel (`.xlsx`), serta **Export / Cetak Lembar Buku Induk (Data Diri & Nilai Rapor) baik secara satuan per siswa maupun massal per kelas**.
     2. `GURU` (Wali Kelas & Guru Mapel): Hak akses bersifat kontekstual berdasarkan pemetaan dari Admin:
        * **Jika terdaftar sebagai `id_wali_kelas` pada tabel `kelas`:** Dapat melihat & mengelola **Daftar Siswa Binaan**, menginput **Profil Pelajar Pancasila (P5)**, **Ekstrakurikuler**, **Absensi & Catatan Wali Kelas**, serta melakukan **Export / Cetak Lembar Buku Induk (Data Diri & Nilai Rapor) secara satuan per siswa maupun massal satu kelas** khusus untuk kelas perwaliannya.
        * **Jika terdaftar pada tabel `penugasan_guru_mapel`:** Dapat menginput **Nilai Akhir (0–100)** dan **Capaian Kompetensi** hanya pada mata pelajaran dan kelas yang diampunya. *(Catatan: Guru Mapel yang bukan Wali Kelas pada kelas tersebut tidak memiliki akses untuk melakukan export/cetak Lembar Buku Induk).*

3. **Skema Hibrida Cetak & Export Output (Per Siswa & Per Kelas):**
   * **Mode 1 — Export / Cetak Satuan Per Siswa (`nisn`):** Tersedia pada menu **Data Siswa** (Admin) dan **Daftar Siswa Binaan** (Wali Kelas) untuk mencetak satu siswa tertentu (misalnya kebutuhan mutasi keluar/pindah sekolah).
   * **Mode 2 — Export / Cetak Massal Per Kelas (`id_kelas`):**
     * **Sisi Admin:** Tersedia pada submenu **Administrasi -> Data Kelas** (tombol aksi pada baris kelas dan di dalam halaman Detail Kelas) untuk mengekspor seluruh siswa aktif pada kelas tersebut yang diurutkan berdasarkan `nis ASC`.
     * **Sisi Wali Kelas:** Tersedia pada menu **Daftar Siswa Binaan** (tombol *"Export Buku Induk Kelas"* di bagian atas tabel) yang otomatis terkunci hanya untuk kelas perwaliannya.
   * **Pemisahan Halaman Cetak (`@media print`):** Baik pada mode satuan maupun massal per kelas, setiap siswa mendapatkan pemisahan halaman tegas (`break-after: page` / `page-break-after: always`) sehingga **Halaman Data Diri** dan **Halaman Nilai Rapor** tidak pernah tercampur antar siswa dalam satu lembar kertas.

4. **Kredensial Default & Standar Akun:**
   * **Admin Awal (via Seeder):** `username: "admin"`, `password: "admin"` (di-hash menggunakan `bcryptjs`).
   * **Akun Guru:** Dibuat oleh Admin melalui menu Manajemen Akun menggunakan `nomor_induk_guru` (NIP/NTP) sebagai `username` dan `password` awal (di-hash `bcryptjs`).

5. **Standar Dokumentasi Kode (Wajib Komentar Ringkas pada Setiap Fungsi):**
   * Setiap fungsi, *controller*, *middleware*, *service*, maupun komponen React **WAJIB** diawali dengan blok komentar dokumentasi ringkas (format JSDoc) yang menjelaskan: (1) tujuan fungsi, (2) parameter input utama, dan (3) nilai kembalian / efek sampingnya.
   * Hindari komentar bertele-tele; tulis padat 2–4 baris agar mudah dibaca oleh *developer* dan QA. Contoh standar:
     ```javascript
     /**
      * Memvalidasi kredensial login pengguna dan menghasilkan token JWT.
      * @param {Object} req - Body berisi { username, password }
      * @param {Object} res - Mengembalikan { token, user } atau status 401
      */
     ```

6. **Standar Unit Testing untuk QA:**
   * Setiap unit logika bisnis (autentikasi, validasi RBAC, transaksi simpan siswa, kalkulasi nilai rapor, otorisasi export Buku Induk satuan & per kelas, parser Excel, dan render komponen UI utama) wajib memiliki skenario *unit test* terisolasi yang dapat dijalankan melalui perintah `npm test`.

---

## 02. DATABASE ARCHITECTURE & COMPLETE DDL SCHEMA (MYSQL / XAMPP)

Gunakan database bernama `db_buku_induk_sdn_ba12` dengan engine `InnoDB` dan charset `utf8mb4_unicode_ci`. Eksekusi seluruh 15 tabel berikut secara berurutan agar relasi *Foreign Key* valid:

```sql
CREATE DATABASE IF NOT EXISTS db_buku_induk_sdn_ba12
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE db_buku_induk_sdn_ba12;

-- ==========================================================
-- KELOMPOK 1: AUTENTIKASI & ENTITAS PENGGUNA
-- ==========================================================

CREATE TABLE admin (
  id_admin INT AUTO_INCREMENT PRIMARY KEY,
  nomor_induk_admin VARCHAR(30) NOT NULL UNIQUE,
  nama_lengkap VARCHAR(100) NOT NULL,
  jabatan VARCHAR(50) DEFAULT 'Operator Tata Usaha',
  status_kepegawaian ENUM('ASN', 'PPPK', 'Honorer') DEFAULT 'Honorer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE guru (
  id_guru INT AUTO_INCREMENT PRIMARY KEY,
  nomor_induk_guru VARCHAR(30) NOT NULL UNIQUE,
  nama_lengkap VARCHAR(100) NOT NULL,
  jenis_kelamin ENUM('L', 'P') NOT NULL,
  no_hp VARCHAR(20) NULL,
  status_kepegawaian ENUM('ASN', 'PPPK', 'Honorer') DEFAULT 'ASN',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE pengguna (
  id_user INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('ADMIN', 'GURU') NOT NULL,
  id_referensi INT NULL COMMENT 'Merujuk ke id_admin atau id_guru',
  nama_lengkap VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ==========================================================
-- KELOMPOK 2: MASTER ADMINISTRASI & PEMETAAN AKADEMIK
-- ==========================================================

CREATE TABLE profil_sekolah (
  id_profil INT AUTO_INCREMENT PRIMARY KEY,
  nama_sekolah VARCHAR(150) NOT NULL DEFAULT 'SDN Batu Ampar 12 Pagi',
  npsn VARCHAR(20) NOT NULL,
  alamat_lengkap TEXT NOT NULL,
  kelurahan VARCHAR(50) DEFAULT 'Batu Ampar',
  kecamatan VARCHAR(50) DEFAULT 'Kramat Jati',
  kota VARCHAR(50) DEFAULT 'Jakarta Timur',
  kode_pos VARCHAR(10) DEFAULT '13520',
  nama_kepala_sekolah VARCHAR(100) NOT NULL,
  nip_kepala_sekolah VARCHAR(30) NOT NULL,
  logo_kop_url VARCHAR(255) NULL,
  tahun_ajaran_aktif VARCHAR(15) NOT NULL DEFAULT '2026/2027',
  semester_aktif ENUM('Ganjil', 'Genap') NOT NULL DEFAULT 'Ganjil',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE kelas (
  id_kelas INT AUTO_INCREMENT PRIMARY KEY,
  nama_kelas VARCHAR(20) NOT NULL COMMENT 'Contoh: 1A, 2B, 6A',
  tingkat TINYINT NOT NULL COMMENT '1 sampai 6',
  fase ENUM('Fase A', 'Fase B', 'Fase C') NOT NULL,
  tahun_pelajaran VARCHAR(15) NOT NULL,
  id_wali_kelas INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_kelas_wali FOREIGN KEY (id_wali_kelas) REFERENCES guru(id_guru) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE mapel (
  id_mapel INT AUTO_INCREMENT PRIMARY KEY,
  kode_mapel VARCHAR(20) NOT NULL UNIQUE,
  nama_mapel VARCHAR(100) NOT NULL,
  kategori_mapel ENUM('Wajib', 'Muatan Lokal') NOT NULL DEFAULT 'Wajib',
  urutan_cetak INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE ekstrakurikuler (
  id_ekskul_master INT AUTO_INCREMENT PRIMARY KEY,
  nama_ekskul VARCHAR(100) NOT NULL,
  kategori_ekskul ENUM('Krida', 'Karya Ilmiah', 'Latihan Olah Bakat & Minat', 'Keagamaan') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE penugasan_guru_mapel (
  id_penugasan INT AUTO_INCREMENT PRIMARY KEY,
  id_guru INT NOT NULL,
  id_kelas INT NOT NULL,
  id_mapel INT NOT NULL,
  tahun_pelajaran VARCHAR(15) NOT NULL,
  UNIQUE KEY uq_penugasan (id_guru, id_kelas, id_mapel, tahun_pelajaran),
  CONSTRAINT fk_tugas_guru FOREIGN KEY (id_guru) REFERENCES guru(id_guru) ON DELETE CASCADE,
  CONSTRAINT fk_tugas_kelas FOREIGN KEY (id_kelas) REFERENCES kelas(id_kelas) ON DELETE CASCADE,
  CONSTRAINT fk_tugas_mapel FOREIGN KEY (id_mapel) REFERENCES mapel(id_mapel) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ==========================================================
-- KELOMPOK 3: MASTER SISWA & TRANSAKSI BUKU INDUK
-- ==========================================================

CREATE TABLE siswa (
  nisn VARCHAR(10) PRIMARY KEY,
  nis VARCHAR(20) NOT NULL UNIQUE,
  nik VARCHAR(16) NULL,
  no_kk VARCHAR(16) NULL,
  id_kelas INT NULL,
  nama_lengkap VARCHAR(100) NOT NULL,
  nama_panggilan VARCHAR(50) NULL,
  jenis_kelamin ENUM('L', 'P') NOT NULL,
  tempat_lahir VARCHAR(50) NOT NULL,
  tanggal_lahir DATE NOT NULL,
  agama VARCHAR(20) NOT NULL,
  kewarganegaraan VARCHAR(30) DEFAULT 'Indonesia',
  anak_ke INT NULL,
  jumlah_saudara INT DEFAULT 0,
  status_dalam_keluarga VARCHAR(30) DEFAULT 'Anak Kandung',
  bahasa_sehari_hari VARCHAR(50) DEFAULT 'Bahasa Indonesia',
  golongan_darah VARCHAR(3) NULL,
  alamat TEXT NOT NULL,
  nomor_telepon VARCHAR(15) NULL,
  bertempat_tinggal_pada VARCHAR(100) DEFAULT 'Orang Tua',
  jarak_sekolah VARCHAR(50) NULL,
  foto_url VARCHAR(255) NULL,
  status_siswa ENUM('AKTIF', 'MUTASI_KELUAR', 'LULUS') NOT NULL DEFAULT 'AKTIF',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_siswa_kelas FOREIGN KEY (id_kelas) REFERENCES kelas(id_kelas) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE riwayat_masuk_siswa (
  id_riwayat INT AUTO_INCREMENT PRIMARY KEY,
  nisn VARCHAR(10) NOT NULL UNIQUE,
  status_masuk ENUM('Baru', 'Pindahan') NOT NULL DEFAULT 'Baru',
  asal_tk_nama VARCHAR(100) NULL,
  tgl_sttb_tk DATE NULL,
  no_sttb_tk VARCHAR(50) NULL,
  asal_sekolah_pindahan VARCHAR(100) NULL,
  dari_tingkat TINYINT NULL,
  diterima_di_kelas TINYINT NOT NULL DEFAULT 1,
  tgl_diterima DATE NOT NULL,
  CONSTRAINT fk_riwayat_siswa FOREIGN KEY (nisn) REFERENCES siswa(nisn) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE keluarga_siswa (
  id_keluarga INT AUTO_INCREMENT PRIMARY KEY,
  nisn VARCHAR(10) NOT NULL UNIQUE,
  nama_ayah VARCHAR(100) NOT NULL,
  pendidikan_ayah VARCHAR(50) NULL,
  pekerjaan_ayah VARCHAR(50) NULL,
  penghasilan_ayah VARCHAR(50) NULL,
  nama_ibu VARCHAR(100) NOT NULL,
  pendidikan_ibu VARCHAR(50) NULL,
  pekerjaan_ibu VARCHAR(50) NULL,
  penghasilan_ibu VARCHAR(50) NULL,
  alamat_orang_tua TEXT NULL,
  no_hp_orang_tua VARCHAR(20) NULL,
  nama_wali VARCHAR(100) NULL,
  hubungan_wali VARCHAR(50) NULL,
  pendidikan_wali VARCHAR(50) NULL,
  pekerjaan_wali VARCHAR(50) NULL,
  alamat_wali TEXT NULL,
  CONSTRAINT fk_keluarga_siswa FOREIGN KEY (nisn) REFERENCES siswa(nisn) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE rapor_capaian (
  id_rapor INT AUTO_INCREMENT PRIMARY KEY,
  nisn VARCHAR(10) NOT NULL,
  id_user INT NULL COMMENT 'User penginput terakhir',
  kelas VARCHAR(20) NOT NULL,
  tingkat TINYINT NOT NULL,
  fase ENUM('Fase A', 'Fase B', 'Fase C') NOT NULL,
  semester ENUM('Ganjil', 'Genap') NOT NULL,
  tahun_pelajaran VARCHAR(15) NOT NULL,
  absensi_sakit INT NOT NULL DEFAULT 0,
  absensi_izin INT NOT NULL DEFAULT 0,
  absensi_tanpa_ket INT NOT NULL DEFAULT 0,
  catatan_wali_kelas TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_rapor_semester (nisn, tahun_pelajaran, semester),
  CONSTRAINT fk_rapor_siswa FOREIGN KEY (nisn) REFERENCES siswa(nisn) ON DELETE CASCADE,
  CONSTRAINT fk_rapor_user FOREIGN KEY (id_user) REFERENCES pengguna(id_user) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE nilai_mapel (
  id_nilai_mapel INT AUTO_INCREMENT PRIMARY KEY,
  id_rapor INT NOT NULL,
  id_mapel INT NOT NULL,
  nilai_akhir INT NOT NULL CHECK (nilai_akhir BETWEEN 0 AND 100),
  capaian_kompetensi TEXT NULL,
  UNIQUE KEY uq_rapor_mapel (id_rapor, id_mapel),
  CONSTRAINT fk_nilai_rapor FOREIGN KEY (id_rapor) REFERENCES rapor_capaian(id_rapor) ON DELETE CASCADE,
  CONSTRAINT fk_nilai_mapel FOREIGN KEY (id_mapel) REFERENCES mapel(id_mapel) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE profil_pancasila (
  id_profil_pancasila INT AUTO_INCREMENT PRIMARY KEY,
  id_rapor INT NOT NULL,
  dimensi VARCHAR(100) NOT NULL,
  elemen VARCHAR(100) NOT NULL,
  sub_elemen VARCHAR(150) NOT NULL,
  target_pencapaian ENUM('BB', 'MB', 'BSH', 'SB') NOT NULL,
  CONSTRAINT fk_p5_rapor FOREIGN KEY (id_rapor) REFERENCES rapor_capaian(id_rapor) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE nilai_ekstrakurikuler (
  id_nilai_ekskul INT AUTO_INCREMENT PRIMARY KEY,
  id_rapor INT NOT NULL,
  id_ekskul_master INT NOT NULL,
  predikat ENUM('Sangat Baik', 'Baik', 'Cukup', 'Kurang') NOT NULL,
  keterangan TEXT NULL,
  CONSTRAINT fk_ekskul_rapor FOREIGN KEY (id_rapor) REFERENCES rapor_capaian(id_rapor) ON DELETE CASCADE,
  CONSTRAINT fk_ekskul_master FOREIGN KEY (id_ekskul_master) REFERENCES ekstrakurikuler(id_ekskul_master) ON DELETE RESTRICT
) ENGINE=InnoDB;
```

### Wajib Database Seeder (`server-buku-induk/seeders/seed.js`)
Saat dijalankan (`npm run seed`), sistem wajib mengisi data awal:
1. **Akun Admin Default:** `username: "admin"`, `password: bcrypt.hash("admin", 10)`, `role: "ADMIN"`, `nama_lengkap: "Administrator TU"`.
2. **Profil Sekolah Default:** `SDN Batu Ampar 12 Pagi`, Jakarta Timur, Tahun Ajaran `2026/2027`, Semester `Ganjil`.
3. **Master Mata Pelajaran SD Kurikulum Merdeka:** Pendidikan Agama dan Budi Pekerti, Pendidikan Pancasila, Bahasa Indonesia, Matematika, Ilmu Pengetahuan Alam dan Sosial (IPAS), Pendidikan Jasmani Olahraga dan Kesehatan (PJOK), Seni Budaya, Bahasa Inggris, Muatan Lokal (Bahasa & Sastra Betawi / PLBJ).
4. **Master Ekstrakurikuler:** Pramuka (`Krida`), UKS/PMR (`Krida`), Dokter Kecil (`Karya Ilmiah`), Seni Tari & Musik (`Latihan Olah Bakat & Minat`), Pencak Silat / Futsal (`Latihan Olah Bakat & Minat`), Tahfiz & Baca Tulis Al-Qur'an (`Keagamaan`).

---

## 03. BACKEND SPECIFICATION (`server-buku-induk`)

### Tech Stack & Dependencies
* **Runtime:** Node.js (v18+) + Express.js (`express`, `cors`, `dotenv`, `morgan`)
* **Database:** `mysql2` (Promise pool)
* **Auth & Security:** `jsonwebtoken`, `bcryptjs`
* **Excel Import & Upload:** `multer` (memoryStorage), `xlsx` (SheetJS)
* **Unit Testing:** `jest`, `supertest` (dengan mocking koneksi pool database agar test berjalan cepat tanpa merusak data produksi)

### Struktur Direktori `server-buku-induk/`
```text
server-buku-induk/
├── config/
│   └── database.js           # mysql2/promise connection pool
├── controllers/
│   ├── authController.js     # login, getMe, changePassword
│   ├── adminController.js    # dashboardStats, crudAdmin, crudGuru, crudProfilSekolah, crudKelas, crudMapel, crudEkskul, crudAkunGuru, crudPenugasan
│   ├── guruController.js     # dashboardGuruStats, getSiswaBinaan, getKelasMapelDiampu
│   ├── studentController.js  # getAllStudents, getStudentDetail (join riwayat & keluarga), createStudent, updateStudent, deleteStudent
│   ├── gradeController.js    # getRaporByKelasSemester, upsertNilaiMapel, upsertProfilPancasila, upsertEkskulAbsensi, getBukuIndukByNisn, getBukuIndukByClass
│   └── importController.js   # importSiswaExcel, importGuruExcel, importAdminExcel, downloadTemplateExcel
├── middlewares/
│   ├── authMiddleware.js     # verifyToken, requireRole('ADMIN' | 'GURU')
│   └── uploadMiddleware.js   # multer filter (.xlsx, .xls) & image upload (foto siswa / logo kop)
├── routes/
│   ├── authRoutes.js
│   ├── adminRoutes.js
│   ├── guruRoutes.js
│   ├── studentRoutes.js
│   └── gradeRoutes.js
├── seeders/
│   └── seed.js
├── tests/                    # Unit & Integration Tests untuk QA
│   ├── auth.test.js
│   ├── student.test.js
│   ├── gradeRbac.test.js
│   ├── bukuIndukExport.test.js
│   └── excelImport.test.js
├── uploads/                  # Static folder untuk logo sekolah & foto siswa
├── .env.example
├── package.json
└── server.js
```

### Kontrak API Utama (`/api/v1`)
* **Auth:**
  * `POST /auth/login` -> Body `{ username, password }`. Mengembalikan `{ token, user: { id_user, username, role, id_referensi, nama_lengkap, is_wali_kelas, kelas_binaan } }`.
  * `GET /auth/me` -> Profil user aktif beserta daftar kelas perwalian & daftar mapel yang diampu.
* **Admin Endpoints (`requireRole('ADMIN')`):**
  * `GET /admin/dashboard` -> Mengembalikan `{ total_siswa, total_guru, total_admin, total_kelas, total_mapel, total_ekskul, tahun_ajaran_aktif, semester_aktif }`.
  * `CRUD /admin/guru`, `CRUD /admin/admin`, `CRUD /admin/kelas` (termasuk detail kelas beserta daftar siswa anggotanya), `CRUD /admin/mapel`, `CRUD /admin/ekskul`.
  * `GET & PUT /admin/profil-sekolah` -> Single record configuration.
  * `CRUD /admin/akun-guru` -> Membuat/mengubah/menghapus baris di tabel `pengguna` khusus `role = 'GURU'`.
  * `CRUD /admin/penugasan` -> Memetakan `id_guru` ke `id_kelas` dan `id_mapel`.
  * `POST /admin/import/:entity` (`siswa` | `guru` | `admin`) -> Membaca file `.xlsx` via `xlsx.read(req.file.buffer)`, memvalidasi baris, dan melakukan `INSERT ... ON DUPLICATE KEY UPDATE` dalam transaksi SQL.
* **Siswa & Export Buku Induk Endpoints (`ADMIN` & `GURU` Wali Kelas):**
  * `GET /students` -> Mendukung query `?search=`, `?id_kelas=`, `?status=`. Jika diakses oleh `GURU`, otomatis memfilter hanya siswa pada `id_kelas` di mana guru tersebut menjadi `id_wali_kelas`.
  * `POST /students` & `PUT /students/:nisn` -> Menyimpan data ke tabel `siswa`, `riwayat_masuk_siswa`, dan `keluarga_siswa` secara atomik (`connection.beginTransaction()`).
  * `GET /students/:nisn/buku-induk` **(Mode Satuan Per Siswa)** -> Mengagregasi seluruh data diri & nilai rapor untuk 1 siswa tertentu (`profil_sekolah`, `siswa`, `riwayat_masuk_siswa`, `keluarga_siswa`, dan histori `rapor_capaian` lengkap).
  * `GET /classes/:id_kelas/export-buku-induk` **(Mode Massal Per Kelas)** -> Mengambil profil sekolah, detail kelas, dan array seluruh siswa aktif pada `id_kelas` tersebut (`ORDER BY siswa.nis ASC`) yang masing-masing sudah memuat data diri lengkap dan histori `rapor_capaian` kelas 1–6.
  * **Aturan Otorisasi Ketat (Berlaku untuk Endpoint Satuan & Per Kelas):**
    * Jika `req.user.role === 'ADMIN'`: Diizinkan untuk **semua** `nisn` siswa maupun **semua** `id_kelas`.
    * Jika `req.user.role === 'GURU'`: Sistem memeriksa apakah `kelas.id_wali_kelas === req.user.id_referensi`. Jika **tidak cocok** (bukan Wali Kelas pada kelas tersebut), kembalikan `403 Forbidden`.
* **Nilai & Asesmen Endpoints (`GURU`):**
  * `GET /grades/class-sheet?id_kelas=&tahun_pelajaran=&semester=` -> Memuat daftar siswa di kelas tersebut beserta status nilai mapel / P5 / ekskul.
  * `POST /grades/mapel` -> Validasi bahwa `req.user.id_referensi` memiliki penugasan di `penugasan_guru_mapel` untuk kelas & mapel terkait sebelum menyimpan `nilai_akhir` dan `capaian_kompetensi`.
  * `POST /grades/wali-kelas` -> Validasi bahwa `req.user.id_referensi` adalah `id_wali_kelas` kelas terkait sebelum menyimpan `absensi_*`, `catatan_wali_kelas`, `profil_pancasila`, dan `nilai_ekstrakurikuler`.

---

## 04. FRONTEND SPECIFICATION & DESIGN SYSTEM (`client-buku-induk`)

### Tech Stack
* **Core:** React 18+ & Vite (JavaScript ES6+)
* **Routing & State:** `react-router-dom` v6, React Context (`AuthContext`)
* **HTTP Client:** `axios` dengan interceptor JWT otomatis
* **Styling & Icons:** Tailwind CSS + `lucide-react`
* **Print & Export Engine:** CSS Paged Media (`@media print` dengan `@page { size: 215mm 330mm; margin: 12mm; }`) untuk cetak/simpan PDF Lembar Buku Induk satuan maupun per kelas
* **Unit Testing:** `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`

### Sumber Kebenaran Palet Warna & Token CSS (`src/index.css`)
Agentic AI **WAJIB** mendeklarasikan variabel CSS berikut di `src/index.css` dan memetakannya ke konfigurasi Tailwind agar seluruh komponen mengikuti identitas visual resmi sekolah:

```css
@import "tailwindcss";

:root {
  /* Palet Utama Dashboard (Admin & Guru) */
  --color-primary: #BE101B;
  --color-primary-dark: #A90C16;
  --color-text-primary: #17233A;
  --color-text-secondary: #8290A7;
  --color-bg-app: #F5F7FB;
  --color-surface: #FFFFFF;
  --color-border-main: #E8EDF4;
  --color-border-sidebar: #E6EBF2;

  /* Warna Status & Aksen */
  --color-info: #357CFF;
  --color-success: #149B72;
  --color-success-bg: #EAFAF3;
  --color-warning: #ED8B00;
  --color-warning-bg: #FFF8E9;
  --color-error-bg: #FFF0F1;

  /* Token Khusus Halaman Login */
  --login-maroon: #A00010;
  --login-navy-text: #172033;
  --login-bg-lavender: #F7F8FF;
  --login-badge-bg: #EDF1FF;
  --login-badge-text: #34446F;
  --login-photo-panel: #493C38;
}
```

### Aturan Tata Letak & Fitur Export Per Halaman
1. **Halaman Login (`/login`):**
   * **Aset Background Wajib:** Gunakan foto halaman/gedung sekolah yang disimpan pada `client-buku-induk/public/school-campus.png` (diakses via URL `/school-campus.png`) sebagai latar belakang visual utama panel kiri halaman login.
   * **Top Header Bar Login:** Bilah atas putih tipis menampilkan logo sekolah & judul **`SD NEGERI BATU AMPAR 12 PAGI`** (subjudul: *Buku Induk Siswa Elektronik*) di sisi kiri, serta label **`PORTAL RESMI`** dengan ikon lingkaran maroon (`#A00010`) di sisi kanan.
   * **Layout Split-Screen 2 Kolom (di dalam container kartu utama berlatar `#FFFFFF` / `--login-bg-lavender` `#F7F8FF`):**
     * **Panel Kiri (Hero Visual & Background Foto Sekolah `/school-campus.png`):**
       * Menggunakan `background-image: url('/school-campus.png')` dengan `background-size: cover; background-position: center;` dan *fallback* warna `--login-photo-panel` (`#493C38`), dilapisi *gradient overlay* hangat/terang di bagian atas agar teks tetap kontras terbaca.
       * **Header Panel:** Logo sekolah bulat di kiri bersanding dengan pil/badge semi-transparan `PORTAL RESMI ADMINISTRASI SD` dan nama sekolah `SD NEGERI BATU AMPAR 12 PAGI`, diikuti judul besar tegas **`Sistem Informasi Buku Induk Sekolah`** (`--login-navy-text` `#172033`).
       * **Kartu Glassmorphism Tengah (`backdrop-blur-md bg-[#2A2322]/75 text-white`):** Menampilkan label kecil `Buku Induk Digital` di kiri, badge tahun ajaran (`T.A. 2026/2027`) di kanan, teks besar **`Kelas I - VI`**, serta subteks *"Pengelolaan data dan arsip siswa dalam satu sistem."*
       * **2 Kartu Fitur Kecil & Metadata Bawah:** Dua kartu horizontal semi-transparan (`Data Terstruktur` dan `Arsip Digital`), deretan chip metadata (`Data Siswa: NISN | NIK | Rapor Kurikulum Merdeka | Ijazah`), serta footer copyright bawah (`© Digitalisasi Administrasi Sekolah` — `SD Negeri Batu Ampar 12 Pagi`).
     * **Panel Kanan (Form Login — Strict 2 Roles Only):**
       * Pil/badge atas `Portal Buku Induk Sekolah` berlatar `--login-badge-bg` (`#EDF1FF`) dengan teks `--login-badge-text` (`#34446F`), judul besar **`Selamat Datang Kembali`** (`--login-navy-text` `#172033`), dan subteks *"Masuk untuk melanjutkan ke dashboard pengelolaan Buku Induk Sekolah."*
       * **Segmented Role Selector (`Masuk sebagai`):** Hanya menampilkan **2 tab pilihan peran (`Operator / Admin` dan `Guru`)** sesuai arsitektur sistem. **DILARANG menampilkan tab `Murid` maupun tombol `SSO Akun Belajar.id`** karena sistem beroperasi lokal tanpa login siswa.
       * Input **Username / NIP** dan **Kata Sandi** (lengkap dengan ikon *toggle show/hide password*), checkbox `Ingat sesi saya`, alert error memakai `--color-error-bg` (`#FFF0F1`) + teks `#A90C16` bila login gagal, tombol submit lebar penuh memakai `--login-maroon` (`#A00010`) dengan label dinamis (`Masuk ke Dashboard Operator →` / `Masuk ke Dashboard Guru →`), serta catatan bantuan menghubungi Administrator Sekolah di bagian bawah.
2. **Shell Dashboard Admin & Guru (Sidebar + Topbar + Content):**
   * **Sidebar Kiri:** Latar `--color-surface` (`#FFFFFF`), border kanan `--color-border-sidebar` (`#E6EBF2`). Item menu aktif menggunakan latar tipis merah (`#FFF0F1`) atau aksen solid `--color-primary` (`#BE101B`) dengan teks kontras tinggi.
   * **Topbar Header:** Latar `#FFFFFF`, border bawah `--color-border-main` (`#E8EDF4`), menampilkan **Tanggal & Tahun Realtime**, badge Tahun Ajaran/Semester aktif, serta **Greetings dinamis** (`Selamat Pagi/Siang/Sore, [Nama Pengguna]`) dengan teks `--color-text-primary` (`#17233A`).
   * **Area Konten Utama:** Latar `--color-bg-app` (`#F5F7FB`). Semua card statistik, tabel data, dan modal formulir menggunakan permukaan `--color-surface` (`#FFFFFF`) dengan border `--color-border-main` (`#E8EDF4`).
   * **Visibilitas Fitur Export Buku Induk (Satuan & Per Kelas):**
     * **Sisi Admin — Menu `Data Siswa` (`DataSiswa.jsx`):** Tombol aksi **Export / Cetak Buku Induk (Satuan)** pada setiap baris dan detail siswa.
     * **Sisi Admin — Submenu `Administrasi -> Data Kelas` (`DataKelas.jsx`):** Tombol aksi **Detail & Export Buku Induk Kelas** pada setiap baris kelas serta tombol utama **"Export Buku Induk Satu Kelas"** di dalam tampilan Detail Kelas.
     * **Sisi Guru — Menu `Daftar Siswa Binaan` (`SiswaBinaan.jsx`):** Hanya tampil jika guru terdaftar sebagai **Wali Kelas** (`user.is_wali_kelas === true`). Menyediakan tombol **"Export Buku Induk Kelas Binaan"** di bagian atas tabel (untuk mencetak seluruh siswa di kelas perwaliannya) dan tombol **Export Satuan** pada masing-masing baris siswa.
3. **Halaman Pratinjau & Cetak Lembar Buku Induk (`/buku-induk/:nisn/print` & `/buku-induk/kelas/:id_kelas/print`):**
   * Dapat diakses oleh `ADMIN` (semua siswa & semua kelas) dan `GURU` (khusus Wali Kelas untuk siswa/kelas perwaliannya).
   * Memiliki toolbar atas (tombol **Cetak / Simpan PDF** warna `#BE101B`, indikator jumlah siswa/halaman, dan tombol **Kembali**) yang diberi kelas `print:hidden`.
   * Kontainer dokumen meniru kertas **F4 / Folio (215mm × 330mm)** dengan latar putih bersih, hitam-putih formal, dan aturan **`page-break-after: always` di setiap akhir bagian siswa**:
     * **Halaman 1 per Siswa (Data Diri Siswa):** Kop Surat Resmi SDN Batu Ampar 12 Pagi (dari `profil_sekolah`), Judul `BUKU INDUK REGISTER PESERTA DIDIK`, kotak pas foto `3x4`, Bagian A (Keterangan Pribadi Siswa), Bagian B (Keterangan Tempat Tinggal), Bagian C (Keterangan Pendidikan Sebelumnya / Mutasi Masuk), Bagian D (Keterangan Orang Tua / Wali).
     * **Halaman 2–dst per Siswa (Nilai Rapor Siswa):** Matriks Rekapitulasi Nilai Rapor Kurikulum Merdeka milik siswa tersebut (Kelas 1 s.d. Kelas 6, Semester Ganjil & Genap) mencakup tabel Nilai Mata Pelajaran & Capaian Kompetensi, Capaian Projek Profil Pelajar Pancasila (P5), Ekstrakurikuler, Rekapitulasi Ketidakhadiran, serta blok tanda tangan Wali Kelas dan Kepala Sekolah.

### Struktur Direktori `client-buku-induk/`
```text
client-buku-induk/
├── public/
│   └── school-campus.png         # Foto gedung SDN Batu Ampar 12 Pagi (Background Login)
├── src/
│   ├── __tests__/                # Unit Tests Frontend untuk QA
│   │   ├── Login.test.jsx
│   │   ├── DataTable.test.jsx
│   │   └── BukuIndukPrint.test.jsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── DashboardLayout.jsx   # Sidebar, Topbar Realtime Clock & Greetings
│   │   │   └── ProtectedRoute.jsx    # Guard role ADMIN / GURU
│   │   ├── ui/
│   │   │   ├── StatCard.jsx
│   │   │   ├── DataTable.jsx         # Search, Filter, Pagination
│   │   │   ├── Modal.jsx
│   │   │   ├── StatusBadge.jsx
│   │   │   └── ExcelImportModal.jsx  # Upload .xlsx & download template
│   │   └── print/
│   │       └── BukuIndukPrintTemplate.jsx # Mendukung render 1 siswa maupun array siswa per kelas dengan page-break
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── DataSiswa.jsx         # CRUD + Import Excel + Export Satuan Per Siswa
│   │   │   ├── DataGuru.jsx
│   │   │   ├── DataAdmin.jsx
│   │   │   ├── ProfilSekolah.jsx
│   │   │   ├── DataKelas.jsx         # CRUD Kelas + Detail Kelas + Export Buku Induk Per Kelas
│   │   │   ├── DataMapel.jsx
│   │   │   ├── DataEkskul.jsx
│   │   │   └── ManajemenAkunPenugasan.jsx
│   │   └── guru/
│   │       ├── GuruDashboard.jsx
│   │       ├── SiswaBinaan.jsx       # Khusus Wali Kelas + Export Satuan & Export Kelas Binaan
│   │       └── InputNilaiAsesmen.jsx
│   ├── services/
│   │   └── api.js                    # Axios instance & endpoint helpers
│   ├── App.jsx
│   ├── index.css                     # CSS Variables & @media print rules
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```

---

## 05. UNIT TESTING & QA VERIFICATION SPECIFICATION

Untuk mempermudah tim QA dalam memverifikasi setiap unit terkecil program tanpa harus menguji keseluruhan alur secara manual setiap kali terjadi perubahan kode, *agentic AI* **WAJIB** menyertakan rangkaian *unit test* berikut pada kedua repositori:

### A. Backend Unit Tests (`server-buku-induk/tests/` — Jest + Supertest)
| Berkas Uji | Unit / Fungsi yang Diuji | Skenario Verifikasi QA |
| :--- | :--- | :--- |
| **`auth.test.js`** | `authController.login`, `verifyToken`, `requireRole` | 1. Login `admin`/`admin` valid menghasilkan JWT & `role: ADMIN`.<br>2. Login dengan password salah atau username tidak ditemukan mengembalikan `401 Unauthorized`.<br>3. Akses endpoint `/admin/*` menggunakan token `GURU` ditolak dengan `403 Forbidden`. |
| **`student.test.js`** | `studentController.createStudent`, `getAllStudents`, `deleteStudent` | 1. Simpan siswa baru menyisipkan data ke `siswa`, `riwayat_masuk_siswa`, dan `keluarga_siswa` secara bersamaan.<br>2. Rollback otomatis apabila salah satu tabel gagal (misal duplikat `nis`).<br>3. Query filter `search` (Nama/NIS/NISN) mengembalikan hasil sesuai kriteria. |
| **`gradeRbac.test.js`** | `gradeController.upsertNilaiMapel`, `upsertWaliKelas` | 1. Guru Mapel diizinkan menyimpan `nilai_akhir` (0–100) pada kelas & mapel yang terdaftar di `penugasan_guru_mapel`.<br>2. Guru Mapel ditolak (`403 Forbidden`) jika mencoba input nilai pada mapel/kelas yang bukan tugasnya.<br>3. Validasi menolak `nilai_akhir` di luar rentang `0–100` (`400 Bad Request`). |
| **`bukuIndukExport.test.js`** | `gradeController.getBukuIndukByNisn`, `getBukuIndukByClass` | 1. `ADMIN` diizinkan mengambil data export satuan (`:nisn`) maupun massal per kelas (`:id_kelas`) untuk semua kelas.<br>2. `GURU` yang merupakan `id_wali_kelas` diizinkan mengambil data export satuan & kelas perwaliannya.<br>3. `GURU` yang bukan wali kelas pada kelas tersebut ditolak dengan `403 Forbidden`.<br>4. Urutan data siswa pada export kelas terurut rapi berdasarkan `nis ASC`. |
| **`excelImport.test.js`** | `importController.importSiswaExcel` | 1. File `.xlsx` valid ter-parsing menjadi array objek siswa yang bersih.<br>2. Baris Excel dengan NISN kosong atau format tanggal salah tertangkap validasi dengan pesan baris error yang jelas. |

### B. Frontend Unit Tests (`client-buku-induk/src/__tests__/` — Vitest + React Testing Library)
| Berkas Uji | Komponen yang Diuji | Skenario Verifikasi QA |
| :--- | :--- | :--- |
| **`Login.test.jsx`** | `Login.jsx` | 1. Merender form input username & password beserta badge tahun ajaran dan tab 2 peran (`Operator / Admin` & `Guru`).<br>2. Menampilkan pesan error merah (`#FFF0F1`) ketika submit form kosong atau API mengembalikan `401`. |
| **`DataTable.test.jsx`** | `DataTable.jsx`, `DataKelas.jsx`, `SiswaBinaan.jsx` | 1. Fitur pencarian real-time memfilter baris tabel sesuai kata kunci.<br>2. Tombol **Export Buku Induk Kelas** tampil di halaman Detail Kelas (Admin) dan Daftar Siswa Binaan (Wali Kelas), serta tersembunyi bagi Guru non-wali kelas. |
| **`BukuIndukPrint.test.jsx`** | `BukuIndukPrintTemplate.jsx` | 1. Merender Kop Surat Sekolah, Biodata Siswa, dan Tabel Nilai Rapor sesuai prop data.<br>2. Saat menerima array multi-siswa (mode export kelas), merender seluruh siswa berurutan dengan kelas pemisah halaman (`page-break-after`). |

---

## 06. STEP-BY-STEP EXECUTION PROMPT FOR AGENTIC AI

Salin dan berikan instruksi bertahap berikut kepada *agentic AI*:

* **Prompt Tahap 1 (Database & Backend Foundation):**
  > "Baca `project.md` Bagian 01 dan 02. Buat skrip SQL lengkap pada `server-buku-induk/database/schema.sql` dan file seeder `server-buku-induk/seeders/seed.js` yang mengisi akun default `admin`/`admin`, profil SDN Batu Ampar 12 Pagi, master mata pelajaran Kurikulum Merdeka SD, dan ekstrakurikuler. Pastikan setiap fungsi memiliki komentar JSDoc ringkas."
* **Prompt Tahap 2 (Backend REST API, RBAC Export & Unit Tests):**
  > "Baca `project.md` Bagian 01, 03, 05A, dan 07. Bangun struktur lengkap `server-buku-induk/` menggunakan Express.js dan `mysql2/promise`. Implementasikan seluruh endpoint Auth, Admin (termasuk Detail Kelas & Export Buku Induk per kelas), Guru (Wali Kelas & Guru Mapel), Siswa (CRUD & Export Buku Induk satuan), Import Excel `.xlsx`, serta seluruh unit test di folder `tests/` menggunakan Jest & Supertest. Sertakan komentar JSDoc ringkas pada setiap fungsi."
* **Prompt Tahap 3 (Frontend SPA, Design Tokens, Login Background, Print Engine & Unit Tests):**
  > "Baca `project.md` Bagian 01, 04, 05B, dan 07. Bangun repositori terpisah `client-buku-induk/` menggunakan React, Vite, dan Tailwind CSS. Terapkan seluruh CSS variables palet warna pada `src/index.css`. Bangun halaman Login split-screen menggunakan gambar `/school-campus.png` sebagai background panel kiri beserta kartu glassmorphism informasi sekolah dan tab login khusus 2 peran (`Operator / Admin` dan `Guru`), Dashboard Admin (termasuk tombol Export Buku Induk per kelas di menu Data Kelas dan satuan di Data Siswa), Dashboard Guru (Siswa Binaan dengan Export satuan & per kelas khusus Wali Kelas, serta Input Nilai & Asesmen), komponen cetak `BukuIndukPrintTemplate.jsx` dengan pemisahan halaman per siswa (`page-break-after: always`) ukuran F4, dan unit test di `src/__tests__/`. Sertakan komentar JSDoc ringkas pada setiap komponen/fungsi."

---

## 07. ALUR OPERASIONAL ADMIN, GURU, DAN WALI KELAS

Bagian ini memperjelas relasi akun, penetapan Wali Kelas, penugasan mata pelajaran, dan hak akses yang wajib diikuti implementasi.

### A. Admin menambahkan Guru dan membuat akun login

1. Admin menambahkan profil Guru melalui **Administrasi → Data Guru**. Backend membuat record pada tabel `guru` dan mengembalikan `id_guru`.
2. Admin membuka **Manajemen Akun & Penugasan → Buat Akun Guru**, memilih profil Guru tersebut, lalu menetapkan username dan password awal.
3. Backend memastikan `id_guru` valid, melakukan hash password dengan `bcryptjs`, lalu membuat record `pengguna` dengan `role = 'GURU'` dan `id_referensi = id_guru`.
4. `id_guru` adalah identitas pegawai; `id_user` adalah identitas akun login. Jangan menyamakan kedua ID ini. Jangan membuat portal login untuk siswa/orang tua.

### B. Admin menetapkan Guru sebagai Wali Kelas

1. Profil Guru harus sudah ada pada menu Data Guru.
2. Admin membuka **Administrasi → Data Kelas**, lalu menambah kelas atau memilih **Ubah** pada kelas yang ada.
3. Field **Wali Kelas** harus berupa dropdown berisi nama Guru dari API, bukan input ID bebas. Admin memilih Guru dan menyimpan kelas.
4. Backend menyimpan hubungan `kelas.id_wali_kelas = guru.id_guru`. Satu kelas mempunyai paling banyak satu Wali Kelas; seorang Guru boleh menjadi Wali Kelas pada lebih dari satu kelas bila aturan sekolah mengizinkan.
5. Penetapan Wali Kelas berbeda dari penugasan Guru Mapel. Wali Kelas memperoleh akses daftar siswa binaan, input absensi/catatan/P5/ekskul, serta fitur cetak Buku Induk untuk kelas binaannya.
6. Setelah perubahan wali kelas, sesi Guru harus mendapatkan konteks terbaru. Implementasikan pemuatan ulang profil sesi melalui `GET /auth/me` atau minta Guru keluar dan masuk kembali agar menu dan akses berbasis `is_wali_kelas` tidak memakai klaim lama.

### C. Admin menugaskan Guru Mapel

1. Admin membuat data kelas dan mata pelajaran terlebih dahulu.
2. Admin membuka **Manajemen Akun & Penugasan → Penugasan Guru Mapel**, kemudian memilih Guru, kelas, mata pelajaran, dan tahun pelajaran.
3. Backend membuat relasi pada `penugasan_guru_mapel` dan menolak duplikasi kombinasi Guru-kelas-mapel-tahun.
4. `GET /auth/me` untuk Guru mengembalikan daftar `mapel_diampu` yang dipakai halaman input nilai untuk mengisi pilihan penugasan. Guru Mapel yang bukan Wali Kelas hanya memperoleh akses nilai untuk kelas/mapel/tahun yang ditugaskan, serta tidak memperoleh akses cetak Buku Induk.

### D. Guru memasukkan Nilai Akhir dan Capaian Kompetensi

1. Guru membuka **Input Nilai Asesmen**, memilih penugasan kelas-mapel dan semester.
2. Frontend memuat daftar siswa dari `GET /grades/class-sheet?id_kelas=...&tahun_pelajaran=...&semester=...`.
3. Endpoint roster harus memeriksa bahwa Guru memiliki penugasan mapel pada kelas dan tahun tersebut, atau memang Wali Kelas kelas itu. Query mengembalikan hanya siswa berstatus `AKTIF` dalam kelas terpilih, terurut menurut `nis`, beserta metadata kelas yang diperlukan saat menyimpan rapor (`nama_kelas`, `tingkat`, `fase`, `tahun_pelajaran`). Jika join nilai menyebabkan lebih dari satu baris untuk siswa yang sama, frontend menghilangkan duplikasi berdasarkan `nisn`.
4. **Jangan memakai `GET /students` sebagai sumber roster Input Nilai Guru Mapel.** Endpoint tersebut memang membatasi akses Guru ke siswa kelas perwaliannya saja. Guru Mapel non-Wali Kelas akan melihat roster kosong dari endpoint itu walaupun penugasan mapelnya valid.
5. Saat frontend mengirim `POST /grades/mapel`, backend memvalidasi penugasan tepat untuk Guru, kelas, mapel, dan tahun pelajaran; memvalidasi bahwa siswa masih aktif pada kelas tersebut; menolak nilai di luar 0–100 dengan `400`; dan menolak penugasan yang tidak cocok dengan `403`.
6. Record rapor semester dan nilai mapel disimpan secara idempoten/upsert berdasarkan siswa, tahun ajaran, semester, dan mapel agar penyuntingan nilai tidak membuat duplikasi.

### E. Wali Kelas mengisi Asesmen dan mencetak Buku Induk

1. Frontend menampilkan **Siswa Binaan** dan **Asesmen Wali Kelas** hanya untuk Guru yang punya hubungan wali kelas aktif.
2. Wali Kelas memilih siswa dari kelas binaannya dan mengisi sakit, izin, tanpa keterangan, catatan wali kelas, dimensi/elemen/sub-elemen P5, dan ekstrakurikuler.
3. `POST /grades/wali-kelas` memvalidasi `kelas.id_wali_kelas` terhadap `req.user.id_referensi`. Semua perubahan rapor, P5, dan ekstrakurikuler disimpan dalam satu transaksi.
4. Export satu siswa memakai `GET /students/:nisn/buku-induk`; export kelas memakai `GET /classes/:id_kelas/export-buku-induk`. Admin dapat mencetak semua kelas; Guru hanya boleh mencetak kelas perwaliannya.
5. Export kelas mengurutkan siswa aktif berdasarkan NIS dan me-render dua atau lebih halaman per siswa: halaman data diri serta halaman rapor/P5/ekskul/absensi. Setiap siswa harus dimulai pada pemisah halaman cetak yang baru.

### F. Matriks akses ringkas

| Kemampuan | ADMIN | GURU Mapel | Wali Kelas |
|---|---:|---:|---:|
| Mengelola profil Guru, akun Guru, kelas, mapel, ekskul, dan profil sekolah | Ya | Tidak | Tidak |
| Menetapkan Wali Kelas pada kelas | Ya | Tidak | Tidak |
| Membuat penugasan Guru Mapel | Ya | Tidak | Tidak |
| Melihat daftar siswa pada kelas yang diajar | Semua kelas | Kelas dengan penugasan mapel | Kelas binaan |
| Input nilai mapel | Semua (sesuai kebijakan) | Kelas-mapel-tahun yang ditugaskan | Kelas-mapel-tahun yang ditugaskan |
| Input absensi, catatan wali, P5, dan ekskul | Ya | Tidak kecuali juga Wali Kelas | Kelas binaan |
| Cetak Buku Induk satu siswa/kelas | Semua siswa/kelas | Tidak, kecuali juga Wali Kelas untuk kelas binaannya | Kelas binaan |

---

## 08. ATURAN PEMULIHAN STRUKTUR DAN PROMPT IMPLEMENTASI ULANG

Project harus tetap terdiri dari dua aplikasi berdiri sendiri dengan nama folder persis `server-buku-induk/` dan `client-buku-induk/`. Jangan membuat folder duplikat bernama `backend/` atau `frontend/`, jangan memindahkan seluruh project ke monorepo, dan jangan meninggalkan placeholder/mock untuk endpoint inti. Kedua aplikasi harus memiliki `package.json` masing-masing dan dokumentasi setup.

Saat menghasilkan ulang project, ikuti urutan berikut:

1. Buat DDL seluruh 15 tabel dan seeder admin/profil sekolah/mapel/ekskul.
2. Implementasikan backend penuh beserta transaksi siswa, relasi Guru-akun-Wali Kelas-penugasan mapel, RBAC, import, roster nilai, asesmen Wali Kelas, dan endpoint cetak Buku Induk.
3. Implementasikan frontend yang mengonsumsi API backend: halaman admin untuk master data dan penetapan Wali Kelas, manajemen akun/penugasan mapel, halaman Guru/Wali Kelas, Input Nilai yang mengambil roster dari `GET /grades/class-sheet`, asesmen Wali Kelas, serta preview/cetak Buku Induk.
4. Tambahkan seluruh skenario pengujian pada Bagian 05. Jalankan `npm test` di kedua project dan selesaikan kegagalan sebelum menyatakan selesai.
5. Validasi alur end-to-end minimal: Admin membuat Guru → membuat akun Guru → menetapkan Wali Kelas/penugasan mapel → Guru login → roster kelas tampil pada input nilai → nilai tersimpan → Wali Kelas mencetak Buku Induk.

### Prompt implementasi ulang terpadu

> Baca seluruh `project.md`, termasuk Bagian 04, 07, dan 08. Bangun ulang sistem E-Buku Induk secara lengkap dengan dua project mandiri bernama persis `server-buku-induk/` dan `client-buku-induk/`. Jangan membuat folder `frontend/` atau `backend/`. Terapkan seluruh skema database, seeder, endpoint, RBAC, UI Login split-screen dengan background foto `/school-campus.png` (khusus 2 peran: Operator/Admin dan Guru, tanpa tab Murid/SSO), UI Admin dan Guru/Wali Kelas, pengelolaan akun dan penetapan wali kelas lewat dropdown nama guru, penugasan mapel, input nilai dengan roster dari `GET /grades/class-sheet`, asesmen wali, import Excel, export/cetak Buku Induk F4 per siswa maupun per kelas, dan tes yang diwajibkan. Pastikan Guru Mapel non-Wali Kelas tetap dapat melihat roster siswa dari kelas-mapel-tahun yang ditugaskan; jangan mengambil roster form Input Nilai dari endpoint `/students` karena endpoint itu khusus lingkup Wali Kelas. Implementasikan hubungan akun `pengguna.id_referensi → guru.id_guru` dan wali kelas `kelas.id_wali_kelas → guru.id_guru` secara konsisten. Jalankan seluruh tes kedua project dan laporkan hasilnya beserta instruksi setup.