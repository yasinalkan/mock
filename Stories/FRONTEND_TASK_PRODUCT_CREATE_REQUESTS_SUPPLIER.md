# Front-End Görevi: Ürün Oluşturma Talebi Detay Sayfası (Tedarikçi Görünümü)

## Hazır Olma Tanımı:

**API Endpoint hazır:** ✅ Evet - `GET /api/requests/{id}`, `PUT /api/requests/{id}/cancel`, `PUT /api/requests/{id}/resubmit`

**Tasarımlar hazır:** ✅ Evet - Mevcut tedarikçi talep detay sayfası desenlerine dayalı

---

## 1. Genel Bakış ve Bağlam

**Kullanıcı Hikayesi:** Bir **tedarikçi** olarak, **gönderdiğim ürün oluşturma talebinin detaylarını görüntülemek, revizyon istendiğinde düzenleyip tekrar göndermek veya gerekirse talebi iptal etmek** istiyorum, böylece **ürün oluşturma sürecimi takip edip yönetebilirim**.

**Özellik/Epik:** Ürün Talep Yönetim Sistemi / Tedarikçi Paneli

**Öncelik:** Yüksek

---

## 2. Tasarım ve Görseller

**Figma/Tasarım Linki:** Yok - Mevcut tedarikçi talep detay sayfası desenlerini takip edin

**Varlıklar:**
- Durum rozetleri: Sarı "Onay Bekliyor" (submitted), Turuncu "Revize Edilecek" (toBeRevised), Kırmızı "Reddedildi" (rejected), Gri "İptal Edildi" (canceled), Yeşil "Kabul Edildi" (approved)
- Red gerekçesi bölümü: Kırmızı temalı, sol kenarlıklı bildirim kutusu
- Revizyon gerekçesi bölümü: Turuncu temalı, sol kenarlıklı bildirim kutusu

**Mobil vs. Masaüstü:**
- **Masaüstü:** Tam genişlik düzen
- **Mobil/Tablet:** Tek sütun düzen, görseller alt alta

**Tasarım Özellikleri:**
- Sayfa arka planı: Gri-yeşil palet
- Header kartı: `bg-white rounded-lg shadow-sm border border-gray-200`
- Durum rozeti renkleri:
  - Onay Bekliyor: `bg-yellow-100 text-yellow-800`
  - Revize Edilecek: `bg-orange-100 text-orange-800`
  - Reddedildi: `bg-red-100 text-red-800`
  - İptal Edildi: `bg-gray-100 text-gray-800`
  - Kabul Edildi: `bg-green-100 text-green-800`
- Red gerekçesi kutusu: `bg-red-50 border-l-4 border-red-500`
- Revizyon gerekçesi kutusu: `bg-orange-50 border-l-4 border-orange-500`
- İptal Et butonu: `bg-red-600 text-white hover:bg-red-700`
- Düzenle butonu: `bg-blue-600 text-white hover:bg-blue-700`
- Tekrar Gönder butonu: `bg-green-600 text-white hover:bg-green-700`

---

## 3. Fonksiyonel Gereksinimler

### 3.1 Sayfa Yapısı

| Gereksinim | Açıklama |
|------------|----------|
| **Geri Butonu** | Sayfanın üstünde, `#products/urun-olusturma` adresine geri yönlendirir |
| **Başlık** | "Ürün Oluşturma Talebi" ve altında "Talep ID: #{id}" |
| **Header Grid** | 3 sütunlu grid: Sol → Başlık + ID / Orta → Tarih bilgileri / Sağ → Durum badge'i |
| **Oluşturma Tarihi** | Talebin gönderildiği tarih (`submittedAt`) — takvim ikonu ile |
| **Güncelleme Tarihi** | Sadece `updatedAt` veya `revisedAt` varsa gösterilir — düzenleme ikonu ile |
| **Durum Badge'i** | Dinamik olarak duruma göre değişir |

**Durum Badge Durumları:**

| Talep Durumu | Badge Metni | Badge Stili | İkon |
|-------------|-------------|-------------|------|
| `submitted` | Onay Bekliyor | `bg-yellow-100 text-yellow-800` | `fa-clock` |
| `toBeRevised` | Revize Edilecek | `bg-orange-100 text-orange-800` | `fa-exclamation-circle` |
| `rejected` | Reddedildi | `bg-red-100 text-red-800` | `fa-times-circle` |
| `canceled` | İptal Edildi | `bg-gray-100 text-gray-800` | `fa-ban` |
| `approved` | Kabul Edildi | `bg-green-100 text-green-800` | `fa-check-circle` |

