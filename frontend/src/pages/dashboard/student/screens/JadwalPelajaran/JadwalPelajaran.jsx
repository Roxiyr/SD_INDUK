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

function JadwalPelajaran({ dashboardData, ...props }) {
  const schedule = dashboardData?.schedule || []
  const liveData = {
    ...data,
    description: `Jadwal pelajaran ${dashboardData?.classPlacement?.nama_kelas || 'kelas siswa'} pada tahun ajaran aktif.`,
    stats: [
      ['Jadwal tersimpan', schedule.length, 'Pada kelas saat ini', 'calendar'],
      ['Mata pelajaran', new Set(schedule.map((item) => item.nama_mapel)).size, 'Jadwal aktif', 'activity'],
      ['Kelas', dashboardData?.classPlacement?.nama_kelas || 'Belum ditetapkan', dashboardData?.classPlacement?.nama_tahun_ajaran || '', 'clipboard'],
      ['Wali kelas', dashboardData?.classPlacement?.wali_kelas || 'Belum ditetapkan', `Fase ${dashboardData?.classPlacement?.fase || '—'}`, 'shield'],
    ],
    rows: schedule.map((item, index) => [
      String(index + 1).padStart(2, '0'),
      { initial: item.hari.charAt(0), label: item.hari },
      `${String(item.jam_mulai).slice(0, 5)}–${String(item.jam_selesai).slice(0, 5)}`,
      item.nama_mapel,
      item.nama_guru,
      { status: item.ruang || 'Ruang belum ditentukan' },
    ]),
  }
  return <StudentDataPage {...props} data={liveData} />
}

export default JadwalPelajaran
