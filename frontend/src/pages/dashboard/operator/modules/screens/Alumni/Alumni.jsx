import ModuleDataPage from '../../ModuleDataPage.jsx'
import './Alumni.css'

const alumni = {
  category: 'AKADEMIK',
  description: 'Arsip lulusan sekolah dan informasi kelanjutan pendidikan siswa.',
  action: 'Ekspor alumni',
  secondary: ['Ekspor CSV'],
  metrics: [
    ['Total alumni', '1.284', 'Sejak 2015', 'archive'],
    ['Lulusan 2025', '84', '100% lulus', 'activity'],
    ['Data terverifikasi', '1.236', '96,3% lengkap', 'clipboard'],
    ['Melanjutkan SMP', '81', 'Lulusan terbaru', 'shield'],
  ],
  columns: ['NO', 'NAMA ALUMNI', 'NIS / NISN', 'TAHUN LULUS', 'SEKOLAH LANJUTAN', 'STATUS DATA'],
  rows: [
    ['01', 'R  Rafi Akbar', '19200011 / 0074512201', '2025', 'SMPN 20 Jakarta', 'Terverifikasi'],
    ['02', 'N  Nadia Amalia', '19200018 / 0074512218', '2025', 'SMPN 49 Jakarta', 'Terverifikasi'],
    ['03', 'F  Fikri Ramadhan', '19200024 / 0074512224', '2025', 'SMPN 281 Jakarta', 'Terverifikasi'],
    ['04', 'P  Putri Ayuningtyas', '19200031 / 0074512231', '2025', 'Belum diperbarui', 'Perlu Pembaruan'],
  ],
}

function AlumniPage(props) {
  return <ModuleDataPage {...props} data={alumni} pageClassName="alumni-page" />
}

export default AlumniPage
