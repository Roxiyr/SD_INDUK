import TeacherDataPage from '../../components/TeacherDataPage.jsx'
import './CatatanKarakterP5.css'

const data = {
  eyebrow: 'KELAS & PEMBELAJARAN',
  title: 'Catatan Karakter & Projek P5',
  description: 'Dokumentasikan perkembangan karakter dan dimensi Profil Pelajar Pancasila.',
  action: 'Tambah catatan karakter',
  stats: [['Catatan terisi', '28/32', '87,5% siswa', 'activity'], ['Sangat berkembang', '18', '56,3% siswa', 'activity'], ['Berkembang sesuai', '10', '31,2% siswa', 'clipboard'], ['Perlu bimbingan', '4', 'Tindak lanjut aktif', 'shield']],
  searchPlaceholder: 'Cari di catatan karakter & projek P5...',
  columns: ['Dimensi P5', 'Projek', 'Catatan guru', 'Capaian'],
  rows: [
    ['Ahmad Fauzi Ridwan', 'A', ['Mandiri', 'Gaya Hidup Berkelanjutan', 'Konsisten menyelesaikan tugas', { status: 'Sangat Berkembang' }]],
    ['Aisyah Putri Maharani', 'A', ['Bernalar Kritis', 'Kearifan Lokal', 'Aktif menyampaikan gagasan', { status: 'Sangat Berkembang' }]],
    ['Bagas Pratama Kusuma', 'B', ['Gotong Royong', 'Bangunlah Jiwa Raganya', 'Perlu lebih aktif berdiskusi', { status: 'Berkembang Sesuai Harapan' }]],
    ['Cantika Dewi Lestari', 'C', ['Kreatif', 'Kearifan Lokal', 'Menghasilkan karya orisinal', { status: 'Sangat Berkembang' }]],
  ],
}

function CatatanKarakterP5(props) {
  return <TeacherDataPage {...props} data={data} pageClassName="teacher-character-notes" />
}

export default CatatanKarakterP5
