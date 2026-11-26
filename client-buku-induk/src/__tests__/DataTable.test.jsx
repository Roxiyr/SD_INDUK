import { fireEvent, render, screen } from '@testing-library/react';
import DataTable from '../components/ui/DataTable';

/** Memastikan pencarian tabel menyaring baris yang ditampilkan. @returns {void} Aserta hasil filter. */
test('memfilter baris saat pencarian diketik', () => {
  render(
    <DataTable
      rows={[
        { nis: '1', nama_lengkap: 'Ayu Putri' },
        { nis: '2', nama_lengkap: 'Bima' },
      ]}
      columns={[{ key: 'nama_lengkap', label: 'Nama' }]}
    />,
  );
  fireEvent.change(screen.getByLabelText('Cari data'), {
    target: { value: 'ayu' },
  });
  expect(screen.getByText('Ayu Putri')).toBeInTheDocument();
  expect(screen.queryByText('Bima')).not.toBeInTheDocument();
});
test('filter status menyaring data dan pagination berpindah halaman', () => {
  const rows = Array.from({ length: 12 }, (_, i) => ({
    nis: String(i + 1),
    nama_lengkap: `Siswa ${i + 1}`,
    status: i < 11 ? 'AKTIF' : 'LULUS',
  }));
  render(
    <DataTable
      rows={rows}
      columns={[{ key: 'nama_lengkap', label: 'Nama' }]}
      filters={[
        {
          key: 'status',
          label: 'Status',
          options: [
            { value: 'AKTIF', label: 'Aktif' },
            { value: 'LULUS', label: 'Lulus' },
          ],
        },
      ]}
    />,
  );
  expect(screen.getByText('Siswa 1')).toBeInTheDocument();
  expect(screen.queryByText('Siswa 11')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Berikutnya' }));
  expect(screen.getByText('Siswa 11')).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Status'), {
    target: { value: 'LULUS' },
  });
  expect(screen.getByText('Siswa 12')).toBeInTheDocument();
  expect(screen.queryByText('Siswa 1')).not.toBeInTheDocument();
});
