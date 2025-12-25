const { Pool } = require('pg');

let pool = null;

async function getPool() {
  if (!pool) {
    try {
      // PostgreSQL bağlantı yapılandırması
      pool = new Pool({
        host: 'localhost',
        port: 5432,
        database: 'FinalizerAnaProje',
        user: 'postgres',
        password: 'yasin123',
        ssl: false,
        max: 20, // Maksimum bağlantı sayısı
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 30000,
      });

      // Bağlantıyı test et
      const client = await pool.connect();
      console.log('═══════════════════════════════════════');
      console.log('PostgreSQL Bağlantısı');
      console.log('═══════════════════════════════════════');
      console.log(`Host: localhost`);
      console.log(`Port: 5432`);
      console.log(`Database: FinalizerAnaProje`);
      console.log(`User: postgres`);
      console.log('✅ PostgreSQL bağlantısı başarılı!\n');
      client.release();
      
      await createTables();
    } catch (error) {
      console.error('\n❌ PostgreSQL bağlantı hatası!');
      console.error('═══════════════════════════════════════');
      console.error(`Hata: ${error.message}`);
      console.error('\n🔧 Kontrol Edin:');
      console.error('1. PostgreSQL servisinin çalıştığından emin olun');
      console.error('2. Veritabanının oluşturulduğundan emin olun');
      console.error('3. Kullanıcı adı ve şifrenin doğru olduğundan emin olun');
      console.error('4. Port 5432\'nin açık olduğundan emin olun\n');
      throw error;
    }
  }
  return pool;
}

async function createTables() {
  try {
    const client = await pool.connect();
    
    try {
      // Users tablosu
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(50) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(20) NOT NULL DEFAULT 'user',
          name VARCHAR(100),
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Cariler tablosu
      await client.query(`
        CREATE TABLE IF NOT EXISTS cariler (
          id SERIAL PRIMARY KEY,
          "tamAdi" VARCHAR(200),
          "sirketTipi" VARCHAR(50),
          "isletmeTuru" VARCHAR(50),
          "vergiNo" VARCHAR(20),
          ulke VARCHAR(50),
          sehir VARCHAR(50),
          ilce VARCHAR(50),
          "vergiDaire" VARCHAR(100),
          adres VARCHAR(500),
          telefon VARCHAR(20),
          email VARCHAR(100),
          aktif BOOLEAN DEFAULT true,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Faturalar tablosu
      await client.query(`
        CREATE TABLE IF NOT EXISTS faturalar (
          id SERIAL PRIMARY KEY,
          "faturaNo" VARCHAR(50),
          "faturaTarihi" DATE,
          "faturaTuru" VARCHAR(50),
          "faturaSenaryosu" VARCHAR(50),
          "faturaTipi" VARCHAR(50),
          "cariId" INTEGER,
          "cariBilgileri" JSONB,
          "paraBirimi" VARCHAR(10),
          "dovizKuru" DECIMAL(18,2),
          "odemeTuru" VARCHAR(50),
          "lineItems" JSONB,
          toplamlar JSONB,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("cariId") REFERENCES cariler(id)
        )
      `);

      // Finansal tablosu
      await client.query(`
        CREATE TABLE IF NOT EXISTS finansal (
          id SERIAL PRIMARY KEY,
          "hesapTipi" VARCHAR(50),
          "islemTipi" VARCHAR(50),
          "altHesap" VARCHAR(50),
          "cariId" INTEGER,
          "cariBilgileri" JSONB,
          "islemTarihi" DATE,
          tutar DECIMAL(18,2),
          tip VARCHAR(20),
          kategori VARCHAR(100),
          aciklama VARCHAR(500),
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("cariId") REFERENCES cariler(id)
        )
      `);

      console.log('✅ Tablolar kontrol edildi/oluşturuldu');
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Tablo oluşturma hatası:', error.message);
    throw error;
  }
}

async function query(sqlQuery, params = []) {
  try {
    const pool = await getPool();
    const result = await pool.query(sqlQuery, params);
    return result;
  } catch (error) {
    console.error('❌ PostgreSQL Query hatası:', error.message);
    console.error('Query:', sqlQuery);
    console.error('Params:', params);
    console.error('Error code:', error.code);
    console.error('Error detail:', error.detail);
    throw error;
  }
}

module.exports = {
  getPool,
  query,
  pool,
};
