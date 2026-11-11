import TeacherDataPage from '../../components/TeacherDataPage.jsx'
import './VerifikasiRaporSiswa.css'

const data = {
  eyebrow: 'BUKU INDUK',
  title: 'Verifikasi Rapor Siswa',
  description: 'Periksa kelengkapan nilai, deskripsi capaian, karakter, dan absensi sebelum rapor dikunci.',
  action: 'Kirim untuk pengesahan',
  stats: [['Total rapor', '32', 'Semester ganjil', 'shield'], ['Siap disahkan', '28', '87,5% selesai', 'activity'], ['Perlu perbaikan', '4', 'Catatan belum lengkap', 'clipboard'], ['Sudah dikunci', '0', 'Menunggu kepala sekolah', 'shield']],
  searchPlaceholder: 'Cari di verifikasi rapor siswa...',
  columns: ['Nilai', 'Deskripsi', 'Karakter', 'Status rapor'],
  rows: [
    ['Ahmad Fauzi Ridwan', 'A', ['Lengkap', 'Lengkap', 'Lengkap', { status: 'Siap Disahkan' }]],
    ['Aisyah Putri Maharani', 'A', ['Lengkap', 'Lengkap', 'Lengkap', { status: 'Siap Disahkan' }]],
    ['Bagas Pratama Kusuma', 'B', ['Perlu tinjau', 'Lengkap', 'Lengkap', { status: 'Perlu Perbaikan' }]],
    ['Cantika Dewi Lestari', 'C', ['Lengkap', 'Lengkap', 'Lengkap', { status: 'Siap Disahkan' }]],
  ],
}

function VerifikasiRaporSiswa(props) {
  return <TeacherDataPage {...props} data={data} pageClassName="teacher-report-verification" />
}

export default VerifikasiRaporSiswa
