# Front-End Görevi: Ürün Güncelleme Talebi Detay Sayfası (Admin Görünümü)

## Hazır Olma Tanımı:

**API Endpoint hazır:** ✅ Evet - `GET /api/requests/{id}`, `PUT /api/requests/{id}/approve`, `PUT /api/requests/{id}/reject`

**Tasarımlar hazır:** ✅ Evet - Mevcut admin talep detay sayfası desenlerine dayalı

---

## 1. Genel Bakış ve Bağlam

**Kullanıcı Hikayesi:** Bir **admin** olarak, **bir ürün güncelleme talebinin detaylarını görüntülemek, mevcut ürün bilgileriyle karşılaştırmak ve talebi kabul etmek veya gerekçeli şekilde reddetmek** istiyorum, böylece **ürün güncelleme sürecini kontrollü bir şekilde yönetebilirim**.

**Özellik/Epik:** Ürün Talep Yönetim Sistemi / Admin Paneli

**Öncelik:** Yüksek

> **Önemli:** Ürün güncelleme taleplerinde **revizyon akışı yoktur**. Talepler yalnızca **Kabul Edilir** veya **Reddedilir**.

---

## 2. Tasarım ve Görseller

**Figma/Tasarım Linki:** Yok - Mevcut admin talep detay sayfası desenlerini takip edin

**Varlıklar:**
- Durum rozetleri: Sarı "Onay Bekliyor" (submitted), Kırmızı "Reddedildi" (rejected), Gri "İptal Edildi" (canceled), Yeşil "Kabul Edildi" (approved)
- Red gerekçesi bölümü: Kırmızı temalı, sol kenarlıklı bildirim kutusu

**Mobil vs. Masaüstü:**
- **Masaüstü:** Tam genişlik düzen, karşılaştırma görünümü yan yana
- **Mobil/Tablet:** Karşılaştırma görünümü alt alta, görseller tek sütun

**Tasarım Özellikleri:**
- Sayfa arka planı: Gri-yeşil palet
- Header kartı: `bg-white rounded-lg shadow-sm border border-gray-200`
- Durum rozeti renkleri:
  - Onay Bekliyor: `bg-yellow-100 text-yellow-800`
  - Reddedildi: `bg-red-100 text-red-800`
  - İptal Edildi: `bg-gray-100 text-gray-800`
  - Kabul Edildi: `bg-green-100 text-green-800`
- Red gerekçesi kutusu: `bg-red-50 border-l-4 border-red-500`
- Kabul Et butonu: `bg-green-600 text-white hover:bg-green-700`
- Reddet butonu: `bg-red-600 text-white hover:bg-red-700`

---

## 3. Fonksiyonel Gereksinimler

### 3.1 Sayfa Yapısı

| Gereksinim | Açıklama |
|------------|----------|
| **Geri Butonu** | Sayfanın üstünde, `#products/urun-guncelleme` adresine geri yönlendirir |
| **Başlık** | "Ürün Güncelleme Talebi" ve altında "Talep ID: #{id}" |
| **Header Grid** | 3 sütunlu grid: Sol → Başlık + ID / Orta → Tarih bilgileri + Tedarikçi / Sağ → Durum badge'i |
| **Oluşturma Tarihi** | Talebin gönderildiği tarih (`submittedAt`) — takvim ikonu ile |
| **Güncelleme Tarihi** | Sadece `updatedAt` veya `revisedAt` varsa gösterilir — düzenleme ikonu ile |
| **Tedarikçi Bilgisi** | Talebi gönderen tedarikçinin adı — kullanıcı ikonu ile |
| **Durum Badge'i** | Dinamik olarak duruma göre değişir (aşağıdaki tablo) |

**Durum Badge Durumları:**

| Talep Durumu | Badge Metni | Badge Stili | İkon |
|-------------|-------------|-------------|------|
| `submitted` | Onay Bekliyor | `bg-yellow-100 text-yellow-800` | `fa-clock` |
| `rejected` | Reddedildi | `bg-red-100 text-red-800` | `fa-times-circle` |
| `canceled` | İptal Edildi | `bg-gray-100 text-gray-800` | `fa-ban` |
| `approved` | Kabul Edildi | `bg-green-100 text-green-800` | `fa-check-circle` |

