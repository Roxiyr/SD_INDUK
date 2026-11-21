import { useEffect, useState } from 'react'
import ModuleIcon from '../../ModuleIcon.jsx'
import { apiRequest } from '../../../../../../services/apiClient.js'
import { listStudents } from '../../../../../../services/students/studentService.js'
import './CetakBukuInduk.css'

function CetakBukuInduk() {
  const [students, setStudents] = useState([])
  const [nisn, setNisn] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    listStudents({ limit: 500 })
      .then((result) => { if (!cancelled) setStudents(result.items) })
      .catch((requestError) => { if (!cancelled) setError(requestError.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  async function downloadPdf() {
    if (!nisn) return
    setDownloading(true)
    setError('')
    try {
      const response = await apiRequest(`/buku-induk/${encodeURIComponent(nisn)}/pdf`)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `buku-induk-${nisn}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setDownloading(false)
    }
  }

  const filtered = students.filter((student) => `${student.nama_lengkap} ${student.nisn} ${student.nis}`.toLowerCase().includes(search.toLowerCase()))

  return (
    <section className="module-view data-module-view print-book-page">
      <div className="module-heading data-module-heading">
        <div><span className="module-eyebrow">OUTPUT • BUKU INDUK PDF</span><h1>Cetak Buku Induk</h1><p>Pilih murid untuk menghasilkan lembar buku induk dari data murid dan nilai rapor.</p></div>
      </div>
      {error && <div className="print-book-error" role="alert">{error}</div>}
      <section className="print-book-layout">
        <aside className="print-book-list">
          <label className="table-search"><ModuleIcon name="search" size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari murid..." aria-label="Cari murid untuk dicetak" /></label>
          <div className="print-book-students">
            {loading ? <p>Memuat data murid...</p> : filtered.map((student) => (
              <button type="button" key={student.nisn} className={nisn === student.nisn ? 'active' : ''} onClick={() => setNisn(student.nisn)}>
                <span>{student.nama_lengkap.split(/\s+/).slice(0, 2).map((word) => word[0]).join('').toUpperCase()}</span>
                <div><strong>{student.nama_lengkap}</strong><small>NISN {student.nisn}</small></div>
              </button>
            ))}
            {!loading && !filtered.length && <p>Tidak ada murid ditemukan.</p>}
          </div>
        </aside>
        <article className="print-book-preview">
          <div className="print-book-cover">
            <span className="print-book-mark"><ModuleIcon name="graduation" size={31} /></span>
            <span className="print-book-kicker">BUKU INDUK SISWA</span>
            <h2>SD Negeri Batu Ampar 12 Pagi</h2>
            <p>Dokumen hasil gabungan data murid dan nilai rapor semester.</p>
          </div>
          <button type="button" className="module-primary-button" onClick={downloadPdf} disabled={!nisn || downloading}>
            <ModuleIcon name="download" size={16} />{downloading ? 'Menyiapkan PDF...' : 'Cetak / Unduh PDF'}
          </button>
        </article>
      </section>
    </section>
  )
}

export default CetakBukuInduk
