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

// --- Jalankan Server ---
app.listen(PORT, () => {
  console.log(`🚀 Server backend berjalan di http://localhost:${PORT}`);
});