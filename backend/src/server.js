require('dotenv').config();
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error(
    'JWT_SECRET wajib diisi dengan nilai acak minimal 32 karakter.',
  );
  process.exit(1);
}
const app = require('./app');
const db = require('./config/database');
const port = Number(process.env.PORT || 5000);
const server = app.listen(port, async () => {
  try {
    await db.query('SELECT 1');
    console.log(`API listening on http://localhost:${port}`);
  } catch (error) {
    console.error('Koneksi MySQL gagal:', error.message);
    server.close(() => process.exit(1));
  }
});
async function shutdown() {
  server.close(async () => {
    await db.end();
    process.exit(0);
  });
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
