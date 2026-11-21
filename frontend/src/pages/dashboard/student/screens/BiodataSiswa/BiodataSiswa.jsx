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

function BiodataSiswa({ profile, ...props }) {
  const updated = profile?.updated_at ? String(profile.updated_at).slice(0, 10) : '—'
  const fields = [
    ['Nama lengkap', profile?.nama_lengkap],
    ['NISN', profile?.nisn],
    ['NIS', profile?.nis],
    ['Tempat, tanggal lahir', [profile?.tempat_lahir, profile?.tanggal_lahir].filter(Boolean).join(', ')],
    ['Jenis kelamin', profile?.jenis_kelamin === 'L' ? 'Laki-laki' : profile?.jenis_kelamin === 'P' ? 'Perempuan' : '—'],
    ['Agama', profile?.agama],
    ['Alamat', profile?.alamat],
    ['Nomor telepon', profile?.nomor_telepon],
  ]
  const liveData = {
    ...data,
    stats: [
      ['Data identitas', fields.filter(([, value]) => value).length, 'Field yang tersimpan', 'user'],
      ['Status siswa', profile?.status_siswa || '—', 'Dari buku induk', 'activity'],
      ['Diperbarui', updated, 'Tanggal data terakhir berubah', 'clipboard'],
      ['NISN', profile?.nisn || '—', 'Identitas siswa', 'shield'],
    ],
    rows: fields.map(([label, value], index) => [
      String(index + 1).padStart(2, '0'),
      { initial: label.charAt(0), label },
      value || 'Belum diisi',
      'Buku induk sekolah',
      updated,
      { status: value ? 'Tersimpan' : 'Belum diisi' },
    ]),
  }
  return <StudentDataPage {...props} data={liveData} />
}

export default BiodataSiswa
