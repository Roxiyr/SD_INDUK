import StudentDataPage from '../../components/StudentDataPage.jsx'
import './RiwayatAkademik.css'

const data = {
  className: 'student-history-screen',
  eyebrow: 'Akademik Saya',
  title: 'Riwayat Akademik & Transkrip Siswa',
  description: 'Rekam jejak capaian pembelajaran, perkembangan fase, dan hasil belajar dari setiap semester.',
  actions: ['Ekspor CSV', 'Unduh transkrip terintegrasi'],
  stats: [
    ['Rata-rata kumulatif', '88,6', 'Sangat memuaskan', 'activity'],
    ['Masa tempuh studi', '7', 'Semester aktif', 'activity'],
    ['Ketuntasan KKTP', '100%', 'Seluruh mata pelajaran', 'clipboard'],
    ['Status fase belajar', 'Fase B', 'Kelas IV A', 'shield'],
  ],
  searchPlaceholder: 'Cari di riwayat akademik & transkrip siswa...',
  columns: ['No', 'Semester', 'Kelas', 'Rata-rata', 'Fase', 'Status'],
  rows: [
    ['01', { initial: '2', label: '2025/2026 Ganjil' }, 'IV A', '89,4', 'Fase B', { status: 'Berjalan' }],
    ['02', { initial: '2', label: '2024/2025 Genap' }, 'III A', '88,9', 'Fase B', { status: 'Tuntas' }],
    ['03', { initial: '2', label: '2024/2025 Ganjil' }, 'III A', '88,2', 'Fase B', { status: 'Tuntas' }],
    ['04', { initial: '2', label: '2023/2024 Genap' }, 'II A', '87,8', 'Fase A', { status: 'Tuntas' }],
    ['05', { initial: '2', label: '2023/2024 Ganjil' }, 'II A', '87,1', 'Fase A', { status: 'Tuntas' }],
  ],
}

function RiwayatAkademik(props) {
  return <StudentDataPage {...props} data={data} />
}

export default RiwayatAkademik
