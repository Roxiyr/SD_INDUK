-- ============================================================================
-- SKRIP DDL & SEED DATA: SISTEM INFORMASI BUKU INDUK SISWA (WEB INTRANET)
-- Mitra   : SDN Batu Ampar 12 Pagi, Kramat Jati, Jakarta Timur
-- Engine  : MySQL 8.0+ / MariaDB 10.4+ (InnoDB, utf8mb4)
-- Database: db_buku_induk_sdn12 (siap diimpor melalui phpMyAdmin XAMPP)
-- PERINGATAN: skrip ini menghapus lalu membuat ulang tabel beserta seed data.
--             Gunakan hanya untuk database baru/pengujian, bukan database produksi.
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `db_buku_induk_sdn12`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE `db_buku_induk_sdn12`;

SET NAMES utf8mb4;
SET time_zone = '+07:00';
SET FOREIGN_KEY_CHECKS = 0;

-- Hapus tabel lama jika sudah ada (urutan anak ke induk)
DROP TABLE IF EXISTS `nilai_asesmen`;
DROP TABLE IF EXISTS `asesmen`;
DROP TABLE IF EXISTS `presensi_harian`;
DROP TABLE IF EXISTS `jadwal_pelajaran`;
DROP TABLE IF EXISTS `riwayat_verifikasi_rapor`;
DROP TABLE IF EXISTS `dokumen_siswa`;
DROP TABLE IF EXISTS `pengajuan_perubahan_data`;
DROP TABLE IF EXISTS `pengumuman_agenda`;
DROP TABLE IF EXISTS `audit_log`;
DROP TABLE IF EXISTS `penugasan_guru`;
DROP TABLE IF EXISTS `siswa_kelas`;
DROP TABLE IF EXISTS `guru`;
DROP TABLE IF EXISTS `mata_pelajaran`;
DROP TABLE IF EXISTS `kelas`;
DROP TABLE IF EXISTS `tahun_ajaran`;
DROP TABLE IF EXISTS `profil_sekolah`;
DROP TABLE IF EXISTS `nilai_ekstrakurikuler`;
DROP TABLE IF EXISTS `profil_pancasila`;
DROP TABLE IF EXISTS `nilai_mapel`;
DROP TABLE IF EXISTS `rapor_capaian`;
DROP TABLE IF EXISTS `riwayat_keluar_siswa`;
DROP TABLE IF EXISTS `riwayat_masuk_siswa`;
DROP TABLE IF EXISTS `keluarga_siswa`;
DROP TABLE IF EXISTS `pengguna`;
DROP TABLE IF EXISTS `siswa`;

