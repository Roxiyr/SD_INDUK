import ModuleDataPage from '../../ModuleDataPage.jsx'
import './EksporDapodik.css'

const dapodikExport = {
  category: 'LAPORAN',
  description: 'Validasi kesiapan data dan ekspor berkas sesuai standar Dapodik.',
  action: 'Ekspor data Dapodik',
  secondary: ['Ekspor CSV'],
  metrics: [
    ['Kesiapan data', '98,2%', 'Siap diekspor', 'download'],
    ['Data valid', '1.024', 'Dari 1.043 entri', 'activity'],
    ['Perlu perbaikan', '19', 'Validasi belum lolos', 'clipboard'],
    ['Ekspor terakhir', '12 Jun', 'Versi 2025.e', 'shield'],
  ],
  columns: ['NO', 'JENIS DATA', 'JUMLAH ENTRI', 'DATA VALID', 'PERLU PERBAIKAN', 'KESIAPAN'],
  rows: [
    ['01', 'P  Peserta Didik', '512', '504', '8', '98,4% Siap'],
    ['02', 'P  PTK / Guru', '32', '31', '1', '96,9% Siap'],
    ['03', 'R  Rombongan Belajar', '18', '18', '0', '100% Siap'],
    ['04', 'O  Orang Tua / Wali', '481', '471', '10', '97,9% Siap'],
  ],
}

function EksporDapodik(props) {
  return <ModuleDataPage {...props} data={dapodikExport} pageClassName="dapodik-export-page" />
}

export default EksporDapodik
