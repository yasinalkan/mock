# Front-End Görevi: Talep Listeleri — Sağdan Açılan Filtre Drawer’ı (Talepler)

## Hazır Olma Tanımı

**API endpoint hazır:** [ ] Evet / [ ] Kısmen / [ ] Hayır — Talep listesi ve filtre parametreleri (`type`, `status`, tarih, tedarikçi vb.) netleştirilmeli.

**Tasarımlar hazır:** [ ] Figma / [ ] Ürün drawer’ı ile aynı görsel dil (`FRONTEND_TASK_PRODUCT_LIST_DRAWER_PRODUCTS.md`)

---

## 1. Genel Bakış ve Bağlam

**Kullanıcı hikayesi:** **Admin** ve **tedarikçi** olarak, **talep kuyruğu listelerinde** sağdan açılan filtre paneli ile talepleri daraltmak istiyorum.

Bu görev **yalnızca talep listelerini** kapsar. Ürün listeleri için ayrı dosya: `FRONTEND_TASK_PRODUCT_LIST_DRAWER_PRODUCTS.md`.

**Kapsam — her iki rol için üç liste türü:**

| # | Liste | Örnek içerik |
|---|--------|----------------|
| 1 | Yeni ürün talepleri | `product_create` (veya proje adlandırması) |
| 2 | Ürün güncelleme talepleri | `product_update` |
| 3 | Fiyat & stok talepleri | `stock_price_update` (veya birleşik / ayrı tipler) |

**Öncelik:** [Belirtin]

---

## 2. Admin ve Tedarikçi — Farklar (aynı görev içinde)

| Konu | Admin | Tedarikçi |
|--------|--------|-----------|
| **Görünen talepler** | Tüm tedarikçilerin talepleri (yetkiye göre) | Yalnızca oturum tedarikçisinin talepleri |
| **Tedarikçi filtresi** | Gösterilir — talebi gönderen tedarikçiye göre süzme | **Gösterilmez** (anlamsız) |
| **Durum, tarih, ürün/SKU araması** | Var | Var |
| **Drawer iskeleti** | Aynı (sağdan, overlay, Temizle/Uygula) | Aynı |

Drawer içeriği **aktif sekme / talep tipi** ile değişir; ortak alanlar tutarlı kalır.

---

## 3. Tasarım ve Görseller

Ürün drawer görevindeki ile aynı çerçeve: sağdan panel, başlık “Filtreler”, kapat, alt aksiyonlar, mobil kaydırma, animasyon ve `prefers-reduced-motion`.

---

## 4. Fonksiyonel Gereksinimler

### 4.1 Ortak (her üç talep listesi)

| Gereksinim | Açıklama |
|------------|----------|
| Tetikleyici | “Filtreler” → drawer. |
| Bağlam | URL veya sekme hangi talep tipindeyse filtre etiketleri ve varsayılanlar buna uygun (ör. fiyat/stok listesinde “talep alt tipi” varsa). |
| Durum filtresi | Çoklu seçim — örn. `submitted`, `toBeRevised`, `rejected` (ekranda gösterilen statülere göre) |
| Tarih aralığı | Talep tarihi (`submittedAt` veya eşdeğer) |
| Ürün / SKU / metin arama | İlgili ürün veya talep alanlarına göre |

### 4.2 Yalnız admin

| Alan | Açıklama |
|------|----------|
| Tedarikçi | Çoklu seçim veya aramalı liste — talebi oluşturan tedarikçi |

### 4.3 Yeni ürün talepleri — ek notlar

- Kategori / marka filtreleri API destekliyorsa drawer’da gösterilir.
- Reddedilmiş / iptal listelerde gösterim politikası ürün kuralına göre daraltılabilir.

### 4.4 Ürün güncelleme talepleri

- Admin: tedarikçi + durum + tarih + arama.
- Tedarikçi: durum + tarih + arama (tedarikçi filtresi yok).

### 4.5 Fiyat & stok talepleri

- Opsiyonel: talep **alt tipi** (sadece fiyat / sadece stok / her ikisi) — backend alanı varsa.
- Diğer alanlar yukarıdaki ortak + admin tedarikçi satırı ile aynı mantık.

### 4.6 Etkileşimler

- Temizle: tüm kriterler sıfır; liste yenilenir.
- Boş sonuç: mesaj + filtreleri temizle.
- İsteğe bağlı: aktif filtre sayısı rozeti “Filtreler” butonunda.

---

## 5. Teknik Özellikler ve Veri

**Örnek sözleşme (netleştirilmeli)**

- `GET /api/requests?type=product_create|product_update|stock_price_update&status=&supplierId=&from=&to=&search=`
- Tedarikçi çağrılarında `supplierId` **gönderilmez**; sunucu oturumdan türetir.

**Edge case’ler**

- Çok sayıda tedarikçi: admin tedarikçi seçicisinde arama / sayfalama.
- Yükleme ve hata durumları: skeleton / toast; önceki sonuç korunabilir.

---

## 6. Erişilebilirlik (A11y)

Ürün drawer görevi ile aynı: dialog rolü, odak yönetimi, Escape, etiketler, klavye.

---

## 7. Kabul Kriterleri

- [ ] Üç talep listesinin her birinde (yeni ürün, ürün güncelleme, fiyat & stok) drawer açılır ve doğru bağlama göre filtre alanları gösterilir.
- [ ] **Admin:** tedarikçi filtresi vardır ve çalışır.
- [ ] **Tedarikçi:** tedarikçi filtresi yoktur; yalnız kendi talepleri listelenir.
- [ ] Durum, tarih ve arama (ve varsa alt tip) backend ile uyumlu çalışır.
- [ ] Temizle, boş durum, mobil ve A11y kriterleri sağlanır.

---

## 8. İlgili Dokümanlar

- Ürün listeleri drawer görevi: `FRONTEND_TASK_PRODUCT_LIST_DRAWER_PRODUCTS.md`
- Önceki ayrı `FRONTEND_TASK_PRODUCT_LIST_FILTERS_ADMIN.md` / `..._SUPPLIER.md` dosyalarına dokunulmamıştır; bu görevler güncel kapsam için bu iki yeni dosyayı referans alabilir.
