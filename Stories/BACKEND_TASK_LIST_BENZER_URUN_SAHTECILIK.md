# Backend Task Listesi: Benzer Ürünler & Sahtecilik Analizi

**Modül:** Ürün Yönetimi — Sahtecilik & Benzerlik Analizi  
**Versiyon:** 1.1  
**Tarih:** Mayıs 2026  
**Durum:** Taslak

---

## Genel Bakış

Bu özellik, tedarikçilerin sisteme yüklediği ürünlerin katalogdaki mevcut ürünlerle **metin benzerliğini** ölçer ve **sahtecilik / taklit ürün riskini** otomatik olarak puanlar. Ürün onay (audit) sürecine entegre çalışır; yüksek riskli ürünleri CSA Admin'e flagler.

### Hedefler
- Typosquat marka taklit girişimlerini (örn. "Nikee" → "Nike") erken aşamada belirlemek
- İçerik kopyalamasını (başlık/açıklama benzerliği) tespit etmek
- Fiyat anomalisi sinyaliyle sahtecilik riskini güçlendirmek
- CSA Admin inceleme sürecini hızlandırmak için risk skoru ve karşılaştırma verisi sunmak

---

## Task Listesi

| Task ID | Başlık | Öncelik | Tahmini Efor | Bağımlılık |
|---|---|---|---|---|
| TASK-BU-01 | Veri Modeli & DB Şema | Kritik | 3 gün | — |
| TASK-BU-03 | Metin Tabanlı Benzerlik Skorlama Servisi | Yüksek | 4 gün | BU-01 |
| TASK-BU-05 | Sahtecilik Risk Puanlama Motoru | Kritik | 3 gün | BU-03 |
| TASK-BU-06 | Benzer Ürünler & Sahtecilik Flag API Endpoint'leri | Yüksek | 2 gün | BU-05 |
| TASK-BU-07 | Ürün Onay Sürecine Entegrasyon | Yüksek | 2 gün | BU-05, BU-06 |
| TASK-BU-09 | Sahtecilik Analizi Raporlama API'si | Düşük | 2 gün | BU-06 |

**Toplam Tahmini Efor:** ~16 gün

---

## Bağımlılık Diyagramı

```
BU-01 (DB Şema)
  └── BU-03 (Metin Benzerliği)
            └── BU-05 (Risk Puanlama)
                      ├── BU-06 (API Endpoints) ──→ BU-09 (Raporlama)
                      └── BU-07 (Onay Entegrasyonu)
```

---

## Benzerlik Skoru — Alan Ağırlıkları (BU-03)

Composite benzerlik skoru dört alandan oluşur:

| Alan | Ağırlık | Yöntem |
|---|---|---|
| Marka | %35 | Fuzzy matching + homoglyph tespiti |
| Ürün Adı | %30 | Jaccard + Fuzzy + TF-IDF cosine |
| Özellikler (Attributes) | %25 | Key-value Jaccard |
| Kategori | %10 | Hiyerarşi derinliği skoru |

Benzer ürünler `product_similarity` tablosunda liste olarak tutulur (composite ≥ 0.50).

## Risk Puanlama Faktörleri (BU-05)

| Faktör | Maks. Puan | Ağırlık | Kaynak |
|---|---|---|---|
| Benzerlik Skoru (4 alanlı composite) | 60 puan | %60 | BU-03 |
| Fiyat Anomalisi | 40 puan | %40 | Dahili hesaplama |

---

## Task Detay Dosyaları

| Dosya | İçerik |
|---|---|
| [BACKEND_TASK_BU01_DATA_MODEL.md](./BACKEND_TASK_BU01_DATA_MODEL.md) | Veri modeli ve DB şema |
| [BACKEND_TASK_BU03_TEXT_SIMILARITY.md](./BACKEND_TASK_BU03_TEXT_SIMILARITY.md) | Metin benzerlik servisi |
| [BACKEND_TASK_BU05_RISK_SCORING.md](./BACKEND_TASK_BU05_RISK_SCORING.md) | Risk puanlama motoru |
| [BACKEND_TASK_BU06_API_ENDPOINTS.md](./BACKEND_TASK_BU06_API_ENDPOINTS.md) | Ana API endpoint'leri |
| [BACKEND_TASK_BU07_APPROVAL_INTEGRATION.md](./BACKEND_TASK_BU07_APPROVAL_INTEGRATION.md) | Onay süreci entegrasyonu |
| [BACKEND_TASK_BU09_REPORTING.md](./BACKEND_TASK_BU09_REPORTING.md) | Raporlama API'si |

---

*Bu doküman yaşayan bir belgedir; sprint planlamasına göre güncellenecektir.*
