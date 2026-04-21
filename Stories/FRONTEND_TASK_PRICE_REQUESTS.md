# Front-End Görevi: Fiyat Talebi Detay Sayfası (Admin Görünümü)

## Hazır Olma Tanımı:

**API Endpoint hazır:** ✅ Evet - `GET /api/requests/{id}`, `PUT /api/requests/{id}/approve`, `PUT /api/requests/{id}/reject`, `PUT /api/requests/{id}/toBeRevised`

**Tasarımlar hazır:** ✅ Evet - Mevcut admin talep detay sayfası desenlerine dayalı

---

## 1. Genel Bakış ve Bağlam

**Kullanıcı Hikayesi:** Bir **admin** olarak, **bir fiyat talebinin detaylarını görüntülemek, mevcut fiyatla karşılaştırmak ve talebi kabul etmek, gerekçeli şekilde reddetmek veya revizyon istemek** istiyorum, böylece **fiyat değişiklik sürecini kontrollü bir şekilde yönetebilirim**.

**Özellik/Epik:** Ürün Talep Yönetim Sistemi / Admin Paneli

**Öncelik:** Yüksek

---

## 2. Tasarım ve Görseller

**Figma/Tasarım Linki:** Yok - Mevcut admin talep detay sayfası desenlerini takip edin

**Varlıklar:**
- Durum rozetleri: Sarı "Onay Bekliyor" (submitted), Turuncu "Revize Edilecek" (toBeRevised), Kırmızı "Reddedildi" (rejected), Gri "İptal Edildi" (canceled), Yeşil "Kabul Edildi" (approved)
- Red gerekçesi bölümü: Kırmızı temalı, sol kenarlıklı bildirim kutusu
- Revizyon gerekçesi bölümü: Turuncu temalı, sol kenarlıklı bildirim kutusu

**Mobil vs. Masaüstü:**
- **Masaüstü:** Tam genişlik düzen, fiyat karşılaştırması yan yana
- **Mobil/Tablet:** Fiyat karşılaştırması alt alta

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
- Kabul Et butonu: `bg-green-600 text-white hover:bg-green-700`
- Reddet butonu: `bg-red-600 text-white hover:bg-red-700`
- Revize İste butonu: `bg-orange-600 text-white hover:bg-orange-700`

---

## 3. Fonksiyonel Gereksinimler

### 3.1 Sayfa Yapısı

| Gereksinim | Açıklama |
|------------|----------|
| **Geri Butonu** | Sayfanın üstünde, `#products/fiyat-talepleri` adresine geri yönlendirir |
| **Başlık** | "Fiyat Talebi" ve altında "Talep ID: #{id}" |
| **Header Grid** | 3 sütunlu grid: Sol → Başlık + ID / Orta → Tarih bilgileri + Tedarikçi / Sağ → Durum badge'i |
| **Oluşturma Tarihi** | Talebin gönderildiği tarih (`submittedAt`) — takvim ikonu ile |
| **Güncelleme Tarihi** | Sadece `updatedAt` veya `revisedAt` varsa gösterilir — düzenleme ikonu ile |
| **Tedarikçi Bilgisi** | Talebi gönderen tedarikçinin adı — kullanıcı ikonu ile |
| **Durum Badge'i** | Dinamik olarak duruma göre değişir |

**Durum Badge Durumları:**

| Talep Durumu | Badge Metni | Badge Stili | İkon |
|-------------|-------------|-------------|------|
| `submitted` | Onay Bekliyor | `bg-yellow-100 text-yellow-800` | `fa-clock` |
| `toBeRevised` | Revize Edilecek | `bg-orange-100 text-orange-800` | `fa-exclamation-circle` |
| `rejected` | Reddedildi | `bg-red-100 text-red-800` | `fa-times-circle` |
| `canceled` | İptal Edildi | `bg-gray-100 text-gray-800` | `fa-ban` |
| `approved` | Kabul Edildi | `bg-green-100 text-green-800` | `fa-check-circle` |

> **Not:** `canceled` ve `approved` durumundaki talepler admin tarafından **görüntülenemez**. Bu statülere sahip talep detay sayfasına erişilmeye çalışıldığında listeye yönlendirilir.

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

### 3.3 Revizyon Gerekçesi Bölümü

Sadece `status === 'toBeRevised'` durumunda gösterilir. Header ile içerik arasına yerleştirilir.

