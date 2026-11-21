import { useEffect, useMemo, useState } from 'react'
import { listClassReports } from '../../../../../services/reports/raporService.js'
import './LegerNilaiKelas.css'

function LegerNilaiKelas({ dashboardData, search = '', onOpenGradebook }) {
  const classes = dashboardData?.classes || []
  const [selectedClassId, setSelectedClassId] = useState(String(classes[0]?.id_kelas || ''))
  const classId = selectedClassId || String(classes[0]?.id_kelas || '')
  const [semester, setSemester] = useState('Ganjil')
  const [data, setData] = useState({ students: [], subjects: [] })
  const [loading, setLoading] = useState(Boolean(classId))
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!classId) return undefined
    const controller = new AbortController()
    listClassReports(classId, semester, { signal: controller.signal })
      .then(setData)
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') setError(requestError.message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [classId, semester])

  function changeClass(event) {
    setLoading(true)
    setError('')
    setSelectedClassId(event.target.value)
  }

  function changeSemester(event) {
    setLoading(true)
    setError('')
    setSemester(event.target.value)
  }

  const filtered = useMemo(() => {
    const term = `${query} ${search}`.trim().toLowerCase()
    return data.students.filter((student) => `${student.nama_lengkap} ${student.nisn}`.toLowerCase().includes(term))
  }, [data.students, query, search])
  const withReports = data.students.filter((student) => student.id_rapor).length
  const averages = data.students.map((student) => student.nilai_rata_rata).filter((value) => value !== null)
  const classAverage = averages.length
    ? averages.reduce((total, value) => total + value, 0) / averages.length
    : null
  const complete = data.students.filter((student) => student.status_verifikasi === 'Disetujui').length

  return (
    <section className="teacher-module-screen teacher-live-page teacher-live-ledger">
      <header className="teacher-module-heading">
        <div><span className="teacher-module-eyebrow">NILAI RAPOR DARI DATABASE</span><h1>Leger Nilai Kelas</h1><p>Rekap nilai mengikuti kelas, semester, dan status rapor yang digunakan bersama operator serta murid.</p></div>
      </header>
      {error && <p className="teacher-live-error" role="alert">{error}</p>}
      <div className="teacher-module-metrics">
        <Metric title="Siswa" value={data.students.length} detail={data.class?.nama_kelas || 'Kelas binaan'} />
        <Metric title="Rapor tersedia" value={`${withReports}/${data.students.length}`} detail={`${semester} · ${data.academicYear || 'Tahun aktif'}`} />
        <Metric title="Rata-rata kelas" value={classAverage === null ? '—' : classAverage.toLocaleString('id-ID', { maximumFractionDigits: 1 })} detail={`${averages.length} siswa memiliki nilai`} />
        <Metric title="Disetujui" value={`${complete}/${data.students.length}`} detail="Terlihat di dashboard murid" />
      </div>
      <section className="teacher-module-table-card">
        <div className="teacher-table-toolbar teacher-ledger-toolbar">
          <label>Kelas<select value={classId} onChange={changeClass}>{classes.map((item) => <option key={item.id_kelas} value={item.id_kelas}>{item.nama_kelas}</option>)}</select></label>
          <label>Semester<select value={semester} onChange={changeSemester}><option>Ganjil</option><option>Genap</option></select></label>
          <label className="teacher-table-search"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama atau NISN..." aria-label="Cari di leger" /></label>
          <span className="teacher-table-count">{filtered.length} siswa</span>
        </div>
        <div className="teacher-module-table-wrap">
          <table className="teacher-module-table">
            <thead><tr><th>Siswa</th>{data.subjects.map((subject) => <th key={subject}>{subject}</th>)}<th>Rata-rata</th><th>Status rapor</th><th>Aksi</th></tr></thead>
            <tbody>
              {filtered.map((student) => (
                <tr key={student.nisn}>
                  <td><div className="teacher-row-identity"><span className="teacher-row-initial">{student.nama_lengkap?.charAt(0) || 'S'}</span><div><strong>{student.nama_lengkap}</strong><small>{student.nisn}</small></div></div></td>
                  {data.subjects.map((subject) => {
                    const grade = student.nilai_mapel.find((item) => item.nama_mapel === subject)?.nilai_akhir
                    return <td key={subject}>{grade ?? '—'}</td>
                  })}
                  <td>{student.nilai_rata_rata == null ? '—' : Number(student.nilai_rata_rata).toLocaleString('id-ID', { maximumFractionDigits: 1 })}</td>
                  <td><span className={`teacher-report-state ${stateClass(student.status_verifikasi)}`}>{student.status_verifikasi}</span></td>
                  <td><button type="button" className="teacher-ledger-action" onClick={() => onOpenGradebook?.(student.nisn)}>Buka nilai</button></td>
                </tr>
              ))}
              {!loading && !filtered.length && <tr><td className="teacher-table-empty" colSpan={data.subjects.length + 4}>{error ? 'Data leger belum dapat dimuat.' : 'Belum ada data nilai untuk pilihan ini.'}</td></tr>}
              {loading && <tr><td className="teacher-table-empty" colSpan={data.subjects.length + 4}>Memuat leger...</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  )
}

function stateClass(status) {
  if (status === 'Disetujui') return 'approved'
  if (status === 'Diajukan') return 'pending'
  if (status === 'Perlu Revisi' || status === 'Ditolak') return 'revision'
  return 'draft'
}

function Metric({ title, value, detail }) {
  return <article className="teacher-module-metric"><div><h2>{title}</h2><strong>{value}</strong><p>{detail}</p></div></article>
}

export default LegerNilaiKelas
