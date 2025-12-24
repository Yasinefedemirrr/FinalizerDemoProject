const express = require('express');
const { readFile, writeFile, getNextId } = require('../utils/fileManager');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Tüm route'lar için authentication
router.use(authenticateToken);

// Tüm faturaları getir
router.get('/', (req, res) => {
  try {
    const faturalar = readFile('faturalar.json');
    res.json(faturalar);
  } catch (error) {
    console.error('Error fetching faturalar:', error);
    res.status(500).json({ error: 'Faturalar getirilirken bir hata oluştu' });
  }
});

// Tek bir fatura getir
router.get('/:id', (req, res) => {
  try {
    const faturalar = readFile('faturalar.json');
    const fatura = faturalar.find(f => f.id === parseInt(req.params.id));

    if (!fatura) {
      return res.status(404).json({ error: 'Fatura bulunamadı' });
    }

    res.json(fatura);
  } catch (error) {
    console.error('Error fetching fatura:', error);
    res.status(500).json({ error: 'Fatura getirilirken bir hata oluştu' });
  }
});

// Yeni fatura oluştur
router.post('/', (req, res) => {
  try {
    const faturalar = readFile('faturalar.json');
    
    // Toplam hesaplamaları yap
    const lineItems = req.body.lineItems || [];
    let tutar = 0;
    let iskonto = 0;
    let kdvTutari = 0;

    lineItems.forEach(item => {
      const birimFiyat = parseFloat(item.birimFiyat || 0);
      const miktar = parseFloat(item.miktar || 0);
      const itemIskonto = parseFloat(item.iskonto || 0);
      const kdvOrani = parseFloat(item.kdvOrani || 0);
      
      const itemTutar = birimFiyat * miktar;
      const itemIskontoTutar = itemIskonto;
      const itemMatrah = itemTutar - itemIskontoTutar;
      const itemKdv = itemMatrah * (kdvOrani / 100);
      
      tutar += itemTutar;
      iskonto += itemIskontoTutar;
      kdvTutari += itemKdv;
    });

    const matrah = tutar - iskonto;
    const genelToplam = matrah + kdvTutari;

    const newFatura = {
      id: getNextId(faturalar),
      faturaNo: req.body.faturaNo || `FAT-${Date.now()}`,
      faturaTarihi: req.body.faturaTarihi || new Date().toISOString().split('T')[0],
      faturaTuru: req.body.faturaTuru || 'E-FATURA',
      faturaSenaryosu: req.body.faturaSenaryosu || 'TİCARİ FATURA',
      faturaTipi: req.body.faturaTipi || 'SATIŞ',
      cariId: req.body.cariId,
      cariBilgileri: req.body.cariBilgileri || {},
      paraBirimi: req.body.paraBirimi || 'TL',
      dovizKuru: req.body.dovizKuru || 1,
      odemeTuru: req.body.odemeTuru || 'Nakit',
      lineItems: lineItems,
      toplamlar: {
        tutar: tutar.toFixed(2),
        iskonto: iskonto.toFixed(2),
        matrah: matrah.toFixed(2),
        kdvTutari: kdvTutari.toFixed(2),
        digerVergiToplami: '0.00',
        genelToplam: genelToplam.toFixed(2)
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    faturalar.push(newFatura);
    writeFile('faturalar.json', faturalar);

    res.status(201).json(newFatura);
  } catch (error) {
    console.error('Error creating fatura:', error);
    res.status(500).json({ error: 'Fatura oluşturulurken bir hata oluştu' });
  }
});

// Fatura güncelle
router.put('/:id', (req, res) => {
  try {
    const faturalar = readFile('faturalar.json');
    const index = faturalar.findIndex(f => f.id === parseInt(req.params.id));

    if (index === -1) {
      return res.status(404).json({ error: 'Fatura bulunamadı' });
    }

    // Toplam hesaplamaları yap
    const lineItems = req.body.lineItems || faturalar[index].lineItems || [];
    let tutar = 0;
    let iskonto = 0;
    let kdvTutari = 0;

    lineItems.forEach(item => {
      const birimFiyat = parseFloat(item.birimFiyat || 0);
      const miktar = parseFloat(item.miktar || 0);
      const itemIskonto = parseFloat(item.iskonto || 0);
      const kdvOrani = parseFloat(item.kdvOrani || 0);
      
      const itemTutar = birimFiyat * miktar;
      const itemIskontoTutar = itemIskonto;
      const itemMatrah = itemTutar - itemIskontoTutar;
      const itemKdv = itemMatrah * (kdvOrani / 100);
      
      tutar += itemTutar;
      iskonto += itemIskontoTutar;
      kdvTutari += itemKdv;
    });

    const matrah = tutar - iskonto;
    const genelToplam = matrah + kdvTutari;

    faturalar[index] = {
      ...faturalar[index],
      ...req.body,
      id: parseInt(req.params.id),
      lineItems: lineItems,
      toplamlar: {
        tutar: tutar.toFixed(2),
        iskonto: iskonto.toFixed(2),
        matrah: matrah.toFixed(2),
        kdvTutari: kdvTutari.toFixed(2),
        digerVergiToplami: '0.00',
        genelToplam: genelToplam.toFixed(2)
      },
      updatedAt: new Date().toISOString()
    };

    writeFile('faturalar.json', faturalar);
    res.json(faturalar[index]);
  } catch (error) {
    console.error('Error updating fatura:', error);
    res.status(500).json({ error: 'Fatura güncellenirken bir hata oluştu' });
  }
});

// Fatura sil
router.delete('/:id', (req, res) => {
  try {
    const faturalar = readFile('faturalar.json');
    const filteredFaturalar = faturalar.filter(f => f.id !== parseInt(req.params.id));

    if (faturalar.length === filteredFaturalar.length) {
      return res.status(404).json({ error: 'Fatura bulunamadı' });
    }

    writeFile('faturalar.json', filteredFaturalar);
    res.json({ message: 'Fatura silindi' });
  } catch (error) {
    console.error('Error deleting fatura:', error);
    res.status(500).json({ error: 'Fatura silinirken bir hata oluştu' });
  }
});

module.exports = router;

