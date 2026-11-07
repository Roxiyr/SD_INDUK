import ModuleDataPage from '../../ModuleDataPage.jsx'
import './AuditLog.css'

const auditLog = {
  category: 'PENGATURAN',
  description: 'Pantau aktivitas pengguna dan jejak perubahan data untuk keamanan sistem.',
  action: 'Unduh audit log',
  secondary: ['Ekspor CSV'],
  metrics: [
    ['Aktivitas hari ini', '84', '12 pengguna', 'shield'],
    ['Pembaruan data', '46', 'Hari ini', 'activity'],
    ['Login berhasil', '38', 'Tanpa anomali', 'clipboard'],
    ['Peringatan', '2', 'Perlu ditinjau', 'shield'],
  ],
  columns: ['NO', 'WAKTU', 'PENGGUNA', 'AKTIVITAS', 'MODUL', 'ALAMAT IP'],
  rows: [
    ['01', '18 Jun 2025, 09.42', 'Operator Sekolah', 'Memperbarui data siswa', 'Data Induk', '192.168.1.24'],
    ['02', '18 Jun 2025, 09.18', 'Sri Wahyuni', 'Mengesahkan nilai', 'Riwayat Siswa', '192.168.1.31'],
    ['03', '18 Jun 2025, 08.54', 'Operator Sekolah', 'Ekspor laporan', 'Dapodik', '192.168.1.24'],
    ['04', '18 Jun 2025, 08.15', 'Budi Santoso', 'Login ke sistem', 'Autentikasi', '192.168.1.36'],
  ],
}

function AuditLog(props) {
  return <ModuleDataPage {...props} data={auditLog} pageClassName="audit-log-page" />
}

export default AuditLog
