import TeacherDataPage from '../../components/TeacherDataPage.jsx'
import './DaftarSiswaBinaan.css'

const data = {
  eyebrow: 'KELAS & PEMBELAJARAN',
  title: 'Daftar Siswa Binaan — Kelas IV A',
  description: 'Pantau identitas, kehadiran, capaian akademik, karakter P5, dan kelengkapan buku induk siswa binaan.',
  action: 'Tambah catatan khusus siswa',
  stats: [['Total siswa binaan', '32', '16 laki-laki · 16 perempuan', 'users'], ['Kehadiran kumulatif', '98,4%', 'Rata-rata kelas', 'activity'], ['Buku induk lengkap', '30', '2 perlu verifikasi', 'clipboard'], ['Capaian rata-rata', '88,5', 'Predikat A-', 'shield']],
  searchPlaceholder: 'Cari di daftar siswa binaan — kelas IV A...',
  columns: ['Kehadiran', 'Rapor akademik', 'Projek P5', 'Buku induk'],
  rows: [
    ['Ahmad Fauzi Ridwan', 'A', ['98,2%', '91,4 · Sangat Baik', 'Mandiri & Gotong Royong', { status: 'Lengkap Terverifikasi' }]],
    ['Aisyah Putri Maharani', 'A', ['100%', '94,8 · Sangat Baik', 'Kreatif & Bernalar Kritis', { status: 'Lengkap Terverifikasi' }]],
    ['Bagas Pratama Kusuma', 'B', ['94,0%', '84,2 · Baik', 'Mandiri & Kreatif', { status: 'Belum unggah KK' }]],
    ['Cantika Dewi Lestari', 'C', ['98,8%', '89,6 · Sangat Baik', 'Berkebinekaan Global', { status: 'Lengkap Terverifikasi' }]],
    ['Dimas Aditya Nugraha', 'D', ['96,4%', '86,1 · Baik', 'Religius & Kolaboratif', { status: 'Perlu diperbarui' }]],
  ],
}

function DaftarSiswaBinaan(props) {
  return <TeacherDataPage {...props} data={data} pageClassName="teacher-student-list" />
}

export default DaftarSiswaBinaan
