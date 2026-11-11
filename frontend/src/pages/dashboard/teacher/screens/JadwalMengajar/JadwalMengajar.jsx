import TeacherDataPage from '../../components/TeacherDataPage.jsx'
import './JadwalMengajar.css'

const data = {
  eyebrow: 'KELAS & PEMBELAJARAN',
  title: 'Jadwal Mengajar',
  description: 'Jadwal pembelajaran mingguan, alokasi jam, dan agenda kelas IV A.',
  action: 'Cetak jadwal',
  stats: [['Jam mengajar', '28 JP', 'Per minggu', 'calendar'], ['Mata pelajaran', '7', 'Kurikulum Merdeka', 'activity'], ['Agenda hari ini', '3', '6 JP pembelajaran', 'clipboard'], ['Kelas binaan', 'IV A', 'Fase B', 'shield']],
  searchPlaceholder: 'Cari di jadwal mengajar...',
  columns: ['Waktu', 'Mata pelajaran', 'Materi', 'Status'],
  rows: [
    ['Senin', 'S', ['07.30–09.00', 'Matematika', 'Pecahan dan desimal', { status: 'Terjadwal' }]],
    ['Senin', 'S', ['09.30–11.00', 'Bahasa Indonesia', 'Teks informatif', { status: 'Terjadwal' }]],
    ['Rabu', 'R', ['07.30–09.00', 'Matematika', 'Pecahan dan desimal', { status: 'Selesai' }]],
    ['Rabu', 'R', ['09.30–11.00', 'IPAS', 'Alam dan sosial', { status: 'Berlangsung' }]],
    ['Jumat', 'J', ['08.00–09.30', 'Projek P5', 'Gaya hidup berkelanjutan', { status: 'Terjadwal' }]],
  ],
}

function JadwalMengajar(props) {
  return <TeacherDataPage {...props} data={data} pageClassName="teacher-schedule-page" />
}

export default JadwalMengajar