> **Not:** `canceled` ve `approved` durumundaki talepler admin ve tedarikçi tarafından **görüntülenemez**. Bu statülere sahip talep detay sayfasına erişilmeye çalışıldığında listeye yönlendirilir.

### 3.2 Red Gerekçesi Bölümü

Sadece `status === 'rejected'` durumunda gösterilir. Header ile içerik arasına yerleştirilir.

| Gereksinim | Açıklama |
|------------|----------|
| **Kutu Stili** | `bg-red-50 border-l-4 border-red-500 rounded-md p-4` |
| **İkon** | `fa-times-circle` kırmızı ikon |
| **Başlık** | "Red Gerekçesi" — `text-sm font-semibold text-red-900` |
| **Tarih ve Admin** | Sağ üstte red tarihi ve reddeden admin adı — `text-xs text-red-600` |
| **Nedenler** | Her neden ayrı bir etiket olarak gösterilir — `bg-red-100 text-red-800 rounded text-xs` |
| **Yorum** | Varsa, alt çizgi ile ayrılmış alanda gösterilir — `text-xs text-gray-700` |

### 3.3 Karşılaştırma Görünümü

| Gereksinim | Açıklama |
|------------|----------|
| **Ürün Bilgileri** | Mevcut ürün değerleri ile talep edilen yeni değerlerin karşılaştırmalı gösterimi |
| **Gösterilecek Alanlar** | Ad, SKU, kategori, marka, açıklama, özellikler (attributes) |
| **Stok ve Fiyat** | Bu talep türünde **gösterilmez** |
| **Görsel Karşılaştırma** | İki ayrı bölümde: "Mevcut Görseller" ve "Yeni Görseller" |
| **Görsel Düzeni** | Kare görseller, 2 sütunlu grid, numara badge'i yok |

### 3.4 Aksiyon Butonları

Sadece `status === 'submitted'` durumunda gösterilir. Sayfanın alt kısmında, sağa hizalı.

| Buton | Stil | Davranış |
|-------|------|----------|
| **Reddet** | `bg-red-600 text-white` + `fa-times` ikonu | Reddetme modalını açar |
| **Kabul Et** | `bg-green-600 text-white` + `fa-check` ikonu | Talebi kabul eder, listeye döner |

> **Revize İste butonu bu sayfada yoktur.**

### 3.5 Reddetme Modalı

| Gereksinim | Açıklama |
|------------|----------|
| **Modal Başlığı** | "Talebi Reddet" |
| **Red Sebepleri** | Checkbox listesi — birden fazla seçilebilir, en az bir seçim zorunlu |
| **Yorum Alanı** | Textarea — isteğe bağlı ek açıklama, placeholder: "Ek açıklama yazın (isteğe bağlı)..." |
| **Onay Butonu** | Footer'da tek bir kırmızı "Reddet" butonu |
| **Validasyon** | Sebep seçilmemişse alert göster, modal kapanmasını engelle |

**Red Sebepleri:**
1. Ürün bilgileri eksik
2. Görsel kalitesi düşük
3. Kategori uyumsuzluğu
4. Açıklama yetersiz
5. Mağaza politikalarına uygun değil
6. Mükerrer ürün
7. Yanlış ürün bilgisi
8. Yasaklı ürün
9. Kalite standartlarını karşılamıyor
10. Uygunsuz içerik

### Etkileşimler

**Tıklama:**
- **Geri Butonu:** `#products/urun-guncelleme` adresine döner
- **Kabul Et:** Talebi `approved` yapar → toast gösterir → listeye döner
- **Reddet:** Reddetme modalını açar
- **Modal Reddet:** Sebepleri kaydeder → talebi `rejected` yapar → toast gösterir → listeye döner

**Hover:**
- Butonlar: Arka plan rengi koyulaşır (`hover:bg-green-700`, `hover:bg-red-700`)
- Geri butonu: Metin rengi koyulaşır

### Durum Yönetimi

```
submitted ──► approved    (Kabul Et)
submitted ──► rejected    (Reddet → modal → sebep seç → onayla)
```

