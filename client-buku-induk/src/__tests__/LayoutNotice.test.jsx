import { useState } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { vi } from 'vitest';
import DashboardLayout from '../components/layout/DashboardLayout';
import InlineNotice from '../components/ui/InlineNotice';
import { AuthProvider } from '../context/AuthContext';

/** Menguji DashboardLayout untuk peran Guru dan perilaku auto-dismiss/reset InlineNotice. @returns {void} Aserta sidebar Guru dan notifikasi lokal. */
test('sidebar guru hanya memiliki satu tombol Keluar dan tidak menampilkan Ubah Kata Sandi', () => {
  sessionStorage.setItem(
    'ebuku-user',
    JSON.stringify({
      id_user: 2,
      role: 'GURU',
      nama_lengkap: 'Budi Santoso',
      is_wali_kelas: true,
      kelas_binaan: [],
      mapel_diampu: [],
    }),
  );
  render(
    <MemoryRouter initialEntries={['/']}>
      <AuthProvider>
        <DashboardLayout />
      </AuthProvider>
    </MemoryRouter>,
  );
  expect(screen.queryByText('Ubah Kata Sandi')).not.toBeInTheDocument();
  expect(screen.getAllByRole('button', { name: /Keluar/i })).toHaveLength(1);
  sessionStorage.clear();
});

test('InlineNotice hilang otomatis setelah 3,5 detik dan direset saat pindah rute', () => {
  vi.useFakeTimers();
  function Wrapper() {
    const [msg, setMsg] = useState('Data tersimpan.');
    const navigate = useNavigate();
    return (
      <div>
        <InlineNotice message={msg} onClose={setMsg} />
        <button onClick={() => setMsg('Notif baru')}>Tampilkan</button>
        <button onClick={() => navigate('/lain')}>Pindah</button>
      </div>
    );
  }
  render(
    <MemoryRouter initialEntries={['/awal']}>
      <Routes>
        <Route path='*' element={<Wrapper />} />
      </Routes>
    </MemoryRouter>,
  );
  expect(screen.getByRole('status')).toHaveTextContent('Data tersimpan.');
  act(() => {
    vi.advanceTimersByTime(3500);
  });
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Tampilkan' }));
  expect(screen.getByRole('status')).toHaveTextContent('Notif baru');
  fireEvent.click(screen.getByRole('button', { name: 'Pindah' }));
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  vi.useRealTimers();
});
