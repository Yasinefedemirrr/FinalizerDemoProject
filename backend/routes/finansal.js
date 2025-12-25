const express = require('express');
const { Finansal } = require('../utils/dbManager');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Tüm route'lar için authentication
router.use(authenticateToken);

// Tüm finansal işlemleri getir
router.get('/', async (req, res) => {
  try {
    const finansalIslemler = await Finansal.getAll();
    res.json(finansalIslemler);
  } catch (error) {
    console.error('Error fetching finansal islemler:', error);
    res.status(500).json({ error: 'Finansal işlemler getirilirken bir hata oluştu' });
  }
});

// Tek bir finansal işlem getir
router.get('/:id', async (req, res) => {
  try {
    const islem = await Finansal.getById(parseInt(req.params.id));

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
router.post('/', async (req, res) => {
  try {
    const newIslem = await Finansal.create(req.body);
    res.status(201).json(newIslem);
  } catch (error) {
    console.error('Error creating finansal islem:', error);
    res.status(500).json({ error: 'Finansal işlem oluşturulurken bir hata oluştu' });
  }
});

// Finansal işlem güncelle
router.put('/:id', async (req, res) => {
  try {
    const updatedIslem = await Finansal.update(parseInt(req.params.id), req.body);

    if (!updatedIslem) {
      return res.status(404).json({ error: 'Finansal işlem bulunamadı' });
    }

    res.json(updatedIslem);
  } catch (error) {
    console.error('Error updating finansal islem:', error);
    res.status(500).json({ error: 'Finansal işlem güncellenirken bir hata oluştu' });
  }
});

// Finansal işlem sil
router.delete('/:id', async (req, res) => {
  try {
    const islem = await Finansal.getById(parseInt(req.params.id));
    
    if (!islem) {
      return res.status(404).json({ error: 'Finansal işlem bulunamadı' });
    }

    await Finansal.delete(parseInt(req.params.id));
    res.json({ message: 'Finansal işlem silindi' });
  } catch (error) {
    console.error('Error deleting finansal islem:', error);
    res.status(500).json({ error: 'Finansal işlem silinirken bir hata oluştu' });
  }
});

module.exports = router;
