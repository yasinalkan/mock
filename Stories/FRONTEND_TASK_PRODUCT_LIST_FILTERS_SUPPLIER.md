# Front-End Görevi: Ürün Listeleri — Sağdan Açılan Filtre Drawer’ı (Tedarikçi)

## Hazır Olma Tanımı

**API endpoint hazır:** [ ] Evet / [ ] Kısmen / [ ] Hayır — Tedarikçi kapsamı için `supplierId` (veya token’dan türetilen bağlam) ile filtrelenmiş uçlar netleştirilmeli.

**Tasarımlar hazır:** [ ] Figma / [ ] Admin drawer ile aynı görsel dil; tedarikçi panelinde “Tedarikçi” filtresi **gösterilmez**.

---

## 1. Genel Bakış ve Bağlam

**Kullanıcı hikayesi:** Bir **tedarikçi** olarak, **ürün listesi sayfalarında sağdan açılan filtre paneli ile kendi ürün ve taleplerimi daraltmak** istiyorum, böylece **aktif ürünler, talep kuyrukları, arşiv ve stok sorunlarını daha hızlı yönetebileyim**.

**Kapsam (Tedarikçi):** Aşağıdaki **altı** liste için drawer filtreleri uygulanır:

| # | Liste | Örnek rota / sekme (referans) |
|---|--------|-------------------------------|
| 1 | Aktif ürünler listesi | `#products/aktif` |
| 2 | Ürün oluşturma talepleri listesi | `#products/yeni-urun-talepleri` |
| 3 | Ürün güncelleme talepleri listesi | `#products/urun-guncelleme` |
| 4 | Fiyat / stok güncelleme talepleri listesi | `#products/fiyat-stok-istekleri` |
| 5 | Arşivlenen ürünler listesi | `#products/archived-items` (veya projedeki eşdeğer rota) |
| 6 | Stoğu biten ürünler listesi | `#products/out-of-stock` (veya eşdeğer) |

**Admin ile fark:** Tedarikçide arşiv ve stoğu biten listeler **vardır**; veri her zaman oturumdaki tedarikçi ile sınırlıdır. **Tedarikçi seçimi filtresi yoktur.**

**Özellik / epik:** Tedarikçi ürün yönetimi — liste filtreleme  
**Öncelik:** [Belirtin]

---

## 2. Tasarım ve Görseller

Admin göreviyle aynı drawer çerçevesi:

- Sağdan kayan panel, overlay, üst başlık + kapat, alt “Temizle” / “Uygula”.
- Tedarikçi paneli renk/spacing token’ları mevcut ürün listesi sayfası ile uyumlu olmalı.

**Mobil:** Tam veya neredeyse tam genişlik; uzun formlarda dikey kaydırma.

---

## 3. Fonksiyonel Gereksinimler

### 3.1 Ortak davranış (tüm tedarikçi listeleri)

| Gereksinim | Açıklama |
|------------|----------|
| Tetikleyici | “Filtreler” butonu → drawer açılır. |
| Bağlam duyarlılığı | Aktif sekmeye göre filtre seti değişir. |
| Veri kapsamı | Tüm sorgular **yalnızca giriş yapan tedarikçinin** verisini döndürür; UI’da başka tedarikçi seçilemez. |
| Sonuç sayısı / boş durum | Admin görevindeki ile aynı mantık. |

### 3.2 Aktif ürünler listesi — önerilen filtre alanları

| Alan | Tip | Not |
|------|-----|-----|
| Metin arama | Arama | SKU, ad (API desteğine göre) |
| Kategori | Seçim / çoklu | Kendi ürünlerinin kategorileri |
| Marka | Çoklu | Varsa |
| Stok aralığı | Min–max | |
| Fiyat aralığı | Min–max | |
| Özellikler | Dinamik | Kategori bağlı attribute filtreleri |
| Arşiv / yasaklı | Checkbox | Sadece ilgili alt listeler açıksa veya aktif listede iş kuralı varsa |

**Çıkarılan:** “Tedarikçi” filtresi — tedarikçi kullanıcı için anlamsız.

### 3.3 Ürün oluşturma talepleri listesi

