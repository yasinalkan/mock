# Front-End Görevi: Talep Listeleri — Drawer Filtre Paneli

## Hazır Olma Tanımı

**API endpoint hazır:** [ ] Evet / [ ] Kısmen / [ ] Hayır

**Tasarımlar hazır:** [ ] Figma linki eklendi / [ ] Ürün drawer'ıyla aynı görsel dil (`FRONTEND_TASK_DRAWER_URUNLER.md`)

---

## 1. Genel Bakış ve Bağlam

**Kullanıcı hikayesi:** Admin veya tedarikçi olarak, talep kuyruğu listelerinde sağdan açılan filtre drawer'ını kullanarak talepleri daraltmak, belirli bir talebi hızla bulmak istiyorum.

**Bu görev yalnızca talep listelerini kapsar.** Ürün listeleri için: `FRONTEND_TASK_DRAWER_URUNLER.md`

**Kapsanan talep listeleri — her iki rol için:**

| # | Liste | Talep Tipi |
|---|-------|-----------|
| 1 | Yeni ürün talepleri | `product_create` (veya proje adlandırması) |
| 2 | Ürün güncelleme talepleri | `product_update` |
| 3 | Fiyat & stok talepleri | `stock_price_update` (ayrı veya birleşik, backend ile hizalanacak) |

**Öncelik:** [ ] Yüksek / [ ] Orta / [ ] Düşük

---

## 2. Admin ve Tedarikçi Farkı

Aynı drawer bileşeni her iki rol tarafından kullanılır; farklar aşağıdadır.

| Konu | Admin | Tedarikçi |
|------|-------|-----------|
| **Görünen talepler** | Tüm tedarikçilerin talepleri (yetki kapsamında) | Yalnızca oturumdaki tedarikçinin talepleri |
| **Tedarikçi filtresi** | **Gösterilir** — talebi gönderen tedarikçiye göre süzme | **Gösterilmez** — kendi talepleri zaten otomatik |
| **Durum filtresi** | Var | Var |
| **Tarih aralığı** | Var | Var |
| **Ürün / SKU araması** | Var | Var |
| **Drawer iskeleti** | Aynı (sağdan açılan, overlay, Temizle / Uygula) | Aynı |

---

## 3. Tasarım ve Görseller

Ürün drawer görevi ile aynı çerçeve:

- Sağdan kayan drawer, overlay (tıklanabilir kapanma), başlık: **"Filtreler"**, kapat (✕).
- Alt aksiyonlar: **"Temizle"** (zorunlu); **"Uygula"** opsiyonel veya debounce'lu anlık uygulama.
- Mobil: kaydırılabilir içerik; masaüstü: sabit genişlik (`max-w-sm` / `max-w-md`).
- Animasyon: 200–300 ms; `prefers-reduced-motion` desteği.
- **Figma / Tasarım linki:** [Eklenecek]

---

## 4. Fonksiyonel Gereksinimler

### 4.1 Ortak Davranışlar (Her Üç Talep Listesi)

| Gereksinim | Açıklama |
|------------|----------|
| **Tetikleyici** | Liste araç çubuğundaki "Filtreler" butonu → drawer sağdan açılır |
| **Bağlam tespiti** | Aktif sekme veya URL'deki talep tipine göre filtre etiketleri ve varsayılanlar otomatik uyarlanır |
| **Durum filtresi** | Çoklu seçim — ör. `Beklemede`, `Revize Bekliyor`, `Reddedildi`, `Onaylandı` (gösterilen statülere göre güncellenir) |
| **Tarih aralığı** | Talep oluşturma / gönderme tarihi (`submittedAt` veya eşdeğer) |
| **Metin arama** | İlgili ürün adı, SKU veya talep referansı üzerinde |
| **Temizle** | Tüm kontroller sıfırlanır; liste yenilenir |
| **Boş sonuç** | "Sonuç bulunamadı" + "Filtreleri Temizle" CTA |
| **Aktif filtre rozeti** | "Filtreler" butonunda aktif filtre sayısı badge olarak gösterilebilir (opsiyonel) |

### 4.2 Yalnızca Admin — Ek Filtre Alanı

| Alan | Tip | Notlar |
|------|-----|--------|
| **Tedarikçi** | Çoklu seçim + arama | Talebi gönderen tedarikçiye göre süzme. Çok sayıda tedarikçi varsa arama + lazy-load uygulanmalı |

### 4.3 Yeni Ürün Talepleri — Ek Notlar

| Alan | Tip | Notlar |
|------|-----|--------|
| Kategori | Çoklu seçim | API destekliyorsa talepleri kategoriye göre süzme |
| Marka | Çoklu seçim | API destekliyorsa |
| Durum | Çoklu seçim | Reddedilmiş / iptal talepler gösterim politikasına göre daraltılabilir |

**Admin:** Tedarikçi + durum + tarih + arama (+ varsa kategori/marka).
**Tedarikçi:** Durum + tarih + arama (+ varsa kategori/marka). Tedarikçi filtresi yok.

