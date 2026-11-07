import ModuleDataPage from '../../ModuleDataPage.jsx'
import './RiwayatSiswa.css'

const studentHistory = {
  category: 'AKADEMIK',
  description: 'Telusuri perubahan kelas, nilai, status, dan pembaruan penting setiap siswa.',
  action: 'Ekspor riwayat',
  secondary: ['Ekspor CSV'],
  metrics: [
    ['Total aktivitas', '2.846', 'Seluruh periode', 'activity'],
    ['Bulan ini', '184', 'Pembaruan terbaru', 'activity'],
    ['Akademik', '1.920', 'Nilai dan kelas', 'clipboard'],
    ['Administrasi', '926', 'Biodata dan berkas', 'shield'],
  ],
  columns: ['NO', 'SISWA', 'AKTIVITAS', 'KETERANGAN', 'TANGGAL', 'DIPERBARUI OLEH'],
  rows: [
    ['01', 'A  Ahmad Fauzi Ridwan', 'Pembaruan nilai', 'Nilai semester genap disahkan', '18 Jun 2025', 'Sri Wahyuni'],
    ['02', 'A  Aisyah Putri Maharani', 'Pembaruan biodata', 'Alamat domisili diperbarui', '16 Jun 2025', 'Operator Sekolah'],
    ['03', 'B  Bagas Pratama Kusuma', 'Kenaikan kelas', 'Naik dari V B ke VI B', '14 Jun 2025', 'Wali Kelas'],
    ['04', 'C  Cahya Dewi Lestari', 'Verifikasi berkas', 'Kartu keluarga terverifikasi', '12 Jun 2025', 'Operator Sekolah'],
  ],
}

function RiwayatSiswa(props) {
  return <ModuleDataPage {...props} data={studentHistory} pageClassName="student-history-page" />
}

export default RiwayatSiswa
