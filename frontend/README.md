# Frontend Buku Induk Siswa SD

Frontend adalah aplikasi React dengan Vite untuk pratinjau alur Buku Induk Siswa SD Negeri Batu Ampar 12 Pagi.

## Status saat ini

- Tersedia tampilan login dan dashboard untuk role operator/admin, guru, dan siswa.
- Login memakai autentikasi JWT dari backend.
- Navigasi operator dipangkas menjadi **Dashboard**, **Data Murid**, **Data Nilai**, dan **Cetak Buku Induk**.
- Modul **Data Murid** terhubung ke API untuk daftar, pencarian, filter status, detail, tambah, ubah, dan hapus; identitas, keluarga, serta riwayat masuk disimpan bersama.
- Modul **Data Nilai** terhubung ke API siswa dan rapor untuk membuat, melihat, mengubah header rapor, dan menyimpan nilai mata pelajaran.
- Modul **Cetak Buku Induk** menghasilkan PDF dari data murid dan rapor melalui endpoint backend.
- Modul dashboard lainnya masih menggunakan data contoh/pratinjau. Hanya fitur yang memiliki endpoint backend yang dapat diintegrasikan.
- Sebagian tombol aksi hanya menampilkan umpan balik pratinjau. Beberapa layar guru dapat mengunduh CSV secara lokal, tetapi isinya tetap data contoh dan bukan data dari server.
- Role aktif dan menu terakhir disimpan di `sessionStorage` agar tetap terbuka saat halaman di-refresh pada tab yang sama. Tombol keluar menghapus sesi tersebut.

## Menjalankan aplikasi

Jalankan perintah dari folder `frontend`:

```powershell
npm install
npm run dev
```

Vite akan menampilkan alamat lokal yang dapat dibuka di browser.

Backend harus berjalan di `http://localhost:5000/api` (atau atur `VITE_API_BASE_URL` di `frontend/.env`). Jalankan backend mengikuti petunjuk di [README backend](../backend/README.md).

Untuk login pengujian setelah seed SQL diimpor, gunakan username `operator.sdn12` dan kata sandi `password`.

## Perintah yang tersedia

Jalankan dari folder `frontend`:

```powershell
npm run build
npm run lint
npm run preview
```

`npm run preview` digunakan untuk meninjau hasil build; jalankan `npm run build` terlebih dahulu. Belum ada script test yang dikonfigurasi.

## Struktur sumber

```text
src/
├── assets/       # Logo dan gambar
├── controllers/  # Controller per area fitur
├── hooks/        # Custom React hooks, termasuk state sesi browser
├── pages/
│   ├── loginpage/
│   └── dashboard/
│       ├── modules/  # Dashboard dan modul operator/admin
│       ├── teacher/  # Dashboard guru dan layar per fitur
│       └── student/  # Dashboard siswa, komponen bersama, dan layar per fitur
├── services/     # Tempat integrasi layanan/API
├── styles/       # Gaya tambahan
└── utils/        # Fungsi bantu
```

## Dashboard siswa

Dashboard siswa berada di `src/pages/dashboard/student` dan layarnya dipisahkan per fitur di `screens/`:

- `RaporHasilBelajar/`
- `RiwayatAkademik/`
- `TranskripSaya/`
- `JadwalPelajaran/`
- `BiodataSiswa/`
- `BerkasDokumenResmi/`
- `PengajuanPerubahanData/`
- `KeamananAkun/`

Komponen tabel dan ringkasan yang digunakan bersama berada di `components/StudentDataPage.jsx`. Tampilan dan navigasi tersebut belum terhubung ke database atau API.

## Dashboard operator/admin

Kerangka dashboard operator/admin berada di `src/pages/dashboard`:

```text
dashboard/
├── DashboardPage.jsx          # Sidebar, topbar, ringkasan, dan pemilihan menu
├── DashboardPage.css
├── OperatorModulePage.jsx     # Pemetaan menu ke layar fitur
├── OperatorModulePage.css
└── modules/
    ├── ModuleDataPage.jsx     # Komponen bersama untuk ringkasan, pencarian, dan tabel data
    ├── ModuleIcon.jsx
    ├── PersetujuanPengajuan/
    ├── ProfilSekolah/
    └── screens/               # Satu folder JSX/CSS untuk tiap fitur
```

Menu operator dikelompokkan menjadi:

