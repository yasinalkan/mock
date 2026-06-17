# TASK-BU-03: Benzerlik Skorlama Servisi

**Task ID:** TASK-BU-03  
**Modül:** Ürün Yönetimi / Benzerlik & Sahtecilik Analizi  
**Öncelik:** Yüksek  
**Tahmini Efor:** 4 gün  
**Bağımlılık:** TASK-BU-01 (DB şema)  
**Etiketler:** `backend`, `nlp`, `similarity`, `async`, `service`

> **v1.2:** Skorlama dört alana göre yapılır: **marka**, **kategori**, **özellikler (attributes)**, **ürün adı**. Her alan için bağımsız skor hesaplanır; composite skor ağırlıklı ortalamayla elde edilir. Benzer ürünler `product_similarity` tablosunda liste olarak tutulur.

---

## Kullanıcı Hikayesi

Bir **backend developer** olarak,  
**Yeni bir ürünün marka, kategori, özellikler ve ürün adı alanlarını katalogdaki mevcut ürünlerle karşılaştıran dört alanlı bir benzerlik skorlama servisi geliştirmek** istiyorum,  
Böylece **her ürün için "benzer ürünler listesi" oluşturulabilsin ve sahtecilik risk puanlaması güvenilir bir sinyal alabilsin**,  
Bu sayede **CSA Admin aynı veya çok benzer ürünleri tek bakışta görebilir, taklit girişimleri erken tespit edilebilir**.

---

## Kabul Kriterleri

### AC1: Marka Benzerliği Skorlaması

- **Varsayılan olarak** Yeni ürünün marka alanı mevcuttur
- **Ne zaman** Marka benzerlik analizi tetiklenirse
- **O zaman** Sistem yeni ürünün marka adını katalogdaki tüm aktif ürünlerin marka listesiyle karşılaştırır
- **Ve** Her karşılaştırma için şu kurallar uygulanır:
  - **Tam eşleşme** (normalize sonrası): `brand_similarity_score = 1.00`
  - **Typosquat tespiti** — fuzzy skor `fuzz.ratio` ≥ 0.88: `brand_similarity_score = fuzzy_score`
  - **Homoglyph tespiti** — Unicode normalize + karakter eşleme sonrası eşleşme: `brand_similarity_score = 1.00`
  - **Boşluk / noktalama manipülasyonu** ("N.ike", "N ike"): normalize sonrası tam eşleşme kuralı uygulanır
  - Eşik altı veya eşleşme yok: `brand_similarity_score = 0.00`
- **Ve** Sonuç `product_similarity.brand_similarity_score` alanına ve `match_reasons.brand` JSONB bloğuna kaydedilir

### AC2: Kategori Benzerliği Skorlaması

- **Varsayılan olarak** Yeni ürünün kategori bilgisi mevcuttur
- **Ne zaman** Kategori benzerlik analizi çalıştırılırsa
- **O zaman** Sistem şu puanlama kurallarını uygular:
  - **Aynı yaprak kategori** (leaf category ID eşleşmesi): `category_similarity_score = 1.00`
  - **Aynı birinci derece ebeveyn kategori** (parent_id eşleşmesi): `category_similarity_score = 0.50`
  - **Aynı ikinci derece ebeveyn** (grandparent eşleşmesi): `category_similarity_score = 0.25`
  - **Farklı kök kategori**: `category_similarity_score = 0.00`
- **Ve** Kategori hiyerarşisi `categories` tablosundan çekilir (materialized path veya adjacency list)
- **Ve** Sonuç `product_similarity.category_similarity_score` ve `match_reasons.category` bloğuna kaydedilir

### AC3: Özellikler (Attributes) Benzerliği Skorlaması

