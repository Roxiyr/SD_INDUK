import ModuleDataPage from '../../ModuleDataPage.jsx'
import './ManajemenAkun.css'

const accountManagement = {
  category: 'PENGATURAN',
  description: 'Atur pengguna, peran, dan hak akses ke sistem buku induk digital.',
  action: 'Tambah akun',
  secondary: ['Ekspor CSV'],
  metrics: [
    ['Total akun', '36', 'Semua peran', 'settings'],
    ['Akun aktif', '34', '94,4%', 'activity'],
    ['Administrator', '3', 'Akses penuh', 'clipboard'],
    ['Guru', '28', 'Akses akademik', 'shield'],
  ],
  columns: ['NO', 'NAMA PENGGUNA', 'EMAIL', 'PERAN', 'LOGIN TERAKHIR', 'STATUS'],
  rows: [
    ['01', 'O  Operator Sekolah', 'operator@sdnbatuampar12.sch.id', 'Super Admin', 'Hari ini, 09.42', 'Aktif'],
    ['02', 'S  Sri Wahyuni', 'sri.wahyuni@sdnbatuampar12.sch.id', 'Guru', 'Hari ini, 08.15', 'Aktif'],
    ['03', 'B  Budi Santoso', 'budi.santoso@sdnbatuampar12.sch.id', 'Guru', 'Kemarin, 14.20', 'Aktif'],
    ['04', 'A  Admin Lama', 'admin.lama@sdnbatuampar12.sch.id', 'Operator', '12 Mei 2025', 'Nonaktif'],
  ],
}

function ManajemenAkun(props) {
  return <ModuleDataPage {...props} data={accountManagement} pageClassName="account-management-page" />
}

export default ManajemenAkun