- **Utama:** Dashboard dan Persetujuan Pengajuan.
- **Master Data:** Data Induk Siswa, Data Guru, Data Kelas, Orang Tua/Wali, dan Tahun Ajaran.
- **Akademik:** Riwayat Siswa, Kenaikan Kelas, Mutasi Siswa, dan Alumni.
- **Laporan:** Rekap Siswa, Rekap Per Kelas, dan Ekspor Dapodik.
- **Pengaturan:** Profil Sekolah, Manajemen Akun, dan Audit Log.

Layar tabel standar berada di `modules/screens/` (contoh: `DataIndukSiswa/`, `DataGuru/`, dan `RekapSiswa/`). Persetujuan Pengajuan dan Profil Sekolah memakai layar khusus di folder masing-masing. `DashboardPage.jsx` mendefinisikan label/grup navigasi; `OperatorModulePage.jsx` memetakan label menu ke komponen. Kedua tempat tersebut perlu diperbarui ketika menambah menu baru.

## Dashboard guru

Kerangka dashboard guru berada di `src/pages/dashboard/teacher`:

```text
teacher/
├── TeacherDashboardPage.jsx   # Sidebar, topbar, dashboard utama, dan pemilihan menu
├── TeacherDashboardPage.css
├── components/
│   └── TeacherDataPage.jsx    # Komponen bersama untuk layar data tabel guru
└── screens/
    ├── TeacherScreens.jsx    # Pemetaan menu ke layar fitur
    ├── DaftarSiswaBinaan/
    ├── InputNilaiAsesmen/
    ├── RekapPresensiSiswa/
    ├── CatatanKarakterP5/
    ├── JadwalMengajar/
    ├── LegerNilaiKelas/
    ├── VerifikasiRaporSiswa/
    ├── UsulanKoreksiData/
    └── ProfilGuruAkun/
```

Menu guru mencakup:

- **Kelas & Akademik:** Daftar Siswa Binaan, Input Nilai & Asesmen, Rekap Presensi Siswa, Catatan Karakter & P5, dan Jadwal Mengajar.
- **Buku Induk:** Leger Nilai Kelas, Verifikasi Rapor Siswa, dan Usulan Koreksi Data.
- **Pengaturan:** Profil Guru & Akun.

`TeacherDashboardPage.jsx` mendefinisikan navigasi. `TeacherScreens.jsx` memetakan label menu ke layar dalam folder `screens/`. Layar yang memakai pola tabel/ringkasan dapat menggunakan `components/TeacherDataPage.jsx`; layar dengan tampilan khusus dapat mengimplementasikan layout sendiri.

## Menambah layar dashboard

1. Buat folder fitur di area role yang sesuai, lalu tambahkan komponen JSX dan stylesheet.
2. Tambahkan label menu pada grup navigasi dashboard.
3. Daftarkan label yang sama ke pemetaan layar (`OperatorModulePage.jsx` untuk operator/admin atau `TeacherScreens.jsx` untuk guru).
4. Gunakan komponen data bersama jika sesuai; buat tampilan khusus bila struktur fiturnya berbeda.
5. Periksa tampilan melalui `npm run dev`, lalu jalankan `npm run lint` dan `npm run build`.

Menu dan data dashboard saat ini adalah pratinjau. Penambahan layar belum membuat endpoint atau menyimpan data ke backend.

## Integrasi data siswa

Modul Data Induk Siswa menggunakan endpoint backend berikut:

- `GET /api/siswa` untuk daftar, pencarian, dan filter status.
- `GET /api/siswa/:nisn` untuk detail siswa, keluarga, dan riwayat masuk.
- `POST /api/siswa` untuk menambahkan siswa beserta data keluarga dan riwayat masuk.
- `PUT /api/siswa/:nisn` untuk mengubah data terkait.
- `DELETE /api/siswa/:nisn` untuk menghapus siswa.

Endpoint siswa memerlukan login role operator atau guru; perubahan data hanya tersedia untuk operator. Dashboard operator/guru/murid serta halaman master siswa, guru, dan akun operator terhubung ke database. Submodul rapor, dokumen, kelas, dan beberapa fitur akademik lainnya masih perlu integrasi tersendiri.

Halaman Data Guru menggunakan `GET /api/guru` dan `POST /api/guru` untuk menyimpan profil beserta akun guru. Manajemen Akun memakai `GET /api/users` dan `POST /api/users` untuk mengelola akun operator. Akun contoh tetap dipertahankan, tetapi tidak lagi membuat profil siswa/guru contoh atau baris contoh di halaman master.
