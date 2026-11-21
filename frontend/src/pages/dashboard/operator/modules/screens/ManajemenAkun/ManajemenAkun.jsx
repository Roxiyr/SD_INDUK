import { useEffect, useMemo, useState } from 'react'
import ModuleIcon from '../../ModuleIcon.jsx'
import { createUser, deleteUser, listUsers, updateUser } from '../../../../../../services/users/userService.js'
import './ManajemenAkun.css'

const emptyForm = { username: '', nama_lengkap: '', password: '' }
const emptyEditForm = { nama_lengkap: '', password: '' }

const roleLabels = {
  OPERATOR: 'Operator',
  GURU: 'Guru',
  SISWA: 'Murid',
}

function ManajemenAkun({ search = '' }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [reload, setReload] = useState(0)
  const [pageError, setPageError] = useState('')
  const [formError, setFormError] = useState('')
  const [notice, setNotice] = useState('')
  const [localSearch, setLocalSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editingUser, setEditingUser] = useState(null)
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    listUsers({ signal: controller.signal })
      .then(setUsers)
      .catch((error) => {
        if (error.name !== 'AbortError') setPageError(error.message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [reload])

  const filteredUsers = useMemo(() => {
    const query = `${search} ${localSearch}`.trim().toLowerCase()
    if (!query) return users
    return users.filter((user) =>
      [user.username, user.nama_lengkap, roleLabels[user.role], user.nisn]
        .some((value) => String(value || '').toLowerCase().includes(query)),
    )
  }, [search, localSearch, users])

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function saveAccount(event) {
    event.preventDefault()
    setSaving(true)
    setFormError('')
    try {
      await createUser({ ...form, role: 'OPERATOR' })
      setNotice('Akun operator berhasil dibuat.')
      setFormOpen(false)
      setForm(emptyForm)
      setReload((current) => current + 1)
    } catch (error) {
      setFormError(error.message)
    } finally {
      setSaving(false)
    }
  }

  function openEdit(user) {
    setEditingUser(user)
    setForm({ ...emptyEditForm, nama_lengkap: user.nama_lengkap })
    setFormError('')
    setFormOpen(true)
  }

  async function saveEdit(event) {
    event.preventDefault()
    setSaving(true)
    setFormError('')
    try {
      const payload = { nama_lengkap: form.nama_lengkap }
      if (form.password) payload.password = form.password
      await updateUser(editingUser.id_user, payload)
      setNotice(`Akun ${editingUser.username} berhasil diperbarui.`)
      setFormOpen(false)
      setEditingUser(null)
      setReload((current) => current + 1)
    } catch (error) {
      setFormError(error.message)
    } finally {
      setSaving(false)
    }
  }

  async function removeAccount(user) {
    if (!window.confirm(`Hapus akses akun ${user.username} (${user.nama_lengkap})? Data profil sekolahnya tidak ikut dihapus.`)) return
    setActionError('')
    try {
      await deleteUser(user.id_user)
      setNotice(`Akses akun ${user.username} berhasil dihapus.`)
      setReload((current) => current + 1)
    } catch (error) {
      setActionError(error.message)
    }
  }

  const operatorCount = users.filter((user) => user.role === 'OPERATOR').length
  const teacherCount = users.filter((user) => user.role === 'GURU').length
  const studentCount = users.filter((user) => user.role === 'SISWA').length

  return (
    <section className="module-view data-module-view account-management-page">
      {notice && <div className="dashboard-notice" role="status">{notice}<button type="button" onClick={() => setNotice('')} aria-label="Tutup">×</button></div>}
      {pageError && <div className="teacher-record-error" role="alert">{pageError}<button type="button" onClick={() => setPageError('')} aria-label="Tutup">×</button></div>}
      {actionError && <div className="teacher-record-error" role="alert">{actionError}<button type="button" onClick={() => setActionError('')} aria-label="Tutup">×</button></div>}

      <div className="module-heading data-module-heading">
        <div>
          <span className="module-eyebrow">PENGATURAN • TERHUBUNG KE DATABASE</span>
          <h1>Manajemen Akun</h1>
          <p>Akun contoh tetap disimpan. Akun guru dan murid dibuat bersama profilnya di halaman masing-masing.</p>
        </div>
        <div className="module-toolbar">
          <button className="module-primary-button" type="button" onClick={() => { setEditingUser(null); setForm(emptyForm); setFormError(''); setFormOpen(true) }}>
            <ModuleIcon name="plus" size={16} />Tambah akun operator
          </button>
        </div>
      </div>

      <section className="metrics-grid module-metrics" aria-label="Ringkasan akun">
        {[
          ['Total akun', users.length, 'Semua akun contoh dan aktif', 'users'],
          ['Operator', operatorCount, 'Akun administrasi', 'settings'],
          ['Guru', teacherCount, 'Akun login guru', 'graduation'],
          ['Murid', studentCount, 'Akun login murid', 'activity'],
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
            <input value={localSearch} onChange={(event) => setLocalSearch(event.target.value)} placeholder="Cari nama, username, atau peran..." aria-label="Cari akun" />
          </label>
          <span className="table-count"><ModuleIcon name="settings" size={13} /> {filteredUsers.length} akun</span>
        </div>
        <div className="module-table-wrap">
          <table className="module-table">
            <thead><tr><th>NO</th><th>NAMA PENGGUNA</th><th>USERNAME</th><th>PERAN</th><th>NISN TERKAIT</th><th>DIBUAT</th><th>AKSI</th></tr></thead>
            <tbody>
              {loading ? <tr><td className="empty-table" colSpan="7">Memuat akun...</td></tr> : filteredUsers.length ? filteredUsers.map((user, index) => (
                <tr key={user.id_user}>
                  <td><span className="row-number">{String(index + 1).padStart(2, '0')}</span></td>
                  <td><span className="table-person"><span>{user.nama_lengkap.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}</span><strong>{user.nama_lengkap}</strong></span></td>
                  <td>{user.username}</td>
                  <td>{roleLabels[user.role] || user.role}</td>
                  <td>{user.nisn || '—'}</td>
                  <td>{user.created_at ? String(user.created_at).slice(0, 10) : '—'}</td>
                  <td className="row-actions">
                    <button type="button" aria-label={`Ubah akun ${user.username}`} title="Ubah nama atau kata sandi" onClick={() => openEdit(user)}><ModuleIcon name="edit" size={15} /></button>
                    <button type="button" aria-label={`Hapus akses ${user.username}`} title="Hapus akses akun" onClick={() => removeAccount(user)}><ModuleIcon name="trash" size={15} /></button>
                  </td>
                </tr>
              )) : <tr><td className="empty-table" colSpan="7">{pageError ? 'Daftar akun tidak dapat dimuat.' : 'Belum ada akun yang cocok.'}</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="table-footer"><span>Menampilkan {filteredUsers.length} dari {users.length} akun</span></div>
      </section>

      {formOpen && (
        <div className="teacher-record-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setFormOpen(false) }}>
          <section className="teacher-record-dialog account-record-dialog" role="dialog" aria-modal="true" aria-labelledby="account-record-title">
            <header className="teacher-record-dialog-header">
              <div><span className="module-eyebrow">{editingUser ? 'UBAH AKUN' : 'AKUN BARU'}</span><h2 id="account-record-title">{editingUser ? `Ubah akun ${editingUser.username}` : 'Tambah akun operator'}</h2><p>{editingUser ? 'Kosongkan kata sandi jika tidak ingin menggantinya.' : 'Akun akan langsung dapat digunakan setelah disimpan.'}</p></div>
              <button type="button" onClick={() => setFormOpen(false)} disabled={saving} aria-label="Tutup formulir">×</button>
            </header>
            <form onSubmit={editingUser ? saveEdit : saveAccount}>
              <div className="teacher-record-form">
                <label><span>Nama lengkap *</span><input name="nama_lengkap" value={form.nama_lengkap} onChange={updateField} required /></label>
                {!editingUser && <label><span>Username *</span><input name="username" value={form.username} onChange={updateField} required autoComplete="username" /></label>}
                <label><span>{editingUser ? 'Kata sandi baru' : 'Kata sandi awal'}{!editingUser && ' *'}</span><input name="password" type="password" value={form.password} onChange={updateField} minLength="8" required={!editingUser} autoComplete="new-password" /><small>Minimal 8 karakter{editingUser ? ' jika ingin mengganti.' : '.'}</small></label>
              </div>
              {formError && <p className="teacher-record-form-error" role="alert">{formError}</p>}
              <footer className="teacher-record-dialog-actions">
                <button type="button" className="module-secondary-button" onClick={() => setFormOpen(false)} disabled={saving}>Batal</button>
                <button type="submit" className="module-primary-button" disabled={saving}>{saving ? 'Menyimpan...' : editingUser ? 'Simpan perubahan' : 'Simpan akun'}</button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </section>
  )
}

export default ManajemenAkun
