# Front-End Görevi: Ürün Listeleri — Drawer Filtre Paneli

## Hazır Olma Tanımı

**API endpoint hazır:** [ ] Evet / [ ] Kısmen / [ ] Hayır

**Tasarımlar hazır:** [ ] Figma linki eklendi / [ ] Mevcut drawer desenine uyum bekleniyor

---

## 1. Genel Bakış ve Bağlam

**Kullanıcı hikayesi:** Admin veya tedarikçi olarak, ürün listeleme sayfasında sağdan açılan filtre drawer'ını kullanarak listeleri daraltmak, sonuçları hızla bulmak istiyorum.

**Bu görev yalnızca ürün listelerini kapsar.** Talep listeleri için: `FRONTEND_TASK_DRAWER_TALEPLER.md`

**Öncelik:** [ ] Yüksek / [ ] Orta / [ ] Düşük

---

## 2. Liste Kapsamı — Admin ve Tedarikçi Farkı

Admin ve tedarikçi aynı drawer bileşenini kullanır; ancak **hangi ürünlerin listede göründüğü** role göre değişir.

### 2.1 Admin

| Liste | İçerik | Notlar |
|-------|--------|--------|
| **Aktif Ürünler** | Onaylanmış tüm ürünler | Arşivlenmiş ürünler **dahil**, stoğu 0 olan ürünler **dahil**. Admin tarafında ayrı bir "pasif" liste yoktur; her şey tek listede görünür. |

Admin bu tek liste bağlamında filtre drawer'ını açar. Filtreler; arşiv durumu, stok durumu ve diğer alanlara göre bu geniş evrende daraltma yapar.

### 2.2 Tedarikçi

| Grup | Liste | İçerik | Notlar |
|------|-------|--------|--------|
| **Aktif Ürünler** | Aktif ürün listesi | Onaylanmış ürünlerden **arşivlenmemiş** ve **stoğu 0 olmayan** ürünler | Tedarikçinin sağlıklı, satışta olan ürünleri |
| **Pasif** | Arşivlenenler | Arşivlenmiş onaylı ürünler | Tedarikçi tarafından veya yönetici kararıyla arşive alınanlar |
| **Pasif** | Stoğu Bitenler | Stoğu 0 olan onaylı ürünler | Stok girişi beklenen ürünler; arşiv politikasıyla çakışma varsa backend ile hizalanmalı |

Drawer, **hangi listede / sekmede** bulunulduğuna göre hem filtre alanlarını hem de API bağlamını doğru belirlemelidir. Örneğin "Arşivlenenler" alt listesinde arşiv durumu filtresi anlamsızdır; gösterilmemeli veya pasif bırakılmalıdır.

**Temel fark:** Tedarikçi verisi her zaman oturumdaki tedarikçiye aittir; admin tüm tedarikçilerin ürünlerini görebilir.

---

## 3. Tasarım ve Görseller

- Sağdan kayan drawer, overlay (tıklanabilir kapanma), başlık: **"Filtreler"**, üst sağda kapat (✕) ikonu.
- Alt aksiyonlar: **"Temizle"** butonu (zorunlu); **"Uygula"** butonu opsiyonel — ya debounce'lu anlık uygulama ya da explicit uygula.
- Mobil: içerik kaydırılabilir, drawer tam yükseklikte; masaüstü: sabit genişlik (önerilen `max-w-sm` veya `max-w-md`).
- Animasyon: 200–300 ms ease-out; `prefers-reduced-motion` desteği.
- **Figma / Tasarım linki:** [Eklenecek]

---

## 4. Fonksiyonel Gereksinimler

### 4.1 Ortak Davranışlar (Tüm Listeler)

| Gereksinim | Açıklama |
|------------|----------|
| **Tetikleyici** | Liste araç çubuğundaki "Filtreler" butonu → drawer sağdan açılır |
| **Bağlam tespiti** | Aktif sekme veya rota bilgisine göre filtre şablonu ve API parametreleri otomatik seçilir |
| **Temizle** | Tüm kontroller varsayılan değere döner; liste yeniden yüklenir |
| **Boş sonuç** | "Sonuç bulunamadı" bilgilendirmesi + "Filtreleri Temizle" CTA |
| **Aktif filtre rozeti** | "Filtreler" butonunda aktif filtre sayısı badge olarak gösterilebilir (opsiyonel) |

### 4.2 Admin — Aktif Ürünler (Onaylı Tüm Ürünler)

| Filtre Alanı | Tip | Notlar |
|--------------|-----|--------|
| Metin arama | Serbest metin | SKU, ürün adı, barkod (API kapasitesine göre) |
| Kategori | Çoklu seçim / ağaç | Hiyerarşik yapı varsa ağaç bileşeni |
| Marka | Çoklu seçim | |
| **Tedarikçi** | Çoklu seçim + arama | **Yalnızca admin.** Çok sayıda tedarikçi için arama destekli liste |
| Arşiv durumu | Radyo / toggle | Tümü / Arşivlenmemiş / Arşivlenmiş — listede ikisi de mevcut, bu yüzden anlamlı |
| Stok durumu | Seçim / aralık | "Stokta yok" dahil — stok 0 ürünler bu listede göründüğünden kullanışlı |
| Fiyat aralığı | Min–Max girişi | |
| Ürün durumu | Çoklu seçim | Varsa ek durum alanları (ör. yayın durumu) |
| Özellikler (attributes) | Dinamik | Seçili kategoriye bağlı dinamik filtreler |

### 4.3 Tedarikçi — Aktif Ürünler

