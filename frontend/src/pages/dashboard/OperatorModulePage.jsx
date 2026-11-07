import DataIndukSiswa from './modules/screens/DataIndukSiswa/DataIndukSiswa.jsx'
import DataGuru from './modules/screens/DataGuru/DataGuru.jsx'
import DataKelas from './modules/screens/DataKelas/DataKelas.jsx'
import OrangTuaWali from './modules/screens/OrangTuaWali/OrangTuaWali.jsx'
import TahunAjaran from './modules/screens/TahunAjaran/TahunAjaran.jsx'
import RiwayatSiswa from './modules/screens/RiwayatSiswa/RiwayatSiswa.jsx'
import KenaikanKelas from './modules/screens/KenaikanKelas/KenaikanKelas.jsx'
import MutasiSiswa from './modules/screens/MutasiSiswa/MutasiSiswa.jsx'
import Alumni from './modules/screens/Alumni/Alumni.jsx'
import RekapSiswa from './modules/screens/RekapSiswa/RekapSiswa.jsx'
import RekapPerKelas from './modules/screens/RekapPerKelas/RekapPerKelas.jsx'
import EksporDapodik from './modules/screens/EksporDapodik/EksporDapodik.jsx'
import ManajemenAkun from './modules/screens/ManajemenAkun/ManajemenAkun.jsx'
import AuditLog from './modules/screens/AuditLog/AuditLog.jsx'
import ApprovalPage from './modules/PersetujuanPengajuan/ApprovalPage.jsx'
import SchoolProfilePage from './modules/ProfilSekolah/SchoolProfilePage.jsx'
import './OperatorModulePage.css'

const pages = {
  'Data Induk Siswa': DataIndukSiswa,
  'Data Guru': DataGuru,
  'Data Kelas': DataKelas,
  'Orang Tua / Wali': OrangTuaWali,
  'Tahun Ajaran': TahunAjaran,
  'Riwayat Siswa': RiwayatSiswa,
  'Kenaikan Kelas': KenaikanKelas,
  'Mutasi Siswa': MutasiSiswa,
  Alumni,
  'Rekap Siswa': RekapSiswa,
  'Rekap Per Kelas': RekapPerKelas,
  'Ekspor Dapodik': EksporDapodik,
  'Manajemen Akun': ManajemenAkun,
  'Audit Log': AuditLog,
}

function OperatorModulePage({ module, search, notice, setNotice, onAddStudent }) {
  if (module === 'Persetujuan Pengajuan') {
    return <ApprovalPage />
  }

  if (module === 'Profil Sekolah') {
    return <SchoolProfilePage notice={notice} setNotice={setNotice} />
  }

  const Page = pages[module]
  if (!Page) {
    return (
      <section className="module-view">
        <div className="module-card">
          <h2>Modul tidak ditemukan</h2>
          <p>Menu “{module}” belum memiliki halaman.</p>
        </div>
      </section>
    )
  }

  return (
    <Page module={module} search={search} notice={notice} setNotice={setNotice} onAddStudent={onAddStudent} />
  )
}

export default OperatorModulePage
