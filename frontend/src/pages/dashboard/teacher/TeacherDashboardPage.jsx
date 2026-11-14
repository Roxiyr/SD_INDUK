import { useState } from 'react'
import schoolEmblem from '../../../assets/school-emblem.png'
import useSessionState from '../../../hooks/useSessionState.js'
import TeacherScreens from './screens/TeacherScreens.jsx'
import './TeacherDashboardPage.css'

const navigationGroups = [
  {
    label: 'Kelas & Akademik',
    items: [
      { label: 'Daftar Siswa Binaan', icon: 'users' },
      { label: 'Input Nilai & Asesmen', icon: 'clipboard' },
      { label: 'Rekap Presensi Siswa', icon: 'file' },
      { label: 'Catatan Karakter & P5', icon: 'activity' },
      { label: 'Jadwal Mengajar', icon: 'calendar' },
    ],
  },
  {
    label: 'Buku Induk',
    items: [
      { label: 'Leger Nilai Kelas', icon: 'book' },
      { label: 'Verifikasi Rapor Siswa', icon: 'shield' },
      { label: 'Usulan Koreksi Data', icon: 'refresh' },
    ],
  },
  {
    label: 'Pengaturan',
    items: [{ label: 'Profil Guru & Akun', icon: 'settings' }],
  },
]

const students = [
  { initials: 'AP', name: 'Aditya Pratama', attendance: '100%', average: '92,4', character: 'Sangat baik', color: 'blue' },
  { initials: 'AR', name: 'Aisyah Rahma Putri', attendance: '98,2%', average: '89,8', character: 'Sangat baik', color: 'pink' },
  { initials: 'BA', name: 'Bima Arya Kusuma', attendance: '96,5%', average: '84,5', character: 'Berkembang', color: 'purple' },
  { initials: 'CK', name: 'Citra Kirana Dewi', attendance: '100%', average: '95,1', character: 'Sangat baik', color: 'orange' },
  { initials: 'DW', name: 'Dimas Wahyu Pratama', attendance: '92,0%', average: '78,0', character: 'Bimbingan', color: 'teal' },
]

const teacherPageOptions = ['Dashboard Guru', ...navigationGroups.flatMap((group) => group.items.map((item) => item.label))]

function Icon({ name, size = 17 }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    clipboard: <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4.5h6a1.5 1.5 0 0 0-3-1 1.5 1.5 0 0 0-3 1ZM9 11h6m-6 4h6" /></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M8 13h8m-8 4h8" /></>,
    activity: <><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18" /></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 1 4 17.5z" /><path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20M8 7h8" /></>,
    shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" /><path d="m9 12 2 2 4-4" /></>,
    refresh: <><path d="M20 7v5h-5M4 17v-5h5" /><path d="M5.6 9a7 7 0 0 1 11.55-2.6L20 12M4 12l2.85 5.6A7 7 0 0 0 18.4 15" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.6.9l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.6-.9l-1.7.7-1.4-2.4 1.4-1.1a7 7 0 0 1 0-1.9l-1.4-1.1 1.4-2.4 1.7.7a8 8 0 0 1 1.6-.9l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.6.9l1.7-.7 1.4 2.4-1.4 1.1a7 7 0 0 1-.1 1.8Z" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 13h4" /></>,
    plus: <><path d="M12 5v14m-7-7h14" /></>,
    upload: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m17 8-5-5-5 5m5-5v12" /></>,
    arrow: <><path d="M5 12h14m-7-7 7 7-7 7" /></>,
    trend: <><path d="m3 17 6-6 4 4 8-8" /><path d="M15 7h6v6" /></>,
  }

  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {paths[name] || paths.file}
    </svg>
  )
}

