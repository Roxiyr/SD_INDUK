import { render, screen } from '@testing-library/react';
import BukuIndukPrintTemplate from '../components/print/BukuIndukPrintTemplate';

/** Memastikan template cetak merender identitas siswa beserta bagian biodata. @returns {void} Aserta konten lembar cetak. */
test('merender kop sekolah dan biodata untuk siswa', () => {
  render(
    <BukuIndukPrintTemplate
      school={{ nama_sekolah: 'SD Contoh' }}
      students={[
        {
          siswa: { nisn: '1234567890', nama_lengkap: 'Ayu Putri', nis: '1001' },
        },
      ]}
    />,
  );
  expect(screen.getByText('SD Contoh')).toBeInTheDocument();
  expect(screen.getByText('Ayu Putri')).toBeInTheDocument();
  expect(screen.getByText(/BUKU INDUK REGISTER/)).toBeInTheDocument();
});
test('merender seluruh siswa pada mode export kelas', () => {
  const { container } = render(
    <BukuIndukPrintTemplate
      students={[
        { siswa: { nisn: '1', nama_lengkap: 'Ayu' } },
        { siswa: { nisn: '2', nama_lengkap: 'Bima' } },
      ]}
    />,
  );
  expect(container.querySelectorAll('.student-print')).toHaveLength(2);
  expect(container.querySelectorAll('.folio-page')).toHaveLength(4);
});
test('menampilkan rapor, P5, dan ekstrakurikuler pada lembar hasil belajar', () => {
  render(
    <BukuIndukPrintTemplate
      students={[
        {
          siswa: { nisn: '1', nama_lengkap: 'Ayu' },
          rapor: [
            {
              id_rapor: 1,
              semester: 'Ganjil',
              tahun_pelajaran: '2026/2027',
              nilai_mapel: [
                {
                  nama_mapel: 'Matematika',
                  nilai_akhir: 90,
                  capaian_kompetensi: 'Baik',
                },
              ],
              profil_pancasila: [
                {
                  dimensi: 'Mandiri',
                  elemen: 'Regulasi diri',
                  sub_elemen: 'Disiplin',
                  target_pencapaian: 'BSH',
                },
              ],
              nilai_ekstrakurikuler: [
                { nama_ekskul: 'Pramuka', predikat: 'Baik' },
              ],
            },
          ],
        },
      ]}
    />,
  );
  expect(screen.getByText('Mandiri')).toBeInTheDocument();
  expect(screen.getByText('Pramuka')).toBeInTheDocument();
  expect(screen.getByText('90')).toBeInTheDocument();
});
