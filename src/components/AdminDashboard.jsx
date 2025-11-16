import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Logout from './Logout';
import '../style/admin.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' atau 'bookings'
  
  // State untuk data
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    totalUsers: 0,
    todayBookings: 0,
    thisWeekBookings: 0,
    thisMonthBookings: 0
  });

  // State untuk filter
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [searchId, setSearchId] = useState('');

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

  // Fetch data saat component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Hitung statistik setiap kali bookings berubah
  useEffect(() => {
    calculateStats();
  }, [bookings, users]);

  // Fetch all data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch bookings
      const bookingsRes = await fetch('http://localhost:3001/api/bookings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const bookingsData = await bookingsRes.json();

      // Fetch users
      const usersRes = await fetch('http://localhost:3001/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const usersData = await usersRes.json();

      setBookings(bookingsData.bookings || []);
      setUsers(usersData.users || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('❌ Gagal memuat data');
    } finally {
      setIsLoading(false);
    }
  };

  // Hitung statistik
  const calculateStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const thisWeek = getWeekStart();
    const thisMonth = new Date().toISOString().slice(0, 7);

    const newStats = {
      totalBookings: bookings.length,
      pendingBookings: bookings.filter(b => b.status === 'pending').length,
      confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
      completedBookings: bookings.filter(b => b.status === 'completed').length,
      cancelledBookings: bookings.filter(b => b.status === 'cancelled').length,
      totalUsers: users.length,
      todayBookings: bookings.filter(b => b.tanggal === today).length,
      thisWeekBookings: bookings.filter(b => b.tanggal >= thisWeek).length,
      thisMonthBookings: bookings.filter(b => b.tanggal.startsWith(thisMonth)).length
    };

    setStats(newStats);
  };

  // Helper: Get week start date
  const getWeekStart = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    return new Date(now.setDate(diff)).toISOString().split('T')[0];
  };

  // Update status booking
  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:3001/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Gagal update status');

      alert('✅ Status booking berhasil diubah!');
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('❌ Gagal mengubah status');
    }
  };

  // Format tanggal
  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const config = {
      pending: { text: 'Menunggu', color: '#ffc107', icon: '⏳' },
      confirmed: { text: 'Dikonfirmasi', color: '#28a745', icon: '✅' },
      completed: { text: 'Selesai', color: '#007bff', icon: '🏁' },
      cancelled: { text: 'Dibatalkan', color: '#dc3545', icon: '❌' }
    };
    const c = config[status] || config.pending;
    return <span className="status-badge" style={{ background: c.color }}>{c.icon} {c.text}</span>;
  };

  // Filter bookings
  const getFilteredBookings = () => {
    let filtered = [...bookings];

    // --- LOGIKA PENCARIAN BARU ---
    // 1. Terapkan filter pencarian ID terlebih dahulu
    const trimmedSearchId = searchId.trim();
    if (trimmedSearchId) {
      filtered = filtered.filter(b => 
        b.id.includes(trimmedSearchId)
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(b => b.status === filterStatus);
    }

    // Filter by date
    const today = new Date().toISOString().split('T')[0];
    const thisWeek = getWeekStart();
    const thisMonth = new Date().toISOString().slice(0, 7);

    if (filterDate === 'today') {
      filtered = filtered.filter(b => b.tanggal === today);
    } else if (filterDate === 'week') {
      filtered = filtered.filter(b => b.tanggal >= thisWeek);
    } else if (filterDate === 'month') {
      filtered = filtered.filter(b => b.tanggal.startsWith(thisMonth));
    }

    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  // Logout handlers
  const handleLogout = () => setShowLogoutModal(true);
  const confirmLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };
  const cancelLogout = () => setShowLogoutModal(false);

  // ... (sebelum return)
 // const cancelLogout = () => setShowLogoutModal(false);

  // --- SALIN DAN TEMPEL KOMPONEN MODAL INI ---
  const BookingDetailModal = ({ booking, onClose }) => {
    if (!booking) return null;

    return (

      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content detail-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Detail Booking #{booking.id}</h3>
            {getStatusBadge(booking.status)}
            <button className="modal-close" onClick={onClose}>&times;</button>
          </div>
          <div className="modal-body">
            <div className="detail-grid">
              <div className="detail-item">
                <span>Nama</span>
                <p>{booking.nama}</p>
              </div>
              <div className="detail-item">
                <span>Telepon</span>
                <p>{booking.nomorTelepon}</p>
              </div>
              <div className="detail-item full-width">
                <span>Email</span>
                <p>{booking.email}</p>
              </div>
              <hr className="full-width" />
              <div className="detail-item">
                <span>Jenis</span>
                <p>{booking.jenisKendaraan}</p>
              </div>
              <div className="detail-item">
                <span>Tipe</span>
                <p>{booking.typeKendaraan}</p>
              </div>
              <div className="detail-item">
                <span>No. Plat</span>
                <p>{booking.noPolisi || '-'}</p>
              </div>
              <hr className="full-width" />
              <div className="detail-item">
                <span>Tanggal</span>
                <p>{formatDate(booking.tanggal)}</p>
              </div>
              <div className="detail-item">
                <span>Waktu</span>
                <p>{booking.waktu}</p>
              </div>
              <div className="detail-item full-width">
                <span>Catatan/Keluhan</span>
                <p>{booking.catatan || 'Tidak ada catatan'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-container">
      <Logout 
        isOpen={showLogoutModal}
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
        userType="admin"
      />
      
      <BookingDetailModal 
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
      />

      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>🛡️ Admin Panel</h2>
          <p>{username}</p>
        </div>
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          <button 
            className={`nav-item ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            📋 Kelola Booking
          </button>
          <button className="nav-item" onClick={handleLogout}>
            🚪 Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <h1>{activeTab === 'dashboard' ? '📊 Dashboard Analytics' : '📋 Kelola Booking'}</h1>
          <button onClick={fetchData} className="btn-refresh">
            🔄 Refresh Data
          </button>
        </header>

        {isLoading ? (
          <div className="loading">⏳ Memuat data...</div>
        ) : activeTab === 'dashboard' ? (
          // TAB DASHBOARD
          <div className="dashboard-content">
            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card primary">
                <div className="stat-icon">📦</div>
                <div className="stat-info">
                  <h3>{stats.totalBookings}</h3>
                  <p>Total Booking</p>
                </div>
              </div>

              <div className="stat-card warning">
                <div className="stat-icon">⏳</div>
                <div className="stat-info">
                  <h3>{stats.pendingBookings}</h3>
                  <p>Menunggu Konfirmasi</p>
                </div>
              </div>

              <div className="stat-card success">
                <div className="stat-icon">✅</div>
                <div className="stat-info">
                  <h3>{stats.confirmedBookings}</h3>
                  <p>Dikonfirmasi</p>
                </div>
              </div>

              <div className="stat-card info">
                <div className="stat-icon">🏁</div>
                <div className="stat-info">
                  <h3>{stats.completedBookings}</h3>
                  <p>Selesai</p>
                </div>
              </div>

              <div className="stat-card danger">
                <div className="stat-icon">❌</div>
                <div className="stat-info">
                  <h3>{stats.cancelledBookings}</h3>
                  <p>Dibatalkan</p>
                </div>
              </div>

              <div className="stat-card dark">
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                  <h3>{stats.totalUsers}</h3>
                  <p>Total Pengguna</p>
                </div>
              </div>
            </div>

            {/* Period Stats */}
            <div className="period-stats">
              <div className="period-card">
                <h3>📅 Hari Ini</h3>
                <p className="period-value">{stats.todayBookings}</p>
                <p className="period-label">Booking</p>
              </div>
              <div className="period-card">
                <h3>📆 Minggu Ini</h3>
                <p className="period-value">{stats.thisWeekBookings}</p>
                <p className="period-label">Booking</p>
              </div>
              <div className="period-card">
                <h3>📊 Bulan Ini</h3>
                <p className="period-value">{stats.thisMonthBookings}</p>
                <p className="period-label">Booking</p>
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="recent-section">
              <h2>🕐 Booking Terbaru</h2>
              <div className="recent-list">
                {bookings.slice(0, 5).map(booking => (
                  <div key={booking.id} className="recent-item">
                    <div className="recent-info">
                      <h4>{booking.nama}</h4>
                      <p>{booking.typeKendaraan} • {formatDate(booking.tanggal)}</p>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                ))}
              </div>
            </div>

            {/* Vehicle Types Chart */}
            <div className="chart-section">
              <h2>🏍️ Jenis Kendaraan</h2>
              <div className="vehicle-stats">
                {['matic', 'bebek', 'sport'].map(type => {
                  const count = bookings.filter(b => b.jenisKendaraan === type).length;
                  const percentage = bookings.length ? ((count / bookings.length) * 100).toFixed(1) : 0;
                  return (
                    <div key={type} className="vehicle-item">
                      <div className="vehicle-label">
                        <span>{type.toUpperCase()}</span>
                        <span>{count} ({percentage}%)</span>
                      </div>
                      <div className="vehicle-bar">
                        <div 
                          className="vehicle-progress" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          // TAB KELOLA BOOKING
          <div className="bookings-content">
            {/* Filters */}
            <div className="filters">
              <div className="filter-group">
                <label>Status:</label>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="all">Semua Status</option>
                  <option value="pending">Menunggu</option>
                  <option value="confirmed">Dikonfirmasi</option>
                  <option value="completed">Selesai</option>
                  <option value="cancelled">Dibatalkan</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Periode:</label>
                <select value={filterDate} onChange={(e) => setFilterDate(e.target.value)}>
                  <option value="all">Semua Waktu</option>
                  <option value="today">Hari Ini</option>
                  <option value="week">Minggu Ini</option>
                  <option value="month">Bulan Ini</option>
                </select>
              </div>
              {/* --- TAMBAHKAN KODE INPUT PENCARIAN INI --- */}
              <div className="filter-group search-group">
                <label>Cari ID Booking:</label>
                <input 
                  type="text" 
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  placeholder="Ketik ID booking..."
                />
              </div>
              {/* --- BATAS KODE BARU --- */}


            </div>

            {/* Bookings Table */}
            <div className="bookings-table">
              {getFilteredBookings().length === 0 ? (
                <div className="empty-state">📭 Tidak ada booking</div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nama</th>
                      <th>Kendaraan</th>
                      <th>Tanggal</th>
                      <th>Waktu</th>
                      <th>Telepon</th>
                      <th>Status</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredBookings().map(booking => (
                      <tr key={booking.id}>
                        <td>#{booking.id}</td>
                        <td>{booking.nama}</td>
                        <td>
                          <div className="vehicle-cell">
                            <span className="vehicle-type-badge">
                              {booking.jenisKendaraan}
                            </span>
                            <span>{booking.typeKendaraan}</span>
                          </div>
                        </td>
                        <td>{formatDate(booking.tanggal)}</td>
                        <td>{booking.waktu}</td>
                        <td>{booking.nomorTelepon}</td>
                        <td>{getStatusBadge(booking.status)}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-action detail"
                              onClick={() => setSelectedBooking(booking)}
                              title="Lihat Detail"
                            >
                              👁️
                            </button>
                            {booking.status === 'pending' && (
                              <button 
                                className="btn-action confirm"
                                onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                                title="Konfirmasi"
                              >
                                ✅
                              </button>
                            )}
                            {booking.status === 'confirmed' && (
                              <button 
                                className="btn-action complete"
                                onClick={() => updateBookingStatus(booking.id, 'completed')}
                                title="Selesai"
                              >
                                🏁
                              </button>
                            )}
                            {(booking.status === 'pending' || booking.status === 'confirmed') && (
                              <button 
                                className="btn-action cancel"
                                onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                title="Batalkan"
                              >
                                ❌
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;