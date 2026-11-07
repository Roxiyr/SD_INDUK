import ModuleDataPage from '../../ModuleDataPage.jsx'
import './DataKelas.css'

const classes = {
  category: 'MASTER DATA',
  description: 'Atur rombongan belajar, wali kelas, kapasitas, dan ruang belajar aktif.',
  action: 'Tambah kelas',
  secondary: ['Ekspor CSV'],
  metrics: [
    ['Rombel aktif', '18', 'Tahun ajaran berjalan', 'building'],
    ['Kapasitas', '540', '30 siswa per kelas', 'activity'],
    ['Terisi', '512', '94,8% kapasitas', 'clipboard'],
    ['Ruang tersedia', '18', 'Semua siap digunakan', 'shield'],
  ],
  columns: ['NO', 'KELAS', 'WALI KELAS', 'JUMLAH SISWA', 'RUANG', 'STATUS'],
  rows: [
    ['01', 'I A', 'Nur Aini, S.Pd', '29 siswa', 'Ruang 01', 'Aktif'],
    ['02', 'I B', 'Rika Amelia, S.Pd', '28 siswa', 'Ruang 02', 'Aktif'],
    ['03', 'II A', 'Dewi Lestari, S.Pd', '30 siswa', 'Ruang 03', 'Aktif'],
    ['04', 'V A', 'Ratna Dewi, S.Pd', '27 siswa', 'Ruang 13', 'Aktif'],
    ['05', 'VI A', 'Sri Wahyuni, S.Pd', '29 siswa', 'Ruang 16', 'Aktif'],
  ],
}

function DataKelas(props) {
  return <ModuleDataPage {...props} data={classes} pageClassName="classes-page" />
}

export default DataKelas
