const mysql = require('mysql2/promise');
require('dotenv').config();

/** Membuat pool koneksi MySQL dari konfigurasi environment. @returns {import('mysql2/promise').Pool} Pool koneksi bersama. */
const pool = mysql.createPool({ host: process.env.DB_HOST || '127.0.0.1', port: Number(process.env.DB_PORT || 3306), user: process.env.DB_USER || 'root', password: process.env.DB_PASSWORD || '', database: process.env.DB_NAME || 'db_buku_induk_sdn_ba12', waitForConnections: true, connectionLimit: 10, charset: 'utf8mb4' });
module.exports = pool;
