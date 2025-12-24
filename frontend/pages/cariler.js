import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import styles from '../styles/Cariler.module.css';

export default function Cariler() {
  const [cariler, setCariler] = useState([]);
  const [filteredCariler, setFilteredCariler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCari, setEditingCari] = useState(null);
  const [formData, setFormData] = useState({
    tamAdi: '',
    sirketTipi: 'MÜŞTERİ',
    isletmeTuru: 'ŞİRKET',
    vergiNo: '',
    ulke: 'Türkiye',
    sehir: '',
    ilce: '',
    vergiDaire: '',
    adres: '',
    telefon: '',
    email: '',
    aktif: true,
  });

  useEffect(() => {
    fetchCariler();
  }, []);

  useEffect(() => {
    filterCariler();
  }, [searchTerm, cariler]);

  const fetchCariler = async () => {
    try {
      const response = await api.get('/cari');
      setCariler(response.data);
      setFilteredCariler(response.data);
    } catch (error) {
      console.error('Error fetching cariler:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCariler = () => {
    if (!searchTerm) {
      setFilteredCariler(cariler);
      return;
    }
    const filtered = cariler.filter(
      (cari) =>
        cari.tamAdi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cari.vergiNo?.includes(searchTerm) ||
        cari.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cari.telefon?.includes(searchTerm)
    );
    setFilteredCariler(filtered);
  };

  const handleOpenModal = (cari = null) => {
    if (cari) {
      setEditingCari(cari);
      setFormData(cari);
    } else {
      setEditingCari(null);
      setFormData({
        tamAdi: '',
        sirketTipi: 'MÜŞTERİ',
        isletmeTuru: 'ŞİRKET',
        vergiNo: '',
        ulke: 'Türkiye',
        sehir: '',
        ilce: '',
        vergiDaire: '',
        adres: '',
        telefon: '',
        email: '',
        aktif: true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCari(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCari) {
        await api.put(`/cari/${editingCari.id}`, formData);
      } else {
        await api.post('/cari', formData);
      }
      fetchCariler();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving cari:', error);
      alert('Cari kaydedilirken bir hata oluştu');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bu cariyi silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/cari/${id}`);
      fetchCariler();
    } catch (error) {
      console.error('Error deleting cari:', error);
      alert('Cari silinirken bir hata oluştu');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className={styles.loading}>Yükleniyor...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Cariler</h1>
          <button className={styles.addBtn} onClick={() => handleOpenModal()}>
            + Yeni Cari Ekle
          </button>
        </div>

        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Cari ara (isim, vergi no, telefon, email)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.cardsGrid}>
          {filteredCariler.length > 0 ? (
            filteredCariler.map((cari) => (
              <div key={cari.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <h3>{cari.tamAdi || 'İsimsiz'}</h3>
                  <span
                    className={`${styles.badge} ${
                      cari.aktif !== false ? styles.active : styles.inactive
                    }`}
                  >
                    {cari.aktif !== false ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Şirket Tipi:</span>
                    <span>{cari.sirketTipi || '-'}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Vergi No:</span>
                    <span>{cari.vergiNo || '-'}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Telefon:</span>
                    <span>{cari.telefon || '-'}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Email:</span>
                    <span>{cari.email || '-'}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Şehir:</span>
                    <span>{cari.sehir || '-'}</span>
                  </div>
                </div>
                <div className={styles.cardFooter}>
                  <button
                    className={styles.editBtn}
                    onClick={() => handleOpenModal(cari)}
                  >
                    Düzenle
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(cari.id)}
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.empty}>
              <p>Henüz cari bulunmuyor</p>
              <button className={styles.addBtn} onClick={() => handleOpenModal()}>
                İlk Cariyi Ekle
              </button>
            </div>
          )}
        </div>

        {showModal && (
          <div className={styles.modalOverlay} onClick={handleCloseModal}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>{editingCari ? 'Cari Düzenle' : 'Yeni Cari Ekle'}</h2>
                <button className={styles.closeBtn} onClick={handleCloseModal}>
                  ×
                </button>
              </div>
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formSection}>
                  <h3>Hesap Bilgileri</h3>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label>Tam Adı/Unvan *</label>
                      <input
                        type="text"
                        value={formData.tamAdi}
                        onChange={(e) =>
                          setFormData({ ...formData, tamAdi: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Şirket Tipi</label>
                      <select
                        value={formData.sirketTipi}
                        onChange={(e) =>
                          setFormData({ ...formData, sirketTipi: e.target.value })
                        }
                      >
                        <option value="MÜŞTERİ">MÜŞTERİ</option>
                        <option value="TEDARİKÇİ">TEDARİKÇİ</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label>İşletme Türü</label>
                      <select
                        value={formData.isletmeTuru}
                        onChange={(e) =>
                          setFormData({ ...formData, isletmeTuru: e.target.value })
                        }
                      >
                        <option value="ŞİRKET">ŞİRKET</option>
                        <option value="BİREYSEL">BİREYSEL</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label>Vergi No</label>
                      <input
                        type="text"
                        value={formData.vergiNo}
                        onChange={(e) =>
                          setFormData({ ...formData, vergiNo: e.target.value })
                        }
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Ülke</label>
                      <input
                        type="text"
                        value={formData.ulke}
                        onChange={(e) =>
                          setFormData({ ...formData, ulke: e.target.value })
                        }
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Şehir</label>
                      <input
                        type="text"
                        value={formData.sehir}
                        onChange={(e) =>
                          setFormData({ ...formData, sehir: e.target.value })
                        }
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>İlçe</label>
                      <input
                        type="text"
                        value={formData.ilce}
                        onChange={(e) =>
                          setFormData({ ...formData, ilce: e.target.value })
                        }
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Vergi Daire</label>
                      <input
                        type="text"
                        value={formData.vergiDaire}
                        onChange={(e) =>
                          setFormData({ ...formData, vergiDaire: e.target.value })
                        }
                      />
                    </div>
                    <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                      <label>Adres</label>
                      <textarea
                        value={formData.adres}
                        onChange={(e) =>
                          setFormData({ ...formData, adres: e.target.value })
                        }
                        rows="3"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Telefon</label>
                      <input
                        type="text"
                        value={formData.telefon}
                        onChange={(e) =>
                          setFormData({ ...formData, telefon: e.target.value })
                        }
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>
                        <input
                          type="checkbox"
                          checked={formData.aktif}
                          onChange={(e) =>
                            setFormData({ ...formData, aktif: e.target.checked })
                          }
                        />
                        Aktif
                      </label>
                    </div>
                  </div>
                </div>
                <div className={styles.formActions}>
                  <button type="button" className={styles.cancelBtn} onClick={handleCloseModal}>
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

