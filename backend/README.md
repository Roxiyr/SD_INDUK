# Backend Buku Induk

REST API intranet berbasis Express dan MySQL untuk Sistem Informasi Buku Induk SDN Batu Ampar 12 Pagi.

## Menjalankan

1. Pastikan Node.js 18+ dan MySQL/MariaDB aktif.
2. Buat database `db_buku_induk_sdn12`, lalu impor [`../tables_buku_induk_sdn12.sql`](../tables_buku_induk_sdn12.sql).
3. Salin `.env.example` menjadi `.env`, sesuaikan konfigurasi MySQL, lalu ganti `JWT_SECRET` dengan secret acak minimal 32 karakter.
4. Jalankan `npm install`, lalu `npm run dev` (pengembangan) atau `npm start`.

API berjalan pada `http://localhost:5000/api`. Endpoint pemeriksaan: `GET /api/health`.

Seed SQL menyediakan tiga akun contoh tanpa mengisi profil siswa atau guru; semuanya memakai sandi `password`:

| Username | Role |
| --- | --- |
| `operator.sdn12` | OPERATOR |
| `guru.kelas4a` | GURU |
| `0145678901` | SISWA |

Gunakan akun contoh hanya untuk lingkungan pengembangan dan ganti sandinya sebelum dipakai di jaringan sekolah.

## Kontrak ringkas

- Respons JSON mengikuti `{ status, message, data }`; validasi mengembalikan `errors`.
- Endpoint terlindungi menggunakan `Authorization: Bearer <token>`.
- `GET /api/kelas/aktif` menyediakan pilihan kelas tahun ajaran aktif untuk operator.
- `GET/POST /api/kelas` mengelola kelas; `PUT /api/kelas/:id` memperbarui kelas dan `DELETE /api/kelas/:id` menonaktifkannya tanpa menghapus riwayat. Kelas yang masih memiliki siswa aktif harus dikosongkan sebelum dinonaktifkan.
- `GET /api/guru/form-options` menyediakan pilihan kelas dan mata pelajaran aktif.
- `PUT /api/guru/:id` memperbarui profil, sedangkan `DELETE /api/guru/:id` menonaktifkan guru serta menutup penugasannya. `PUT /api/guru/akun/:id_user/profil` menautkan akun guru lama yang belum mempunyai profil.
- `POST /api/siswa` menerima `{ siswa, keluarga, riwayat_masuk, buat_akun?, id_kelas? }`; penempatan kelas disimpan dalam transaksi yang sama. `PUT /api/siswa/:nisn` dapat menerima `id_kelas` untuk mengubah penempatan aktif.
- `GET /api/guru` menampilkan profil dan penugasan aktif guru; `POST /api/guru` menyimpan profil, akun login, dan penugasan kelas opsional dalam satu transaksi.
- `GET/POST /api/pengajuan` menyediakan riwayat dan pengajuan perubahan data. Siswa hanya mengakses pengajuannya sendiri; guru dibatasi pada siswa yang ditugaskan. Operator meninjau dengan `PUT /api/pengajuan/:id`, dan siswa dapat membatalkan pengajuan menunggu dengan `DELETE /api/pengajuan/:id`.
- Manajemen akun mendukung `PUT/DELETE /api/users/:id`; penghapusan akun menghapus akses login, bukan profil siswa/guru.
- Murid pada dashboard guru diambil dari kelas yang ditugaskan kepada guru pada tahun ajaran aktif.
- Guru dapat membuat dan memperbarui nilai rapor, serta catatan P5, melalui `/api/rapor`; akses dibatasi pada siswa yang ditugaskan.
- `GET /api/rapor/kelas/:id_kelas?semester=Ganjil` menyediakan leger nilai kelas untuk guru yang ditugaskan dan operator. Guru mengajukan dengan `POST /api/rapor/:id_rapor/ajukan`; operator meninjau antrean `GET /api/rapor/verifikasi` dan memperbarui status melalui `PUT /api/rapor/:id_rapor/verifikasi`.
- Operator dapat melihat rapor yang sudah disetujui melalui `GET /api/rapor/disetujui`. Jika ada kesalahan, `POST /api/rapor/:id_rapor/buka-revisi` dengan catatan wajib mengembalikan rapor ke status `Perlu Revisi`; murid tidak melihat rapor sampai disetujui kembali.
- Murid hanya menerima rapor berstatus `Disetujui` melalui dashboard, transkrip, dan PDF; status `Diajukan`, `Perlu Revisi`, dan `Ditolak` tetap terlihat pada alur guru/operator.
- `GET /api/presensi?tanggal=YYYY-MM-DD&id_kelas=...` membaca presensi kelas yang ditugaskan. `POST /api/presensi/batch` menyimpan presensi harian dalam satu transaksi.
- `/api/jadwal` membaca jadwal aktif untuk operator, guru yang ditugaskan, dan murid pada kelasnya. Operator dan guru dapat menambah, mengubah, dan menonaktifkan jadwal; guru dibatasi pada kelas dan penugasannya.
- `GET /api/users` menampilkan akun; `POST /api/users` dapat digunakan operator untuk membuat akun operator.
- `POST /api/siswa/import` menerima unggahan `.xlsx` atau `.csv` pada field multipart `file` (maksimal 5 MB). Kolom header mengikuti nama kolom skema; data keluarga dan riwayat masuk dapat disertakan pada baris yang sama.
- Endpoint rapor menerima satu objek atau `{ "data": [...] }` untuk penyimpanan batch item. Sertakan id item (`id_nilai_mapel`, `id_profil`, atau `id_ekskul`) untuk memperbarui nilai yang sudah ada.
- PDF dihasilkan dengan PDFKit; backup SQL mengekspor data semua tabel dalam format SQL.

## Endpoint

Sesuai [`arsitektur_backend_spesifikasi_api.md`](../arsitektur_backend_spesifikasi_api.md): `/auth`, `/users`, `/guru`, `/kelas`, `/siswa`, `/pengajuan`, `/rapor`, `/presensi`, `/jadwal`, `/portal`, `/buku-induk`, dan `/system/backup-sql`.
