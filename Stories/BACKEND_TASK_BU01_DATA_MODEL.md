# TASK-BU-01: Veri Modeli & DB Şema — Benzer Ürünler & Sahtecilik Analizi

**Task ID:** TASK-BU-01  
**Modül:** Ürün Yönetimi / Benzerlik & Sahtecilik Analizi  
**Öncelik:** Kritik  
**Tahmini Efor:** 3 gün  
**Bağımlılık:** Yok (ilk task)  
**Etiketler:** `backend`, `database`, `migration`, `data-model`

> **v1.1:** Görsel benzerlik ve barkod çakışma alanları kapsam dışına alındı.  
> **v1.2:** Benzerlik tablosu dört alan skoruna (marka, kategori, özellikler, ürün adı) göre yeniden modellendi. Benzer ürünler `source_product_id` başına liste olarak tutulur.

---

## Kullanıcı Hikayesi

Bir **backend developer** olarak,  
**Benzer ürün ve sahtecilik analizi verilerini saklayacak veritabanı modellerini ve migration dosyalarını oluşturmak** istiyorum,  
Böylece **diğer servisler (benzerlik skorlama, risk puanlama, raporlama) bu tablolar üzerine inşa edilebilsin**,  
Bu sayede **tüm analiz geçmişi izlenebilir, sorgulanabilir ve raporlanabilir hale gelir**.

---

## Kabul Kriterleri

### AC1: `product_similarity` Tablosu — Benzer Ürünler Listesi

- **Varsayılan olarak** İki ürün arasında benzerlik analizi yapılmış olmalıdır
- **Ne zaman** Bir benzerlik skoru hesaplanırsa
- **O zaman** Sistem şu alanları saklar:
  - `id` (UUID, PK)
  - `source_product_id` (UUID, FK → products) — analiz edilen ürün
  - `matched_product_id` (UUID, FK → products) — benzer bulunan ürün
  - `brand_similarity_score` (Float, 0.00–1.00) — marka benzerlik skoru
  - `category_similarity_score` (Float, 0.00–1.00) — kategori benzerlik skoru
  - `attributes_similarity_score` (Float, 0.00–1.00) — özellikler benzerlik skoru
  - `title_similarity_score` (Float, 0.00–1.00) — ürün adı benzerlik skoru
  - `composite_score` (Float, 0.00–1.00) — dört skorun ağırlıklı ortalaması
  - `match_reasons` (JSONB) — her alandan gelen skor ve eşleşme detayı
  - `calculated_at` (DateTime)
- **Ve** `source_product_id` + `matched_product_id` çifti için unique constraint vardır
- **Ve** `composite_score` üzerinde index oluşturulur
- **Ve** `source_product_id` üzerinde index oluşturulur — tüm benzer ürün listesi bu index ile çekilir
- **Ve** Bir ürünün benzer ürünleri `source_product_id = :product_id ORDER BY composite_score DESC` sorgusuyla liste olarak erişilebilir

### AC2: `counterfeit_flags` Tablosu

- **Varsayılan olarak** Bir ürün sahtecilik analizi yapılmış olmalıdır
- **Ne zaman** Risk puanlaması tamamlanırsa
- **O zaman** Sistem şu alanları saklar:
  - `id` (UUID, PK)
  - `product_id` (UUID, FK → products, unique) — flaglanan ürün
  - `risk_score` (Float, 0.00–100.00) — sahtecilik risk puanı
  - `risk_level` (Enum: `low` | `medium` | `high` | `critical`)
  - `risk_factors` (JSONB) — puanı oluşturan faktörler ve ağırlıkları
  - `status` (Enum: `pending_review` | `confirmed_counterfeit` | `confirmed_legitimate` | `dismissed`)
  - `reviewed_by` (UUID, FK → users, nullable)
  - `review_note` (Text, nullable)
  - `flagged_at` (DateTime)
  - `reviewed_at` (DateTime, nullable)
- **Ve** `product_id` üzerinde unique index vardır
- **Ve** `risk_level` ve `status` üzerinde compound index oluşturulur

### AC3: `similarity_jobs` Tablosu

- **Varsayılan olarak** Bir ürün onaya gönderilmiştir
- **Ne zaman** Benzerlik analizi job'ı tetiklenirse
- **O zaman** Sistem şu alanları saklar:
  - `id` (UUID, PK)
  - `product_id` (UUID, FK → products)
  - `job_type` (Enum: `similarity` | `full`) — analiz türü
  - `status` (Enum: `queued` | `processing` | `completed` | `failed`)
  - `triggered_by` (Enum: `product_submission` | `manual` | `scheduled`)
  - `error_message` (Text, nullable)
  - `started_at` (DateTime, nullable)
  - `completed_at` (DateTime, nullable)
  - `created_at` (DateTime)
