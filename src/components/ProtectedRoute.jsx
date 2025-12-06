import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

// Fungsi helper untuk mendapatkan role dari token
const getUserRole = () => {
  const token = sessionStorage.getItem('authToken');
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return decoded.role; // Mengambil 'role' dari payload token
  } catch (error) {
    console.error("Token tidak valid:", error);
    sessionStorage.removeItem('authToken'); // Hapus token rusak
    return null;
  }
};

// Komponen Pelindung Rute
const ProtectedRoute = ({ allowedRoles }) => {
  const userRole = getUserRole();

  if (!userRole) {
    // Jika tidak ada token (belum login)
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(userRole)) {
    // Jika role tidak diizinkan (misal: user coba masuk /admin)
    // Anda bisa arahkan ke halaman "Tidak Diizinkan" atau kembali ke login
    return <Navigate to="/login" replace />; 
  }

  // Jika lolos semua, tampilkan halaman yang dituju
  return <Outlet />;
};

export default ProtectedRoute;