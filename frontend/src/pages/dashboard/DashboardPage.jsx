import { useState } from 'react'
import schoolEmblem from '../../assets/school-emblem.png'
import OperatorModulePage from './OperatorModulePage.jsx'
import './DashboardPage.css'

const navigationGroups = [
  {
    label: 'Utama',
    items: [
      { label: 'Dashboard', icon: 'grid' },
      { label: 'Persetujuan Pengajuan', icon: 'shield' },
    ],
  },
  {
    label: 'Master Data',
    items: [
      { label: 'Data Induk Siswa', icon: 'users' },
      { label: 'Data Guru', icon: 'graduation' },
      { label: 'Data Kelas', icon: 'building' },
      { label: 'Orang Tua / Wali', icon: 'user' },
      { label: 'Tahun Ajaran', icon: 'calendar' },
    ],
  },
  {
    label: 'Akademik',
    items: [
      { label: 'Riwayat Siswa', icon: 'activity' },
      { label: 'Kenaikan Kelas', icon: 'trend' },
      { label: 'Mutasi Siswa', icon: 'refresh' },
      { label: 'Alumni', icon: 'archive' },
    ],
  },
  {
    label: 'Laporan',
    items: [
      { label: 'Rekap Siswa', icon: 'clipboard' },
      { label: 'Rekap Per Kelas', icon: 'file' },
      { label: 'Ekspor Dapodik', icon: 'download' },
    ],
  },
  {
    label: 'Pengaturan',
    items: [
      { label: 'Profil Sekolah', icon: 'building' },
      { label: 'Manajemen Akun', icon: 'settings' },
      { label: 'Audit Log', icon: 'shield' },
    ],
  },
]

const studentGroups = [
  { phase: 'Fase A', male: 78, female: 68 },
  { phase: 'Fase B', male: 72, female: 64 },
  { phase: 'Fase C', male: 81, female: 73 },
]

function Icon({ name, size = 18 }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" /><path d="m9 12 2 2 4-4" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    graduation: <><path d="m22 10-10 5L2 10l10-5 10 5Z" /><path d="M6 12v5c3.5 3 8.5 3 12 0v-5M22 10v6" /></>,
    building: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M9 21v-5h6v5M9 7h1m4 0h1m-6 4h1m4 0h1" /></>,
    user: <><path d="M20 21a8 8 0 0 0-16 0" /><circle cx="12" cy="8" r="5" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18" /></>,
    activity: <><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></>,
    trend: <><path d="m3 17 6-6 4 4 8-8" /><path d="M15 7h6v6" /></>,
    refresh: <><path d="M20 7v5h-5M4 17v-5h5" /><path d="M5.6 9a7 7 0 0 1 11.55-2.6L20 12M4 12l2.85 5.6A7 7 0 0 0 18.4 15" /></>,
    archive: <><rect x="3" y="4" width="18" height="5" rx="1" /><path d="M5 9v11h14V9m-9 4h4" /></>,
    clipboard: <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4.5h6a1.5 1.5 0 0 0-3-1 1.5 1.5 0 0 0-3 1ZM9 11h6m-6 4h6" /></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M10 13v5m4-3v3" /></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5m-5 5V3" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.6.9l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.6-.9l-1.7.7-1.4-2.4 1.4-1.1a7 7 0 0 1 0-1.9l-1.4-1.1 1.4-2.4 1.7.7a8 8 0 0 1 1.6-.9l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.6.9l1.7-.7 1.4 2.4-1.4 1.1a7 7 0 0 1-.1 1.8Z" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 13h4" /></>,
    plus: <><path d="M12 5v14m-7-7h14" /></>,
    dots: <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>,
    arrow: <><path d="M5 12h14m-7-7 7 7-7 7" /></>,
  }

  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {paths[name] || paths.file}
    </svg>
  )
}

