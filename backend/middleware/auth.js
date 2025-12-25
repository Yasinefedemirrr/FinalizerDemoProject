const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'finalizer-erp-secret-key-2024';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('❌ Token bulunamadı - Path:', req.path);
    return res.status(401).json({ error: 'Token bulunamadı. Lütfen tekrar giriş yapın.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log('❌ Token geçersiz - Path:', req.path);
      console.log('Token hatası:', err.name, err.message);
      // Token geçersizse 401 döndür (unauthorized)
      return res.status(401).json({ error: 'Token geçersiz. Lütfen tekrar giriş yapın.' });
    }
    req.user = user;
    next();
  });
}

module.exports = { authenticateToken, JWT_SECRET };

