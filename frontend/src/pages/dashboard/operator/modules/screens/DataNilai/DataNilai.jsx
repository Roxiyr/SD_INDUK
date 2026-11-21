import { useEffect, useState } from 'react'
import ModuleIcon from '../../ModuleIcon.jsx'
import { listStudents } from '../../../../../../services/students/studentService.js'
import { createReport, deleteReportItem, getReport, listReports, saveSubjects, updateReport } from '../../../../../../services/reports/raporService.js'
import './DataNilai.css'

const emptySubject = { kategori_mapel: 'Wajib', nama_mapel: '', nilai_akhir: '', capaian_kompetensi: '' }

function DataNilai() {
  const [students, setStudents] = useState([])
  const [nisn, setNisn] = useState('')
  const [reports, setReports] = useState([])
  const [reportDetail, setReportDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [form, setForm] = useState({ kelas: 'I', fase: 'A', semester: 'Ganjil', tahun_pelajaran: '2025/2026', absensi_sakit: 0, absensi_izin: 0, absensi_tanpa_ket: 0, catatan_wali_kelas: '', keputusan_akhir: '' })
  const [subjects, setSubjects] = useState([{ ...emptySubject }])

  useEffect(() => {
    let cancelled = false
    listStudents({ limit: 500 })
      .then((result) => {
        if (cancelled) return
        setStudents(result.items)
        setNisn((current) => current || result.items[0]?.nisn || '')
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!nisn) return undefined
    let cancelled = false
    listReports(nisn)
      .then((items) => { if (!cancelled) setReports(items) })
      .catch((requestError) => { if (!cancelled) setError(requestError.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [nisn])

  async function openReport(idRapor) {
    setError('')
    try {
      const detail = await getReport(idRapor)
      setReportDetail(detail)
      setForm({
        kelas: detail.kelas,
        fase: detail.fase,
        semester: detail.semester,
        tahun_pelajaran: detail.tahun_pelajaran,
        absensi_sakit: detail.absensi_sakit,
        absensi_izin: detail.absensi_izin,
        absensi_tanpa_ket: detail.absensi_tanpa_ket,
        catatan_wali_kelas: detail.catatan_wali_kelas || '',
        keputusan_akhir: detail.keputusan_akhir || '',
      })
      setSubjects(detail.nilai_mapel?.length ? detail.nilai_mapel.map((item) => ({ ...item })) : [{ ...emptySubject }])
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  function updateForm(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: ['absensi_sakit', 'absensi_izin', 'absensi_tanpa_ket'].includes(name) ? Number(value) : value }))
  }

  function updateSubject(index, event) {
    const { name, value } = event.target
    setSubjects((current) => current.map((subject, subjectIndex) => subjectIndex === index ? { ...subject, [name]: name === 'nilai_akhir' ? value : value } : subject))
  }

  async function removeSubject(index) {
    const subject = subjects[index]
    if (subject.id_nilai_mapel && reportDetail?.id_rapor) {
      if (!window.confirm(`Hapus nilai ${subject.nama_mapel || 'mata pelajaran'} dari rapor?`)) return
      setSaving(true)
      setError('')
      try {
        await deleteReportItem(reportDetail.id_rapor, 'mapel', subject.id_nilai_mapel)
        setSubjects((current) => current.filter((_, subjectIndex) => subjectIndex !== index))
        setNotice('Nilai mata pelajaran berhasil dihapus.')
      } catch (requestError) {
        setError(requestError.message)
      } finally {
        setSaving(false)
      }
      return
    }
    setSubjects((current) => current.filter((_, subjectIndex) => subjectIndex !== index))
  }

  async function saveReport(event) {
    event.preventDefault()
    if (!nisn) return
    setSaving(true)
    setError('')
    setNotice('')
    try {
      let idRapor = reportDetail?.id_rapor
      const reportPayload = {
        kelas: form.kelas,
        fase: form.fase,
        semester: form.semester,
        tahun_pelajaran: form.tahun_pelajaran,
        absensi_sakit: form.absensi_sakit,
        absensi_izin: form.absensi_izin,
        absensi_tanpa_ket: form.absensi_tanpa_ket,
        catatan_wali_kelas: form.catatan_wali_kelas,
        keputusan_akhir: form.keputusan_akhir,
      }
      if (!idRapor) {
        const result = await createReport({ ...reportPayload, nisn })
        idRapor = result.id_rapor
      } else {
        await updateReport(idRapor, reportPayload)
      }
      const items = subjects
        .filter((subject) => subject.nama_mapel)
        .map((subject) => ({ ...subject, nilai_akhir: Number(subject.nilai_akhir) }))
      if (items.length) await saveSubjects(idRapor, items)
      setNotice('Data nilai rapor berhasil disimpan.')
      const detail = await getReport(idRapor)
      setReportDetail(detail)
      setSubjects(detail.nilai_mapel?.length ? detail.nilai_mapel.map((item) => ({ ...item })) : [{ ...emptySubject }])
      setReports(await listReports(nisn))
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="module-view data-module-view data-value-page">
      {notice && <div className="dashboard-notice" role="status">{notice}<button type="button" onClick={() => setNotice('')} aria-label="Tutup">×</button></div>}
      {error && <div className="data-value-error" role="alert">{error}</div>}

      <div className="module-heading data-module-heading">
        <div>
          <span className="module-eyebrow">DATA AKADEMIK • RAPOR SEMESTER</span>
          <h1>Data Nilai</h1>
          <p>Isi nilai rapor untuk setiap murid pada kelas dan semester yang dijalankan.</p>
        </div>
      </div>

      <section className="data-value-layout">
        <aside className="data-value-panel">
          <label className="data-value-field">
            <span>Pilih murid</span>
            <select value={nisn} onChange={(event) => { setNisn(event.target.value); setReportDetail(null) }} disabled={loading}>
              <option value="">Pilih murid...</option>
              {students.map((student) => <option key={student.nisn} value={student.nisn}>{student.nama_lengkap} — {student.nisn}</option>)}
            </select>
          </label>

          <h2>Rapor tersimpan</h2>
          {loading ? <p className="data-value-empty">Memuat rapor...</p> : reports.length ? (
            <div className="data-value-report-list">
              {reports.map((report) => (
                <button type="button" key={report.id_rapor} className={reportDetail?.id_rapor === report.id_rapor ? 'active' : ''} onClick={() => openReport(report.id_rapor)}>
                  <strong>Kelas {report.kelas} • {report.semester}</strong>
                  <span>{report.tahun_pelajaran} • Fase {report.fase}</span>
                </button>
              ))}
            </div>
          ) : <p className="data-value-empty">Belum ada rapor untuk murid ini.</p>}
        </aside>

        <form className="data-value-form" onSubmit={saveReport}>
          <header><div><ModuleIcon name="clipboard" size={18} /><div><h2>{reportDetail ? `Rapor kelas ${reportDetail.kelas}` : 'Buat rapor baru'}</h2><p>Pilih periode dan lengkapi ringkasan rapor.</p></div></div></header>
          <fieldset disabled={saving || !nisn}>
            <div className="data-value-grid">
              <label className="data-value-field"><span>Kelas</span><select name="kelas" value={form.kelas} onChange={updateForm}><option>I</option><option>II</option><option>III</option><option>IV</option><option>V</option><option>VI</option></select></label>
              <label className="data-value-field"><span>Fase</span><select name="fase" value={form.fase} onChange={updateForm}><option>A</option><option>B</option><option>C</option></select></label>
              <label className="data-value-field"><span>Semester</span><select name="semester" value={form.semester} onChange={updateForm}><option>Ganjil</option><option>Genap</option></select></label>
              <label className="data-value-field"><span>Tahun pelajaran</span><input name="tahun_pelajaran" value={form.tahun_pelajaran} onChange={updateForm} placeholder="2025/2026" /></label>
              <label className="data-value-field"><span>Absensi sakit</span><input name="absensi_sakit" type="number" min="0" value={form.absensi_sakit} onChange={updateForm} /></label>
              <label className="data-value-field"><span>Absensi izin</span><input name="absensi_izin" type="number" min="0" value={form.absensi_izin} onChange={updateForm} /></label>
              <label className="data-value-field"><span>Tanpa keterangan</span><input name="absensi_tanpa_ket" type="number" min="0" value={form.absensi_tanpa_ket} onChange={updateForm} /></label>
              <label className="data-value-field"><span>Keputusan akhir</span><input name="keputusan_akhir" value={form.keputusan_akhir} onChange={updateForm} placeholder="Naik ke kelas berikutnya" /></label>
            </div>
            <label className="data-value-field"><span>Catatan wali kelas</span><textarea name="catatan_wali_kelas" value={form.catatan_wali_kelas} onChange={updateForm} rows="3" /></label>

            <h3>Nilai mata pelajaran</h3>
            {subjects.map((subject, index) => (
              <div className="data-value-subject" key={`${index}-${subject.id_nilai_mapel || 'baru'}`}>
                <label className="data-value-field"><span>Kategori</span><select name="kategori_mapel" value={subject.kategori_mapel} onChange={(event) => updateSubject(index, event)}><option>Wajib</option><option>Agama Adaptif</option><option>Seni Budaya</option><option>Muatan Lokal</option></select></label>
                <label className="data-value-field"><span>Mata pelajaran</span><input name="nama_mapel" value={subject.nama_mapel} onChange={(event) => updateSubject(index, event)} /></label>
                <label className="data-value-field"><span>Nilai akhir</span><input name="nilai_akhir" type="number" min="0" max="100" value={subject.nilai_akhir} onChange={(event) => updateSubject(index, event)} /></label>
                <label className="data-value-field subject-capacity"><span>Capaian kompetensi</span><input name="capaian_kompetensi" value={subject.capaian_kompetensi || ''} onChange={(event) => updateSubject(index, event)} /></label>
                <button type="button" aria-label="Hapus mata pelajaran" disabled={saving} onClick={() => removeSubject(index)}>×</button>
              </div>
            ))}
            <button type="button" className="data-value-add" onClick={() => setSubjects((current) => [...current, { ...emptySubject }])}><ModuleIcon name="plus" size="15" />Tambah mata pelajaran</button>
          </fieldset>
          <footer><button type="submit" className="module-primary-button" disabled={saving || !nisn}>{saving ? 'Menyimpan...' : 'Simpan data nilai'}</button></footer>
        </form>
      </section>
    </section>
  )
}

export default DataNilai