- **Ve** `product_id` + `status` üzerinde compound index vardır
- **Ve** Tamamlanmış job'lar 90 gün sonra arşivlenir (soft delete)

### AC4: Migration Dosyaları

- **Ne zaman** Migration çalıştırıldığında
- **O zaman** Tüm tablolar, indexler ve foreign key kısıtlamaları otomatik olarak oluşturulur
- **Ve** Rollback (down migration) desteği mevcuttur

### AC5: Mevcut `products` Tablosuna Ek Alan

- **Ne zaman** Migration çalıştırıldığında
- **O zaman** `products` tablosuna şu alanlar eklenir:
  - `similarity_analyzed_at` (DateTime, nullable) — son analiz zamanı
  - `counterfeit_risk_level` (Enum, nullable) — hızlı erişim için denormalized alan
- **Ve** Bu alanlar nullable olup mevcut kayıtları etkilemez

---

## Teknik Gereksinimler

### TR1: Veri Modelleri

**`ProductSimilarity` Modeli — Benzer Ürünler Listesi:**
```
ProductSimilarity {
  id                         : UUID (PK, auto-generated)
  source_product_id          : UUID (FK → Product, ON DELETE CASCADE)
  matched_product_id         : UUID (FK → Product, ON DELETE CASCADE)
  brand_similarity_score     : Float       // 0.00 – 1.00
  category_similarity_score  : Float       // 0.00 – 1.00
  attributes_similarity_score: Float       // 0.00 – 1.00
  title_similarity_score     : Float       // 0.00 – 1.00
  composite_score            : Float       // ağırlıklı ortalama (bkz. TR2)
  match_reasons              : JSONB
  calculated_at              : DateTime

  UNIQUE(source_product_id, matched_product_id)
  INDEX(source_product_id, composite_score DESC)   -- benzer ürün listesi sorgusu için
  INDEX(composite_score DESC)
}
```

> **Liste Semantiği:** `source_product_id` değerine göre `product_similarity` tablosu sorgulandığında, o ürünün katalogdaki tüm benzer ürünleri `composite_score DESC` sıralamasıyla elde edilir. Bu liste BU-06 `/similar` endpoint'i tarafından döndürülür.

**`CounterfeitFlag` Modeli:**
```
CounterfeitFlag {
  id            : UUID (PK, auto-generated)
  product_id    : UUID (FK → Product, ON DELETE CASCADE, UNIQUE)
  risk_score    : Float     // 0.00 – 100.00
  risk_level    : Enum      // low | medium | high | critical
  risk_factors  : JSONB     // {
                            //   "text_similarity": { score: 50, weight: 0.60 },
                            //   "price_anomaly":   { score: 30, weight: 0.40 }
                            // }
  status        : Enum      // pending_review | confirmed_counterfeit
                            //   | confirmed_legitimate | dismissed
  reviewed_by   : UUID (FK → User, nullable)
  review_note   : Text (nullable)
  flagged_at    : DateTime
  reviewed_at   : DateTime (nullable)

  UNIQUE(product_id)
  INDEX(risk_level, status)
  INDEX(flagged_at DESC)
}
```

**`SimilarityJob` Modeli:**
```
SimilarityJob {
  id             : UUID (PK, auto-generated)
  product_id     : UUID (FK → Product, ON DELETE CASCADE)
  job_type       : Enum      // similarity | full
  status         : Enum      // queued | processing | completed | failed
  triggered_by   : Enum      // product_submission | manual | scheduled
  error_message  : Text (nullable)
  started_at     : DateTime (nullable)
  completed_at   : DateTime (nullable)
  created_at     : DateTime

  INDEX(product_id, status)
  INDEX(status, created_at)
}
```

### TR2: Composite Score Ağırlıkları

```python
FIELD_WEIGHTS = {
    "brand":      0.35,   # Marka — typosquat tespiti için en kritik
    "title":      0.30,   # Ürün adı
    "attributes": 0.25,   # Özellikler (renk, beden, malzeme vb.)
    "category":   0.10,   # Kategori — destekleyici sinyal
}

def compute_composite_score(brand, title, attributes, category) -> float:
    return (
        brand      * FIELD_WEIGHTS["brand"]      +
        title      * FIELD_WEIGHTS["title"]      +
        attributes * FIELD_WEIGHTS["attributes"] +
        category   * FIELD_WEIGHTS["category"]
    )
```

### TR3: JSONB Şema Kuralları

