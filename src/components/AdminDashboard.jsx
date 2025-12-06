import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Logout from './Logout';
import ThemeToggle from './ThemeToggle';
import ChangePassword from './ChangePassword';
import formatRupiah from './FormatRupiah';
import '../style/admin.css';
import '../style/booking.css';

// --- KOMPONEN UTAMA DASHBOARD ---
function AdminDashboard() {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  // State untuk Form
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // ✅ STATE UNTUK COST MODAL
  const [showCostModal, setShowCostModal] = useState(false); 
  const [selectedBookingForCost, setSelectedBookingForCost] = useState(null); 
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form Data
  const initialFormState = {
    nama: '', nomorTelepon: '', email: '', jenisKendaraan: '',
    typeKendaraan: '', noPolisi: '', tanggal: '', waktu: '', catatan: '', biaya: 0
  };
  const [formData, setFormData] = useState(initialFormState);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [stats, setStats] = useState({
    totalBookings: 0, pendingBookings: 0, confirmedBookings: 0, completedBookings: 0,
    cancelledBookings: 0, totalUsers: 0, todayBookings: 0, thisWeekBookings: 0, thisMonthBookings: 0
  });

  // ✅ STATE REVENUE
  const [setRevenue] = useState({
    todayRevenue: 0,
    weekRevenue: 0,
    monthRevenue: 0,
    totalRevenue: 0,
    completedBookings: 0
  });
  
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [searchId, setSearchId] = useState('');

  const token = sessionStorage.getItem('authToken');
  let username = 'Admin';
  if (token) {
    try {
      const decoded = jwtDecode(token);
      username = decoded.username || decoded.email;
    } catch (error) { console.error(error); }
  }

  // ✅ UPDATED USE EFFECT
  useEffect(() => {
    fetchData();
    fetchRevenue(); // Fetch statistics
  }, []);

  useEffect(() => { calculateStats(); }, [bookings, users]);

  

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const bookingsRes = await fetch('http://localhost:3001/api/bookings', { headers: { 'Authorization': `Bearer ${token}` } });
      const bookingsData = await bookingsRes.json();
      const usersRes = await fetch('http://localhost:3001/api/users', { headers: { 'Authorization': `Bearer ${token}` } });
      const usersData = await usersRes.json();
      setBookings(bookingsData.bookings || []);
      setUsers(usersData.users || []);
    // eslint-disable-next-line no-unused-vars
    } catch (error) { alert('❌ Gagal memuat data'); } finally { setIsLoading(false); }
  };

  // ✅ FUNCTION FETCH REVENUE
  const fetchRevenue = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/statistics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setRevenue(data);
    } catch (error) {
      console.error('Error fetching revenue:', error);
    }
  };

 const calculateStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const thisWeek = getWeekStart(); // Pastikan fungsi getWeekStart() sudah ada di file Anda
    const thisMonth = new Date().toISOString().slice(0, 7);

    // Filter hanya booking yang statusnya 'completed' (Selesai) untuk menghitung duit
    const completedBookings = bookings.filter(b => b.status === 'completed');

    // Helper untuk menjumlahkan biaya
    const sumRevenue = (data) => data.reduce((acc, curr) => acc + (Number(curr.biaya) || 0), 0);

    setStats({
      // -- Stats Jumlah Booking (Logika Lama) --
      totalBookings: bookings.length,
      pendingBookings: bookings.filter(b => b.status === 'pending').length,
      confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
      completedBookings: bookings.filter(b => b.status === 'completed').length,
      cancelledBookings: bookings.filter(b => b.status === 'cancelled').length,
      totalUsers: users.length,
      todayBookings: bookings.filter(b => b.tanggal === today).length,
      thisWeekBookings: bookings.filter(b => b.tanggal >= thisWeek).length,
      thisMonthBookings: bookings.filter(b => b.tanggal.startsWith(thisMonth)).length,

      // -- Stats Pendapatan (Logika Baru) --
      // Hitung dari array completedBookings
      todayRevenue: sumRevenue(completedBookings.filter(b => b.tanggal === today)),
      weekRevenue: sumRevenue(completedBookings.filter(b => b.tanggal >= thisWeek)),
      monthRevenue: sumRevenue(completedBookings.filter(b => b.tanggal.startsWith(thisMonth))),
      totalRevenue: sumRevenue(completedBookings) 
    });
  };

  const getWeekStart = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    return new Date(now.setDate(diff)).toISOString().split('T')[0];
  };

  const handleFormChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddBooking = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:3001/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      if (!response.ok) throw new Error('Gagal membuat booking');
      alert('✅ Booking berhasil dibuat!');
      setFormData(initialFormState);
      setShowAddModal(false);
      fetchData();
    } catch (error) { alert('❌ ' + error.message); } finally { setIsSubmitting(false); }
  };

  // Cari fungsi ini di dalam AdminDashboard.jsx
  const openEditModal = (booking) => {
    setEditingId(booking.id);
    
    // --- PERBAIKAN FORMAT TANGGAL DI SINI ---
    // Kita pastikan tanggal dikonversi menjadi format YYYY-MM-DD
    let formattedDate = '';
    if (booking.tanggal) {
      formattedDate = new Date(booking.tanggal).toISOString().split('T')[0];
    }
    // ----------------------------------------

    setFormData({
      nama: booking.nama,
      nomorTelepon: booking.nomorTelepon,
      email: booking.email,
      jenisKendaraan: booking.jenisKendaraan,
      typeKendaraan: booking.typeKendaraan,
      noPolisi: booking.noPolisi || '',
      
      tanggal: formattedDate, // <--- Gunakan variabel yang sudah diformat
      
      waktu: booking.waktu,
      catatan: booking.catatan || '',
      biaya: booking.biaya || 0
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`http://localhost:3001/api/bookings/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      if (!response.ok) throw new Error('Gagal mengupdate booking');
      alert('✅ Perubahan berhasil disimpan!');
      setFormData(initialFormState);
      setEditingId(null);
      setShowEditModal(false);
      fetchData();
    } catch (error) { alert('❌ ' + error.message); } finally { setIsSubmitting(false); }
  };

  // ✅ UPDATE STATUS HANDLER
  const updateBookingStatus = async (bookingId, newStatus) => {
    // Jika status completed, buka modal biaya
    if (newStatus === 'completed') {
      const booking = bookings.find(b => b.id === bookingId);
      if (booking) {
        setSelectedBookingForCost(booking);
        setShowCostModal(true);
      }
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) throw new Error();
      alert('✅ Status berhasil diubah!');
      fetchData();
      fetchRevenue(); // Refresh revenue
    } catch(error) { alert('❌ Gagal mengubah status'); }
  };

  // ✅ SUBMIT BIAYA HANDLER
  async function handleSubmitCost(bookingId, biaya, newStatus) {
    setIsSubmitting(true);
    try {
      const response = await fetch(`http://localhost:3001/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus, biaya: biaya })
      });
      if (!response.ok) throw new Error();
      alert('✅ Biaya berhasil disimpan dan booking selesai!');
      setShowCostModal(false);
      setSelectedBookingForCost(null);
      fetchData();
      fetchRevenue(); // Refresh revenue
    } catch (error) {
      alert('❌ Gagal menyimpan biaya');
    } finally {
      setIsSubmitting(false);
    }
  }

  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

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

  const getFilteredBookings = () => {
    let filtered = [...bookings];
    if (searchId.trim()) filtered = filtered.filter(b => b.id.includes(searchId.trim()));
    if (filterStatus !== 'all') filtered = filtered.filter(b => b.status === filterStatus);
    
    const today = new Date().toISOString().split('T')[0];
    const thisWeek = getWeekStart();
    const thisMonth = new Date().toISOString().slice(0, 7);

    if (filterDate === 'today') filtered = filtered.filter(b => b.tanggal === today);
    else if (filterDate === 'week') filtered = filtered.filter(b => b.tanggal >= thisWeek);
    else if (filterDate === 'month') filtered = filtered.filter(b => b.tanggal.startsWith(thisMonth));
    
    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const handleLogout = () => setShowLogoutModal(true);
  const confirmLogout = () => { localStorage.removeItem('authToken'); navigate('/login'); };

  return (
    <div className="admin-container">
      <Logout isOpen={showLogoutModal} onConfirm={confirmLogout} onCancel={() => setShowLogoutModal(false)} userType="admin" />
      <ChangePassword isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} />
      <BookingDetailModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} getStatusBadge={getStatusBadge} formatDate={formatDate} />

      <BookingFormModal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setFormData(initialFormState); }}
        title="➕ Buat Booking Baru"
        formData={formData}
        onChange={handleFormChange}
        onSubmit={handleAddBooking}
        isSubmitting={isSubmitting}
        submitLabel="Simpan Booking"
      />

      <BookingFormModal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setFormData(initialFormState); setEditingId(null); }}
        title="✏️ Edit Booking"
        formData={formData}
        onChange={handleFormChange}
        onSubmit={handleEditSubmit}
        isSubmitting={isSubmitting}
        submitLabel="Simpan Perubahan"
      />

      {/* ✅ RENDER COST MODAL */}
      <CostInputModal
        isOpen={showCostModal}
        booking={selectedBookingForCost}
        onClose={() => {
          setShowCostModal(false);
          setSelectedBookingForCost(null);
        }}
        onSubmit={handleSubmitCost}
        isSubmitting={isSubmitting}
      />

      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>🛡️ Admin Panel</h2>
          <p>{username}</p>
        </div>
        <nav className="sidebar-nav">
          <button type="button" className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>📊 Dashboard</button>
          <button type="button" className={`nav-item ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>📋 Kelola Booking</button>
          <button type="button" className="nav-item" onClick={() => setShowPasswordModal(true)}>🔐 Ganti Password</button>
          <button type="button" className="nav-item" onClick={handleLogout}>🚪 Logout</button>
        </nav>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <h1>{activeTab === 'dashboard' ? '📊 Dashboard Analytics' : '📋 Kelola Booking'}</h1>
          <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
             <button type="button" onClick={() => {fetchData(); fetchRevenue();}} className="btn-refresh">🔄 Refresh Data</button>
             <ThemeToggle/>
          </div>
        </header>

        {isLoading ? <div className="loading">⏳ Memuat data...</div> : activeTab === 'dashboard' ? (
          <div className="dashboard-content">
            <div className="stats-grid">
              <div className="stat-card primary"><div className="stat-icon">📦</div><div className="stat-info"><h3>{stats.totalBookings}</h3><p>Total Booking</p></div></div>
              <div className="stat-card warning"><div className="stat-icon">⏳</div><div className="stat-info"><h3>{stats.pendingBookings}</h3><p>Menunggu</p></div></div>
              <div className="stat-card success"><div className="stat-icon">✅</div><div className="stat-info"><h3>{stats.confirmedBookings}</h3><p>Dikonfirmasi</p></div></div>
              <div className="stat-card info"><div className="stat-icon">🏁</div><div className="stat-info"><h3>{stats.completedBookings}</h3><p>Selesai</p></div></div>
              <div className="stat-card danger"><div className="stat-icon">❌</div><div className="stat-info"><h3>{stats.cancelledBookings}</h3><p>Dibatalkan</p></div></div>
              <div className="stat-card dark"><div className="stat-icon">👥</div><div className="stat-info"><h3>{stats.totalUsers}</h3><p>Pengguna</p></div></div>
              
              {/* ✅ REVENUE CARD */}
              <div className="stat-card" style={{background: 'linear-gradient(135deg, #28a745 0%, #1e7e34 100%)', border: 'none', color: 'white'}}>
                <div className="stat-icon">💰</div>
                <div className="stat-info">
                  <h3 style={{color: 'white'}}>{formatRupiah(stats.todayRevenue)}</h3>
                  <p style={{color: '#d4edda'}}>Pendapatan Hari Ini</p>
                </div>
              </div>
            </div>

            {/* ✅ PERIOD STATS - REVENUE */}
            <div className="period-stats">
              <div className="period-card"><h3>📅 Hari Ini</h3><p className="period-value">{formatRupiah(stats.todayRevenue)}</p><p className="period-label">Pendapatan</p></div>
              <div className="period-card"><h3>📆 Minggu Ini</h3><p className="period-value">{formatRupiah(stats.weekRevenue)}</p><p className="period-label">Pendapatan</p></div>
              <div className="period-card"><h3>📊 Bulan Ini</h3><p className="period-value">{formatRupiah(stats.monthRevenue)}</p><p className="period-label">Pendapatan</p></div>
              <div className="period-card" style={{background: 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)'}}><h3>💵 Total</h3><p className="period-value">{formatRupiah(stats.totalRevenue)}</p><p className="period-label">Semua Waktu</p></div>
            </div>

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
                {bookings.length === 0 && <p style={{color: '#888', textAlign: 'center'}}>Belum ada data booking.</p>}
              </div>
            </div>
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
                        <div className="vehicle-progress" style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="bookings-content">
            <div className="filters">
               <div className="filter-group" style={{justifyContent: 'flex-end', width: '100%', marginBottom: '10px'}}>
                  <button type="button" onClick={() => { setFormData(initialFormState); setShowAddModal(true); }} className="btn-submit" style={{width: 'auto', padding: '0.6rem 1.2rem'}}>➕ Buat Booking Baru</button>
               </div>
              <div className="filter-group"><label>Status:</label><select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}><option value="all">Semua Status</option><option value="pending">Menunggu</option><option value="confirmed">Dikonfirmasi</option><option value="completed">Selesai</option><option value="cancelled">Dibatalkan</option></select></div>
              <div className="filter-group"><label>Periode:</label><select value={filterDate} onChange={(e) => setFilterDate(e.target.value)}><option value="all">Semua Waktu</option><option value="today">Hari Ini</option><option value="week">Minggu Ini</option><option value="month">Bulan Ini</option></select></div>
              <div className="filter-group search-group"><label>Cari ID:</label><input type="text" value={searchId} onChange={(e) => setSearchId(e.target.value)} placeholder="ID Booking..." /></div>
            </div>

            <div className="bookings-table">
              {getFilteredBookings().length === 0 ? <div className="empty-state">📭 Tidak ada booking</div> : (
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nama</th>
                      <th>Kendaraan</th>
                      <th>Tanggal</th>
                      <th>Waktu</th>
                      <th>Telepon</th>
                      <th>Biaya</th>
                      <th>Status</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredBookings().map(booking => (
                      <tr key={booking.id}>
                        <td>#{booking.id}</td>
                        <td>{booking.nama}</td>
                        <td><div className="vehicle-cell"><span className="vehicle-type-badge">{booking.jenisKendaraan}</span><span>{booking.typeKendaraan}</span></div></td>
                        <td>{formatDate(booking.tanggal)}</td>
                        <td>{booking.waktu}</td>
                        <td>{booking.nomorTelepon}</td>
                        <td style={{fontWeight: 'bold', color: booking.biaya ? '#28a745' : '#888'}}>
                          {booking.biaya ? formatRupiah(booking.biaya) : '-'}
                        </td>
                        <td>{getStatusBadge(booking.status)}</td>
                        <td>
                          <div className="action-buttons">
                            <button type="button" className="btn-action detail" onClick={() => setSelectedBooking(booking)} title="Detail">👁️</button>
                            {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                              <button type="button" className="btn-action edit" onClick={() => openEditModal(booking)} title="Edit">✏️</button>
                            )}
                            {booking.status === 'pending' && <button type="button" className="btn-action confirm" onClick={() => updateBookingStatus(booking.id, 'confirmed')} title="Konfirmasi">✅</button>}
                            
                            {/* TOMBOL COMPLETED DIUBAH */}
                            {booking.status === 'confirmed' && (
                              <button 
                                type="button" 
                                className="btn-action complete" 
                                onClick={() => updateBookingStatus(booking.id, 'completed')} 
                                title="Input Biaya & Selesaikan"
                              >
                                💰
                              </button>
                            )}
                            
                            {(booking.status === 'pending' || booking.status === 'confirmed') && <button type="button" className="btn-action cancel" onClick={() => updateBookingStatus(booking.id, 'cancelled')} title="Batalkan">❌</button>}
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

// --- 1. KOMPONEN MODAL DETAIL ---
const BookingDetailModal = ({ booking, onClose, getStatusBadge, formatDate }) => {
  if (!booking) return null;
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Detail Booking #{booking.id}</h3>
          {getStatusBadge(booking.status)}
          <button type="button" className="modal-close" onClick={onClose}>&times;</button>
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
            
            TAMPILKAN BIAYA JIKA ADA
            {booking.biaya && (
              <div className="detail-item full-width" style={{marginTop: '10px'}}>
                <span style={{color: '#28a745', fontSize: '1rem'}}>💰 Total Biaya Service</span>
                <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745', background: '#e6fffa', border: '1px solid #28a745'}}>
                  {formatRupiah(booking.biaya)}
                </p>
              </div>
            )}

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

// --- 2. KOMPONEN MODAL INPUT BIAYA (CostInputModal) ---
const CostInputModal = ({ isOpen, booking, onClose, onSubmit, isSubmitting }) => {
  const [biaya, setBiaya] = useState('');

  if (!isOpen || !booking) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!biaya) {
      alert("Harap masukkan total biaya service!");
      return;
    }
    // Kirim status 'completed' bersama biaya
    onSubmit(booking.id, biaya, 'completed');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content detail-modal" onClick={(e) => e.stopPropagation()} style={{maxWidth: '500px'}}>
        <div className="modal-header" style={{borderBottom: '2px solid #28a745'}}>
          <h3 style={{color: '#28a745'}}>🏁 Selesaikan Service</h3>
          <button type="button" className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <p style={{marginBottom: '20px', color: '#666'}}>
            Anda akan menyelesaikan service untuk kendaraan <strong>{booking.typeKendaraan}</strong> milik <strong>{booking.nama}</strong>.
            <br/>Silakan input total biaya pengerjaan di bawah ini.
          </p>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group full-width">
              <label style={{fontSize: '1.1rem', color: '#333'}}>Total Biaya (Rp)</label>
              <input 
                type="number" 
                value={biaya} 
                onChange={(e) => setBiaya(e.target.value)} 
                placeholder="Contoh: 150000" 
                required 
                style={{fontSize: '1.2rem', padding: '10px', border: '2px solid #28a745'}}
                autoFocus
              />
            </div>
            
            <div className="form-actions" style={{justifyContent: 'flex-end', marginTop: '20px'}}>
               <button 
                 type="button" 
                 onClick={onClose} 
                 className="btn-cancel"
                 style={{marginRight: '10px', background: '#ccc', color: '#333'}}
               >
                 Batal
               </button>
               <button 
                 type="submit" 
                 className="btn-submit" 
                 disabled={isSubmitting}
                 style={{background: '#28a745'}}
               >
                {isSubmitting ? 'Menyimpan...' : 'Selesai & Simpan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// --- 3. KOMPONEN MODAL FORM (ADD/EDIT) ---
const BookingFormModal = ({ isOpen, onClose, title, formData, onChange, onSubmit, isSubmitting, submitLabel }) => {
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;
  const today = new Date().toISOString().split('T')[0];

  const validate = () => {
    let newErrors = {};
    let isValid = true;

    const phoneRegex = /^[0-9]+$/;
    if (!formData.nomorTelepon) {
      newErrors.nomorTelepon = 'Telepon wajib diisi';
      isValid = false;
    } else if (!phoneRegex.test(formData.nomorTelepon)) {
      newErrors.nomorTelepon = 'Hanya boleh berisi angka';
      isValid = false;
    } else if (formData.nomorTelepon.length < 10 || formData.nomorTelepon.length > 13) {
      newErrors.nomorTelepon = 'Nomor telepon harus 10-13 digit';
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email wajib diisi';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(e);
      setErrors({});
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content detail-modal" onClick={(e) => e.stopPropagation()} style={{maxWidth: '600px'}}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button type="button" className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit} className="booking-form">
            <div className="form-row">
              <div className="form-group full-width">
                <label>Nama Pelanggan <span className="required">*</span></label>
                <input type="text" name="nama" value={formData.nama} onChange={onChange} required placeholder="Nama Lengkap" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Telepon <span className="required">*</span></label>
                <input 
                  type="tel" name="nomorTelepon" value={formData.nomorTelepon} onChange={onChange} required placeholder="08..." 
                  style={errors.nomorTelepon ? {borderColor: '#dc3545'} : {}}
                />
                {errors.nomorTelepon && <small style={{color: '#dc3545'}}>{errors.nomorTelepon}</small>}
              </div>
              <div className="form-group">
                <label>Email <span className="required">*</span></label>
                <input 
                  type="email" name="email" value={formData.email} onChange={onChange} required placeholder="email@contoh.com" 
                  style={errors.email ? {borderColor: '#dc3545'} : {}}
                />
                {errors.email && <small style={{color: '#dc3545'}}>{errors.email}</small>}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Jenis Kendaraan <span className="required">*</span></label>
                <select name="jenisKendaraan" value={formData.jenisKendaraan} onChange={onChange} required>
                  <option value="">Pilih Jenis</option>
                  <option value="matic">Matic</option>
                  <option value="bebek">Bebek</option>
                  <option value="sport">Sport</option>
                </select>
              </div>
              <div className="form-group">
                <label>No. Plat <span className="required">*</span></label>
                <input type="text" name="noPolisi" value={formData.noPolisi} onChange={onChange} required placeholder="B 1234 XY" />
              </div>
            </div>
            <div className="form-group full-width">
              <label>Tipe Kendaraan <span className="required">*</span></label>
              <input type="text" name="typeKendaraan" value={formData.typeKendaraan} onChange={onChange} required placeholder="Contoh: Vario 150" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Tanggal <span className="required">*</span></label>
                <input type="date" name="tanggal" value={formData.tanggal} onChange={onChange} min={today} required />
              </div>
              <div className="form-group">
                <label>Waktu <span className="required">*</span></label>
                <select name="waktu" value={formData.waktu} onChange={onChange} required>
                  <option value="">Pilih Jam</option>
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
              <textarea name="catatan" value={formData.catatan} onChange={onChange} rows="2" placeholder="Keluhan..."></textarea>
            </div>
            <div className="form-group full-width">
              <label>Biaya service (Rp)</label>
               <input 
               type="text"
               name="biaya"
               value={formData.biaya}
               onChange={onChange}
               placeholder="contoh 50000"
               min="0" />

            </div>
            <div className="form-actions" style={{justifyContent: 'flex-end'}}>
               <button type="submit" className="btn-submit" disabled={isSubmitting}>
                {isSubmitting ? 'Menyimpan...' : submitLabel}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
