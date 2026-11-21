import ModuleDataPage from '../../ModuleDataPage.jsx'
import './RekapSiswa.css'

const studentSummary = {
  category: 'LAPORAN',
  description: 'Ringkasan peserta didik berdasarkan status, tingkat, dan tahun ajaran.',
  action: 'Unduh rekap siswa',
  secondary: ['Ekspor CSV'],
  metrics: [
    ['Total siswa', '512', 'Semua tingkat', 'users'],
    ['Siswa aktif', '498', '97,3% terdaftar', 'activity'],
    ['Siswa baru', '84', 'Tahun ajaran ini', 'plus'],
    ['Perlu verifikasi', '14', 'Berkas siswa', 'shield'],
  ],
  columns: ['NO', 'TINGKAT', 'LAKI-LAKI', 'PEREMPUAN', 'TOTAL SISWA', 'STATUS'],
  rows: [
    ['01', 'Kelas I', '43', '41', '84 siswa', 'Aktif'],
    ['02', 'Kelas II', '42', '39', '81 siswa', 'Aktif'],
    ['03', 'Kelas III', '45', '40', '85 siswa', 'Aktif'],
    ['04', 'Kelas IV', '42', '41', '83 siswa', 'Aktif'],
    ['05', 'Kelas V–VI', '91', '88', '179 siswa', 'Aktif'],
  ],
}

function RekapSiswa(props) {
  return <ModuleDataPage {...props} data={studentSummary} pageClassName="student-summary-page" />
}

export default RekapSiswa
