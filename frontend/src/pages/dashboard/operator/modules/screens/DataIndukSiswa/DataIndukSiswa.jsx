import { useEffect, useState } from 'react'
import ModuleIcon from '../../ModuleIcon.jsx'
import { createStudent, deleteStudent, getStudent, listActiveClasses, listStudents, updateStudent } from '../../../../../../services/students/studentService.js'
import './DataIndukSiswa.css'

const pageSize = 100

function emptyForm() {
  return {
    siswa: {
      nisn: '',
      nis: '',
      nik: '',
      no_kk: '',
      nama_lengkap: '',
      nama_panggilan: '',
      jenis_kelamin: 'L',
      tempat_lahir: '',
      tanggal_lahir: '',
      agama: 'Islam',
      kewarganegaraan: 'Indonesia',
      jumlah_saudara: '0',
      bahasa_sehari_hari: '',
      golongan_darah: '',
      alamat: '',
      nomor_telepon: '',
      bertempat_tinggal_pada: 'Orang Tua Kandung',
      jarak_sekolah: '',
      status_siswa: 'Aktif',
    },
    keluarga: {
      nama_ayah: '',
      pendidikan_ayah: '',
      pekerjaan_ayah: '',
      nama_ibu: '',
      pendidikan_ibu: '',
      pekerjaan_ibu: '',
      nama_wali: '',
      hubungan_wali: '',
      pendidikan_wali: '',
      pekerjaan_wali: '',
    },
    riwayat_masuk: {
      status_masuk: 'Baru',
      asal_tk_nama: '',
      tgl_sttb_tk: '',
      no_sttb_tk: '',
      asal_sekolah_pindahan: '',
      dari_tingkat: '',
      tgl_diterima: '',
    },
    id_kelas: '',
    buat_akun: false,
  }
}

function StudentField({ section, name, label, value, onChange, disabled, required = false, type = 'text', options, pattern, maxLength }) {
  const id = `student-${section}-${name}`
  const commonProps = {
    id,
    name,
    value: value ?? '',
    onChange,
    disabled,
    required,
    pattern,
    maxLength,
  }

  return (
    <label className="student-record-field" htmlFor={id}>
      <span>{label}{required && <i> *</i>}</span>
      {options ? (
        <select {...commonProps}>
          {options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}
        </select>
      ) : (
        <input {...commonProps} type={type} />
      )}
    </label>
  )
}

