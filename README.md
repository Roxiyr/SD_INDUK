# E-Buku Induk SDN Batu Ampar 12 Pagi

Project terdiri dari dua aplikasi yang berdiri sendiri, sesuai blueprint:

- [Backend API](./server-buku-induk/README.md) — Express.js + MySQL, API `http://localhost:5000/api/v1`.
- [Frontend SPA](./client-buku-induk/README.md) — React + Vite, aplikasi `http://localhost:5173`.

## Menjalankan secara lokal

1. Jalankan `server-buku-induk/database/schema.sql` pada MySQL/XAMPP.
2. Di folder `server-buku-induk`, salin `.env.example` menjadi `.env`, lalu jalankan `npm install`, `npm run seed`, dan `npm run dev`.
3. Di folder `client-buku-induk`, jalankan `npm install` dan `npm run dev`.
4. Login awal: `admin` / `admin`.

Setel `JWT_SECRET` sebelum dipakai pada jaringan sekolah. Halaman login memakai split-screen dengan ilustrasi sekolah yang dibuat langsung di antarmuka.
