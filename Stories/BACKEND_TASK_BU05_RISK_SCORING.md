# TASK-BU-05: Sahtecilik Risk Puanlama Motoru

**Task ID:** TASK-BU-05  
**Modül:** Ürün Yönetimi / Benzerlik & Sahtecilik Analizi  
**Öncelik:** Kritik  
**Tahmini Efor:** 3 gün  
**Bağımlılık:** TASK-BU-03 (Metin Benzerliği)  
**Etiketler:** `backend`, `risk-scoring`, `service`, `business-logic`

> **v1.1:** Barkod çakışma ve görsel benzerliği faktörleri kapsam dışına alındı.  
> **v1.2:** Metin faktörü artık BU-03'ün ürettiği dört alanlı composite skoruna (marka, kategori, özellikler, ürün adı) dayanır.

---

## Kullanıcı Hikayesi

Bir **backend developer** olarak,  
**BU-03 servisinden gelen dört alanlı composite benzerlik skorunu (marka, kategori, özellikler, ürün adı) ve dahili fiyat anomalisi hesaplamasını birleştirerek her ürün için bir sahtecilik risk puanı hesaplayan bir motor geliştirmek** istiyorum,  
Böylece **CSA Admin, tek bir puanla ürünün ne kadar şüpheli olduğunu anlayabilsin**,  
Bu sayede **inceleme sıralaması risk odaklı yapılabilir ve düşük riskli ürünler daha hızlı onaylanabilir**.

---

## Kabul Kriterleri

### AC1: Composite Risk Skoru Hesaplama

- **Varsayılan olarak** BU-03 metin benzerlik analizi tamamlanmış olmalıdır
- **Ne zaman** Risk puanlama motoru tetiklenirse
- **O zaman** Sistem iki risk faktörünü ağırlıklı olarak birleştirir:

| Risk Faktörü | Maksimum Puan | Ağırlık | Kaynak |
|---|---|---|---|
| Marka Typosquat / Metin Benzerliği | 60 puan | %60 | BU-03 |
| Fiyat Anomalisi | 40 puan | %40 | Dahili hesaplama |

- **Ve** Her faktörün puanı 0–kendi_maksimumu arasında değer alır
- **Ve** `risk_score = Σ(faktör_puanı)` — 0 ile 100 arasında
- **Ve** Risk seviyesi (risk_level) şu eşiklere göre atanır:
  - `critical`: risk_score ≥ 75
  - `high`: risk_score 50–74
  - `medium`: risk_score 25–49
  - `low`: risk_score < 25

### AC2: Benzerlik Skoru Risk Faktörü (Maks. 60 Puan)

- **Varsayılan olarak** BU-03 dört alanlı benzerlik analizi tamamlanmıştır
- **Ne zaman** Risk motoru benzerlik faktörünü hesaplarsa
- **O zaman** Sistem BU-03'ün ürettiği en yüksek `composite_score` değerini (en benzer ürün çifti) alır ve şu puanlama kurallarını uygular:
  - `composite_score ≥ 0.90`: **60 puan** (maksimum — çok yüksek benzerlik)
  - `composite_score 0.75–0.89`: `60 × composite_score` puan (örn. 0.82 → 49.2 puan)
  - `composite_score 0.50–0.74`: `40 × composite_score` puan (örn. 0.60 → 24 puan)
  - `composite_score < 0.50` veya benzer ürün listesi boşsa: **0 puan**
- **Ve** Alan kırılımı (`brand`, `category`, `attributes`, `title` skorları) `risk_factors.text_similarity.field_breakdown` altında kaydedilir
- **Ve** Marka skoru 1.00 (tam eşleşme) olan ve tedarikçi yetkisiz olan durumlarda: otomatik 60 puan (alan bazlı override)

### AC3: Fiyat Anomalisi Risk Faktörü (Maks. 40 Puan)

- **Varsayılan olarak** Ürünün kategori bilgisi ve fiyatı mevcuttur
- **Ne zaman** Risk motoru fiyat faktörünü hesaplarsa
- **O zaman** Sistem şu hesaplamayı yapar:
  - Aynı kategorideki aktif ürünlerin medyan fiyatı hesaplanır
  - Yeni ürünün fiyatı bu medyanla karşılaştırılır
  - Sapmalar:
    - Medyandan **%70+ düşük** fiyat: **40 puan** (maksimum)
    - Medyandan **%50–70 düşük**: **24 puan**
    - Medyandan **%30–50 düşük**: **12 puan**
    - Normal aralık (medyanın %30 altı–%200 üstü): **0 puan**
  - Kategoride yeterli ürün yoksa (< 5 ürün): faktör atlanır, metin faktörü üzerinden 100 puanlık ölçeğe normalize edilir

### AC4: Normalize Etme — Eksik Sinyal Durumu

