import express from 'express';
import fs from 'fs';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = 3001; // Kita gunakan port 3001 (React di 5173)
const JWT_SECRET = 'rahasia-super-aman-kamu'; // Ganti ini dengan kunci rahasia Anda

// --- Middleware ---
app.use(cors()); // Mengizinkan koneksi dari frontend React
app.use(express.json()); // Membaca body request sebagai JSON

// --- Database (Helper Functions) ---
const DB_FILE = './db.json';

const readDB = () => {
  try {
    const data = fs.readFileSync(DB_FILE);
    return JSON.parse(data);
  } catch (error) {
    // Jika file tidak ada, buat struktur awal
    return { users: [] };
  }
};

const writeDB = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// --- Rute API (Endpoints) ---

/**
 * Endpoint: Sign Up (Registrasi)
 * Mencocokkan: src/components/signup.jsx
 */
app.post('/api/signup', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Semua field wajib diisi' });
  }

  const db = readDB();

  // Cek jika email sudah terdaftar
  const userExists = db.users.find((user) => user.email === email);
  if (userExists) {
    return res.status(400).json({ message: 'Email sudah terdaftar' });
  }

  // Hash password sebelum disimpan
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    id: Date.now().toString(), // ID unik sederhana
    username,
    email,
    password: hashedPassword,
    role: 'user'
  };

  db.users.push(newUser);
  writeDB(db);

  console.log('User baru terdaftar:', newUser.email);
  res.status(201).json({ message: 'Registrasi berhasil!' });
});

/**
 * Endpoint: Login
 * Mencocokkan: src/components/login.jsx
 */
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email dan password wajib diisi' });
  }

  const db = readDB();
  const user = db.users.find((user) => user.email === email);

  // Jika user tidak ditemukan ATAU password salah
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Email atau password salah' });
  }

  // Jika berhasil, buat JSON Web Token (JWT)
  const token = jwt.sign(
    {    
         id: user.id,
         email: user.email, 
         username: user.username,
         role: user.role,
     },
    JWT_SECRET,
    { expiresIn: '1h' } // Token berlaku 1 jam
  );

  console.log('User login berhasil:', user.email, 'Role', user.role);
  res.status(200).json({ message: 'Login berhasil!', token });
});

// Tambahkan ini di backend/server.js setelah endpoint login

/**
 * Middleware untuk verifikasi JWT
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Token tidak ditemukan' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Simpan data user ke request
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token tidak valid' });
  }
};

/**
 * Endpoint: Buat Booking Baru
 */
app.post('/api/bookings', verifyToken, async (req, res) => {
  const { nama, nomorTelepon, email, jenisKendaraan, typeKendaraan, tanggal, waktu, catatan } = req.body;

  // Validasi input
  if (!nama || !nomorTelepon || !email || !jenisKendaraan || !typeKendaraan || !tanggal || !waktu) {
    return res.status(400).json({ message: 'Semua field wajib diisi kecuali catatan' });
  }

  const db = readDB();

  // Inisialisasi array bookings jika belum ada
  if (!db.bookings) {
    db.bookings = [];
  }

  const newBooking = {
    id: Date.now().toString(),
    userId: req.user.id, // Dari token JWT
    nama,
    nomorTelepon,
    email,
    jenisKendaraan,
    typeKendaraan,
    tanggal,
    waktu,
    catatan: catatan || '',
    status: 'pending', // pending, confirmed, completed, cancelled
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
 * Endpoint: Get Semua Bookings User
 */
app.get('/api/bookings/my-bookings', verifyToken, (req, res) => {
  const db = readDB();
  
  if (!db.bookings) {
    return res.json({ bookings: [] });
  }

  // Filter booking berdasarkan userId
  const userBookings = db.bookings.filter(b => b.userId === req.user.id);
  
  res.json({ bookings: userBookings });
});

/**
 * Endpoint: Get Semua Bookings (ADMIN ONLY)
 */
app.get('/api/bookings', verifyToken, (req, res) => {
  // Cek apakah user adalah admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Akses ditolak. Hanya admin yang bisa melihat semua booking.' });
  }

  const db = readDB();
  
  if (!db.bookings) {
    return res.json({ bookings: [] });
  }

  res.json({ bookings: db.bookings });
});

/**
 * Endpoint: Update Status Booking (ADMIN ONLY)
 */
app.patch('/api/bookings/:id', verifyToken, (req, res) => {
  // Cek apakah user adalah admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Akses ditolak. Hanya admin yang bisa update booking.' });
  }

  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Status harus diisi' });
  }

  const db = readDB();

  if (!db.bookings) {
    return res.status(404).json({ message: 'Booking tidak ditemukan' });
  }

  const bookingIndex = db.bookings.findIndex(b => b.id === id);

  if (bookingIndex === -1) {
    return res.status(404).json({ message: 'Booking tidak ditemukan' });
  }

  db.bookings[bookingIndex].status = status;
  db.bookings[bookingIndex].updatedAt = new Date().toISOString();
  
  writeDB(db);

  console.log(`✅ Status booking ${id} diupdate menjadi: ${status}`);
  res.json({ 
    message: 'Status booking berhasil diupdate',
    booking: db.bookings[bookingIndex]
  });
});

// --- Jalankan Server ---
app.listen(PORT, () => {
  console.log(`🚀 Server backend berjalan di http://localhost:${PORT}`);
});