import ModuleDataPage from '../../ModuleDataPage.jsx'
import './RekapPerKelas.css'

const classSummary = {
  category: 'LAPORAN',
  description: 'Pantau komposisi dan kapasitas masing-masing rombongan belajar.',
  action: 'Unduh rekap kelas',
  secondary: ['Ekspor CSV'],
  metrics: [
    ['Jumlah rombel', '18', 'Kelas I–VI', 'file'],
    ['Rata-rata isi', '28,4', 'Siswa per rombel', 'activity'],
    ['Rombel terbesar', '30', 'II A', 'clipboard'],
    ['Kapasitas tersisa', '28', 'Seluruh rombel', 'shield'],
  ],
  columns: ['NO', 'KELAS', 'WALI KELAS', 'LAKI-LAKI', 'PEREMPUAN', 'TOTAL SISWA'],
  rows: [
    ['01', 'I A', 'Nur Aini, S.Pd', '15', '14', '29 siswa'],
    ['02', 'I B', 'Rika Amelia, S.Pd', '14', '14', '28 siswa'],
    ['03', 'II A', 'Dewi Lestari, S.Pd', '16', '14', '30 siswa'],
    ['04', 'V A', 'Ratna Dewi, S.Pd', '14', '13', '27 siswa'],
    ['05', 'VI A', 'Sri Wahyuni, S.Pd', '15', '14', '29 siswa'],
  ],
}

function RekapPerKelas(props) {
  return <ModuleDataPage {...props} data={classSummary} pageClassName="class-summary-page" />
}

export default RekapPerKelas
