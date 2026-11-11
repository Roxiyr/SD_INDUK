import TeacherDataPage from '../../components/TeacherDataPage.jsx'
import './RekapPresensiSiswa.css'

const data = {
  eyebrow: 'KELAS & PEMBELAJARAN',
  title: 'Presensi Harian & Rekap Bulanan Siswa',
  description: 'Catat kehadiran harian dan pantau tren presensi siswa Kelas IV A.',
  action: 'Simpan presensi hari ini',
  stats: [['Hadir hari ini', '100%', '32 dari 32 siswa', 'file'], ['Rata-rata semester', '98,4%', 'Sangat baik', 'activity'], ['Sakit semester', '3', 'Akumulasi siswa', 'clipboard'], ['Tanpa keterangan', '0', 'Semester berjalan', 'shield']],
  searchPlaceholder: 'Cari di presensi harian & rekap bulanan siswa...',
  columns: ['Hadir', 'Sakit', 'Izin', 'Catatan kehadiran'],
  rows: [
    ['Ahmad Fauzi Ridwan', 'A', ['18 hari', '0', '0', { status: 'Hadir tepat waktu' }]],
    ['Aisyah Putri Maharani', 'A', ['18 hari', '0', '0', { status: 'Disiplin selama bulan ini' }]],
    ['Bagas Pratama Kusuma', 'B', ['17 hari', '1', '0', { status: 'Penugasan daring saat sakit' }]],
    ['Cantika Dewi Lestari', 'C', ['18 hari', '0', '0', { status: 'Aktif dan disiplin' }]],
    ['Dimas Aditya Nugraha', 'D', ['18 hari', '0', '0', { status: 'Kehadiran sangat baik' }]],
  ],
}

function RekapPresensiSiswa(props) {
  return <TeacherDataPage {...props} data={data} pageClassName="teacher-attendance" />
}

export default RekapPresensiSiswa
