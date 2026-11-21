# SD Induk

Proyek ini berisi aplikasi frontend React dengan Vite dan backend REST Express/MySQL. Backend prototipe telah disiapkan pada folder `backend` beserta skrip skema dan seed MySQL.

## Menjalankan frontend

```powershell
cd frontend
npm install
npm run dev
```

## Perintah yang tersedia

Jalankan dari folder `frontend`:

```powershell
npm run build
npm run lint
npm run preview
```

## Menjalankan backend

Backend memerlukan Node.js 18+, MySQL/MariaDB, dan konfigurasi `.env`.

```powershell
cd backend
Copy-Item .env.example .env
npm install
npm start
```

Buat database `db_buku_induk_sdn12`, kemudian impor `tables_buku_induk_sdn12.sql`. Ganti `JWT_SECRET` pada `.env` dengan secret acak minimal 32 karakter.

## Akun demo

Akun berikut hanya untuk pengujian lokal:

| Peran | Username | Kata sandi |
| --- | --- | --- |
| Operator (seed SQL) | `operator.sdn12` | `password` |
| Guru (seed SQL) | `guru.kelas4a` | `password` |
| Murid (seed SQL) | `0145678901` | `password` |
| Guru demo dengan profil | `demo.guru` | `GuruDemo2026!` |
| Murid demo dengan profil | `demo.murid` | `MuridDemo2026!` |

Akun demo guru dan murid tersedia pada database XAMPP yang sudah berisi data demo; keduanya tidak dibuat oleh seed SQL. Seed SQL hanya membuat akun contoh tanpa profil guru atau murid. Jangan gunakan akun atau kata sandi demo di lingkungan produksi.
