import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Form.css'; // Menggunakan CSS yang sama

function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Data Signup:', { username, email, password });

    // --- DI SINI LOGIKA ANDA ---
    // (Contoh: Kirim data ke API backend Anda untuk registrasi)
    // fetch('/api/signup', { ... })
    
    alert('Signup berhasil (lihat konsol)!');
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <h2>Sign Up</h2>
        
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

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
        
        <button type="submit" className="form-button">Daftar</button>
        
        <p className="form-switch">
          Sudah punya akun? <Link to="/login">Login di sini</Link>
        </p>
      </form>
    </div>
  );
}

export default Signup;