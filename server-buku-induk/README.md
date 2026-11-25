# Server E-Buku Induk

REST API Express + MySQL untuk SDN Batu Ampar 12 Pagi. Memerlukan Node.js 18+ dan MySQL 8/XAMPP.

1. Buat database dengan menjalankan `database/schema.sql` di phpMyAdmin atau MySQL.
2. Salin `.env.example` menjadi `.env`, lalu atur kredensial MySQL dan `JWT_SECRET`.
3. Jalankan `npm install`, `npm run seed`, lalu `npm run dev`.
4. API tersedia pada `http://localhost:5000/api/v1`; pemeriksaan hidup di `/health`.

Akun awal seeder: `admin` / `admin`. Ganti kata sandi setelah masuk dan setel secret JWT sebelum digunakan pada jaringan sekolah.
