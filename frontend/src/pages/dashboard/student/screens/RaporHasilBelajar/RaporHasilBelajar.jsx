import StudentDataPage from '../../components/StudentDataPage.jsx'
import './RaporHasilBelajar.css'

const data = {
  className: 'student-report-screen',
  eyebrow: 'Akademik Saya',
  title: 'Rapor & Hasil Belajar',
  description: 'Lihat capaian semester, deskripsi kompetensi, dan status ketuntasan setiap mata pelajaran.',
  actions: ['Ekspor CSV', 'Unduh rapor digital'],
  stats: [
    ['Rata-rata semester', '89,4', 'Predikat sangat baik', 'clipboard'],
    ['Mata pelajaran', '7', 'Seluruhnya tuntas', 'activity'],
    ['Ketuntasan KKTP', '100%', 'Target minimum 75', 'clipboard'],
    ['Kehadiran', '98,2%', '108 dari 110 hari', 'shield'],
  ],
  searchPlaceholder: 'Cari di rapor & hasil belajar...',
  columns: ['No', 'Mata Pelajaran', 'Formatif', 'Sumatif', 'Nilai Akhir', 'Ketuntasan'],
  rows: [
    ['01', { initial: 'P', label: 'Pendidikan Agama & Budi Pekerti' }, '90', '94', '92', { status: 'Tuntas' }],
    ['02', { initial: 'P', label: 'Pendidikan Pancasila' }, '88', '92', '90', { status: 'Tuntas' }],
    ['03', { initial: 'B', label: 'Bahasa Indonesia' }, '87', '89', '88', { status: 'Tuntas' }],
    ['04', { initial: 'M', label: 'Matematika' }, '92', '96', '94', { status: 'Tuntas' }],
    ['05', { initial: 'I', label: 'Ilmu Pengetahuan Alam dan Sosial' }, '88', '90', '89', { status: 'Tuntas' }],
  ],
}

function RaporHasilBelajar(props) {
  return <StudentDataPage {...props} data={data} />
}

export default RaporHasilBelajar
