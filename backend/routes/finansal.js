const express = require('express');
const { readFile, writeFile, getNextId } = require('../utils/fileManager');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Tüm route'lar için authentication
router.use(authenticateToken);

// Tüm finansal işlemleri getir
router.get('/', (req, res) => {
  try {
    const finansalIslemler = readFile('finansal.json');
    res.json(finansalIslemler);
  } catch (error) {
    console.error('Error fetching finansal islemler:', error);
    res.status(500).json({ error: 'Finansal işlemler getirilirken bir hata oluştu' });
  }
});

// Tek bir finansal işlem getir
router.get('/:id', (req, res) => {
  try {
    const finansalIslemler = readFile('finansal.json');
    const islem = finansalIslemler.find(i => i.id === parseInt(req.params.id));

    if (!islem) {
      return res.status(404).json({ error: 'Finansal işlem bulunamadı' });
    }

    res.json(islem);
  } catch (error) {
    console.error('Error fetching finansal islem:', error);
    res.status(500).json({ error: 'Finansal işlem getirilirken bir hata oluştu' });
  }
});

// Yeni finansal işlem ekle
router.post('/', (req, res) => {
  try {
    const finansalIslemler = readFile('finansal.json');
    const newIslem = {
      id: getNextId(finansalIslemler),
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    finansalIslemler.push(newIslem);
    writeFile('finansal.json', finansalIslemler);

    res.status(201).json(newIslem);
  } catch (error) {
    console.error('Error creating finansal islem:', error);
    res.status(500).json({ error: 'Finansal işlem oluşturulurken bir hata oluştu' });
  }
});

// Finansal işlem güncelle
router.put('/:id', (req, res) => {
  try {
    const finansalIslemler = readFile('finansal.json');
    const index = finansalIslemler.findIndex(i => i.id === parseInt(req.params.id));

    if (index === -1) {
      return res.status(404).json({ error: 'Finansal işlem bulunamadı' });
    }

    finansalIslemler[index] = {
      ...finansalIslemler[index],
      ...req.body,
      id: parseInt(req.params.id),
      updatedAt: new Date().toISOString()
    };

    writeFile('finansal.json', finansalIslemler);
    res.json(finansalIslemler[index]);
  } catch (error) {
    console.error('Error updating finansal islem:', error);
    res.status(500).json({ error: 'Finansal işlem güncellenirken bir hata oluştu' });
  }
});

// Finansal işlem sil
router.delete('/:id', (req, res) => {
  try {
    const finansalIslemler = readFile('finansal.json');
    const filteredIslemler = finansalIslemler.filter(i => i.id !== parseInt(req.params.id));

    if (finansalIslemler.length === filteredIslemler.length) {
      return res.status(404).json({ error: 'Finansal işlem bulunamadı' });
    }

    writeFile('finansal.json', filteredIslemler);
    res.json({ message: 'Finansal işlem silindi' });
  } catch (error) {
    console.error('Error deleting finansal islem:', error);
    res.status(500).json({ error: 'Finansal işlem silinirken bir hata oluştu' });
  }
});

module.exports = router;

