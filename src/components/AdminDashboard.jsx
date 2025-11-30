import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Logout from './Logout';
import ThemeToggle from './ThemeToggle';
import ChangePassword from './ChangePassword';
import '../style/admin.css';
import '../style/booking.css';

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

// --- 2. KOMPONEN MODAL FORM (Bisa dipakai untuk Add & Edit) ---
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

// --- KOMPONEN UTAMA DASHBOARD ---
function AdminDashboard() {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  // State untuk Form (Add & Edit)
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false); // New: Modal Edit
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State Editing
  const [editingId, setEditingId] = useState(null);

  // Form Data (Digunakan untuk Add & Edit)
  const initialFormState = {
    nama: '', nomorTelepon: '', email: '', jenisKendaraan: '',
    typeKendaraan: '', noPolisi: '', tanggal: '', waktu: '', catatan: ''
  };
  const [formData, setFormData] = useState(initialFormState);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Stats & Filter
  const [stats, setStats] = useState({
    totalBookings: 0, pendingBookings: 0, confirmedBookings: 0, completedBookings: 0,
    cancelledBookings: 0, totalUsers: 0, todayBookings: 0, thisWeekBookings: 0, thisMonthBookings: 0
  });
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
    } catch (error) { console.error(error); }
  }

  useEffect(() => { fetchData(); }, []);
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
    } catch (error) { alert('❌ Gagal memuat data'); } finally { setIsLoading(false); }
  };

  const calculateStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const thisWeek = getWeekStart();
    const thisMonth = new Date().toISOString().slice(0, 7);
    setStats({
      totalBookings: bookings.length,
      pendingBookings: bookings.filter(b => b.status === 'pending').length,
      confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
      completedBookings: bookings.filter(b => b.status === 'completed').length,
      cancelledBookings: bookings.filter(b => b.status === 'cancelled').length,
      totalUsers: users.length,
      todayBookings: bookings.filter(b => b.tanggal === today).length,
      thisWeekBookings: bookings.filter(b => b.tanggal >= thisWeek).length,
      thisMonthBookings: bookings.filter(b => b.tanggal.startsWith(thisMonth)).length
    });
  };

  const getWeekStart = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    return new Date(now.setDate(diff)).toISOString().split('T')[0];
  };

  // --- Handlers Form ---
  const handleFormChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // 1. Handle ADD Booking
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

  // 2. Handle OPEN EDIT Modal
  const openEditModal = (booking) => {
    setEditingId(booking.id);
    setFormData({
      nama: booking.nama,
      nomorTelepon: booking.nomorTelepon,
      email: booking.email,
      jenisKendaraan: booking.jenisKendaraan,
      typeKendaraan: booking.typeKendaraan,
      noPolisi: booking.noPolisi || '',
      tanggal: booking.tanggal,
      waktu: booking.waktu,
      catatan: booking.catatan || ''
    });
    setShowEditModal(true);
  };

  // 3. Handle SUBMIT EDIT
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

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:3001/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) throw new Error();
      alert('✅ Status berhasil diubah!');
      fetchData();
    } catch (error) { alert('❌ Gagal mengubah status'); }
  };

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

      {/* Modal Add */}
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

      {/* Modal Edit */}
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
             <button type="button" onClick={fetchData} className="btn-refresh">🔄 Refresh Data</button>
             <ThemeToggle/>
          </div>
        </header>

        {isLoading ? (
          <div className="loading">⏳ Memuat data...</div>
        ) : activeTab === 'dashboard' ? (
          // TAB DASHBOARD
          <div className="dashboard-content">
            {/* 1. Kartu Statistik Utama */}
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
                  <p>Pengguna</p>
                </div>
              </div>
            </div>

            {/* 2. Statistik Periode (Hari/Minggu/Bulan) */}
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

            {/* 3. BAGIAN INI YANG HILANG SEBELUMNYA: Booking Terbaru */}
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

            {/* 4. BAGIAN INI YANG HILANG SEBELUMNYA: Grafik Jenis Kendaraan */}
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
        ) :  (
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
                    <tr><th>ID</th><th>Nama</th><th>Kendaraan</th><th>Tanggal</th><th>Waktu</th><th>Telepon</th><th>Status</th><th>Aksi</th></tr>
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
                        <td>{getStatusBadge(booking.status)}</td>
                        <td>
                          <div className="action-buttons">

                            <button type="button" className="btn-action detail" onClick={() => setSelectedBooking(booking)} title="Detail">👁️</button>
                            {/* Tombol Edit Baru */}
                            <button type="button" className="btn-action edit" onClick={() => openEditModal(booking)} title="Edit">✏️</button>
                            
                            {booking.status === 'pending' && <button type="button" className="btn-action confirm" onClick={() => updateBookingStatus(booking.id, 'confirmed')} title="Konfirmasi">✅</button>}
                            {booking.status === 'confirmed' && <button type="button" className="btn-action complete" onClick={() => updateBookingStatus(booking.id, 'completed')} title="Selesai">🏁</button>}
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