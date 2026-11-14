import StudentDataPage from '../../components/StudentDataPage.jsx'
import './JadwalPelajaran.css'

const data = {
  className: 'student-schedule-screen',
  eyebrow: 'Akademik Saya',
  title: 'Jadwal Pelajaran',
  description: 'Jadwal mata pelajaran dan agenda pembelajaran Kelas IV A selama satu minggu.',
  actions: ['Ekspor CSV', 'Unduh jadwal'],
  stats: [
    ['Pelajaran hari ini', '3', '6 jam pelajaran', 'calendar'],
    ['Total mapel', '7', 'Kurikulum Merdeka', 'activity'],
    ['Kelas', 'IV A', 'Ruang 10', 'clipboard'],
    ['Wali kelas', 'Sri Wahyuni', 'Fase B', 'shield'],
  ],
  searchPlaceholder: 'Cari di jadwal pelajaran...',
  columns: ['No', 'Hari', 'Waktu', 'Mata Pelajaran', 'Guru', 'Keterangan'],
  rows: [
    ['01', { initial: 'S', label: 'Senin' }, '07.30–09.00', 'Matematika', 'Sri Wahyuni, M.Pd', { status: 'Ruang 10' }],
    ['02', { initial: 'S', label: 'Senin' }, '09.30–11.00', 'Bahasa Indonesia', 'Sri Wahyuni, M.Pd', { status: 'Ruang 10' }],
    ['03', { initial: 'R', label: 'Rabu' }, '07.30–09.00', 'Matematika', 'Sri Wahyuni, M.Pd', { status: 'Ruang 10' }],
    ['04', { initial: 'R', label: 'Rabu' }, '09.30–11.00', 'IPAS', 'Sri Wahyuni, M.Pd', { status: 'Ruang 10' }],
    ['05', { initial: 'J', label: 'Jumat' }, '08.00–09.30', 'Projek P5', 'Sri Wahyuni, M.Pd', { status: 'Aula Sekolah' }],
  ],
}

function JadwalPelajaran(props) {
  return <StudentDataPage {...props} data={data} />
}

export default JadwalPelajaran
