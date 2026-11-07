# Frontend Buku Induk Siswa SD

Frontend menggunakan React dan Vite. Struktur awal di `src`:

```text
src/
├── assets/       # Gambar, ikon, dan aset statis
├── components/
│   ├── common/   # Komponen yang digunakan bersama
│   └── layout/   # Sidebar, header, dan layout dashboard
├── controllers/  # Penghubung alur aksi dan data halaman
├── hooks/        # Custom React hooks
├── pages/
│   ├── dashboard/
│   ├── master-data/  # Siswa, guru, kelas, wali, tahun ajaran
│   ├── academic/    # Riwayat, kenaikan kelas, mutasi, alumni
│   ├── reports/     # Rekap siswa, rekap kelas, ekspor Dapodik
│   └── settings/    # Profil sekolah, akun, audit log
├── services/     # Komunikasi dengan backend/API
├── styles/       # Styles tambahan
└── utils/        # Fungsi bantu
```

Dashboard operator berada di `src/pages/dashboard`:

```text
dashboard/
├── DashboardPage.jsx          # Kerangka dashboard, sidebar, dan ringkasan utama
├── DashboardPage.css
├── OperatorModulePage.jsx     # Pemilih halaman modul operator
├── OperatorModulePage.css     # Gaya komponen modul yang dipakai bersama
└── modules/
    ├── ModuleDataPage.jsx     # Tabel dan kartu ringkasan reusable
    ├── ModuleIcon.jsx
    ├── PersetujuanPengajuan/
    │   ├── ApprovalPage.jsx
    │   └── ApprovalPage.css
    ├── ProfilSekolah/
    │   ├── SchoolProfilePage.jsx
    │   └── SchoolProfilePage.css
    └── screens/               # Satu folder per halaman/fitur
        ├── DataIndukSiswa/
        │   ├── DataIndukSiswa.jsx
        │   └── DataIndukSiswa.css
        ├── DataGuru/
        ├── DataKelas/
        └── ...
```

Setiap folder halaman menyimpan JSX dan CSS untuk satu fitur. `modules/ModuleDataPage.jsx` dan `modules/ModuleIcon.jsx` adalah komponen bersama untuk fitur yang menggunakan tabel standar. Data saat ini hanya contoh frontend; belum ada konfigurasi backend, koneksi API, atau penyimpanan server.
