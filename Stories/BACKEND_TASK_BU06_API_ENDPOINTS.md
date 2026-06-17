# TASK-BU-06: Benzer Ürünler & Sahtecilik Flag API Endpoint'leri

**Task ID:** TASK-BU-06  
**Modül:** Ürün Yönetimi / Benzerlik & Sahtecilik Analizi  
**Öncelik:** Yüksek  
**Tahmini Efor:** 2 gün  
**Bağımlılık:** TASK-BU-05 (Risk Puanlama Motoru)  
**Etiketler:** `backend`, `api`, `rest`, `endpoints`

> **v1.1 Güncelleme:** Barkod ve görsel benzerliği faktörleri kaldırıldı. Risk faktörü yanıtları sadeleştirildi.

---

## Kullanıcı Hikayesi

Bir **backend developer** olarak,  
**Benzer ürünleri listeleme, sahtecilik analizini görüntüleme, ürünü flagleme ve CSA inceleme kararını kaydetme işlemleri için RESTful API endpoint'lerini geliştirmek** istiyorum,  
Böylece **frontend ve diğer sistemler bu verilere güvenli ve standart biçimde erişebilsin**,  
Bu sayede **CSA Admin ürünlerin benzerlik ve sahtecilik risklerini tek bir API katmanı üzerinden yönetebilir**.

---

## Kabul Kriterleri

### AC1: Benzer Ürünleri Listeleme

- **Varsayılan olarak** Ürün için benzerlik analizi tamamlanmıştır
- **Ne zaman** `GET /api/products/{productId}/similar` isteği gelirse
- **O zaman** Sistem o ürünün benzer ürünler listesini (`product_similarity` tablosu) döner
- **Ve** Yanıt şu filtre parametrelerini destekler:
  - `min_score` (float, varsayılan: 0.50) — minimum composite benzerlik skoru
  - `limit` (int, varsayılan: 10, max: 50) — kaç ürün döneceği
  - `field` (enum: `all` | `brand` | `category` | `attributes` | `title`) — belirli bir alana göre filtrele/sırala
- **Ve** Sonuçlar `composite_score` değerine göre azalan sırada döner
- **Ve** Her benzer ürün kaydında dört alan skoru ayrı ayrı gösterilir: `brand_similarity_score`, `category_similarity_score`, `attributes_similarity_score`, `title_similarity_score`
- **Ve** CSA rolü tüm tedarikçi bilgilerini görür; Tedarikçi rolü diğer tedarikçi isimlerini göremez

### AC2: Sahtecilik Analizi Görüntüleme

- **Varsayılan olarak** Ürün için risk puanlaması yapılmıştır
- **Ne zaman** `GET /api/products/{productId}/counterfeit-analysis` isteği gelirse
- **O zaman** Sistem şunları döner:
  - `risk_score` ve `risk_level`
  - `risk_factors` detayı (her faktörün puanı, gerekçesi, ağırlığı)
  - `status` (pending_review / confirmed_counterfeit / confirmed_legitimate / dismissed)
  - `reviewed_by`, `reviewed_at`, `review_note` (inceleme varsa)
  - `similar_products_count` — kaç benzer ürün bulundu
  - `analysis_completed_at` — analizin tamamlandığı zaman
- **Ve** Analiz henüz tamamlanmamışsa `status: analyzing` ve job durumu döner
- **Ve** Yalnızca CSA Admin ve CSA Standart bu endpoint'e erişebilir

### AC3: Manuel Flag / Şüphe İşaretleme

- **Varsayılan olarak** CSA Admin veya Standart bir ürünü manuel olarak şüpheli işaretlemek istemektedir
- **Ne zaman** `POST /api/products/{productId}/flag-counterfeit` isteği gelirse
- **O zaman** Sistem şunları yapar:
  - `counterfeit_flags` tablosunda kayıt oluşturur veya günceller
  - `risk_level: high` olarak işaretler (manuel flag, otomatik puanın üzerine yazar veya birleştirir)
  - `flagged_at` ve `flagged_by` alanlarını doldurur
  - İstek body'sindeki `reason` alanını `review_note` olarak kaydeder
- **Ve** Zaten `confirmed_legitimate` veya `confirmed_counterfeit` statüsünde olan ürünler tekrar flaglenemez; 409 Conflict döner
- **Ve** Yalnızca CSA rolü bu endpoint'e erişebilir

### AC4: CSA İnceleme Kararı Kaydetme

