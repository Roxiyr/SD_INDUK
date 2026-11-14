import StudentDataPage from '../../components/StudentDataPage.jsx'
import './TranskripSaya.css'

const data = {
  className: 'student-transcript-screen',
  eyebrow: 'Akademik Saya',
  title: 'Detail Transkrip Semester & Capaian Pembelajaran',
  description: 'Rincian nilai formatif, sumatif, nilai akhir, serta deskripsi capaian pembelajaran.',
  actions: ['Ekspor CSV', 'Cetak transkrip digital'],
  stats: [
    ['Rata-rata nilai', '89,4', 'Semester ganjil', 'file'],
    ['Mata pelajaran', '7', 'Seluruhnya terisi', 'activity'],
    ['Kehadiran', '98,4%', 'Sangat baik', 'clipboard'],
    ['Predikat', 'A-', 'Sangat memuaskan', 'shield'],
  ],
  searchPlaceholder: 'Cari di detail transkrip semester & capaian pembelajaran...',
  columns: ['No', 'Mata Pelajaran', 'Rata-rata TP', 'Sumatif', 'Nilai Akhir', 'Capaian'],
  rows: [
    ['01', { initial: 'P', label: 'Pendidikan Agama & Budi Pekerti' }, '91', '93', '92', { status: 'Sangat Baik' }],
    ['02', { initial: 'P', label: 'Pendidikan Pancasila' }, '89', '91', '90', { status: 'Sangat Baik' }],
    ['03', { initial: 'B', label: 'Bahasa Indonesia' }, '87', '89', '88', { status: 'Baik' }],
    ['04', { initial: 'M', label: 'Matematika' }, '93', '95', '94', { status: 'Sangat Baik' }],
    ['05', { initial: 'I', label: 'IPAS' }, '88', '90', '89', { status: 'Baik' }],
    ['06', { initial: 'S', label: 'Seni Rupa & Prakarya' }, '86', '88', '87', { status: 'Baik' }],
  ],
}

function TranskripSaya(props) {
  return <StudentDataPage {...props} data={data} />
}

export default TranskripSaya
