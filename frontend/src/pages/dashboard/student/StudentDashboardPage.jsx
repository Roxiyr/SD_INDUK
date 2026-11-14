import { useState } from 'react'
import schoolEmblem from '../../../assets/school-emblem.png'
import StudentScreens from './screens/StudentScreens.jsx'
import './StudentDashboardPage.css'

const navigationGroups = [
  {
    label: 'Akademik Saya',
    items: [
      { label: 'Rapor & Hasil Belajar', icon: 'clipboard', tab: 'Nilai & Hasil Belajar' },
      { label: 'Riwayat Akademik', icon: 'activity', tab: 'Riwayat Akademik' },
      { label: 'Transkrip Saya', icon: 'file', tab: 'Transkrip Saya' },
      { label: 'Jadwal Pelajaran', icon: 'calendar', tab: 'Jadwal Pelajaran' },
    ],
  },
  {
    label: 'Buku Induk Mandiri',
    items: [
      { label: 'Biodata Siswa', icon: 'user', tab: 'Biodata Pribadi Saya' },
      { label: 'Berkas & Dokumen Resmi', icon: 'archive', tab: 'Unggah Dokumen' },
      { label: 'Pengajuan Perubahan Data', icon: 'refresh', tab: 'Pengajuan Perubahan Data' },
    ],
  },
  {
    label: 'Pengaturan',
    items: [{ label: 'Keamanan & Akun', icon: 'shield', tab: 'Keamanan & Akun' }],
  },
]

const subjects = [
  { name: 'Pendidikan Agama & Budi Pekerti', teacher: 'Ahmad Hidayat, S.Ag', grade: '92' },
  { name: 'Pendidikan Pancasila', teacher: 'Sri Wahyuni, M.Pd', grade: '90' },
  { name: 'Bahasa Indonesia', teacher: 'Sri Wahyuni, M.Pd', grade: '88' },
  { name: 'Matematika', teacher: 'Sri Wahyuni, M.Pd', grade: '94' },
  { name: 'Ilmu Pengetahuan Alam dan Sosial', teacher: 'Sri Wahyuni, M.Pd', grade: '89' },
  { name: 'Seni Rupa & Prakarya', teacher: 'Dewi Lestari, S.Pd', grade: '87' },
]

const tabs = ['Nilai & Hasil Belajar', 'Biodata Pribadi Saya', 'Unggah Dokumen', 'Jadwal Pelajaran']

function Icon({ name, size = 17 }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    clipboard: <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4.5h6a1.5 1.5 0 0 0-3-1 1.5 1.5 0 0 0-3 1ZM9 11h6m-6 4h6" /></>,
    activity: <path d="M22 12h-4l-3 9L9 3l-3 9H2" />,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M8 13h8m-8 4h8" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18" /></>,
    user: <><path d="M20 21a8 8 0 0 0-16 0" /><circle cx="12" cy="8" r="5" /></>,
    archive: <><rect x="3" y="4" width="18" height="5" rx="1" /><path d="M5 9v11h14V9m-9 4h4" /></>,
    refresh: <><path d="M20 7v5h-5M4 17v-5h5" /><path d="M5.6 9a7 7 0 0 1 11.55-2.6L20 12M4 12l2.85 5.6A7 7 0 0 0 18.4 15" /></>,
    shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" /><path d="m9 12 2 2 4-4" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 13h4" /></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5m-5 5V3" /></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 1 4 17.5z" /><path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20M8 7h8" /></>,
    help: <><circle cx="12" cy="12" r="10" /><path d="M9.6 9a2.5 2.5 0 1 1 4.4 1.6c-1.1 1.1-2 1.4-2 3m0 3h.01" /></>,
  }

  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name] || paths.file}</svg>
}

