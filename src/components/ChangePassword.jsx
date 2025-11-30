import React, { useState } from 'react';
import '../style/logout.css'; 
import '../style/form.css';

function ChangePassword({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      alert('❌ Konfirmasi password baru tidak cocok!');
      return;
    }

    if (formData.newPassword.length < 6) {
        alert('❌ Password baru minimal 6 karakter');
        return;
    }

    setLoading(true);
    const token = localStorage.getItem('authToken');

    try {
      const response = await fetch('http://localhost:3001/api/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal mengubah password');
      }

      alert('✅ Password berhasil diubah!');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      onClose(); // Tutup modal

    } catch (error) {
      alert('❌ ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{textAlign: 'left', maxWidth: '400px'}}>
        <h3 style={{textAlign: 'center', marginBottom: '1.5rem', color: '#f0f0f0'}}>🔐 Ganti Password</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label style={{color: '#ccc'}}>Password Saat Ini</label>
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              required
              style={{background: '#1e1e1e', color: 'white', border: '1px solid #555'}}
            />
          </div>

          <div className="form-group">
            <label style={{color: '#ccc'}}>Password Baru</label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              required
              style={{background: '#1e1e1e', color: 'white', border: '1px solid #555'}}
            />
          </div>

          <div className="form-group">
            <label style={{color: '#ccc'}}>Konfirmasi Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              style={{background: '#1e1e1e', color: 'white', border: '1px solid #555'}}
            />
          </div>

          <div className="modal-actions" style={{marginTop: '1.5rem'}}>
            <button 
                type="submit" 
                className="btn-confirm-logout" 
                style={{background: '#007bff'}}
                disabled={loading}
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
            <button 
                type="button" 
                onClick={onClose} 
                className="btn-cancel-logout"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChangePassword;