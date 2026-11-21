import { useEffect, useState } from 'react'
import schoolEmblem from '../../../assets/school-emblem.png'
import useSessionState from '../../../hooks/useSessionState.js'
import { getTeacherDashboard } from '../../../services/dashboard/dashboardService.js'
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

const teacherPageOptions = ['Dashboard Guru', ...navigationGroups.flatMap((group) => group.items.map((item) => item.label))]

const avatarColors = ['blue', 'pink', 'purple', 'orange', 'teal']
const initialsFromName = (name = '') => name.split(/\s+/).slice(0, 2).map((part) => part[0] || '').join('').toUpperCase()
const formatScore = (score) => score === null || score === undefined ? '—' : Number(score).toLocaleString('id-ID', { maximumFractionDigits: 1 })

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
  const [targetStudentNisn, setTargetStudentNisn] = useState('')
  const [dashboardData, setDashboardData] = useState(null)
  const [loadingDashboard, setLoadingDashboard] = useState(true)
  const [dashboardError, setDashboardError] = useState('')

  useEffect(() => {
    let cancelled = false
    getTeacherDashboard()
      .then((result) => {
        if (!cancelled) setDashboardData(result)
      })
      .catch((error) => {
        if (!cancelled) setDashboardError(error.message)
      })
      .finally(() => {
        if (!cancelled) setLoadingDashboard(false)
      })
    return () => { cancelled = true }
  }, [])

  function showNotice(message) {
    setNotice(message)
  }

  function selectPage(label) {
    setActivePage(label)
    setSidebarOpen(false)
    setNotice('')
  }

  function openGradebook(nisn = '') {
    setTargetStudentNisn(nisn)
    selectPage('Input Nilai & Asesmen')
  }

  function openCorrection(nisn) {
    setTargetStudentNisn(nisn)
    selectPage('Usulan Koreksi Data')
  }

  const teacherName = dashboardData?.profile?.name || 'Nama guru belum tersedia'
  const classNames = dashboardData?.classes?.map((item) => item.nama_kelas).join(', ')
  const academicYear = dashboardData?.academicYear?.nama_tahun_ajaran || 'Tahun ajaran belum aktif'
  const filteredStudents = (dashboardData?.students || []).filter((student) =>
    `${student.nama_lengkap} ${student.nisn}`.toLowerCase().includes(search.toLowerCase()),
  )
  const reportProgress = dashboardData?.metrics?.reportProgress ?? 0

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
            <span className="teacher-avatar">{initialsFromName(teacherName)}</span>
            <span><strong>{teacherName}</strong><small>{classNames || 'Belum ada penugasan kelas'}</small></span>
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
            <span className="teacher-term-badge">{academicYear}</span>
          </div>
          <label className="teacher-search">
            <Icon name="search" size={17} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari NIS, nama siswa, NISN..." aria-label="Cari siswa" />
            <kbd>⌘ K</kbd>
          </label>
          <div className="teacher-topbar-actions">
            <span className="teacher-sync"><i />{loadingDashboard ? 'Memuat data' : dashboardError ? 'Data gagal dimuat' : 'Database terhubung'}</span>
            <button type="button" className="teacher-icon-button" aria-label="Notifikasi" onClick={() => showNotice('Tidak ada notifikasi baru.')}><Icon name="bell" /><i /></button>
            <button type="button" className="teacher-topbar-avatar" aria-label="Profil guru" onClick={() => selectPage('Profil Guru & Akun')}><Icon name="users" /></button>
          </div>
        </header>

        <div className="teacher-content">
          {dashboardError && <div className="teacher-notice" role="alert">{dashboardError}</div>}
          {notice && <div className="teacher-notice" role="status">{notice}<button type="button" onClick={() => setNotice('')} aria-label="Tutup">×</button></div>}

          {activePage === 'Dashboard Guru' ? (
            <>
          <section className="teacher-welcome">
            <div className="teacher-welcome-main">
              <div className="teacher-tags"><span>{classNames || 'Belum ada kelas binaan'}</span><span>{academicYear}</span><span className="synced">{loadingDashboard ? 'Memuat...' : 'Data database'}</span></div>
              <h1>Selamat Bertugas,<br />{teacherName}</h1>
              <p>Ringkasan kelas, jadwal, nilai, dan presensi berdasarkan data yang tersimpan.</p>
            </div>
            <div className="teacher-welcome-actions">
              <button type="button" className="primary" onClick={() => openGradebook()}><Icon name="plus" size={16} />Input nilai harian</button>
              <button type="button" onClick={() => selectPage('Leger Nilai Kelas')}><Icon name="file" size={16} />Lihat leger rapor</button>
              <button type="button" onClick={() => selectPage('Usulan Koreksi Data')}><Icon name="upload" size={16} />Usulan koreksi</button>
            </div>
            <div className="teacher-deadline">
              <span className="deadline-icon"><Icon name="bell" size={18} /></span>
              <div>
                <strong>{dashboardData?.announcements?.[0]?.judul || 'Informasi sekolah'}</strong>
                <small>{dashboardData?.announcements?.[0]?.isi || 'Belum ada pengumuman yang ditujukan kepada guru.'}</small>
              </div>
              <span className="deadline-time"><small>Tahun ajaran</small><strong>{academicYear}</strong></span>
            </div>
          </section>

          <section className="teacher-metrics" aria-label="Ringkasan kelas">
            <MetricCard title="Siswa binaan" value={loadingDashboard ? '…' : String(dashboardData?.metrics?.students ?? 0)} detail={dashboardData?.metrics?.attendanceRate == null ? 'Belum ada data presensi' : `Kehadiran ${dashboardData.metrics.attendanceRate}%`} icon="users" tone="red" />
            <MetricCard title="Progres nilai rapor" value={loadingDashboard ? '…' : `${reportProgress}%`} detail={`${dashboardData?.metrics?.reportStudents ?? 0} siswa memiliki rapor`} icon="trend" tone="blue" />
            <MetricCard title="Catatan karakter P5" value={loadingDashboard ? '…' : `${dashboardData?.metrics?.p5Students ?? 0}/${dashboardData?.metrics?.students ?? 0}`} detail="Siswa dengan data P5 tersimpan" icon="activity" tone="purple" />
            <MetricCard title="Usulan koreksi data" value={loadingDashboard ? '…' : String(dashboardData?.metrics?.pendingRequests ?? 0)} detail="Menunggu tinjauan" icon="refresh" tone="orange" />
          </section>

          <section className="teacher-overview">
            <article className="teacher-panel schedule-panel">
              <div className="teacher-panel-heading">
                <div><h2>Jadwal Mengajar Hari Ini</h2><p>{dashboardData?.schedule?.[0]?.hari || 'Hari ini'} · {classNames || 'Belum ada kelas'}</p></div>
                <span className="live-badge">{loadingDashboard ? 'Memuat...' : dashboardData?.schedule?.length ? `${dashboardData.schedule.length} jadwal` : 'Tidak ada jadwal'}</span>
              </div>
              <div className="schedule-list">
                {dashboardData?.schedule?.map((item) => (
                  <ScheduleCard
                    key={item.id_jadwal}
                    time={`${String(item.jam_mulai).slice(0, 5)}–${String(item.jam_selesai).slice(0, 5)}`}
                    subject={item.nama_mapel}
                    topic={`${item.nama_kelas}${item.ruang ? ` · ${item.ruang}` : ''}`}
                  />
                ))}
                {!loadingDashboard && !dashboardData?.schedule?.length && <p className="teacher-empty-state">Belum ada jadwal untuk hari ini.</p>}
              </div>
            </article>

            <article className="teacher-panel mastery-panel">
              <div className="teacher-panel-heading">
                <div><h2>Progres Rapor Kelas</h2><p>Berdasarkan rapor yang tersimpan</p></div>
                <span className="mastery-pulse"><Icon name="activity" size={18} /></span>
              </div>
              <div className="mastery-chart" style={{ background: `conic-gradient(#bd101b 0% ${reportProgress}%, #f5e5e6 ${reportProgress}% 100%)` }}><div><strong>{loadingDashboard ? '…' : `${reportProgress}%`}</strong><span>RAPOR</span></div></div>
              <div className="mastery-legend">
                <div><strong>{dashboardData?.metrics?.reportStudents ?? 0}</strong><span>Tersimpan</span></div><div><strong>{Math.max((dashboardData?.metrics?.students ?? 0) - (dashboardData?.metrics?.reportStudents ?? 0), 0)}</strong><span>Belum ada</span></div>
              </div>
            </article>
          </section>

          <section className="teacher-lower-grid">
            <article className="teacher-panel student-panel">
              <div className="teacher-panel-heading">
                <div><h2>Daftar Siswa Binaan{classNames ? ` · ${classNames}` : ''}</h2><p>{dashboardData?.metrics?.students ?? 0} siswa terdaftar · {academicYear}</p></div>
                <button type="button" className="teacher-text-link" onClick={() => selectPage('Daftar Siswa Binaan')}>Buka semua siswa <span>→</span></button>
              </div>
              <div className="student-table-wrap">
                <table className="teacher-student-table">
                  <thead><tr><th>Siswa &amp; Identitas</th><th>Kehadiran</th><th>Rata-rata</th><th>Karakter P5</th><th>Aksi</th></tr></thead>
                  <tbody>
                    {filteredStudents.map((student, index) => (
                      <tr key={student.nisn}>
                        <td><div className="student-identity"><span className={`student-avatar ${avatarColors[index % avatarColors.length]}`}>{initialsFromName(student.nama_lengkap)}</span><span><strong>{student.nama_lengkap}</strong><small>NISN {student.nisn}</small></span></div></td>
                        <td className="attendance-value">{student.total_hari ? `${Math.round((student.hadir / student.total_hari) * 1000) / 10}%` : '—'}</td><td className="average-value">{formatScore(student.nilai_rata_rata)}</td><td><span className="character-badge">{student.catatan_p5 ? `${student.catatan_p5} catatan P5` : 'Belum ada P5'}</span></td>
                        <td><button className="student-action" type="button" onClick={() => openGradebook(student.nisn)}>Rapor</button></td>
                      </tr>
                    ))}
                    {!loadingDashboard && filteredStudents.length === 0 && <tr><td className="no-students" colSpan="5">{search ? 'Tidak ada siswa yang cocok dengan pencarian.' : 'Belum ada siswa yang ditugaskan ke kelas Anda.'}</td></tr>}
                    {loadingDashboard && <tr><td className="no-students" colSpan="5">Memuat data siswa...</td></tr>}
                  </tbody>
                </table>
              </div>
            </article>

            <div className="teacher-side-panels">
              <article className="teacher-panel subject-panel">
                <div className="teacher-panel-heading"><div><h2>Mata Pelajaran Ditugaskan</h2></div></div>
                <div className="subject-statuses">
                {dashboardData?.subjects?.map((subject) => <SubjectStatus key={subject.id_mapel} name={subject.nama_mapel} status="Ditugaskan" complete />)}
                {!loadingDashboard && !dashboardData?.subjects?.length && <p className="teacher-empty-state">Belum ada mata pelajaran yang ditugaskan.</p>}
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
              registered={dashboardData?.profile?.registered}
              hasStudents={Boolean(dashboardData?.students?.length)}
              students={dashboardData?.students || []}
              dashboardData={dashboardData}
              initialNisn={targetStudentNisn}
              loading={loadingDashboard}
              onOpenGradebook={openGradebook}
              onOpenCorrection={openCorrection}
              onSelectPage={selectPage}
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

function ScheduleCard({ time, subject, topic }) {
  return (
    <article className="schedule-card">
      <div className="schedule-time">{time}</div>
      <h3>{subject}</h3><p>{topic}</p>
    </article>
  )
}

function SubjectStatus({ name, status, complete = false }) {
  return <div className={`subject-status${complete ? ' complete' : ''}`}><span>{name}</span><strong>{status}</strong></div>
}

export default TeacherDashboardPage
