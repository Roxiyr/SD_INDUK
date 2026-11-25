import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/** Mengarahkan pengguna tanpa sesi atau peran yang tidak cocok. @param {Object} props Peran yang diizinkan dan elemen tujuan. @returns {JSX.Element} Route terlindungi. */
export default function ProtectedRoute({roles,children}){const {user}=useAuth();if(!user)return <Navigate to="/login" replace/>;if(roles&&!roles.includes(user.role))return <Navigate to="/" replace/>;return children;}