**`match_reasons` alanı için beklenen format:**
```json
{
  "brand": {
    "score": 0.94,
    "match_type": "typosquat",
    "detail": "'Nikee' → 'Nike'"
  },
  "category": {
    "score": 1.00,
    "match_type": "exact",
    "detail": "Spor Ayakkabı (cat-uuid-123)"
  },
  "attributes": {
    "score": 0.80,
    "matched_keys": ["renk", "beden", "malzeme"],
    "total_keys": 5,
    "detail": "5 özellikten 4'ü eşleşti"
  },
  "title": {
    "score": 0.91,
    "jaccard": 0.87,
    "fuzzy": 0.93,
    "detail": "Başlık yüksek benzerlik"
  }
}
```

**`risk_factors` alanı için beklenen format:**
```json
{
  "text_similarity": {
    "detected": true,
    "score": 50.0,
    "weight": 0.60,
    "detail": "Composite benzerlik: 0.91 — marka typosquat dahil",
    "field_breakdown": {
      "brand": 0.94,
      "category": 1.00,
      "attributes": 0.80,
      "title": 0.91
    }
  },
  "price_anomaly": {
    "detected": true,
    "score": 30.0,
    "weight": 0.40,
    "detail": "Kategori medyanından %72 düşük"
  }
}
```

### TR4: `products` Tablosu Ek Alanlar

```sql
ALTER TABLE products
  ADD COLUMN similarity_analyzed_at TIMESTAMP NULL,
  ADD COLUMN counterfeit_risk_level VARCHAR(20) NULL
    CHECK (counterfeit_risk_level IN ('low', 'medium', 'high', 'critical'));

CREATE INDEX idx_products_counterfeit_risk ON products(counterfeit_risk_level)
  WHERE counterfeit_risk_level IS NOT NULL;
```

### TR5: Migration Dosyası Yapısı

```
migrations/
  ├── 0042_create_product_similarity.sql
  ├── 0043_create_counterfeit_flags.sql
  ├── 0044_create_similarity_jobs.sql
  └── 0045_alter_products_add_similarity_fields.sql
```

Her migration `-- UP` ve `-- DOWN` bloklarını içerir.

### TR6: Performans Notları

- `product_similarity` tablosu büyük veri hacmine ulaşabilir; partition by `calculated_at` (monthly) düşünülmelidir
- `(source_product_id, composite_score DESC)` compound index benzer ürün listesi sorgusunu hızlandırır
- `counterfeit_flags.risk_factors` JSONB alanı üzerinde GIN index önerilir
- `similarity_jobs` için tamamlanmış kayıtların periyodik temizliği (TTL job) planlanmalıdır

---

## Kapsam Dışı

- Benzerlik hesaplama algoritmaları (BU-03'ün sorumluluğu)
- Risk puanlama motoru (BU-05'in sorumluluğu)
- API endpoint'leri (BU-06'nın sorumluluğu)
- Seed data veya test fixture'ları (ayrı task)

---

## Test Senaryoları

### Unit Tests
1. `test_product_similarity_unique_constraint()` — Aynı çift ikinci kez eklendiğinde hata fırlatılmalı
2. `test_composite_score_weighted_correctly()` — Ağırlıklı ortalama doğru hesaplanıyor mu
3. `test_field_scores_range()` — Tüm alan skorları 0.00–1.00 arasında olmalı
4. `test_counterfeit_flag_unique_per_product()` — Bir ürüne ikinci flag eklendiğinde hata
5. `test_risk_level_enum_validation()` — Geçersiz enum değeri reddedilmeli

### Migration Tests
1. `test_migration_up()` — Tüm tablolar, indexler ve alanlar oluşmuş olmalı
2. `test_migration_down()` — Rollback sonrası tablolar kaldırılmış olmalı
3. `test_existing_products_not_affected()` — Mevcut kayıtlar migration sonrası bozulmamalı

---

## Definition of Done (DoD)

✅ Tüm tablolar ve indexler migration dosyaları ile oluşturuluyor  
✅ Rollback (down migration) testi geçiyor  
✅ ORM model tanımları tamamlandı ve validate edildi  
✅ JSONB şema kuralları (match_reasons, risk_factors) dokümante edildi  
✅ Code review tamamlandı  
✅ Staging DB'de migration başarıyla çalıştırıldı  

---

## Tahmini Efor

| Alt Görev | Süre |
|---|---|
| Model ve şema tasarımı | 1 gün |
| Migration dosyaları yazımı | 1 gün |
| Unit & migration testleri | 0.5 gün |
| Code review & düzeltmeler | 0.5 gün |
| **Toplam** | **3 gün** |
