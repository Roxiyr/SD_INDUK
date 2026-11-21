import { useEffect, useMemo, useState } from 'react'
import ModuleIcon from '../../ModuleIcon.jsx'
import { createTeacher, deleteTeacher, getTeacherFormOptions, linkTeacherAccount, listTeachers, updateTeacher } from '../../../../../../services/teachers/teacherService.js'
import './DataGuru.css'

const emptyForm = {
  nama_lengkap: '',
  username: '',
  password: '',
  nip: '',
  nuptk: '',
  gelar_depan: '',
  gelar_belakang: '',
  nomor_telepon: '',
  email: '',
  id_kelas: '',
  id_mapel: '',
  peran: 'Guru Mapel',
}

function DataGuru({ search = '' }) {
  const [teachers, setTeachers] = useState([])
  const [teacherOptions, setTeacherOptions] = useState({ classes: [], subjects: [] })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pageError, setPageError] = useState('')
  const [notice, setNotice] = useState('')
  const [localSearch, setLocalSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState(null)
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    listTeachers({ signal: controller.signal })
      .then(setTeachers)
      .catch((error) => {
        if (error.name !== 'AbortError') setPageError(error.message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [reload])

  useEffect(() => {
    const controller = new AbortController()
    getTeacherFormOptions({ signal: controller.signal })
      .then(setTeacherOptions)
      .catch((error) => {
        if (error.name !== 'AbortError') setPageError(error.message)
      })
    return () => controller.abort()
  }, [])

  const filteredTeachers = useMemo(() => {
    const query = `${search} ${localSearch}`.trim().toLowerCase()
    if (!query) return teachers
    return teachers.filter((teacher) =>
      [teacher.nama_lengkap, teacher.nip, teacher.nuptk, teacher.email, teacher.username, teacher.penugasan]
        .some((value) => String(value || '').toLowerCase().includes(query)),
    )
  }, [search, localSearch, teachers])

  function updateField(event) {
    const { name, value } = event.target
    const selectedClass = name === 'id_kelas'
      ? teacherOptions.classes.find((item) => String(item.id_kelas) === value)
      : null
    const selectedRole = selectedClass?.has_wali_kelas && teacherOptions.subjects.length
      ? 'Guru Mapel'
      : null
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(selectedRole ? {
        peran: selectedRole,
        id_mapel: current.id_mapel || String(teacherOptions.subjects[0].id_mapel),
      } : {}),
      ...(name === 'peran' && value === 'Wali Kelas' ? { id_mapel: '' } : {}),
      ...(name === 'peran' && value === 'Guru Mapel' && !current.id_mapel && teacherOptions.subjects[0]
        ? { id_mapel: String(teacherOptions.subjects[0].id_mapel) }
        : {}),
    }))
  }

  function openCreateForm() {
    const defaultClass = teacherOptions.classes.find((item) => !item.has_wali_kelas) || teacherOptions.classes[0]
    const defaultRole = defaultClass?.has_wali_kelas && teacherOptions.subjects.length
      ? 'Guru Mapel'
      : 'Wali Kelas'
    setEditingTeacher(null)
    setForm({
      ...emptyForm,
      id_kelas: defaultClass ? String(defaultClass.id_kelas) : '',
      peran: defaultRole,
      id_mapel: defaultRole === 'Guru Mapel' && teacherOptions.subjects[0]
        ? String(teacherOptions.subjects[0].id_mapel)
        : '',
    })
    setFormError('')
    setFormOpen(true)
  }

  function openEditForm(teacher) {
    setEditingTeacher(teacher)
    setForm({
      ...emptyForm,
      nama_lengkap: teacher.nama_lengkap || '',
      username: teacher.username || '',
      nip: teacher.nip || '',
      nuptk: teacher.nuptk || '',
      gelar_depan: teacher.gelar_depan || '',
      gelar_belakang: teacher.gelar_belakang || '',
      nomor_telepon: teacher.nomor_telepon || '',
      email: teacher.email || '',
      id_kelas: '',
    })
    setFormError('')
    setFormOpen(true)
  }

  async function saveTeacher(event) {
    event.preventDefault()
    setSaving(true)
    setFormError('')
    try {
      const payload = {
        ...form,
        id_kelas: form.id_kelas ? Number(form.id_kelas) : null,
        id_mapel: form.id_mapel ? Number(form.id_mapel) : null,
      }
      if (editingTeacher?.id_guru) {
        await updateTeacher(editingTeacher.id_guru, payload)
        setNotice(`Data guru ${form.nama_lengkap} berhasil diperbarui.`)
      } else if (editingTeacher?.id_user) {
        await linkTeacherAccount(editingTeacher.id_user, payload)
        setNotice(`Profil ${form.nama_lengkap} berhasil ditautkan ke akun ${editingTeacher.username}.`)
      } else {
        const teacher = await createTeacher(payload)
        setNotice(`Data guru ${teacher.nama_lengkap} berhasil disimpan.`)
      }
      setFormOpen(false)
      setForm(emptyForm)
      setEditingTeacher(null)
      setReload((current) => current + 1)
    } catch (error) {
      setFormError(error.message)
    } finally {
      setSaving(false)
    }
  }

  async function archiveTeacher(teacher) {
    if (!window.confirm(`Nonaktifkan profil guru ${teacher.nama_lengkap}? Riwayat dan akun tetap disimpan.`)) return
    try {
      await deleteTeacher(teacher.id_guru)
      setNotice(`Profil ${teacher.nama_lengkap} dinonaktifkan.`)
      setReload((current) => current + 1)
    } catch (error) {
      setPageError(error.message)
    }
  }

  const activeTeachers = teachers.filter((teacher) => teacher.id_guru && teacher.status === 'Aktif').length
  const profiledTeachers = teachers.filter((teacher) => teacher.id_guru)

  return (
    <section className="module-view data-module-view teachers-page">
      {notice && <div className="dashboard-notice" role="status">{notice}<button type="button" onClick={() => setNotice('')} aria-label="Tutup">×</button></div>}
      {pageError && <div className="teacher-record-error" role="alert">{pageError}<button type="button" onClick={() => setPageError('')} aria-label="Tutup">×</button></div>}

      <div className="module-heading data-module-heading">
        <div>
          <span className="module-eyebrow">MASTER DATA • TERHUBUNG KE DATABASE</span>
          <h1>Data Guru</h1>
          <p>Data identitas dan akun guru yang tersimpan di database.</p>
        </div>
        <div className="module-toolbar">
          <button className="module-primary-button" type="button" onClick={openCreateForm}>
            <ModuleIcon name="plus" size={16} />Tambah guru
          </button>
        </div>
      </div>

      <section className="metrics-grid module-metrics" aria-label="Ringkasan data guru">
        {[
          ['Total guru', profiledTeachers.length, 'Profil guru tersimpan', 'graduation'],
          ['Guru aktif', activeTeachers, 'Status aktif', 'activity'],
          ['Memiliki NIP', profiledTeachers.filter((teacher) => teacher.nip).length, 'NIP tercatat', 'clipboard'],
          ['Memiliki NUPTK', profiledTeachers.filter((teacher) => teacher.nuptk).length, 'NUPTK tercatat', 'shield'],
        ].map(([title, value, detail, icon], index) => (
          <article className="metric-card" key={title}>
            <div className="metric-copy"><h2>{title}</h2><strong>{value}</strong><p>{detail}</p></div>
            <span className={`metric-icon ${['red', 'blue', 'purple', 'orange'][index]}`}><ModuleIcon name={icon} size={18} /></span>
          </article>
        ))}
      </section>

      <section className="module-table-card">
        <div className="table-tools">
          <label className="table-search">
            <ModuleIcon name="search" size={16} />
            <input value={localSearch} onChange={(event) => setLocalSearch(event.target.value)} placeholder="Cari nama, NIP, NUPTK, atau akun..." aria-label="Cari data guru" />
          </label>
          <span className="table-count"><ModuleIcon name="settings" size={13} /> {filteredTeachers.length} data</span>
        </div>
        <div className="module-table-wrap">
          <table className="module-table">
            <thead><tr><th>NO</th><th>NAMA GURU</th><th>NIP</th><th>NUPTK</th><th>AKUN</th><th>PENUGASAN</th><th>EMAIL</th><th>STATUS</th><th>AKSI</th></tr></thead>
            <tbody>
              {loading ? <tr><td className="empty-table" colSpan="9">Memuat data guru...</td></tr> : filteredTeachers.length ? filteredTeachers.map((teacher, index) => (
                <tr key={teacher.id_guru || `account-${teacher.id_user}`}>
                  <td><span className="row-number">{String(index + 1).padStart(2, '0')}</span></td>
                  <td><span className="table-person"><span>{teacher.nama_lengkap.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}</span><strong>{[teacher.gelar_depan, teacher.nama_lengkap, teacher.gelar_belakang].filter(Boolean).join(' ')}</strong></span></td>
                  <td>{teacher.nip || '—'}</td>
                  <td>{teacher.nuptk || '—'}</td>
                  <td>{teacher.username || '—'}</td>
                  <td>{teacher.penugasan || 'Belum ditugaskan'}</td>
                  <td>{teacher.email || '—'}</td>
                  <td><span className={`status-pill ${teacher.status === 'Aktif' ? 'success' : 'pending'}`}><i />{teacher.status}</span></td>
                  <td className="row-actions">
                    <button type="button" aria-label={`${teacher.id_guru ? 'Ubah' : 'Lengkapi profil'} ${teacher.nama_lengkap}`} title={teacher.id_guru ? 'Ubah profil' : 'Lengkapi profil'} onClick={() => openEditForm(teacher)}><ModuleIcon name={teacher.id_guru ? 'edit' : 'plus'} size={15} /></button>
                    {teacher.id_guru && teacher.status === 'Aktif' && <button type="button" aria-label={`Nonaktifkan ${teacher.nama_lengkap}`} title="Nonaktifkan profil" onClick={() => archiveTeacher(teacher)}><ModuleIcon name="trash" size={15} /></button>}
                  </td>
                </tr>
              )) : <tr><td className="empty-table" colSpan="9">{pageError ? 'Data guru tidak dapat dimuat.' : 'Belum ada data guru. Gunakan “Tambah guru” untuk mengisi data.'}</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="table-footer"><span>Menampilkan {filteredTeachers.length} akun guru dari {profiledTeachers.length} profil</span></div>
      </section>

      {formOpen && (
        <div className="teacher-record-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setFormOpen(false) }}>
          <section className="teacher-record-dialog" role="dialog" aria-modal="true" aria-labelledby="teacher-record-title">
            <header className="teacher-record-dialog-header">
              <div><span className="module-eyebrow">{editingTeacher ? (editingTeacher.id_guru ? 'UBAH DATA' : 'TAUTKAN AKUN') : 'DATA BARU'}</span><h2 id="teacher-record-title">{editingTeacher ? (editingTeacher.id_guru ? 'Ubah profil guru' : 'Lengkapi profil guru') : 'Tambah guru'}</h2><p>{editingTeacher ? `Akun: ${editingTeacher.username}.` : 'Form ini menyimpan profil guru sekaligus akun login.'}</p></div>
              <button type="button" onClick={() => setFormOpen(false)} disabled={saving} aria-label="Tutup formulir">×</button>
            </header>
            <form onSubmit={saveTeacher}>
              <div className="teacher-record-form">
                <label><span>Nama lengkap *</span><input name="nama_lengkap" value={form.nama_lengkap} onChange={updateField} required /></label>
                {!editingTeacher && <>
                  <label><span>Username login *</span><input name="username" value={form.username} onChange={updateField} required autoComplete="username" /></label>
                  <label><span>Kata sandi awal *</span><input name="password" type="password" value={form.password} onChange={updateField} minLength="8" required autoComplete="new-password" /><small>Minimal 8 karakter.</small></label>
                </>}
                <label><span>NIP</span><input name="nip" value={form.nip} onChange={updateField} /></label>
                <label><span>NUPTK</span><input name="nuptk" value={form.nuptk} onChange={updateField} /></label>
                <label><span>Gelar depan</span><input name="gelar_depan" value={form.gelar_depan} onChange={updateField} /></label>
                <label><span>Gelar belakang</span><input name="gelar_belakang" value={form.gelar_belakang} onChange={updateField} /></label>
                <label><span>Nomor telepon</span><input name="nomor_telepon" value={form.nomor_telepon} onChange={updateField} /></label>
                <label><span>Email</span><input name="email" type="email" value={form.email} onChange={updateField} /></label>
                {!editingTeacher?.id_guru && <label>
                  <span>Kelas yang ditugaskan</span>
                  <select name="id_kelas" value={form.id_kelas} onChange={updateField}>
                    <option value="">Tidak ditugaskan</option>
                    {teacherOptions.classes.map((item) => (
                      <option key={item.id_kelas} value={item.id_kelas}>
                        {item.nama_kelas} — Tingkat {item.tingkat}{item.has_wali_kelas ? ' (sudah ada wali kelas)' : ''}
                      </option>
                    ))}
                  </select>
                </label>}
                {!editingTeacher?.id_guru && form.id_kelas && (
                  <>
                    <label>
                      <span>Peran mengajar *</span>
                      <select name="peran" value={form.peran} onChange={updateField} required>
                        <option value="Wali Kelas">Wali Kelas</option>
                        <option value="Guru Mapel" disabled={!teacherOptions.subjects.length}>Guru Mapel</option>
                      </select>
                    </label>
                    {form.peran === 'Guru Mapel' && (
                      <label>
                        <span>Mata pelajaran *</span>
                        <select name="id_mapel" value={form.id_mapel} onChange={updateField} required>
                          {teacherOptions.subjects.map((subject) => (
                            <option key={subject.id_mapel} value={subject.id_mapel}>{subject.nama_mapel}</option>
                          ))}
                        </select>
                      </label>
                    )}
                  </>
                )}
                {!editingTeacher?.id_guru && !teacherOptions.classes.length && (
                  <p className="teacher-record-form-note">Belum ada kelas aktif. Profil dan akun guru tetap dapat disimpan, lalu penugasan dapat ditambahkan setelah kelas tersedia.</p>
                )}
              </div>
              {formError && <p className="teacher-record-form-error" role="alert">{formError}</p>}
              <footer className="teacher-record-dialog-actions">
                <button type="button" className="module-secondary-button" onClick={() => setFormOpen(false)} disabled={saving}>Batal</button>
                <button type="submit" className="module-primary-button" disabled={saving}>{saving ? 'Menyimpan...' : editingTeacher ? 'Simpan perubahan' : 'Simpan guru'}</button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </section>
  )
}

export default DataGuru