- **Varsayılan olarak** Fiyat istatistiği için yeterli veri yoktur
- **Ne zaman** Bir faktör hesaplanamaz (yetersiz veri, hata vb.) durumda
- **O zaman** Sistem mevcut faktörün puanını 100 üzerinden normalize eder:
  - Yalnızca metin faktörü varsa: `risk_score = metin_puanı / 0.60 × 1.0` (0–100 arasına taşınır)
  - Yalnızca fiyat faktörü varsa: `risk_score = fiyat_puanı / 0.40 × 1.0`
- **Ve** Hangi faktörün atlandığı `risk_factors` JSONB'de `"skipped": true` ile kaydedilir
- **Ve** Her zaman 0–100 arasında anlamlı bir skor üretilir

### AC5: Konfigüre Edilebilir Ağırlıklar ve Eşikler

- **Varsayılan olarak** Sistem varsayılan değerlerle çalışır
- **Ne zaman** CSA Admin `risk_scoring_config` tablosunu güncellerse
- **O zaman** Değişiklik bir sonraki analizden itibaren geçerli olur
- **Ve** Mevcut `counterfeit_flags` kayıtları otomatik yeniden hesaplanmaz; BU-06 "Yeniden Hesapla" endpoint'i ile manuel tetiklenir

---

## Teknik Gereksinimler

### TR1: Servis Mimarisi

```
CounterfeitRiskScoringEngine
  ├── compute_text_factor(product_id) → FactorResult
  ├── compute_price_factor(product_id) → FactorResult
  ├── normalize_factors(factors, weights) → NormalizedFactors
  ├── compute_composite_score(factors) → float
  ├── determine_risk_level(score) → RiskLevel
  └── save_counterfeit_flag(product_id, score, level, factors)
```

### TR2: Risk Faktörü Hesaplama Pseudokodu

```python
def compute_risk_score(product_id: UUID) -> CounterfeitFlagResult:
    factors = {}

    # Faktör 1: Benzerlik skoru (BU-03'ten beslenir)
    # En yüksek composite_score'a sahip benzer ürün çiftini al
    best_match = ProductSimilarity.objects.filter(
        source_product_id=product_id
    ).order_by('-composite_score').first()

    factors["text_similarity"] = compute_similarity_factor(
        best_match, max_score=60.0
    )

    # Faktör 2: Fiyat
    price_data = get_price_statistics(product_id)
    if price_data.has_sufficient_data:
        factors["price_anomaly"] = compute_price_factor(price_data, max_score=40.0)
    else:
        factors["price_anomaly"] = FactorResult(score=0, skipped=True)

    total_score   = normalize_and_sum(factors)
    risk_level    = determine_risk_level(total_score)

    return CounterfeitFlagResult(
        risk_score=total_score,
        risk_level=risk_level,
        risk_factors=factors
    )
```

### TR3: Benzerlik Faktörü Hesaplama

```python
def compute_similarity_factor(
    best_match: ProductSimilarity | None,
    max_score: float = 60.0
) -> FactorResult:

    if best_match is None:
        return FactorResult(score=0.0, detected=False, detail="Benzer ürün bulunamadı")

    c = best_match.composite_score

    # Yetkisiz marka tam eşleşmesi → override
    if best_match.brand_similarity_score == 1.0 and not brand_is_authorized(best_match):
        return FactorResult(
            score=max_score,
            detected=True,
            detail="Korumalı markaya yetkisiz tam eşleşme",
            field_breakdown=get_field_breakdown(best_match)
        )

    if c >= 0.90:
        score = max_score
    elif c >= 0.75:
        score = max_score * c
    elif c >= 0.50:
        score = 40.0 * c
    else:
        score = 0.0

    return FactorResult(
        score=score,
        detected=score > 0,
        detail=f"En yüksek composite benzerlik: {c:.2f}",
        field_breakdown=get_field_breakdown(best_match)
    )

def get_field_breakdown(match: ProductSimilarity) -> dict:
    return {
        "brand":      match.brand_similarity_score,
        "category":   match.category_similarity_score,
        "attributes": match.attributes_similarity_score,
        "title":      match.title_similarity_score,
    }
```

### TR4: Fiyat Anomalisi Hesaplama

```python
def compute_price_factor(product_id: UUID, max_score: float = 40.0) -> FactorResult:
    product = get_product(product_id)
    stats = get_category_price_stats(product.category_id)

    if stats.count < 5 or stats.median == 0:
        return FactorResult(score=0, skipped=True, detail="insufficient_data")

    deviation_pct = (stats.median - product.list_price) / stats.median

    if deviation_pct >= 0.70:
        score = max_score           # 40 puan
    elif deviation_pct >= 0.50:
        score = max_score * 0.60    # 24 puan
    elif deviation_pct >= 0.30:
        score = max_score * 0.30    # 12 puan
    else:
        score = 0.0

    return FactorResult(
        score=score,
        detected=score > 0,
        detail=f"Kategori medyanından %{deviation_pct*100:.1f} düşük",
        weight=0.40
    )
```

### TR5: Risk Seviyesi Eşikleri

