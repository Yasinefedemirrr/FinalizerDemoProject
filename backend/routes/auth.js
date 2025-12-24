const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { readFile, writeFile, getNextId } = require('../utils/fileManager');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Kullanıcı adı ve şifre gereklidir' });
    }

    const users = readFile('users.json');

    // Varsayılan admin kullanıcı yoksa oluştur
    if (users.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const defaultUser = {
        id: 1,
        username: 'admin',
        password: hashedPassword,
        role: 'admin',
        name: 'Admin Kullanıcı'
      };
      writeFile('users.json', [defaultUser]);
      users.push(defaultUser);
    }

    const user = users.find(u => u.username === username);

    if (!user) {
      return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Giriş yapılırken bir hata oluştu' });
  }
});

// Register (opsiyonel)
router.post('/register', async (req, res) => {
  try {
    const { username, password, name, role = 'user' } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Kullanıcı adı ve şifre gereklidir' });
    }

    const users = readFile('users.json');
    const existingUser = users.find(u => u.username === username);

    if (existingUser) {
      return res.status(400).json({ error: 'Bu kullanıcı adı zaten kullanılıyor' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: getNextId(users),
      username,
      password: hashedPassword,
      role,
      name: name || username
    };

    users.push(newUser);
    writeFile('users.json', users);

    const token = jwt.sign(
      { id: newUser.id, username: newUser.username, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
        name: newUser.name
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Kayıt olurken bir hata oluştu' });
  }
});

module.exports = router;