-- ============================================================================
-- 1. TABEL MASTER SISWA (Data Statis & Status Keaktifan)
-- ============================================================================
CREATE TABLE `siswa` (
  `nisn` VARCHAR(10) NOT NULL,
  `nis` VARCHAR(20) NOT NULL,
  `nik` VARCHAR(16) NOT NULL,
  `no_kk` VARCHAR(16) NOT NULL,
  `nama_lengkap` VARCHAR(100) NOT NULL,
  `nama_panggilan` VARCHAR(50) DEFAULT NULL,
  `jenis_kelamin` ENUM('L', 'P') NOT NULL,
  `tempat_lahir` VARCHAR(50) NOT NULL,
  `tanggal_lahir` DATE NOT NULL,
  `agama` VARCHAR(20) NOT NULL,
  `kewarganegaraan` VARCHAR(30) NOT NULL DEFAULT 'Indonesia',
  `jumlah_saudara` INT NOT NULL DEFAULT 0,
  `bahasa_sehari_hari` VARCHAR(50) DEFAULT NULL,
  `golongan_darah` VARCHAR(3) DEFAULT NULL,
  `alamat` TEXT NOT NULL,
  `nomor_telepon` VARCHAR(15) DEFAULT NULL,
  `bertempat_tinggal_pada` VARCHAR(100) DEFAULT NULL,
  `jarak_sekolah` VARCHAR(50) DEFAULT NULL,
  `status_siswa` ENUM('Aktif', 'Lulus', 'Pindah', 'Keluar') NOT NULL DEFAULT 'Aktif',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`nisn`),
  UNIQUE KEY `uq_siswa_nis` (`nis`),
  UNIQUE KEY `uq_siswa_nik` (`nik`),
  KEY `idx_siswa_nama` (`nama_lengkap`),
  KEY `idx_siswa_status` (`status_siswa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 2. TABEL PENGGUNA (Autentikasi & RBAC 3 Aktor: OPERATOR, GURU, SISWA)
-- ============================================================================
CREATE TABLE `pengguna` (
  `id_user` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('OPERATOR', 'GURU', 'SISWA') NOT NULL,
  `nama_lengkap` VARCHAR(100) NOT NULL,
  `nisn` VARCHAR(10) DEFAULT NULL COMMENT 'Diisi jika role = SISWA untuk mengikat akses read-only ke data siswa terkait',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_user`),
  UNIQUE KEY `uq_pengguna_username` (`username`),
  UNIQUE KEY `uq_pengguna_nisn` (`nisn`),
  CONSTRAINT `fk_pengguna_siswa`
    FOREIGN KEY (`nisn`) REFERENCES `siswa` (`nisn`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 3. TABEL KELUARGA SISWA (Data Orang Tua Kandung & Wali)
-- ============================================================================
CREATE TABLE `keluarga_siswa` (
  `id_keluarga` INT NOT NULL AUTO_INCREMENT,
  `nisn` VARCHAR(10) NOT NULL,
  `nama_ayah` VARCHAR(100) NOT NULL,
  `pendidikan_ayah` VARCHAR(50) DEFAULT NULL,
  `pekerjaan_ayah` VARCHAR(50) DEFAULT NULL,
  `nama_ibu` VARCHAR(100) NOT NULL,
  `pendidikan_ibu` VARCHAR(50) DEFAULT NULL,
  `pekerjaan_ibu` VARCHAR(50) DEFAULT NULL,
  `nama_wali` VARCHAR(100) DEFAULT NULL,
  `hubungan_wali` VARCHAR(50) DEFAULT NULL,
  `pendidikan_wali` VARCHAR(50) DEFAULT NULL,
  `pekerjaan_wali` VARCHAR(50) DEFAULT NULL,
  PRIMARY KEY (`id_keluarga`),
  UNIQUE KEY `uq_keluarga_nisn` (`nisn`),
  CONSTRAINT `fk_keluarga_siswa`
    FOREIGN KEY (`nisn`) REFERENCES `siswa` (`nisn`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 4. TABEL RIWAYAT MASUK SISWA (Siswa Baru Asal TK / Siswa Pindahan)
-- ============================================================================
CREATE TABLE `riwayat_masuk_siswa` (
  `id_riwayat` INT NOT NULL AUTO_INCREMENT,
  `nisn` VARCHAR(10) NOT NULL,
  `status_masuk` ENUM('Baru', 'Pindahan') NOT NULL,
  `asal_tk_nama` VARCHAR(100) DEFAULT NULL,
  `tgl_sttb_tk` DATE DEFAULT NULL,
  `no_sttb_tk` VARCHAR(50) DEFAULT NULL,
  `asal_sekolah_pindahan` VARCHAR(100) DEFAULT NULL,
  `dari_tingkat` INT DEFAULT NULL,
  `tgl_diterima` DATE DEFAULT NULL,
  PRIMARY KEY (`id_riwayat`),
  UNIQUE KEY `uq_riwayat_masuk_nisn` (`nisn`),
  CONSTRAINT `fk_riwayat_masuk_siswa`
    FOREIGN KEY (`nisn`) REFERENCES `siswa` (`nisn`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 5. TABEL RIWAYAT KELUAR SISWA (Kelulusan Kelas 6 / Mutasi Pindah Keluar)
-- ============================================================================
CREATE TABLE `riwayat_keluar_siswa` (
  `id_riwayat_keluar` INT NOT NULL AUTO_INCREMENT,
  `nisn` VARCHAR(10) NOT NULL,
  `status_keluar` ENUM('Lulus', 'Pindah', 'Keluar') NOT NULL,
  `tanggal_keluar` DATE NOT NULL,
  `no_ijazah_sttb` VARCHAR(50) DEFAULT NULL,
  `sekolah_lanjutan_tujuan` VARCHAR(100) DEFAULT NULL,
  `alasan_keluar` TEXT DEFAULT NULL,
  PRIMARY KEY (`id_riwayat_keluar`),
  UNIQUE KEY `uq_riwayat_keluar_nisn` (`nisn`),
  CONSTRAINT `fk_riwayat_keluar_siswa`
    FOREIGN KEY (`nisn`) REFERENCES `siswa` (`nisn`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 6. TABEL RAPOR CAPAIAN (Header Rapor Per Semester & Rekap Presensi)
-- ============================================================================
CREATE TABLE `rapor_capaian` (
  `id_rapor` INT NOT NULL AUTO_INCREMENT,
  `nisn` VARCHAR(10) NOT NULL,
  `id_user` INT NOT NULL COMMENT 'ID Guru yang menginput/memverifikasi rapor',
  `kelas` VARCHAR(10) NOT NULL,
  `fase` ENUM('A', 'B', 'C') NOT NULL,
  `semester` ENUM('Ganjil', 'Genap') NOT NULL,
  `tahun_pelajaran` VARCHAR(10) NOT NULL,
  `absensi_sakit` INT NOT NULL DEFAULT 0,
  `absensi_izin` INT NOT NULL DEFAULT 0,
  `absensi_tanpa_ket` INT NOT NULL DEFAULT 0,
  `catatan_wali_kelas` TEXT DEFAULT NULL,
  `keputusan_akhir` VARCHAR(50) DEFAULT NULL COMMENT 'Contoh: Naik ke Kelas IV / Lulus',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_rapor`),
  UNIQUE KEY `uq_rapor_siswa_periode` (`nisn`, `semester`, `tahun_pelajaran`),
  KEY `idx_rapor_user` (`id_user`),
  CONSTRAINT `fk_rapor_siswa`
    FOREIGN KEY (`nisn`) REFERENCES `siswa` (`nisn`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_rapor_pengguna`
    FOREIGN KEY (`id_user`) REFERENCES `pengguna` (`id_user`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 7. TABEL NILAI MATA PELAJARAN (Kurikulum Merdeka)
-- ============================================================================
CREATE TABLE `nilai_mapel` (
  `id_nilai_mapel` INT NOT NULL AUTO_INCREMENT,
  `id_rapor` INT NOT NULL,
  `kategori_mapel` VARCHAR(50) NOT NULL COMMENT 'Wajib, Muatan Lokal, Pilihan',
  `nama_mapel` VARCHAR(100) NOT NULL,
  `nilai_akhir` INT NOT NULL,
  `capaian_kompetensi` TEXT DEFAULT NULL,
  PRIMARY KEY (`id_nilai_mapel`),
  KEY `idx_nilai_mapel_rapor` (`id_rapor`),
  CONSTRAINT `fk_nilai_mapel_rapor`
    FOREIGN KEY (`id_rapor`) REFERENCES `rapor_capaian` (`id_rapor`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 8. TABEL PROFIL PELAJAR PANCASILA / P5
-- ============================================================================
CREATE TABLE `profil_pancasila` (
  `id_profil` INT NOT NULL AUTO_INCREMENT,
  `id_rapor` INT NOT NULL,
  `dimensi` VARCHAR(100) NOT NULL,
  `elemen` VARCHAR(100) NOT NULL,
  `sub_elemen` VARCHAR(100) NOT NULL,
  `target_pencapaian` ENUM('BB', 'MB', 'BSH', 'SB') NOT NULL,
  PRIMARY KEY (`id_profil`),
  KEY `idx_p5_rapor` (`id_rapor`),
  CONSTRAINT `fk_p5_rapor`
    FOREIGN KEY (`id_rapor`) REFERENCES `rapor_capaian` (`id_rapor`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 9. TABEL NILAI EKSTRAKURIKULER (4 Rumpun Ekskul Sekolah)
-- ============================================================================
CREATE TABLE `nilai_ekstrakurikuler` (
  `id_ekskul` INT NOT NULL AUTO_INCREMENT,
  `id_rapor` INT NOT NULL,
  `rumpun_ekskul` ENUM('Krida', 'Karya Ilmiah', 'Latihan Olah Bakat dan Minat', 'Keagamaan') NOT NULL,
  `nama_ekskul` VARCHAR(100) NOT NULL,
  `predikat` ENUM('Sangat Baik', 'Baik', 'Cukup') NOT NULL,
  `keterangan` TEXT DEFAULT NULL,
  PRIMARY KEY (`id_ekskul`),
  KEY `idx_ekskul_rapor` (`id_rapor`),
  CONSTRAINT `fk_ekskul_rapor`
    FOREIGN KEY (`id_rapor`) REFERENCES `rapor_capaian` (`id_rapor`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 10. TAHUN AJARAN, KELAS, DAN RIWAYAT PENEMPATAN SISWA
-- ============================================================================
CREATE TABLE `tahun_ajaran` (
  `id_tahun_ajaran` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nama_tahun_ajaran` VARCHAR(9) NOT NULL,
  `tanggal_mulai` DATE DEFAULT NULL,
  `tanggal_selesai` DATE DEFAULT NULL,
  `status` ENUM('Persiapan', 'Aktif', 'Selesai') NOT NULL DEFAULT 'Persiapan',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_tahun_ajaran`),
  UNIQUE KEY `uq_tahun_ajaran_nama` (`nama_tahun_ajaran`),
  KEY `idx_tahun_ajaran_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `kelas` (
  `id_kelas` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_tahun_ajaran` SMALLINT UNSIGNED NOT NULL,
  `nama_kelas` VARCHAR(20) NOT NULL,
  `tingkat` TINYINT UNSIGNED NOT NULL,
  `fase` ENUM('A', 'B', 'C') NOT NULL,
  `kapasitas` SMALLINT UNSIGNED NOT NULL DEFAULT 32,
  `ruang` VARCHAR(50) DEFAULT NULL,
  `status` ENUM('Aktif', 'Nonaktif') NOT NULL DEFAULT 'Aktif',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_kelas`),
  UNIQUE KEY `uq_kelas_tahun_nama` (`id_tahun_ajaran`, `nama_kelas`),
  UNIQUE KEY `uq_kelas_id_tahun` (`id_kelas`, `id_tahun_ajaran`),
  KEY `idx_kelas_tingkat` (`tingkat`),
  CONSTRAINT `fk_kelas_tahun_ajaran`
    FOREIGN KEY (`id_tahun_ajaran`) REFERENCES `tahun_ajaran` (`id_tahun_ajaran`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `siswa_kelas` (
  `id_siswa_kelas` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nisn` VARCHAR(10) NOT NULL,
  `id_kelas` INT UNSIGNED NOT NULL,
  `id_tahun_ajaran` SMALLINT UNSIGNED NOT NULL,
  `tanggal_mulai` DATE NOT NULL,
  `tanggal_selesai` DATE DEFAULT NULL,
  `status` ENUM('Aktif', 'Pindah', 'Naik Kelas', 'Lulus', 'Keluar') NOT NULL DEFAULT 'Aktif',
  `catatan` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_siswa_kelas`),
  UNIQUE KEY `uq_siswa_kelas_mulai` (`nisn`, `id_tahun_ajaran`, `tanggal_mulai`),
  KEY `idx_siswa_kelas_tahun_kelas` (`id_tahun_ajaran`, `id_kelas`),
  KEY `idx_siswa_kelas_nisn` (`nisn`),
  CONSTRAINT `fk_siswa_kelas_siswa`
    FOREIGN KEY (`nisn`) REFERENCES `siswa` (`nisn`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_siswa_kelas_kelas_tahun`
    FOREIGN KEY (`id_kelas`, `id_tahun_ajaran`) REFERENCES `kelas` (`id_kelas`, `id_tahun_ajaran`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 11. PROFIL GURU, MATA PELAJARAN, PENUGASAN, DAN JADWAL
-- ============================================================================
CREATE TABLE `guru` (
  `id_guru` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_user` INT DEFAULT NULL,
  `nip` VARCHAR(30) DEFAULT NULL,
  `nuptk` VARCHAR(30) DEFAULT NULL,
  `nama_lengkap` VARCHAR(100) NOT NULL,
  `gelar_depan` VARCHAR(30) DEFAULT NULL,
  `gelar_belakang` VARCHAR(50) DEFAULT NULL,
  `nomor_telepon` VARCHAR(20) DEFAULT NULL,
  `email` VARCHAR(100) DEFAULT NULL,
  `status` ENUM('Aktif', 'Nonaktif') NOT NULL DEFAULT 'Aktif',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_guru`),
  UNIQUE KEY `uq_guru_user` (`id_user`),
  UNIQUE KEY `uq_guru_nip` (`nip`),
  UNIQUE KEY `uq_guru_nuptk` (`nuptk`),
  CONSTRAINT `fk_guru_pengguna`
    FOREIGN KEY (`id_user`) REFERENCES `pengguna` (`id_user`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `mata_pelajaran` (
  `id_mapel` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `kode_mapel` VARCHAR(30) DEFAULT NULL,
  `nama_mapel` VARCHAR(100) NOT NULL,
  `kategori` VARCHAR(50) NOT NULL DEFAULT 'Wajib',
  `status` ENUM('Aktif', 'Nonaktif') NOT NULL DEFAULT 'Aktif',
  PRIMARY KEY (`id_mapel`),
  UNIQUE KEY `uq_mapel_kode` (`kode_mapel`),
  KEY `idx_mapel_nama` (`nama_mapel`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `penugasan_guru` (
  `id_penugasan` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_guru` INT UNSIGNED NOT NULL,
  `id_kelas` INT UNSIGNED NOT NULL,
  `id_tahun_ajaran` SMALLINT UNSIGNED NOT NULL,
  `id_mapel` INT UNSIGNED DEFAULT NULL,
  `peran` ENUM('Wali Kelas', 'Guru Mapel') NOT NULL,
  `tanggal_mulai` DATE DEFAULT NULL,
  `tanggal_selesai` DATE DEFAULT NULL,
  `status` ENUM('Aktif', 'Selesai') NOT NULL DEFAULT 'Aktif',
  PRIMARY KEY (`id_penugasan`),
  KEY `idx_penugasan_guru` (`id_guru`, `status`),
  KEY `idx_penugasan_kelas` (`id_kelas`, `id_tahun_ajaran`),
  CONSTRAINT `fk_penugasan_guru`
    FOREIGN KEY (`id_guru`) REFERENCES `guru` (`id_guru`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `fk_penugasan_kelas_tahun`
    FOREIGN KEY (`id_kelas`, `id_tahun_ajaran`) REFERENCES `kelas` (`id_kelas`, `id_tahun_ajaran`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `fk_penugasan_mapel`
    FOREIGN KEY (`id_mapel`) REFERENCES `mata_pelajaran` (`id_mapel`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `jadwal_pelajaran` (
  `id_jadwal` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_kelas` INT UNSIGNED NOT NULL,
  `id_tahun_ajaran` SMALLINT UNSIGNED NOT NULL,
  `id_guru` INT UNSIGNED NOT NULL,
  `id_mapel` INT UNSIGNED NOT NULL,
  `hari` ENUM('Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu') NOT NULL,
  `jam_mulai` TIME NOT NULL,
  `jam_selesai` TIME NOT NULL,
  `ruang` VARCHAR(50) DEFAULT NULL,
  `status` ENUM('Aktif', 'Nonaktif') NOT NULL DEFAULT 'Aktif',
  PRIMARY KEY (`id_jadwal`),
  KEY `idx_jadwal_kelas_hari` (`id_kelas`, `id_tahun_ajaran`, `hari`, `jam_mulai`),
  KEY `idx_jadwal_guru_hari` (`id_guru`, `hari`, `jam_mulai`),
  CONSTRAINT `fk_jadwal_kelas_tahun`
    FOREIGN KEY (`id_kelas`, `id_tahun_ajaran`) REFERENCES `kelas` (`id_kelas`, `id_tahun_ajaran`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `fk_jadwal_guru`
    FOREIGN KEY (`id_guru`) REFERENCES `guru` (`id_guru`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `fk_jadwal_mapel`
    FOREIGN KEY (`id_mapel`) REFERENCES `mata_pelajaran` (`id_mapel`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 12. PRESENSI HARIAN DAN ASESMEN GURU
-- ============================================================================
CREATE TABLE `presensi_harian` (
  `id_presensi` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nisn` VARCHAR(10) NOT NULL,
  `id_kelas` INT UNSIGNED NOT NULL,
  `id_tahun_ajaran` SMALLINT UNSIGNED NOT NULL,
  `tanggal` DATE NOT NULL,
  `status_kehadiran` ENUM('Hadir', 'Sakit', 'Izin', 'Alpa') NOT NULL,
  `keterangan` VARCHAR(255) DEFAULT NULL,
  `dicatat_oleh` INT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_presensi`),
  UNIQUE KEY `uq_presensi_siswa_tanggal` (`nisn`, `tanggal`),
  KEY `idx_presensi_kelas_tanggal` (`id_kelas`, `id_tahun_ajaran`, `tanggal`),
  CONSTRAINT `fk_presensi_siswa`
    FOREIGN KEY (`nisn`) REFERENCES `siswa` (`nisn`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_presensi_kelas_tahun`
    FOREIGN KEY (`id_kelas`, `id_tahun_ajaran`) REFERENCES `kelas` (`id_kelas`, `id_tahun_ajaran`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `fk_presensi_pencatat`
    FOREIGN KEY (`dicatat_oleh`) REFERENCES `pengguna` (`id_user`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `asesmen` (
  `id_asesmen` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_kelas` INT UNSIGNED NOT NULL,
  `id_tahun_ajaran` SMALLINT UNSIGNED NOT NULL,
  `id_guru` INT UNSIGNED NOT NULL,
  `id_mapel` INT UNSIGNED NOT NULL,
  `judul` VARCHAR(150) NOT NULL,
  `jenis` ENUM('Formatif', 'Sumatif', 'Proyek', 'Lainnya') NOT NULL DEFAULT 'Formatif',
  `tanggal` DATE DEFAULT NULL,
  `nilai_maksimum` DECIMAL(6,2) NOT NULL DEFAULT 100.00,
  `bobot` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `status` ENUM('Draf', 'Diterbitkan', 'Ditutup') NOT NULL DEFAULT 'Draf',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_asesmen`),
  KEY `idx_asesmen_kelas_mapel` (`id_kelas`, `id_tahun_ajaran`, `id_mapel`),
  KEY `idx_asesmen_guru` (`id_guru`),
  CONSTRAINT `fk_asesmen_kelas_tahun`
    FOREIGN KEY (`id_kelas`, `id_tahun_ajaran`) REFERENCES `kelas` (`id_kelas`, `id_tahun_ajaran`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `fk_asesmen_guru`
    FOREIGN KEY (`id_guru`) REFERENCES `guru` (`id_guru`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `fk_asesmen_mapel`
    FOREIGN KEY (`id_mapel`) REFERENCES `mata_pelajaran` (`id_mapel`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `nilai_asesmen` (
  `id_nilai_asesmen` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_asesmen` BIGINT UNSIGNED NOT NULL,
  `nisn` VARCHAR(10) NOT NULL,
  `nilai` DECIMAL(6,2) DEFAULT NULL,
  `catatan` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_nilai_asesmen`),
  UNIQUE KEY `uq_nilai_asesmen_siswa` (`id_asesmen`, `nisn`),
  KEY `idx_nilai_asesmen_nisn` (`nisn`),
  CONSTRAINT `fk_nilai_asesmen_asesmen`
    FOREIGN KEY (`id_asesmen`) REFERENCES `asesmen` (`id_asesmen`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_nilai_asesmen_siswa`
    FOREIGN KEY (`nisn`) REFERENCES `siswa` (`nisn`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 13. DOKUMEN, PENGAJUAN PERUBAHAN, DAN VERIFIKASI RAPOR
-- ============================================================================
CREATE TABLE `dokumen_siswa` (
  `id_dokumen` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nisn` VARCHAR(10) NOT NULL,
  `jenis_dokumen` VARCHAR(80) NOT NULL,
  `nama_file` VARCHAR(255) NOT NULL,
  `lokasi_file` VARCHAR(512) NOT NULL COMMENT 'Path atau key object storage, bukan isi file',
  `mime_type` VARCHAR(100) DEFAULT NULL,
  `ukuran_byte` BIGINT UNSIGNED DEFAULT NULL,
  `status_verifikasi` ENUM('Menunggu', 'Terverifikasi', 'Ditolak') NOT NULL DEFAULT 'Menunggu',
  `diunggah_oleh` INT DEFAULT NULL,
  `diverifikasi_oleh` INT DEFAULT NULL,
  `catatan_verifikasi` TEXT DEFAULT NULL,
  `diunggah_pada` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `diverifikasi_pada` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id_dokumen`),
  KEY `idx_dokumen_siswa_status` (`nisn`, `status_verifikasi`),
  CONSTRAINT `fk_dokumen_siswa`
    FOREIGN KEY (`nisn`) REFERENCES `siswa` (`nisn`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_dokumen_pengunggah`
    FOREIGN KEY (`diunggah_oleh`) REFERENCES `pengguna` (`id_user`)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT `fk_dokumen_verifikator`
    FOREIGN KEY (`diverifikasi_oleh`) REFERENCES `pengguna` (`id_user`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `pengajuan_perubahan_data` (
  `id_pengajuan` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nisn` VARCHAR(10) NOT NULL,
  `id_pemohon` INT NOT NULL,
  `jenis_perubahan` VARCHAR(80) NOT NULL,
  `data_sebelum` JSON DEFAULT NULL,
  `data_diajukan` JSON NOT NULL,
  `status` ENUM('Menunggu', 'Disetujui', 'Ditolak', 'Dibatalkan') NOT NULL DEFAULT 'Menunggu',
  `id_peninjau` INT DEFAULT NULL,
  `catatan_peninjau` TEXT DEFAULT NULL,
  `diajukan_pada` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ditinjau_pada` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id_pengajuan`),
  KEY `idx_pengajuan_status_tanggal` (`status`, `diajukan_pada`),
  KEY `idx_pengajuan_nisn` (`nisn`),
  CONSTRAINT `fk_pengajuan_siswa`
    FOREIGN KEY (`nisn`) REFERENCES `siswa` (`nisn`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_pengajuan_pemohon`
    FOREIGN KEY (`id_pemohon`) REFERENCES `pengguna` (`id_user`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `fk_pengajuan_peninjau`
    FOREIGN KEY (`id_peninjau`) REFERENCES `pengguna` (`id_user`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `riwayat_verifikasi_rapor` (
  `id_verifikasi` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_rapor` INT NOT NULL,
  `id_user` INT DEFAULT NULL,
  `status` ENUM('Diajukan', 'Perlu Revisi', 'Disetujui', 'Ditolak') NOT NULL,
  `catatan` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_verifikasi`),
  KEY `idx_verifikasi_rapor_waktu` (`id_rapor`, `created_at`),
  CONSTRAINT `fk_verifikasi_rapor`
    FOREIGN KEY (`id_rapor`) REFERENCES `rapor_capaian` (`id_rapor`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_verifikasi_user`
    FOREIGN KEY (`id_user`) REFERENCES `pengguna` (`id_user`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 14. INFORMASI SEKOLAH, PENGUMUMAN, DAN AUDIT
-- ============================================================================
CREATE TABLE `profil_sekolah` (
  `id_profil_sekolah` TINYINT UNSIGNED NOT NULL DEFAULT 1,
  `npsn` VARCHAR(20) DEFAULT NULL,
  `nama_sekolah` VARCHAR(150) NOT NULL,
  `alamat` TEXT DEFAULT NULL,
  `nomor_telepon` VARCHAR(30) DEFAULT NULL,
  `email` VARCHAR(100) DEFAULT NULL,
  `nama_kepala_sekolah` VARCHAR(120) DEFAULT NULL,
  `logo_lokasi` VARCHAR(512) DEFAULT NULL,
  `updated_by` INT DEFAULT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_profil_sekolah`),
  CONSTRAINT `fk_profil_sekolah_user`
    FOREIGN KEY (`updated_by`) REFERENCES `pengguna` (`id_user`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `pengumuman_agenda` (
  `id_informasi` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `jenis` ENUM('Pengumuman', 'Agenda') NOT NULL,
  `judul` VARCHAR(180) NOT NULL,
  `isi` TEXT NOT NULL,
  `target` ENUM('Semua', 'Guru', 'Siswa', 'Kelas') NOT NULL DEFAULT 'Semua',
  `id_kelas` INT UNSIGNED DEFAULT NULL,
  `mulai_pada` DATETIME DEFAULT NULL,
  `selesai_pada` DATETIME DEFAULT NULL,
  `status` ENUM('Draf', 'Terbit', 'Arsip') NOT NULL DEFAULT 'Draf',
  `dibuat_oleh` INT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_informasi`),
  KEY `idx_informasi_status_waktu` (`status`, `mulai_pada`),
  KEY `idx_informasi_kelas` (`id_kelas`),
  CONSTRAINT `fk_informasi_kelas`
    FOREIGN KEY (`id_kelas`) REFERENCES `kelas` (`id_kelas`)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT `fk_informasi_pembuat`
    FOREIGN KEY (`dibuat_oleh`) REFERENCES `pengguna` (`id_user`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `audit_log` (
  `id_audit` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_user` INT DEFAULT NULL,
  `aksi` VARCHAR(80) NOT NULL,
  `entitas` VARCHAR(80) NOT NULL,
  `id_entitas` VARCHAR(100) DEFAULT NULL,
  `data_sebelum` JSON DEFAULT NULL,
  `data_sesudah` JSON DEFAULT NULL,
  `alamat_ip` VARCHAR(45) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_audit`),
  KEY `idx_audit_user_waktu` (`id_user`, `created_at`),
  KEY `idx_audit_entitas` (`entitas`, `id_entitas`),
  KEY `idx_audit_waktu` (`created_at`),
  CONSTRAINT `fk_audit_pengguna`
    FOREIGN KEY (`id_user`) REFERENCES `pengguna` (`id_user`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Relasi rapor ke kelas dan tahun ajaran; kolom teks lama dipertahankan
-- sementara agar kompatibel dengan data serta API yang sudah ada.
ALTER TABLE `rapor_capaian`
  ADD COLUMN `id_tahun_ajaran` SMALLINT UNSIGNED DEFAULT NULL AFTER `tahun_pelajaran`,
  ADD COLUMN `id_kelas` INT UNSIGNED DEFAULT NULL AFTER `id_tahun_ajaran`,
  ADD KEY `idx_rapor_kelas_tahun` (`id_kelas`, `id_tahun_ajaran`),
  ADD CONSTRAINT `fk_rapor_tahun_ajaran`
    FOREIGN KEY (`id_tahun_ajaran`) REFERENCES `tahun_ajaran` (`id_tahun_ajaran`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_rapor_kelas_tahun`
    FOREIGN KEY (`id_kelas`, `id_tahun_ajaran`) REFERENCES `kelas` (`id_kelas`, `id_tahun_ajaran`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- AKUN AWAL UNTUK PENGUJIAN LOGIN (TANPA DATA PROFIL SISWA/GURU)
-- Password default seluruh akun contoh di bawah adalah: "password"
-- (Hash Bcrypt 10 rounds: $2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi)
-- ============================================================================

INSERT INTO `pengguna` (`username`, `password`, `role`, `nama_lengkap`, `nisn`) VALUES
('operator.sdn12', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'OPERATOR', 'Admin Operator SDN Batu Ampar 12 Pagi', NULL),
('guru.kelas4a', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'GURU', 'Siti Rahmawati, S.Pd.', NULL),
('0145678901', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'SISWA', 'Ahmad Fauzan Pratama', NULL);