function TeacherDashboardPage({ onLogout }) {
  const [activePage, setActivePage] = useSessionState('sd-induk.teacherPage', 'Dashboard Guru', teacherPageOptions)
  const [search, setSearch] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notice, setNotice] = useState('')

  function showNotice(message) {
    setNotice(message)
  }

  function selectPage(label) {
    setActivePage(label)
    setSidebarOpen(false)
    setNotice('')
  }

  const filteredStudents = students.filter((student) =>
    `${student.name} ${student.initials}`.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="teacher-app">
      <aside className={`teacher-sidebar${sidebarOpen ? ' is-open' : ''}`}>
        <div className="teacher-brand">
          <div className="teacher-brand-emblem"><img src={schoolEmblem} alt="" /></div>
          <div className="teacher-brand-copy">
            <strong>SDN BATU AMPAR 12 PAGI</strong>
            <span>BUKU INDUK DIGITAL</span>
          </div>
        </div>

        <div className="teacher-role-switcher" aria-label="Peran aktif">
          <span>Admin</span><strong>Guru</strong><span>Murid</span>
        </div>

        <nav className="teacher-navigation" aria-label="Navigasi guru">
          <div className="teacher-nav-group">
            <p className="teacher-nav-label">Utama</p>
            <button type="button" className={`teacher-nav-item${activePage === 'Dashboard Guru' ? ' active' : ''}`} onClick={() => selectPage('Dashboard Guru')}>
              <Icon name="grid" /><span>Dashboard Guru</span>
            </button>
          </div>
          {navigationGroups.map((group) => (
            <div className="teacher-nav-group" key={group.label}>
              <p className="teacher-nav-label">{group.label}</p>
              {group.items.map((item) => (
                <button type="button" key={item.label} className={`teacher-nav-item${activePage === item.label ? ' active' : ''}`} onClick={() => selectPage(item.label)}>
                  <Icon name={item.icon} /><span>{item.label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="teacher-account">
          <div className="teacher-profile">
            <span className="teacher-avatar">SW</span>
            <span><strong>Dra. Sri Wahyuni, S.Pd</strong><small>Wali Kelas IV A</small></span>
          </div>
          <button type="button" className="teacher-logout" onClick={onLogout} aria-label="Keluar">
            <Icon name="arrow" size={16} />
          </button>
        </div>
      </aside>

      {sidebarOpen && <button className="teacher-sidebar-scrim" aria-label="Tutup menu" onClick={() => setSidebarOpen(false)} type="button" />}

      <main className="teacher-main">
        <header className="teacher-topbar">
          <div className="teacher-breadcrumb">
            <button className="teacher-mobile-menu" type="button" onClick={() => setSidebarOpen(true)} aria-label="Buka navigasi">☰</button>
            <Icon name="book" size={16} /><span>{activePage === 'Dashboard Guru' ? 'Buku Induk' : activePage}</span><span className="teacher-breadcrumb-divider">/</span>
            <span className="teacher-term-badge">T.A. 2025/2026 Ganjil</span>
          </div>
          <label className="teacher-search">
            <Icon name="search" size={17} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari NIS, nama siswa, NISN..." aria-label="Cari siswa" />
            <kbd>⌘ K</kbd>
          </label>
          <div className="teacher-topbar-actions">
            <span className="teacher-sync"><i />Dapodik: 10:45 WIB</span>
            <button type="button" className="teacher-icon-button" aria-label="Notifikasi" onClick={() => showNotice('Tidak ada notifikasi baru.')}><Icon name="bell" /><i /></button>
            <button type="button" className="teacher-topbar-avatar" aria-label="Profil guru" onClick={() => selectPage('Profil Guru & Akun')}><Icon name="users" /></button>
          </div>
        </header>

        <div className="teacher-content">
          {notice && <div className="teacher-notice" role="status">{notice}<button type="button" onClick={() => setNotice('')} aria-label="Tutup">×</button></div>}

          {activePage === 'Dashboard Guru' ? (
            <>
          <section className="teacher-welcome">
            <div className="teacher-welcome-main">
              <div className="teacher-tags"><span>WALI KELAS IV A - FASE B</span><span>T.A. 2025/2026 Ganjil</span><span className="synced">Dapodik tersinkron</span></div>
              <h1>Selamat Bertugas, Ibu<br />Dra. Sri Wahyuni, M.Pd</h1>
              <p>Rekapitulasi akademik, buku induk siswa, dan asesmen capaian pembelajaran Fase B SDN Batu Ampar 12 Pagi hari ini.</p>
            </div>
            <div className="teacher-welcome-actions">
              <button type="button" className="primary" onClick={() => showNotice('Form input nilai harian siap dibuka.')}><Icon name="plus" size={16} />Input nilai harian</button>
              <button type="button" onClick={() => showNotice('Cetak leger rapor dipilih.')}><Icon name="file" size={16} />Cetak leger rapor</button>
              <button type="button" onClick={() => selectPage('Usulan Koreksi Data')}><Icon name="upload" size={16} />Usulan koreksi</button>
            </div>
            <div className="teacher-deadline">
              <span className="deadline-icon"><Icon name="bell" size={18} /></span>
              <div><strong>Penguncian Buku Induk Rapor Semester Ganjil</strong><small>Lengkapi leger nilai dan catatan karakter sebelum periode penguncian.</small></div>
              <span className="deadline-time"><small>Tenggat waktu</small><strong>Tersisa 14 hari</strong></span>
            </div>
          </section>

          <section className="teacher-metrics" aria-label="Ringkasan kelas">
            <MetricCard title="Siswa binaan" value="32" detail="Kehadiran 98,4%" icon="users" tone="red" />
            <MetricCard title="Progres nilai rapor" value="88%" detail="6 dari 7 mapel tuntas" icon="trend" tone="blue" />
            <MetricCard title="Catatan karakter P5" value="28/32" detail="4 dalam review wali kelas" icon="activity" tone="purple" />
            <MetricCard title="Usulan koreksi data" value="2" detail="Menunggu verifikasi TU" icon="refresh" tone="orange" />
          </section>

          <section className="teacher-overview">
            <article className="teacher-panel schedule-panel">
              <div className="teacher-panel-heading">
                <div><h2>Jadwal Mengajar Hari Ini</h2><p>Rabu, 18 Juni 2025 · Kelas IV A</p></div>
                <span className="live-badge">Sedang berlangsung</span>
              </div>
              <div className="schedule-list">
                <ScheduleCard time="07.30–09.00" subject="Matematika" topic="Pecahan & desimal" />
                <ScheduleCard time="09.30–11.00" subject="IPAS" topic="Alam & sosial" active />
                <ScheduleCard time="11.15–12.30" subject="Karakter P5 & Literasi" topic="Gaya hidup berkelanjutan" />
              </div>
            </article>

            <article className="teacher-panel mastery-panel">
              <div className="teacher-panel-heading">
                <div><h2>Ketuntasan KKTP Kelas</h2><p>Standar capaian Fase B</p></div>
                <span className="mastery-pulse"><Icon name="activity" size={18} /></span>
              </div>
              <div className="mastery-chart"><div><strong>94%</strong><span>TUNTAS</span></div></div>
              <div className="mastery-legend">
                <div><strong>30</strong><span>Mahir</span></div><div><strong>2</strong><span>Cakap</span></div><div><strong>0</strong><span>Perlu</span></div>
              </div>
            </article>
          </section>

          <section className="teacher-lower-grid">
            <article className="teacher-panel student-panel">
              <div className="teacher-panel-heading">
                <div><h2>Daftar Siswa Binaan Kelas IV A</h2><p>Pantauan akademik dan buku induk semester berjalan</p></div>
                <button type="button" className="teacher-text-link" onClick={() => selectPage('Daftar Siswa Binaan')}>Buka semua siswa <span>→</span></button>
              </div>
              <div className="student-table-wrap">
                <table className="teacher-student-table">
                  <thead><tr><th>Siswa &amp; Identitas</th><th>Kehadiran</th><th>Rata-rata</th><th>Karakter P5</th><th>Aksi</th></tr></thead>
                  <tbody>
                    {filteredStudents.map((student, index) => (
                      <tr key={student.initials}>
                        <td><div className="student-identity"><span className={`student-avatar ${student.color}`}>{student.initials}</span><span><strong>{student.name}</strong><small>NISN 001234567{index + 1}</small></span></div></td>
                        <td className="attendance-value">{student.attendance}</td><td className="average-value">{student.average}</td><td><span className="character-badge">{student.character}</span></td>
                        <td><button className="student-action" type="button" onClick={() => showNotice(`Rapor ${student.name} dipilih.`)}>Rapor</button></td>
                      </tr>
                    ))}
                    {filteredStudents.length === 0 && <tr><td className="no-students" colSpan="5">Tidak ada siswa yang cocok dengan pencarian.</td></tr>}
                  </tbody>
                </table>
              </div>
            </article>

            <div className="teacher-side-panels">
              <article className="teacher-panel subject-panel">
                <div className="teacher-panel-heading"><div><h2>Status Pengisian Mapel IV A</h2></div></div>
                <div className="subject-statuses">
                  <SubjectStatus name="Pendidikan Pancasila" status="100% selesai" complete />
                  <SubjectStatus name="Bahasa Indonesia" status="100% selesai" complete />
                  <SubjectStatus name="Matematika" status="100% selesai" complete />
                  <SubjectStatus name="Pendidikan Jasmani" status="Menunggu guru" />
                </div>
              </article>
              <article className="teacher-guide">
                <h2>Pedoman Rapor Kurikulum Merdeka</h2>
                <p>Pastikan deskripsi capaian pembelajaran dan profil peserta didik sesuai regulasi sekolah dasar.</p>
                <button type="button" onClick={() => showNotice('Panduan rapor siap diunduh.')}><Icon name="upload" size={14} />Unduh panduan</button>
              </article>
            </div>
          </section>
            </>
          ) : (
            <TeacherScreens
              module={activePage}
              search={search}
              onNotice={showNotice}
            />
          )}
        </div>
      </main>
      <button className="teacher-help" type="button" aria-label="Bantuan" onClick={() => showNotice('Hubungi administrator sekolah jika Anda membutuhkan bantuan.')}>?</button>
    </div>
  )
}

function MetricCard({ title, value, detail, icon, tone }) {
  return (
    <article className="teacher-metric-card">
      <div><h2>{title}</h2><strong>{value}</strong><p>{detail}</p></div>
      <span className={`teacher-metric-icon ${tone}`}><Icon name={icon} size={19} /></span>
    </article>
  )
}

function ScheduleCard({ time, subject, topic, active = false }) {
  return (
    <article className={`schedule-card${active ? ' is-active' : ''}`}>
      <div className="schedule-time">{time}</div>
      {active && <span className="schedule-active-tag">Aktif</span>}
      <h3>{subject}</h3><p>{topic}</p>
      <div className="schedule-attendance"><Icon name="users" size={13} />32/32 siswa hadir</div>
    </article>
  )
}

function SubjectStatus({ name, status, complete = false }) {
  return <div className={`subject-status${complete ? ' complete' : ''}`}><span>{name}</span><strong>{status}</strong></div>
}

export default TeacherDashboardPage
