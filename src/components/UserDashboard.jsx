import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import '../style/booking.css';
import Logout from './Logout';
import ThemeToggle from './ThemeToggle';
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

  // State untuk tab aktif
  const [activeTab, setActiveTab] = useState('booking'); // 'booking' atau 'history'

  // State untuk form booking
  const [formData, setFormData] = useState({
    nama: username,
    nomorTelepon: '',
    email: userEmail,
    jenisKendaraan: '',
    typeKendaraan: '',
    noPolisi: '',
    tanggal: '',
    waktu: '',
    catatan: ''
  });

  // State untuk riwayat booking
  const [bookings, setBookings] = useState([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);

  // State untuk edit booking
  const [editingBooking, setEditingBooking] = useState(null);
  const [editFormData, setEditFormData] = useState({
    tanggal: '',
    waktu: '',
    catatan: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch bookings saat tab history dibuka
  useEffect(() => {
    if (activeTab === 'history') {
      fetchBookings();
    }
  }, [activeTab]);

  // Fetch riwayat booking
  const fetchBookings = async () => {
    setIsLoadingBookings(true);
    try {
      const response = await fetch('http://localhost:3001/api/bookings/my-bookings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Gagal mengambil data booking');
      }

      const data = await response.json();
      setBookings(data.bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      alert('❌ Gagal memuat riwayat booking');
    } finally {
      setIsLoadingBookings(false);
    }
  };

  // Handle perubahan input form booking
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle submit booking baru
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:3001/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal membuat booking');
      }

      alert('✅ Booking berhasil dibuat! Kami akan menghubungi Anda segera.');
      
      // Reset form
      setFormData({
        nama: username,
        nomorTelepon: '',
        email: userEmail,
        jenisKendaraan: '',
        typeKendaraan: '',
        noPolisi: '',
        tanggal: '',
        waktu: '',
        catatan: ''
      });

      // Pindah ke tab history
      setActiveTab('history');

    } catch (error) {
      console.error('❌ Error Booking:', error);
      alert('❌ Error: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mulai edit booking
  const startEditBooking = (booking) => {
    setEditingBooking(booking.id);
    setEditFormData({
      tanggal: booking.tanggal,
      waktu: booking.waktu,
      catatan: booking.catatan || ''
    });
  };

  // Batal edit
  const cancelEdit = () => {
    setEditingBooking(null);
    setEditFormData({
      tanggal: '',
      waktu: '',
      catatan: ''
    });
  };

  // Handle perubahan form edit
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit update booking
  const handleUpdateBooking = async (bookingId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editFormData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal update booking');
      }

      alert('✅ Jadwal berhasil diubah!');
      setEditingBooking(null);
      fetchBookings(); // Refresh list

    } catch (error) {
      console.error('Error updating booking:', error);
      alert('❌ Gagal mengubah jadwal: ' + error.message);
    }
  };

  // Cancel booking
  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Yakin ingin membatalkan booking ini?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/bookings/${bookingId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal cancel booking');
      }

      alert('✅ Booking berhasil dibatalkan');
      fetchBookings(); // Refresh list

    } catch (error) {
      console.error('Error canceling booking:', error);
      alert('❌ Gagal membatalkan booking: ' + error.message);
    }
  };

  // State untuk logout confirmation
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
     setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

   const cancelLogout = () => {
    setShowLogoutModal(false);
   };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  // Format tanggal Indonesia
  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  // Status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { text: 'Menunggu', color: '#ffc107', icon: '⏳' },
      confirmed: { text: 'Dikonfirmasi', color: '#28a745', icon: '✅' },
      completed: { text: 'Selesai', color: '#007bff', icon: '🏁' },
      cancelled: { text: 'Dibatalkan', color: '#dc3545', icon: '❌' }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span style={{
        background: config.color,
        color: 'white',
        padding: '0.25rem 0.75rem',
        borderRadius: '12px',
        fontSize: '0.85rem',
        fontWeight: 'bold'
      }}>
        {config.icon} {config.text}
      </span>
    );
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1>🏍️ Motor Service Center</h1>
          <ThemeToggle/>
          <div className="user-info">
            <span>Halo, <strong>{username}</strong></span>
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'booking' ? 'active' : ''}`}
            onClick={() => setActiveTab('booking')}
          >
            📝 Booking Baru
          </button>
          <button 
            className={`tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            📋 Riwayat Booking
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="dashboard-main">
        {activeTab === 'booking' ? (
          // TAB BOOKING BARU
          <>
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
                      placeholder="email@gmail.com"
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
                    <label htmlFor="noPolisi">
                      <span className="required">*</span> No Plat
                    </label>
                    <input
                      type="text"
                      id="noPolisi"
                      name="noPolisi"
                      value={formData.noPolisi}
                      onChange={handleChange}
                      placeholder="Contoh: A****XX"
                      required
                    />
                  </div>
                </div>

                 <div className="form-group">
                    <label htmlFor="typeKendaraan">
                      <span className="required">*</span>Type Kendaraan
                    </label>
                    <input
                      type="text"
                      id="typeKendaraan"
                      name="typeKendaraan"
                      value={formData.typeKendaraan}
                      onChange={handleChange}
                      placeholder="Honda scoopy"
                      required
                    />
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
          </>
        ) : (
          // TAB RIWAYAT BOOKING
          <div className="history-container">
            <div className="history-header">
              <h2>📋 Riwayat Booking Service</h2>
              <button onClick={fetchBookings} className="btn-refresh">
                🔄 Refresh
              </button>
            </div>

            {isLoadingBookings ? (
              <div className="loading">⏳ Memuat data...</div>
            ) : bookings.length === 0 ? (
              <div className="empty-state">
                <p>📭 Belum ada riwayat booking</p>
                <button 
                  onClick={() => setActiveTab('booking')}
                  className="btn-primary"
                >
                  Buat Booking Sekarang
                </button>
              </div>
            ) : (
              <div className="bookings-list">
                {bookings.map((booking) => (
                  <div key={booking.id} className="booking-item">
                    <div className="booking-header-item">
                      <div>
                        <h3>{booking.typeKendaraan}</h3>
                        <span className="vehicle-type">
                          {booking.jenisKendaraan.toUpperCase()}
                        </span>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>

                    {editingBooking === booking.id ? (
                      // MODE EDIT
                      <div className="edit-form">
                        <div className="form-row">
                          <div className="form-group">
                            <label>Tanggal Service</label>
                            <input
                              type="date"
                              name="tanggal"
                              value={editFormData.tanggal}
                              onChange={handleEditChange}
                              min={today}
                            />
                          </div>
                          <div className="form-group">
                            <label>Waktu Service</label>
                            <select
                              name="waktu"
                              value={editFormData.waktu}
                              onChange={handleEditChange}
                            >
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
                        <div className="form-group full-width">
                          <label>Catatan</label>
                          <textarea
                            name="catatan"
                            value={editFormData.catatan}
                            onChange={handleEditChange}
                            rows="3"
                          ></textarea>
                        </div>
                        <div className="edit-actions">
                          <button 
                            onClick={() => handleUpdateBooking(booking.id)}
                            className="btn-save"
                          >
                            💾 Simpan
                          </button>
                          <button 
                            onClick={cancelEdit}
                            className="btn-cancel-edit"
                          >
                            ❌ Batal
                          </button>
                        </div>
                      </div>
                    ) : (
                      // MODE VIEW
                      <>
                        <div className="booking-details">
                          <div className="detail-item">
                            <span className="label">📅 Tanggal:</span>
                            <span className="value">{formatDate(booking.tanggal)}</span>
                          </div>
                          <div className="detail-item">
                            <span className="label">⏰ Waktu:</span>
                            <span className="value">{booking.waktu}</span>
                          </div>
                          <div className="detail-item">
                            <span className="label">👤 Nama:</span>
                            <span className="value">{booking.nama}</span>
                          </div>
                          <div className="detail-item">
                            <span className="label">No Plat:</span>
                            <span className='value'>{booking.noPolisi}</span>
                          </div>
                          <div className="detail-item">
                            <span className="label">📱 Telepon:</span>
                            <span className="value">{booking.nomorTelepon}</span>
                          </div>
                          {booking.catatan && (
                            <div className="detail-item full">
                              <span className="label">📝 Catatan:</span>
                              <span className="value">{booking.catatan}</span>
                            </div>
                          )}
                        </div>

                        {booking.status === 'pending' && (
                          <div className="booking-actions">
                            <button 
                              onClick={() => startEditBooking(booking)}
                              className="btn-edit"
                            >
                              ✏️ Ubah Jadwal
                            </button>
                            <button 
                              onClick={() => handleCancelBooking(booking.id)}
                              className="btn-cancel"
                            >
                              🗑️ Batalkan
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

    <div className="dashboard-container"> 
      <Logout 
        isOpen={showLogoutModal}
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
        userType="user"
      />
    </div>
    </div>
  );
}

export default UserDashboard;