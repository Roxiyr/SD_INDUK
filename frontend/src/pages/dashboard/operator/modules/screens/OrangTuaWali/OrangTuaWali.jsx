import ModuleDataPage from '../../ModuleDataPage.jsx'
import './OrangTuaWali.css'

const guardians = {
  category: 'MASTER DATA',
  description: 'Kelola kontak keluarga, hubungan wali, dan kelengkapan informasi siswa.',
  action: 'Tambah data wali',
  secondary: ['Ekspor CSV'],
  metrics: [
    ['Data wali', '506', '98,8% siswa', 'users'],
    ['Kontak aktif', '493', 'Nomor terverifikasi', 'activity'],
    ['Wali utama', '478', 'Ayah atau ibu', 'clipboard'],
    ['Perlu pembaruan', '19', 'Kontak tidak aktif', 'shield'],
  ],
  columns: ['NO', 'NAMA WALI', 'SISWA', 'HUBUNGAN', 'NOMOR TELEPON', 'STATUS KONTAK'],
  rows: [
    ['01', 'R  Ridwan Kamil', 'Ahmad Fauzi Ridwan', 'Ayah', '0812 8401 2234', 'Terverifikasi'],
    ['02', 'S  Siti Maharani', 'Aisyah Putri Maharani', 'Ibu', '0813 9255 1180', 'Terverifikasi'],
    ['03', 'H  Hendra Kusuma', 'Bagas Pratama Kusuma', 'Ayah', '0857 1102 4309', 'Terverifikasi'],
    ['04', 'L  Lina Lestari', 'Cahya Dewi Lestari', 'Ibu', '0821 7740 6621', 'Perlu Pembaruan'],
  ],
}

function OrangTuaWali(props) {
  return <ModuleDataPage {...props} data={guardians} pageClassName="guardians-page" />
}

export default OrangTuaWali
