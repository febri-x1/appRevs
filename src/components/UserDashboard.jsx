import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import '../style/booking.css';

function UserDashboard() {
  const navigate = useNavigate();
  
  // Ambil data user dari token
  const token = localStorage.getItem('authToken');
  let userEmail = '';
  let username = 'User';
  
  if (token) {
    try {
      const decoded = jwtDecode(token);
      username = decoded.username || decoded.email;
      userEmail = decoded.email || '';
    } catch (error) {
      console.error('Token tidak valid:', error);
    }
  }

  // State untuk form booking
  const [formData, setFormData] = useState({
    nama: username,
    nomorTelepon: '',
    email: userEmail,
    jenisKendaraan: '',
    typeKendaraan: '',
    tanggal: '',
    waktu: '',
    catatan: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle perubahan input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle submit booking
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Kirim data ke backend API
      const response = await fetch('http://localhost:3001/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Gagal membuat booking');
      }

      alert('✅ Booking berhasil dibuat! Kami akan menghubungi Anda segera.');
      
      // Reset form
      setFormData({
        nama: username,
        nomorTelepon: '',
        email: userEmail,
        jenisKendaraan: '',
        typeKendaraan: '',
        tanggal: '',
        waktu: '',
        catatan: ''
      });

    } catch (error) {
      console.error('Error Booking:', error);
      alert('❌ ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1>🏍️ Motor Service Center</h1>
          <div className="user-info">
            <span>Halo, <strong>{username}</strong></span>
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="booking-card">
          <div className="card-header">
            <h2>📋 Form Booking Service Motor</h2>
            <p>Isi formulir di bawah ini untuk reservasi service</p>
          </div>

          <form onSubmit={handleSubmit} className="booking-form">
            {/* Nama */}
            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="nama">
                  <span className="required">*</span> Nama Lengkap
                </label>
                <input
                  type="text"
                  id="nama"
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </div>
            </div>

            {/* Nomor Telepon & Email */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nomorTelepon">
                  <span className="required">*</span> Nomor Telepon/WA
                </label>
                <input
                  type="tel"
                  id="nomorTelepon"
                  name="nomorTelepon"
                  value={formData.nomorTelepon}
                  onChange={handleChange}
                  placeholder="08xxxxxxxxxx"
                  pattern="[0-9]{10,13}"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  <span className="required">*</span> Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                  required
                />
              </div>
            </div>

            {/* Jenis Kendaraan & Type */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="jenisKendaraan">
                  <span className="required">*</span> Jenis Kendaraan
                </label>
                <select
                  id="jenisKendaraan"
                  name="jenisKendaraan"
                  value={formData.jenisKendaraan}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Pilih Jenis --</option>
                  <option value="matic">Matic</option>
                  <option value="bebek">Bebek</option>
                  <option value="sport">Sport</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="typeKendaraan">
                  <span className="required">*</span> Type Kendaraan
                </label>
                <input
                  type="text"
                  id="typeKendaraan"
                  name="typeKendaraan"
                  value={formData.typeKendaraan}
                  onChange={handleChange}
                  placeholder="Contoh: Honda Scoopy"
                  required
                />
              </div>
            </div>

            {/* Tanggal & Waktu */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="tanggal">
                  <span className="required">*</span> Tanggal Service
                </label>
                <input
                  type="date"
                  id="tanggal"
                  name="tanggal"
                  value={formData.tanggal}
                  onChange={handleChange}
                  min={today}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="waktu">
                  <span className="required">*</span> Waktu Service
                </label>
                <select
                  id="waktu"
                  name="waktu"
                  value={formData.waktu}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Pilih Waktu --</option>
                  <option value="08:00">08:00 - 09:00</option>
                  <option value="09:00">09:00 - 10:00</option>
                  <option value="10:00">10:00 - 11:00</option>
                  <option value="11:00">11:00 - 12:00</option>
                  <option value="13:00">13:00 - 14:00</option>
                  <option value="14:00">14:00 - 15:00</option>
                  <option value="15:00">15:00 - 16:00</option>
                  <option value="16:00">16:00 - 17:00</option>
                </select>
              </div>
            </div>

            {/* Catatan */}
            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="catatan">
                  Catatan / Keluhan Kendaraan
                </label>
                <textarea
                  id="catatan"
                  name="catatan"
                  value={formData.catatan}
                  onChange={handleChange}
                  placeholder="Contoh: Mesin sering mati tiba-tiba, rem bunyi mencit, dll."
                  rows="4"
                ></textarea>
                <small className="form-hint">
                  Jelaskan masalah atau keluhan pada kendaraan Anda (opsional)
                </small>
              </div>
            </div>

            {/* Submit Button */}
            <div className="form-actions">
              <button 
                type="submit" 
                className="btn-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? '⏳ Memproses...' : '✅ Buat Booking'}
              </button>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="info-box">
          <h3>📌 Informasi Penting</h3>
          <ul>
            <li>✅ Service dilakukan pada hari Senin - Sabtu</li>
            <li>⏰ Jam operasional: 08:00 - 17:00</li>
            <li>📞 Kami akan konfirmasi booking melalui WhatsApp</li>
            <li>🔧 Estimasi waktu service: 1-2 jam</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

export default UserDashboard;