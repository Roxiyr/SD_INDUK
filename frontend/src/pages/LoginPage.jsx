import { useState } from 'react'
import schoolCampus from '../assets/school-campus.png'
import schoolEmblem from '../assets/school-emblem.png'
import './LoginPage.css'

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    setMessage('Login belum terhubung ke server. Silakan hubungi administrator sekolah.')
  }

  return (
    <div className="login-page">
      <header className="topbar">
        <div className="school-brand">
          <img src={schoolEmblem} alt="Logo SD Negeri Batu Ampar 12 Pagi" />
          <div>
            <p className="school-name">SD NEGERI BATU AMPAR 12 PAGI</p>
            <p className="product-name">Buku Induk Siswa Elektronik</p>
          </div>
        </div>
        <div className="school-year">
          <span className="calendar-icon" aria-hidden="true">▣</span>
          T.A. 2025/2026
        </div>
        <div className="topbar-actions">
          <span className="official-badge">
            <span aria-hidden="true">♙</span>
            PORTAL RESMI
          </span>
          <span className="secure-badge" aria-label="Portal aman">✓</span>
        </div>
      </header>

      <main className="login-main">
        <section className="login-card" aria-label="Portal login buku induk sekolah">
          <aside className="school-panel">
            <img className="campus-image" src={schoolCampus} alt="Gedung SD Negeri Batu Ampar 12 Pagi" />
            <div className="panel-shade" />

            <div className="panel-content">
              <div className="panel-school-brand">
                <img src={schoolEmblem} alt="" />
                <div>
                  <span className="portal-label"><span /> PORTAL RESMI ADMINISTRASI SD</span>
                  <p>SD NEGERI BATU AMPAR 12 PAGI</p>
                </div>
              </div>

              <h1>Sistem Informasi<br />Buku Induk Sekolah</h1>
              <p className="panel-description">
                Satu platform aman untuk mengelola data siswa secara terintegrasi, rapi, dan efisien.
              </p>

              <div className="student-stat">
                <div className="stat-heading">
                  <span>▤ Buku Induk Digital</span>
                  <span className="active-tag">T.A. 2025/2026</span>
                </div>
                <div className="stat-number">Kelas I - VI</div>
                <p className="stat-caption">Pengelolaan data dan arsip siswa dalam satu sistem.</p>
              </div>

              <div className="feature-row">
                <div><span aria-hidden="true">✓</span><p><strong>Data Terstruktur</strong><small>Informasi siswa lebih rapi</small></p></div>
                <div><span aria-hidden="true">▣</span><p><strong>Arsip Digital</strong><small>Dokumen mudah dikelola</small></p></div>
              </div>

              <div className="validation-row">
                <span>Data Siswa:</span>
                <span>NISN</span><span>NIK</span><span>Rapor Kurikulum Merdeka</span><span>Ijazah</span>
              </div>
            </div>

            <div className="panel-footer">
              <span><span aria-hidden="true">◉</span> Digitalisasi Administrasi Sekolah</span>
              <span>SD Negeri Batu Ampar 12 Pagi</span>
            </div>
          </aside>

          <section className="form-panel">
            <div className="form-content">
              <div className="staff-label"><span aria-hidden="true">♙</span> Portal Staf &amp; Tenaga Pendidik</div>
              <h2>Selamat Datang Kembali</h2>
              <p className="form-intro">Masuk untuk melanjutkan ke dashboard pengelolaan Buku Induk Sekolah.</p>

              <div className="security-notice" role="note">
                <span className="lock-symbol" aria-hidden="true">♙</span>
                <p><strong>Akses Staf &amp; Tenaga Pendidik</strong><span>Gunakan akun resmi yang telah terdaftar di sekolah.</span></p>
              </div>

              <form className="login-form" onSubmit={handleSubmit}>
                <label htmlFor="username">Username atau Email <span>*</span></label>
                <div className="input-wrap">
                  <span className="input-icon" aria-hidden="true">♙</span>
                  <input id="username" name="username" type="text" placeholder="NIP, NUPTK, atau email dinas" autoComplete="username" required />
                </div>

                <label htmlFor="password">Kata Sandi <span>*</span></label>
                <div className="input-wrap">
                  <span className="input-icon" aria-hidden="true">▣</span>
                  <input id="password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Masukkan kata sandi" autoComplete="current-password" required />
                  <button
                    className="password-toggle"
                    type="button"
                    onClick={() => setShowPassword((isVisible) => !isVisible)}
                    aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  >
                    {showPassword ? '◉' : '◎'}
                  </button>
                </div>

                <div className="form-options">
                  <label className="remember-option"><input type="checkbox" name="remember" /> Ingat sesi saya</label>
                  <button className="text-button" type="button" onClick={() => setMessage('Untuk mengatur ulang kata sandi, silakan hubungi administrator sekolah.')}>Lupa kata sandi?</button>
                </div>

                <button className="submit-button" type="submit">Masuk ke Dashboard <span aria-hidden="true">→</span></button>
                {message && <p className="form-message" role="status">{message}</p>}
              </form>

              <div className="divider"><span>ATAU MASUK DENGAN</span></div>
              <button className="sso-button" type="button" onClick={() => setMessage('Login Akun Belajar.id belum dikonfigurasi untuk sekolah ini.')}>
                <span className="belajar-mark">B</span> Akun Belajar.id (Kemdikbud) <span className="sso-tag">SSO</span>
              </button>

              <p className="admin-help">Mengalami kendala akun? <button type="button" onClick={() => setMessage('Silakan hubungi administrator sekolah untuk bantuan akun.')}>Hubungi Administrator Sekolah</button></p>
              <p className="copyright">© 2026 Sistem Informasi Buku Induk • SD NEGERI BATU AMPAR 12 PAGI.<br />Seluruh hak cipta dilindungi.</p>
            </div>
          </section>
        </section>
      </main>

      <footer className="page-footer">
        <span><strong>♜</strong> Akses terbatas untuk tenaga kependidikan terdaftar.</span>
        <span>© 2026 SD NEGERI BATU AMPAR 12 PAGI</span>
      </footer>
    </div>
  )
}

export default LoginPage
