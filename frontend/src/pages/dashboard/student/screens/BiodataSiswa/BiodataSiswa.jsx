import StudentDataPage from '../../components/StudentDataPage.jsx'
import './BiodataSiswa.css'

const data = {
  className: 'student-biodata-screen',
  eyebrow: 'Buku Induk Mandiri',
  title: 'Biodata Siswa',
  description: 'Periksa data identitas pribadi dan keluarga yang tersimpan pada buku induk sekolah.',
  actions: ['Ekspor CSV', 'Ajukan perubahan data'],
  stats: [
    ['Kelengkapan', '100%', 'Semua data terisi', 'user'],
    ['Data terverifikasi', '18/18', 'Oleh operator sekolah', 'activity'],
    ['Pembaruan terakhir', '12 Jun', 'Tahun 2025', 'clipboard'],
    ['Status siswa', 'Aktif', 'Kelas IV A', 'shield'],
  ],
  searchPlaceholder: 'Cari di biodata siswa...',
  columns: ['No', 'Data', 'Informasi Tersimpan', 'Sumber', 'Diperbarui', 'Verifikasi'],
  rows: [
    ['01', { initial: 'N', label: 'Nama lengkap' }, 'Ahmad Fauzi Ridwan', 'Akta Kelahiran', '12 Jun 2025', { status: 'Terverifikasi' }],
    ['02', { initial: 'N', label: 'NISN' }, '0087654321', 'Dapodik', '12 Jun 2025', { status: 'Terverifikasi' }],
    ['03', { initial: 'T', label: 'Tempat, tanggal lahir' }, 'Jakarta, 14 Mei 2013', 'Akta Kelahiran', '12 Jun 2025', { status: 'Terverifikasi' }],
    ['04', { initial: 'A', label: 'Alamat' }, 'Jl. Batu Ampar III, Jakarta Timur', 'Kartu Keluarga', '12 Jun 2025', { status: 'Terverifikasi' }],
  ],
}

function BiodataSiswa(props) {
  return <StudentDataPage {...props} data={data} />
}

export default BiodataSiswa
