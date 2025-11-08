import bcrypt from 'bcrypt';

// Fungsi untuk hash password
async function hashPassword(plainPassword) {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
  return hashedPassword;
}

// Ambil password dari command line argument
const password = process.argv[2];

if (!password) {
  console.log('❌ Cara pakai: node hashPassword.js [password_anda]');
  console.log('📌 Contoh: node hashPassword.js admin123');
  process.exit(1);
}

// Hash dan tampilkan
hashPassword(password).then(hashed => {
  console.log('\n✅ Password berhasil di-hash!\n');
  console.log('📋 Password asli  :', password);
  console.log('🔐 Password hash  :', hashed);
  console.log('\n📝 Copy hash di atas ke db.json\n');
});