- **Varsayılan olarak** CSA Admin veya Standart ürünü incelemiştir
- **Ne zaman** `PATCH /api/products/{productId}/counterfeit-review` isteği gelirse
- **O zaman** Sistem şunları yapar:
  - `status` alanını günceller: `confirmed_counterfeit` | `confirmed_legitimate` | `dismissed`
  - `reviewed_by` (kullanıcı ID), `reviewed_at` (şimdiki zaman), `review_note` alanlarını doldurur
  - `confirmed_counterfeit` seçilirse: ürünün `status` alanı `rejected` olarak güncellenir ve Ecom'dan kaldırılır
  - `confirmed_legitimate` seçilirse: ürün normal onay sürecine devam eder
  - `dismissed` seçilirse: flag kapatılır, ürün normal akışa devam eder
- **Ve** Karar değiştirilemez (immutable): Karar verildikten sonra aynı endpoint ile güncelleme yapılamaz; CSA Admin yeni bir review süreci başlatmalıdır
- **Ve** Yalnızca CSA Admin bu endpoint'e erişebilir (CSA Standart görüntüleyebilir ama karar veremez)

### AC5: Analizi Yeniden Tetikleme

- **Varsayılan olarak** CSA Admin mevcut bir ürünün analizini güncellemek istemektedir
- **Ne zaman** `POST /api/products/{productId}/reanalyze` isteği gelirse
- **O zaman** Sistem şunları yapar:
  - Yeni bir `SimilarityJob` oluşturur (`triggered_by: manual`)
  - Mevcut `counterfeit_flags` kaydı `pending_review` statüsüne döndürülür
  - Job tamamlandığında risk skoru yeniden hesaplanır
- **Ve** Zaten aktif bir job varsa 409 Conflict döner
- **Ve** Yalnızca CSA Admin bu endpoint'e erişebilir

### AC6: Yetki Matrisi

| Endpoint | CSA Admin | CSA Standart | Tedarikçi Admin | Tedarikçi Standart |
|---|---|---|---|---|
| GET similar | ✅ Tam | ✅ Tam | ✅ Maskelenmiş | ❌ |
| GET counterfeit-analysis | ✅ | ✅ | ❌ | ❌ |
| POST flag-counterfeit | ✅ | ❌ | ❌ | ❌ |
| PATCH counterfeit-review | ✅ | ❌ | ❌ | ❌ |
| POST reanalyze | ✅ | ❌ | ❌ | ❌ |

---

## Teknik Gereksinimler

### TR1: API Endpoint Detayları

**1. Benzer Ürünleri Listele**
```
GET /api/products/{productId}/similar?min_score=0.7&limit=10&type=all
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": {
    "product_id": "prod-uuid-001",
    "similar_products": [
      {
        "product_id": "prod-uuid-002",
        "title": "Benzer Ürün Başlığı",
        "supplier_name": "Tedarikçi A",   // CSA için
        "status": "approved",
        "composite_score": 0.912,
        "brand_similarity_score": 0.94,
        "category_similarity_score": 1.00,
        "attributes_similarity_score": 0.83,
        "title_similarity_score": 0.91,
        "match_reasons": {
          "brand":      { "score": 0.94, "match_type": "typosquat", "detail": "'Nikee' → 'Nike'" },
          "category":   { "score": 1.00, "match_type": "exact" },
          "attributes": { "score": 0.83, "matched_keys": ["renk","beden","malzeme"], "total_keys": 4 },
          "title":      { "score": 0.91, "jaccard": 0.87, "fuzzy": 0.93 }
        },
        "calculated_at": "2026-05-11T10:00:00Z"
      }
    ],
    "total_found": 3,
    "filters_applied": { "min_score": 0.7, "type": "all" }
  }
}
```

**2. Sahtecilik Analizi Görüntüle**
```
GET /api/products/{productId}/counterfeit-analysis
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": {
    "product_id": "prod-uuid-001",
    "risk_score": 80.4,
    "risk_level": "critical",
    "status": "pending_review",
    "risk_factors": {
      "brand_typosquat": {
        "detected": true,
        "score": 56.4,
        "weight": 0.60,
        "detail": "'Nikee' → 'Nike' (fuzzy: 0.94)"
      },
      "price_anomaly": {
        "detected": true,
        "score": 24.0,
        "weight": 0.40,
        "detail": "Kategori medyanından %58 düşük"
      }
    },
    "similar_products_count": 2,
    "analysis_completed_at": "2026-05-11T10:05:00Z",
    "reviewed_by": null,
    "reviewed_at": null,
    "review_note": null
  }
}

Response 202 (Analiz Devam Ediyor):
{
  "success": true,
  "data": {
    "product_id": "prod-uuid-001",
    "status": "analyzing",
    "job_status": "processing",
    "message": "Analiz devam ediyor, lütfen bekleyin"
  }
}
```