| Gereksinim | Açıklama |
|------------|----------|
| **Kutu Stili** | `bg-orange-50 border-l-4 border-orange-500 rounded-md p-4` |
| **İkon** | `fa-exclamation-circle` turuncu ikon |
| **Başlık** | "Revizyon Gerekçesi" — `text-sm font-semibold text-orange-900` |
| **Tarih ve Admin** | Sağ üstte revizyon tarihi ve admin adı — `text-xs text-orange-600` |
| **Neden** | Revizyon nedeni metin olarak gösterilir — `text-sm text-gray-700` |
| **Mesaj** | Varsa, detaylı revizyon mesajı gösterilir — `text-xs text-gray-700` |

### 3.4 Fiyat Karşılaştırma Görünümü

| Gereksinim | Açıklama |
|------------|----------|
| **Ürün Bilgisi** | Ürün görseli, adı ve SKU'su üst bölümde gösterilir |
| **Mevcut Fiyat** | Ürünün mevcut fiyatı — büyük font, sol taraf |
| **Talep Edilen Fiyat** | Talep edilen yeni fiyat — büyük font, sağ taraf |
| **Fark Göstergesi** | Yüzde ve tutar olarak fark gösterilir (artış: kırmızı, azalış: yeşil) |
| **Fiyat Değişiklik Gerekçesi** | Tedarikçinin yazdığı gerekçe (varsa) |
| **Para Birimi** | Fiyatlar para birimi ile gösterilir (ör. ₺) |

### 3.5 Aksiyon Butonları

Sayfanın alt kısmında, sağa hizalı. Duruma göre farklı butonlar gösterilir.

**`submitted` durumunda:**

| Buton | Stil | Davranış |
|-------|------|----------|
| **Reddet** | `bg-red-600 text-white` + `fa-times` ikonu | Reddetme modalını açar |
| **Revize İste** | `bg-orange-600 text-white` + `fa-edit` ikonu | Revizyon modalını açar |
| **Kabul Et** | `bg-green-600 text-white` + `fa-check` ikonu | Talebi kabul eder, listeye döner |

**`toBeRevised` durumunda:**

| Buton | Stil | Davranış |
|-------|------|----------|
| **Reddet** | `bg-red-600 text-white` + `fa-times` ikonu | Reddetme modalını açar |
| **Kabul Et** | `bg-green-600 text-white` + `fa-check` ikonu | Talebi kabul eder, listeye döner |

> **Not:** `toBeRevised` durumunda **Revize İste butonu gösterilmez** (zaten revizyon bekliyor).

### 3.6 Reddetme Modalı

| Gereksinim | Açıklama |
|------------|----------|
| **Modal Başlığı** | "Talebi Reddet" |
| **Red Sebepleri** | Checkbox listesi — birden fazla seçilebilir, en az bir seçim zorunlu |
| **Yorum Alanı** | Textarea — isteğe bağlı ek açıklama |
| **Onay Butonu** | Footer'da tek bir kırmızı "Reddet" butonu |
| **Validasyon** | Sebep seçilmemişse alert göster, modal kapanmasını engelle |

**Red Sebepleri:**
1. Fiyat piyasa değerinin üstünde
2. Yeterli gerekçe yok
3. Fiyat artışı kabul edilemez
4. Rekabetçi fiyat değil
5. Sözleşme koşullarına uygun değil
6. Maliyet analizi yetersiz

### 3.7 Revizyon Modalı

| Gereksinim | Açıklama |
|------------|----------|
| **Modal Başlığı** | "Revizyon İste" |
| **Revizyon Nedeni** | Textarea — zorunlu, placeholder: "Revizyon nedenini yazın..." |
| **Detaylı Mesaj** | Textarea — isteğe bağlı, placeholder: "Tedarikçiye detaylı mesaj yazın (isteğe bağlı)..." |
| **Onay Butonu** | Footer'da turuncu "Revizyon İste" butonu |
| **Validasyon** | Neden boşsa alert göster, modal kapanmasını engelle |

### Etkileşimler

**Tıklama:**
- **Geri Butonu:** `#products/fiyat-talepleri` adresine döner
- **Kabul Et:** Talebi `approved` yapar → toast gösterir → listeye döner
- **Reddet:** Reddetme modalını açar
- **Modal Reddet:** Sebepleri kaydeder → talebi `rejected` yapar → toast gösterir → listeye döner
- **Revize İste:** Revizyon modalını açar
- **Modal Revize İste:** Nedeni kaydeder → talebi `toBeRevised` yapar → toast gösterir → listeye döner

