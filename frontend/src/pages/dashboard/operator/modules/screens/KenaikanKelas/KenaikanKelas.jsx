import ModuleDataPage from '../../ModuleDataPage.jsx'
import './KenaikanKelas.css'

const gradePromotion = {
  category: 'AKADEMIK',
  description: 'Proses dan verifikasi kenaikan tingkat siswa pada akhir tahun ajaran.',
  action: 'Proses kenaikan',
  secondary: ['Ekspor CSV'],
  metrics: [
    ['Peserta proses', '426', 'Kelas I–V', 'trend'],
    ['Direkomendasikan', '412', '96,7% siswa', 'activity'],
    ['Perlu tinjauan', '14', 'Catatan wali kelas', 'clipboard'],
    ['Sudah disahkan', '388', '91,1% selesai', 'shield'],
  ],
  columns: ['NO', 'NAMA SISWA', 'KELAS ASAL', 'KELAS TUJUAN', 'RATA-RATA', 'KEPUTUSAN'],
  rows: [
    ['01', 'C  Cahya Dewi Lestari', 'IV A', 'V A', '88,4', 'Naik Kelas'],
    ['02', 'D  Daffa Arya Wicaksono', 'IV B', 'V B', '84,2', 'Naik Kelas'],
    ['03', 'F  Farhan Maulana', 'III A', 'IV A', '79,8', 'Perlu Tinjauan'],
    ['04', 'G  Gita Puspita Sari', 'III B', 'IV B', '91,1', 'Naik Kelas'],
  ],
}

function KenaikanKelas(props) {
  return <ModuleDataPage {...props} data={gradePromotion} pageClassName="grade-promotion-page" />
}

export default KenaikanKelas
