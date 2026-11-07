import ModuleDataPage from '../../ModuleDataPage.jsx'
import './DataGuru.css'

const teachers = {
  category: 'MASTER DATA',
  description: 'Kelola identitas, penugasan, dan status tenaga pendidik SDN Batu Ampar 12 Pagi.',
  action: 'Tambah guru',
  secondary: ['Ekspor CSV'],
  metrics: [
    ['Total guru', '28', '26 aktif', 'graduation'],
    ['Guru kelas', '18', 'Kelas I–VI', 'activity'],
    ['Guru mapel', '8', 'Agama, PJOK, Inggris', 'clipboard'],
    ['Tenaga kependidikan', '4', 'Administrasi sekolah', 'shield'],
  ],
  columns: ['NO', 'NAMA GURU', 'NIP / NUPTK', 'JABATAN', 'PENUGASAN', 'STATUS'],
  rows: [
    ['01', 'S  Sri Wahyuni, S.Pd', '198604122010012008', 'Guru Kelas', 'VI A', 'Aktif'],
    ['02', 'B  Budi Santoso, S.Pd', '198203152009031004', 'Guru Kelas', 'VI B', 'Aktif'],
    ['03', 'R  Ratna Dewi, S.Pd', '198811202011012012', 'Guru Kelas', 'V A', 'Aktif'],
    ['04', 'A  Ahmad Hidayat, S.Ag', '197905102008011006', 'Guru Agama', 'I–VI', 'Aktif'],
    ['05', 'D  Dimas Pratama, S.Or', '199001182019031009', 'Guru PJOK', 'I–VI', 'Aktif'],
  ],
}

function DataGuru(props) {
  return <ModuleDataPage {...props} data={teachers} pageClassName="teachers-page" />
}

export default DataGuru
