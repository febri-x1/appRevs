import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../src/components/login';
import Signup from '../src/components/signup';

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Halaman utama dialihkan ke /login */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/* Rute untuk halaman Login */}
        <Route path="/login" element={<Login />} />
        
        {/* Rute untuk halaman Signup */}
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </div>
  );
}

export default App;