**Hover:**
- Butonlar: Arka plan rengi koyulaşır
- Geri butonu: Metin rengi koyulaşır

### Durum Yönetimi

```
submitted   ──► approved      (Kabul Et)
submitted   ──► rejected      (Reddet → modal → sebep seç → onayla)
submitted   ──► toBeRevised   (Revize İste → modal → neden yaz → onayla)
toBeRevised ──► approved      (Kabul Et)
toBeRevised ──► rejected      (Reddet → modal → sebep seç → onayla)
```

**Sayfa UI Durumları:**

| Talep Durumu | Aksiyon Butonları | Red Gerekçesi | Revizyon Gerekçesi | Fiyat Karşılaştırma | Görüntüleme |
|-------------|-------------------|---------------|-------------------|---------------------|-------------|
| `submitted` | Reddet + Revize İste + Kabul Et | Gizli | Gizli | Gösterilir | ✅ Var |
| `toBeRevised` | Reddet + Kabul Et | Gizli | Gösterilir | Gösterilir | ✅ Var |
| `rejected` | Gizli (sadece görüntüleme) | Gösterilir | Gizli | Gösterilir | ✅ Var |
| `canceled` | — | — | — | — | ❌ Yok (erişim engelli) |
| `approved` | — | — | — | — | ❌ Yok (erişim engelli) |

### Animasyonlar

- **Modal Açılma/Kapanma:** Fade in/out
- **Toast Bildirimi:** Kabul/red/revizyon sonrası bilgi mesajı

### Navigasyon

| Aksiyon | Hedef |
|---------|-------|
| Geri butonu | `#products/fiyat-talepleri` |
| Kabul Et sonrası | `#products/fiyat-talepleri` |
| Reddet sonrası | `#products/fiyat-talepleri` |
| Revize İste sonrası | `#products/fiyat-talepleri` |
| `canceled`/`approved` talep erişimi | `#products/fiyat-talepleri` (yönlendir) |

---

## 4. Teknik Özellikler ve Veri

### API/Veri Kaynağı

**Talep Detay:** `GET /api/requests/{id}`

**Kabul:** `PUT /api/requests/{id}/approve`

**Red:** `PUT /api/requests/{id}/reject`
```javascript
{
  "rejectionReasons": ["Fiyat piyasa değerinin üstünde", "Yeterli gerekçe yok"],
  "rejectionComment": "Ek açıklama metni"  // opsiyonel
}
```

**Revize İste:** `PUT /api/requests/{id}/toBeRevised`
```javascript
{
  "revisionReason": "Revizyon nedeni",
  "revisionMessage": "Detaylı mesaj"  // opsiyonel
}
```

### Veri Alanları

**Talep Objesi:**
- `id` (number) — Talep ID'si
- `type` (string) — `"price"`
- `status` (string) — `"submitted"` | `"toBeRevised"` | `"rejected"` | `"canceled"` | `"approved"`
- `productId` (number) — İlişkili ürün ID'si
- `supplierId` (number) — Talebi gönderen tedarikçi
- `submittedAt` (ISO string) — Gönderim tarihi
- `updatedAt` (ISO string, opsiyonel) — Güncelleme tarihi
- `revisedAt` (ISO string, opsiyonel) — Revizyon tarihi
- `revisionReason` (string, opsiyonel) — Revizyon nedeni
- `revisionMessage` (string, opsiyonel) — Detaylı revizyon mesajı
- `data` (object) — Fiyat bilgileri
  - `currentPrice` (number) — Mevcut fiyat
  - `requestedPrice` (number) — Talep edilen yeni fiyat
  - `currency` (string) — Para birimi (ör. "TRY")
  - `reason` (string, opsiyonel) — Fiyat değişiklik gerekçesi

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
| Revizyon modalında neden boş | Alert göster, modal kapanmasını engelle |
| `pageContent` elementi yüklenmemiş | 200ms sonra tekrar dene |
| Talep `canceled` durumunda | Sayfa görüntülenemez, listeye yönlendir |
| Talep `approved` durumunda | Sayfa görüntülenemez, listeye yönlendir |