function StudentDashboardPage({ onLogout }) {
  const [activeTab, setActiveTab] = useState('Beranda Siswa')
  const [search, setSearch] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notice, setNotice] = useState('')

  function selectTab(tab) {
    setActiveTab(tab)
    setSidebarOpen(false)
    setNotice('')
  }

  const filteredSubjects = subjects.filter((subject) =>
    `${subject.name} ${subject.teacher}`.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="student-app">
      <aside className={`student-sidebar${sidebarOpen ? ' is-open' : ''}`}>
        <div className="student-brand">
          <div className="student-brand-emblem"><img src={schoolEmblem} alt="" /></div>
          <div className="student-brand-copy"><strong>SDN BATU AMPAR 12 PAGI</strong><span>BUKU INDUK DIGITAL</span></div>
        </div>

        <div className="student-role-switcher" aria-label="Peran aktif">
          <span>Admin</span><span>Guru</span><strong>Murid</strong>
        </div>

        <nav className="student-navigation" aria-label="Navigasi siswa">
          <div className="student-nav-group">
            <p className="student-nav-label">Utama</p>
            <button type="button" className={`student-nav-item${activeTab === 'Beranda Siswa' ? ' active' : ''}`} onClick={() => selectTab('Beranda Siswa')}>
              <Icon name="grid" /><span>Beranda Siswa</span>
            </button>
          </div>
          {navigationGroups.map((group) => (
            <div className="student-nav-group" key={group.label}>
              <p className="student-nav-label">{group.label}</p>
              {group.items.map((item) => (
                <button type="button" key={item.label} className={`student-nav-item${activeTab === item.tab ? ' active' : ''}`} onClick={() => selectTab(item.tab)}>
                  <Icon name={item.icon} /><span>{item.label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="student-account">
          <div className="student-profile"><span className="student-profile-avatar">AF</span><span><strong>Ahmad Fauzi Ridwan</strong><small>Siswa Kelas IV A</small></span></div>
          <button type="button" className="student-logout" onClick={onLogout} aria-label="Keluar">⇥</button>
        </div>
      </aside>

      {sidebarOpen && <button className="student-sidebar-scrim" aria-label="Tutup menu" onClick={() => setSidebarOpen(false)} type="button" />}

      <main className="student-main">
        <header className="student-topbar">
          <div className="student-breadcrumb">
            <button type="button" className="student-mobile-menu" onClick={() => setSidebarOpen(true)} aria-label="Buka navigasi">☰</button>
            <Icon name="book" size={16} /><span>{activeTab === 'Beranda Siswa' ? 'Buku Induk' : activeTab}</span><span className="student-breadcrumb-divider">/</span><span className="student-term-badge">T.A. 2025/2026 Ganjil</span>
          </div>
          <label className="student-search"><Icon name="search" size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari NIS, nama siswa, NISN..." aria-label="Cari nilai" /><kbd>⌘ K</kbd></label>
          <div className="student-topbar-actions">
            <span className="student-sync"><i />Dapodik: 10:45 WIB</span>
            <button type="button" className="student-icon-button" aria-label="Notifikasi" onClick={() => setNotice('Tidak ada notifikasi baru.')}><Icon name="bell" /><i /></button>
            <button type="button" className="student-topbar-avatar" aria-label="Profil siswa" onClick={() => selectTab('Biodata Pribadi Saya')}><Icon name="user" /></button>
          </div>
        </header>

        <div className="student-content">
          {notice && <div className="student-notice" role="status">{notice}<button type="button" onClick={() => setNotice('')} aria-label="Tutup">×</button></div>}
          {activeTab === 'Beranda Siswa' ? (
            <>
              <section className="student-welcome">
                <div className="student-welcome-main">
                  <div className="student-welcome-avatar">AF</div>
                  <div className="student-welcome-copy">
                    <div className="student-tags"><span>SISWA AKTIF</span><span>KELAS IV A - FASE B</span></div>
                    <h1>Halo, Ahmad Fauzi Ridwan</h1>
                    <p>NISN 0087654321 · SDN Batu Ampar 12 Pagi · Wali Kelas Dra. Sri Wahyuni, M.Pd</p>
                  </div>
                </div>
                <div className="student-welcome-actions">
                  <button type="button" onClick={() => setNotice('Rekap nilai semester siap diunduh.')}><Icon name="download" size={15} />Unduh rekap nilai</button>
                  <button type="button" className="student-report-button" onClick={() => selectTab('Transkrip Saya')}><Icon name="book" size={15} />Lihat rapor digital</button>
                </div>
                <div className="student-announcement"><Icon name="bell" size={15} /><strong>Pengumuman penting</strong><span>Pengumpulan berkas ijazah TK dan kartu keluarga terakhir tanggal 25 Juni 2025.</span></div>
              </section>

              <section className="student-metrics" aria-label="Ringkasan akademik siswa">
                <MetricCard title="Rata-rata nilai semester" value="89,4" detail="Sangat baik · Peringkat 3" icon="trend" tone="red" />
                <MetricCard title="Kelengkapan biodata" value="100%" detail="Seluruh data terverifikasi" icon="clipboard" tone="blue" />
                <MetricCard title="Tingkat presensi" value="98,2%" detail="Hadir 108 dari 110 hari" icon="activity" tone="purple" />
                <MetricCard title="Status buku induk" value="Aktif" detail="Terakhir diperbarui hari ini" icon="shield" tone="orange" />
              </section>

              <nav className="student-tabs" aria-label="Bagian dashboard siswa">
                {tabs.map((tab) => <button type="button" key={tab} className={activeTab === tab || (activeTab === 'Beranda Siswa' && tab === tabs[0]) ? 'active' : ''} onClick={() => selectTab(tab)}>{tab}</button>)}
              </nav>

              <div className="student-dashboard-grid">
                  <section className="student-panel student-grade-panel">
                    <div className="student-panel-heading">
                      <div><h2>Transkrip Nilai Semester Berjalan</h2><p>Kurikulum Merdeka · Kelas IV A · Semester Ganjil</p></div>
                      <span className="student-kktp-badge">KKTP minimum 75</span>
                    </div>
                    <div className="student-table-wrap">
                      <table className="student-grade-table">
                        <thead><tr><th>No</th><th>Mata Pelajaran</th><th>Guru</th><th>Nilai Akhir</th><th>Status</th><th>Detail</th></tr></thead>
                        <tbody>{filteredSubjects.map((subject) => (
                          <tr key={subject.name}>
                            <td>{String(subjects.indexOf(subject) + 1).padStart(2, '0')}</td><td className="student-subject-name">{subject.name}</td><td>{subject.teacher}</td><td className="student-grade">{subject.grade}</td><td><span className="student-pass-badge">Tuntas</span></td><td><button type="button" className="student-detail-link" onClick={() => setNotice(`Capaian pembelajaran ${subject.name} telah tuntas.`)}>Lihat capaian</button></td>
                          </tr>
                        ))}{filteredSubjects.length === 0 && <tr><td className="student-empty-row" colSpan="6">Mata pelajaran tidak ditemukan.</td></tr>}</tbody>
                      </table>
                    </div>
                    <div className="student-grade-footer"><span>Total beban: 7 mata pelajaran · Status kelulusan: 100% tuntas</span><button type="button" onClick={() => selectTab('Transkrip Saya')}>Buka transkrip lengkap →</button></div>
                  </section>

                  <aside className="student-side-panels">
                    <section className="student-panel student-data-panel">
                      <div className="student-panel-heading"><div><h2>Pembaruan Data Diri</h2><p>Pemeriksaan mandiri buku induk</p></div><span className="student-complete-badge">Lengkap</span></div>
                      <div className="student-data-list">
                        <div><strong>Alamat domisili</strong><span>Diperbarui 12 Juni 2025</span></div>
                        <div><strong>Nomor kontak wali</strong><span>Terverifikasi</span></div>
                        <div><strong>Dokumen keluarga</strong><span>KK dan akta lengkap</span></div>
                      </div>
                      <button type="button" className="student-update-button" onClick={() => selectTab('Biodata Pribadi Saya')}><Icon name="refresh" size={15} />Perbarui data kontak</button>
                    </section>
                    <section className="student-panel student-agenda-panel">
                      <h2>Agenda Penting Siswa</h2>
                      <AgendaItem day="22" title="Asesmen Sumatif Tengah Semester" />
                      <AgendaItem day="25" title="Batas pengumpulan dokumen" />
                      <AgendaItem day="28" title="Pembagian rapor semester" />
                    </section>
                  </aside>
              </div>

              <section className="student-help-banner">
                <span className="student-help-icon"><Icon name="help" size={18} /></span>
                <div><strong>Butuh bantuan mengenai data atau hasil belajar?</strong><span>Hubungi wali kelas atau operator sekolah melalui layanan koreksi data.</span></div>
                <button type="button" onClick={() => selectTab('Pengajuan Perubahan Data')}>Kirim permintaan bantuan</button>
              </section>
            </>
          ) : (
            <StudentScreens module={activeTab} search={search} onNotice={setNotice} />
          )}
        </div>
      </main>
      <button className="student-help-floating" type="button" aria-label="Bantuan" onClick={() => setNotice('Untuk bantuan, kirim permintaan kepada wali kelas melalui bagian bantuan.')}>?</button>
    </div>
  )
}

function MetricCard({ title, value, detail, icon, tone }) {
  return <article className="student-metric-card"><div><h2>{title}</h2><strong>{value}</strong><p>{detail}</p></div><span className={`student-metric-icon ${tone}`}><Icon name={icon} size={17} /></span></article>
}

function AgendaItem({ day, title }) {
  return <div className="student-agenda-item"><span>{day}</span><div><strong>{title}</strong><small>Kelas IV A · SDN Batu Ampar 12 Pagi</small></div></div>
}

export default StudentDashboardPage
