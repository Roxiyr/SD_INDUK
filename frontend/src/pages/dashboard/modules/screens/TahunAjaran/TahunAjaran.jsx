import ModuleDataPage from '../../ModuleDataPage.jsx'
import './TahunAjaran.css'

const academicYears = {
  category: 'MASTER DATA',
  description: 'Atur periode akademik, semester aktif, dan jadwal administrasi sekolah.',
  action: 'Tambah tahun ajaran',
  secondary: ['Ekspor CSV'],
  metrics: [
    ['Periode aktif', '2025/2026', 'Semester ganjil', 'calendar'],
    ['Hari efektif', '118', 'Dari 182 hari', 'activity'],
    ['Periode tersimpan', '6', 'Sejak 2020/2021', 'clipboard'],
    ['Sinkron terakhir', 'Hari ini', '08.30 WIB', 'shield'],
  ],
  columns: ['NO', 'TAHUN AJARAN', 'SEMESTER', 'TANGGAL MULAI', 'TANGGAL SELESAI', 'STATUS'],
  rows: [
    ['01', '2025/2026', 'Ganjil', '14 Juli 2025', '19 Desember 2025', 'Aktif'],
    ['02', '2024/2025', 'Genap', '6 Januari 2025', '20 Juni 2025', 'Selesai'],
    ['03', '2024/2025', 'Ganjil', '15 Juli 2024', '20 Desember 2024', 'Selesai'],
    ['04', '2023/2024', 'Genap', '8 Januari 2024', '21 Juni 2024', 'Diarsipkan'],
  ],
}

function TahunAjaran(props) {
  return <ModuleDataPage {...props} data={academicYears} pageClassName="academic-years-page" />
}

export default TahunAjaran