### 4.4 Ürün Güncelleme Talepleri — Ek Notlar

| Alan | Tip | Notlar |
|------|-----|--------|
| Durum | Çoklu seçim | Güncellemedeki durum akışına göre seçenekler |
| Metin arama | Serbest metin | İlgili ürün SKU / adı |

**Admin:** Tedarikçi + durum + tarih + arama.
**Tedarikçi:** Durum + tarih + arama. Tedarikçi filtresi yok.

### 4.5 Fiyat & Stok Talepleri — Ek Notlar

| Alan | Tip | Notlar |
|------|-----|--------|
| Talep alt tipi | Çoklu seçim | Varsa: "Yalnızca Fiyat" / "Yalnızca Stok" / "Her İkisi" — backend alanı mevcutsa gösterilir |
| Durum | Çoklu seçim | |
| Tarih aralığı | Tarih seçici | |
| Metin arama | Serbest metin | SKU / ürün adı |

**Admin:** Tedarikçi + alt tip (varsa) + durum + tarih + arama.
**Tedarikçi:** Alt tip (varsa) + durum + tarih + arama. Tedarikçi filtresi yok.

---

## 5. Teknik Özellikler ve Veri

**Endpoint önerisi (backend ile netleştirilmeli):**

```
GET /api/requests
  ?type=product_create|product_update|stock_price_update
  &status=submitted|toBeRevised|rejected|approved   // çoklu
  &supplierId=...                                    // yalnız admin; tedarikçide gönderilmez
  &from=YYYY-MM-DD&to=YYYY-MM-DD                    // submittedAt aralığı
  &search=...                                        // SKU / ürün adı / referans
  &subType=price|stock|both                          // fiyat&stok talebi için; opsiyonel
  &page=...&limit=...
```

**Rol bazlı davranış:**

| Parametre | Admin | Tedarikçi |
|-----------|-------|-----------|
| `supplierId` | İsteğe bağlı, çoklu | **Gönderilmez** — sunucu oturumdan türetir |
| `type` | Aktif listeye göre otomatik | Aktif listeye göre otomatik |
| Diğerleri | Kullanıcı seçimine bağlı | Kullanıcı seçimine bağlı |

**Edge case'ler:**

- Çok sayıda tedarikçi: admin tedarikçi seçicisinde arama + sayfalama (infinite scroll veya "daha fazla yükle").
- Tarih aralığı: `from > to` validasyonu; geçersiz seçimde uyarı.
- Filtre değerleri URL'ye yansıtılırsa sayfa yenileme sonrası durum korunur.

---

## 6. UI Durumları

| Durum | Görünüm |
|-------|---------|
| **Yükleniyor** | Filtre alanları skeleton veya disabled; liste spinner/skeleton |
| **Hata** | Toast bildirimi; önceki sonuç korunabilir |
| **Boş sonuç** | "Bu kriterlere uygun talep bulunamadı" + "Filtreleri Temizle" butonu |
| **Sıfırlanmış** | Tüm alanlar default; liste tam setini gösterir |

---

## 7. Erişilebilirlik (A11y)

- Drawer: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` ile başlık ilişkisi.
- Açılışta odak ilk interaktif elemana geçer; kapanışta tetikleyiciye döner.
- **Escape** ile kapanma.
- Odak tuzağı: Tab sırası drawer dışına çıkmaz.
- Tüm filtre kontrolleri label ile ilişkilendirilmiş (`aria-label` veya `<label for>`).
- Klavye ile tam erişim (DatePicker, MultiSelect, Checkbox bileşenleri dahil).

---

## 8. Kabul Kriterleri

- [ ] **Yeni ürün talepleri listesinde** drawer açılır; admin'de tedarikçi filtresi vardır, tedarikçide yoktur.
- [ ] **Ürün güncelleme talepleri listesinde** drawer açılır; admin'de tedarikçi filtresi vardır, tedarikçide yoktur.
- [ ] **Fiyat & stok talepleri listesinde** drawer açılır; admin'de tedarikçi filtresi vardır, tedarikçide yoktur. Alt tip filtresi API destekliyorsa gösterilir.
- [ ] Durum, tarih ve metin arama filtreleri her iki rol için çalışır.
- [ ] Tedarikçi tarafında talepler yalnızca oturumdaki tedarikçiye aittir; `supplierId` gönderilmez.
- [ ] Temizle aksiyonu tüm kontrolleri sıfırlar, liste yenilenir.
- [ ] Boş sonuç durumunda bilgilendirme ve "Filtreleri Temizle" CTA gösterilir.
- [ ] Mobil ve masaüstü görünümleri tasarıma uygun.
- [ ] A11y kriterleri sağlanır (dialog rolü, odak yönetimi, Escape, klavye).

---

## 9. İlgili Dokümanlar

- Ürün listeleri drawer görevi: `FRONTEND_TASK_DRAWER_URUNLER.md`
- Önceki talep task dosyaları korunmuştur ve bu görev tarafından değiştirilmemiştir.
