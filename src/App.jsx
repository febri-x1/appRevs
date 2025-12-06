import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// -- INI ADALAH PERBAIKANNYA --
import Login from './components/login';
import Signup from './components/signup';
// ------------------------------

import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './components/Home';

function App() {
  return (
    <div className="App">
      <Routes>

        <Route path="/" element={<Home/>} />

        {/* Rute Publik */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Rute Dilindungi untuk User */}
        <Route element={<ProtectedRoute allowedRoles={['user']} />}>
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