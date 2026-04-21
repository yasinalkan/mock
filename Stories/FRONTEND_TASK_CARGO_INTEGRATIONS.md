# Front-End Görevi: Entegrasyonlar Menüsü — Kargo Entegrasyon Yönetimi

## Hazır Olma Tanımı

**API endpoint hazır:** [ ] Evet / [ ] Kısmen / [ ] Hayır — Kargo firması listeleme, bağlantı oluşturma, güncelleme, aktif/pasif ve test bağlantısı endpointleri netleştirilmeli.

**Tasarımlar hazır:** [ ] Figma / [ ] Wireframe / [ ] Yok — Tablo + form drawer/modali için alanlar netleştirilmeli.

---

## 1. Genel Bakış ve Bağlam

**Kullanıcı hikayesi:** Yönetici olarak, **Entegrasyonlar > Kargo Entegrasyonları** alanından anlaşmalı kargo servislerini tek bir ekranda yönetmek istiyorum.

Bu görev, mevcut panelde yeni bir menü kırılımı ve buna bağlı yönetim ekranını kapsar.

**Öncelik:** [Belirtin]

---

## 2. Kapsam

| # | Alan | Açıklama |
|---|------|----------|
| 1 | Menü | Sol menüde `Entegrasyonlar` altında `Kargo Entegrasyonları` bağlantısı |
| 2 | Liste ekranı | Kayıtlı entegrasyonların tablo/liste halinde gösterimi |
| 3 | Ekle/Düzenle | Yeni entegrasyon ekleme ve mevcut kaydı güncelleme |
| 4 | Durum yönetimi | Entegrasyonu aktif/pasif yapma |
| 5 | Bağlantı testi | Kimlik bilgileri ile test isteği atma ve sonucu gösterme |
| 6 | Silme (opsiyonel) | Soft delete veya devre dışı bırakma yaklaşımına göre |

---

## 3. Fonksiyonel Gereksinimler

### 3.1 Menü ve yönlendirme

- `Entegrasyonlar` üst başlığı altında `Kargo Entegrasyonları` alt menü öğesi görünür.
- Tıklanınca `/integrations/cargo` (veya proje route standardı) sayfasına gider.
- Aktif menü vurgusu route ile senkron olmalıdır.

### 3.2 Liste ekranı

Tabloda en az aşağıdaki sütunlar bulunur:

- Kargo firması adı (ör. Yurtiçi, MNG, Aras, Sendeo)
- Entegrasyon tipi (API / XML / diğer)
- Durum (Aktif/Pasif)
- Son güncelleme tarihi
- İşlemler (Düzenle, Test Et, Aktif/Pasif)

Ek davranışlar:

- Arama: firma adına göre filtre.
- Durum filtresi: aktif/pasif.
- Boş durum: kayıt yoksa yönlendirici mesaj + “Yeni Entegrasyon Ekle”.

### 3.3 Ekle / düzenle formu

Form alanları (backend sözleşmesine göre netleşecek):

- Firma (`carrierCode`)
- Entegrasyon adı (opsiyonel gösterim adı)
- Kullanıcı adı / API key
- Şifre / secret
- Endpoint URL
- Servis parametreleri (opsiyonel JSON veya key-value)
- Aktiflik durumu

Doğrulamalar:

- Zorunlu alanlar boş geçilemez.
- URL formatı doğrulanır.
- Secret alanları maskeleme + göster/gizle davranışı içerir.

### 3.4 Test et akışı

- “Test Et” aksiyonu ilgili kayıt bilgileriyle test endpointini çağırır.
- Sonuçlar kullanıcıya toast/alert + satır bazlı durum etiketi ile gösterilir.
- Test başarısızsa hata mesajı kullanıcı dostu metne çevrilir.

### 3.5 Rol ve yetki

| Rol | Erişim |
|-----|--------|
| Admin | Görüntüleme + oluşturma + güncelleme + test + aktif/pasif |
| Tedarikçi / standart kullanıcı | Görüntüleyemez (veya yalnızca okuma, ürün kararına göre netleştirilmeli) |

---

## 4. Teknik Özellikler ve Veri

**Örnek endpoint sözleşmesi (temsili):**

- `GET /api/integrations/cargo`
- `POST /api/integrations/cargo`
- `PUT /api/integrations/cargo/:id`
- `PATCH /api/integrations/cargo/:id/status`
- `POST /api/integrations/cargo/:id/test`

**State yönetimi:**

- Liste + filtre state’i route query ile senkron tutulabilir.
- Ekle/düzenle sonrası tablo verisi invalidate/refetch edilir.

**Hata ve yükleme durumları:**

- Liste yüklenirken skeleton.
- Form submit sırasında buton disabled + loading.
- API hatalarında standart hata bileşeni/toast.

---

## 5. Erişilebilirlik (A11y)

- Form alanları doğru label ile eşleşir.
- Modal/drawer odak tuzağı ve Escape ile kapama içerir.
- Klavye ile tüm aksiyonlara erişim sağlanır.
- Renk ile verilen durum bilgileri metinle de desteklenir.

---

## 6. Kabul Kriterleri

- [ ] `Entegrasyonlar` altında `Kargo Entegrasyonları` menüsü görünür ve doğru sayfaya yönlendirir.
- [ ] Liste ekranında entegrasyon kayıtları, durumları ve temel işlemler görüntülenir.
- [ ] Yeni kargo entegrasyonu eklenebilir, mevcut kayıt düzenlenebilir.
- [ ] Aktif/pasif geçişi çalışır ve listeye yansır.
- [ ] Test et aksiyonu sonucu başarılı/başarısız olarak kullanıcıya gösterilir.
- [ ] Yetkisiz roller için ekran erişimi kısıtlanır.
- [ ] Yükleme, boş durum ve hata durumları kullanıcı dostu şekilde yönetilir.

---

## 7. İlgili Notlar

- Kargo firması teknik parametreleri (ör. desi, teslimat tipi, iade servisi) ihtiyaç halinde ikinci fazda genişletilebilir.
- Eğer sistemde tek aktif entegrasyon kuralı isteniyorsa, aktif/pasif davranışı buna göre revize edilmelidir.