- **Varsayılan olarak** Yeni ürünün ve karşılaştırılan ürünün `attributes` alanları JSONB formatında mevcuttur
- **Ne zaman** Özellik benzerliği analizi çalıştırılırsa
- **O zaman** Sistem şu adımları uygular:
  1. Her iki ürünün attribute key setini karşılaştırır — **key overlap (Jaccard)**
  2. Ortak key'ler için değerleri karşılaştırır — tam eşleşen value'lar sayılır
  3. Skor = `(eşleşen key-value çifti sayısı) / (union key sayısı)`
- **Ve** Attribute key'leri normalize edilir (küçük harf, boşluk temizleme) karşılaştırma öncesinde
- **Ve** Attribute'u olmayan ürünler için `attributes_similarity_score = null` ve `skipped: true` kaydedilir; composite skor yeniden normalize edilir
- **Ve** Sonuç `product_similarity.attributes_similarity_score` ve `match_reasons.attributes` bloğuna kaydedilir

**Örnek:**
```
Yeni ürün:        { "renk": "kırmızı", "beden": "M", "malzeme": "pamuk", "desen": "düz" }
Katalog ürünü:    { "renk": "kırmızı", "beden": "L", "malzeme": "pamuk", "kalıp": "slim" }

Ortak key'ler:  renk, beden, malzeme  → 3 ortak
Eşleşen value: renk=kırmızı ✓, malzeme=pamuk ✓ → 2 eşleşen
Union key sayısı: 5

attributes_similarity_score = 2 / 5 = 0.40
```

### AC4: Ürün Adı Benzerliği Skorlaması

- **Varsayılan olarak** Yeni ürünün başlık alanı mevcuttur
- **Ne zaman** Ürün adı benzerliği analizi çalıştırılırsa
- **O zaman** Sistem şu üç yöntemi hesaplayıp ağırlıklı birleştirir:
  - **Jaccard (Token Overlap):** Ortak kelime oranı — hızlı ön filtreleme
  - **Fuzzy Ratio:** `fuzz.token_sort_ratio` — kelime sırası farklılıklarına toleranslı
  - **TF-IDF Cosine:** Katalog genelinde ağırlıklı kelime vektörü benzerliği
- **Ve** Ağırlıklar: Jaccard 0.25, Fuzzy 0.45, TF-IDF 0.30
- **Ve** Tüm başlıklar analiz öncesi ön işlemden (preprocessing) geçirilir
- **Ve** Sonuç `product_similarity.title_similarity_score` ve `match_reasons.title` bloğuna kaydedilir

### AC5: Composite Skor ve Benzer Ürünler Listesi Oluşturma

- **Varsayılan olarak** Dört alan skoru hesaplanmıştır
- **Ne zaman** Composite skor hesaplanırsa
- **O zaman** Sistem ağırlıklı ortalamayı hesaplar:
  - Marka: **%35**, Ürün Adı: **%30**, Özellikler: **%25**, Kategori: **%10**
- **Ve** `composite_score ≥ 0.50` olan ürün çiftleri `product_similarity` tablosuna kaydedilir (benzer ürün olarak listelenir)
- **Ve** `composite_score < 0.50` olan çiftler kaydedilmez — depolama optimizasyonu
- **Ve** Bir ürünün benzer ürünleri `source_product_id = :id ORDER BY composite_score DESC` ile liste olarak çekilebilir
- **Ve** Composite skor eşiği konfigüre edilebilir (`similarity_config.min_composite_score`, varsayılan: 0.50)

### AC6: Metin Ön İşleme (Preprocessing)

- **Ne zaman** Herhangi bir metin alanı (marka, ürün adı) işlenirse
- **O zaman** Sistem şu adımları uygular:
  - Küçük harfe dönüştürme
  - Türkçe karakter normalizasyonu — yalnızca fuzzy karşılaştırma için: ş→s, ı→i, ç→c, ğ→g, ü→u, ö→o
  - Noktalama ve özel karakterlerin temizlenmesi (`. - _ / &` → boşluk)
  - Türkçe stop word çıkarma — ürün adı için (ve, ile, için, bu, bir, da, de vb.)
  - Tekrarlayan boşlukların temizlenmesi
