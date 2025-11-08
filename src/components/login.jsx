import React, { useState } from 'react';
import { Link, userNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import '../style/form.css'; // Impor file CSS

function Login() {
  // State untuk menyimpan data input form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = userNavigate();

  // Fungsi yang dipanggil saat form disubmit
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal login');
      }

      // Jika berhasil, 'data.token' berisi JWT
      console.log('Login berhasil, token:', data.token);
      alert('Login berhasil!');

      // Simpan token untuk sesi (Contoh: localStorage)
      localStorage.setItem('authToken', data.token);

      const decodedToken = jwtDecode(data.token);
      const userRole = decodedToken.role;

      if (userRole === 'admin') {
        navigate('/admin');
      } else if (userRole === 'user') {
        navigate('/dashboard');
      } else {
        // Fallback jika role tidak dikenali
        navigate('/login');
      }
      // ------------------------------------------

    } catch (error) {
      console.error('Error Login:', error);
      alert(error.message);
    }
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