| Alan | Tip | Not |
|------|-----|-----|
| Talep durumu | Çoklu seçim | Örn. submitted, toBeRevised |
| Tarih aralığı | Başlangıç–bitiş | |
| Kategori / SKU / ad | Metin veya seçici | Sadece kendi talepleri |

### 3.4 Ürün güncelleme talepleri listesi

| Alan | Tip | Not |
|------|-----|-----|
| Talep durumu | Çoklu seçim | |
| Tarih aralığı | Başlangıç–bitiş | |
| Ürün / SKU araması | Metin | |

### 3.5 Fiyat / stok güncelleme talepleri listesi

| Alan | Tip | Not |
|------|-----|-----|
| Talep durumu | Çoklu seçim | |
| Tarih aralığı | Başlangıç–bitiş | |
| Talep tipi | Tekli | Fiyat / stok / her ikisi (varsa) |

### 3.6 Arşivlenen ürünler listesi — önerilen filtre alanları

| Alan | Tip | Not |
|------|-----|-----|
| Metin arama | Arama | SKU, ürün adı |
| Kategori | Çoklu | |
| Arşivlenme tarihi aralığı | Tarih | `archivedAt` veya eşdeğer alan |
| Marka | Çoklu | Varsa |

### 3.7 Stoğu biten ürünler listesi — önerilen filtre alanları

| Alan | Tip | Not |
|------|-----|-----|
| Metin arama | Arama | SKU, ad |
| Kategori | Çoklu | |
| Stok = 0 | Sabit kural | Liste zaten “biten” ise ek filtre sadece alt küme (örn. “kritik sipariş bekleyen”) için genişletilebilir — iş kuralına bağlı |
| Marka | Çoklu | Varsa |

### 3.8 Etkileşimler

- Admin dokümanındaki animasyon, Escape, overlay ve “Temizle” davranışı ile aynı standardı kullanın.

---

## 4. Teknik Özellikler ve Veri

**API**

- Tedarikçi bağlamı: `supplierId` JWT/session’dan; istemci filtreye supplier id **eklememeli** (güvenlik).
- Örnek: `GET /api/supplier/products?categoryId=&search=&stockMin=&stockMax=`
- Talepler: `GET /api/supplier/requests?type=...&status=&from=&to=`
- Arşiv / out-of-stock: ayrı uçlar veya `status=archived`, `stock=0` gibi parametreler — backend sözleşmesi ile hizalanmalı.

**Edge case’ler**

- Tedarikçinin hiç ürünü yokken drawer açılabilir; filtre alanları boş seçeneklerle graceful degrade.
- Yetkisiz rota: drawer tetiklenmemeli veya liste zaten yönlendiriyorsa drawer render edilmez.

---

## 5. Erişilebilirlik (A11y)

Admin görevindeki A11y maddelerinin tamamı geçerlidir (`role="dialog"`, odak tuzağı, Escape, etiketler).

---

## 6. Kabul Kriterleri (Definition of Done)

- [ ] Tedarikçinin eriştiği **altı** listede (aktif, üç talep tipi, arşiv, stoğu biten) filtre drawer’ı tutarlı şekilde çalışır.
- [ ] Hiçbir ekranda “Tedarikçi seç” filtresi gösterilmez; veri her zaman oturum tedarikçisine göre filtrelenir.
- [ ] Arşiv ve stoğu biten listeler için yukarıdaki ek filtre alanları uygulanır veya bilinçli olarak “Faz 2”ye ertelenmişse dokümante edilir.
- [ ] Filtre uygula / temizle, liste, sayfalama ve boş durumlar doğru çalışır.
- [ ] Mobil ve masaüstü kullanılabilirlik ve A11y kriterleri sağlanır.

---

## 7. Bağımlılıklar ve Notlar

- Admin tarafı gereksinimleri: `FRONTEND_TASK_PRODUCT_LIST_FILTERS_ADMIN.md`.
- Rota isimleri (`archived-items`, `out-of-stock`) projede farklıysa bu dokümandaki tablo güncellenmelidir; geliştirme sırasında tek kaynak hash → liste tipi eşlemesi kullanılmalıdır.
