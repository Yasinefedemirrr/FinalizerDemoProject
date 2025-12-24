const express = require('express');
const { readFile } = require('../utils/fileManager');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Tüm route'lar için authentication
router.use(authenticateToken);

// Raporlama verilerini getir
router.get('/', (req, res) => {
  try {
    const faturalar = readFile('faturalar.json');
    const finansalIslemler = readFile('finansal.json');
    const cariler = readFile('cariler.json');

    // Fatura istatistikleri
    const toplamFaturaSayisi = faturalar.length;
    let toplamFaturaTutari = 0;
    faturalar.forEach(fatura => {
      toplamFaturaTutari += parseFloat(fatura.toplamlar?.genelToplam || 0);
    });

    // Finansal istatistikler
    let toplamGelir = 0;
    let toplamGider = 0;

    finansalIslemler.forEach(islem => {
      const tutar = parseFloat(islem.tutar || 0);
      if (islem.islemTipi === 'Tahsilat' || islem.tip === 'Gelir') {
        toplamGelir += tutar;
      } else if (islem.islemTipi === 'Ödeme' || islem.tip === 'Gider') {
        toplamGider += tutar;
      }
    });

    // Cari istatistikleri
    const toplamCariSayisi = cariler.length;
    const aktifCariSayisi = cariler.filter(c => c.aktif !== false).length;

    // Son işlemler (son 10 fatura)
    const sonFaturalar = faturalar
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    // Son finansal işlemler (son 10)
    const sonFinansalIslemler = finansalIslemler
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    res.json({
      fatura: {
        toplamSayi: toplamFaturaSayisi,
        toplamTutar: toplamFaturaTutari.toFixed(2),
        sonFaturalar: sonFaturalar
      },
      finansal: {
        toplamGelir: toplamGelir.toFixed(2),
        toplamGider: toplamGider.toFixed(2),
        netGelir: (toplamGelir - toplamGider).toFixed(2),
        sonIslemler: sonFinansalIslemler
      },
      cari: {
        toplamSayi: toplamCariSayisi,
        aktifSayi: aktifCariSayisi
      }
    });
  } catch (error) {
    console.error('Error fetching raporlama:', error);
    res.status(500).json({ error: 'Raporlama verileri getirilirken bir hata oluştu' });
  }
});

module.exports = router;

