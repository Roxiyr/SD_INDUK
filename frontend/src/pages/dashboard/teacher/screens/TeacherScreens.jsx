import DaftarSiswaBinaan from './DaftarSiswaBinaan/DaftarSiswaBinaan.jsx'
import InputNilaiAsesmen from './InputNilaiAsesmen/InputNilaiAsesmen.jsx'
import RekapPresensiSiswa from './RekapPresensiSiswa/RekapPresensiSiswa.jsx'
import CatatanKarakterP5 from './CatatanKarakterP5/CatatanKarakterP5.jsx'
import JadwalMengajar from './JadwalMengajar/JadwalMengajar.jsx'
import LegerNilaiKelas from './LegerNilaiKelas/LegerNilaiKelas.jsx'
import VerifikasiRaporSiswa from './VerifikasiRaporSiswa/VerifikasiRaporSiswa.jsx'
import UsulanKoreksiData from './UsulanKoreksiData/UsulanKoreksiData.jsx'
import ProfilGuruAkun from './ProfilGuruAkun/ProfilGuruAkun.jsx'

const screens = {
  'Daftar Siswa Binaan': DaftarSiswaBinaan,
  'Input Nilai & Asesmen': InputNilaiAsesmen,
  'Rekap Presensi Siswa': RekapPresensiSiswa,
  'Catatan Karakter & P5': CatatanKarakterP5,
  'Jadwal Mengajar': JadwalMengajar,
  'Leger Nilai Kelas': LegerNilaiKelas,
  'Verifikasi Rapor Siswa': VerifikasiRaporSiswa,
  'Usulan Koreksi Data': UsulanKoreksiData,
  'Profil Guru & Akun': ProfilGuruAkun,
}

function TeacherScreens({ module, search, onNotice }) {
  const Screen = screens[module]
  if (!Screen) {
    return <section className="teacher-module-screen"><div className="teacher-module-heading"><h1>Halaman tidak ditemukan</h1></div></section>
  }

  return <Screen module={module} search={search} onNotice={onNotice} />
}

export default TeacherScreens
