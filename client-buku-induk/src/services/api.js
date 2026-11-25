import axios from 'axios';

/** Menyiapkan klien API terpusat dengan token sesi otomatis. @returns {Object} Axios instance siap dipakai halaman. */
export const api=axios.create({baseURL:import.meta.env.VITE_API_URL||'http://localhost:5000/api/v1'});
api.interceptors.request.use((config)=>{const token=localStorage.getItem('ebuku-token')||sessionStorage.getItem('ebuku-token');if(token)config.headers.Authorization=`Bearer ${token}`;return config;});
