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
