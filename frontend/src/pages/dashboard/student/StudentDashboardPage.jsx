import { useEffect, useState } from 'react'
import schoolEmblem from '../../../assets/school-emblem.png'
import useSessionState from '../../../hooks/useSessionState.js'
import { getStudentDashboard } from '../../../services/dashboard/dashboardService.js'
import { apiRequest } from '../../../services/apiClient.js'
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

const tabs = ['Nilai & Hasil Belajar', 'Biodata Pribadi Saya', 'Unggah Dokumen', 'Jadwal Pelajaran']
const studentPageOptions = ['Beranda Siswa', ...tabs, ...navigationGroups.flatMap((group) => group.items.map((item) => item.tab))]

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
  const [activeTab, setActiveTab] = useSessionState('sd-induk.studentPage', 'Beranda Siswa', studentPageOptions)
  const [search, setSearch] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const [dashboardData, setDashboardData] = useState(null)
  const [loadingDashboard, setLoadingDashboard] = useState(true)
  const [dashboardError, setDashboardError] = useState('')

  useEffect(() => {
    let cancelled = false
    getStudentDashboard()
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

  function selectTab(tab) {
    setActiveTab(tab)
    setSidebarOpen(false)
    setNotice('')
  }

  const profile = dashboardData?.profile
  const grades = dashboardData?.grades || []
  const classPlacement = dashboardData?.classPlacement
  const academicYear = dashboardData?.academicYear?.nama_tahun_ajaran || 'Tahun ajaran belum aktif'
  const studentName = profile?.nama_lengkap || 'Data profil belum tersedia'
  const initials = studentName.split(/\s+/).slice(0, 2).map((part) => part[0] || '').join('').toUpperCase()
  const schoolName = dashboardData?.school?.nama_sekolah || 'Profil sekolah belum diatur'
  const profileFields = profile
    ? [profile.nisn, profile.nis, profile.nama_lengkap, profile.tanggal_lahir, profile.alamat, profile.nomor_telepon, profile.nama_ayah, profile.nama_ibu]
    : []
  const profileCompletion = profileFields.length
    ? Math.round((profileFields.filter(Boolean).length / profileFields.length) * 100)
    : 0
  const filteredGrades = grades.filter((grade) =>
    `${grade.nama_mapel} ${grade.kategori_mapel}`.toLowerCase().includes(search.toLowerCase()),
  )

  async function downloadReport() {
    try {
      const response = await apiRequest('/portal/cetak-pdf')
      const url = URL.createObjectURL(await response.blob())
      const link = document.createElement('a')
      link.href = url
      link.download = `buku-induk-${profile?.nisn || 'siswa'}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (error) {
      setDashboardError(error.message)
    }
  }

  return (
    <div className="student-app">
      <aside className={`student-sidebar${sidebarOpen ? ' is-open' : ''}`}>
        <div className="student-brand">
          <div className="student-brand-emblem"><img src={schoolEmblem} alt="" /></div>
          <div className="student-brand-copy"><strong>{schoolName}</strong><span>BUKU INDUK DIGITAL</span></div>
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
          <div className="student-profile"><span className="student-profile-avatar">{initials}</span><span><strong>{studentName}</strong><small>{classPlacement?.nama_kelas || 'Kelas belum ditetapkan'}</small></span></div>
          <button type="button" className="student-logout" onClick={onLogout} aria-label="Keluar">⇥</button>
        </div>
      </aside>

      {sidebarOpen && <button className="student-sidebar-scrim" aria-label="Tutup menu" onClick={() => setSidebarOpen(false)} type="button" />}

      <main className="student-main">
        <header className="student-topbar">
          <div className="student-breadcrumb">
            <button type="button" className="student-mobile-menu" onClick={() => setSidebarOpen(true)} aria-label="Buka navigasi">☰</button>
            <Icon name="book" size={16} /><span>{activeTab === 'Beranda Siswa' ? 'Buku Induk' : activeTab}</span><span className="student-breadcrumb-divider">/</span>            <span className="student-term-badge">{academicYear}</span>
          </div>
          <label className="student-search"><Icon name="search" size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari mata pelajaran..." aria-label="Cari nilai" /><kbd>⌘ K</kbd></label>
          <div className="student-topbar-actions">
            <span className="student-sync"><i />{loadingDashboard ? 'Memuat data...' : dashboardData ? 'Terhubung ke database' : 'Data tidak tersedia'}</span>
            <button type="button" className="student-icon-button" aria-label="Notifikasi" onClick={() => setNotice('Tidak ada notifikasi baru.')}><Icon name="bell" /><i /></button>
            <button type="button" className="student-topbar-avatar" aria-label="Profil siswa" onClick={() => selectTab('Biodata Pribadi Saya')}><Icon name="user" /></button>
          </div>
        </header>

        <div className="student-content">
          {dashboardError && <div className="student-notice" role="alert">{dashboardError}</div>}
          {notice && <div className="student-notice" role="status">{notice}<button type="button" onClick={() => setNotice('')} aria-label="Tutup">×</button></div>}
          {activeTab === 'Beranda Siswa' ? (
            <>
              <section className="student-welcome">
                <div className="student-welcome-main">
                  <div className="student-welcome-avatar">{initials}</div>
                  <div className="student-welcome-copy">
                    <div className="student-tags"><span>{profile?.status_siswa || 'Status belum tersedia'}</span><span>{classPlacement ? `${classPlacement.nama_kelas} · Fase ${classPlacement.fase}` : 'Kelas belum ditetapkan'}</span></div>
                    <h1>Halo, {studentName}</h1>
                    <p>NISN {profile?.nisn || '—'} · {schoolName} · Wali kelas {classPlacement?.wali_kelas || 'belum ditetapkan'}</p>
                  </div>
                </div>
                <div className="student-welcome-actions">
                  <button type="button" onClick={downloadReport}><Icon name="download" size={15} />Unduh rekap nilai</button>
                  <button type="button" className="student-report-button" onClick={() => selectTab('Transkrip Saya')}><Icon name="book" size={15} />Lihat rapor digital</button>
                </div>
                <div className="student-announcement"><Icon name="bell" size={15} /><strong>{dashboardData?.announcements?.[0]?.jenis || 'Informasi sekolah'}</strong><span>{dashboardData?.announcements?.[0]?.judul || 'Belum ada pengumuman untuk siswa.'}</span></div>
              </section>

              <section className="student-metrics" aria-label="Ringkasan akademik siswa">
                <MetricCard title="Rata-rata nilai" value={dashboardData?.metrics?.average == null ? '—' : Number(dashboardData.metrics.average).toLocaleString('id-ID', { maximumFractionDigits: 1 })} detail={dashboardData?.report ? `${dashboardData.report.semester} ${dashboardData.report.tahun_pelajaran}` : dashboardData?.reportStatus || 'Belum ada rapor'} icon="trend" tone="red" />
                <MetricCard title="Kelengkapan biodata" value={profile ? `${profileCompletion}%` : '—'} detail={`${profileFields.filter(Boolean).length}/${profileFields.length} data utama terisi`} icon="clipboard" tone="blue" />
                <MetricCard title="Tingkat presensi" value={dashboardData?.metrics?.attendanceRate == null ? '—' : `${dashboardData.metrics.attendanceRate}%`} detail={`${dashboardData?.metrics?.attendancePresent ?? 0} hadir dari ${dashboardData?.metrics?.attendanceTotal ?? 0} hari`} icon="activity" tone="purple" />
                <MetricCard title="Status buku induk" value={profile?.status_siswa || '—'} detail={dashboardData?.metrics?.documents ? `${dashboardData.metrics.verifiedDocuments}/${dashboardData.metrics.documents} dokumen terverifikasi` : 'Belum ada dokumen tercatat'} icon="shield" tone="orange" />
              </section>

              <nav className="student-tabs" aria-label="Bagian dashboard siswa">
                {tabs.map((tab) => <button type="button" key={tab} className={activeTab === tab || (activeTab === 'Beranda Siswa' && tab === tabs[0]) ? 'active' : ''} onClick={() => selectTab(tab)}>{tab}</button>)}
              </nav>

              <div className="student-dashboard-grid">
                  <section className="student-panel student-grade-panel">
                    <div className="student-panel-heading">
                      <div><h2>Transkrip Nilai Semester Berjalan</h2><p>{classPlacement?.nama_kelas || 'Kelas belum ditetapkan'} · {dashboardData?.report ? `${dashboardData.report.semester} ${dashboardData.report.tahun_pelajaran}` : academicYear}</p></div>
                      <span className="student-kktp-badge">{dashboardData?.report ? 'Rapor disetujui' : dashboardData?.reportStatus || 'Belum ada rapor'}</span>
                    </div>
                    <div className="student-table-wrap">
                      <table className="student-grade-table">
                        <thead><tr><th>No</th><th>Mata Pelajaran</th><th>Kategori</th><th>Nilai Akhir</th><th>Status</th><th>Detail</th></tr></thead>
                        <tbody>{filteredGrades.map((grade, index) => (
                          <tr key={`${grade.nama_mapel}-${grade.kategori_mapel}`}>
                            <td>{String(index + 1).padStart(2, '0')}</td><td className="student-subject-name">{grade.nama_mapel}</td><td>{grade.kategori_mapel}</td><td className="student-grade">{formatScore(grade.nilai_akhir)}</td><td><span className="student-pass-badge">{grade.nilai_akhir == null ? 'Belum dinilai' : 'Tersimpan'}</span></td><td><button type="button" className="student-detail-link" onClick={() => setNotice(grade.capaian_kompetensi || `Belum ada catatan capaian untuk ${grade.nama_mapel}.`)}>Lihat capaian</button></td>
                          </tr>
                        ))}{!loadingDashboard && filteredGrades.length === 0 && <tr><td className="student-empty-row" colSpan="6">{search ? 'Mata pelajaran tidak ditemukan.' : 'Belum ada nilai rapor yang tersimpan.'}</td></tr>}{loadingDashboard && <tr><td className="student-empty-row" colSpan="6">Memuat nilai...</td></tr>}                        </tbody>
                      </table>
                    </div>
                    <div className="student-grade-footer"><span>{grades.length} mata pelajaran · {dashboardData?.report?.keputusan_akhir || 'Belum ada keputusan rapor'}</span><button type="button" onClick={() => selectTab('Transkrip Saya')}>Buka transkrip lengkap →</button></div>
                  </section>

                  <aside className="student-side-panels">
                    <section className="student-panel student-data-panel">
                      <div className="student-panel-heading"><div><h2>Pembaruan Data Diri</h2><p>Pemeriksaan mandiri buku induk</p></div><span className="student-complete-badge">{profile ? `${profileCompletion}%` : '—'}</span></div>
                      <div className="student-data-list">
                        <div><strong>Alamat domisili</strong><span>{profile?.alamat || 'Belum diisi'}</span></div>
                        <div><strong>Nomor telepon siswa</strong><span>{profile?.nomor_telepon || 'Belum diisi'}</span></div>
                        <div><strong>Dokumen keluarga</strong><span>{dashboardData?.metrics?.verifiedDocuments || 0} terverifikasi dari {dashboardData?.metrics?.documents || 0}</span></div>
                      </div>
                      <button type="button" className="student-update-button" onClick={() => selectTab('Biodata Pribadi Saya')}><Icon name="refresh" size={15} />Perbarui data kontak</button>
                    </section>
                    <section className="student-panel student-agenda-panel">
                      <h2>Agenda Penting Siswa</h2>
                      {dashboardData?.announcements?.map((announcement) => (
                        <AgendaItem key={announcement.id_informasi} day={formatAgendaDate(announcement.mulai_pada)} title={announcement.judul} detail={announcement.jenis || announcement.isi} />
                      ))}
                      {!loadingDashboard && !dashboardData?.announcements?.length && <p className="student-empty-state">Belum ada agenda untuk siswa.</p>}
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
            <StudentScreens
              module={activeTab}
              search={search}
              onNotice={setNotice}
              onNavigate={selectTab}
              onDownloadReport={downloadReport}
              hasProfile={Boolean(profile)}
              profile={profile}
              dashboardData={dashboardData}
              loading={loadingDashboard}
            />
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

function AgendaItem({ day, title, detail }) {
  return <div className="student-agenda-item"><span>{day}</span><div><strong>{title}</strong><small>{detail}</small></div></div>
}

function formatScore(value) {
  return value == null ? '—' : Number(value).toLocaleString('id-ID', { maximumFractionDigits: 1 })
}

function formatAgendaDate(value) {
  if (!value) return 'Info'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Info' : date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
}

export default StudentDashboardPage
