import { useEffect, useState } from 'react'
import { getClassAttendance, saveClassAttendance } from '../../../../services/attendance/attendanceService.js'

function localDate() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function TeacherAttendanceEditor({ classes = [] }) {
  const [selectedClassId, setSelectedClassId] = useState('')
  const classId = selectedClassId || String(classes[0]?.id_kelas || '')
  const [date, setDate] = useState(localDate)
  const [students, setStudents] = useState([])
  const [entries, setEntries] = useState({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [reload, setReload] = useState(0)
  const requestKey = `${classId}:${date}:${reload}`
  const [loadedKey, setLoadedKey] = useState('')
  const loading = Boolean(classId && date) && loadedKey !== requestKey

  useEffect(() => {
    if (!classId || !date) return undefined
    const controller = new AbortController()
    getClassAttendance(classId, date, { signal: controller.signal })
      .then((result) => {
        setStudents(result.students)
        setEntries(Object.fromEntries(result.students.map((student) => [
          student.nisn,
          { status_kehadiran: student.status_kehadiran, keterangan: student.keterangan },
        ])))
        setLoadedKey(requestKey)
      })
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') {
          setError(requestError.message)
          setLoadedKey(requestKey)
        }
      })
    return () => controller.abort()
  }, [classId, date, reload, requestKey])

  function updateEntry(nisn, field, value) {
    setEntries((current) => ({
      ...current,
      [nisn]: { ...current[nisn], [field]: value },
    }))
  }

  async function save(event) {
    event.preventDefault()
    setError('')
    setNotice('')
    if (!students.length) {
      setError('Tidak ada siswa aktif pada kelas ini.')
      return
    }
    if (students.some((student) => !entries[student.nisn]?.status_kehadiran)) {
      setError('Pilih status kehadiran untuk setiap siswa sebelum menyimpan.')
      return
    }
    setSaving(true)
    try {
      const result = await saveClassAttendance({
        id_kelas: Number(classId),
        tanggal: date,
        entries: students.map((student) => ({
          nisn: student.nisn,
          status_kehadiran: entries[student.nisn].status_kehadiran,
          keterangan: entries[student.nisn].keterangan || '',
        })),
      })
      setNotice(`${result.saved} data presensi berhasil disimpan.`)
      setReload((value) => value + 1)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  const present = students.filter((student) => entries[student.nisn]?.status_kehadiran === 'Hadir').length

  return (
    <section className="teacher-live-page">
      <header className="teacher-live-heading">
        <div><span className="teacher-module-eyebrow">TERHUBUNG KE DATABASE</span><h1>Rekap Presensi Siswa</h1><p>Catat kehadiran siswa binaan per kelas dan tanggal.</p></div>
      </header>
      {notice && <p className="teacher-live-notice" role="status">{notice}</p>}
      {error && <p className="teacher-live-error" role="alert">{error}</p>}
      <form className="teacher-live-form" onSubmit={save}>
        <div className="teacher-live-grid">
          <label>Kelas
            <select value={classId} onChange={(event) => { setError(''); setSelectedClassId(event.target.value) }} required>
              {classes.map((item) => <option key={item.id_kelas} value={item.id_kelas}>{item.nama_kelas} · Tingkat {item.tingkat}</option>)}
            </select>
          </label>
          <label>Tanggal
            <input type="date" value={date} onChange={(event) => { setError(''); setDate(event.target.value) }} required />
          </label>
        </div>
        <p className="teacher-attendance-summary">{present} hadir dari {students.length} siswa · {date}</p>
        {loading ? <p>Memuat presensi...</p> : (
          <div className="teacher-attendance-list">
            {students.map((student) => (
              <div className="teacher-attendance-row" key={student.nisn}>
                <div><strong>{student.nama_lengkap}</strong><small>NISN {student.nisn}</small></div>
                <select value={entries[student.nisn]?.status_kehadiran || ''} onChange={(event) => updateEntry(student.nisn, 'status_kehadiran', event.target.value)} required aria-label={`Status kehadiran ${student.nama_lengkap}`}>
                  <option value="">Pilih status</option><option>Hadir</option><option>Sakit</option><option>Izin</option><option>Alpa</option>
                </select>
                <input value={entries[student.nisn]?.keterangan || ''} onChange={(event) => updateEntry(student.nisn, 'keterangan', event.target.value)} maxLength="255" placeholder="Keterangan (opsional)" aria-label={`Keterangan ${student.nama_lengkap}`} />
              </div>
            ))}
            {!students.length && <p>Belum ada siswa aktif di kelas ini.</p>}
          </div>
        )}
        <footer><button type="submit" className="teacher-primary-action" disabled={saving || loading || !students.length}>{saving ? 'Menyimpan...' : 'Simpan presensi'}</button></footer>
      </form>
      {!classes.length && <p className="teacher-live-empty">Belum ada kelas yang ditugaskan ke akun Anda.</p>}
    </section>
  )
}

export default TeacherAttendanceEditor
