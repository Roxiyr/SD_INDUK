import { useState } from 'react'
import './PengajuanPerubahanData.css'

function PengajuanPerubahanData({ onNotice }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    setMessage('')
    onNotice(mode === 'login'
      ? 'Autentikasi portal pengajuan belum dikonfigurasi. Silakan hubungi operator sekolah.'
      : 'Pendaftaran akun belum tersedia. Silakan hubungi operator sekolah untuk bantuan.')
  }

  return (
    <div className="student-request-page">
      <header className="student-page-header">
        <div><span className="student-page-eyebrow">Layanan Perubahan Data</span><h1>Pengajuan Data Siswa</h1></div>
      </header>
      <section className="student-request-card">
        <span className="student-request-icon" aria-hidden="true">♢</span>
        <h2>{mode === 'login' ? 'Masuk untuk melanjutkan' : 'Buat akun pengajuan'}</h2>
        <p>Gunakan akun siswa untuk mengirim dan memantau pengajuan.</p>
        <div className="student-request-toggle" role="group" aria-label="Pilih akses">
          <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setMessage('') }}>Masuk</button>
          <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => { setMode('register'); setMessage('') }}>Buat akun</button>
        </div>
        <form onSubmit={handleSubmit}>
          <label htmlFor="student-request-email">Email</label>
          <input id="student-request-email" type="email" placeholder="nama@sekolah.id" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <label htmlFor="student-request-password">Kata sandi</label>
          <input id="student-request-password" type="password" placeholder="Minimal 8 karakter" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required />
          <button className="student-request-submit" type="submit">{mode === 'login' ? 'Masuk ke portal' : 'Buat akun'}</button>
          {message && <p className="student-request-message" role="status">{message}</p>}
        </form>
      </section>
    </div>
  )
}

export default PengajuanPerubahanData
