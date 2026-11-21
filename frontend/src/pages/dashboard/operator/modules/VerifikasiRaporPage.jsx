import { useEffect, useMemo, useState } from 'react'
import {
  listApprovedReports,
  listPendingVerifications,
  reopenApprovedReport,
  reviewReportVerification,
} from '../../../../services/reports/raporService.js'
import './VerifikasiRaporPage.css'

function VerifikasiRaporPage() {
  const [reports, setReports] = useState([])
  const [approvedReports, setApprovedReports] = useState([])
  const [comments, setComments] = useState({})
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [query, setQuery] = useState('')
  const [reload, setReload] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    Promise.all([
      listPendingVerifications({ signal: controller.signal }),
      listApprovedReports({ signal: controller.signal }),
    ])
      .then(([pending, approved]) => {
        setReports(pending)
        setApprovedReports(approved)
      })
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') setError(requestError.message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [reload])

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    return reports.filter((report) => `${report.nama_lengkap} ${report.nisn} ${report.kelas}`.toLowerCase().includes(term))
  }, [reports, query])
  const filteredApproved = useMemo(() => {
    const term = query.trim().toLowerCase()
    return approvedReports.filter((report) => `${report.nama_lengkap} ${report.nisn} ${report.kelas}`.toLowerCase().includes(term))
  }, [approvedReports, query])

  async function review(report, status) {
    const catatan = comments[report.id_rapor]?.trim() || ''
    if (status !== 'Disetujui' && !catatan) {
      setError('Isi catatan untuk meminta revisi atau menolak rapor.')
      return
    }
    setSavingId(String(report.id_rapor))
    setError('')
    setNotice('')
    setLoading(true)
    try {
      await reviewReportVerification(report.id_rapor, { status, catatan })
      setNotice(`Rapor ${report.nama_lengkap} ${status.toLowerCase()}.`)
      setReload((value) => value + 1)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSavingId('')
    }
  }

  async function reopen(report) {
    const catatan = comments[report.id_rapor]?.trim() || ''
    if (!catatan) {
      setError('Isi catatan untuk membuka kembali rapor yang disetujui.')
      return
    }
    setSavingId(String(report.id_rapor))
    setError('')
    setNotice('')
    setLoading(true)
    try {
      await reopenApprovedReport(report.id_rapor, catatan)
      setNotice(`Rapor ${report.nama_lengkap} dikembalikan ke guru untuk revisi.`)
      setComments((current) => ({ ...current, [report.id_rapor]: '' }))
      setReload((value) => value + 1)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSavingId('')
    }
  }

  return (
    <section className="operator-report-review">
      <header className="operator-review-heading">
        <div><span>ALUR GURU → OPERATOR → MURID</span><h1>Verifikasi Rapor</h1><p>Rapor yang disetujui baru akan ditampilkan kepada murid pada dashboard mereka.</p></div>
        <strong>{reports.length} menunggu</strong>
      </header>
      {notice && <p className="operator-review-notice" role="status">{notice}</p>}
      {error && <p className="operator-review-error" role="alert">{error}</p>}
      <label className="operator-review-search">Cari nama atau NISN
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ketik nama siswa atau NISN" />
      </label>
      {loading ? <p className="operator-review-empty">Memuat rapor...</p> : filtered.length ? (
        <div className="operator-review-list">
          {filtered.map((report) => (
            <article key={report.id_rapor}>
              <header><div><strong>{report.nama_lengkap}</strong><span>NISN {report.nisn} · Kelas {report.kelas} · {report.semester} {report.tahun_pelajaran}</span></div><b>{report.jumlah_mapel} mapel · {report.jumlah_p5} P5</b></header>
              {report.catatan_wali_kelas && <p className="operator-review-teacher-note">Catatan guru: {report.catatan_wali_kelas}</p>}
              <label>Catatan peninjau
                <textarea rows="2" maxLength="2000" value={comments[report.id_rapor] ?? ''} onChange={(event) => setComments((current) => ({ ...current, [report.id_rapor]: event.target.value }))} placeholder="Wajib diisi jika meminta revisi atau menolak" />
              </label>
              <footer>
                <button type="button" className="operator-review-revision" disabled={savingId === String(report.id_rapor)} onClick={() => review(report, 'Perlu Revisi')}>Minta revisi</button>
                <button type="button" className="operator-review-reject" disabled={savingId === String(report.id_rapor)} onClick={() => review(report, 'Ditolak')}>Tolak</button>
                <button type="button" className="operator-review-approve" disabled={savingId === String(report.id_rapor)} onClick={() => review(report, 'Disetujui')}>{savingId === String(report.id_rapor) ? 'Menyimpan...' : 'Setujui rapor'}</button>
              </footer>
            </article>
          ))}
        </div>
      ) : <p className="operator-review-empty">{error ? 'Daftar rapor belum dapat dimuat.' : 'Tidak ada rapor yang menunggu verifikasi.'}</p>}

      <section className="operator-approved-reports">
        <header>
          <div><h2>Rapor disetujui</h2><p>Gunakan tindakan revisi jika ada nilai yang perlu diperbaiki. Rapor akan disembunyikan dari murid sampai disetujui kembali.</p></div>
          <strong>{approvedReports.length} rapor</strong>
        </header>
        {loading ? <p className="operator-review-empty">Memuat rapor disetujui...</p> : filteredApproved.length ? (
          <div className="operator-review-list">
            {filteredApproved.map((report) => (
              <article key={report.id_rapor}>
                <header><div><strong>{report.nama_lengkap}</strong><span>NISN {report.nisn} · Kelas {report.kelas} · {report.semester} {report.tahun_pelajaran}</span></div><b>{report.jumlah_mapel} mapel · {report.jumlah_p5} P5</b></header>
                {report.catatan_wali_kelas && <p className="operator-review-teacher-note">Catatan guru: {report.catatan_wali_kelas}</p>}
                <label>Catatan revisi
                  <textarea rows="2" maxLength="2000" value={comments[report.id_rapor] ?? ''} onChange={(event) => setComments((current) => ({ ...current, [report.id_rapor]: event.target.value }))} placeholder="Jelaskan bagian yang harus diperbaiki" />
                </label>
                <footer><button type="button" className="operator-review-revision" disabled={savingId === String(report.id_rapor)} onClick={() => reopen(report)}>{savingId === String(report.id_rapor) ? 'Menyimpan...' : 'Kembalikan untuk revisi'}</button></footer>
              </article>
            ))}
          </div>
        ) : <p className="operator-review-empty">{error ? 'Daftar rapor belum dapat dimuat.' : 'Tidak ada rapor disetujui yang cocok dengan pencarian.'}</p>}
      </section>
    </section>
  )
}

export default VerifikasiRaporPage
