# Client E-Buku Induk

SPA React 18 + Vite untuk administrasi Buku Induk SDN Batu Ampar 12 Pagi.

1. Pastikan API berjalan di `http://localhost:5000/api/v1`.
2. Jalankan `npm install` kemudian `npm run dev`.
3. Untuk URL API lain, isi `VITE_API_URL` (contoh `http://localhost:5000/api/v1`).
4. Akun awal: `admin` / `admin` setelah database backend di-seed.

Halaman login mengikuti layout split-screen blueprint, dengan form di kiri dan ilustrasi sekolah di panel kanan. Cetak buku induk menggunakan dialog cetak browser, pilih kertas Folio/F4 atau simpan sebagai PDF.
