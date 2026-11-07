import ModuleIcon from '../ModuleIcon.jsx'
import './SchoolProfilePage.css'

function SchoolProfilePage({ notice, setNotice }) {
  return (
    <section className="module-view school-profile-view">
      {notice && <div className="dashboard-notice" role="status">{notice}<button type="button" onClick={() => setNotice('')} aria-label="Tutup">×</button></div>}
      <div className="module-heading data-module-heading"><div><span className="module-eyebrow">PENGATURAN</span><h1>Profil Sekolah</h1><p>Perbarui identitas resmi dan informasi kontak SDN Batu Ampar 12 Pagi.</p></div></div>
      <div className="school-profile-grid">
        <aside className="school-identity-card">
          <div className="school-identity-icon"><ModuleIcon name="building" size={38} /></div>
          <h2>SDN Batu Ampar 12 Pagi</h2><p>NPSN 20104321</p>
          <button type="button" className="module-secondary-button" onClick={() => setNotice('Unggah logo memerlukan koneksi penyimpanan server.')}>↑ &nbsp; Ganti logo sekolah</button>
          <div className="profile-complete"><strong>Status profil lengkap</strong><span>Seluruh data wajib sekolah telah terisi.</span></div>
        </aside>
        <form className="school-profile-form" onSubmit={(event) => { event.preventDefault(); setNotice('Perubahan profil disimpan sebagai pratinjau. Backend belum terhubung.') }}>
          <div className="profile-form-title"><span><ModuleIcon name="building" size={17} /></span><div><strong>Identitas Sekolah</strong><small>Data utama yang tampil pada dokumen resmi.</small></div></div>
          <label>Nama sekolah<input defaultValue="SDN Batu Ampar 12 Pagi" /></label>
          <div className="profile-form-row"><label>NPSN<input defaultValue="20104321" /></label><label>Status sekolah<select defaultValue="Negeri"><option>Negeri</option><option>Swasta</option></select></label></div>
          <label>Alamat<input defaultValue="Jl. Batu Ampar, Kramat Jati, Jakarta Timur" /></label>
          <div className="profile-form-row"><label>Kelurahan<input defaultValue="Batu Ampar" /></label><label>Kecamatan<input defaultValue="Kramat Jati" /></label></div>
          <div className="profile-form-row"><label>Email<input type="email" defaultValue="admin@sdnbatuampar12.sch.id" /></label><label>Telepon<input defaultValue="(021) 809 4212" /></label></div>
          <label>Kepala sekolah<input defaultValue="Kepala SDN Batu Ampar 12 Pagi" /></label>
          <div className="profile-save-row"><button type="submit" className="module-primary-button">✓ &nbsp; Simpan perubahan</button></div>
        </form>
      </div>
    </section>
  )
}

export default SchoolProfilePage
