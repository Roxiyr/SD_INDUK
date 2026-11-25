import {fireEvent,render,screen} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import {AuthProvider} from '../context/AuthContext';
import Login from '../pages/Login';

/** Menguji komponen login menggunakan provider dan router terisolasi. @returns {void} Aserta antarmuka login. */
test('menampilkan kedua peran login tanpa portal murid',()=>{render(<MemoryRouter><AuthProvider><Login/></AuthProvider></MemoryRouter>);expect(screen.getByText('Operator / Admin')).toBeInTheDocument();expect(screen.getByText('Guru')).toBeInTheDocument();expect(screen.queryByText('Murid')).not.toBeInTheDocument();expect(screen.getByLabelText('Username / NIP')).toBeInTheDocument();});
test('menampilkan validasi input kosong',async()=>{render(<MemoryRouter><AuthProvider><Login/></AuthProvider></MemoryRouter>);fireEvent.click(screen.getByRole('button',{name:/Masuk ke Dashboard Operator/i}));expect(await screen.findByRole('alert')).toHaveTextContent('Username dan kata sandi wajib diisi.');});