**3. Manuel Flag**
```
POST /api/products/{productId}/flag-counterfeit
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "reason": "Görsel incelemede orijinal marka ürününe çok benzer, tedarikçi yetkisi şüpheli"
}

Response 201:
{
  "success": true,
  "data": {
    "flag_id": "flag-uuid-001",
    "product_id": "prod-uuid-001",
    "risk_level": "high",
    "status": "pending_review",
    "flagged_at": "2026-05-11T11:00:00Z"
  }
}

Response 409 (Zaten Karar Verilmiş):
{
  "success": false,
  "error": {
    "code": "FLAG_DECISION_ALREADY_MADE",
    "message": "Bu ürün için zaten bir karar verilmiş. Yeni inceleme başlatmak için reanalyze kullanın."
  }
}
```

**4. İnceleme Kararı**
```
PATCH /api/products/{productId}/counterfeit-review
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "decision": "confirmed_counterfeit",   // confirmed_counterfeit | confirmed_legitimate | dismissed
  "note": "Marka yetkisi doğrulanamadı, ürün reddediliyor"
}

Response 200:
{
  "success": true,
  "data": {
    "product_id": "prod-uuid-001",
    "status": "confirmed_counterfeit",
    "reviewed_by": "user-uuid-admin",
    "reviewed_at": "2026-05-11T12:00:00Z",
    "product_status_updated_to": "rejected"
  }
}
```

**5. Yeniden Analiz Tetikleme**
```
POST /api/products/{productId}/reanalyze
Authorization: Bearer {token}

Response 202:
{
  "success": true,
  "data": {
    "job_id": "job-uuid-001",
    "product_id": "prod-uuid-001",
    "status": "queued",
    "message": "Analiz kuyruğa alındı"
  }
}
```

### TR2: Hata Kodları

```
200 - OK
201 - Created (flag oluşturuldu)
202 - Accepted (analiz devam ediyor / yeniden analiz kuyruğa alındı)
400 - Bad Request: Eksik veya geçersiz alan
401 - Unauthorized: Token gerekli
403 - Forbidden: Yetersiz yetki
404 - Not Found: Ürün veya flag bulunamadı
409 - Conflict: Zaten flag var / zaten karar verilmiş / aktif job var
422 - Unprocessable Entity: Geçersiz decision değeri
500 - Internal Server Error
```

### TR3: Audit Log

Her karar değişikliği `audit_logs` tablosuna kaydedilir:
```
{
  "entity_type": "counterfeit_flag",
  "entity_id": "flag-uuid-001",
  "action": "decision_made",
  "actor_id": "user-uuid-admin",
  "previous_value": { "status": "pending_review" },
  "new_value": { "status": "confirmed_counterfeit" },
  "timestamp": "2026-05-11T12:00:00Z"
}
```

---

## Kapsam Dışı

- Frontend görüntüleme ve aksiyon bileşenleri (ayrı frontend story)
- Toplu karar verme (bulk review) — gelecek sprint
- Tedarikçiye itiraz hakkı tanıma mekanizması — gelecek sprint

---

## Test Senaryoları

### Unit Tests
1. `test_similar_products_min_score_filter()` — min_score filtresi doğru çalışıyor mu
2. `test_supplier_masking_in_similar()` — Tedarikçi kendi rolünde diğer supplier'ı görmemeli
3. `test_flag_already_decided_returns_409()` — Kararlı ürünü flagleme → 409
4. `test_review_decision_immutable()` — Karar değiştirme → hata
5. `test_confirmed_counterfeit_rejects_product()` — Karar = sahte → ürün rejected olmalı

### Integration Tests
1. `test_full_analysis_to_review_flow()` — Analiz → flag → review döngüsü
2. `test_reanalyze_resets_flag_status()` — Yeniden analiz → pending_review
3. `test_audit_log_on_decision()` — Karar sonrası audit log oluşuyor mu

---

## Definition of Done (DoD)

✅ Tüm endpoint'ler Swagger/OpenAPI dokümantasyonunda tanımlandı  
✅ Yetki matrisi test edildi  
✅ Audit log mekanizması çalışıyor  
✅ Hata kodları tutarlı biçimde dönüyor  
✅ Integration testleri geçiyor  
✅ Code review tamamlandı  

---

## Tahmini Efor

| Alt Görev | Süre |
|---|---|
| Endpoint geliştirme (5 endpoint) | 1 gün |
| Yetki kontrolü ve maskeleme | 0.5 gün |
| Audit log entegrasyonu | 0.25 gün |
| Testler | 0.25 gün |
| **Toplam** | **2 gün** |
