import RaporHasilBelajar from './RaporHasilBelajar/RaporHasilBelajar.jsx'
import RiwayatAkademik from './RiwayatAkademik/RiwayatAkademik.jsx'
import TranskripSaya from './TranskripSaya/TranskripSaya.jsx'
import JadwalPelajaran from './JadwalPelajaran/JadwalPelajaran.jsx'
import BiodataSiswa from './BiodataSiswa/BiodataSiswa.jsx'
import BerkasDokumenResmi from './BerkasDokumenResmi/BerkasDokumenResmi.jsx'
import PengajuanPerubahanData from './PengajuanPerubahanData/PengajuanPerubahanData.jsx'
import KeamananAkun from './KeamananAkun/KeamananAkun.jsx'

const screens = {
  'Nilai & Hasil Belajar': RaporHasilBelajar,
  'Rapor & Hasil Belajar': RaporHasilBelajar,
  'Riwayat Akademik': RiwayatAkademik,
  'Transkrip Saya': TranskripSaya,
  'Jadwal Pelajaran': JadwalPelajaran,
  'Biodata Pribadi Saya': BiodataSiswa,
  'Unggah Dokumen': BerkasDokumenResmi,
  'Pengajuan Perubahan Data': PengajuanPerubahanData,
  'Keamanan & Akun': KeamananAkun,
}

function StudentScreens({ module, search, onNotice }) {
  const Screen = screens[module]
  if (!Screen) {
    return <section className="student-section-panel"><h1>Halaman tidak ditemukan</h1></section>
  }

  return <Screen search={search} onNotice={onNotice} />
}

export default StudentScreens
