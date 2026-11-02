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

Folder halaman dan controller sudah disiapkan sesuai menu dashboard Admin & Operator pada rancangan. Folder modul masih kosong dan belum berisi implementasi fitur.
