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

function TeacherScreens({ module, search, onNotice, registered, hasStudents, students = [], dashboardData, initialNisn, loading, onOpenGradebook, onOpenCorrection, onSelectPage }) {
  const Screen = screens[module]
  if (!Screen) {
    return <section className="teacher-module-screen"><div className="teacher-module-heading"><h1>Halaman tidak ditemukan</h1></div></section>
  }

  const canShowWithoutStudents = ['Jadwal Mengajar', 'Profil Guru & Akun'].includes(module)
  if (!registered || (!hasStudents && !canShowWithoutStudents)) {
    const heading = loading
      ? 'Memuat data guru...'
      : !registered
        ? 'Data guru belum diisi'
        : 'Belum ada siswa yang ditugaskan'
    const description = loading
      ? 'Mengambil data dari database.'
      : !registered
        ? 'Halaman ini akan menampilkan data setelah operator menambahkan profil guru.'
        : 'Tampilan akademik akan tersedia setelah operator memasukkan dan menugaskan data siswa ke kelas.'
    return (
      <section className="teacher-module-screen teacher-empty-module" role={loading ? 'status' : 'region'}>
        <div className="teacher-module-heading">
          <div>
            <h1>{heading}</h1>
            <p>{description}</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <Screen
      module={module}
      search={search}
      onNotice={onNotice}
      students={students}
      dashboardData={dashboardData}
      initialNisn={initialNisn}
      onOpenGradebook={onOpenGradebook}
      onOpenCorrection={onOpenCorrection}
      onSelectPage={onSelectPage}
    />
  )
}

export default TeacherScreens