| Filtre Alanı | Tip | Notlar |
|--------------|-----|--------|
| Metin arama | Serbest metin | SKU, ürün adı |
| Kategori | Çoklu seçim / ağaç | |
| Marka | Çoklu seçim | |
| Stok aralığı | Min–Max | Liste zaten "stoğu biten" hariç tutmuş olsa da aralık filtresi kullanışlı |
| Fiyat aralığı | Min–Max | |
| Özellikler | Dinamik | Kategoriye bağlı |
| ~~Tedarikçi~~ | — | **Gösterilmez** — veri oturumdaki tedarikçiye aittir |

### 4.4 Tedarikçi — Pasif: Arşivlenenler

| Filtre Alanı | Tip | Notlar |
|--------------|-----|--------|
| Metin arama | Serbest metin | SKU, ürün adı |
| Kategori, marka | Çoklu | |
| Arşiv tarihi aralığı | Tarih seçici | API'de `archivedAt` veya eşdeğer alan varsa |
| ~~Arşiv durumu~~ | — | Bu liste zaten arşivlenmiş; durum filtresi anlamsız — gösterilmez |

### 4.5 Tedarikçi — Pasif: Stoğu Bitenler

| Filtre Alanı | Tip | Notlar |
|--------------|-----|--------|
| Metin arama | Serbest metin | SKU, ürün adı |
| Kategori, marka | Çoklu | |
| Stok eşiği | Sayısal | Genelde 0 sabit; kritik stok eşiği iş kuralı varsa dokümante edilmeli |
| ~~Stok 0 filtresi~~ | — | Liste zaten 0 stoğa göre filtreli; ek "stokta yok" seçeneği gereksiz |

---

## 5. Teknik Özellikler ve Veri

**Endpoint önerisi (backend ile netleştirilmeli):**

```
GET /api/products
  ?status=approved
  &isArchived=true|false        // admin'de opsiyonel; tedarikçi aktif listesinde false sabit
  &stockMin=0&stockMax=...      // pasif stoğu bitenlerde stockMax=0 veya sabit
  &supplierId=...               // yalnız admin; tedarikçide gönderilmez
  &categoryId=...
  &brandId=...
  &search=...
  &priceMin=...&priceMax=...
  &page=...&limit=...
```

**Liste tanımı backend uyumu:**

| Taraf | Liste | Backend koşulu |
|-------|-------|----------------|
| Admin | Aktif ürünler | `status = approved` (arşiv ve stok koşulsuz) |
| Tedarikçi | Aktif ürünler | `status = approved AND isArchived = false AND stock > 0` |
| Tedarikçi | Pasif – Arşivlenenler | `status = approved AND isArchived = true` |
| Tedarikçi | Pasif – Stoğu Bitenler | `status = approved AND stock = 0` (AND arşiv politikası) |

**Edge case'ler:**

- Arşivlenmiş ve stoğu 0 olan ürün: pasif listede hangi kategoride göründüğü iş kuralına bağlı; backend ile hizalanmalı.
- Çok sayıda kategori / marka: lazy-load veya sayfalama dropdown.
- Filtre değerleri URL query string'e yansıtılırsa sayfa yenileme sonrası durum korunur.

---

## 6. UI Durumları

| Durum | Görünüm |
|-------|---------|
| **Yükleniyor** | Filtre alanları skeleton veya disabled; liste spinner/skeleton |
| **Hata** | Toast bildirimi; önceki sonuç korunabilir |
| **Boş sonuç** | "Bu kriterlere uygun ürün bulunamadı" + "Filtreleri Temizle" butonu |
| **Sıfırlanmış** | Tüm alanlar default; liste tam setini gösterir |

---

## 7. Erişilebilirlik (A11y)

- Drawer: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` başlık ile ilişkilendirilmeli.
- Açılışta odak drawer'ın ilk interaktif elemanına geçmeli; kapanışta tetikleyici butona dönmeli.
- **Escape** tuşuyla kapanma.
- Odak tuzağı: Tab sırası drawer dışına çıkmamalı.
- Tüm kontroller label ile ilişkilendirilmeli (`aria-label` veya `<label for>`).
- Klavye ile tam erişim (Select, Checkbox, DatePicker, Range bileşenleri dahil).

---

## 8. Kabul Kriterleri

- [ ] **Admin** — Aktif ürün listesinde drawer açılır; filtreler onaylı **tüm** ürünlere (arşivliler ve stok 0 dahil) uygulanır.
- [ ] **Admin** — Tedarikçi filtresi drawer'da görünür ve çalışır.
- [ ] **Tedarikçi** — Aktif ürün listesinde drawer açılır; veri yalnızca **arşivlenmemiş ve stoğu bitmemiş** onaylı ürünleri kapsar.
- [ ] **Tedarikçi** — Tedarikçi seçim filtresi drawer'da **yer almaz**.
- [ ] **Tedarikçi — Pasif / Arşivlenenler** — Drawer bu bağlamda açılır; "arşiv durumu" filtresi gösterilmez (anlamsız); varsa arşiv tarihi aralığı gösterilir.
- [ ] **Tedarikçi — Pasif / Stoğu Bitenler** — Drawer bu bağlamda açılır; filtreler stoğu 0 listesiyle uyumludur.
- [ ] Temizle aksiyonu tüm kontrolleri sıfırlar, liste yenilenir.
- [ ] Boş sonuç durumunda bilgilendirme ve "Filtreleri Temizle" CTA gösterilir.
- [ ] Mobil ve masaüstü görünümleri tasarıma uygun.
- [ ] A11y kriterleri sağlanır (dialog rolü, odak yönetimi, Escape, klavye).

---

## 9. İlgili Dokümanlar

- Talep listeleri drawer görevi: `FRONTEND_TASK_DRAWER_TALEPLER.md`
- Önceki filtre task dosyaları korunmuştur ve bu görev tarafından değiştirilmemiştir.
