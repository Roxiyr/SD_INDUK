import { useEffect, useState } from 'react'
import { cancelRequest, createRequest, listRequests } from '../../../../../services/requests/requestService.js'
import './PengajuanPerubahanData.css'

const editableFields = [
  ['alamat', 'Alamat', 'textarea'],
  ['nomor_telepon', 'Nomor telepon', 'text'],
  ['nama_panggilan', 'Nama panggilan', 'text'],
  ['tempat_lahir', 'Tempat lahir', 'text'],
  ['agama', 'Agama', 'text'],
  ['kewarganegaraan', 'Kewarganegaraan', 'text'],
  ['bahasa_sehari_hari', 'Bahasa sehari-hari', 'text'],
  ['bertempat_tinggal_pada', 'Tinggal bersama', 'text'],
]

function PengajuanPerubahanData({ onNotice, profile }) {
  const [values, setValues] = useState(() => Object.fromEntries(
    editableFields.map(([key]) => [key, profile?.[key] || '']),
  ))
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
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

  async function submit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')
    try {
      const requested = Object.fromEntries(editableFields
        .filter(([key]) => String(values[key] || '').trim() !== String(profile?.[key] || '').trim())
        .map(([key]) => [key, String(values[key] || '').trim()]))
      if (!Object.keys(requested).length) {
        setError('Ubah minimal satu data sebelum mengirim pengajuan.')
        return
      }
      const fields = editableFields.filter(([key]) => Object.hasOwn(requested, key)).map(([, label]) => label)
      await createRequest({ jenis_perubahan: `Perubahan ${fields.join(', ')}`, data_diajukan: requested })
      setNotice('Pengajuan terkirim. Perubahan akan diterapkan setelah disetujui operator.')
      setReload((current) => current + 1)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function cancel(id) {
    setError('')
    try {
      await cancelRequest(id)
      setNotice('Pengajuan dibatalkan.')
      setReload((current) => current + 1)
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return (
    <div className="student-request-page">
      <header className="student-page-header">
        <div><span className="student-page-eyebrow">LAYANAN PERUBAHAN DATA</span><h1>Pengajuan Data Siswa</h1><p>Ajukan perubahan profil untuk ditinjau operator sekolah.</p></div>
      </header>
      {notice && <p className="student-request-message" role="status">{notice}{onNotice && <button type="button" onClick={() => { setNotice(''); onNotice('') }} aria-label="Tutup">×</button>}</p>}
      {error && <p className="student-request-error" role="alert">{error}</p>}
      <section className="student-request-card">
        <h2>Data yang ingin diperbarui</h2>
        <p>Data buku induk tidak berubah sampai operator menyetujui pengajuan.</p>
        <form onSubmit={submit}>
          {editableFields.map(([key, label, type]) => (
            <label key={key} htmlFor={`request-${key}`}>{label}
              {type === 'textarea'
                ? <textarea id={`request-${key}`} value={values[key] || ''} onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))} rows="3" maxLength="2000" />
                : <input id={`request-${key}`} type="text" value={values[key] || ''} onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))} maxLength="2000" />}
            </label>
          ))}
          <button className="student-request-submit" type="submit" disabled={saving}>{saving ? 'Mengirim...' : 'Kirim pengajuan'}</button>
        </form>
      </section>
      <section className="student-request-history">
        <h2>Riwayat pengajuan</h2>
        {loading ? <p>Memuat riwayat...</p> : requests.length ? requests.map((request) => (
          <article key={request.id_pengajuan}>
            <div><strong>{request.jenis_perubahan}</strong><span>{String(request.diajukan_pada).slice(0, 16)}</span></div>
            <span className={`student-page-status request-status-${request.status.toLowerCase()}`}>{request.status}</span>
            {request.catatan_peninjau && <p>Catatan operator: {request.catatan_peninjau}</p>}
            {request.status === 'Menunggu' && <button type="button" onClick={() => cancel(request.id_pengajuan)}>Batalkan</button>}
          </article>
        )) : <p>{error ? 'Riwayat pengajuan tidak dapat dimuat.' : 'Belum ada pengajuan.'}</p>}
      </section>
    </div>
  )
}

export default PengajuanPerubahanData