function DataIndukSiswa({ search = '' }) {
  const [students, setStudents] = useState([])
  const [activeClasses, setActiveClasses] = useState([])
  const [classOptionsError, setClassOptionsError] = useState('')
  const [pagination, setPagination] = useState({ total: 0, limit: pageSize, offset: 0 })
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [offset, setOffset] = useState(0)
  const [reload, setReload] = useState(0)
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [notice, setNotice] = useState('')
  const [dialogMode, setDialogMode] = useState('')
  const [selectedNisn, setSelectedNisn] = useState('')
  const [dialogLoading, setDialogLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [dialogError, setDialogError] = useState('')
  const [form, setForm] = useState(emptyForm)
  const busy = loading || saving
  const effectiveSearch = `${search} ${query}`.trim()

  useEffect(() => {
    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setLoading(true)
      setPageError('')
      try {
        const result = await listStudents({
          search: effectiveSearch,
          status: statusFilter,
          limit: pageSize,
          offset,
          signal: controller.signal,
        })
        setStudents(result.items)
        setPagination(result.pagination)
      } catch (error) {
        if (error.name !== 'AbortError') setPageError(error.message)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, 250)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [effectiveSearch, statusFilter, offset, reload])

  useEffect(() => {
    const controller = new AbortController()
    listActiveClasses({ signal: controller.signal })
      .then(setActiveClasses)
      .catch((error) => {
        if (error.name !== 'AbortError') setClassOptionsError(error.message)
      })
    return () => controller.abort()
  }, [])

  function updateField(section, event) {
    const { name, value } = event.target
    setForm((current) => ({
      ...current,
      [section]: { ...current[section], [name]: value },
    }))
  }

  function openCreate() {
    setForm({ ...emptyForm(), id_kelas: activeClasses[0] ? String(activeClasses[0].id_kelas) : '' })
    setSelectedNisn('')
    setDialogError('')
    setDialogMode('create')
  }

  async function openStudent(nisn, mode) {
    setSelectedNisn(nisn)
    setForm(emptyForm())
    setDialogError('')
    setDialogMode(mode)
    setDialogLoading(true)
    try {
      const student = await getStudent(nisn)
      const defaults = emptyForm()
      setForm({
        ...defaults,
        siswa: { ...defaults.siswa, ...student },
        keluarga: Object.fromEntries(
          Object.keys(defaults.keluarga).map((key) => [key, student[key] ?? '']),
        ),
        riwayat_masuk: Object.fromEntries(
          Object.keys(defaults.riwayat_masuk).map((key) => [key, student[key] ?? '']),
        ),
        id_kelas: student.id_kelas ? String(student.id_kelas) : '',
      })
    } catch (error) {
      setDialogError(error.message)
    } finally {
      setDialogLoading(false)
    }
  }

  async function saveStudent(event) {
    event.preventDefault()
    setSaving(true)
    setDialogError('')
    const data = {
      siswa: {
        ...form.siswa,
        jumlah_saudara: Number(form.siswa.jumlah_saudara) || 0,
      },
      keluarga: form.keluarga,
      riwayat_masuk: {
        ...form.riwayat_masuk,
        dari_tingkat: form.riwayat_masuk.dari_tingkat
          ? Number(form.riwayat_masuk.dari_tingkat)
          : null,
      },
      id_kelas: form.id_kelas ? Number(form.id_kelas) : null,
    }

    try {
      if (dialogMode === 'create') {
        const result = await createStudent({ ...data, buat_akun: form.buat_akun })
        setNotice(result.akun
          ? `Data siswa berhasil ditambahkan. Akun ${result.akun.username} dibuat dengan kata sandi awal ${result.akun.password_default}.`
          : 'Data siswa berhasil ditambahkan.')
      } else {
        await updateStudent(selectedNisn, data)
        setNotice('Data siswa berhasil diperbarui.')
      }
      setDialogMode('')
      setOffset(0)
      setReload((current) => current + 1)
    } catch (error) {
      const details = Array.isArray(error.errors)
        ? error.errors.map((item) => item.detail).join(' ')
        : ''
      setDialogError(details ? `${error.message} ${details}` : error.message)
    } finally {
      setSaving(false)
    }
  }

  async function removeStudent(student) {
    const confirmed = window.confirm(`Hapus data siswa ${student.nama_lengkap} (${student.nisn})?`)
    if (!confirmed) return

    setPageError('')
    try {
      await deleteStudent(student.nisn)
      setNotice(`Data ${student.nama_lengkap} berhasil dihapus.`)
      setReload((current) => current + 1)
    } catch (error) {
      setPageError(error.message)
    }
  }

  const activeCount = students.filter((student) => student.status_siswa === 'Aktif').length
  const inactiveCount = students.filter((student) => student.status_siswa !== 'Aktif').length
  const pageNumber = Math.floor(offset / pageSize) + 1
  const pageCount = Math.max(1, Math.ceil(pagination.total / pageSize))
  const viewOnly = dialogMode === 'view'

  return (
    <section className="module-view data-module-view students-page">
      {notice && <div className="dashboard-notice" role="status">{notice}<button type="button" onClick={() => setNotice('')} aria-label="Tutup">×</button></div>}
      {pageError && <div className="student-record-error" role="alert">{pageError}<button type="button" onClick={() => setPageError('')} aria-label="Tutup">×</button></div>}

      <div className="module-heading data-module-heading">
        <div>
          <span className="module-eyebrow">MASTER DATA • TERHUBUNG KE DATABASE</span>
          <h1>Data Induk Siswa</h1>
          <p>Data identitas, keluarga, dan riwayat masuk siswa yang tersimpan di server.</p>
        </div>
        <div className="module-toolbar">
          <button className="module-primary-button" type="button" onClick={openCreate}>
            <ModuleIcon name="plus" size={16} />Tambah siswa
          </button>
        </div>
      </div>

      <section className="metrics-grid module-metrics" aria-label="Ringkasan data siswa">
        {[
          ['Total hasil', String(pagination.total), 'Sesuai pencarian dan filter', 'users'],
          ['Siswa aktif', String(activeCount), 'Pada halaman ini', 'activity'],
          ['Status lainnya', String(inactiveCount), 'Lulus, pindah, atau keluar', 'archive'],
          ['Data ditampilkan', String(students.length), `Maksimal ${pageSize} per halaman`, 'clipboard'],
        ].map(([title, value, detail, icon], index) => (
          <article className="metric-card" key={title}>
            <div className="metric-copy"><h2>{title}</h2><strong>{value}</strong><p>{detail}</p></div>
            <span className={`metric-icon ${['red', 'blue', 'purple', 'orange'][index]}`}><ModuleIcon name={icon} size={18} /></span>
          </article>
        ))}
      </section>

      <section className="module-table-card">
        <div className="table-tools student-record-tools">
          <label className="table-search">
            <ModuleIcon name="search" size={16} />
            <input value={query} onChange={(event) => { setQuery(event.target.value); setOffset(0) }} placeholder="Cari nama, NIS, atau NISN..." aria-label="Cari data siswa" />
          </label>
          <label className="student-status-filter">
            <span>Status</span>
            <select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setOffset(0) }} aria-label="Filter status siswa">
              <option value="">Semua</option>
              <option value="Aktif">Aktif</option>
              <option value="Lulus">Lulus</option>
              <option value="Pindah">Pindah</option>
              <option value="Keluar">Keluar</option>
            </select>
          </label>
          <span className="table-count"><ModuleIcon name="settings" size={13} /> {pagination.total} data</span>
        </div>

        <div className="module-table-wrap">
          <table className="module-table">
            <thead>
              <tr><th>NO</th><th>NAMA SISWA</th><th>NIS</th><th>NISN</th><th>KELAS</th><th>L/P</th><th>TANGGAL LAHIR</th><th>STATUS</th><th className="action-heading">AKSI</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="empty-table" colSpan="9">Memuat data siswa dari server...</td></tr>
              ) : students.length ? students.map((student, index) => (
                <tr key={student.nisn}>
                  <td><span className="row-number">{String(offset + index + 1).padStart(2, '0')}</span></td>
                  <td><span className="table-person"><span>{student.nama_lengkap.split(/\s+/).slice(0, 2).map((word) => word[0]).join('').toUpperCase()}</span><strong>{student.nama_lengkap}</strong></span></td>
                  <td>{student.nis}</td>
                  <td>{student.nisn}</td>
                  <td>{student.nama_kelas || 'Belum ditempatkan'}</td>
                  <td>{student.jenis_kelamin}</td>
                  <td>{student.tanggal_lahir || '—'}</td>
                  <td><span className={`status-pill ${student.status_siswa === 'Aktif' ? 'success' : 'pending'}`}><i />{student.status_siswa}</span></td>
                  <td className="row-actions">
                    <button type="button" aria-label={`Lihat ${student.nama_lengkap}`} onClick={() => openStudent(student.nisn, 'view')}><ModuleIcon name="eye" size={15} /></button>
                    <button type="button" aria-label={`Ubah ${student.nama_lengkap}`} onClick={() => openStudent(student.nisn, 'edit')}><ModuleIcon name="edit" size={15} /></button>
                    <button type="button" aria-label={`Hapus ${student.nama_lengkap}`} onClick={() => removeStudent(student)}><ModuleIcon name="trash" size={15} /></button>
                  </td>
                </tr>
              )) : (
                <tr><td className="empty-table" colSpan="9">{pageError ? 'Data tidak dapat dimuat.' : 'Belum ada data siswa yang cocok.'}</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <span>Halaman {pageNumber} dari {pageCount} • {pagination.total} siswa</span>
          <div>
            <button type="button" disabled={busy || offset === 0} onClick={() => setOffset((current) => Math.max(0, current - pageSize))} aria-label="Halaman sebelumnya">‹</button>
            <button type="button" className="current-page" aria-current="page">{pageNumber}</button>
            <button type="button" disabled={busy || offset + pageSize >= pagination.total} onClick={() => setOffset((current) => current + pageSize)} aria-label="Halaman berikutnya">›</button>
          </div>
        </div>
      </section>

      {dialogMode && (
        <div className="student-record-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setDialogMode('') }}>
          <section className="student-record-dialog" role="dialog" aria-modal="true" aria-labelledby="student-record-title">
            <header className="student-record-dialog-header">
              <div>
                <span className="module-eyebrow">{viewOnly ? 'DETAIL DATA' : dialogMode === 'create' ? 'DATA BARU' : 'UBAH DATA'}</span>
                <h2 id="student-record-title">{viewOnly ? 'Detail siswa' : dialogMode === 'create' ? 'Tambah siswa' : 'Ubah data siswa'}</h2>
                <p>Identitas, keluarga, dan riwayat masuk tersimpan bersama dalam satu transaksi.</p>
              </div>
              <button type="button" onClick={() => setDialogMode('')} disabled={saving} aria-label="Tutup formulir">×</button>
            </header>

            {dialogLoading ? <p className="student-record-loading">Memuat detail siswa...</p> : (
              <form onSubmit={saveStudent}>
                <fieldset disabled={viewOnly || saving} className="student-record-form">
                  <h3>Identitas siswa</h3>
                  <div className="student-record-grid">
                    <StudentField section="siswa" name="nisn" label="NISN" value={form.siswa.nisn} onChange={(event) => updateField('siswa', event)} required pattern="[0-9]{10}" maxLength="10" disabled={viewOnly || saving || dialogMode === 'edit'} />
                    <StudentField section="siswa" name="nis" label="NIS" value={form.siswa.nis} onChange={(event) => updateField('siswa', event)} required disabled={viewOnly || saving} />
                    <StudentField section="siswa" name="nik" label="NIK" value={form.siswa.nik} onChange={(event) => updateField('siswa', event)} required pattern="[0-9]{16}" maxLength="16" disabled={viewOnly || saving} />
                    <StudentField section="siswa" name="no_kk" label="Nomor KK" value={form.siswa.no_kk} onChange={(event) => updateField('siswa', event)} required pattern="[0-9]{16}" maxLength="16" disabled={viewOnly || saving} />
                    <StudentField section="siswa" name="nama_lengkap" label="Nama lengkap" value={form.siswa.nama_lengkap} onChange={(event) => updateField('siswa', event)} required disabled={viewOnly || saving} />
                    <StudentField section="siswa" name="nama_panggilan" label="Nama panggilan" value={form.siswa.nama_panggilan} onChange={(event) => updateField('siswa', event)} disabled={viewOnly || saving} />
                    <StudentField section="siswa" name="jenis_kelamin" label="Jenis kelamin" value={form.siswa.jenis_kelamin} onChange={(event) => updateField('siswa', event)} disabled={viewOnly || saving} options={[['L', 'Laki-laki'], ['P', 'Perempuan']]} />
                    <StudentField section="siswa" name="tempat_lahir" label="Tempat lahir" value={form.siswa.tempat_lahir} onChange={(event) => updateField('siswa', event)} required disabled={viewOnly || saving} />
                    <StudentField section="siswa" name="tanggal_lahir" label="Tanggal lahir" type="date" value={form.siswa.tanggal_lahir} onChange={(event) => updateField('siswa', event)} required disabled={viewOnly || saving} />
                    <StudentField section="siswa" name="agama" label="Agama" value={form.siswa.agama} onChange={(event) => updateField('siswa', event)} required disabled={viewOnly || saving} />
                    <StudentField section="siswa" name="status_siswa" label="Status siswa" value={form.siswa.status_siswa} onChange={(event) => updateField('siswa', event)} disabled={viewOnly || saving} options={['Aktif', 'Lulus', 'Pindah', 'Keluar'].map((value) => [value, value])} />
                    <StudentField section="siswa" name="nomor_telepon" label="Nomor telepon" value={form.siswa.nomor_telepon} onChange={(event) => updateField('siswa', event)} disabled={viewOnly || saving} />
                    <StudentField section="siswa" name="jumlah_saudara" label="Jumlah saudara" type="number" value={form.siswa.jumlah_saudara} onChange={(event) => updateField('siswa', event)} disabled={viewOnly || saving} />
                    <StudentField section="siswa" name="golongan_darah" label="Golongan darah" value={form.siswa.golongan_darah} onChange={(event) => updateField('siswa', event)} disabled={viewOnly || saving} />
                    <StudentField section="siswa" name="kewarganegaraan" label="Kewarganegaraan" value={form.siswa.kewarganegaraan} onChange={(event) => updateField('siswa', event)} disabled={viewOnly || saving} />
                    <StudentField section="siswa" name="bahasa_sehari_hari" label="Bahasa sehari-hari" value={form.siswa.bahasa_sehari_hari} onChange={(event) => updateField('siswa', event)} disabled={viewOnly || saving} />
                    <StudentField section="siswa" name="bertempat_tinggal_pada" label="Tinggal bersama" value={form.siswa.bertempat_tinggal_pada} onChange={(event) => updateField('siswa', event)} disabled={viewOnly || saving} />
                    <StudentField section="siswa" name="jarak_sekolah" label="Jarak ke sekolah" value={form.siswa.jarak_sekolah} onChange={(event) => updateField('siswa', event)} disabled={viewOnly || saving} />
                  </div>
                  <label className="student-record-field student-record-full-field" htmlFor="student-siswa-alamat">
                    <span>Alamat *</span>
                    <textarea id="student-siswa-alamat" name="alamat" value={form.siswa.alamat} onChange={(event) => updateField('siswa', event)} required disabled={viewOnly || saving} rows="2" />
                  </label>

                  <h3>Penempatan kelas</h3>
                  <div className="student-record-grid">
                    <StudentField
                      section="penempatan"
                      name="id_kelas"
                      label="Kelas aktif"
                      value={form.id_kelas}
                      onChange={(event) => setForm((current) => ({ ...current, id_kelas: event.target.value }))}
                      disabled={viewOnly || saving}
                      required={dialogMode === 'create' && activeClasses.length > 0}
                      options={[
                        ['', 'Belum ditempatkan'],
                        ...activeClasses.map((item) => [
                          String(item.id_kelas),
                          `${item.nama_kelas} — Tingkat ${item.tingkat} (${item.nama_tahun_ajaran})`,
                        ]),
                      ]}
                    />
                    {classOptionsError && <p className="student-record-form-error" role="alert">{classOptionsError}</p>}
                    {!classOptionsError && !activeClasses.length && (
                      <p className="student-record-class-note">
                        Belum ada kelas pada tahun ajaran aktif. Data siswa tetap dapat disimpan, lalu kelasnya bisa dipilih setelah kelas tersedia.
                      </p>
                    )}
                  </div>

                  <h3>Data orang tua / wali</h3>
                  <div className="student-record-grid">
                    <StudentField section="keluarga" name="nama_ayah" label="Nama ayah" value={form.keluarga.nama_ayah} onChange={(event) => updateField('keluarga', event)} required disabled={viewOnly || saving} />
                    <StudentField section="keluarga" name="pendidikan_ayah" label="Pendidikan ayah" value={form.keluarga.pendidikan_ayah} onChange={(event) => updateField('keluarga', event)} disabled={viewOnly || saving} />
                    <StudentField section="keluarga" name="pekerjaan_ayah" label="Pekerjaan ayah" value={form.keluarga.pekerjaan_ayah} onChange={(event) => updateField('keluarga', event)} disabled={viewOnly || saving} />
                    <StudentField section="keluarga" name="nama_ibu" label="Nama ibu" value={form.keluarga.nama_ibu} onChange={(event) => updateField('keluarga', event)} required disabled={viewOnly || saving} />
                    <StudentField section="keluarga" name="pendidikan_ibu" label="Pendidikan ibu" value={form.keluarga.pendidikan_ibu} onChange={(event) => updateField('keluarga', event)} disabled={viewOnly || saving} />
                    <StudentField section="keluarga" name="pekerjaan_ibu" label="Pekerjaan ibu" value={form.keluarga.pekerjaan_ibu} onChange={(event) => updateField('keluarga', event)} disabled={viewOnly || saving} />
                    <StudentField section="keluarga" name="nama_wali" label="Nama wali (opsional)" value={form.keluarga.nama_wali} onChange={(event) => updateField('keluarga', event)} disabled={viewOnly || saving} />
                    <StudentField section="keluarga" name="hubungan_wali" label="Hubungan wali" value={form.keluarga.hubungan_wali} onChange={(event) => updateField('keluarga', event)} disabled={viewOnly || saving} />
                    <StudentField section="keluarga" name="pendidikan_wali" label="Pendidikan wali" value={form.keluarga.pendidikan_wali} onChange={(event) => updateField('keluarga', event)} disabled={viewOnly || saving} />
                    <StudentField section="keluarga" name="pekerjaan_wali" label="Pekerjaan wali" value={form.keluarga.pekerjaan_wali} onChange={(event) => updateField('keluarga', event)} disabled={viewOnly || saving} />
                  </div>

                  <h3>Riwayat masuk</h3>
                  <div className="student-record-grid">
                    <StudentField section="riwayat_masuk" name="status_masuk" label="Status masuk" value={form.riwayat_masuk.status_masuk} onChange={(event) => updateField('riwayat_masuk', event)} disabled={viewOnly || saving} options={[['Baru', 'Siswa baru'], ['Pindahan', 'Siswa pindahan']]} />
                    {form.riwayat_masuk.status_masuk === 'Pindahan' ? (
                      <>
                        <StudentField section="riwayat_masuk" name="asal_sekolah_pindahan" label="Sekolah asal" value={form.riwayat_masuk.asal_sekolah_pindahan} onChange={(event) => updateField('riwayat_masuk', event)} disabled={viewOnly || saving} />
                        <StudentField section="riwayat_masuk" name="dari_tingkat" label="Tingkat asal" type="number" value={form.riwayat_masuk.dari_tingkat} onChange={(event) => updateField('riwayat_masuk', event)} disabled={viewOnly || saving} />
                        <StudentField section="riwayat_masuk" name="tgl_diterima" label="Tanggal diterima" type="date" value={form.riwayat_masuk.tgl_diterima} onChange={(event) => updateField('riwayat_masuk', event)} disabled={viewOnly || saving} />
                      </>
                    ) : (
                      <>
                        <StudentField section="riwayat_masuk" name="asal_tk_nama" label="Nama TK asal" value={form.riwayat_masuk.asal_tk_nama} onChange={(event) => updateField('riwayat_masuk', event)} disabled={viewOnly || saving} />
                        <StudentField section="riwayat_masuk" name="tgl_sttb_tk" label="Tanggal STTB TK" type="date" value={form.riwayat_masuk.tgl_sttb_tk} onChange={(event) => updateField('riwayat_masuk', event)} disabled={viewOnly || saving} />
                        <StudentField section="riwayat_masuk" name="no_sttb_tk" label="Nomor STTB TK" value={form.riwayat_masuk.no_sttb_tk} onChange={(event) => updateField('riwayat_masuk', event)} disabled={viewOnly || saving} />
                      </>
                    )}
                  </div>

                  {dialogMode === 'create' && (
                    <label className="student-record-create-account">
                      <input type="checkbox" checked={form.buat_akun} onChange={(event) => setForm((current) => ({ ...current, buat_akun: event.target.checked }))} />
                      <span>Buat akun portal siswa setelah data disimpan</span>
                    </label>
                  )}
                </fieldset>

                {dialogError && <p className="student-record-form-error" role="alert">{dialogError}</p>}
                <footer className="student-record-dialog-actions">
                  <button type="button" className="module-secondary-button" onClick={() => setDialogMode('')} disabled={saving}>Tutup</button>
                  {viewOnly ? (
                    <button type="button" className="module-primary-button" onClick={() => setDialogMode('edit')}>Ubah data</button>
                  ) : (
                    <button type="submit" className="module-primary-button" disabled={saving}>
                      {saving ? 'Menyimpan...' : dialogMode === 'create' ? 'Simpan siswa' : 'Simpan perubahan'}
                    </button>
                  )}
                </footer>
              </form>
            )}
          </section>
        </div>
      )}
    </section>
  )
}

export default DataIndukSiswa
