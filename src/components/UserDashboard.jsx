import React from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function UserDashboard() {
  const navigate = useNavigate();
  
  // Ambil data user dari token
  const token = localStorage.getItem('authToken');
  let username = 'User';
  
  if (token) {
    try {
      const decoded = jwtDecode(token);
      username = decoded.username || decoded.email;
    } catch (error) {
      console.error('Token tidak valid:', error);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Dashboard User</h1>
        <p style={styles.welcome}>Selamat datang, <strong>{username}</strong>!</p>
        <p style={styles.text}>Ini adalah halaman dashboard untuk user biasa.</p>
        
        <button onClick={handleLogout} style={styles.button}>
          Logout
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#242424',
    fontFamily: 'Arial, sans-serif',
  },
  card: {
    background: '#2d2d2d',
    border: '1px solid #444',
    borderRadius: '8px',
    padding: '2rem',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
    maxWidth: '500px',
    textAlign: 'center',
  },
  title: {
    color: '#f0f0f0',
    marginTop: 0,
  },
  welcome: {
    color: '#ccc',
    fontSize: '1.1rem',
    marginBottom: '1rem',
  },
  text: {
    color: '#aaa',
    marginBottom: '2rem',
  },
  button: {
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: '#dc3545',
    color: 'white',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
};

export default UserDashboard;