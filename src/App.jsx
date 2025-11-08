import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/login'; // pastikan path benar
import Signup from './components/signup'; // pastikan path benar
import UserDashboard from './components/UserDashboard'; // <-- IMPORT BARU
import AdminDashboard from './components/AdminDashboard'; // <-- IMPORT BARU
import ProtectedRoute from './components/ProtectedRoute'; // <-- IMPORT BARU

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Rute Publik */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Rute Dilindungi untuk User */}
        <Route element={<ProtectedRoute allowedRoles={['user', 'admin']} />}>
          {/* Admin juga boleh lihat dashboard user */}
          <Route path="/dashboard" element={<UserDashboard />} /> 
        </Route>

        {/* Rute Dilindungi HANYA untuk Admin */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

      </Routes>
    </div>
  );
}

export default App;