import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import styles from '../styles/Raporlama.module.css';

export default function Raporlama() {
  const [rapor, setRapor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRapor();
  }, []);

  const fetchRapor = async () => {
    try {
      const response = await api.get('/raporlama');
      setRapor(response.data);
    } catch (error) {
      console.error('Error fetching rapor:', error);
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

  if (!rapor) {
    return (
      <Layout>
        <div className={styles.error}>Rapor yüklenemedi</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.container}>
        <h1 className={styles.title}>Raporlama</h1>

        <div className={styles.sections}>
          {/* Fatura Raporları */}
          <section className={styles.section}>
            <h2>Fatura Raporları</h2>
            <div className={styles.reportCard}>
              <div className={styles.reportItem}>
                <span className={styles.label}>Toplam Fatura Sayısı:</span>
                <span className={styles.value}>{rapor.fatura?.toplamSayi || 0}</span>
              </div>
              <div className={styles.reportItem}>
                <span className={styles.label}>Toplam Fatura Tutarı:</span>
                <span className={styles.value}>
                  {parseFloat(rapor.fatura?.toplamTutar || 0).toLocaleString('tr-TR', {
                    style: 'currency',
                    currency: 'TRY',
                  })}
                </span>
              </div>
              <div className={styles.reportItem}>
                <span className={styles.label}>Ortalama Fatura Tutarı:</span>
                <span className={styles.value}>
                  {rapor.fatura?.toplamSayi > 0
                    ? (
                        parseFloat(rapor.fatura?.toplamTutar || 0) /
                        rapor.fatura?.toplamSayi
                      ).toLocaleString('tr-TR', {
                        style: 'currency',
                        currency: 'TRY',
                      })
                    : '0,00 ₺'}
                </span>
              </div>
            </div>

            {rapor.fatura?.sonFaturalar && rapor.fatura.sonFaturalar.length > 0 && (
              <div className={styles.listSection}>
                <h3>Son Faturalar</h3>
                <ul className={styles.list}>
                  {rapor.fatura.sonFaturalar.map((fatura) => (
                    <li key={fatura.id} className={styles.listItem}>
                      <div className={styles.listItemHeader}>
                        <strong>{fatura.faturaNo}</strong>
                        <span>
                          {parseFloat(fatura.toplamlar?.genelToplam || 0).toLocaleString(
                            'tr-TR',
                            {
                              style: 'currency',
                              currency: 'TRY',
                            }
                          )}
                        </span>
                      </div>
                      <p>
                        {fatura.cariBilgileri?.tamAdi ||
                          fatura.cariBilgileri?.unvan ||
                          'Bilinmeyen Cari'}
                        {' - '}
                        {fatura.faturaTarihi}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* Finansal Raporlar */}
          <section className={styles.section}>
            <h2>Finansal Raporlar</h2>
            <div className={styles.reportCard}>
              <div className={styles.reportItem}>
                <span className={styles.label}>Toplam Gelir:</span>
                <span className={`${styles.value} ${styles.positive}`}>
                  {parseFloat(rapor.finansal?.toplamGelir || 0).toLocaleString('tr-TR', {
                    style: 'currency',
                    currency: 'TRY',
                  })}
                </span>
              </div>
              <div className={styles.reportItem}>
                <span className={styles.label}>Toplam Gider:</span>
                <span className={`${styles.value} ${styles.negative}`}>
                  {parseFloat(rapor.finansal?.toplamGider || 0).toLocaleString('tr-TR', {
                    style: 'currency',
                    currency: 'TRY',
                  })}
                </span>
              </div>
              <div className={styles.reportItem}>
                <span className={styles.label}>Net Gelir:</span>
                <span
                  className={`${styles.value} ${
                    parseFloat(rapor.finansal?.netGelir || 0) >= 0
                      ? styles.positive
                      : styles.negative
                  }`}
                >
                  {parseFloat(rapor.finansal?.netGelir || 0).toLocaleString('tr-TR', {
                    style: 'currency',
                    currency: 'TRY',
                  })}
                </span>
              </div>
              {parseFloat(rapor.finansal?.toplamGelir || 0) > 0 && (
                <div className={styles.reportItem}>
                  <span className={styles.label}>Gider/Gelir Oranı:</span>
                  <span className={styles.value}>
                    {(
                      (parseFloat(rapor.finansal?.toplamGider || 0) /
                        parseFloat(rapor.finansal?.toplamGelir || 1)) *
                      100
                    ).toFixed(2)}
                    %
                  </span>
                </div>
              )}
            </div>

            {rapor.finansal?.sonIslemler && rapor.finansal.sonIslemler.length > 0 && (
              <div className={styles.listSection}>
                <h3>Son Finansal İşlemler</h3>
                <ul className={styles.list}>
                  {rapor.finansal.sonIslemler.map((islem) => (
                    <li key={islem.id} className={styles.listItem}>
                      <div className={styles.listItemHeader}>
                        <strong>
                          {islem.islemTipi || islem.tip || 'İşlem'} - {islem.kategori || 'Kategori Yok'}
                        </strong>
                        <span
                          className={
                            islem.islemTipi === 'Tahsilat' || islem.tip === 'Gelir'
                              ? styles.positive
                              : styles.negative
                          }
                        >
                          {(islem.islemTipi === 'Tahsilat' || islem.tip === 'Gelir' ? '+' : '-') +
                            parseFloat(islem.tutar || 0).toLocaleString('tr-TR', {
                              style: 'currency',
                              currency: 'TRY',
                            })}
                        </span>
                      </div>
                      <p>
                        {islem.aciklama || 'Açıklama yok'} -{' '}
                        {islem.islemTarihi || islem.createdAt?.split('T')[0]}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* Cari Raporları */}
          <section className={styles.section}>
            <h2>Cari Hesap Raporları</h2>
            <div className={styles.reportCard}>
              <div className={styles.reportItem}>
                <span className={styles.label}>Toplam Cari Sayısı:</span>
                <span className={styles.value}>{rapor.cari?.toplamSayi || 0}</span>
              </div>
              <div className={styles.reportItem}>
                <span className={styles.label}>Aktif Cari Sayısı:</span>
                <span className={styles.value}>{rapor.cari?.aktifSayi || 0}</span>
              </div>
              <div className={styles.reportItem}>
                <span className={styles.label}>Pasif Cari Sayısı:</span>
                <span className={styles.value}>
                  {(rapor.cari?.toplamSayi || 0) - (rapor.cari?.aktifSayi || 0)}
                </span>
              </div>
              {rapor.cari?.toplamSayi > 0 && (
                <div className={styles.reportItem}>
                  <span className={styles.label}>Aktif Cari Oranı:</span>
                  <span className={styles.value}>
                    {(
                      ((rapor.cari?.aktifSayi || 0) / rapor.cari?.toplamSayi) *
                      100
                    ).toFixed(2)}
                    %
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* Özet */}
          <section className={styles.section}>
            <h2>Genel Özet</h2>
            <div className={styles.summaryCard}>
              <p>
                Sistemde toplam <strong>{rapor.fatura?.toplamSayi || 0}</strong> fatura
                kaydı bulunmaktadır. Toplam fatura tutarı{' '}
                <strong>
                  {parseFloat(rapor.fatura?.toplamTutar || 0).toLocaleString('tr-TR', {
                    style: 'currency',
                    currency: 'TRY',
                  })}
                </strong>
                'dir.
              </p>
              <p>
                Finansal işlemler açısından toplam gelir{' '}
                <strong className={styles.positive}>
                  {parseFloat(rapor.finansal?.toplamGelir || 0).toLocaleString('tr-TR', {
                    style: 'currency',
                    currency: 'TRY',
                  })}
                </strong>
                , toplam gider{' '}
                <strong className={styles.negative}>
                  {parseFloat(rapor.finansal?.toplamGider || 0).toLocaleString('tr-TR', {
                    style: 'currency',
                    currency: 'TRY',
                  })}
                </strong>
                'dir. Net gelir{' '}
                <strong
                  className={
                    parseFloat(rapor.finansal?.netGelir || 0) >= 0
                      ? styles.positive
                      : styles.negative
                  }
                >
                  {parseFloat(rapor.finansal?.netGelir || 0).toLocaleString('tr-TR', {
                    style: 'currency',
                    currency: 'TRY',
                  })}
                </strong>
                'dir.
              </p>
              <p>
                Sistemde <strong>{rapor.cari?.toplamSayi || 0}</strong> cari hesap
                kaydı bulunmaktadır. Bunlardan{' '}
                <strong>{rapor.cari?.aktifSayi || 0}</strong> tanesi aktif durumdadır.
              </p>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}