> **Not:** `canceled` ve `approved` durumundaki talepler tedarikçi tarafından **görüntülenemez**. Bu statülere sahip talep detay sayfasına erişilmeye çalışıldığında listeye yönlendirilir.

### 3.2 Red Gerekçesi Bölümü

Sadece `status === 'rejected'` durumunda gösterilir. Header ile içerik arasına yerleştirilir.

| Gereksinim | Açıklama |
|------------|----------|
| **Kutu Stili** | `bg-red-50 border-l-4 border-red-500 rounded-md p-4` |
| **İkon** | `fa-times-circle` kırmızı ikon |
| **Başlık** | "Red Gerekçesi" — `text-sm font-semibold text-red-900` |
| **Tarih** | Sağ üstte red tarihi — `text-xs text-red-600` |
| **Nedenler** | Her neden ayrı bir etiket olarak gösterilir — `bg-red-100 text-red-800 rounded text-xs` |
| **Yorum** | Varsa, alt çizgi ile ayrılmış alanda gösterilir — `text-xs text-gray-700` |

### 3.3 Revizyon Gerekçesi Bölümü

Sadece `status === 'toBeRevised'` durumunda gösterilir. Header ile içerik arasına yerleştirilir.

| Gereksinim | Açıklama |
|------------|----------|
| **Kutu Stili** | `bg-orange-50 border-l-4 border-orange-500 rounded-md p-4` |
| **İkon** | `fa-exclamation-circle` turuncu ikon |
| **Başlık** | "Revizyon Gerekçesi" — `text-sm font-semibold text-orange-900` |
| **Tarih** | Sağ üstte revizyon tarihi — `text-xs text-orange-600` |
| **Neden** | Revizyon nedeni metin olarak gösterilir — `text-sm text-gray-700` |
| **Mesaj** | Varsa, detaylı mesaj gösterilir — `text-xs text-gray-700` |

### 3.4 Ürün Bilgileri Görünümü

| Gereksinim | Açıklama |
|------------|----------|
| **Ürün Bilgileri** | Talep edilen ürün bilgilerinin gösterimi |
| **Gösterilecek Alanlar** | Ad, SKU, kategori, marka, açıklama, anahtar kelimeler, özellikler (attributes) |
| **Stok ve Fiyat** | Talep edilen stok ve fiyat bilgileri gösterilir (varsa) |
| **Görseller** | Gönderilen görseller — kare görseller, 2 sütunlu grid |
| **Düzenleme** | `toBeRevised` durumunda alanlar düzenlenebilir (inline veya düzenleme sayfasına yönlendirme) |

### 3.5 Aksiyon Butonları

Sayfanın alt kısmında, sağa hizalı. Duruma göre farklı butonlar gösterilir.

**`submitted` durumunda:**

| Buton | Stil | Davranış |
|-------|------|----------|
| **İptal Et** | `bg-red-600 text-white` + `fa-ban` ikonu | İptal onay modalını açar |

**`toBeRevised` durumunda:**

| Buton | Stil | Davranış |
|-------|------|----------|
| **İptal Et** | `bg-red-600 text-white` + `fa-ban` ikonu | İptal onay modalını açar |
| **Düzenle** | `bg-blue-600 text-white` + `fa-edit` ikonu | Düzenleme moduna geçer veya düzenleme sayfasına yönlendirir |
| **Tekrar Gönder** | `bg-green-600 text-white` + `fa-paper-plane` ikonu | Düzenlenen talebi tekrar gönderir |

**`rejected` durumunda:**

| Buton | Stil | Davranış |
|-------|------|----------|
| **Yeni Talep Oluştur** | `bg-blue-600 text-white` + `fa-plus` ikonu | Yeni ürün oluşturma sayfasına yönlendirir |

### 3.6 İptal Onay Modalı

| Gereksinim | Açıklama |
|------------|----------|
| **Modal Başlığı** | "Talebi İptal Et" |
| **Mesaj** | "Bu talebi iptal etmek istediğinizden emin misiniz? Bu işlem geri alınamaz." |
| **Butonlar** | "İptal Et" (kırmızı) + "Vazgeç" (gri) |

### Etkileşimler

**Tıklama:**
- **Geri Butonu:** `#products/urun-olusturma` adresine döner
- **İptal Et:** Onay modalı gösterir → talebi `canceled` yapar → toast gösterir → listeye döner
- **Düzenle:** Düzenleme moduna geçer (toBeRevised durumunda)
- **Tekrar Gönder:** Düzenlenen talebi `submitted` olarak tekrar gönderir → toast gösterir
- **Yeni Talep Oluştur:** `#products/new` adresine yönlendirir (rejected durumunda)

**Hover:**
- Butonlar: Arka plan rengi koyulaşır
- Geri butonu: Metin rengi koyulaşır

