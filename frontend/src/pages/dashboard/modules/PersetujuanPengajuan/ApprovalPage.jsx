import { useState } from 'react'
import ModuleIcon from '../ModuleIcon.jsx'
import './ApprovalPage.css'

function ApprovalPage() {
  const [message, setMessage] = useState('')

  return (
    <section className="module-view">
      <div className="module-heading approval-page-heading"><div><span className="module-eyebrow">OPERATOR / ADMIN</span><h1>Persetujuan Pengajuan Data</h1></div></div>
      <div className="approval-card">
        <div className="approval-icon"><ModuleIcon name="shield" size={22} /></div>
        <h2>Masuk untuk melanjutkan</h2>
        <p>Persetujuan hanya dapat diproses oleh akun operator sekolah.</p>
        <form onSubmit={(event) => { event.preventDefault(); setMessage('Autentikasi belum terhubung. Pengajuan belum diproses.') }}>
          <label>Email<input type="email" placeholder="nama@sekolah.id" required /></label>
          <label>Kata sandi<input type="password" placeholder="Minimal 8 karakter" minLength={8} required /></label>
          <button type="submit"><ModuleIcon name="shield" size={15} /> Masuk ke portal</button>
        </form>
        {message && <p className="approval-message" role="status">{message}</p>}
        <div className="approval-note">Akun operator dibuat oleh administrator melalui Payload Admin agar tidak ada pengguna umum yang dapat memperoleh hak persetujuan.</div>
      </div>
    </section>
  )
}

export default ApprovalPage