- **Ve** Orijinal metin veritabanında korunur; normalize versiyon yalnızca karşılaştırma için kullanılır

### AC7: Asenkron Job Yönetimi

- **Ne zaman** `product.pending_approval` eventi tetiklenirse
- **O zaman** Sistem bir `SimilarityJob` kaydı oluşturur ve iş kuyruğuna ekler
- **Ve** Job tamamlandığında `product_similarity` tablosu güncellenir, `products.similarity_analyzed_at` set edilir
- **Ve** Job başarısız olursa `status: failed` ve `error_message` kaydedilir, 3 kez retry yapılır (exponential backoff)
- **Ve** Job süresi maksimum 5 dakikayı aşarsa timeout ve failed status

### AC8: Skor Eşikleri ve Konfigürasyon

- **Ne zaman** CSA Admin eşik değerlerini güncellerse
- **O zaman** Değişiklik bir sonraki analizden itibaren geçerli olur
- **Ve** Konfigüre edilebilir alanlar:
  - Minimum composite skor eşiği — benzer ürün kaydı için (varsayılan: 0.50)
  - Marka typosquat eşiği (varsayılan: 0.88)
  - Ürün adı yüksek eşiği — "yüksek benzerlik" işaretleme için (varsayılan: 0.85)

---

## Teknik Gereksinimler

### TR1: Servis Mimarisi

```
ProductSimilarityService
  ├── preprocess(text: str) → str
  ├── score_brand(new_brand: str, catalog_brand: str) → float
  ├── score_category(new_cat_id: UUID, catalog_cat_id: UUID) → float
  ├── score_attributes(new_attrs: dict, catalog_attrs: dict) → float
  ├── score_title(new_title: str, catalog_title: str) → float
  ├── compute_composite(brand, category, attributes, title) → float
  ├── find_similar_products(product_id: UUID) → list[SimilarityResult]
  └── save_similarity_list(source_id: UUID, results: list[SimilarityResult])

SimilarityJob (Celery Task)
  └── task: run_similarity_analysis(product_id: UUID)
```

### TR2: Alan Bazlı Algoritma Detayları

**Marka — Fuzzy + Homoglyph:**
```python
HOMOGLYPH_MAP = {"ı": "i", "İ": "I", "0": "O", "1": "l", "ğ": "g", "ş": "s"}

def score_brand(new_brand: str, catalog_brand: str) -> float:
    a = normalize_homoglyph(new_brand.lower().strip())
    b = normalize_homoglyph(catalog_brand.lower().strip())

    if a == b:
        return 1.00  # Tam eşleşme

    ratio = fuzz.ratio(a, b) / 100
    return ratio if ratio >= 0.88 else 0.00
```

**Kategori — Hiyerarşi Skoru:**
```python
def score_category(new_cat_id: UUID, catalog_cat_id: UUID) -> float:
    if new_cat_id == catalog_cat_id:
        return 1.00
    new_path   = get_category_path(new_cat_id)    # [root, ..., parent, leaf]
    cat_path   = get_category_path(catalog_cat_id)
    shared     = len(set(new_path) & set(cat_path))
    depth      = max(len(new_path), len(cat_path))
    # Paylaşılan derinliğe göre kademeli skor
    if shared >= depth - 1: return 0.50   # parent eşleşmesi
    if shared >= depth - 2: return 0.25   # grandparent eşleşmesi
    return 0.00
```

**Özellikler — Key-Value Jaccard:**
```python
def score_attributes(new_attrs: dict, catalog_attrs: dict) -> float:
    if not new_attrs or not catalog_attrs:
        return None  # skipped

    norm  = lambda d: {k.lower().strip(): v.lower().strip()
                       for k, v in d.items() if isinstance(v, str)}
    a, b  = norm(new_attrs), norm(catalog_attrs)

    union = set(a) | set(b)
    if not union:
        return None

    matches = sum(1 for k in a if k in b and a[k] == b[k])
    return matches / len(union)
```