### Durum Yönetimi

```
submitted   ──► canceled    (İptal Et → onay modalı → onayla)
toBeRevised ──► canceled    (İptal Et → onay modalı → onayla)
toBeRevised ──► submitted   (Düzenle → Tekrar Gönder)
```

> **Not:** `approved` ve `rejected` geçişleri admin tarafından yapılır, tedarikçi bu aksiyonları yapamaz.

**Sayfa UI Durumları:**

| Talep Durumu | Aksiyon Butonları | Red Gerekçesi | Revizyon Gerekçesi | Ürün Bilgileri | Görüntüleme |
|-------------|-------------------|---------------|-------------------|----------------|-------------|
| `submitted` | İptal Et | Gizli | Gizli | Gösterilir (salt okunur) | ✅ Var |
| `toBeRevised` | İptal Et + Düzenle + Tekrar Gönder | Gizli | Gösterilir | Gösterilir (düzenlenebilir) | ✅ Var |
| `rejected` | Yeni Talep Oluştur | Gösterilir | Gizli | Gösterilir (salt okunur) | ✅ Var |
| `canceled` | — | — | — | — | ❌ Yok (erişim engelli) |
| `approved` | — | — | — | — | ❌ Yok (erişim engelli) |

### Animasyonlar

- **Modal Açılma/Kapanma:** Fade in/out
- **Toast Bildirimi:** İptal/tekrar gönder sonrası bilgi mesajı

### Navigasyon

| Aksiyon | Hedef |
|---------|-------|
| Geri butonu | `#products/urun-olusturma` |
| İptal Et sonrası | `#products/urun-olusturma` |
| Tekrar Gönder sonrası | Sayfa yenilenir (yeni durumu göster) |
| Yeni Talep Oluştur | `#products/new` |
| `canceled`/`approved` talep erişimi | `#products/urun-olusturma` (yönlendir) |

---

## 4. Teknik Özellikler ve Veri

### API/Veri Kaynağı

**Talep Detay:** `GET /api/requests/{id}`

**İptal:** `PUT /api/requests/{id}/cancel`

**Tekrar Gönder:** `PUT /api/requests/{id}/resubmit`
```javascript
{
  "data": {
    "name": { "tr": "Güncel Ad", "en": "Updated Name" },
    "sku": "SKU-001",
    "categoryId": 5,
    "brandId": 3,
    "description": "Güncel açıklama",
    "attributes": { ... },
    "images": [ ... ]
  }
}
```

### Veri Alanları

**Talep Objesi:**
- `id` (number) — Talep ID'si
- `type` (string) — `"product_create"`
- `status` (string) — `"submitted"` | `"toBeRevised"` | `"rejected"` | `"canceled"` | `"approved"`
- `productId` (number) — İlişkili ürün ID'si
- `supplierId` (number) — Talebi gönderen tedarikçi (mevcut kullanıcıyla eşleşmeli)
- `submittedAt` (ISO string) — Gönderim tarihi
- `updatedAt` (ISO string, opsiyonel) — Güncelleme tarihi
- `revisedAt` (ISO string, opsiyonel) — Revizyon tarihi
- `revisionReason` (string, opsiyonel) — Revizyon nedeni (admin mesajı)
- `revisionMessage` (string, opsiyonel) — Detaylı revizyon mesajı
- `data` (object) — Ürün bilgileri
  - `name` (object) — `{ tr: string, en: string }`
  - `sku` (string)
  - `categoryId` (number)
  - `brandId` (number)
  - `description` (string)
  - `keywords` (string)
  - `attributes` (object)
  - `requestedPrice` (number, opsiyonel)
  - `requestedStock` (number, opsiyonel)
  - `images` (array)
  - `imageUrl` (string)

**Red Bilgileri (sadece `rejected` durumunda):**
- `rejectionReason` (string) — Birleştirilmiş red nedenleri
- `rejectionReasons` (string[]) — Ayrı ayrı red nedenleri dizisi
- `rejectionComment` (string, opsiyonel) — Admin yorumu
- `rejectedAt` (ISO string) — Red tarihi
- `rejectedBy` (string) — Reddeden admin adı

### Uç Durumlar

| Durum | Davranış |
|-------|----------|
| Talep bulunamadı | Toast hata mesajı göster, listeye yönlendir |
| Talep başka tedarikçiye ait | Toast hata mesajı göster, listeye yönlendir |
| İptal onayında hata | Toast hata mesajı göster |
| Tekrar gönderme başarısız | Toast hata mesajı göster, formu koru |
| `pageContent` elementi yüklenmemiş | 200ms sonra tekrar dene |
| Talep `canceled` durumunda | Sayfa görüntülenemez, listeye yönlendir |
| Talep `approved` durumunda | Sayfa görüntülenemez, listeye yönlendir |

