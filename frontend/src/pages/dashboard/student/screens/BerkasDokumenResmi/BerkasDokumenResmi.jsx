import StudentDataPage from '../../components/StudentDataPage.jsx'
import './BerkasDokumenResmi.css'

const data = {
  className: 'student-documents-screen',
  eyebrow: 'Buku Induk Mandiri',
  title: 'Berkas & Dokumen Resmi',
  description: 'Kelola dokumen identitas dan arsip resmi yang mendukung data buku induk.',
  actions: ['Ekspor CSV', 'Unggah dokumen'],
  stats: [
    ['Dokumen wajib', '6', 'Seluruhnya terunggah', 'archive'],
    ['Terverifikasi', '6/6', '100% lengkap', 'activity'],
    ['Kapasitas arsip', '8,4 MB', 'Dari 25 MB', 'clipboard'],
    ['Pembaruan', '12 Jun', 'Terakhir diverifikasi', 'shield'],
  ],
  searchPlaceholder: 'Cari di berkas & dokumen resmi...',
  columns: ['No', 'Nama Dokumen', 'Nomor Dokumen', 'Tanggal Unggah', 'Ukuran', 'Status'],
  rows: [
    ['01', { initial: 'K', label: 'Kartu Keluarga' }, '3175••••••••0012', '10 Jun 2025', '1,8 MB', { status: 'Terverifikasi' }],
    ['02', { initial: 'A', label: 'Akta Kelahiran' }, '3175-LT-2013-00421', '10 Jun 2025', '1,2 MB', { status: 'Terverifikasi' }],
    ['03', { initial: 'K', label: 'Kartu Identitas Anak' }, '3175••••••••4321', '11 Jun 2025', '1,4 MB', { status: 'Terverifikasi' }],
    ['04', { initial: 'I', label: 'Ijazah TK' }, 'TK-2019-00841', '12 Jun 2025', '2,1 MB', { status: 'Terverifikasi' }],
  ],
}

function BerkasDokumenResmi(props) {
  return <StudentDataPage {...props} data={data} />
}

export default BerkasDokumenResmi
