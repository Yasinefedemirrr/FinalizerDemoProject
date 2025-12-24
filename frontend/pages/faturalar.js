import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import styles from '../styles/Faturalar.module.css';

export default function Faturalar() {
  const [faturalar, setFaturalar] = useState([]);
  const [cariler, setCariler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFatura, setEditingFatura] = useState(null);
  const [formData, setFormData] = useState({
    faturaNo: '',
    faturaTarihi: new Date().toISOString().split('T')[0],
    faturaTuru: 'E-FATURA',
    faturaSenaryosu: 'TİCARİ FATURA',
    faturaTipi: 'SATIŞ',
    cariId: '',
    cariBilgileri: {},
    paraBirimi: 'TL',
    dovizKuru: '1',
    odemeTuru: 'Nakit',
    lineItems: [
      {
        urunKodu: '',
        urunAdi: '',
        depo: 'Ana Depo',
        miktar: '1',
        birimFiyat: '0',
        birim: 'Adet',
        kdvOrani: '20',
        iskonto: '0',
        toplamTutar: '0',
      },
    ],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [faturalarRes, carilerRes] = await Promise.all([
        api.get('/fatura'),
        api.get('/cari'),
      ]);
      setFaturalar(faturalarRes.data);
      setCariler(carilerRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (fatura = null) => {
    if (fatura) {
      setEditingFatura(fatura);
      setFormData(fatura);
    } else {
      setEditingFatura(null);
      setFormData({
        faturaNo: '',
        faturaTarihi: new Date().toISOString().split('T')[0],
        faturaTuru: 'E-FATURA',
        faturaSenaryosu: 'TİCARİ FATURA',
        faturaTipi: 'SATIŞ',
        cariId: '',
        cariBilgileri: {},
        paraBirimi: 'TL',
        dovizKuru: '1',
        odemeTuru: 'Nakit',
        lineItems: [
          {
            urunKodu: '',
            urunAdi: '',
            depo: 'Ana Depo',
            miktar: '1',
            birimFiyat: '0',
            birim: 'Adet',
            kdvOrani: '20',
            iskonto: '0',
            toplamTutar: '0',
          },
        ],
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingFatura(null);
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
          telefon: selectedCari.telefon,
          email: selectedCari.email,
          adres: selectedCari.adres,
          sehir: selectedCari.sehir,
        },
      });
    }
  };

  const handleLineItemChange = (index, field, value) => {
    const newLineItems = [...formData.lineItems];
    newLineItems[index] = {
      ...newLineItems[index],
      [field]: value,
    };

    // Toplam tutar hesapla
    const miktar = parseFloat(newLineItems[index].miktar || 0);
    const birimFiyat = parseFloat(newLineItems[index].birimFiyat || 0);
    const iskonto = parseFloat(newLineItems[index].iskonto || 0);
    const toplam = miktar * birimFiyat - iskonto;
    newLineItems[index].toplamTutar = toplam.toFixed(2);

    setFormData({ ...formData, lineItems: newLineItems });
  };

  const addLineItem = () => {
    setFormData({
      ...formData,
      lineItems: [
        ...formData.lineItems,
        {
          urunKodu: '',
          urunAdi: '',
          depo: 'Ana Depo',
          miktar: '1',
          birimFiyat: '0',
          birim: 'Adet',
          kdvOrani: '20',
          iskonto: '0',
          toplamTutar: '0',
        },
      ],
    });
  };

  const removeLineItem = (index) => {
    const newLineItems = formData.lineItems.filter((_, i) => i !== index);
    setFormData({ ...formData, lineItems: newLineItems });
  };

  const calculateTotals = () => {
    let tutar = 0;
    let iskonto = 0;
    let kdvTutari = 0;

    formData.lineItems.forEach((item) => {
      const miktar = parseFloat(item.miktar || 0);
      const birimFiyat = parseFloat(item.birimFiyat || 0);
      const itemIskonto = parseFloat(item.iskonto || 0);
      const kdvOrani = parseFloat(item.kdvOrani || 0);

      const itemTutar = miktar * birimFiyat;
      const itemMatrah = itemTutar - itemIskonto;
      const itemKdv = itemMatrah * (kdvOrani / 100);

      tutar += itemTutar;
      iskonto += itemIskonto;
      kdvTutari += itemKdv;
    });

    const matrah = tutar - iskonto;
    const genelToplam = matrah + kdvTutari;

    return {
      tutar: tutar.toFixed(2),
      iskonto: iskonto.toFixed(2),
      matrah: matrah.toFixed(2),
      kdvTutari: kdvTutari.toFixed(2),
      digerVergiToplami: '0.00',
      genelToplam: genelToplam.toFixed(2),
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const totals = calculateTotals();
      const submitData = {
        ...formData,
        toplamlar: totals,
      };

      if (editingFatura) {
        await api.put(`/fatura/${editingFatura.id}`, submitData);
      } else {
        await api.post('/fatura', submitData);
      }
      fetchData();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving fatura:', error);
      alert('Fatura kaydedilirken bir hata oluştu');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bu faturayı silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/fatura/${id}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting fatura:', error);
      alert('Fatura silinirken bir hata oluştu');
    }
  };

  const totals = calculateTotals();

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
          <h1>Faturalar</h1>
          <button className={styles.addBtn} onClick={() => handleOpenModal()}>
            + Yeni Fatura Oluştur
          </button>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Fatura No</th>
                <th>Tarih</th>
                <th>Cari</th>
                <th>Tutar</th>
                <th>Durum</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {faturalar.length > 0 ? (
                faturalar.map((fatura) => (
                  <tr key={fatura.id}>
                    <td>{fatura.faturaNo}</td>
                    <td>{fatura.faturaTarihi}</td>
                    <td>
                      {fatura.cariBilgileri?.tamAdi ||
                        fatura.cariBilgileri?.unvan ||
                        '-'}
                    </td>
                    <td>
                      {parseFloat(fatura.toplamlar?.genelToplam || 0).toLocaleString('tr-TR', {
                        style: 'currency',
                        currency: 'TRY',
                      })}
                    </td>
                    <td>
                      <span className={styles.statusBadge}>Aktif</span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={styles.editBtn}
                          onClick={() => handleOpenModal(fatura)}
                        >
                          Düzenle
                        </button>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => handleDelete(fatura.id)}
                        >
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className={styles.empty}>
                    Henüz fatura bulunmuyor
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
                <h2>{editingFatura ? 'Fatura Düzenle' : 'Yeni Fatura Oluştur'}</h2>
                <button className={styles.closeBtn} onClick={handleCloseModal}>
                  ×
                </button>
              </div>
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGrid}>
                  {/* Sol Panel - Alıcı Bilgileri */}
                  <div className={styles.panel}>
                    <h3>Alıcı Bilgileri</h3>
                    <div className={styles.formGroup}>
                      <label>Cari Seç *</label>
                      <select
                        value={formData.cariId}
                        onChange={(e) => handleCariSelect(e.target.value)}
                        required
                      >
                        <option value="">Cari Seçiniz</option>
                        {cariler.map((cari) => (
                          <option key={cari.id} value={cari.id}>
                            {cari.tamAdi}
                          </option>
                        ))}
                      </select>
                    </div>
                    {formData.cariBilgileri.tamAdi && (
                      <>
                        <div className={styles.formGroup}>
                          <label>Unvan</label>
                          <input
                            type="text"
                            value={formData.cariBilgileri.tamAdi || ''}
                            readOnly
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label>VKN/TCKN</label>
                          <input
                            type="text"
                            value={formData.cariBilgileri.vergiNo || ''}
                            readOnly
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label>Telefon</label>
                          <input
                            type="text"
                            value={formData.cariBilgileri.telefon || ''}
                            readOnly
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label>Email</label>
                          <input
                            type="email"
                            value={formData.cariBilgileri.email || ''}
                            readOnly
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label>Adres</label>
                          <textarea
                            value={formData.cariBilgileri.adres || ''}
                            readOnly
                            rows="3"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Sağ Panel - Fatura Bilgileri */}
                  <div className={styles.panel}>
                    <h3>Fatura Bilgileri</h3>
                    <div className={styles.formGroup}>
                      <label>Fatura Numarası</label>
                      <input
                        type="text"
                        value={formData.faturaNo}
                        onChange={(e) =>
                          setFormData({ ...formData, faturaNo: e.target.value })
                        }
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Fatura Tarihi *</label>
                      <input
                        type="date"
                        value={formData.faturaTarihi}
                        onChange={(e) =>
                          setFormData({ ...formData, faturaTarihi: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Fatura Türü</label>
                      <select
                        value={formData.faturaTuru}
                        onChange={(e) =>
                          setFormData({ ...formData, faturaTuru: e.target.value })
                        }
                      >
                        <option value="E-FATURA">E-FATURA</option>
                        <option value="E-ARŞİV">E-ARŞİV</option>
                        <option value="FATURA">FATURA</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label>Fatura Senaryosu</label>
                      <select
                        value={formData.faturaSenaryosu}
                        onChange={(e) =>
                          setFormData({ ...formData, faturaSenaryosu: e.target.value })
                        }
                      >
                        <option value="TİCARİ FATURA">TİCARİ FATURA</option>
                        <option value="YOLCU BERABERİ">YOLCU BERABERİ</option>
                        <option value="İHRACAT">İHRACAT</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label>Fatura Tipi</label>
                      <select
                        value={formData.faturaTipi}
                        onChange={(e) =>
                          setFormData({ ...formData, faturaTipi: e.target.value })
                        }
                      >
                        <option value="SATIŞ">SATIŞ</option>
                        <option value="ALIŞ">ALIŞ</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label>Para Birimi</label>
                      <select
                        value={formData.paraBirimi}
                        onChange={(e) =>
                          setFormData({ ...formData, paraBirimi: e.target.value })
                        }
                      >
                        <option value="TL">TL (TÜRK LİRASI)</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label>Döviz Kuru</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.dovizKuru}
                        onChange={(e) =>
                          setFormData({ ...formData, dovizKuru: e.target.value })
                        }
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Ödeme Türü</label>
                      <select
                        value={formData.odemeTuru}
                        onChange={(e) =>
                          setFormData({ ...formData, odemeTuru: e.target.value })
                        }
                      >
                        <option value="Nakit">Nakit</option>
                        <option value="Kredi Kartı">Kredi Kartı</option>
                        <option value="Havale">Havale</option>
                        <option value="Çek">Çek</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Ürün Tablosu */}
                <div className={styles.productsSection}>
                  <div className={styles.sectionHeader}>
                    <h3>Ürün/Hizmet Detayları</h3>
                    <button
                      type="button"
                      className={styles.addProductBtn}
                      onClick={addLineItem}
                    >
                      + Ürün Ekle
                    </button>
                  </div>
                  <div className={styles.tableWrapper}>
                    <table className={styles.productsTable}>
                      <thead>
                        <tr>
                          <th>Ürün Kodu</th>
                          <th>Ürün Adı</th>
                          <th>Depo</th>
                          <th>Miktar</th>
                          <th>Birim Fiyat</th>
                          <th>Birim</th>
                          <th>KDV %</th>
                          <th>İskonto</th>
                          <th>Toplam</th>
                          <th>İşlem</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.lineItems.map((item, index) => (
                          <tr key={index}>
                            <td>
                              <input
                                type="text"
                                value={item.urunKodu}
                                onChange={(e) =>
                                  handleLineItemChange(index, 'urunKodu', e.target.value)
                                }
                                className={styles.tableInput}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                value={item.urunAdi}
                                onChange={(e) =>
                                  handleLineItemChange(index, 'urunAdi', e.target.value)
                                }
                                className={styles.tableInput}
                              />
                            </td>
                            <td>
                              <select
                                value={item.depo}
                                onChange={(e) =>
                                  handleLineItemChange(index, 'depo', e.target.value)
                                }
                                className={styles.tableInput}
                              >
                                <option value="Ana Depo">Ana Depo</option>
                                <option value="Depo 1">Depo 1</option>
                                <option value="Depo 2">Depo 2</option>
                              </select>
                            </td>
                            <td>
                              <input
                                type="number"
                                step="0.01"
                                value={item.miktar}
                                onChange={(e) =>
                                  handleLineItemChange(index, 'miktar', e.target.value)
                                }
                                className={styles.tableInput}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                step="0.01"
                                value={item.birimFiyat}
                                onChange={(e) =>
                                  handleLineItemChange(index, 'birimFiyat', e.target.value)
                                }
                                className={styles.tableInput}
                              />
                            </td>
                            <td>
                              <select
                                value={item.birim}
                                onChange={(e) =>
                                  handleLineItemChange(index, 'birim', e.target.value)
                                }
                                className={styles.tableInput}
                              >
                                <option value="Adet">Adet</option>
                                <option value="Kg">Kg</option>
                                <option value="Lt">Lt</option>
                                <option value="m²">m²</option>
                              </select>
                            </td>
                            <td>
                              <select
                                value={item.kdvOrani}
                                onChange={(e) =>
                                  handleLineItemChange(index, 'kdvOrani', e.target.value)
                                }
                                className={styles.tableInput}
                              >
                                <option value="0">0</option>
                                <option value="1">1</option>
                                <option value="10">10</option>
                                <option value="20">20</option>
                              </select>
                            </td>
                            <td>
                              <input
                                type="number"
                                step="0.01"
                                value={item.iskonto}
                                onChange={(e) =>
                                  handleLineItemChange(index, 'iskonto', e.target.value)
                                }
                                className={styles.tableInput}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                value={item.toplamTutar}
                                readOnly
                                className={styles.tableInput}
                              />
                            </td>
                            <td>
                              <button
                                type="button"
                                className={styles.removeBtn}
                                onClick={() => removeLineItem(index)}
                              >
                                ×
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Toplamlar */}
                  <div className={styles.totalsSection}>
                    <div className={styles.totalsGrid}>
                      <div className={styles.totalItem}>
                        <label>Tutar:</label>
                        <span>{parseFloat(totals.tutar).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
                      </div>
                      <div className={styles.totalItem}>
                        <label>İskonto:</label>
                        <span>{parseFloat(totals.iskonto).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
                      </div>
                      <div className={styles.totalItem}>
                        <label>Fatura Matrahı:</label>
                        <span>{parseFloat(totals.matrah).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
                      </div>
                      <div className={styles.totalItem}>
                        <label>KDV Tutarı:</label>
                        <span>{parseFloat(totals.kdvTutari).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
                      </div>
                      <div className={styles.totalItem}>
                        <label>Diğer Vergi Toplamı:</label>
                        <span>{parseFloat(totals.digerVergiToplami).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
                      </div>
                      <div className={`${styles.totalItem} ${styles.genelToplam}`}>
                        <label>Genel Toplam:</label>
                        <span>{parseFloat(totals.genelToplam).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.formActions}>
                  <button type="button" className={styles.cancelBtn} onClick={handleCloseModal}>
                    Kapat
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

