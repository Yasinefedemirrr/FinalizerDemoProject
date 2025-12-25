const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { getPool } = require('./utils/db');
const authRoutes = require('./routes/auth');
const cariRoutes = require('./routes/cari');
const faturaRoutes = require('./routes/fatura');
const finansalRoutes = require('./routes/finansal');
const raporlamaRoutes = require('./routes/raporlama');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cari', cariRoutes);
app.use('/api/fatura', faturaRoutes);
app.use('/api/finansal', finansalRoutes);
app.use('/api/raporlama', raporlamaRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Veritabanı bağlantısını başlat ve sunucuyu başlat
async function startServer() {
  try {
    await getPool();
    app.listen(PORT, () => {
      console.log(`\n✅ Server is running on port ${PORT}`);
      console.log(`✅ PostgreSQL bağlantısı aktif\n`);
    });
  } catch (error) {
    console.error('\n❌ Server başlatılamadı:', error.message);
    console.error('\nÇözüm önerileri:');
    console.error('1. PostgreSQL servisinin çalıştığından emin olun');
    console.error('2. Veritabanının oluşturulduğundan emin olun');
    console.error('3. Kullanıcı adı ve şifrenin doğru olduğundan emin olun');
    console.error('4. Port 5432\'nin açık olduğundan emin olun\n');
    process.exit(1);
  }
}

startServer();

