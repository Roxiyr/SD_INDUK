import TeacherDataPage from '../../components/TeacherDataPage.jsx'
import './LegerNilaiKelas.css'

const data = {
  eyebrow: 'BUKU INDUK',
  title: 'Leger Nilai Kelas IV A',
  description: 'Rekap nilai akhir seluruh mata pelajaran sebelum diterbitkan ke rapor.',
  action: 'Unduh leger kelas',
  stats: [['Siswa', '32', 'Kelas IV A', 'book'], ['Mapel lengkap', '6/7', '1 menunggu guru mapel', 'activity'], ['Rata-rata kelas', '86,7', 'Predikat baik', 'clipboard'], ['Siap rapor', '30', '2 perlu perbaikan', 'shield']],
  searchPlaceholder: 'Cari di leger nilai kelas IV A...',
  columns: ['Matematika', 'B. Indonesia', 'IPAS', 'Rata-rata'],
  rows: [
    ['Ahmad Fauzi Ridwan', 'A', ['92', '90', '88', { status: '90 · Lengkap' }]],
    ['Aisyah Putri Maharani', 'A', ['93', '95', '91', { status: '93 · Lengkap' }]],
    ['Bagas Pratama Kusuma', 'B', ['77', '82', '80', { status: '80 · Tinjau' }]],
    ['Cantika Dewi Lestari', 'C', ['89', '92', '87', { status: '89 · Lengkap' }]],
  ],
}

function LegerNilaiKelas(props) {
  return <TeacherDataPage {...props} data={data} pageClassName="teacher-gradebook" />
}

export default LegerNilaiKelas