function DashboardPage({ onLogout }) {
  const [activePage, setActivePage] = useState('Dashboard')
  const [activeRole, setActiveRole] = useState('Admin')
  const [search, setSearch] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showStudentForm, setShowStudentForm] = useState(false)
  const [notice, setNotice] = useState('')

  const isDashboard = activePage === 'Dashboard'

  function selectPage(label) {
    setActivePage(label)
    setSidebarOpen(false)
  }

  return (
    <div className="operator-app">
      <aside className={`operator-sidebar${sidebarOpen ? ' is-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-emblem"><img src={schoolEmblem} alt="" /></div>
          <div className="brand-copy">
            <strong>SDN BATU AMPAR 12 PAGI</strong>
            <span>BUKU INDUK DIGITAL</span>
          </div>
        </div>

        <div className="role-switcher" aria-label="Pilih tampilan peran">
          {['Admin', 'Guru', 'Murid'].map((role) => (
            <button key={role} className={activeRole === role ? 'selected' : ''} onClick={() => setActiveRole(role)} type="button">
              {role}
            </button>
          ))}
        </div>

        <nav className="sidebar-navigation" aria-label="Navigasi operator">
          {navigationGroups.map((group) => (
            <div className="nav-group" key={group.label}>
              <p className="nav-group-label">{group.label}</p>
              {group.items.map((item) => (
                <button
                  type="button"
                  key={item.label}
                  className={`nav-item${activePage === item.label ? ' active' : ''}`}
                  onClick={() => selectPage(item.label)}
                >
                  <Icon name={item.icon} size={17} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-account">
          <button className="sidebar-profile" type="button" onClick={() => selectPage('Manajemen Akun')}>
            <span className="profile-avatar">OS</span>
            <span className="profile-copy"><strong>Operator Sekolah</strong><small>Admin Buku Induk</small></span>
            <Icon name="arrow" size={16} />
          </button>
          <button className="sidebar-logout" type="button" onClick={onLogout}>Keluar</button>
        </div>
      </aside>

      {sidebarOpen && <button className="sidebar-scrim" aria-label="Tutup menu" onClick={() => setSidebarOpen(false)} type="button" />}

      <main className="operator-main">
        <header className="dashboard-topbar">
          <div className="breadcrumb">
            <button type="button" className="mobile-menu-button" onClick={() => setSidebarOpen(true)} aria-label="Buka navigasi">☰</button>
            <Icon name="grid" size={16} />
            <span>{activePage}</span>
            <span className="breadcrumb-divider">/</span>
            <span className="term-badge">T.A. 2025/2026 Ganjil</span>
          </div>
          <label className="global-search">
            <Icon name="search" size={17} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari NIS, nama siswa, NISN..." aria-label="Cari siswa" />
            <kbd>⌘ K</kbd>
          </label>
          <div className="topbar-actions">
            <span className="sync-status"><i /> Dapodik: 10:45 WIB</span>
            <button className="icon-button notification-button" aria-label="Notifikasi" type="button" onClick={() => setNotice('Tidak ada notifikasi baru.')}>
              <Icon name="bell" size={18} /><i />
            </button>
            <button className="topbar-avatar" aria-label="Akun operator" type="button" onClick={() => selectPage('Manajemen Akun')}>
              <Icon name="user" size={20} />
            </button>
          </div>
        </header>

        <div className="dashboard-content">
          {isDashboard ? (
            <>
              <section className="welcome-banner">
                <div className="welcome-copy">
                  <div className="welcome-tags"><span>SISTEM INFORMASI BUKU INDUK</span><span>Sinkron Dapodik terakhir: 08.30 WIB</span></div>
                  <h1>Dashboard Mode {activeRole}</h1>
                  <p>Kelola rekam jejak akademik siswa secara akurat, aman, dan terpusat dalam satu buku induk digital.</p>
                </div>
                <div className="welcome-actions">
                  <button type="button" onClick={() => setShowStudentForm(true)}><Icon name="plus" size={16} /> Tambah siswa baru</button>
                  <button type="button" onClick={() => selectPage('Persetujuan Pengajuan')}><Icon name="shield" size={16} /> Verifikasi mandiri</button>
                  <button type="button" onClick={() => selectPage('Ekspor Dapodik')}><Icon name="download" size={16} /> Ekspor buku induk</button>
                </div>
              </section>

              {notice && <div className="dashboard-notice" role="status">{notice}<button type="button" onClick={() => setNotice('')} aria-label="Tutup">×</button></div>}

              <section className="metrics-grid" aria-label="Ringkasan sekolah">
                <MetricCard title="Total siswa terdaftar" value="512" detail="+13 dari tahun ajaran sebelumnya" icon="users" tone="red" />
                <MetricCard title="Siswa aktif" value="498" detail="97,3% dari total siswa" icon="activity" tone="blue" />
                <MetricCard title="Tenaga pendidik & guru" value="28" detail="18 pengajar aktif" icon="graduation" tone="purple" />
                <MetricCard title="Ruang kelas aktif" value="18" detail="Rombel A, B, dan C" icon="building" tone="orange" />
              </section>

              <section className="dashboard-panels">
                <article className="panel distribution-panel">
                  <div className="panel-heading">
                    <div><h2>Distribusi Siswa per Tingkat &amp; Fase Belajar</h2><p>Data real-time semester ganjil T.A. 2025/2026</p></div>
                    <button className="icon-button panel-more" type="button" aria-label="Opsi distribusi" onClick={() => setNotice('Grafik menampilkan distribusi siswa menurut fase belajar.') }><Icon name="dots" /></button>
                  </div>
                  <div className="bar-chart" role="img" aria-label="Grafik jumlah siswa laki-laki dan perempuan per fase">
                    {studentGroups.map((group) => (
                      <div className="bar-group" key={group.phase}>
                        <div className="bar-pair">
                          <div className="bar-column"><span>{group.male}</span><i style={{ height: `${group.male * 1.65}px` }} /></div>
                          <div className="bar-column female"><span>{group.female}</span><i style={{ height: `${group.female * 1.65}px` }} /></div>
                        </div>
                        <span className="bar-label">{group.phase}</span>
                      </div>
                    ))}
                  </div>
                  <div className="chart-legend"><span><i className="male-dot" />Laki-laki</span><span><i className="female-dot" />Perempuan</span></div>
                </article>

                <article className="panel audit-panel">
                  <div className="panel-heading">
                    <div><h2>Audit Berkas Siswa</h2><p>Penyelesaian dokumen identitas dan akademik</p></div>
                    <span className="audit-icon"><Icon name="file" size={19} /></span>
                  </div>
                  <div className="audit-chart"><div><strong>94.8%</strong><span>Lengkap Digital</span></div></div>
                  <div className="audit-rows">
                    <div className="verified-row"><span>Berkas terverifikasi</span><strong>486 siswa</strong></div>
                    <div className="incomplete-row"><span>Belum lengkap</span><strong>26 siswa</strong></div>
                  </div>
                </article>
              </section>
            </>
          ) : (
            <OperatorModulePage
              module={activePage}
              search={search}
              notice={notice}
              setNotice={setNotice}
              onAddStudent={() => setShowStudentForm(true)}
            />
          )}
        </div>
      </main>

      {showStudentForm && <StudentModal onClose={() => setShowStudentForm(false)} onSave={() => { setShowStudentForm(false); setNotice('Form siswa baru berhasil disimpan sebagai draf.') }} />}
      <button className="help-button" type="button" aria-label="Bantuan" onClick={() => setNotice('Hubungi administrator sekolah jika Anda membutuhkan bantuan.')}>?</button>
    </div>
  )
}

function MetricCard({ title, value, detail, icon, tone }) {
  return (
    <article className="metric-card">
      <div className="metric-copy"><h2>{title}</h2><strong>{value}</strong><p>{detail}</p></div>
      <span className={`metric-icon ${tone}`}><Icon name={icon} size={19} /></span>
    </article>
  )
}

function StudentModal({ onClose, onSave }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="student-modal" role="dialog" aria-modal="true" aria-labelledby="student-modal-title">
        <button className="modal-close" type="button" onClick={onClose} aria-label="Tutup">×</button>
        <span className="module-eyebrow">DATA INDUK SISWA</span>
        <h2 id="student-modal-title">Tambah siswa baru</h2>
        <p>Isi informasi awal siswa. Data dapat dilengkapi setelah disimpan.</p>
        <form onSubmit={(event) => { event.preventDefault(); onSave() }}>
          <label>Nama lengkap<input required name="studentName" placeholder="Nama sesuai dokumen resmi" /></label>
          <div className="modal-fields">
            <label>NIS<input required name="nis" placeholder="Nomor induk siswa" /></label>
            <label>Kelas<select name="class" defaultValue=""><option value="" disabled>Pilih kelas</option><option>Kelas 1</option><option>Kelas 2</option><option>Kelas 3</option><option>Kelas 4</option><option>Kelas 5</option><option>Kelas 6</option></select></label>
          </div>
          <div className="modal-actions"><button type="button" onClick={onClose}>Batal</button><button type="submit">Simpan data siswa</button></div>
        </form>
      </section>
    </div>
  )
}

export default DashboardPage
