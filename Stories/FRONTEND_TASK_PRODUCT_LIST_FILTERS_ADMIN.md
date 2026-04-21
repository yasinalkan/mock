# Front-End Görevi: Ürün Listeleri — Sağdan Açılan Filtre Drawer’ı (Admin)

## Hazır Olma Tanımı

**API endpoint hazır:** [ ] Evet / [ ] Kısmen / [ ] Hayır — Liste ve filtre parametreleri için sözleşme netleştirilmeli (örn. `GET /api/products`, `GET /api/requests` + query params).

**Tasarımlar hazır:** [ ] Figma / [ ] Mevcut panel desenine uyum (`clean.html` içindeki `filterPanel`, `openFilterPanel` referansı)

---

## 1. Genel Bakış ve Bağlam

**Kullanıcı hikayesi:** Bir **admin** olarak, **ürün listesi sayfalarında sağdan açılan bir filtre paneli ile listeyi daraltmak** istiyorum, böylece **aktif ürünleri ve çeşitli talep kuyruklarını hızlıca süzebileyim**.

**Kapsam (Admin):** Aşağıdaki dört liste için drawer filtreleri uygulanır:

| # | Liste | Örnek rota / sekme (referans) |
|---|--------|-------------------------------|
| 1 | Aktif ürünler listesi | `#products/aktif` |
| 2 | Ürün oluşturma talepleri listesi | `#products/yeni-urun-talepleri` |
| 3 | Ürün güncelleme talepleri listesi | `#products/urun-guncelleme` |
| 4 | Fiyat / stok güncelleme talepleri listesi | `#products/fiyat-stok-istekleri` |

**Admin’de bulunmayan listeler (bu görevin dışında):** Arşivlenen ürünler listesi, stoğu biten ürünler listesi — bu sekmeler/rota admin ürün menüsünde yoksa drawer da uygulanmaz.

**Özellik / epik:** Ürün yönetimi — liste filtreleme UX’i  
**Öncelik:** [Belirtin]

---

## 2. Tasarım ve Görseller

**Drawer davranışı**

- Viewport’un sağından kayarak açılır (`translate-x-full` → `translate-x-0` veya eşdeğeri).
- Arka plan: yarı saydam overlay; tıklanınca drawer kapanır.
- Genişlik: masaüstünde sabit genişlik (örn. `max-w-md` / ~384px); mobilde tam genişlik veya neredeyse tam genişlik.
- Z-index: liste ve header’ın üzerinde; odak sırası drawer içine taşınır.

**Tutarlı UI öğeleri**

- Üst: başlık “Filtreler”, kapat (X) butonu.
- Alt (sticky): “Temizle”, “Uygula” (veya anlık uygulama tercih ediliyorsa sadece “Temizle” + debounce’lu canlı filtre — ürün ekibi karar verir).
- Bölümler: başlık + ikon; form kontrolleri arasında tutarlı dikey boşluk (`space-y-4` benzeri).

**Mobil vs masaüstü**

- Mobilde drawer tam yükseklik, kaydırılabilir içerik alanı (`overflow-y-auto`).
- Klavye açıldığında alanların görünür kalması (input’lar viewport’ta kalmalı).

---

## 3. Fonksiyonel Gereksinimler

### 3.1 Ortak davranış (tüm admin listeleri)

| Gereksinim | Açıklama |
|------------|----------|
| Tetikleyici | Sayfa araç çubuğunda “Filtreler” butonu; tıklanınca drawer açılır. |
| Bağlam duyarlılığı | Drawer içeriği **aktif liste tipine** göre değişir (URL veya sekme state’i ile). Yanlış sekmede kullanılmayan filtre gösterilmez. |
| Durum senkronu | Uygulanan filtreler URL query parametreleri veya global store ile senkronlanabilir (geri/ileri, paylaşılabilir link). En azından sayfa yenilenmeden liste ile tutarlı olmalı. |
| Sonuç sayısı | İsteğe bağlı: “X ürün gösteriliyor” / “X talep” metni drawer veya liste üstünde güncellenir. |
| Boş sonuç | Filtre sonucu 0 ise liste boş durumu + “Filtreleri temizle” CTA. |

### 3.2 Aktif ürünler listesi — önerilen filtre alanları

| Alan | Tip | Not |
|------|-----|-----|
| Metin arama | Arama kutusu | SKU, ürün adı, barkod (API yeteneklerine göre) |
| Kategori | Ağaç / çok seviyeli seçici veya çoklu seçim | Alt kategori dahil |
| Marka | Çoklu seçim veya aramalı dropdown | |
| Tedarikçi | Çoklu seçim | **Sadece admin** |
| Ürün durumu | Çoklu seçim | Örn. aktif, taslak, onay bekleyen (iş kurallarına göre) |
| Stok aralığı | Min–max sayı | |
| Fiyat aralığı | Min–max (para birimi) | |
| Özellikler (attributes) | Dinamik filtreler | Kategoriye bağlı attribute’lar (mock’ta `generateAttributeFilters` benzeri) |
| Sağlık / eksik alan | Checkbox veya eşik | Varsa |

