import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import styles from '../styles/Finansal.module.css';

export default function Finansal() {
  const [islemler, setIslemler] = useState([]);
  const [cariler, setCariler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingIslem, setEditingIslem] = useState(null);
  const [formData, setFormData] = useState({
    hesapTipi: 'Kasa',
    islemTipi: 'Tahsilat',
    altHesap: 'KASA',
    cariId: '',
    cariBilgileri: {},
    islemTarihi: new Date().toISOString().split('T')[0],
    tutar: '',
    tip: 'Gelir',
    kategori: '',
    aciklama: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [islemlerRes, carilerRes] = await Promise.all([
        api.get('/finansal'),
        api.get('/cari'),
      ]);
      setIslemler(islemlerRes.data);
      setCariler(carilerRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (islem = null) => {
    if (islem) {
      setEditingIslem(islem);
      setFormData(islem);
    } else {
      setEditingIslem(null);
      setFormData({
        hesapTipi: 'Kasa',
        islemTipi: 'Tahsilat',
        altHesap: 'KASA',
        cariId: '',
        cariBilgileri: {},
        islemTarihi: new Date().toISOString().split('T')[0],
        tutar: '',
        tip: 'Gelir',
        kategori: '',
        aciklama: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingIslem(null);
  };

  const handleCariSelect = (cariId) => {
    const selectedCari = cariler.find((c) => c.id === parseInt(cariId));
    if (selectedCari) {
      setFormData({
        ...formData,
        cariId: cariId,
        cariBilgileri: {
          tamAdi: selectedCari.tamAdi,
          vergiNo: selectedCari.vergiNo,
        },
      });
    }
  };

  const handleIslemTipiChange = (value) => {
    setFormData({
      ...formData,
      islemTipi: value,
      tip: value === 'Tahsilat' ? 'Gelir' : 'Gider',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingIslem) {
        await api.put(`/finansal/${editingIslem.id}`, formData);
      } else {
        await api.post('/finansal', formData);
      }
      fetchData();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving finansal islem:', error);
      alert('Finansal işlem kaydedilirken bir hata oluştu');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bu finansal işlemi silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/finansal/${id}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting finansal islem:', error);
      alert('Finansal işlem silinirken bir hata oluştu');
    }
  };

  const getKategoriOptions = () => {
    if (formData.tip === 'Gider') {
      return [
        'Personel Giderleri',
        'Ofis Giderleri',
        'Ulaşım Giderleri',
        'Pazarlama Giderleri',
        'Diğer Giderler',
      ];
    }
    return ['Satış Geliri', 'Hizmet Geliri', 'Diğer Gelirler'];
  };

  if (loading) {
    return (
      <Layout>
        <div className={styles.loading}>Yükleniyor...</div>
      </Layout>
    );
  }

  const gelirler = islemler.filter(
    (i) => i.islemTipi === 'Tahsilat' || i.tip === 'Gelir'
  );
  const giderler = islemler.filter(
    (i) => i.islemTipi === 'Ödeme' || i.tip === 'Gider'
  );

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Finansal İşlemler</h1>
          <button className={styles.addBtn} onClick={() => handleOpenModal()}>
            + Yeni İşlem Ekle
          </button>
        </div>

        <div className={styles.stats}>
          <div className={styles.statCard}>
            <h3>Toplam Gelir</h3>
            <p className={styles.positive}>
              {gelirler
                .reduce((sum, i) => sum + parseFloat(i.tutar || 0), 0)
                .toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
            </p>
          </div>
          <div className={styles.statCard}>
            <h3>Toplam Gider</h3>
            <p className={styles.negative}>
              {giderler
                .reduce((sum, i) => sum + parseFloat(i.tutar || 0), 0)
                .toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
            </p>
          </div>
          <div className={styles.statCard}>
            <h3>Net Gelir</h3>
            <p
              className={
                gelirler.reduce((sum, i) => sum + parseFloat(i.tutar || 0), 0) -
                  giderler.reduce((sum, i) => sum + parseFloat(i.tutar || 0), 0) >=
                0
                  ? styles.positive
                  : styles.negative
              }
            >
              {(
                gelirler.reduce((sum, i) => sum + parseFloat(i.tutar || 0), 0) -
                giderler.reduce((sum, i) => sum + parseFloat(i.tutar || 0), 0)
              ).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
            </p>
          </div>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Tarih</th>
                <th>İşlem Tipi</th>
                <th>Hesap Tipi</th>
                <th>Cari</th>
                <th>Kategori</th>
                <th>Açıklama</th>
                <th>Tutar</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {islemler.length > 0 ? (
                islemler
                  .sort((a, b) => new Date(b.islemTarihi || b.createdAt) - new Date(a.islemTarihi || a.createdAt))
                  .map((islem) => (
                    <tr key={islem.id}>
                      <td>{islem.islemTarihi || islem.createdAt?.split('T')[0]}</td>
                      <td>
                        <span
                          className={`${styles.badge} ${
                            islem.islemTipi === 'Tahsilat' || islem.tip === 'Gelir'
                              ? styles.positive
                              : styles.negative
                          }`}
                        >
                          {islem.islemTipi || islem.tip}
                        </span>
                      </td>
                      <td>{islem.hesapTipi || '-'}</td>
                      <td>
                        {islem.cariBilgileri?.tamAdi || islem.cariBilgileri?.unvan || '-'}
                      </td>
                      <td>{islem.kategori || '-'}</td>
                      <td>{islem.aciklama || '-'}</td>
                      <td
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
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <button
                            className={styles.editBtn}
                            onClick={() => handleOpenModal(islem)}
                          >
                            Düzenle
                          </button>
                          <button
                            className={styles.deleteBtn}
                            onClick={() => handleDelete(islem.id)}
                          >
                            Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan="8" className={styles.empty}>
                    Henüz finansal işlem bulunmuyor
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className={styles.modalOverlay} onClick={handleCloseModal}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>
                  {editingIslem ? 'Finansal İşlem Düzenle' : 'Yeni Finansal İşlem Ekle'}
                </h2>
                <button className={styles.closeBtn} onClick={handleCloseModal}>
                  ×
                </button>
              </div>
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>Hesap Tipi *</label>
                    <select
                      value={formData.hesapTipi}
                      onChange={(e) =>
                        setFormData({ ...formData, hesapTipi: e.target.value })
                      }
                      required
                    >
                      <option value="Kasa">Kasa</option>
                      <option value="Banka">Banka</option>
                      <option value="Kredi Kartı">Kredi Kartı</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>İşlem Tipi *</label>
                    <select
                      value={formData.islemTipi}
                      onChange={(e) => handleIslemTipiChange(e.target.value)}
                      required
                    >
                      <option value="Tahsilat">Tahsilat</option>
                      <option value="Ödeme">Ödeme</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Alt Hesap</label>
                    <select
                      value={formData.altHesap}
                      onChange={(e) =>
                        setFormData({ ...formData, altHesap: e.target.value })
                      }
                    >
                      <option value="KASA">KASA</option>
                      <option value="BANKA">BANKA</option>
                      <option value="KREDİ KARTI">KREDİ KARTI</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Cari Hesap</label>
                    <select
                      value={formData.cariId}
                      onChange={(e) => handleCariSelect(e.target.value)}
                    >
                      <option value="">Cari Seçiniz</option>
                      {cariler.map((cari) => (
                        <option key={cari.id} value={cari.id}>
                          {cari.tamAdi}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>İşlem Tarihi *</label>
                    <input
                      type="date"
                      value={formData.islemTarihi}
                      onChange={(e) =>
                        setFormData({ ...formData, islemTarihi: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Tutar *</label>
                    <div className={styles.tutarInput}>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.tutar}
                        onChange={(e) =>
                          setFormData({ ...formData, tutar: e.target.value })
                        }
                        required
                        placeholder="0.00"
                      />
                      <select
                        value={formData.tip}
                        onChange={(e) =>
                          setFormData({ ...formData, tip: e.target.value })
                        }
                        className={styles.tipSelect}
                      >
                        <option value="Gelir">Gelir</option>
                        <option value="Gider">Gider</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                    <label>Kategori</label>
                    <select
                      value={formData.kategori}
                      onChange={(e) =>
                        setFormData({ ...formData, kategori: e.target.value })
                      }
                    >
                      <option value="">Kategori Seçiniz</option>
                      {getKategoriOptions().map((kat) => (
                        <option key={kat} value={kat}>
                          {kat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                    <label>Açıklama</label>
                    <textarea
                      value={formData.aciklama}
                      onChange={(e) =>
                        setFormData({ ...formData, aciklama: e.target.value })
                      }
                      rows="4"
                      placeholder="İşlem açıklaması..."
                    />
                  </div>
                </div>

                <div className={styles.formActions}>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={handleCloseModal}
                  >
                    Vazgeç
                  </button>
                  <button type="submit" className={styles.saveBtn}>
                    Kaydet
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

