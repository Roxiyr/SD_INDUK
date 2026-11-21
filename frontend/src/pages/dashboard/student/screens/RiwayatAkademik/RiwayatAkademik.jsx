import { useEffect, useMemo, useState } from 'react'
import StudentDataPage from '../../components/StudentDataPage.jsx'
import { listApprovedStudentReports } from '../../../../../services/reports/studentReportService.js'
import './RiwayatAkademik.css'

const data = {
  className: 'student-history-screen',
  eyebrow: 'Akademik Saya',
  title: 'Riwayat Akademik & Transkrip Siswa',
  description: 'Riwayat hanya menampilkan rapor yang sudah disetujui operator.',
  actions: ['Ekspor CSV', 'Unduh transkrip terintegrasi'],
  stats: [],
  searchPlaceholder: 'Cari semester atau kelas...',
  columns: ['No', 'Semester', 'Kelas', 'Rata-rata', 'Fase', 'Status'],
  rows: [],
}

function RiwayatAkademik(props) {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    listApprovedStudentReports({ signal: controller.signal })
      .then(setReports)
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') setError(requestError.message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [])

  const approvedReports = useMemo(() => reports.map((report) => {
    const grades = report.nilai_mapel || []
    const average = grades.length
      ? grades.reduce((total, grade) => total + Number(grade.nilai_akhir || 0), 0) / grades.length
      : null
    return { ...report, nilai_rata_rata: average }
  }).sort((left, right) =>
    right.tahun_pelajaran.localeCompare(left.tahun_pelajaran)
    || (right.semester === 'Genap' ? 1 : 0) - (left.semester === 'Genap' ? 1 : 0)
    || Number(right.id_rapor) - Number(left.id_rapor)), [reports])
  const values = approvedReports.map((report) => report.nilai_rata_rata).filter((value) => value !== null)
  const average = values.length ? values.reduce((total, value) => total + value, 0) / values.length : null
  const latest = approvedReports[0]
  const liveData = {
    ...data,
    description: loading ? 'Memuat riwayat rapor yang sudah disetujui operator.' : data.description,
    stats: [
      ['Rapor disetujui', approvedReports.length, 'Seluruh tahun pelajaran', 'activity'],
      ['Rata-rata kumulatif', average === null ? '—' : average.toLocaleString('id-ID', { maximumFractionDigits: 1 }), 'Dari rapor yang tersedia', 'clipboard'],
      ['Mata pelajaran terbaru', latest?.nilai_mapel?.length || 0, latest ? `${latest.semester} ${latest.tahun_pelajaran}` : 'Belum ada rapor', 'activity'],
      ['Fase terakhir', latest ? `Fase ${latest.fase}` : '—', latest?.kelas ? `Kelas ${latest.kelas}` : 'Belum tersedia', 'shield'],
    ],
    rows: approvedReports.map((report, index) => [
      String(index + 1).padStart(2, '0'),
      { initial: report.semester === 'Genap' ? '2' : '1', label: `${report.tahun_pelajaran} ${report.semester}` },
      report.kelas,
      report.nilai_rata_rata === null ? '—' : report.nilai_rata_rata.toLocaleString('id-ID', { maximumFractionDigits: 1 }),
      `Fase ${report.fase}`,
      { status: 'Disetujui' },
    ]),
  }

  return (
    <>
      {error && <p className="student-history-error" role="alert">{error}</p>}
      <StudentDataPage {...props} data={liveData} />
    </>
  )
}

export default RiwayatAkademik
