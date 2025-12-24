import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import styles from '../styles/Dashboard.module.css';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [raporlamaRes, faturalarRes, finansalRes] = await Promise.all([
        api.get('/raporlama').catch(() => ({ data: { fatura: {}, finansal: {}, cari: {} } })),
        api.get('/fatura').catch(() => ({ data: [] })),
        api.get('/finansal').catch(() => ({ data: [] })),
      ]);

      const raporlama = raporlamaRes.data || { fatura: {}, finansal: {}, cari: {} };
      const faturalar = faturalarRes.data || [];
      const finansalIslemler = finansalRes.data || [];

      // Grafik verileri için hazırlık
      const last7Days = [];
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayFaturalar = faturalar.filter(
          (f) => f.faturaTarihi === dateStr || f.createdAt?.split('T')[0] === dateStr
        );
        const dayGelir = finansalIslemler
          .filter(
            (i) =>
              (i.islemTipi === 'Tahsilat' || i.tip === 'Gelir') &&
              (i.islemTarihi === dateStr || i.createdAt?.split('T')[0] === dateStr)
          )
          .reduce((sum, i) => sum + parseFloat(i.tutar || 0), 0);
        const dayGider = finansalIslemler
          .filter(
            (i) =>
              (i.islemTipi === 'Ödeme' || i.tip === 'Gider') &&
              (i.islemTarihi === dateStr || i.createdAt?.split('T')[0] === dateStr)
          )
          .reduce((sum, i) => sum + parseFloat(i.tutar || 0), 0);

        last7Days.push({
          tarih: date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
          fatura: dayFaturalar.reduce((sum, f) => sum + parseFloat(f.toplamlar?.genelToplam || 0), 0),
          gelir: dayGelir,
          gider: dayGider,
        });
      }

      // Kategori bazlı gider dağılımı
      const kategoriGiderleri = {};
      finansalIslemler
        .filter((i) => i.islemTipi === 'Ödeme' || i.tip === 'Gider')
        .forEach((i) => {
          const kategori = i.kategori || i.aciklama || 'Diğer';
          kategoriGiderleri[kategori] =
            (kategoriGiderleri[kategori] || 0) + parseFloat(i.tutar || 0);
        });

      const kategoriData = Object.entries(kategoriGiderleri)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      setStats({
        ...raporlama,
        chartData: last7Days,
        kategoriData,
      });
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      // Hata durumunda boş veri set et
      setStats({
        fatura: { toplamSayi: 0, toplamTutar: '0', sonFaturalar: [] },
        finansal: { toplamGelir: '0', toplamGider: '0', netGelir: '0', sonIslemler: [] },
        cari: { toplamSayi: 0, aktifSayi: 0 },
        chartData: [],
        kategoriData: [],
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className={styles.loading}>Yükleniyor...</div>
      </Layout>
    );
  }

  if (!stats) {
    return (
      <Layout>
        <div className={styles.error}>
          Veriler yüklenemedi. Backend sunucusunun çalıştığından emin olun.
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.dashboard}>
        <h1 className={styles.title}>Dashboard</h1>

        {/* İstatistik Kartları */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📄</div>
            <div className={styles.statContent}>
              <h3>Toplam Fatura</h3>
              <p className={styles.statValue}>{stats.fatura?.toplamSayi || 0}</p>
              <p className={styles.statLabel}>
                {parseFloat(stats.fatura?.toplamTutar || 0).toLocaleString('tr-TR', {
                  style: 'currency',
                  currency: 'TRY',
                })}
              </p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>💰</div>
            <div className={styles.statContent}>
              <h3>Toplam Gelir</h3>
              <p className={styles.statValue}>
                {parseFloat(stats.finansal?.toplamGelir || 0).toLocaleString('tr-TR', {
                  style: 'currency',
                  currency: 'TRY',
                })}
              </p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>💸</div>
            <div className={styles.statContent}>
              <h3>Toplam Gider</h3>
              <p className={styles.statValue}>
                {parseFloat(stats.finansal?.toplamGider || 0).toLocaleString('tr-TR', {
                  style: 'currency',
                  currency: 'TRY',
                })}
              </p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>📊</div>
            <div className={styles.statContent}>
              <h3>Net Gelir</h3>
              <p
                className={`${styles.statValue} ${
                  parseFloat(stats.finansal?.netGelir || 0) >= 0
                    ? styles.positive
                    : styles.negative
                }`}
              >
                {parseFloat(stats.finansal?.netGelir || 0).toLocaleString('tr-TR', {
                  style: 'currency',
                  currency: 'TRY',
                })}
              </p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>👥</div>
            <div className={styles.statContent}>
              <h3>Toplam Cari</h3>
              <p className={styles.statValue}>{stats.cari?.toplamSayi || 0}</p>
              <p className={styles.statLabel}>
                {stats.cari?.aktifSayi || 0} aktif
              </p>
            </div>
          </div>
        </div>

        {/* Grafikler */}
        <div className={styles.chartsGrid}>
          <div className={styles.chartCard}>
            <h2>Son 7 Gün - Fatura ve Finansal İşlemler</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.chartData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tarih" />
                <YAxis />
                <Tooltip
                  formatter={(value) =>
                    value.toLocaleString('tr-TR', {
                      style: 'currency',
                      currency: 'TRY',
                    })
                  }
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="fatura"
                  stroke="#1e3a8a"
                  strokeWidth={2}
                  name="Fatura"
                />
                <Line
                  type="monotone"
                  dataKey="gelir"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Gelir"
                />
                <Line
                  type="monotone"
                  dataKey="gider"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="Gider"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {stats.kategoriData && stats.kategoriData.length > 0 && (
            <div className={styles.chartCard}>
              <h2>Kategori Bazlı Gider Dağılımı</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.kategoriData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) =>
                      value.toLocaleString('tr-TR', {
                        style: 'currency',
                        currency: 'TRY',
                      })
                    }
                  />
                  <Bar dataKey="value" fill="#1e3a8a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Son İşlemler */}
        <div className={styles.recentSection}>
          <div className={styles.recentCard}>
            <h2>Son Faturalar</h2>
            <div className={styles.recentList}>
              {stats.fatura?.sonFaturalar?.length > 0 ? (
                stats.fatura.sonFaturalar.map((fatura) => (
                  <div key={fatura.id} className={styles.recentItem}>
                    <div>
                      <strong>{fatura.faturaNo}</strong>
                      <p>
                        {fatura.cariBilgileri?.tamAdi || fatura.cariBilgileri?.unvan || 'Bilinmeyen'}
                      </p>
                    </div>
                    <div className={styles.recentAmount}>
                      {parseFloat(fatura.toplamlar?.genelToplam || 0).toLocaleString('tr-TR', {
                        style: 'currency',
                        currency: 'TRY',
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <p className={styles.empty}>Henüz fatura bulunmuyor</p>
              )}
            </div>
          </div>

          <div className={styles.recentCard}>
            <h2>Son Finansal İşlemler</h2>
            <div className={styles.recentList}>
              {stats.finansal?.sonIslemler?.length > 0 ? (
                stats.finansal.sonIslemler.map((islem) => (
                  <div key={islem.id} className={styles.recentItem}>
                    <div>
                      <strong>
                        {islem.islemTipi || islem.tip || 'İşlem'}
                      </strong>
                      <p>{islem.aciklama || '-'}</p>
                    </div>
                    <div
                      className={`${styles.recentAmount} ${
                        islem.islemTipi === 'Tahsilat' || islem.tip === 'Gelir'
                          ? styles.positive
                          : styles.negative
                      }`}
                    >
                      {(islem.islemTipi === 'Tahsilat' || islem.tip === 'Gelir'
                        ? '+'
                        : '-') +
                        parseFloat(islem.tutar || 0).toLocaleString('tr-TR', {
                          style: 'currency',
                          currency: 'TRY',
                        })}
                    </div>
                  </div>
                ))
              ) : (
                <p className={styles.empty}>Henüz finansal işlem bulunmuyor</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