### 3.3 Ürün oluşturma talepleri listesi

| Alan | Tip | Not |
|------|-----|-----|
| Talep durumu | Çoklu seçim | Örn. `submitted`, `toBeRevised`, `rejected` (gösterilen statülere göre) |
| Tedarikçi | Çoklu seçim | Talebi gönderen |
| Tarih aralığı | Başlangıç–bitiş | `submittedAt` |
| Kategori / SKU / ad | Metin veya seçiciler | API’ye göre |

### 3.4 Ürün güncelleme talepleri listesi

| Alan | Tip | Not |
|------|-----|-----|
| Talep durumu | Çoklu seçim | Oluşturma talebi ile aynı mantık |
| Tedarikçi | Çoklu seçim | |
| Tarih aralığı | Başlangıç–bitiş | |
| Ürün / SKU araması | Metin | İlgili ürüne göre |

### 3.5 Fiyat / stok güncelleme talepleri listesi

| Alan | Tip | Not |
|------|-----|-----|
| Talep durumu | Çoklu seçim | |
| Tedarikçi | Çoklu seçim | |
| Tarih aralığı | Başlangıç–bitiş | |
| Talep tipi | Tekli seçim | Sadece fiyat / sadece stok / ikisi (varsa) |

### 3.6 Etkileşimler ve animasyon

- Drawer açılış/kapanış: 200–300ms geçiş; `prefers-reduced-motion` için animasyon kısaltılır veya kapatılır.
- “Temizle”: tüm kontroller varsayılan; liste tam veri setine döner (sayfalama sıfırlanır).
- “Uygula”: validasyon hatası yoksa drawer kapanabilir veya açık kalabilir (tasarım kararı).

---

## 4. Teknik Özellikler ve Veri

**API (örnek sözleşme — netleştirilmeli)**

- Ürün listesi: `GET /api/products?...` — kategori, marka, supplierId, stok, fiyat, arama.
- Talepler: `GET /api/requests?type=product_create|product_update|stock_price_update&status=&supplierId=&from=&to=`

**Edge case’ler**

- Yükleme: drawer açıkken kategori/tedarikçi listesi yükleniyorsa skeleton veya spinner.
- Hata: filtre API’si hata verirse toast + önceki sonuç korunur veya boş durum mesajı.
- Çok fazla seçenek: tedarikçi ve kategori için aramalı virtualized liste düşünülebilir.

---

## 5. Erişilebilirlik (A11y)

- Drawer: `role="dialog"` veya uygun `aria-modal="true"`; `aria-labelledby` ile başlık ilişkisi.
- Odak tuzağı: açılışta ilk odaklanabilir elemana focus; kapanışta tetikleyici butona focus dönüşü.
- `Escape` ile kapanma.
- Tüm form kontrollerinde programatik etiket (`label` / `aria-label`).
- Klavye ile tüm filtreler ve aksiyonlar erişilebilir.

---

## 6. Kabul Kriterleri (Definition of Done)

- [ ] Admin’in eriştiği dört ürün listesinde “Filtreler” drawer’ı sağdan açılır ve kapanır.
- [ ] Her liste tipi için yalnızca ilgili filtre alanları gösterilir; arşiv / stok biten için drawer **tanımlanmaz** (admin menüsünde yok).
- [ ] Filtreler uygulandığında liste ve sayfalama doğru güncellenir; temizleme tüm kriterleri sıfırlar.
- [ ] Overlay tıklaması ve Escape ile kapanır; odak yönetimi A11y gereksinimlerini karşılar.
- [ ] Mobil ve masaüstünde drawer kullanılabilir; içerik taşmasında kaydırma çalışır.
- [ ] Loading / empty / error durumları tanımlıdır.
- [ ] (Varsa) Lighthouse erişilebilirlik hedefi ekip standardına uygundur.

---

## 7. Bağımlılıklar ve Notlar

- Backend’in her liste için filtre query parametrelerini desteklemesi gerekir; desteklenmeyen alanlar UI’da gösterilmemeli veya “yakında” olarak işaretlenmelidir.
- Bu doküman **yalnızca admin** kapsamındadır; tedarikçi drawer gereksinimleri `FRONTEND_TASK_PRODUCT_LIST_FILTERS_SUPPLIER.md` dosyasında tanımlanmıştır.
