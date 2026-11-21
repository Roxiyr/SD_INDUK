import ModuleDataPage from '../../ModuleDataPage.jsx'
import './MutasiSiswa.css'

const studentTransfers = {
  category: 'AKADEMIK',
  description: 'Catat perpindahan siswa masuk dan keluar beserta dokumen pendukung.',
  action: 'Catat mutasi',
  secondary: ['Ekspor CSV'],
  metrics: [
    ['Mutasi masuk', '8', 'Tahun ajaran ini', 'refresh'],
    ['Mutasi keluar', '5', 'Tahun ajaran ini', 'activity'],
    ['Dalam proses', '3', 'Menunggu dokumen', 'clipboard'],
    ['Selesai', '10', 'Berkas lengkap', 'shield'],
  ],
  columns: ['NO', 'NAMA SISWA', 'JENIS MUTASI', 'SEKOLAH ASAL / TUJUAN', 'TANGGAL', 'STATUS'],
  rows: [
    ['01', 'F  Farhan Maulana', 'Keluar', 'SDN Kramat Jati 07', '12 Jun 2025', 'Selesai'],
    ['02', 'N  Nabila Rahma', 'Masuk', 'SDN Cililitan 03', '8 Jun 2025', 'Selesai'],
    ['03', 'R  Rizky Aditya', 'Masuk', 'SDN Balekambang 01', '3 Jun 2025', 'Dalam Proses'],
    ['04', 'S  Salma Nurfadila', 'Keluar', 'SDN Cawang 04', '28 Mei 2025', 'Menunggu Dokumen'],
  ],
}

function MutasiSiswa(props) {
  return <ModuleDataPage {...props} data={studentTransfers} pageClassName="student-transfers-page" />
}

export default MutasiSiswa
