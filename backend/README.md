# Backend Buku Induk Siswa SD

Backend ini direncanakan untuk menyediakan API dan penyimpanan data bagi aplikasi Buku Induk Siswa SD Negeri Batu Ampar 12 Pagi.

## Status saat ini

Backend **belum diimplementasikan**. Direktori `src` baru berisi folder scaffold dan file `.gitkeep`; belum ada server, API, model, database, autentikasi, atau pengujian backend. Karena itu belum ada perintah untuk menjalankan backend.

Frontend saat ini menggunakan data pratinjau. Perubahan data belum tersimpan ke server.

## Cakupan aplikasi

Alur utama buku induk terdiri dari:

1. **Data murid** — biodata dan data keluarga diisi saat murid masuk sekolah. Data masuk juga mencatat apakah murid baru atau pindahan.
2. **Data nilai** — nilai rapor dicatat untuk setiap semester dan tahun ajaran.
3. **Output buku induk** — dokumen buku induk dibuat dari data murid dan nilai yang tersimpan; bukan isian data terpisah.

## Rancangan entitas ERD

| Entitas | Kegunaan |
| --- | --- |
| `siswa` | Identitas dan biodata murid |
| `keluarga_siswa` | Data orang tua dan wali |
| `riwayat_masuk_siswa` | Data penerimaan murid baru atau mutasi masuk |
| `pengguna` | Akun operator, admin, dan guru |
| `rapor_capaian` | Ringkasan rapor murid untuk kelas, semester, dan tahun ajaran |
| `nilai_mapel` | Nilai mata pelajaran dan capaian kompetensi pada rapor |
| `profil_pancasila` | Catatan capaian Profil Pelajar Pancasila pada rapor |
| `nilai_ekstrakurikuler` | Catatan kegiatan dan capaian ekstrakurikuler pada rapor |

Relasi utamanya:

- Satu murid dapat memiliki riwayat masuk dan beberapa rapor.
- Satu rapor berisi beberapa nilai mata pelajaran, capaian Pancasila, dan catatan ekstrakurikuler.
- `keluarga_siswa` terhubung ke murid.
- Pengguna yang menginput atau memverifikasi data perlu dapat ditelusuri.

## Catatan sebelum implementasi database

- Pertimbangkan memakai `id_siswa` sebagai primary key internal, dan menjadikan NISN kolom unik. NISN dapat belum tersedia ketika data awal dicatat.
- Terapkan constraint unik agar satu murid tidak memiliki rapor duplikat untuk kombinasi tahun ajaran dan semester yang sama.
- Terapkan constraint unik untuk mata pelajaran yang sama dalam satu rapor.
- Pastikan semua foreign key memiliki aturan penghapusan dan pembaruan yang sesuai, serta nilai absensi tidak negatif.
- Jika format output memerlukan nilai formatif dan sumatif secara terpisah, tambahkan kolom atau entitas terkait sebelum migrasi database dibuat.
- Tetapkan apakah data orang tua/wali cukup disimpan dalam satu baris per murid atau perlu mendukung beberapa kontak wali.

Catatan tersebut adalah rekomendasi untuk memfinalisasi ERD; belum ada perubahan skema database.

## Struktur direktori

```text
src/
├── config/       # Konfigurasi aplikasi dan koneksi database
├── controllers/  # Penanganan request dan response
├── middlewares/  # Autentikasi, otorisasi, dan penanganan request
├── models/       # Model data dan relasi
├── routes/       # Definisi endpoint API
├── services/     # Logika bisnis
└── utils/        # Fungsi bantu
```

## Yang perlu disiapkan

Sebelum backend dapat dijalankan, proyek masih memerlukan:

- Pemilihan runtime dan framework backend.
- Pemilihan database, konfigurasi environment, dan mekanisme migrasi skema.
- Kontrak API untuk data murid, data rapor, serta output/cetak buku induk.
- Autentikasi dan otorisasi peran operator/admin/guru; akses siswa perlu ditentukan sesuai kebutuhan.
- Validasi input, format respons dan error API, logging, serta strategi pengujian.
- Dokumentasi perintah instalasi, menjalankan server, build, dan test setelah konfigurasi backend tersedia.

Belum ada teknologi atau endpoint yang ditetapkan, jadi dokumentasi ini tidak mencantumkan perintah instalasi maupun API yang belum dibuat.
