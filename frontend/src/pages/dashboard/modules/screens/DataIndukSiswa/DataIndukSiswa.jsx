import ModuleDataPage from '../../ModuleDataPage.jsx'
import './DataIndukSiswa.css'

const students = {
  category: 'MASTER REGISTRY',
  description: 'Kelola arsip utama peserta didik terdaftar, aktif, mutasi, dan alumni secara terpusat.',
  action: 'Tambah siswa baru',
  secondary: ['Ekspor laporan', 'Impor Excel'],
  metrics: [
    ['Total siswa terdaftar', '512', 'T.A. 2025/2026', 'users'],
    ['Siswa aktif', '498', '97,3% terverifikasi', 'activity'],
    ['Belum verifikasi', '14', 'Menunggu berkas', 'clipboard'],
    ['Arsip digital', '100%', 'Format terstandar', 'shield'],
  ],
  columns: ['NO', 'FOTO & IDENTITAS LENGKAP', 'NIS', 'NISN', 'L/P', 'TINGKAT / KELAS', 'TAHUN MASUK', 'STATUS'],
  rows: [
    ['01', 'AF  Ahmad Fauzi Ridwan', '23240001', '0087654321', 'L', 'VI A', '2020', 'Aktif'],
    ['02', 'AP  Aisyah Putri Maharani', '23240002', '0087654322', 'P', 'VI A', '2020', 'Menunggu Verifikasi'],
    ['03', 'BK  Bagas Pratama Kusuma', '23240003', '0087654323', 'L', 'VI B', '2020', 'Aktif'],
    ['04', 'CD  Cahya Dewi Lestari', '23240004', '0087654324', 'P', 'V A', '2021', 'Aktif'],
    ['05', 'DA  Daffa Arya Wicaksono', '24250005', '0098765411', 'L', 'V B', '2021', 'Cuti Akademik'],
  ],
}

function DataIndukSiswa(props) {
  return <ModuleDataPage {...props} data={students} pageClassName="students-page" />
}

export default DataIndukSiswa
