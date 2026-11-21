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

function TranskripSaya({ dashboardData, ...props }) {
  const grades = dashboardData?.grades || []
  const average = dashboardData?.metrics?.average
  const liveData = {
    ...data,
    stats: [
      ['Rata-rata nilai', average == null ? '—' : Number(average).toLocaleString('id-ID', { maximumFractionDigits: 1 }), 'Semester berjalan', 'file'],
      ['Mata pelajaran', grades.length, 'Nilai tersimpan', 'activity'],
      ['Kehadiran', dashboardData?.metrics?.attendanceRate == null ? '—' : `${dashboardData.metrics.attendanceRate}%`, 'Tahun ajaran aktif', 'clipboard'],
      ['Status rapor', dashboardData?.report ? dashboardData.reportStatus : dashboardData?.reportStatus || 'Belum ada', dashboardData?.report?.keputusan_akhir || 'Menunggu persetujuan', 'shield'],
    ],
    rows: grades.map((grade, index) => [
      String(index + 1).padStart(2, '0'),
      { initial: grade.nama_mapel?.charAt(0) || 'M', label: grade.nama_mapel },
      '—',
      '—',
      grade.nilai_akhir == null ? 'Belum dinilai' : String(grade.nilai_akhir),
      { status: grade.capaian_kompetensi || 'Belum ada capaian' },
    ]),
  }
  return <StudentDataPage {...props} data={liveData} />
}

export default TranskripSaya
