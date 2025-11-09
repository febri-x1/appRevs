import express from 'express';
import fs from 'fs';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = 3001;
const JWT_SECRET = 'rahasia-super-aman-kamu';

// --- Middleware ---
app.use(cors()); // PENTING: Aktifkan CORS
app.use(express.json());

// --- Database Helper Functions ---
const DB_FILE = './db.json';

const readDB = () => {
  try {
    const data = fs.readFileSync(DB_FILE);
    return JSON.parse(data);
  } catch (error) {
    return { users: [], bookings: [] };
  }
};

const writeDB = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
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
    console.error('Token verification error:', error);
    return res.status(403).json({ message: 'Token tidak valid' });
  }
};

// --- RUTE API ---

/**
 * Sign Up
 */
app.post('/api/signup', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Semua field wajib diisi' });
  }

  const db = readDB();

  const userExists = db.users.find((user) => user.email === email);
  if (userExists) {
    return res.status(400).json({ message: 'Email sudah terdaftar' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    id: Date.now().toString(),
    username,
    email,
    password: hashedPassword,
    role: 'user'
  };

  db.users.push(newUser);
  writeDB(db);

  console.log('✅ User baru terdaftar:', newUser.email);
  res.status(201).json({ message: 'Registrasi berhasil!' });
});

/**
 * Login
 */
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email dan password wajib diisi' });
  }

  const db = readDB();
  const user = db.users.find((user) => user.email === email);

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

  console.log('✅ User login berhasil:', user.email, 'Role:', user.role);
  res.status(200).json({ message: 'Login berhasil!', token });
});

/**
 * Buat Booking Baru
 */
app.post('/api/bookings', verifyToken, async (req, res) => {
  console.log('📥 Booking request received:', req.body);
  
  const { nama, nomorTelepon, email, jenisKendaraan, typeKendaraan, tanggal, waktu, catatan } = req.body;

  // Validasi input
  if (!nama || !nomorTelepon || !email || !jenisKendaraan || !typeKendaraan || !tanggal || !waktu) {
    return res.status(400).json({ 
      message: 'Semua field wajib diisi kecuali catatan',
      missingFields: {
        nama: !nama,
        nomorTelepon: !nomorTelepon,
        email: !email,
        jenisKendaraan: !jenisKendaraan,
        typeKendaraan: !typeKendaraan,
        tanggal: !tanggal,
        waktu: !waktu
      }
    });
  }

  const db = readDB();

  // Inisialisasi array bookings jika belum ada
  if (!db.bookings) {
    db.bookings = [];
  }

  const newBooking = {
    id: Date.now().toString(),
    userId: req.user.id,
    nama,
    nomorTelepon,
    email,
    jenisKendaraan,
    typeKendaraan,
    tanggal,
    waktu,
    catatan: catatan || '',
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  db.bookings.push(newBooking);
  writeDB(db);

  console.log('✅ Booking baru dibuat:', newBooking.id);
  res.status(201).json({ 
    message: 'Booking berhasil dibuat!',
    booking: newBooking 
  });
});

/**
 * Get Bookings User
 */
app.get('/api/bookings/my-bookings', verifyToken, (req, res) => {
  const db = readDB();
  
  if (!db.bookings) {
    return res.json({ bookings: [] });
  }

  const userBookings = db.bookings.filter(b => b.userId === req.user.id);
  
  res.json({ bookings: userBookings });
});

/**
 * Get Semua Bookings (ADMIN)
 */
app.get('/api/bookings', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Akses ditolak' });
  }

  const db = readDB();
  
  res.json({ bookings: db.bookings || [] });
});

/**
 * Update Status Booking (ADMIN)
 */
app.patch('/api/bookings/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const { status, tanggal, waktu, catatan } = req.body;

  const db = readDB();

  if (!db.bookings) {
    return res.status(404).json({ message: 'Booking tidak ditemukan' });
  }

  const bookingIndex = db.bookings.findIndex(b => b.id === id);

  if (bookingIndex === -1) {
    return res.status(404).json({ message: 'Booking tidak ditemukan' });
  }

  const booking = db.bookings[bookingIndex];

  // Cek kepemilikan untuk user biasa
  if (req.user.role !== 'admin' && booking.userId !== req.user.id) {
    return res.status(403).json({ message: 'Akses ditolak' });
  }

  // User hanya bisa edit jika status masih pending
  if (req.user.role !== 'admin' && booking.status !== 'pending') {
    return res.status(403).json({ 
      message: 'Tidak dapat mengubah booking yang sudah dikonfirmasi' 
    });
  }

  // Update fields
  if (status) booking.status = status;
  if (tanggal) booking.tanggal = tanggal;
  if (waktu) booking.waktu = waktu;
  if (catatan !== undefined) booking.catatan = catatan;
  
  booking.updatedAt = new Date().toISOString();
  
  db.bookings[bookingIndex] = booking;
  writeDB(db);

  console.log(`✅ Booking ${id} diupdate`);
  res.json({ 
    message: 'Booking berhasil diupdate',
    booking: booking
  });
});

/**
 * Cancel Booking (USER)
 */
app.patch('/api/bookings/:id/cancel', verifyToken, (req, res) => {
  const { id } = req.params;

  const db = readDB();

  if (!db.bookings) {
    return res.status(404).json({ message: 'Booking tidak ditemukan' });
  }

  const bookingIndex = db.bookings.findIndex(b => b.id === id);

  if (bookingIndex === -1) {
    return res.status(404).json({ message: 'Booking tidak ditemukan' });
  }

  const booking = db.bookings[bookingIndex];

  // Cek kepemilikan
  if (booking.userId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Akses ditolak' });
  }

  // Hanya bisa cancel jika status pending
  if (booking.status !== 'pending') {
    return res.status(400).json({ 
      message: 'Hanya booking dengan status pending yang bisa dibatalkan' 
    });
  }

  booking.status = 'cancelled';
  booking.updatedAt = new Date().toISOString();
  
  db.bookings[bookingIndex] = booking;
  writeDB(db);

  console.log(`✅ Booking ${id} dibatalkan`);
  res.json({ 
    message: 'Booking berhasil dibatalkan',
    booking: booking
  });
});

// --- Jalankan Server ---
app.listen(PORT, () => {
  console.log(`🚀 Server backend berjalan di http://localhost:${PORT}`);
});