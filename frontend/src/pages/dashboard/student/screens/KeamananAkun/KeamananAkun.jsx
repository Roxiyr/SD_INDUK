import StudentDataPage from '../../components/StudentDataPage.jsx'
import './KeamananAkun.css'

const data = {
  className: 'student-security-screen',
  eyebrow: 'Pengaturan',
  title: 'Keamanan Akun & Akses Portal Siswa',
  description: 'Kelola kata sandi, perangkat aktif, integrasi akun, dan preferensi notifikasi.',
  actions: ['Ekspor CSV', 'Simpan pengaturan keamanan'],
  stats: [
    ['Status akun', 'Aman', 'Tidak ada aktivitas asing', 'shield'],
    ['Verifikasi 2 langkah', 'Aktif', 'WhatsApp wali', 'activity'],
    ['Perangkat aktif', '2', 'Chrome dan Android', 'clipboard'],
    ['Login terakhir', 'Hari ini', '09.42 WIB', 'shield'],
  ],
  searchPlaceholder: 'Cari di keamanan akun & akses portal siswa...',
  columns: ['No', 'Pengaturan', 'Informasi', 'Perangkat / Akun', 'Aktivitas Terakhir', 'Status'],
  rows: [
    ['01', { initial: 'K', label: 'Kata sandi' }, 'Terakhir diubah 45 hari lalu', 'Portal Siswa', '4 Mei 2025', { status: 'Aman' }],
    ['02', { initial: 'V', label: 'Verifikasi dua langkah' }, 'Kode OTP melalui WhatsApp wali', '0813 •••• 1180', '18 Jun 2025', { status: 'Aktif' }],
    ['03', { initial: 'C', label: 'Chrome Windows' }, 'Jakarta Timur, Indonesia', 'Windows 11', 'Aktif sekarang', { status: 'Tepercaya' }],
    ['04', { initial: 'A', label: 'Android' }, 'Jakarta Timur, Indonesia', 'Android 14', '2 jam lalu', { status: 'Tepercaya' }],
  ],
}

function KeamananAkun(props) {
  return <StudentDataPage {...props} data={data} />
}

export default KeamananAkun
