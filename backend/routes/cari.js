const express = require('express');
const { readFile, writeFile, getNextId } = require('../utils/fileManager');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Tüm route'lar için authentication
router.use(authenticateToken);

// Tüm carileri getir
router.get('/', (req, res) => {
  try {
    const cariler = readFile('cariler.json');
    res.json(cariler);
  } catch (error) {
    console.error('Error fetching cariler:', error);
    res.status(500).json({ error: 'Cariler getirilirken bir hata oluştu' });
  }
});

// Tek bir cari getir
router.get('/:id', (req, res) => {
  try {
    const cariler = readFile('cariler.json');
    const cari = cariler.find(c => c.id === parseInt(req.params.id));

    if (!cari) {
      return res.status(404).json({ error: 'Cari bulunamadı' });
    }

    res.json(cari);
  } catch (error) {
    console.error('Error fetching cari:', error);
    res.status(500).json({ error: 'Cari getirilirken bir hata oluştu' });
  }
});

// Yeni cari ekle
router.post('/', (req, res) => {
  try {
    const cariler = readFile('cariler.json');
    const newCari = {
      id: getNextId(cariler),
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    cariler.push(newCari);
    writeFile('cariler.json', cariler);

    res.status(201).json(newCari);
  } catch (error) {
    console.error('Error creating cari:', error);
    res.status(500).json({ error: 'Cari oluşturulurken bir hata oluştu' });
  }
});

// Cari güncelle
router.put('/:id', (req, res) => {
  try {
    const cariler = readFile('cariler.json');
    const index = cariler.findIndex(c => c.id === parseInt(req.params.id));

    if (index === -1) {
      return res.status(404).json({ error: 'Cari bulunamadı' });
    }

    cariler[index] = {
      ...cariler[index],
      ...req.body,
      id: parseInt(req.params.id),
      updatedAt: new Date().toISOString()
    };

    writeFile('cariler.json', cariler);
    res.json(cariler[index]);
  } catch (error) {
    console.error('Error updating cari:', error);
    res.status(500).json({ error: 'Cari güncellenirken bir hata oluştu' });
  }
});

// Cari sil
router.delete('/:id', (req, res) => {
  try {
    const cariler = readFile('cariler.json');
    const filteredCariler = cariler.filter(c => c.id !== parseInt(req.params.id));

    if (cariler.length === filteredCariler.length) {
      return res.status(404).json({ error: 'Cari bulunamadı' });
    }

    writeFile('cariler.json', filteredCariler);
    res.json({ message: 'Cari silindi' });
  } catch (error) {
    console.error('Error deleting cari:', error);
    res.status(500).json({ error: 'Cari silinirken bir hata oluştu' });
  }
});

module.exports = router;