```python
RISK_THRESHOLDS = {
    "critical": 75,
    "high":     50,
    "medium":   25,
    "low":      0
}
```

### TR6: Tetiklenme Zamanı

1. **Otomatik:** BU-03 job'ı tamamlandığında (event: `text_similarity_completed`)
2. **Manuel:** CSA Admin "Yeniden Hesapla" butonu — BU-06 `POST /reanalyze` endpoint'i
3. **Scheduled:** Fiyat istatistiklerini güncellemek için gece batch'i (yalnızca fiyat faktörü)

### TR7: `risk_scoring_config` Tablosu Seed Değerleri

```sql
INSERT INTO risk_scoring_config VALUES
  ('text_factor_max',      '60',  null, NOW()),
  ('price_factor_max',     '40',  null, NOW()),
  ('critical_threshold',   '75',  null, NOW()),
  ('high_threshold',       '50',  null, NOW()),
  ('medium_threshold',     '25',  null, NOW()),
  ('typosquat_threshold',  '0.88',null, NOW()),
  ('title_high_threshold', '0.85',null, NOW()),
  ('desc_copy_threshold',  '0.90',null, NOW());
```

---

## Kullanıcı Senaryoları

### Senaryo 1: Kritik Riskli Ürün — Dört Alan Yüksek Benzerlik
- BU-03 composite = 0.91 (brand=0.94, cat=1.00, attr=0.83, title=0.91)
- Benzerlik faktörü: `60 × 0.91 = 54.6 puan`
- Fiyat medyandan %65 düşük → `24 puan`
- **Toplam: 78.6 → risk_level: critical**

### Senaryo 2: Yüksek Riskli — Marka Tam Eşleşmesi (Yetkisiz)
- BU-03: brand_similarity_score = 1.00, tedarikçi yetkisiz
- Override → benzerlik faktörü: **60 puan**
- Fiyat normal → 0 puan
- **Toplam: 60 → risk_level: high**

### Senaryo 3: Orta Riskli — Yalnızca Fiyat
- Benzer ürün listesi boş → 0 puan
- Fiyat medyandan %55 düşük → 24 puan
- **Toplam: 24 → risk_level: medium**

### Senaryo 4: Yetersiz Fiyat Verisi
- composite = 0.85 → benzerlik faktörü: `60 × 0.85 = 51 puan`
- Fiyat verisi yetersiz → skipped, normalize: `51 / 0.60 = 85 puan`
- **Toplam (normalized): 85 → risk_level: critical**

### Senaryo 5: Temiz Ürün
- Benzer ürün listesi boş → 0 puan
- Fiyat normal → 0 puan
- **Toplam: 0 → risk_level: low**

---

## Kapsam Dışı

- ML tabanlı skor öğrenmesi — gelecek sprint
- Tedarikçi geçmiş performansının risk skoruna etkisi — ayrı özellik
- Barkod çakışma faktörü — kapsam dışı
- Görsel benzerliği faktörü — kapsam dışı

---

## Test Senaryoları

### Unit Tests
1. `test_similarity_factor_composite_090()` — composite 0.91 → 60 puan
2. `test_similarity_factor_composite_082()` — composite 0.82 → 49.2 puan
3. `test_similarity_factor_composite_060()` — composite 0.60 → 24 puan
4. `test_similarity_factor_no_match()` — boş liste → 0 puan
5. `test_similarity_factor_brand_override()` — brand=1.00 yetkisiz → 60 puan
6. `test_field_breakdown_in_risk_factors()` — JSONB'de 4 alan skoru kaydedilmeli
7. `test_price_factor_70pct_below()` — 40 puan döndürmeli
8. `test_price_factor_insufficient_data()` — skipped=True
9. `test_normalize_price_skipped()` — fiyat yokken benzerlik faktörü normalize
10. `test_risk_level_thresholds()` — 75, 50, 25 sınır değerleri

### Integration Tests
1. `test_text_job_completion_triggers_scoring()` — BU-03 tamamlanınca otomatik risk hesabı
2. `test_counterfeit_flag_created()` — Risk hesabı → counterfeit_flags kaydı oluşuyor mu
3. `test_manual_recalculate()` — Yeniden Hesapla → risk skoru güncellenir

---

## Definition of Done (DoD)

✅ İki faktör için unit testler geçiyor  
✅ Normalizasyon (eksik sinyal) senaryoları test edildi  
✅ `risk_scoring_config` seed değerleriyle oluşturuldu  
✅ Integration testleri geçiyor  
✅ Code review tamamlandı  

---

## Tahmini Efor

| Alt Görev | Süre |
|---|---|
| Metin faktörü hesaplama fonksiyonları | 0.5 gün |
| Fiyat faktörü ve istatistik sorgulama | 0.5 gün |
| Normalizasyon ve composite skor | 0.5 gün |
| Konfigürasyon mekanizması | 0.5 gün |
| Testler | 1 gün |
| **Toplam** | **3 gün** |
