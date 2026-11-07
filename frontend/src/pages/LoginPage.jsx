import { useState } from 'react'
import schoolCampus from '../assets/school-campus.png'
import schoolEmblem from '../assets/school-emblem.png'
import './LoginPage.css'

function LoginPage({ onLogin }) {
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [selectedRole, setSelectedRole] = useState('operator')

  function handleSubmit(event) {
    event.preventDefault()
    setMessage('')

    if (selectedRole !== 'operator') {
      const roleName = selectedRole === 'teacher' ? 'Guru' : 'Murid'
      setMessage(`Dashboard ${roleName} akan tersedia setelah desain dan autentikasinya siap.`)
      return
    }

    onLogin('operator')
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
            

              <div className="student-stat">
                <div className="stat-heading">
                  <span>▤ Buku Induk Digital</span>
                  <span className="active-tag">T.A. 2025/2026</span>
                </div>
                <div className="stat-number">Kelas I - VI</div>
                <p className="stat-caption">Pengelolaan data dan arsip siswa dalam satu sistem.</p>
              </div>

              <div className="feature-row">
                <div><span aria-hidden="true">✓</span><p><strong>Data Terstruktur</strong></p></div>
                <div><span aria-hidden="true">▣</span><p><strong>Arsip Digital</strong></p></div>
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
              <div className="staff-label"><span aria-hidden="true">♙</span> Portal Buku Induk Sekolah</div>
              <h2>Selamat Datang Kembali</h2>
              <p className="form-intro">Masuk untuk melanjutkan ke dashboard pengelolaan Buku Induk Sekolah.</p>

              <div className="security-notice" role="note">
                <span className="lock-symbol" aria-hidden="true">♙</span>
                <p><strong>Mode pratinjau</strong><span>Autentikasi server belum tersedia. Akun belum diverifikasi.</span></p>
              </div>

              <form className="login-form" onSubmit={handleSubmit}>
                <fieldset className="role-picker">
                  <legend>Masuk sebagai</legend>
                  <div>
                    {[
                      { value: 'operator', label: 'Operator / Admin' },
                      { value: 'teacher', label: 'Guru' },
                      { value: 'student', label: 'Murid' },
                    ].map((role) => (
                      <button
                        key={role.value}
                        className={selectedRole === role.value ? 'selected' : ''}
                        type="button"
                        aria-pressed={selectedRole === role.value}
                        onClick={() => { setSelectedRole(role.value); setMessage('') }}
                      >
                        {role.label}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <label htmlFor="username">Username atau Email <span>*</span></label>
                <div className="input-wrap">
                  <span className="input-icon" aria-hidden="true">♙</span>
                  <input id="username" name="username" type="text" placeholder={selectedRole === 'student' ? 'NIS atau NISN' : selectedRole === 'teacher' ? 'NIP, NUPTK, atau email dinas' : 'Username atau email operator'} autoComplete="username" required />
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

                <button className="submit-button" type="submit">
                  {selectedRole === 'operator' ? 'Masuk ke Dashboard Operator' : `Masuk sebagai ${selectedRole === 'teacher' ? 'Guru' : 'Murid'}`}
                  <span aria-hidden="true">→</span>
                </button>
                {message && <p className="form-message" role="status">{message}</p>}
              </form>

              <div className="divider"><span>AKSES ALTERNATIF</span></div>
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
