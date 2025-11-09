import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import '../style/booking.css'; // Kita gunakan style yang sama

function AdminDashboard() {
  const navigate = useNavigate();
  
  // Ambil data admin dari token
  const token = localStorage.getItem('authToken');
  let username = 'Admin';
  
  if (token) {
    try {
      const decoded = jwtDecode(token);
      username = decoded.username || decoded.email;
    } catch (error) {
      console.error('Token tidak valid:', error);
    }
  }

  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fungsi untuk mengambil semua booking
  const fetchAllBookings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Gagal mengambil data booking');
      }
      const data = await response.json();
      // Urutkan: pending & confirmed di atas
      data.bookings.sort((a, b) => {
        const order = { pending: 1, confirmed: 2, in_progress: 3, completed: 4, cancelled: 5 };
        return (order[a.status] || 99) - (order[b.status] || 99);
      });
      setBookings(data.bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      alert('❌ Gagal memuat data booking');
    } finally {
      setIsLoading(false);
    }
  };

  // Panggil fetchBookings saat komponen dimuat
  useEffect(() => {
    fetchAllBookings();
  }, []);

  // Fungsi untuk update status
  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:3001/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Gagal update status');
      }

      // Update status di state secara lokal (lebih cepat)
      setBookings(prevBookings => 
        prevBookings.map(b => 
          b.id === bookingId ? { ...b, status: newStatus } : b
        )
      );
      // fetchAllBookings(); // Atau fetch ulang
      
    } catch (error) {
      console.error('Error updating status:', error);
      alert('❌ Gagal update status');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  // Format tanggal Indonesia
  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  // Status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { text: 'Menunggu Konfirmasi', color: '#ffc107', icon: '⏳' },
      confirmed: { text: 'Menunggu Servis', color: '#28a745', icon: '✅' },
      in_progress: { text: 'Sedang Dikerjakan', color: '#17a2b8', icon: '🔧' },
      completed: { text: 'Selesai Dikerjakan', color: '#007bff', icon: '🏁' },
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
          <h1>🛡️ Dashboard Admin</h1>
          <div className="user-info">
            <span>Halo, <strong>{username}</strong></span>
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main" style={{ gridTemplateColumns: '1fr' }}>
        <div className="history-container">
          <div className="history-header">
            <h2>📋 Manajemen Booking</h2>
            <button onClick={fetchAllBookings} className="btn-refresh" disabled={isLoading}>
              {isLoading ? '⏳ Memuat...' : '🔄 Refresh'}
            </button>
          </div>

          {isLoading ? (
            <div className="loading">⏳ Memuat data...</div>
          ) : bookings.length === 0 ? (
            <div className="empty-state">
              <p>📭 Belum ada data booking</p>
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
                    {/* Tampilkan badge status saat ini */}
                    {getStatusBadge(booking.status)}
                  </div>

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

                  {/* Ini adalah inti fiturnya */}
                  <div className="admin-actions">
                    <label htmlFor={`status-${booking.id}`}>
                      Ubah Status Pengerjaan:
                    </label>
                    <select
                      id={`status-${booking.id}`}
                      className="status-select"
                      value={booking.status}
                      onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                    >
                      <option value="pending">Menunggu Konfirmasi</option>
                      <option value="confirmed">Menunggu Servis</option>
                      <option value="in_progress">Sedang Dikerjakan</option>
                      <option value="completed">Selesai Dikerjakan</option>
                      <option value="cancelled">Dibatalkan</option>
                    </select>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;