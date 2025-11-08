import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../style/from.css'; // Impor file CSS

function Login() {
  // State untuk menyimpan data input form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Fungsi yang dipanggil saat form disubmit
  const handleSubmit = (event) => {
    event.preventDefault(); // Mencegah reload halaman
    console.log('Data Login:', { email, password });
    
    // --- DI SINI LOGIKA ANDA ---
    // (Contoh: Kirim data ke API backend Anda)
    // fetch('/api/login', { method: 'POST', body: JSON.stringify({ email, password }) })
    //   .then(response => response.json())
    //   .then(data => console.log(data));
    
    alert('Login berhasil (lihat konsol)!');
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <h2>Login</h2>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <button type="submit" className="form-button">Login</button>
        
        <p className="form-switch">
          Belum punya akun? <Link to="/signup">Daftar di sini</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;