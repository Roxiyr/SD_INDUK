import { createContext,useContext,useEffect,useState } from 'react';
import { api } from '../services/api';
const AuthContext=createContext(null);

/** Menyediakan sesi login/logout untuk seluruh aplikasi. @param {Object} props Komponen anak. @returns {JSX.Element} Provider autentikasi. */
export function AuthProvider({children}){const [user,setUser]=useState(()=>{try{return JSON.parse(localStorage.getItem('ebuku-user')||sessionStorage.getItem('ebuku-user'));}catch{return null;}});const [loading,setLoading]=useState(false);useEffect(()=>{if(!localStorage.getItem('ebuku-token')&&!sessionStorage.getItem('ebuku-token'))return;api.get('/auth/me').then(({data})=>{const store=localStorage.getItem('ebuku-token')?localStorage:sessionStorage;store.setItem('ebuku-user',JSON.stringify(data.user));setUser(data.user);}).catch(()=>{localStorage.removeItem('ebuku-token');localStorage.removeItem('ebuku-user');sessionStorage.removeItem('ebuku-token');sessionStorage.removeItem('ebuku-user');setUser(null);});},[]);
  /** Mengirim kredensial ke API lalu menyimpan token dan profil. @param {Object} credentials Username dan password. @returns {Promise<Object>} User yang berhasil login. */
  async function signIn(credentials,expectedRole,remember=false){setLoading(true);try{const {data}=await api.post('/auth/login',credentials);if(expectedRole&&data.user.role!==expectedRole)throw new Error('Jenis akun tidak sesuai dengan pilihan.');localStorage.removeItem('ebuku-token');localStorage.removeItem('ebuku-user');sessionStorage.removeItem('ebuku-token');sessionStorage.removeItem('ebuku-user');const store=remember?localStorage:sessionStorage;store.setItem('ebuku-token',data.token);store.setItem('ebuku-user',JSON.stringify(data.user));setUser(data.user);return data.user;}finally{setLoading(false);}}
  /** Menghapus sesi lokal pengguna. @returns {void} Mengosongkan state autentikasi. */
  function signOut(){localStorage.removeItem('ebuku-token');localStorage.removeItem('ebuku-user');sessionStorage.removeItem('ebuku-token');sessionStorage.removeItem('ebuku-user');setUser(null);}
  return <AuthContext.Provider value={{user,loading,signIn,signOut,setUser}}>{children}</AuthContext.Provider>;}

/** Mengakses state autentikasi pada komponen React. @returns {Object} User dan fungsi sesi. */
export function useAuth(){return useContext(AuthContext);}
