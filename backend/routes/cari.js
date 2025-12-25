const express = require('express');
const { Cariler } = require('../utils/dbManager');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Tüm route'lar için authentication
router.use(authenticateToken);

// Tüm carileri getir
router.get('/', async (req, res) => {
  try {
    const cariler = await Cariler.getAll();
    res.json(cariler);
  } catch (error) {
    console.error('Error fetching cariler:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Cariler getirilirken bir hata oluştu',
      details: error.message 
    });
  }
});

// Tek bir cari getir
router.get('/:id', async (req, res) => {
  try {
    const cari = await Cariler.getById(parseInt(req.params.id));

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
router.post('/', async (req, res) => {
  try {
    console.log('Cari ekleme isteği alındı:', req.body);
    const newCari = await Cariler.create(req.body);
    console.log('Cari başarıyla oluşturuldu:', newCari);
    res.status(201).json(newCari);
  } catch (error) {
    console.error('Error creating cari:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Cari oluşturulurken bir hata oluştu',
      details: error.message 
    });
  }
});

// Cari güncelle
router.put('/:id', async (req, res) => {
  try {
    const updatedCari = await Cariler.update(parseInt(req.params.id), req.body);

    if (!updatedCari) {
      return res.status(404).json({ error: 'Cari bulunamadı' });
    }

    res.json(updatedCari);
  } catch (error) {
    console.error('Error updating cari:', error);
    res.status(500).json({ error: 'Cari güncellenirken bir hata oluştu' });
  }
});

// Cari sil
router.delete('/:id', async (req, res) => {
  try {
    const cari = await Cariler.getById(parseInt(req.params.id));
    
    if (!cari) {
      return res.status(404).json({ error: 'Cari bulunamadı' });
    }

    await Cariler.delete(parseInt(req.params.id));
    res.json({ message: 'Cari silindi' });
  } catch (error) {
    console.error('Error deleting cari:', error);
    res.status(500).json({ error: 'Cari silinirken bir hata oluştu' });
  }
});

module.exports = router;