> **Not:** Ürün güncelleme taleplerinde **revizyon akışı yoktur** (`toBeRevised` statüsü kapalıdır).

**Sayfa UI Durumları:**

| Talep Durumu | Aksiyon Butonları | Red Gerekçesi | Karşılaştırma | Görüntüleme |
|-------------|-------------------|---------------|---------------|-------------|
| `submitted` | Reddet + Kabul Et | Gizli | Gösterilir | ✅ Var |
| `rejected` | Gizli (sadece görüntüleme) | Gösterilir | Gösterilir | ✅ Var |
| `canceled` | — | — | — | ❌ Yok (erişim engelli) |
| `approved` | — | — | — | ❌ Yok (erişim engelli) |

### Animasyonlar

- **Modal Açılma/Kapanma:** Fade in/out
- **Toast Bildirimi:** Kabul/red sonrası bilgi mesajı

### Navigasyon

| Aksiyon | Hedef |
|---------|-------|
| Geri butonu | `#products/urun-guncelleme` |
| Kabul Et sonrası | `#products/urun-guncelleme` |
| Reddet sonrası | `#products/urun-guncelleme` |
| `canceled`/`approved` talep erişimi | `#products/urun-guncelleme` (yönlendir) |

---

## 4. Teknik Özellikler ve Veri

### API/Veri Kaynağı

**Talep Detay:** `GET /api/requests/{id}`

**Kabul:** `PUT /api/requests/{id}/approve`

**Red:** `PUT /api/requests/{id}/reject`

```javascript
{
  "rejectionReasons": ["Ürün bilgileri eksik", "Görsel kalitesi düşük"],
  "rejectionComment": "Ek açıklama metni"  // opsiyonel
}
```

### Veri Alanları

**Talep Objesi:**
- `id` (number) — Talep ID'si
- `type` (string) — `"product_update"`
- `status` (string) — `"submitted"` | `"rejected"` | `"canceled"` | `"approved"`
- `productId` (number) — Güncellenen ürünün ID'si
- `supplierId` (number) — Talebi gönderen tedarikçi
- `submittedAt` (ISO string) — Gönderim tarihi
- `updatedAt` (ISO string, opsiyonel) — Güncelleme tarihi
- `data` (object) — Talep edilen değişiklikler
  - `name` (object) — `{ tr: string, en: string }`
  - `sku` (string)
  - `categoryId` (number)
  - `brandId` (number)
  - `description` (string)
  - `attributes` (object)
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
| Ürün bulunamadı | Toast hata mesajı göster, listeye yönlendir |
| Red modalında sebep seçilmemiş | Alert göster, modal kapanmasını engelle |
| `pageContent` elementi yüklenmemiş | 200ms sonra tekrar dene |
| Talep `canceled` durumunda | Sayfa görüntülenemez, listeye yönlendir |
| Talep `approved` durumunda | Sayfa görüntülenemez, listeye yönlendir |

**Tarih Formatı:** DD.MM.YYYY HH:mm (Türkçe yerel ayar)

---

## 5. Erişilebilirlik (A11y) ve SEO

### A11y

- Reddet Butonu: `aria-label="Talebi reddet"`
- Kabul Et Butonu: `aria-label="Talebi kabul et"`
- Geri Butonu: `aria-label="Talep listesine dön"`
- Durum Badge: `aria-label="Durum: {status}"`
- Modal açıkken odak modal içine kilitlenir (focus trap)
- Modal'da Escape ile kapatma
- Tüm butonlarda görünür odak çerçevesi (`ring-2 ring-blue-500`)

### SEO

- Sayfa başlığı: "Ürün Güncelleme Talebi #{id} - Admin Paneli"
- Robots: `noindex, nofollow`
- H1: "Ürün Güncelleme Talebi"

---

## 6. Kabul Kriterleri ("Tamamlanma Tanımı")