**Tarih Formatı:** DD.MM.YYYY HH:mm (Türkçe yerel ayar)

---

## 5. Erişilebilirlik (A11y) ve SEO

### A11y

- Reddet Butonu: `aria-label="Talebi reddet"`
- Revize İste Butonu: `aria-label="Revizyon iste"`
- Kabul Et Butonu: `aria-label="Talebi kabul et"`
- Geri Butonu: `aria-label="Talep listesine dön"`
- Durum Badge: `aria-label="Durum: {status}"`
- Modal açıkken odak modal içine kilitlenir (focus trap)
- Modal'da Escape ile kapatma
- Tüm butonlarda görünür odak çerçevesi (`ring-2 ring-blue-500`)

### SEO

- Sayfa başlığı: "Fiyat Talebi #{id} - Admin Paneli"
- Robots: `noindex, nofollow`
- H1: "Fiyat Talebi"

---

## 6. Kabul Kriterleri ("Tamamlanma Tanımı")

### Sayfa Yapısı ve Görsel
- [ ] Sayfa başlığı "Fiyat Talebi" ve Talep ID gösteriliyor
- [ ] Header 3 sütunlu grid: başlık / tarih+tedarikçi / durum badge
- [ ] Oluşturma tarihi her zaman gösteriliyor
- [ ] Güncelleme tarihi sadece varsa gösteriliyor
- [ ] Tedarikçi adı gösteriliyor
- [ ] Geri butonu çalışıyor ve listeye yönlendiriyor

### Fiyat Karşılaştırma
- [ ] Mevcut fiyat ve talep edilen fiyat karşılaştırmalı gösteriliyor
- [ ] Fark yüzde ve tutar olarak gösteriliyor
- [ ] Fiyat değişiklik gerekçesi gösteriliyor (varsa)

### Red Gerekçesi Bölümü
- [ ] Sadece `rejected` durumunda gösteriliyor
- [ ] Red nedenleri ayrı etiketler olarak listeleniyor

### Revizyon Gerekçesi Bölümü
- [ ] Sadece `toBeRevised` durumunda gösteriliyor
- [ ] Revizyon nedeni ve mesajı gösteriliyor

### Aksiyon Butonları
- [ ] `submitted` durumunda "Reddet", "Revize İste" ve "Kabul Et" butonları görünüyor
- [ ] `toBeRevised` durumunda "Reddet" ve "Kabul Et" butonları görünüyor (Revize İste yok)
- [ ] `rejected` durumunda butonlar **gizli** (sadece görüntüleme)
- [ ] `canceled` ve `approved` durumundaki talepler **görüntülenemez**

### Reddetme Modalı
- [ ] 6 adet red sebebi checkbox olarak listeleniyor
- [ ] Sebep seçilmeden onay engellenip uyarı gösteriliyor

### Revizyon Modalı
- [ ] Revizyon nedeni alanı zorunlu
- [ ] Neden boşsa onay engellenip uyarı gösteriliyor

### Erişim Kuralları
- [ ] `canceled` ve `approved` talep sayfasına erişildiğinde listeye yönlendiriliyor
- [ ] `rejected` durumunda sadece görüntüleme yapılabiliyor

### Erişilebilirlik
- [ ] Tüm butonlar uygun `aria-label` etiketlerine sahip
- [ ] Klavye navigasyonu çalışıyor
- [ ] Modal'da focus trap aktif
- [ ] Renk kontrastı WCAG AA uyumlu

---

## Ek Notlar

**Talep Yönetimi Kuralları (Fiyat - Admin):**

| Statü | Admin Aksiyonları |
|-------|-------------------|
| Submitted | reject, approve, toBeRevised |
| Revize Bekliyor | reject, approve |
| Rejected | Sadece görüntüleme |
| Canceled | Görüntüleme yok, işlem yok |
| Approved | Görüntüleme yok, işlem yok |

**İlgili Bileşenler:**
- Talep Listesi Sayfası (`#products/fiyat-talepleri`)
- Reddetme Modalı (`showRejectionReasonModal`)
- Revizyon Modalı (`showRevisionModal`)

**Bağımlılıklar:**
- Tailwind CSS
- Font Awesome ikonları
- Routing sistemi (`navigateTo`)
- Modal sistemi (`showModal`)
- Mock veri: `mockData.requests`, `mockData.products`, `mockData.suppliers`
