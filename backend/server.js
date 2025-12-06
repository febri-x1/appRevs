/* global process */
import express from 'express';
import mysql from 'mysql2/promise'; // Menggunakan versi promise agar bisa async/await
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load konfigurasi dari file .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Database Connection Pool ---
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test koneksi saat start
pool.getConnection()
  .then(conn => {
    console.log("✅ Berhasil terkoneksi ke Database MySQL!");
    conn.release();
  })
  .catch(err => {
    console.error("❌ Gagal koneksi ke Database:", err.message);
  });

// --- Helper: Generate Booking ID ---
const generateBookingId = async () => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = String(today.getFullYear()).slice(-2);
  const prefix = `${day}${month}${year}`;

  // Cari booking terakhir hari ini dari database
  // Kita cari ID yang berawalan prefix tanggal hari ini
  const [rows] = await pool.query(
    "SELECT id FROM bookings WHERE id LIKE ? ORDER BY id DESC LIMIT 1",
    [`${prefix}%`]
  );

  let nextSequence = '001';
  if (rows.length > 0) {
    const lastId = rows[0].id;
    const lastSequence = parseInt(lastId.slice(-3)); // Ambil 3 digit terakhir
    nextSequence = String(lastSequence + 1).padStart(3, '0');
  }

  return `${prefix}${nextSequence}`;
};

// --- Middleware Verifikasi Token ---
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token tidak ditemukan' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token tidak valid' });
  }
};

// ================= RUTE API =================

/**
 * Sign Up
 */
