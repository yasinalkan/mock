# TASK-BU-09: Sahtecilik Analizi Raporlama API'si

**Task ID:** TASK-BU-09  
**Modül:** Ürün Yönetimi / Benzerlik & Sahtecilik Analizi  
**Öncelik:** Düşük  
**Tahmini Efor:** 2 gün  
**Bağımlılık:** TASK-BU-06 (API Endpoint'ler)  
**Etiketler:** `backend`, `api`, `reporting`, `analytics`

> **v1.1 Güncelleme:** Faktör analizi raporu sadeleştirildi — yalnızca `brand_typosquat` ve `price_anomaly` faktörleri raporlanır.

---

## Kullanıcı Hikayesi

Bir **backend developer** olarak,  
**Sahtecilik analizi istatistiklerini, trend verilerini ve tedarikçi bazlı kırılımları sunan raporlama API endpoint'lerini geliştirmek** istiyorum,  
Böylece **CSA Admin sahtecilik girişimlerini zaman içinde izleyebilsin, hangi tedarikçilerin yüksek risk taşıdığını görebilsin ve sistemin ne kadar etkili çalıştığını ölçebilsin**,  
Bu sayede **operasyon ekibi veri odaklı kararlar alarak tedarikçi yönetimini proaktif yürütebilir**.

---

## Kabul Kriterleri

### AC1: Genel Özet Raporu (Dashboard İçin)

- **Varsayılan olarak** CSA Admin dashboard'a erişmektedir
- **Ne zaman** `GET /api/reports/counterfeit/summary` isteği gelirse
- **O zaman** Sistem şu metrikleri döner:
  - `total_flagged` — Toplam flaglenen ürün sayısı (tüm zamanlar)
  - `pending_review` — Şu anda inceleme bekleyen sayısı
  - `confirmed_counterfeit` — Onaylanan sahte ürün sayısı
  - `confirmed_legitimate` — Sahte olmadığı onaylanan sayısı
  - `dismissed` — Kapatılan flag sayısı
  - `auto_rejected_this_month` — Bu ay sistemin otomatik durdurduğu ürün sayısı
  - `avg_review_time_hours` — Ortalama inceleme süresi (saat cinsinden)
  - `detection_rate` — Flaglenenlerin onaylanan sahteye dönüşme oranı (%)
- **Ve** Tarih aralığı filtresi desteklenir: `?from=2026-01-01&to=2026-05-11`
- **Ve** Yalnızca CSA Admin ve CSA Standart erişebilir

### AC2: Risk Seviyesi Dağılımı

- **Varsayılan olarak** Belirli bir dönemde analizler tamamlanmıştır
- **Ne zaman** `GET /api/reports/counterfeit/risk-distribution` isteği gelirse
- **O zaman** Sistem şunları döner:
  - Risk seviyesi başına ürün sayısı ve yüzdesi (low / medium / high / critical)
  - Haftalık veya aylık trend (her dönemde risk seviyesi dağılımı)
  - En yüksek ortalama risk skoru olan kategoriler (top 5)
- **Ve** `granularity` parametresi ile haftalık veya aylık kırılım seçilebilir

### AC3: Tedarikçi Bazlı Sahtecilik Analizi

- **Varsayılan olarak** CSA Admin tedarikçileri risk açısından karşılaştırmak istemektedir
- **Ne zaman** `GET /api/reports/counterfeit/by-supplier` isteği gelirse
- **O zaman** Sistem şunları döner:
  - Her tedarikçi için: toplam flaglenen, onaylanan sahte, temize çıkan, bekleyen sayıları
  - `counterfeit_rate` — (confirmed_counterfeit / total_products) × 100
  - `avg_risk_score` — Tedarikçinin tüm ürünleri için ortalama risk skoru
  - Son 30 günde en çok flaglenen 10 tedarikçi (varsayılan sıralama)
- **Ve** `supplier_id` filtresi ile tek tedarikçi detayı görüntülenebilir
- **Ve** Yalnızca CSA Admin bu endpoint'e erişebilir (tedarikçiler başka tedarikçileri göremez)

### AC4: Risk Faktörü Analizi

- **Varsayılan olarak** Sistemde birçok flaglenen ürün mevcuttur
- **Ne zaman** `GET /api/reports/counterfeit/factor-analysis` isteği gelirse
- **O zaman** Sistem şunları döner:
  - Her risk faktörünün toplam kaç ürünü tetiklediği:
    - `brand_typosquat_count`
    - `price_anomaly_count`
    - `both_factors_count` — her iki faktörün birlikte tetiklendiği ürün sayısı
  - Faktör bazında "sahte onaylanma" dönüşüm oranı (hangi faktör en güvenilir sinyal?)
- **Ve** Bu veriler ağırlık optimizasyonu için kullanılabilir (BU-05 konfigürasyonuna girdi)

### AC5: Zaman Bazlı Trend Raporu

- **Varsayılan olarak** CSA Admin trendi izlemek istemektedir
- **Ne zaman** `GET /api/reports/counterfeit/trend` isteği gelirse
- **O zaman** Sistem şunları döner:
  - Seçilen tarih aralığında haftalık/aylık bazda:
    - Yeni flaglenen ürün sayısı
    - İnceleme tamamlanan sayısı
    - Onaylanan sahte sayısı
    - Ortalama risk skoru
  - Veriler JSON formatında döner, frontend grafik çizmek için kullanır
- **Ve** Tarih aralığı maksimum 12 ay olabilir

### AC6: Excel Export Desteği

- **Varsayılan olarak** CSA Admin raporu dışa aktarmak istemektedir
- **Ne zaman** Herhangi bir raporlama endpoint'ine `?format=xlsx` parametresi eklenirse
- **O zaman** Sistem Excel dosyası döner (`Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`)
- **Ve** Excel dosyası tüm alanları ve Türkçe sütun başlıklarını içerir
- **Ve** Büyük veri setleri (> 10.000 satır) için arka planda hazırlanır ve indirme linki döner

---

## Teknik Gereksinimler

### TR1: API Endpoint Listesi

```
GET /api/reports/counterfeit/summary              → Genel özet
GET /api/reports/counterfeit/risk-distribution    → Risk seviyesi dağılımı
GET /api/reports/counterfeit/by-supplier          → Tedarikçi bazlı analiz
GET /api/reports/counterfeit/factor-analysis      → Risk faktörü analizi
GET /api/reports/counterfeit/trend                → Zaman bazlı trend

Ortak query parametreler:
  from=YYYY-MM-DD    (tarih filtresi başlangıç)
  to=YYYY-MM-DD      (tarih filtresi bitiş)
  format=json|xlsx   (çıktı formatı, varsayılan: json)
  granularity=weekly|monthly (trend için)
```

### TR2: Özet Raporu Response Örneği

```json
GET /api/reports/counterfeit/summary?from=2026-01-01&to=2026-05-11

Response 200:
{
  "success": true,
  "data": {
    "period": { "from": "2026-01-01", "to": "2026-05-11" },
    "totals": {
      "total_flagged": 142,
      "pending_review": 18,
      "confirmed_counterfeit": 67,
      "confirmed_legitimate": 41,
      "dismissed": 16,
      "auto_rejected_this_month": 12
    },
    "efficiency": {
      "detection_rate_pct": 47.2,
      "avg_review_time_hours": 6.4,
      "false_positive_rate_pct": 28.9
    }
  }
}
```

### TR3: Tedarikçi Bazlı Rapor SQL (Örnek)

```sql
SELECT
  s.id AS supplier_id,
  s.name AS supplier_name,
  COUNT(cf.id) AS total_flagged,
  COUNT(CASE WHEN cf.status = 'confirmed_counterfeit' THEN 1 END) AS confirmed_counterfeit,
  COUNT(CASE WHEN cf.status = 'confirmed_legitimate' THEN 1 END) AS confirmed_legitimate,
  COUNT(CASE WHEN cf.status = 'pending_review' THEN 1 END) AS pending_review,
  ROUND(AVG(cf.risk_score)::numeric, 2) AS avg_risk_score,
  ROUND(
    COUNT(CASE WHEN cf.status = 'confirmed_counterfeit' THEN 1 END)::numeric
    / NULLIF(COUNT(p.id), 0) * 100, 2
  ) AS counterfeit_rate_pct
FROM suppliers s
JOIN products p ON p.supplier_id = s.id
LEFT JOIN counterfeit_flags cf ON cf.product_id = p.id
WHERE cf.flagged_at BETWEEN :from_date AND :to_date
GROUP BY s.id, s.name
ORDER BY confirmed_counterfeit DESC, avg_risk_score DESC
LIMIT :limit;
```

### TR4: Performans ve Cache

- Özet raporu sonuçları Redis'te 15 dakika cache'lenir (TTL: 900 saniye)
- Cache key: `report:counterfeit:summary:{from}:{to}`
- Trend raporu için DB'de pre-aggregated tablo (`counterfeit_daily_stats`) günlük batch ile doldurulur
- Excel export > 10.000 satır için Celery task, indirme URL'si `GET /api/reports/counterfeit/downloads/{job_id}` üzerinden erişilir

### TR5: `counterfeit_daily_stats` Pre-aggregation Tablosu

```sql
CREATE TABLE counterfeit_daily_stats (
  date              DATE PRIMARY KEY,
  new_flagged       INT DEFAULT 0,
  reviews_completed INT DEFAULT 0,
  confirmed_fake    INT DEFAULT 0,
  confirmed_legit   INT DEFAULT 0,
  dismissed         INT DEFAULT 0,
  avg_risk_score    FLOAT,
  updated_at        TIMESTAMP DEFAULT NOW()
);

-- Her gece 02:00'de Celery beat ile doldurulur
```

### TR6: Hata Kodları

```
200 - OK
400 - Bad Request: Geçersiz tarih formatı veya parametre
401 - Unauthorized
403 - Forbidden: Tedarikçi rolü erişemez
422 - Unprocessable Entity: `to` tarihi `from`'dan önce olamaz
429 - Too Many Requests: Excel export kuyruğu dolu (max 3 eş zamanlı)
500 - Internal Server Error
```

---

## Kullanıcı Senaryoları

### Senaryo 1: Haftalık Operasyon Değerlendirmesi
1. CSA Admin her Pazartesi haftalık özet raporu inceler
2. `GET /api/reports/counterfeit/summary?from=2026-05-04&to=2026-05-11`
3. 23 yeni flag, 8 sahte onaylandı, ortalama inceleme süresi 5.2 saat
4. Admin inceleme süresinin arttığını görür, ekibe ek kaynak planlar

### Senaryo 2: Şüpheli Tedarikçi Tespiti
1. CSA Admin tedarikçi bazlı raporu çeker
2. `GET /api/reports/counterfeit/by-supplier`
3. "Tedarikçi X"in sahtecilik oranı %38 — anormal yüksek
4. Admin tedarikçiyi askıya alma sürecini başlatır

### Senaryo 3: Sistem Kalibrasyon — Faktör Analizi
1. Product ekibi hangi faktörün en güvenilir sinyal olduğunu merak eder
2. `GET /api/reports/counterfeit/factor-analysis`
3. `brand_typosquat` → sahte onay oranı %74 (güçlü sinyal)
4. `price_anomaly` tek başına → sahte onay oranı %28 (destekleyici sinyal)
5. `brand_typosquat` + `price_anomaly` birlikte → sahte onay oranı %91
6. Bu veriyle BU-05 ağırlıkları kalibre edilir

---

## Kapsam Dışı

- Frontend grafik bileşenleri (ayrı frontend story)
- Tedarikçiye özel sahtecilik raporu erişimi — gelecek sprint
- Gerçek zamanlı rapor (WebSocket) — gelecek sprint
- ML model performans metrikleri (precision/recall) — gelecek sprint

---

## Test Senaryoları

### Unit Tests
1. `test_summary_period_filter()` — Tarih filtresi doğru çalışıyor mu
2. `test_supplier_isolation_in_report()` — Tedarikçi rolü başka tedarikçileri göremiyor
3. `test_detection_rate_calculation()` — Oran hesaplaması doğru mu
4. `test_invalid_date_range_returns_422()` — `to < from` → 422

### Integration Tests
1. `test_summary_cache_hit()` — İkinci istek cache'den dönüyor mu
2. `test_excel_export_large_dataset()` — 10.000+ satır async export çalışıyor mu
3. `test_trend_data_continuity()` — Her günün verisi mevcut mu (gap yok)

---

## Definition of Done (DoD)

✅ 5 raporlama endpoint'i çalışıyor ve test edildi  
✅ Redis cache mekanizması özet rapor için aktif  
✅ Excel export Celery task'ı çalışıyor  
✅ `counterfeit_daily_stats` batch job kuruldu  
✅ Yetki kontrolü (CSA-only) doğrulandı  
✅ Code review tamamlandı  

---

## Tahmini Efor

| Alt Görev | Süre |
|---|---|
| 5 raporlama endpoint'i geliştirme | 1 gün |
| Redis cache entegrasyonu | 0.25 gün |
| Excel export Celery task'ı | 0.25 gün |
| Testler | 0.5 gün |
| **Toplam** | **2 gün** |
