import { useEffect, useMemo, useState } from 'react'
import {
  createSchedule,
  deleteSchedule,
  getScheduleOptions,
  listSchedules,
  updateSchedule,
} from '../../../services/schedule/scheduleService.js'
import './ScheduleManager.css'

const blankSchedule = {
  id_jadwal: '',
  id_kelas: '',
  id_guru: '',
  id_mapel: '',
  hari: 'Senin',
  jam_mulai: '07:00',
  jam_selesai: '08:00',
  ruang: '',
}

const weekdays = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

function ScheduleManager({ role }) {
  const isOperator = role === 'OPERATOR'
  const [options, setOptions] = useState({ classes: [], teachers: [], subjects: [] })
  const [filterClassId, setFilterClassId] = useState('')
  const [form, setForm] = useState(blankSchedule)
  const [schedules, setSchedules] = useState([])
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [loadingSchedules, setLoadingSchedules] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [reload, setReload] = useState(0)

  const formValues = useMemo(() => ({
    ...form,
    id_kelas: form.id_kelas || String(options.classes[0]?.id_kelas || ''),
    id_guru: form.id_guru || String(options.teachers[0]?.id_guru || ''),
    id_mapel: form.id_mapel || String(options.subjects[0]?.id_mapel || ''),
  }), [form, options])

  useEffect(() => {
    const controller = new AbortController()
    getScheduleOptions({ signal: controller.signal })
      .then(setOptions)
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') setError(requestError.message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingOptions(false)
      })
    return () => controller.abort()
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    listSchedules(filterClassId, { signal: controller.signal })
      .then((result) => setSchedules(result.schedules))
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') setError(requestError.message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingSchedules(false)
      })
    return () => controller.abort()
  }, [filterClassId, reload])

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  function changeFilterClass(event) {
    setLoadingSchedules(true)
    setError('')
    setFilterClassId(event.target.value)
  }

  function startEdit(schedule) {
    setError('')
    setNotice('')
    setForm({
      id_jadwal: String(schedule.id_jadwal),
      id_kelas: String(schedule.id_kelas),
      id_guru: String(schedule.id_guru),
      id_mapel: String(schedule.id_mapel),
      hari: schedule.hari,
      jam_mulai: String(schedule.jam_mulai).slice(0, 5),
      jam_selesai: String(schedule.jam_selesai).slice(0, 5),
      ruang: schedule.ruang || '',
    })
  }

  async function save(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')
    const payload = {
      id_kelas: Number(formValues.id_kelas),
      id_mapel: Number(formValues.id_mapel),
      hari: formValues.hari,
      jam_mulai: formValues.jam_mulai,
      jam_selesai: formValues.jam_selesai,
      ruang: formValues.ruang.trim(),
    }
    if (isOperator) payload.id_guru = Number(formValues.id_guru)
    try {
      if (formValues.id_jadwal) await updateSchedule(formValues.id_jadwal, payload)
      else await createSchedule(payload)
      setForm(blankSchedule)
      setNotice(formValues.id_jadwal ? 'Jadwal berhasil diperbarui.' : 'Jadwal berhasil ditambahkan.')
      setLoadingSchedules(true)
      setReload((current) => current + 1)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function remove(schedule) {
    if (!window.confirm(`Nonaktifkan jadwal ${schedule.nama_mapel} hari ${schedule.hari}?`)) return
    setError('')
    setNotice('')
    try {
      await deleteSchedule(schedule.id_jadwal)
      setNotice('Jadwal berhasil dinonaktifkan.')
      if (String(formValues.id_jadwal) === String(schedule.id_jadwal)) setForm(blankSchedule)
      setLoadingSchedules(true)
      setReload((current) => current + 1)
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return (
    <section className="shared-schedule-page">
      <header className="shared-schedule-heading">
        <div>
          <span className="shared-schedule-eyebrow">JADWAL TERHUBUNG ANTAR DASHBOARD</span>
          <h1>Jadwal Pelajaran</h1>
          <p>Jadwal yang dikelola di sini dibaca oleh dashboard guru dan murid.</p>
        </div>
      </header>
      {notice && <p className="shared-schedule-notice" role="status">{notice}</p>}
      {error && <p className="shared-schedule-error" role="alert">{error}</p>}

      <form className="shared-schedule-form" onSubmit={save}>
        <h2>{formValues.id_jadwal ? 'Ubah jadwal' : 'Tambah jadwal'}</h2>
        <div className="shared-schedule-fields">
          <label>Kelas
            <select name="id_kelas" value={formValues.id_kelas} onChange={updateField} required>
              <option value="">Pilih kelas</option>
              {options.classes.map((item) => <option key={item.id_kelas} value={item.id_kelas}>{item.nama_kelas}</option>)}
            </select>
          </label>
          {isOperator && <label>Guru
            <select name="id_guru" value={formValues.id_guru} onChange={updateField} required>
              <option value="">Pilih guru</option>
              {options.teachers.map((item) => <option key={item.id_guru} value={item.id_guru}>{item.nama_lengkap}</option>)}
            </select>
          </label>}
          <label>Mata pelajaran
            <select name="id_mapel" value={formValues.id_mapel} onChange={updateField} required>
              <option value="">Pilih mata pelajaran</option>
              {options.subjects.map((item) => <option key={item.id_mapel} value={item.id_mapel}>{item.nama_mapel}</option>)}
            </select>
          </label>
          <label>Hari
            <select name="hari" value={formValues.hari} onChange={updateField}>
              {weekdays.map((day) => <option key={day}>{day}</option>)}
            </select>
          </label>
          <label>Mulai<input name="jam_mulai" type="time" value={formValues.jam_mulai} onChange={updateField} required /></label>
          <label>Selesai<input name="jam_selesai" type="time" value={formValues.jam_selesai} onChange={updateField} required /></label>
          <label>Ruang<input name="ruang" value={formValues.ruang} onChange={updateField} maxLength="50" /></label>
        </div>
        {!isOperator && <p className="shared-schedule-help">Jadwal akan memakai akun guru Anda dan dibatasi pada kelas penugasan.</p>}
        <footer>
          {formValues.id_jadwal && <button type="button" className="shared-schedule-cancel" onClick={() => setForm(blankSchedule)}>Batal ubah</button>}
          <button type="submit" className="shared-schedule-submit" disabled={saving || loadingOptions || !options.classes.length || !options.subjects.length}>
            {saving ? 'Menyimpan...' : formValues.id_jadwal ? 'Simpan perubahan' : 'Tambah jadwal'}
          </button>
        </footer>
      </form>

      <section className="shared-schedule-list">
        <header>
          <h2>Jadwal tersimpan</h2>
          <label>Filter kelas
            <select value={filterClassId} onChange={changeFilterClass}>
              <option value="">Semua kelas</option>
              {options.classes.map((item) => <option key={item.id_kelas} value={item.id_kelas}>{item.nama_kelas}</option>)}
            </select>
          </label>
        </header>
        {loadingSchedules ? <p>Memuat jadwal...</p> : schedules.length ? (
          <div className="shared-schedule-table-wrap">
            <table>
              <thead><tr><th>Hari / Waktu</th><th>Kelas</th><th>Mata pelajaran</th><th>Guru</th><th>Ruang</th><th>Aksi</th></tr></thead>
              <tbody>{schedules.map((schedule) => (
                <tr key={schedule.id_jadwal}>
                  <td>{schedule.hari}<small>{String(schedule.jam_mulai).slice(0, 5)}–{String(schedule.jam_selesai).slice(0, 5)}</small></td>
                  <td>{schedule.nama_kelas}</td>
                  <td>{schedule.nama_mapel}</td>
                  <td>{schedule.nama_guru}</td>
                  <td>{schedule.ruang || '—'}</td>
                  <td><div className="shared-schedule-actions">
                    <button type="button" onClick={() => startEdit(schedule)}>Ubah</button>
                    <button type="button" onClick={() => remove(schedule)}>Nonaktifkan</button>
                  </div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        ) : <p>{error ? 'Jadwal belum dapat dimuat.' : 'Belum ada jadwal aktif untuk tahun ajaran ini.'}</p>}
      </section>
    </section>
  )
}

export default ScheduleManager
