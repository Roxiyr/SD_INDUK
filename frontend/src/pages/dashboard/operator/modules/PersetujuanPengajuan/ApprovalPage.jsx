import { useEffect, useState } from 'react'
import ModuleIcon from '../ModuleIcon.jsx'
import { listRequests, reviewRequest } from '../../../../../services/requests/requestService.js'
import './ApprovalPage.css'

function ApprovalPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [notes, setNotes] = useState({})
  const [reload, setReload] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    listRequests({ signal: controller.signal })
      .then(setRequests)
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') setError(requestError.message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [reload])

  async function decide(request, status) {
    setBusyId(request.id_pengajuan)
    setError('')
    try {
      await reviewRequest(request.id_pengajuan, {
        status,
        catatan_peninjau: notes[request.id_pengajuan] || '',
      })
      setNotice(`Pengajuan ${request.nama_lengkap} ${status.toLowerCase()}.`)
      setReload((value) => value + 1)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <section className="module-view approval-page">
      {notice && <div className="dashboard-notice" role="status">{notice}<button type="button" onClick={() => setNotice('')} aria-label="Tutup">×</button></div>}
      {error && <div className="approval-error" role="alert">{error}<button type="button" onClick={() => setError('')} aria-label="Tutup">×</button></div>}
      <div className="module-heading approval-page-heading">
        <div><span className="module-eyebrow">OPERATOR • PENGAJUAN TERSIMPAN</span><h1>Persetujuan Pengajuan Data</h1><p>Tinjau perubahan data siswa. Perubahan baru diterapkan setelah disetujui.</p></div>
      </div>
      <div className="approval-list">
        {loading ? <p className="approval-empty">Memuat pengajuan...</p> : requests.length ? requests.map((request) => {
          const submitted = typeof request.data_diajukan === 'string'
            ? JSON.parse(request.data_diajukan)
            : request.data_diajukan
          const previous = typeof request.data_sebelum === 'string'
            ? JSON.parse(request.data_sebelum)
            : request.data_sebelum
          return (
            <article className="approval-record" key={request.id_pengajuan}>
              <header>
                <div><span className="module-eyebrow">{request.jenis_perubahan}</span><h2>{request.nama_lengkap}</h2><p>NISN {request.nisn} · {String(request.diajukan_pada).slice(0, 16)}</p></div>
                <span className={`status-pill ${request.status === 'Menunggu' ? 'pending' : request.status === 'Disetujui' ? 'success' : 'pending'}`}><i />{request.status}</span>
              </header>
              <div className="approval-changes">
                {Object.entries(submitted || {}).map(([field, value]) => (
                  <div key={field}><strong>{field.replaceAll('_', ' ')}</strong><span>{String(previous?.[field] ?? '—')} <b>→</b> {String(value)}</span></div>
                ))}
              </div>
              {request.status === 'Menunggu' ? (
                <>
                  <label className="approval-note-field">Catatan operator<textarea value={notes[request.id_pengajuan] || ''} onChange={(event) => setNotes((current) => ({ ...current, [request.id_pengajuan]: event.target.value }))} rows="2" maxLength="2000" /></label>
                  <footer>
                    <button type="button" className="approval-reject" disabled={busyId === request.id_pengajuan} onClick={() => decide(request, 'Ditolak')}>Tolak</button>
                    <button type="button" className="approval-accept" disabled={busyId === request.id_pengajuan} onClick={() => decide(request, 'Disetujui')}><ModuleIcon name="check" size={15} />{busyId === request.id_pengajuan ? 'Memproses...' : 'Setujui & terapkan'}</button>
                  </footer>
                </>
              ) : request.catatan_peninjau && <p className="approval-review-note">Catatan: {request.catatan_peninjau}</p>}
            </article>
          )
        }) : <p className="approval-empty">{error ? 'Pengajuan tidak dapat dimuat.' : 'Belum ada pengajuan perubahan data.'}</p>}
      </div>
    </section>
  )
}

export default ApprovalPage