**Ürün Adı — Jaccard + Fuzzy + TF-IDF:**
```python
TITLE_WEIGHTS = {"jaccard": 0.25, "fuzzy": 0.45, "tfidf": 0.30}

def score_title(new_title: str, catalog_title: str,
                tfidf_score: float) -> float:
    a = preprocess(new_title)
    b = preprocess(catalog_title)

    tok_a, tok_b = set(a.split()), set(b.split())
    jaccard = len(tok_a & tok_b) / len(tok_a | tok_b) if tok_a | tok_b else 0.0
    fuzzy   = fuzz.token_sort_ratio(a, b) / 100

    return (jaccard  * TITLE_WEIGHTS["jaccard"] +
            fuzzy    * TITLE_WEIGHTS["fuzzy"]   +
            tfidf_score * TITLE_WEIGHTS["tfidf"])
```

**Composite Skor:**
```python
COMPOSITE_WEIGHTS = {
    "brand": 0.35, "title": 0.30, "attributes": 0.25, "category": 0.10
}

def compute_composite(brand, title, attributes, category) -> float:
    scores  = {"brand": brand, "title": title,
               "category": category, "attributes": attributes}
    weights = COMPOSITE_WEIGHTS.copy()

    # Eksik alan (attributes=None) varsa ağırlıkları normalize et
    active  = {k: v for k, v in scores.items() if v is not None}
    total_w = sum(weights[k] for k in active)

    return sum(active[k] * weights[k] / total_w for k in active)
```

### TR3: TF-IDF Modeli ve Cache

- `TfidfVectorizer` katalog ürün başlıklarına günlük batch ile fit edilir
- Model Redis'te serialize olarak tutulur (TTL: 25 saat)
- Yeni ürün onaylandığında model inkremental güncelleme yerine gece batch'iyle yeniden eğitilir
- 100.000+ ürün için `faiss` ANN indeksi ile yaklaşık arama devreye alınır

### TR4: Konfigürasyon Alanları

```
similarity_config
  ├── min_composite_score       → "0.50"    (benzer ürün kaydı eşiği)
  ├── brand_typosquat_threshold → "0.88"
  ├── title_high_threshold      → "0.85"
  ├── composite_weights         → '{"brand":0.35,"title":0.30,"attributes":0.25,"category":0.10}'
  └── stopwords_tr              → '[...]'
```

### TR5: Performans Hedefleri

| Senaryo | Hedef |
|---|---|
| Tek ürün — 10.000 katalog | < 20 saniye |
| Tek ürün — 100.000 katalog (ANN) | < 10 saniye |
| Attribute karşılaştırması (N×M) | < 5 saniye |
| İlk filtreleme: aynı + komşu kategori | Karşılaştırma setini %80 küçültür |

---

## Kullanıcı Senaryoları

### Senaryo 1: Yüksek Composite Benzerlik — Dört Alan Eşleşmesi
1. Tedarikçi "Nikee Kırmızı Koşu Ayakkabısı" yükler, kategori: Spor Ayakkabı
2. Job tetiklenir
3. Katalogda "Nike Kırmızı Koşu Ayakkabısı" (aynı kategori, aynı attributes) bulunur
4. Skorlar: brand=0.94, category=1.00, attributes=0.83, title=0.91
5. composite = 0.94×0.35 + 0.91×0.30 + 0.83×0.25 + 1.00×0.10 = **0.912**
6. `product_similarity` kaydı oluşturulur; risk motoru bu sinyal ile beslenir

### Senaryo 2: Yalnızca Ürün Adı Benzerliği — Farklı Marka
1. Tedarikçi "Mavi Pamuklu Basic T-Shirt" yükler, marka: "XYZMarka"
2. Katalogda "Beyaz Pamuklu Basic T-Shirt" (farklı marka, aynı kategori) mevcuttur
3. brand=0.00, category=1.00, attributes=0.60, title=0.78
4. composite = 0.00×0.35 + 0.78×0.30 + 0.60×0.25 + 1.00×0.10 = **0.484**
5. Eşik 0.50 altında — kaydedilmez, risk sinyali üretilmez

