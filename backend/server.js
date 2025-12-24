const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

