# Front-End Görevi: Ürün Listeleri — Sağdan Açılan Filtre Drawer’ı (Ürünler)

## Hazır Olma Tanımı

**API endpoint hazır:** [ ] Evet / [ ] Kısmen / [ ] Hayır — Ürün listesi ve filtre query parametreleri netleştirilmeli.

**Tasarımlar hazır:** [ ] Figma / [ ] Mevcut panel desenine uyum (`filterPanel`, sağdan drawer)

---

## 1. Genel Bakış ve Bağlam

**Kullanıcı hikayesi:** **Admin** ve **tedarikçi** olarak, **ürün listesi sayfalarında** sağdan açılan filtre paneli ile listeyi daraltmak istiyorum.

Bu görev **yalnızca ürün listelerini** kapsar. Talep listeleri için ayrı dosya: `FRONTEND_TASK_PRODUCT_LIST_DRAWER_REQUESTS.md`.

**Öncelik:** [Belirtin]

---

## 2. Admin ve Tedarikçi — Liste Kapsamı (Ürünler)

Aynı drawer bileşeni iki rol için kullanılır; **hangi kayıtların listede göründüğü** role göre farklıdır.

### 2.1 Admin

| Liste | İçerik |
|--------|--------|
| **Aktif ürünler** (tek ürün listesi görünümü) | Onaylanmış **tüm** ürünler. **Arşivlenmiş** ve **stoğu 0 olan** ürünler bu listede **dahildir** (ayrı bir “pasif” ürün listesi yoktur). |

Drawer, bu tek liste bağlamında açılır. Filtreler tüm onaylı ürün evrenine uygulanır; kullanıcı örneğin arşiv durumu veya stok durumuna göre daraltabilir.

### 2.2 Tedarikçi

| Grup | Liste | İçerik |
|------|--------|--------|
| **Aktif ürünler** | Ana “aktif” ürün listesi | Onaylanmış ürünlerden yalnızca **arşivlenmemiş** ve **stoğu bitmemiş** (stoğu 0 olmayan) olanlar. |
| **Pasif** | Arşivlenenler | Arşivlenmiş onaylı ürünler (rota/sekme projeye göre). |
| **Pasif** | Stoğu bitenler | Stoğu 0 olan onaylı ürünler (arşiv politikası iş kuralına göre bu listede veya hariç — backend ile hizalanır). |

Drawer, **hangi sekmede / alt sekmede** olunduğuna göre hem filtre alanlarını hem de API bağlamını doğru seçmelidir (ör. pasif listelerde “sadece arşiv” anlamsız olabilir).

**Ortak fark:** Tedarikçi verisi her zaman oturumdaki tedarikçi ile sınırlıdır. Admin tüm tedarikçilerin ürünlerini görebilir.

---

## 3. Tasarım ve Görseller

- Sağdan kayan drawer, overlay, başlık “Filtreler”, kapat (X).
- Alt aksiyonlar: “Temizle”; isteğe bağlı “Uygula” veya debounce’lu anlık uygulama.
- Mobil: kaydırılabilir içerik; masaüstü: sabit genişlik (örn. `max-w-md`).
- Animasyon: 200–300ms; `prefers-reduced-motion` desteği.

---

## 4. Fonksiyonel Gereksinimler

### 4.1 Ortak

| Gereksinim | Açıklama |
|------------|----------|
| Tetikleyici | Araç çubuğunda “Filtreler” → drawer açılır. |
| Bağlam | Aktif sekme / rota ile filtre şablonu eşleşir (admin tek ürün listesi; tedarikçi aktif vs pasif alt listeleri). |
| Temizle | Tüm kontroller sıfırlanır; liste varsayılan veri setine döner. |
| Boş sonuç | Bilgilendirme + “Filtreleri temizle” CTA. |

### 4.2 Admin — önerilen filtre alanları (onaylı tüm ürünler)

| Alan | Not |
|------|-----|
| Metin arama | SKU, ad, barkod (API yeteneğine göre) |
| Kategori | Çoklu / ağaç |
| Marka | Çoklu |
| **Tedarikçi** | Çoklu — **yalnız admin** |
| Arşiv durumu | Evet / hayır / tümü — listede arşivliler de olduğu için anlamlı |
| Stok durumu | Örn. stok aralığı, “stokta yok” dahil — listede stok 0 olanlar da var |
| Fiyat aralığı | |
| Ürün / yayın durumu | İş kurallarına göre (ör. sadece onaylı gösteriliyorsa daraltılmış seçenekler) |
| Özellikler (attributes) | Kategoriye bağlı dinamik filtreler |

### 4.3 Tedarikçi — Aktif ürün listesi

| Alan | Not |
|------|-----|
| Metin arama | SKU, ad |
| Kategori, marka | |
| Stok / fiyat aralığı | Liste zaten “stoğu biten” hariç; stok filtresi yine kullanılabilir |
| Özellikler | Dinamik |
| **Tedarikçi seçimi yok** | |

### 4.4 Tedarikçi — Pasif: Arşivlenenler

| Alan | Not |
|------|-----|
| Metin arama | SKU, ad |
| Kategori, marka | |
| Arşiv tarihi aralığı | Varsa |

### 4.5 Tedarikçi — Pasif: Stoğu bitenler

| Alan | Not |
|------|-----|
| Metin arama | SKU, ad |
| Kategori, marka | |
| Stok | Genelde 0 sabit; ek iş kuralları (kritik eşik) varsa dokümante edilir |

---

## 5. Teknik Özellikler ve Veri

- **Admin:** `GET /api/products` (veya eşdeğer) — `supplierId`, `isArchived`, `stockMin`/`stockMax`, kategori, arama vb.
- **Tedarikçi:** Aynı uçlar tedarikçi bağlamında; `supplierId` istemciden gönderilmez (token/session).
- Liste tanımı backend ile uyumlu olmalı: admin’de “aktif” = onaylı tümü; tedarikçide aktif = onaylı ∧ ¬arşiv ∧ stok > 0 (veya tanımlı eşdeğer).

---

## 6. Erişilebilirlik (A11y)

- `role="dialog"` / `aria-modal`, başlık ilişkisi, Escape ile kapanma, odak tuzağı, tam klavye erişimi.

---

## 7. Kabul Kriterleri

- [ ] Admin ürün listesinde drawer; filtreler **onaylı tüm ürünleri** (arşiv + stok 0 dahil) kapsayacak şekilde çalışır; **tedarikçi filtresi** adminde vardır.
- [ ] Tedarikçi **aktif** ürün listesinde drawer; veri kuralı **arşivlenmemiş ve stoğu bitmemiş** onaylı ürünlerle uyumludur.
- [ ] Tedarikçi **pasif** alt listelerinde (arşiv, stoğu biten) drawer ilgili bağlamda doğru filtre setini gösterir.
- [ ] Tedarikçide tedarikçi seçimi yok; veri yalnız oturum tedarikçisine aittir.
- [ ] Temizle, overlay, mobil kullanım ve A11y gereksinimleri sağlanır.

---

## 8. İlgili Dokümanlar

- Talep listeleri drawer görevi: `FRONTEND_TASK_PRODUCT_LIST_DRAWER_REQUESTS.md`
- Önceki ayrı admin/supplier filtre görev dosyalarına bu görev **alternatif** kapsam sunar; o dosyalar ayrı tutulmuştur.
