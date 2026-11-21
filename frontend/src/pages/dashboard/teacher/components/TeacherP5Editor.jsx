import { useEffect, useState } from 'react'
import { createReport, deleteReportItem, getReport, listReports, saveP5 } from '../../../../services/reports/raporService.js'

const blankItem = () => ({ dimensi: '', elemen: '', sub_elemen: '', target_pencapaian: 'BB' })
const classLevel = (name = '') => name.trim().split(/\s+/)[0] || 'I'

function TeacherP5Editor({ students = [], classes = [], academicYear }) {
  const [nisn, setNisn] = useState(students[0]?.nisn || '')
  const activeNisn = nisn || students[0]?.nisn || ''
  const [reports, setReports] = useState([])
  const [selectedReport, setSelectedReport] = useState('')
  const [reportInfo, setReportInfo] = useState(null)
  const [items, setItems] = useState([blankItem()])
  const [loading, setLoading] = useState(Boolean(students[0]?.nisn))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (!activeNisn) return undefined
    const controller = new AbortController()
    listReports(activeNisn, { signal: controller.signal })
      .then(async (items) => {
        if (controller.signal.aborted) return
        setReports(items)
        if (!items.length) return
        const latest = items[items.length - 1]
        const report = await getReport(latest.id_rapor)
        if (controller.signal.aborted) return
        setSelectedReport(String(latest.id_rapor))
        setReportInfo(report)
        setItems(report.profil_pancasila?.length ? report.profil_pancasila : [blankItem()])
      })
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') setError(requestError.message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [activeNisn])

  async function loadReport(id) {
    setSelectedReport(id)
    if (!id) {
      setReportInfo(null)
      setItems([blankItem()])
      return
    }
    setLoading(true)
    setError('')
    try {
      const report = await getReport(id)
      setReportInfo(report)
      setItems(report.profil_pancasila?.length ? report.profil_pancasila : [blankItem()])
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
      let id = selectedReport
      if (!id) {
        const student = students.find((item) => item.nisn === activeNisn)
        const year = academicYear?.nama_tahun_ajaran
        if (!student || !year) throw new Error('Data siswa atau tahun ajaran aktif belum tersedia.')
        const result = await createReport({
          nisn: activeNisn,
          kelas: classLevel(student.nama_kelas),
          fase: classes.find((item) => item.nama_kelas === student.nama_kelas)?.fase || 'A',
          semester: 'Ganjil',
          tahun_pelajaran: year,
        })
        id = String(result.id_rapor)
        setSelectedReport(id)
      }
      const validItems = items.filter((item) => item.dimensi.trim() && item.elemen.trim() && item.sub_elemen.trim())
      if (!validItems.length) throw new Error('Isi minimal satu catatan P5 dengan dimensi, elemen, dan sub-elemen.')
      await saveP5(id, validItems)
      const [updatedReports, updatedReport] = await Promise.all([listReports(activeNisn), getReport(id)])
      setReports(updatedReports)
      setReportInfo(updatedReport)
      setItems(updatedReport.profil_pancasila?.length ? updatedReport.profil_pancasila : [blankItem()])
      setNotice('Catatan P5 berhasil disimpan.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function removeItem(index) {
    const item = items[index]
    if (item.id_profil && selectedReport) {
      if (!window.confirm('Hapus catatan P5 ini?')) return
      setSaving(true)
      setError('')
      try {
        await deleteReportItem(selectedReport, 'p5', item.id_profil)
        setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))
        setNotice('Catatan P5 dihapus.')
      } catch (requestError) {
        setError(requestError.message)
      } finally {
        setSaving(false)
      }
      return
    }
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))
  }

  const reportLocked = reportInfo && ['Diajukan', 'Disetujui'].includes(reportInfo.status_verifikasi)

  return (
    <section className="teacher-live-page">
      <header className="teacher-live-heading">
        <div><span className="teacher-module-eyebrow">TERHUBUNG KE DATABASE</span><h1>Catatan Karakter &amp; P5</h1><p>Simpan perkembangan profil Pancasila siswa binaan.</p></div>
      </header>
      {notice && <p className="teacher-live-notice" role="status">{notice}</p>}
      {error && <p className="teacher-live-error" role="alert">{error}</p>}
      <form className="teacher-live-form" onSubmit={save}>
        <div className="teacher-live-grid">
          <label>Siswa
            <select value={activeNisn} onChange={(event) => { setLoading(true); setError(''); setReports([]); setSelectedReport(''); setReportInfo(null); setItems([blankItem()]); setNisn(event.target.value) }}>
              {students.map((student) => <option key={student.nisn} value={student.nisn}>{student.nama_lengkap} · {student.nisn}</option>)}
            </select>
          </label>
          <label>Rapor semester
            <select value={selectedReport} onChange={(event) => loadReport(event.target.value)}>
              <option value="">Rapor baru · {academicYear?.nama_tahun_ajaran || 'tahun ajaran aktif'}</option>
              {reports.map((report) => <option key={report.id_rapor} value={report.id_rapor}>{report.semester} {report.tahun_pelajaran} · Kelas {report.kelas} · {report.status_verifikasi}</option>)}
            </select>
          </label>
        </div>
        {reportLocked && <p className="teacher-live-empty">Rapor berstatus {reportInfo.status_verifikasi}; catatan terkunci sampai operator meminta revisi.</p>}
        {reportInfo?.catatan_verifikasi && <p className="teacher-live-empty">Catatan operator: {reportInfo.catatan_verifikasi}</p>}
        <h2>Dimensi dan capaian</h2>
        {loading && <p>Memuat data...</p>}
        <fieldset className="teacher-p5-fields" disabled={saving || loading || reportLocked}>
        {items.map((item, index) => (
          <div className="teacher-subject-row teacher-p5-row" key={item.id_profil || `p5-${index}`}>
            <label>Dimensi<input value={item.dimensi} onChange={(event) => setItems((current) => current.map((value, i) => i === index ? { ...value, dimensi: event.target.value } : value))} required /></label>
            <label>Elemen<input value={item.elemen} onChange={(event) => setItems((current) => current.map((value, i) => i === index ? { ...value, elemen: event.target.value } : value))} required /></label>
            <label>Sub-elemen<input value={item.sub_elemen} onChange={(event) => setItems((current) => current.map((value, i) => i === index ? { ...value, sub_elemen: event.target.value } : value))} required /></label>
            <label>Capaian<select value={item.target_pencapaian} onChange={(event) => setItems((current) => current.map((value, i) => i === index ? { ...value, target_pencapaian: event.target.value } : value))}><option value="BB">BB · Belum Berkembang</option><option value="MB">MB · Mulai Berkembang</option><option value="BSH">BSH · Berkembang Sesuai Harapan</option><option value="SB">SB · Sangat Berkembang</option></select></label>
            <button type="button" onClick={() => removeItem(index)} aria-label="Hapus catatan P5">Hapus</button>
          </div>
        ))}
        <button type="button" className="teacher-secondary-action" onClick={() => setItems((current) => [...current, blankItem()])}>Tambah dimensi</button>
        </fieldset>
        <footer><button type="submit" className="teacher-primary-action" disabled={saving || loading || !students.length || reportLocked}>{saving ? 'Menyimpan...' : 'Simpan catatan P5'}</button></footer>
      </form>
      {!students.length && <p className="teacher-live-empty">Belum ada siswa yang ditugaskan ke akun Anda.</p>}
    </section>
  )
}

export default TeacherP5Editor