### Sayfa Yapısı ve Görsel
- [ ] Sayfa başlığı "Ürün Güncelleme Talebi" ve Talep ID gösteriliyor
- [ ] Header 3 sütunlu grid: başlık / tarih+tedarikçi / durum badge
- [ ] Oluşturma tarihi her zaman gösteriliyor
- [ ] Güncelleme tarihi sadece varsa gösteriliyor
- [ ] Tedarikçi adı gösteriliyor
- [ ] Geri butonu çalışıyor ve listeye yönlendiriyor

### Durum Badge
- [ ] `submitted` → Sarı "Onay Bekliyor" + `fa-clock`
- [ ] `rejected` → Kırmızı "Reddedildi" + `fa-times-circle`
- [ ] `canceled` → Gri "İptal Edildi" + `fa-ban`
- [ ] `approved` → Yeşil "Kabul Edildi" + `fa-check-circle`

### Red Gerekçesi Bölümü
- [ ] Sadece `rejected` durumunda gösteriliyor
- [ ] Kırmızı temalı bildirim kutusu (`bg-red-50 border-l-4 border-red-500`)
- [ ] Red nedenleri ayrı etiketler olarak listeleniyor
- [ ] Admin yorumu varsa gösteriliyor
- [ ] Red tarihi ve admin adı sağ üstte gösteriliyor

### Karşılaştırma Görünümü
- [ ] Mevcut ürün değerleri ile talep edilen değerler karşılaştırmalı gösteriliyor
- [ ] Mevcut görseller ve yeni görseller ayrı bölümlerde
- [ ] Stok ve fiyat bilgisi **gösterilmiyor**

### Aksiyon Butonları
- [ ] `submitted` durumunda "Reddet" ve "Kabul Et" butonları görünüyor
- [ ] `rejected` durumunda butonlar **gizli** (sadece görüntüleme)
- [ ] `canceled` ve `approved` durumundaki talepler **görüntülenemez** (listeye yönlendir)
- [ ] **Revize İste butonu hiçbir durumda gösterilmiyor**
- [ ] Kabul Et → talebi `approved` yapar, toast gösterir, listeye döner
- [ ] Reddet → reddetme modalını açar

### Reddetme Modalı
- [ ] Modal başlığı "Talebi Reddet"
- [ ] 10 adet red sebebi checkbox olarak listeleniyor
- [ ] Birden fazla sebep seçilebiliyor
- [ ] Yorum alanı isteğe bağlı
- [ ] Modal'da **tek bir** "Reddet" butonu var (footer)
- [ ] Sebep seçilmeden onay engellenip uyarı gösteriliyor
- [ ] Onay sonrası: talep `rejected` olur, red bilgileri kaydedilir, toast gösterilir, listeye dönülür

### Erişim Kuralları
- [ ] `canceled` durumundaki talep detay sayfasına erişildiğinde listeye yönlendiriliyor
- [ ] `approved` durumundaki talep detay sayfasına erişildiğinde listeye yönlendiriliyor
- [ ] `rejected` durumunda sadece görüntüleme yapılabiliyor, aksiyon butonları gizli

### Erişilebilirlik
- [ ] Tüm butonlar uygun `aria-label` etiketlerine sahip
- [ ] Klavye navigasyonu çalışıyor
- [ ] Modal'da focus trap aktif
- [ ] Renk kontrastı WCAG AA uyumlu

---

## Ek Notlar

**Talep Yönetimi Kuralları (Ürün Güncelleme - Admin):**

| Statü | Admin Aksiyonları |
|-------|-------------------|
| Submitted | reject, approve |
| Revize Bekliyor | KAPALI — Ürün güncelleme taleplerinde revizyon yoktur |
| Rejected | Sadece görüntüleme |
| Canceled | Görüntüleme yok, işlem yok |
| Approved | Görüntüleme yok, işlem yok |

**İlgili Bileşenler:**
- Talep Listesi Sayfası (`#products/urun-guncelleme`)
- Reddetme Modalı (`showRejectionReasonModal`)
- Karşılaştırma Görünümü (`renderComparisonTab`)

**Bağımlılıklar:**
- Tailwind CSS
- Font Awesome ikonları
- Routing sistemi (`navigateTo`)
- Modal sistemi (`showModal`)
- Mock veri: `mockData.requests`, `mockData.products`, `mockData.suppliers`
