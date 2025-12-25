const { query } = require('./db');

// Users işlemleri
const Users = {
  async getAll() {
    const result = await query('SELECT * FROM users ORDER BY id DESC');
    return result.rows;
  },

  async getById(id) {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async getByUsername(username) {
    const result = await query('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0] || null;
  },

  async create(userData) {
    const result = await query(
      `INSERT INTO users (username, password, role, name) 
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        userData.username,
        userData.password,
        userData.role || 'user',
        userData.name || userData.username,
      ]
    );
    return result.rows[0];
  },

  async update(id, userData) {
    const result = await query(
      `UPDATE users 
       SET username = $1, password = $2, role = $3, name = $4, "updatedAt" = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [
        userData.username,
        userData.password,
        userData.role,
        userData.name,
        id,
      ]
    );
    return result.rows[0] || null;
  },

  async delete(id) {
    await query('DELETE FROM users WHERE id = $1', [id]);
    return true;
  },
};

// Cariler işlemleri
const Cariler = {
  async getAll() {
    const result = await query('SELECT * FROM cariler ORDER BY id DESC');
    return result.rows;
  },

  async getById(id) {
    const result = await query('SELECT * FROM cariler WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async create(cariData) {
    const result = await query(
      `INSERT INTO cariler ("tamAdi", "sirketTipi", "isletmeTuru", "vergiNo", ulke, sehir, ilce, "vergiDaire", adres, telefon, email, aktif) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        cariData.tamAdi || null,
        cariData.sirketTipi || null,
        cariData.isletmeTuru || null,
        cariData.vergiNo || null,
        cariData.ulke || null,
        cariData.sehir || null,
        cariData.ilce || null,
        cariData.vergiDaire || null,
        cariData.adres || null,
        cariData.telefon || null,
        cariData.email || null,
        cariData.aktif !== undefined ? cariData.aktif : true,
      ]
    );
    return result.rows[0];
  },

  async update(id, cariData) {
    const result = await query(
      `UPDATE cariler 
       SET "tamAdi" = $1, "sirketTipi" = $2, "isletmeTuru" = $3, 
           "vergiNo" = $4, ulke = $5, sehir = $6, ilce = $7, 
           "vergiDaire" = $8, adres = $9, telefon = $10, 
           email = $11, aktif = $12, "updatedAt" = CURRENT_TIMESTAMP
       WHERE id = $13
       RETURNING *`,
      [
        cariData.tamAdi || null,
        cariData.sirketTipi || null,
        cariData.isletmeTuru || null,
        cariData.vergiNo || null,
        cariData.ulke || null,
        cariData.sehir || null,
        cariData.ilce || null,
        cariData.vergiDaire || null,
        cariData.adres || null,
        cariData.telefon || null,
        cariData.email || null,
        cariData.aktif !== undefined ? cariData.aktif : true,
        id,
      ]
    );
    return result.rows[0] || null;
  },

  async delete(id) {
    await query('DELETE FROM cariler WHERE id = $1', [id]);
    return true;
  },
};

// Faturalar işlemleri
const Faturalar = {
  async getAll() {
    const result = await query('SELECT * FROM faturalar ORDER BY id DESC');
    return result.rows.map(this.parseFatura);
  },

  async getById(id) {
    const result = await query('SELECT * FROM faturalar WHERE id = $1', [id]);
    return result.rows[0] ? this.parseFatura(result.rows[0]) : null;
  },

  parseFatura(fatura) {
    return {
      ...fatura,
      cariBilgileri: fatura.cariBilgileri || {},
      lineItems: fatura.lineItems || [],
      toplamlar: fatura.toplamlar || {},
    };
  },

  async create(faturaData) {
    const result = await query(
      `INSERT INTO faturalar ("faturaNo", "faturaTarihi", "faturaTuru", "faturaSenaryosu", "faturaTipi", "cariId", "cariBilgileri", "paraBirimi", "dovizKuru", "odemeTuru", "lineItems", toplamlar) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        faturaData.faturaNo || null,
        faturaData.faturaTarihi || null,
        faturaData.faturaTuru || null,
        faturaData.faturaSenaryosu || null,
        faturaData.faturaTipi || null,
        faturaData.cariId || null,
        JSON.stringify(faturaData.cariBilgileri || {}),
        faturaData.paraBirimi || 'TL',
        faturaData.dovizKuru || 1,
        faturaData.odemeTuru || null,
        JSON.stringify(faturaData.lineItems || []),
        JSON.stringify(faturaData.toplamlar || {}),
      ]
    );
    return this.parseFatura(result.rows[0]);
  },

  async update(id, faturaData) {
    const result = await query(
      `UPDATE faturalar 
       SET "faturaNo" = $1, "faturaTarihi" = $2, "faturaTuru" = $3, 
           "faturaSenaryosu" = $4, "faturaTipi" = $5, "cariId" = $6, 
           "cariBilgileri" = $7, "paraBirimi" = $8, "dovizKuru" = $9, 
           "odemeTuru" = $10, "lineItems" = $11, toplamlar = $12, "updatedAt" = CURRENT_TIMESTAMP
       WHERE id = $13
       RETURNING *`,
      [
        faturaData.faturaNo || null,
        faturaData.faturaTarihi || null,
        faturaData.faturaTuru || null,
        faturaData.faturaSenaryosu || null,
        faturaData.faturaTipi || null,
        faturaData.cariId || null,
        JSON.stringify(faturaData.cariBilgileri || {}),
        faturaData.paraBirimi || 'TL',
        faturaData.dovizKuru || 1,
        faturaData.odemeTuru || null,
        JSON.stringify(faturaData.lineItems || []),
        JSON.stringify(faturaData.toplamlar || {}),
        id,
      ]
    );
    return result.rows[0] ? this.parseFatura(result.rows[0]) : null;
  },

  async delete(id) {
    await query('DELETE FROM faturalar WHERE id = $1', [id]);
    return true;
  },
};

// Finansal işlemleri
const Finansal = {
  async getAll() {
    const result = await query('SELECT * FROM finansal ORDER BY id DESC');
    return result.rows.map(this.parseFinansal);
  },

  async getById(id) {
    const result = await query('SELECT * FROM finansal WHERE id = $1', [id]);
    return result.rows[0] ? this.parseFinansal(result.rows[0]) : null;
  },

  parseFinansal(finansal) {
    return {
      ...finansal,
      cariBilgileri: finansal.cariBilgileri || {},
    };
  },

  async create(finansalData) {
    const result = await query(
      `INSERT INTO finansal ("hesapTipi", "islemTipi", "altHesap", "cariId", "cariBilgileri", "islemTarihi", tutar, tip, kategori, aciklama) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        finansalData.hesapTipi || null,
        finansalData.islemTipi || null,
        finansalData.altHesap || null,
        finansalData.cariId || null,
        JSON.stringify(finansalData.cariBilgileri || {}),
        finansalData.islemTarihi || null,
        finansalData.tutar || 0,
        finansalData.tip || null,
        finansalData.kategori || null,
        finansalData.aciklama || null,
      ]
    );
    return this.parseFinansal(result.rows[0]);
  },

  async update(id, finansalData) {
    const result = await query(
      `UPDATE finansal 
       SET "hesapTipi" = $1, "islemTipi" = $2, "altHesap" = $3, 
           "cariId" = $4, "cariBilgileri" = $5, "islemTarihi" = $6, 
           tutar = $7, tip = $8, kategori = $9, aciklama = $10, "updatedAt" = CURRENT_TIMESTAMP
       WHERE id = $11
       RETURNING *`,
      [
        finansalData.hesapTipi || null,
        finansalData.islemTipi || null,
        finansalData.altHesap || null,
        finansalData.cariId || null,
        JSON.stringify(finansalData.cariBilgileri || {}),
        finansalData.islemTarihi || null,
        finansalData.tutar || 0,
        finansalData.tip || null,
        finansalData.kategori || null,
        finansalData.aciklama || null,
        id,
      ]
    );
    return result.rows[0] ? this.parseFinansal(result.rows[0]) : null;
  },

  async delete(id) {
    await query('DELETE FROM finansal WHERE id = $1', [id]);
    return true;
  },
};

module.exports = {
  Users,
  Cariler,
  Faturalar,
  Finansal,
};
