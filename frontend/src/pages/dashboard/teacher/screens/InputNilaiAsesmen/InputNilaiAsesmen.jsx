import TeacherDataPage from '../../components/TeacherDataPage.jsx'
import './InputNilaiAsesmen.css'

const data = {
  eyebrow: 'KELAS & PEMBELAJARAN',
  title: 'Pengelolaan Nilai & Asesmen Rapor',
  description: 'Input nilai formatif, sumatif, dan asesmen akhir berdasarkan tujuan pembelajaran Fase B.',
  action: 'Publikasikan ke buku induk',
  stats: [['Formatif harian', '40%', 'Komponen nilai rapor', 'clipboard'], ['Sumatif lingkup', '30%', 'Komponen nilai rapor', 'activity'], ['Sumatif akhir', '30%', 'Komponen nilai rapor', 'clipboard'], ['Kelengkapan nilai', '96,8%', '31 dari 32 siswa', 'shield']],
  searchPlaceholder: 'Cari di pengelolaan nilai & asesmen rapor...',
  columns: ['Kehadiran', 'TP 1', 'TP 2', 'Nilai akhir'],
  rows: [
    ['Ahmad Fauzi Ridwan', 'A', ['100%', '92', '94', { status: '92 · Tuntas' }]],
    ['Aisyah Putri Maharani', 'A', ['98%', '90', '94', { status: '93 · Tuntas' }]],
    ['Bagas Pratama Kusuma', 'B', ['92%', '78', '76', { status: '77 · Perlu tindak lanjut' }]],
    ['Cantika Dewi Lestari', 'C', ['96%', '88', '90', { status: '89 · Tuntas' }]],
    ['Dimas Aditya Nugraha', 'D', ['95%', '82', '84', { status: '83 · Tuntas' }]],
  ],
}

function InputNilaiAsesmen(props) {
  return <TeacherDataPage {...props} data={data} pageClassName="teacher-assessment" />
}

export default InputNilaiAsesmen