### Senaryo 3: Attribute Bilgisi Eksik Ürün
1. Yeni ürünün `attributes` alanı boş
2. `attributes_similarity_score = null`, `skipped: true`
3. Composite ağırlıkları normalize edilir: brand=0.47, title=0.40, category=0.13
4. Analiz diğer üç alan üzerinden devam eder

### Senaryo 4: Temiz Ürün
1. Özgün marka, farklı kategori, farklı attributes, farklı ürün adı
2. Tüm alan skorları düşük → composite < 0.50
3. Hiçbir kayıt oluşturulmaz, benzer ürünler listesi boş

---

## Kapsam Dışı

- Görsel benzerlik analizi — kapsam dışı
- Barkod çakışma kontrolü — kapsam dışı
- Fiyat anomalisi hesabı — BU-05 sorumluluğu
- Çok dilli (İngilizce vb.) metin desteği — gelecek sprint
- Semantic embedding modelleri (BERT, sentence-transformers) — gelecek sprint

---

## Test Senaryoları

### Unit Tests
1. `test_score_brand_exact_match()` → 1.00
2. `test_score_brand_typosquat()` — "Adidas" / "Addidas" → 0.92
3. `test_score_brand_homoglyph()` — "Adıdas" → 1.00
4. `test_score_brand_below_threshold()` — fuzzy 0.70 → 0.00
5. `test_score_category_same_leaf()` → 1.00
6. `test_score_category_same_parent()` → 0.50
7. `test_score_category_different_root()` → 0.00
8. `test_score_attributes_partial_match()` — 2/5 eşleşme → 0.40
9. `test_score_attributes_empty()` → None (skipped)
10. `test_score_title_identical()` → ~1.00
11. `test_composite_weights_sum_to_1()` — normalize doğru çalışmalı
12. `test_composite_attribute_skipped_normalization()` — attributes None iken diğer ağırlıklar normalize edilmeli
13. `test_below_threshold_not_saved()` — composite < 0.50 → DB'ye kayıt yok

### Integration Tests
1. `test_job_triggered_on_product_submission()` — `pending_approval` → job kuyruğa alınıyor
2. `test_similar_list_created_after_job()` — Job tamamlanınca benzer ürünler listesi oluşuyor
3. `test_job_retry_on_failure()` — 3 retry sonrası failed
4. `test_job_timeout_5min()` — 5 dakika timeout

### Performance Tests
1. `test_10k_catalog_under_20s()` — 10.000 ürünlük katalog < 20 saniye
2. `test_100k_catalog_ann_under_10s()` — ANN ile 100.000 ürün < 10 saniye

---

## Definition of Done (DoD)

✅ Dört alan için birim testler geçiyor  
✅ Composite skor normalizasyonu (eksik attribute) test edildi  
✅ Benzer ürünler listesi composite ≥ 0.50 kuralıyla doğru oluşuyor  
✅ Türkçe stop word listesi hazır ve test edildi  
✅ Async job + retry + timeout çalışıyor  
✅ Performance hedefleri karşılandı  
✅ Code review tamamlandı  

---

## Tahmini Efor

| Alt Görev | Süre |
|---|---|
| Marka ve ürün adı skorlama | 0.75 gün |
| Kategori hiyerarşi skorlama | 0.5 gün |
| Attribute key-value Jaccard | 0.5 gün |
| TF-IDF modeli ve cache | 0.75 gün |
| Composite skor + normalize mekanizması | 0.5 gün |
| Async job + retry | 0.25 gün |
| Testler ve performans optimizasyonu | 0.75 gün |
| **Toplam** | **4 gün** |
