import { useEffect, useState } from 'react'
import { createRequest, listRequests } from '../../../../../services/requests/requestService.js'
import './UsulanKoreksiData.css'

const fields = [
  ['alamat', 'Alamat'],
  ['nomor_telepon', 'Nomor telepon'],
  ['nama_panggilan', 'Nama panggilan'],
  ['agama', 'Agama'],
]

function UsulanKoreksiData({ students = [], initialNisn = '' }) {
  const [nisn, setNisn] = useState(() => initialNisn || students[0]?.nisn || '')
  const [values, setValues] = useState({})
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
      const requested = Object.fromEntries(fields
        .filter(([key]) => String(values[key] || '').trim())
        .map(([key]) => [key, String(values[key]).trim()]))
      if (!Object.keys(requested).length) {
        setError('Isi minimal satu data yang perlu dikoreksi.')
        return
      }
      const student = students.find((item) => item.nisn === nisn)
      await createRequest({
        nisn,
        jenis_perubahan: `Usulan koreksi ${student?.nama_lengkap || 'data siswa'}`,
        data_diajukan: requested,
      })
      setValues({})
      setNotice('Usulan berhasil dikirim ke operator untuk ditinjau.')
      setReload((current) => current + 1)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  const relevantRequests = requests.filter((request) => request.nisn === nisn)

  return (
    <section className="teacher-module-screen teacher-data-request">
      {notice && <p className="teacher-request-message" role="status">{notice}</p>}
      {error && <p className="teacher-request-error" role="alert">{error}</p>}
      <div className="teacher-module-heading">
        <div><span className="teacher-module-eyebrow">LAYANAN PERUBAHAN DATA</span><h1>Pengajuan Data Guru</h1><p>Ajukan koreksi data siswa binaan untuk ditinjau operator.</p></div>
      </div>
      <form className="teacher-request-card" onSubmit={submit}>
        <label>Siswa
          <select value={nisn} onChange={(event) => { setNisn(event.target.value); setValues({}) }} required>
            <option value="">Pilih siswa...</option>
            {students.map((student) => <option key={student.nisn} value={student.nisn}>{student.nama_lengkap} · {student.nisn}</option>)}
          </select>
        </label>
        {fields.map(([key, label]) => (
          <label key={key}>{label}
            {key === 'alamat'
              ? <textarea value={values[key] || ''} onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))} rows="2" maxLength="2000" />
              : <input value={values[key] || ''} onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))} maxLength="2000" />}
          </label>
        ))}
        <button type="submit" className="teacher-request-submit" disabled={saving || !students.length}>{saving ? 'Mengirim...' : 'Kirim usulan'}</button>
      </form>
      <section className="teacher-request-history">
        <h2>Riwayat untuk siswa ini</h2>
        {loading ? <p>Memuat riwayat...</p> : relevantRequests.length ? relevantRequests.map((request) => (
          <article key={request.id_pengajuan}>
            <strong>{request.jenis_perubahan}</strong>
            <span>{request.status} · {String(request.diajukan_pada).slice(0, 16)}</span>
            {request.catatan_peninjau && <p>Catatan operator: {request.catatan_peninjau}</p>}
          </article>
        )) : <p>{error ? 'Riwayat belum dapat dimuat.' : 'Belum ada usulan untuk siswa ini.'}</p>}
      </section>
    </section>
  )
}

export default UsulanKoreksiData
