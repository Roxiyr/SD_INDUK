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

function RaporHasilBelajar({ dashboardData, ...props }) {
  const grades = dashboardData?.grades || []
  const average = dashboardData?.metrics?.average
  const reportStatus = dashboardData?.reportStatus || 'Belum ada rapor'
  const description = dashboardData?.report && dashboardData?.reportStatus === 'Diajukan'
    ? `Rapor terbaru menunggu verifikasi; nilai yang tampil tetap berasal dari rapor ${dashboardData.report.semester} ${dashboardData.report.tahun_pelajaran} yang sudah disetujui.`
    : dashboardData?.report
      ? `Rapor ${dashboardData.report.semester} ${dashboardData.report.tahun_pelajaran} sudah disetujui operator.`
    : reportStatus === 'Diajukan'
      ? 'Rapor sedang menunggu verifikasi operator. Nilai akan tampil setelah rapor disetujui.'
      : ['Perlu Revisi', 'Ditolak'].includes(reportStatus)
        ? 'Rapor sedang diperbaiki guru sebelum dapat ditampilkan.'
        : 'Nilai rapor akan tampil di sini setelah disetujui operator.'
  const liveData = {
    ...data,
    description,
    stats: [
      ['Rata-rata semester', average == null ? '—' : Number(average).toLocaleString('id-ID', { maximumFractionDigits: 1 }), 'Berdasarkan nilai tersimpan', 'clipboard'],
      ['Mata pelajaran', grades.length, 'Pada rapor semester aktif', 'activity'],
      ['Kelas', dashboardData?.classPlacement?.nama_kelas || '—', dashboardData?.academicYear?.nama_tahun_ajaran || 'Tahun ajaran aktif', 'clipboard'],
      ['Kehadiran', dashboardData?.metrics?.attendanceRate == null ? '—' : `${dashboardData.metrics.attendanceRate}%`, 'Tahun ajaran aktif', 'shield'],
    ],
    rows: grades.map((grade, index) => [
      String(index + 1).padStart(2, '0'),
      { initial: grade.nama_mapel?.charAt(0) || 'M', label: grade.nama_mapel },
      '—',
      '—',
      grade.nilai_akhir == null ? 'Belum dinilai' : String(grade.nilai_akhir),
      { status: grade.nilai_akhir == null ? 'Belum dinilai' : 'Tersimpan' },
    ]),
  }
  return <StudentDataPage {...props} data={liveData} />
}

export default RaporHasilBelajar