app.post('/api/signup', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Semua field wajib diisi' });
  }

  try {
    // Cek apakah email sudah ada
    const [existingUsers] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email sudah terdaftar' });
    }

    // Hash password & Buat ID
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = Date.now().toString(); // Tetap pakai timestamp string agar kompatibel dengan tabel

    // Insert ke MySQL
    await pool.query(
      "INSERT INTO users (id, username, email, password, role) VALUES (?, ?, ?, ?, ?)",
      [userId, username, email, hashedPassword, 'user']
    );

    res.status(201).json({ message: 'Registrasi berhasil!' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

/**
 * Login
 */
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    const user = users[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({ message: 'Login berhasil!', token });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

/**
 * Ganti Password
 */
app.post('/api/change-password', verifyToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  try {
    const [users] = await pool.query("SELECT * FROM users WHERE id = ?", [userId]);
    const user = users[0];

    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Password saat ini salah' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, userId]);

    res.json({ message: 'Password berhasil diubah' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengubah password' });
  }
});

/**
 * Buat Booking Baru
 */
app.post('/api/bookings', verifyToken, async (req, res) => {
  const { nama, nomorTelepon, email, jenisKendaraan, typeKendaraan, noPolisi, tanggal, waktu, catatan } = req.body;

  if (!nama || !nomorTelepon || !email || !jenisKendaraan || !typeKendaraan || !noPolisi || !tanggal || !waktu) {
    return res.status(400).json({ message: 'Semua field wajib diisi' });
  }

  try {
    const newBookingId = await generateBookingId();

    // Perhatikan mapping nama kolom: Frontend (camelCase) -> Database (snake_case)
    const sql = `
      INSERT INTO bookings 
      (id, user_id, nama, nomor_telepon, email, jenis_kendaraan, type_kendaraan, no_polisi, tanggal, waktu, catatan, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      newBookingId,
      req.user.id,
      nama,
      nomorTelepon,
      email,
      jenisKendaraan,
      typeKendaraan,
      noPolisi,
      tanggal,
      waktu,
      catatan || '',
      'pending'
    ];

    await pool.query(sql, values);

    res.status(201).json({ 
      message: 'Booking berhasil dibuat!',
      booking: { id: newBookingId, ...req.body, status: 'pending' } 
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Gagal membuat booking' });
  }
});

/**
 * Get Bookings User (History)
 */
app.get('/api/bookings/my-bookings', verifyToken, async (req, res) => {
  try {
    // Kita perlu mapping balik dari snake_case (DB) ke camelCase (Frontend)
    const [rows] = await pool.query(
      "SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC", 
      [req.user.id]
    );

    const formattedBookings = rows.map(b => ({
      id: b.id,
      userId: b.user_id,
      nama: b.nama,
      nomorTelepon: b.nomor_telepon,
      email: b.email,
      jenisKendaraan: b.jenis_kendaraan,
      typeKendaraan: b.type_kendaraan,
      noPolisi: b.no_polisi,
      tanggal: b.tanggal, // Format Date dari MySQL mungkin perlu diproses di frontend
      waktu: b.waktu,
      catatan: b.catatan,
      status: b.status,
      biaya: b.biaya,
      createdAt: b.created_at
    }));

    res.json({ bookings: formattedBookings });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil data' });
  }
});

/**
 * Get Semua Bookings (ADMIN)
 */
app.get('/api/bookings', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Akses ditolak' });
  }

  try {
    const [rows] = await pool.query("SELECT * FROM bookings ORDER BY created_at DESC");

    const formattedBookings = rows.map(b => ({
      id: b.id,
      userId: b.user_id,
      nama: b.nama,
      nomorTelepon: b.nomor_telepon,
      email: b.email,
      jenisKendaraan: b.jenis_kendaraan,
      typeKendaraan: b.type_kendaraan,
      noPolisi: b.no_polisi,
      tanggal: b.tanggal,
      waktu: b.waktu,
      catatan: b.catatan,
      status: b.status,
      biaya: b.biaya,
      createdAt: b.created_at
    }));

    res.json({ bookings: formattedBookings });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil data admin' });
  }
});

/**
 * Update Booking (ADMIN - All Fields)
 */
app.patch('/api/bookings/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { 
    status, tanggal, waktu, catatan, biaya,
    nama, nomorTelepon, email, jenisKendaraan, typeKendaraan, noPolisi 
  } = req.body;

  try {
    // Cek booking exist & permission
    const [rows] = await pool.query("SELECT * FROM bookings WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Booking tidak ditemukan' });
    
    const booking = rows[0];
    if (req.user.role !== 'admin' && booking.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Akses ditolak' });
    }

    // Bangun Query Dinamis
    let updates = [];
    let values = [];

    if (status) { updates.push("status = ?"); values.push(status); }
    if (tanggal) { updates.push("tanggal = ?"); values.push(tanggal); }
    if (waktu) { updates.push("waktu = ?"); values.push(waktu); }
    if (catatan !== undefined) { updates.push("catatan = ?"); values.push(catatan); }
    if(biaya !== undefined) {
      updates.push("biaya =?");
      values.push(biaya);
    }
    
    // Field data diri/kendaraan
    if (nama) { updates.push("nama = ?"); values.push(nama); }
    if (nomorTelepon) { updates.push("nomor_telepon = ?"); values.push(nomorTelepon); }
    if (email) { updates.push("email = ?"); values.push(email); }
    if (jenisKendaraan) { updates.push("jenis_kendaraan = ?"); values.push(jenisKendaraan); }
    if (typeKendaraan) { updates.push("type_kendaraan = ?"); values.push(typeKendaraan); }
    if (noPolisi) { updates.push("no_polisi = ?"); values.push(noPolisi); }

    if (updates.length === 0) return res.json({ message: 'Tidak ada perubahan' });

    values.push(id); // Untuk WHERE id = ?

    const sql = `UPDATE bookings SET ${updates.join(', ')} WHERE id = ?`;
    await pool.query(sql, values);

    res.json({ message: 'Booking berhasil diupdate' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal update booking' });
  }
});

/**
 * Cancel Booking (USER)
 */
app.patch('/api/bookings/:id/cancel', verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query("SELECT * FROM bookings WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Booking tidak ditemukan' });

    const booking = rows[0];
    if (booking.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Akses ditolak' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Hanya status pending yang bisa dibatalkan' });
    }

    await pool.query("UPDATE bookings SET status = 'cancelled' WHERE id = ?", [id]);
    res.json({ message: 'Booking berhasil dibatalkan' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal membatalkan booking' });
  }
});

/**
 * Get All Users (ADMIN ONLY)
 */
app.get('/api/users', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Akses ditolak' });
  }

  try {
    const [rows] = await pool.query("SELECT id, username, email, role FROM users");
    res.json({ users: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil data user' });
  }
});

// --- Jalankan Server ---
app.listen(PORT, () => {
  console.log(`🚀 Server backend berjalan di http://localhost:${PORT}`);
});