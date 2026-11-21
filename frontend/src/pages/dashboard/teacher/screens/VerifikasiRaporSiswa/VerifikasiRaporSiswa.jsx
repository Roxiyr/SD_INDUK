import { useEffect, useMemo, useState } from 'react'
import { listClassReports, submitReportForVerification } from '../../../../../services/reports/raporService.js'
import './VerifikasiRaporSiswa.css'

function VerifikasiRaporSiswa({ dashboardData, search = '', onOpenGradebook }) {
  const classes = dashboardData?.classes || []
  const [selectedClassId, setSelectedClassId] = useState(String(classes[0]?.id_kelas || ''))
  const classId = selectedClassId || String(classes[0]?.id_kelas || '')
  const [semester, setSemester] = useState('Ganjil')
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(Boolean(classId))
  const [savingId, setSavingId] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [query, setQuery] = useState('')
  const [reload, setReload] = useState(0)

  useEffect(() => {
    if (!classId) return undefined
    const controller = new AbortController()
    listClassReports(classId, semester, { signal: controller.signal })
      .then((result) => setStudents(result.students))
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') setError(requestError.message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [classId, semester, reload])

  function changeClass(event) {
    setLoading(true)
    setSelectedClassId(event.target.value)
  }

  function changeSemester(event) {
    setLoading(true)
    setSemester(event.target.value)
  }

  const filtered = useMemo(() => {
    const term = `${query} ${search}`.trim().toLowerCase()
    return students.filter((student) => `${student.nama_lengkap} ${student.nisn}`.toLowerCase().includes(term))
  }, [students, query, search])
  const submitted = students.filter((student) => student.status_verifikasi === 'Diajukan').length
  const revisions = students.filter((student) => student.status_verifikasi === 'Perlu Revisi').length
  const approved = students.filter((student) => student.status_verifikasi === 'Disetujui').length

  async function submit(student) {
    setSavingId(String(student.id_rapor))
    setError('')
    setNotice('')
    try {
      await submitReportForVerification(student.id_rapor)
      setNotice(`Rapor ${student.nama_lengkap} dikirim ke operator untuk ditinjau.`)
      setLoading(true)
      setReload((value) => value + 1)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSavingId('')
    }
  }

  return (
    <section className="teacher-module-screen teacher-live-page teacher-verification-live">
      <header className="teacher-module-heading">
        <div><span className="teacher-module-eyebrow">ALUR GURU → OPERATOR → MURID</span><h1>Verifikasi Rapor Siswa</h1><p>Kirim rapor yang sudah diisi. Operator meninjau, dan murid baru dapat melihat rapor setelah disetujui.</p></div>
      </header>
      {notice && <p className="teacher-live-notice" role="status">{notice}</p>}
      {error && <p className="teacher-live-error" role="alert">{error}</p>}
      <div className="teacher-module-metrics">
        <Metric title="Menunggu operator" value={submitted} />
        <Metric title="Perlu revisi" value={revisions} />
        <Metric title="Disetujui" value={approved} />
        <Metric title="Belum diajukan" value={students.filter((student) => student.status_verifikasi === 'Belum Diajukan').length} />
      </div>
      <section className="teacher-module-table-card">
        <div className="teacher-table-toolbar teacher-verification-toolbar">
          <label>Kelas<select value={classId} onChange={changeClass}>{classes.map((item) => <option key={item.id_kelas} value={item.id_kelas}>{item.nama_kelas}</option>)}</select></label>
          <label>Semester<select value={semester} onChange={changeSemester}><option>Ganjil</option><option>Genap</option></select></label>
          <label className="teacher-table-search"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama atau NISN..." aria-label="Cari rapor" /></label>
        </div>
        <div className="teacher-verification-list">
          {loading ? <p>Memuat status rapor...</p> : filtered.map((student) => {
            const canSubmit = student.id_rapor
              && student.jumlah_mapel > 0
              && ['Belum Diajukan', 'Perlu Revisi'].includes(student.status_verifikasi)
            return (
              <article key={student.nisn}>
                <div className="teacher-verification-person">
                  <span className="teacher-row-initial">{student.nama_lengkap?.charAt(0) || 'S'}</span>
                  <div><strong>{student.nama_lengkap}</strong><small>{student.nisn} · {student.jumlah_mapel || 0} mapel · {student.jumlah_p5 || 0} catatan P5</small></div>
                </div>
                <div className="teacher-verification-status">
                  <span className={`teacher-report-state ${stateClass(student.status_verifikasi)}`}>{student.status_verifikasi}</span>
                  {student.catatan_verifikasi && <small>Catatan: {student.catatan_verifikasi}</small>}
                  {!student.id_rapor && <small>Rapor semester ini belum dibuat.</small>}
                  {student.id_rapor && !student.jumlah_mapel && <small>Isi minimal satu nilai sebelum mengajukan.</small>}
                </div>
                <div className="teacher-verification-actions">
                  {student.id_rapor && <button type="button" className="teacher-secondary-action" onClick={() => onOpenGradebook?.(student.nisn)}>Buka rapor</button>}
                  {canSubmit && <button type="button" className="teacher-primary-action" disabled={savingId === String(student.id_rapor)} onClick={() => submit(student)}>{savingId === String(student.id_rapor) ? 'Mengirim...' : student.status_verifikasi === 'Perlu Revisi' ? 'Kirim ulang' : 'Ajukan verifikasi'}</button>}
                </div>
              </article>
            )
          })}
          {!loading && !filtered.length && <p>{error ? 'Data rapor belum dapat dimuat.' : 'Tidak ada siswa yang cocok dengan pencarian.'}</p>}
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

function Metric({ title, value }) {
  return <article className="teacher-module-metric"><div><h2>{title}</h2><strong>{value}</strong></div></article>
}

export default VerifikasiRaporSiswa
