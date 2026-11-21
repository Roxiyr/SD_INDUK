import { useEffect, useState } from 'react'
import { createReport, deleteReportItem, getReport, listReports, saveSubjects, updateReport } from '../../../../services/reports/raporService.js'

const blankSubject = () => ({ kategori_mapel: 'Wajib', nama_mapel: '', nilai_akhir: '', capaian_kompetensi: '' })
const toClassLevel = (name = '') => name.trim().split(/\s+/)[0] || 'I'

function TeacherGradebook({ students = [], academicYear, classes = [], initialNisn = '' }) {
  const [nisn, setNisn] = useState(initialNisn || students[0]?.nisn || '')
  const [reports, setReports] = useState([])
  const [report, setReport] = useState(null)
  const [form, setForm] = useState({
    kelas: toClassLevel(students[0]?.nama_kelas),
    fase: classes.find((item) => item.nama_kelas === students[0]?.nama_kelas)?.fase || 'A',
    semester: 'Ganjil',
    tahun_pelajaran: academicYear?.nama_tahun_ajaran || '',
    absensi_sakit: 0,
    absensi_izin: 0,
    absensi_tanpa_ket: 0,
    catatan_wali_kelas: '',
    keputusan_akhir: '',
  })
  const activeNisn = nisn || initialNisn || students[0]?.nisn || ''
  const [subjects, setSubjects] = useState([blankSubject()])
  const [loading, setLoading] = useState(Boolean(initialNisn || students[0]?.nisn))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const reportLocked = report && ['Diajukan', 'Disetujui'].includes(report.status_verifikasi)

  useEffect(() => {
    if (!activeNisn) return undefined
    const controller = new AbortController()
    listReports(activeNisn, { signal: controller.signal })
      .then((items) => setReports(items))
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') setError(requestError.message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [activeNisn])

  function startNewReport(nextNisn = activeNisn) {
    const student = students.find((item) => item.nisn === nextNisn)
    setReport(null)
    setForm({
      kelas: toClassLevel(student?.nama_kelas),
      fase: classes.find((item) => item.nama_kelas === student?.nama_kelas)?.fase || 'A',
      semester: 'Ganjil',
      tahun_pelajaran: academicYear?.nama_tahun_ajaran || '',
      absensi_sakit: 0,
      absensi_izin: 0,
      absensi_tanpa_ket: 0,
      catatan_wali_kelas: '',
      keputusan_akhir: '',
    })
    setSubjects([blankSubject()])
    setError('')
    setNotice('')
  }

  async function openReport(id) {
    setLoading(true)
    setError('')
    try {
      const details = await getReport(id)
      setReport(details)
      setForm({
        kelas: details.kelas,
        fase: details.fase,
        semester: details.semester,
        tahun_pelajaran: details.tahun_pelajaran,
        absensi_sakit: details.absensi_sakit || 0,
        absensi_izin: details.absensi_izin || 0,
        absensi_tanpa_ket: details.absensi_tanpa_ket || 0,
        catatan_wali_kelas: details.catatan_wali_kelas || '',
        keputusan_akhir: details.keputusan_akhir || '',
      })
      setSubjects(details.nilai_mapel?.length ? details.nilai_mapel : [blankSubject()])
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  async function save(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')
    try {
      let id = report?.id_rapor
      const header = {
        ...form,
        absensi_sakit: Number(form.absensi_sakit),
        absensi_izin: Number(form.absensi_izin),
        absensi_tanpa_ket: Number(form.absensi_tanpa_ket),
      }
      if (id) await updateReport(id, header)
      else {
        const created = await createReport({ ...header, nisn: activeNisn })
        id = created.id_rapor
      }
      const validSubjects = subjects.filter((item) => item.nama_mapel.trim()).map((item) => ({
        ...item,
        nilai_akhir: Number(item.nilai_akhir),
      }))
      if (validSubjects.length) await saveSubjects(id, validSubjects)
      setNotice('Nilai rapor berhasil disimpan ke database.')
      const [updatedReports, updatedReport] = await Promise.all([listReports(activeNisn), getReport(id)])
      setReports(updatedReports)
      setReport(updatedReport)
      setSubjects(updatedReport.nilai_mapel?.length ? updatedReport.nilai_mapel : [blankSubject()])
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function removeSubject(index) {
    const item = subjects[index]
    if (item.id_nilai_mapel && report) {
      if (!window.confirm(`Hapus nilai ${item.nama_mapel}?`)) return
      setSaving(true)
      setError('')
      try {
        await deleteReportItem(report.id_rapor, 'mapel', item.id_nilai_mapel)
        setSubjects((current) => current.filter((_, itemIndex) => itemIndex !== index))
        setNotice('Nilai mata pelajaran dihapus.')
      } catch (requestError) {
        setError(requestError.message)
      } finally {
        setSaving(false)
      }
      return
    }
    setSubjects((current) => current.filter((_, itemIndex) => itemIndex !== index))
  }

  return (
    <section className="teacher-live-page">
      <header className="teacher-live-heading">
        <div><span className="teacher-module-eyebrow">TERHUBUNG KE DATABASE</span><h1>Input Nilai &amp; Asesmen</h1><p>Pilih siswa binaan, lalu buat atau ubah rapor semester.</p></div>
        <button type="button" className="teacher-primary-action" onClick={() => startNewReport()} disabled={!nisn}>Rapor baru</button>
      </header>
      {notice && <p className="teacher-live-notice" role="status">{notice}</p>}
      {error && <p className="teacher-live-error" role="alert">{error}</p>}
      <div className="teacher-live-layout">
        <aside className="teacher-live-panel">
          <label>Siswa binaan
            <select value={activeNisn} onChange={(event) => { setLoading(true); setError(''); setReports([]); setNisn(event.target.value); setReport(null); setSubjects([blankSubject()]) }}>
              {students.map((student) => <option key={student.nisn} value={student.nisn}>{student.nama_lengkap} · {student.nisn}</option>)}
            </select>
          </label>
          <h2>Rapor tersimpan</h2>
          {loading ? <p>Memuat rapor...</p> : reports.map((item) => (
            <button type="button" className={`teacher-report-choice${report?.id_rapor === item.id_rapor ? ' selected' : ''}`} key={item.id_rapor} onClick={() => openReport(item.id_rapor)}>
              <strong>Kelas {item.kelas} · {item.semester}</strong><span>{item.tahun_pelajaran} · Fase {item.fase} · {item.status_verifikasi}</span>
            </button>
          ))}
          {!loading && !reports.length && <p>Belum ada rapor untuk siswa ini.</p>}
        </aside>
        <form className="teacher-live-form" onSubmit={save}>
          <h2>{report ? `Ubah rapor kelas ${report.kelas}` : 'Buat rapor baru'}</h2>
          {reportLocked && <p className="teacher-live-empty">Rapor berstatus {report.status_verifikasi}; perubahan terkunci sampai operator meminta revisi.</p>}
          {report?.catatan_verifikasi && <p className="teacher-live-empty">Catatan operator: {report.catatan_verifikasi}</p>}
          <fieldset className="teacher-gradebook-fields" disabled={saving || reportLocked}>
          <div className="teacher-live-grid">
            <label>Kelas<input value={form.kelas} onChange={(event) => setForm({ ...form, kelas: event.target.value })} required /></label>
            <label>Fase<select value={form.fase} onChange={(event) => setForm({ ...form, fase: event.target.value })}><option>A</option><option>B</option><option>C</option></select></label>
            <label>Semester<select value={form.semester} onChange={(event) => setForm({ ...form, semester: event.target.value })}><option>Ganjil</option><option>Genap</option></select></label>
            <label>Tahun pelajaran<input value={form.tahun_pelajaran} onChange={(event) => setForm({ ...form, tahun_pelajaran: event.target.value })} required /></label>
            <label>Absensi sakit<input type="number" min="0" value={form.absensi_sakit} onChange={(event) => setForm({ ...form, absensi_sakit: event.target.value })} /></label>
            <label>Absensi izin<input type="number" min="0" value={form.absensi_izin} onChange={(event) => setForm({ ...form, absensi_izin: event.target.value })} /></label>
            <label>Tanpa keterangan<input type="number" min="0" value={form.absensi_tanpa_ket} onChange={(event) => setForm({ ...form, absensi_tanpa_ket: event.target.value })} /></label>
            <label>Keputusan akhir<input value={form.keputusan_akhir} onChange={(event) => setForm({ ...form, keputusan_akhir: event.target.value })} /></label>
          </div>
          <label>Catatan wali kelas<textarea rows="3" value={form.catatan_wali_kelas} onChange={(event) => setForm({ ...form, catatan_wali_kelas: event.target.value })} /></label>
          <h3>Nilai mata pelajaran</h3>
          {subjects.map((item, index) => (
            <div className="teacher-subject-row" key={item.id_nilai_mapel || `new-${index}`}>
              <label>Mata pelajaran<input value={item.nama_mapel} onChange={(event) => setSubjects((current) => current.map((subject, i) => i === index ? { ...subject, nama_mapel: event.target.value } : subject))} required /></label>
              <label>Kategori<select value={item.kategori_mapel} onChange={(event) => setSubjects((current) => current.map((subject, i) => i === index ? { ...subject, kategori_mapel: event.target.value } : subject))}><option>Wajib</option><option>Seni Budaya</option><option>Muatan Lokal</option></select></label>
              <label>Nilai<input type="number" min="0" max="100" value={item.nilai_akhir} onChange={(event) => setSubjects((current) => current.map((subject, i) => i === index ? { ...subject, nilai_akhir: event.target.value } : subject))} required /></label>
              <label>Capaian<input value={item.capaian_kompetensi || ''} onChange={(event) => setSubjects((current) => current.map((subject, i) => i === index ? { ...subject, capaian_kompetensi: event.target.value } : subject))} /></label>
              <button type="button" onClick={() => removeSubject(index)} aria-label={`Hapus ${item.nama_mapel || 'mata pelajaran'}`}>Hapus</button>
            </div>
          ))}
          <button type="button" className="teacher-secondary-action" onClick={() => setSubjects((current) => [...current, blankSubject()])}>Tambah mata pelajaran</button>
          </fieldset>
          <footer><button type="submit" className="teacher-primary-action" disabled={saving || !activeNisn || reportLocked}>{saving ? 'Menyimpan...' : 'Simpan rapor'}</button></footer>
        </form>
      </div>
      {!students.length && <p className="teacher-live-empty">Belum ada siswa yang ditugaskan ke akun Anda.</p>}
    </section>
  )
}

export default TeacherGradebook
