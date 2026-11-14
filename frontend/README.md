# Frontend Buku Induk Siswa SD

Frontend adalah aplikasi React dengan Vite untuk pratinjau alur Buku Induk Siswa SD Negeri Batu Ampar 12 Pagi.

## Status saat ini

- Tersedia tampilan login dan dashboard untuk role operator/admin, guru, dan siswa.
- Layar dashboard menggunakan data contoh/pratinjau.
- Backend, API, autentikasi sungguhan, dan penyimpanan data server belum tersedia.
- Sebagian tombol aksi hanya menampilkan umpan balik pratinjau. Beberapa layar guru dapat mengunduh CSV secara lokal, tetapi isinya tetap data contoh dan bukan data dari server.
- Unggah, perubahan data, dan penyimpanan belum terhubung ke backend.
- Role aktif dan menu terakhir disimpan di `sessionStorage` agar tetap terbuka saat halaman di-refresh pada tab yang sama. Tombol keluar menghapus sesi tersebut.

## Menjalankan aplikasi

Jalankan perintah dari folder `frontend`:

```powershell
npm install
npm run dev
```

Vite akan menampilkan alamat lokal yang dapat dibuka di browser.

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

## Rencana integrasi backend

Alur domain yang direncanakan memiliki dua kelompok data utama:

1. **Data murid** — biodata, keluarga/wali, dan informasi murid baru atau mutasi masuk.
2. **Data nilai** — nilai rapor yang dicatat per murid, kelas, tahun ajaran, dan semester.

Output buku induk nantinya disusun dari data murid dan nilai. Kontrak API, format validasi, serta perilaku unggah, simpan, ekspor, dan cetak perlu ditetapkan saat backend mulai diimplementasikan. Lihat [README backend](../backend/README.md) untuk status dan rancangan datanya.