**Tarih Formatı:** DD.MM.YYYY HH:mm (Türkçe yerel ayar)

---

## 5. Erişilebilirlik (A11y) ve SEO

### A11y

- İptal Et Butonu: `aria-label="Talebi iptal et"`
- Düzenle Butonu: `aria-label="Talebi düzenle"`
- Tekrar Gönder Butonu: `aria-label="Talebi tekrar gönder"`
- Yeni Talep Oluştur Butonu: `aria-label="Yeni talep oluştur"`
- Geri Butonu: `aria-label="Talep listesine dön"`
- Durum Badge: `aria-label="Durum: {status}"`
- Modal açıkken odak modal içine kilitlenir (focus trap)
- Modal'da Escape ile kapatma
- Tüm butonlarda görünür odak çerçevesi (`ring-2 ring-blue-500`)

### SEO

- Sayfa başlığı: "Ürün Oluşturma Talebi #{id} - Tedarikçi Paneli"
- Robots: `noindex, nofollow`
- H1: "Ürün Oluşturma Talebi"

---

## 6. Kabul Kriterleri ("Tamamlanma Tanımı")

### Sayfa Yapısı ve Görsel
- [ ] Sayfa başlığı "Ürün Oluşturma Talebi" ve Talep ID gösteriliyor
- [ ] Header 3 sütunlu grid: başlık / tarih / durum badge
- [ ] Oluşturma tarihi her zaman gösteriliyor
- [ ] Güncelleme tarihi sadece varsa gösteriliyor
- [ ] Geri butonu çalışıyor ve listeye yönlendiriyor

### Red Gerekçesi Bölümü
- [ ] Sadece `rejected` durumunda gösteriliyor
- [ ] Red nedenleri ayrı etiketler olarak listeleniyor
- [ ] Admin yorumu varsa gösteriliyor

### Revizyon Gerekçesi Bölümü
- [ ] Sadece `toBeRevised` durumunda gösteriliyor
- [ ] Revizyon nedeni ve mesajı gösteriliyor

### Aksiyon Butonları
- [ ] `submitted` durumunda "İptal Et" butonu görünüyor
- [ ] `toBeRevised` durumunda "İptal Et", "Düzenle" ve "Tekrar Gönder" butonları görünüyor
- [ ] `rejected` durumunda "Yeni Talep Oluştur" butonu görünüyor
- [ ] `canceled` ve `approved` durumundaki talepler **görüntülenemez** (listeye yönlendir)

### Düzenleme ve Tekrar Gönderme
- [ ] `toBeRevised` durumunda ürün bilgileri düzenlenebiliyor
- [ ] Düzenlenen bilgiler "Tekrar Gönder" ile kaydediliyor
- [ ] Tekrar gönderme sonrası talep `submitted` durumuna geçiyor

### İptal Modalı
- [ ] İptal onay modalı doğru çalışıyor
- [ ] Onay sonrası talep listeden kaldırılıyor

### Erişim Kuralları
- [ ] `canceled` durumundaki talep sayfasına erişildiğinde listeye yönlendiriliyor
- [ ] `approved` durumundaki talep sayfasına erişildiğinde listeye yönlendiriliyor
- [ ] Tedarikçi sadece kendi taleplerini görebiliyor

### Erişilebilirlik
- [ ] Tüm butonlar uygun `aria-label` etiketlerine sahip
- [ ] Klavye navigasyonu çalışıyor
- [ ] Modal'da focus trap aktif
- [ ] Renk kontrastı WCAG AA uyumlu

---

## Ek Notlar

**Talep Yönetimi Kuralları (Ürün Oluşturma - Supplier):**

| Statü | Supplier Aksiyonları |
|-------|---------------------|
| Submitted | cancel |
| Revize Bekliyor | cancel, düzenleyebilir, tekrar gönderebilir |
| Rejected | Sadece görüntüleme, yeni talep oluşturabilir |
| Canceled | Görüntüleme yok, işlem yok |
| Approved | Görüntüleme yok, işlem yok |

**İlgili Bileşenler:**
- Talep Listesi Sayfası (`#products/urun-olusturma`)
- İptal Onay Modalı
- Ürün Düzenleme Formu

**Bağımlılıklar:**
- Tailwind CSS
- Font Awesome ikonları
- Routing sistemi (`navigateTo`)
- Modal sistemi (`showModal`)
- Mock veri: `mockData.requests`, `mockData.products`
- Kullanıcı kimlik doğrulama (`window.currentUser`)
