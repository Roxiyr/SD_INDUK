import { useEffect, useMemo, useState } from 'react'
import ModuleIcon from '../../ModuleIcon.jsx'
import { createClass, deleteClass, listClasses, updateClass } from '../../../../../../services/classes/classManagementService.js'
import './DataKelas.css'

const emptyForm = { nama_kelas: '', tingkat: '1', kapasitas: '32', ruang: '', status: 'Aktif' }

function DataKelas({ search = '' }) {
  const [classes, setClasses] = useState([])
  const [tableSearch, setTableSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [reload, setReload] = useState(0)
  const query = `${search} ${tableSearch}`.trim().toLowerCase()

  useEffect(() => {
    const controller = new AbortController()
    listClasses({ signal: controller.signal })
      .then(setClasses)
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') setError(requestError.message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [reload])

  const visibleClasses = useMemo(() => classes.filter((item) =>
    [item.nama_kelas, item.wali_kelas, item.ruang, item.nama_tahun_ajaran]
      .some((value) => String(value || '').toLowerCase().includes(query)),
  ), [classes, query])
  const activeClasses = classes.filter((item) => item.status === 'Aktif')
  const totalStudents = activeClasses.reduce((total, item) => total + Number(item.jumlah_siswa || 0), 0)
  const totalCapacity = activeClasses.reduce((total, item) => total + Number(item.kapasitas || 0), 0)

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setError('')
    setFormOpen(true)
  }

  function openEdit(item) {
    setEditing(item)
    setForm({
      nama_kelas: item.nama_kelas,
      tingkat: String(item.tingkat),
      kapasitas: String(item.kapasitas),
      ruang: item.ruang || '',
      status: item.status,
    })
    setError('')
    setFormOpen(true)
  }

  async function save(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        ...form,
        tingkat: Number(form.tingkat),
        kapasitas: Number(form.kapasitas),
      }
      if (editing) await updateClass(editing.id_kelas, payload)
      else await createClass(payload)
      setNotice(editing ? 'Data kelas berhasil diperbarui.' : 'Kelas berhasil ditambahkan.')
      setFormOpen(false)
      setReload((value) => value + 1)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function archive(item) {
    if (!window.confirm(`Nonaktifkan kelas ${item.nama_kelas}? Riwayatnya tetap disimpan.`)) return
    setError('')
    try {
      await deleteClass(item.id_kelas)
      setNotice(`Kelas ${item.nama_kelas} dinonaktifkan.`)
      setReload((value) => value + 1)
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  function exportCsv() {
    const rows = [
      ['Kelas', 'Tingkat', 'Fase', 'Wali kelas', 'Jumlah siswa', 'Kapasitas', 'Ruang', 'Tahun ajaran', 'Status'],
      ...visibleClasses.map((item) => [
        item.nama_kelas, item.tingkat, item.fase, item.wali_kelas || '',
        item.jumlah_siswa, item.kapasitas, item.ruang || '', item.nama_tahun_ajaran, item.status,
      ]),
    ]
    const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'data-kelas.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section className="module-view data-module-view classes-page">
      {notice && <div className="dashboard-notice" role="status">{notice}<button type="button" onClick={() => setNotice('')} aria-label="Tutup">×</button></div>}
      {error && <div className="class-record-error" role="alert">{error}<button type="button" onClick={() => setError('')} aria-label="Tutup">×</button></div>}

      <div className="module-heading data-module-heading">
        <div><span className="module-eyebrow">MASTER DATA • TERHUBUNG KE DATABASE</span><h1>Data Kelas</h1><p>Kelola rombongan belajar, kapasitas, ruang, serta wali kelas.</p></div>
        <div className="module-toolbar">
          <button type="button" className="module-secondary-button" onClick={exportCsv} disabled={!classes.length}><ModuleIcon name="download" size={15} />Ekspor CSV</button>
          <button type="button" className="module-primary-button" onClick={openCreate}><ModuleIcon name="plus" size={16} />Tambah kelas</button>
        </div>
      </div>

      <section className="metrics-grid module-metrics" aria-label="Ringkasan kelas">
        {[
          ['Rombel aktif', activeClasses.length, 'Pada seluruh tahun ajaran', 'building'],
          ['Kapasitas', totalCapacity, 'Kapasitas kelas aktif', 'activity'],
          ['Siswa ditempatkan', totalStudents, 'Pada kelas aktif', 'clipboard'],
          ['Ruang tersedia', activeClasses.filter((item) => item.ruang).length, 'Kelas dengan ruang tercatat', 'shield'],
        ].map(([title, value, detail, icon], index) => (
          <article className="metric-card" key={title}>
            <div className="metric-copy"><h2>{title}</h2><strong>{loading ? '…' : value}</strong><p>{detail}</p></div>
            <span className={`metric-icon ${['red', 'blue', 'purple', 'orange'][index]}`}><ModuleIcon name={icon} size={18} /></span>
          </article>
        ))}
      </section>

      <section className="module-table-card">
        <div className="table-tools">
          <label className="table-search"><ModuleIcon name="search" size={16} /><input value={tableSearch} onChange={(event) => setTableSearch(event.target.value)} placeholder="Cari kelas, wali kelas, ruang..." aria-label="Cari kelas" /></label>
          <span className="table-count"><ModuleIcon name="settings" size={13} />{visibleClasses.length} kelas</span>
        </div>
        <div className="module-table-wrap">
          <table className="module-table">
            <thead><tr><th>NO</th><th>KELAS</th><th>WALI KELAS</th><th>JUMLAH SISWA</th><th>KAPASITAS</th><th>RUANG</th><th>TAHUN AJARAN</th><th>STATUS</th><th className="action-heading">AKSI</th></tr></thead>
            <tbody>
              {loading ? <tr><td className="empty-table" colSpan="9">Memuat kelas...</td></tr> : visibleClasses.length ? visibleClasses.map((item, index) => (
                <tr key={item.id_kelas}>
                  <td><span className="row-number">{String(index + 1).padStart(2, '0')}</span></td>
                  <td><strong>{item.nama_kelas}</strong><small className="class-phase">Tingkat {item.tingkat} · Fase {item.fase}</small></td>
                  <td>{item.wali_kelas || 'Belum ditentukan'}</td>
                  <td>{item.jumlah_siswa}</td>
                  <td>{item.kapasitas}</td>
                  <td>{item.ruang || '—'}</td>
                  <td>{item.nama_tahun_ajaran}</td>
                  <td><span className={`status-pill ${item.status === 'Aktif' ? 'success' : 'pending'}`}><i />{item.status}</span></td>
                  <td className="row-actions">
                    <button type="button" aria-label={`Ubah kelas ${item.nama_kelas}`} onClick={() => openEdit(item)}><ModuleIcon name="edit" size={15} /></button>
                    {item.status === 'Aktif' && <button type="button" aria-label={`Nonaktifkan kelas ${item.nama_kelas}`} onClick={() => archive(item)}><ModuleIcon name="trash" size={15} /></button>}
                  </td>
                </tr>
              )) : <tr><td className="empty-table" colSpan="9">{error ? 'Data kelas tidak dapat dimuat.' : 'Belum ada kelas sesuai pencarian.'}</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="table-footer"><span>Menampilkan {visibleClasses.length} dari {classes.length} kelas</span></div>
      </section>

      {formOpen && (
        <div className="class-record-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setFormOpen(false) }}>
          <section className="class-record-dialog" role="dialog" aria-modal="true" aria-labelledby="class-record-title">
            <header><div><span className="module-eyebrow">{editing ? 'UBAH DATA' : 'DATA BARU'}</span><h2 id="class-record-title">{editing ? 'Ubah kelas' : 'Tambah kelas'}</h2><p>Fase kelas ditentukan otomatis dari tingkat.</p></div><button type="button" onClick={() => setFormOpen(false)} disabled={saving} aria-label="Tutup formulir">×</button></header>
            <form onSubmit={save}>
              <label>Nama kelas *<input value={form.nama_kelas} onChange={(event) => setForm({ ...form, nama_kelas: event.target.value })} maxLength="20" required placeholder="Contoh: IV A" /></label>
              <label>Tingkat *<select value={form.tingkat} onChange={(event) => setForm({ ...form, tingkat: event.target.value })}>{[1, 2, 3, 4, 5, 6].map((level) => <option key={level} value={level}>{level}</option>)}</select></label>
              <label>Kapasitas *<input type="number" min="1" max="500" value={form.kapasitas} onChange={(event) => setForm({ ...form, kapasitas: event.target.value })} required /></label>
              <label>Ruang<input value={form.ruang} onChange={(event) => setForm({ ...form, ruang: event.target.value })} maxLength="50" /></label>
              {editing && <label>Status<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}><option>Aktif</option><option>Nonaktif</option></select></label>}
              {error && <p className="class-record-form-error" role="alert">{error}</p>}
              <footer><button type="button" className="module-secondary-button" onClick={() => setFormOpen(false)} disabled={saving}>Batal</button><button type="submit" className="module-primary-button" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan kelas'}</button></footer>
            </form>
          </section>
        </div>
      )}
    </section>
  )
}

export default DataKelas
