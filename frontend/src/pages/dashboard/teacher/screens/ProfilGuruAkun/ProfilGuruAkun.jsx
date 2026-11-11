import TeacherDataPage from '../../components/TeacherDataPage.jsx'
import './ProfilGuruAkun.css'

const data = {
  eyebrow: 'PENGATURAN',
  title: 'Profil Guru & Akun',
  description: 'Kelola informasi pribadi, penugasan kelas, dan keamanan akun guru.',
  action: 'Simpan perubahan',
  stats: [['Profil terisi', '100%', 'Data telah lengkap', 'settings'], ['Penugasan', 'Wali IV A', 'T.A. 2025/2026', 'activity'], ['Beban mengajar', '28 JP', 'Per minggu', 'clipboard'], ['Keamanan akun', 'Baik', 'Login terakhir hari ini', 'shield']],
  searchPlaceholder: 'Cari di profil guru & akun...',
  columns: ['Informasi', 'Data saat ini', 'Sumber', 'Diperbarui', 'Status'],
  rows: [
    ['Nama lengkap', 'N', ['Dra. Sri Wahyuni, M.Pd', 'Dapodik', '12 Jun 2025', { status: 'Terverifikasi' }]],
    ['NIP', 'N', ['198604122010012008', 'Dapodik', '12 Jun 2025', { status: 'Terverifikasi' }]],
    ['Email', 'E', ['sri.wahyuni@sdnbatuampar12.sch.id', 'Akun', '18 Jun 2025', { status: 'Aktif' }]],
    ['Penugasan', 'P', ['Wali Kelas IV A', 'Sekolah', '14 Jul 2025', { status: 'Aktif' }]],
  ],
}

function ProfilGuruAkun(props) {
  return <TeacherDataPage {...props} data={data} pageClassName="teacher-profile-settings" />
}

export default ProfilGuruAkun
