import { useState } from 'react'
import './UsulanKoreksiData.css'

function UsulanKoreksiData() {
  const [activeTab, setActiveTab] = useState('Masuk')
  const [message, setMessage] = useState('')

  function submitRequest(event) {
    event.preventDefault()
    setMessage('Autentikasi server belum tersedia. Pengajuan belum dikirim.')
  }

  return (
    <section className="teacher-module-screen teacher-data-request">
      <div className="teacher-module-heading">
        <div><span className="teacher-module-eyebrow">LAYANAN PERUBAHAN DATA</span><h1>Pengajuan Data Guru</h1></div>
      </div>
      <form className="teacher-request-card" onSubmit={submitRequest}>
        <span className="request-icon"><span aria-hidden="true">✓</span></span>
        <h2>Masuk untuk melanjutkan</h2>
        <p>Gunakan akun guru untuk mengirim dan memantau pengajuan.</p>
        <div className="request-tabs">
          {['Masuk', 'Buat akun'].map((tab) => <button key={tab} type="button" className={activeTab === tab ? 'selected' : ''} onClick={() => { setActiveTab(tab); setMessage('') }}>{tab}</button>)}
        </div>
        {activeTab === 'Buat akun' && <label>Nama lengkap<input required name="name" placeholder="Nama sesuai data sekolah" /></label>}
        <label>Email<input required type="email" name="email" placeholder="nama@sekolah.id" /></label>
        <label>Kata sandi<input required type="password" name="password" minLength="8" placeholder="Minimal 8 karakter" /></label>
        <button type="submit" className="teacher-request-submit">{activeTab === 'Masuk' ? 'Masuk ke portal' : 'Buat akun guru'}</button>
        {message && <p className="teacher-request-message" role="status">{message}</p>}
      </form>
    </section>
  )
}

export default UsulanKoreksiData
