import {useEffect,useState} from 'react';
import {NavLink,Outlet,useNavigate} from 'react-router-dom';
import {BookOpen,Users,GraduationCap,LayoutDashboard,School,LogOut,ClipboardList,Settings,KeyRound,FileSpreadsheet} from 'lucide-react';
import {useAuth} from '../../context/AuthContext';
import {api} from '../../services/api';

/** Menampilkan sapaan menurut waktu lokal. @param {Date} date Jam aktif. @returns {string} Pagi, siang, sore, atau malam. */
function greetingFor(date){const hour=date.getHours();return hour<11?'Pagi':hour<15?'Siang':hour<18?'Sore':'Malam';}

/** Menyediakan sidebar, topbar waktu nyata, konteks semester, dan area dashboard. @returns {JSX.Element} Shell aplikasi Admin/Guru. */
export default function DashboardLayout(){
  const {user,signOut}=useAuth();const navigate=useNavigate();const [now,setNow]=useState(()=>new Date());const [school,setSchool]=useState({});
  const adminLinks=[['/','Ringkasan',LayoutDashboard],['/siswa','Data Siswa',Users],['/kelas','Data Kelas',School],['/guru','Data Guru',GraduationCap],['/admin-tu','Data Admin',Users],['/mapel','Mata Pelajaran',BookOpen],['/ekskul','Ekstrakurikuler',ClipboardList],['/akun','Akun & Penugasan',Settings],['/profil-sekolah','Profil Sekolah',School],['/impor','Import Excel',FileSpreadsheet]];
  const guruLinks=[['/','Ringkasan',LayoutDashboard],...(user?.is_wali_kelas?[['/siswa','Siswa Binaan',Users],['/asesmen','Asesmen Wali Kelas',ClipboardList]]:[]),['/nilai','Input Nilai',BookOpen],['/kata-sandi','Ubah Kata Sandi',KeyRound]];
  const links=user?.role==='ADMIN'?[...adminLinks,['/kata-sandi','Ubah Kata Sandi',KeyRound]]:guruLinks;
  useEffect(()=>{const timer=setInterval(()=>setNow(new Date()),30000);api.get('/admin/profil-sekolah').then(r=>setSchool(r.data.data||{})).catch(()=>{});return()=>clearInterval(timer);},[]);
  return <div className="app-shell"><aside className="sidebar"><div className="brand-mark">BI</div><div className="brand-copy"><strong>BUKU INDUK</strong><small>SDN Batu Ampar 12 Pagi</small></div><div className="nav-label">MENU UTAMA</div><nav>{links.map(([to,label,Icon])=><NavLink key={to} to={to} end={to==='/'} className={({isActive})=>`nav-item ${isActive?'active':''}`}><Icon size={18}/><span>{label}</span></NavLink>)}</nav><div className="sidebar-bottom"><div className="profile-chip"><div className="avatar">{user?.nama_lengkap?.[0]||'U'}</div><div><b>{user?.nama_lengkap}</b><small>{user?.role==='ADMIN'?'Administrator':'Guru'}</small></div></div><button className="signout" onClick={()=>{signOut();navigate('/login');}}><LogOut size={16}/>Keluar</button></div></aside><main className="main-area"><header className="topbar"><div><div className="eyebrow">PORTAL ADMINISTRASI SEKOLAH</div><h1>Selamat {greetingFor(now)}, {user?.nama_lengkap?.split(' ')[0]||'Pengguna'}</h1></div><div className="top-meta"><span className="year-pill">TA {school.tahun_ajaran_aktif||'2026/2027'} <i/> {school.semester_aktif||'Ganjil'}</span><span className="date-label">{new Intl.DateTimeFormat('id-ID',{dateStyle:'full',timeStyle:'short'}).format(now)}</span><button className="top-signout" onClick={()=>{signOut();navigate('/login');}} aria-label="Keluar dari akun"><LogOut size={15}/>Keluar</button></div></header><section className="page-content"><Outlet/></section></main></div>;
}

