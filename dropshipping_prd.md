# Dropshipping — Supplier Hub Ürün Gereksinim Dokümanı (PRD)

**Versiyon:** 1.0  
**Tarih:** 24 Nisan 2026  
**Durum:** Taslak  
**Hazırlayan:** Ürün Yönetimi

---

## İçindekiler

1. [Genel Tanım](#1-genel-tanım)
   1. [Dropshipping Nedir?](#11-dropshipping-nedir)
   2. [Supplier Hub Uygulamasının Amacı](#12-supplier-hub-uygulamasının-amacı)
   3. [Kimler Kullanır?](#13-kimler-kullanır)
2. [Kullanıcı Personaları ve Yetki Matrisi](#2-kullanıcı-personaları-ve-yetki-matrisi)
   1. [CarrefourSA Kullanıcıları](#21-carrefoursA-kullanıcıları)
   2. [Tedarikçi Kullanıcıları](#22-tedarikçi-kullanıcıları)
   3. [Müşteri](#23-müşteri)
   4. [Yetki Matrisi](#24-yetki-matrisi)
3. [Kullanıcı Yolculukları](#3-kullanıcı-yolculukları)
   1. [Tedarikçi Yolculuğu](#31-tedarikçi-yolculuğu)
   2. [CarrefourSA Kullanıcısı Yolculuğu](#32-carrefoursA-kullanıcısı-yolculuğu)
4. [Modüller ve Use Case'ler](#4-modüller-ve-use-caseler)
   1. [Dashboard](#41-dashboard)
   2. [Tedarikçi Yönetimi](#42-tedarikçi-yönetimi)
   3. [Ürün Yönetimi](#43-ürün-yönetimi)
   4. [Sipariş Yönetimi](#44-sipariş-yönetimi)
   5. [Kargo Yönetimi](#45-kargo-yönetimi)
   6. [İptal ve İade Yönetimi](#46-i̇ptal-ve-i̇ade-yönetimi)
   7. [Finans ve Hakediş Yönetimi](#47-finans-ve-hakediş-yönetimi)
   8. [Performans Yönetimi](#48-performans-yönetimi)
   9. [Kampanya Yönetimi](#49-kampanya-yönetimi)
   10. [Kullanıcı Yönetimi](#410-kullanıcı-yönetimi)
   11. [Raporlar](#411-raporlar)
   12. [Destek](#412-destek)
5. [Entegrasyonlar](#5-entegrasyonlar)
   1. [Ecom (CarrefourSA E-Ticaret Platformu)](#51-ecom-carrefoursA-e-ticaret-platformu)
   2. [SAP](#52-sap)
   3. [Retter](#53-retter)
   4. [Kargo Entegrasyonları](#54-kargo-entegrasyonları)
   5. [Entegrasyon Veri Akış Diyagramları](#55-entegrasyon-veri-akış-diyagramları)
6. [Veri Modelleri](#6-veri-modelleri)
   1. [Tedarikçi (Supplier)](#61-tedarikçi-supplier)
   2. [Ürün (Product)](#62-ürün-product)
   3. [Sipariş (Order)](#63-sipariş-order)
   4. [Sipariş Kalemi (Order Line)](#64-sipariş-kalemi-order-line)
   5. [Kargo (Shipment)](#65-kargo-shipment)
   6. [İade (Return)](#66-i̇ade-return)
   7. [Hakediş (Settlement)](#67-hakediş-settlement)
   8. [Komisyon (Commission)](#68-komisyon-commission)
   9. [Performans Skoru](#69-performans-skoru)
   10. [Destek Talebi (Support Ticket)](#610-destek-talebi-support-ticket)
7. [Non-Functional Gereksinimler](#7-non-functional-gereksinimler)
8. [Açık Konular ve Kararlar](#8-açık-konular-ve-kararlar)

---

## 1. Genel Tanım

### 1.1 Dropshipping Nedir?

Dropshipping, perakendecinin ürünleri fiziksel olarak stoklamadan sattığı, sipariş geldiğinde ilgili tedarikçinin ürünü doğrudan müşteriye gönderdiği bir e-ticaret fulfillment modelidir. Bu modelde:

- **Perakendeci (CarrefourSA):** Ürünleri kendi platformunda listeler, ödemeyi tahsil eder ve müşteri ilişkisini yönetir.
- **Tedarikçi:** Ürünü depolar, paketler ve kendi kargo anlaşmaları üzerinden müşteriye gönderir.
- **Müşteri:** CarrefourSA üzerinden alışveriş yapar; teslimatı doğrudan tedarikçiden alır.

### 1.2 Supplier Hub Uygulamasının Amacı

Supplier Hub, CarrefourSA'nın dropshipping ekosistemini tek bir portal üzerinden yönetmesine olanak tanıyan B2B SaaS platformudur. Temel amaçları:

- Tedarikçi başvuru ve onboarding süreçlerini dijitalleştirmek
- Tedarikçi ürün kataloğunun e-ticaret platformuna senkronize aktarımını sağlamak
- Sipariş, fulfillment ve kargo takibini uçtan uca yönetmek
- İptal ve iade süreçlerini standartlaştırmak
- Komisyon ve hakediş hesaplamalarını otomatikleştirmek
- Tedarikçi performansını ölçmek ve yönetmek
- CarrefourSA operasyon ekibine merkezi kontrol ve görünürlük sağlamak

### 1.3 Kimler Kullanır?

| Kullanıcı Tipi | Açıklama | Platform Erişimi |
|---|---|---|
| CarrefourSA Admin | En geniş yetkiye sahip CSA operasyon kullanıcısı | Supplier Hub (tam erişim) |
| CarrefourSA Standart | Sınırlı yetkili CSA operasyon kullanıcısı | Supplier Hub (kısıtlı erişim) |
| Tedarikçi Admin | Tedarikçi şirketi adına tam yetkili kullanıcı | Supplier Hub (tedarikçi portalı) |
| Tedarikçi Standart | Tedarikçi şirketi adına sınırlı yetkili kullanıcı | Supplier Hub (tedarikçi portalı) |
| Müşteri | CarrefourSA'dan alışveriş yapan son kullanıcı | Yalnızca CarrefourSA e-ticaret sitesi |

---

## 2. Kullanıcı Personaları ve Yetki Matrisi

### 2.1 CarrefourSA Kullanıcıları

#### 2.1.1 Admin

CarrefourSA (CSA) Admin kullanıcısı, Supplier Hub platformunda en geniş kapsamlı yetkilere sahip kullanıcı tipidir. Bu kullanıcı tipi tüm modülleri görüntüleyebilir, düzenleyebilir ve silebilir; sistem konfigürasyonlarını yönetebilir.

**Sorumlulukları:**
- Tedarikçi başvurularını inceleme ve onaylama/reddetme
- Ürün oluşturma, güncelleme, onaylama ve reddetme işlemleri
- Stok ve fiyat taleplerine onay/red/revizyon kararı verme
- Sipariş durumlarını izleme ve manuel müdahale
- Finans ve hakediş işlemlerini yönetme
- Kullanıcı hesapları oluşturma ve yetkilendirme
- Tüm raporlara erişim
- Kampanya oluşturma ve yönetme
- Sistem ayarlarını yapılandırma

#### 2.1.2 Standart

CSA Standart kullanıcısı, operasyonel süreçleri yürüten ancak yönetimsel işlemleri gerçekleştiremeyen kullanıcı tipidir.

**Sorumlulukları:**
- Ürün isteklerini inceleme, kabul, red veya revizyon
- Sipariş görüntüleme ve sipariş statüsünü ilerletme
- İade görüntüleme, iade kabulü/reddi
- Destek sayfası görüntüleme ve talepler üzerinde aksiyon alma

**Yapamadıkları:**
- Kullanıcı oluşturma/silme
- Sistem konfigürasyonu değiştirme
- Finansal hakediş işlemleri başlatma
- Tedarikçi sözleşme yönetimi

### 2.2 Tedarikçi Kullanıcıları

#### 2.2.1 Tedarikçi Admin

Tedarikçi şirketi adına en geniş yetkiye sahip kullanıcıdır. Yalnızca kendi tedarikçi hesabına ait verilere erişebilir.

**Sorumlulukları:**
- Şirkete ait alt kullanıcı hesaplarını oluşturma ve yönetme
- Ürün kataloğunu oluşturma, güncelleme ve yönetme
- Stok ve fiyat güncellemelerini yönetme
- Siparişleri görüntüleme ve fulfillment sürecini yürütme
- Kargo takibi ve güncelleme
- İptal ve iade süreçlerini yönetme
- Kargo firmalarını ve kargo tanımlarını yapılandırma
- Hakediş ve finansal raporları görüntüleme
- Performans puanlarını izleme
- Kampanya tekliflerini görüntüleme ve kabul etme

#### 2.2.2 Tedarikçi Standart

Tedarikçi şirketi adına operasyonel görevleri yürüten sınırlı yetkili kullanıcıdır.

**Sorumlulukları:**
- Siparişleri görüntüleme ve kargo bilgisi girme
- Stok güncelleme
- İptal taleplerini görüntüleme
- Raporları görüntüleme (finansal raporlar hariç)

### 2.3 Müşteri

Müşteri, CarrefourSA üzerinde alışveriş yapan son kullanıcıyı ifade eder.

- Supplier Hub'a doğrudan erişimi yoktur
- Kullanıcı giriş bilgisi ve yetkisi bulunmamaktadır
- Müşteri bilgileri (ad, adres, iletişim), siparişleri, iade talepleri ve ilgili finansal aktiviteler Supplier Hub üzerinde saklanır ve görüntülenebilir
- Müşteri verisi yalnızca ilgili sipariş/iade bağlamında görünür; CSA ve tedarikçi kullanıcıları bu verilere salt okunur erişebilir

### 2.4 Yetki Matrisi

| Modül | CSA Admin | CSA Standart | Tedarikçi Admin | Tedarikçi Standart |
|---|---|---|---|---|
| Dashboard | Tam | Görüntüle | Görüntüle (kendi) | Görüntüle (kendi) |
| Tedarikçi Başvuru | Onayla/Red | — | Başvur | — |
| Tedarikçi Yönetimi | Tam | Görüntüle | Kendi | — |
| Ürün Oluşturma | Tam | Onayla/Red/Rev. | Tam (kendi) | Oluştur/Güncelle |
| Stok & Fiyat | Tam | Onayla/Red/Rev. | Tam (kendi) | Güncelle |
| Sipariş Görüntüleme | Tam | Tam | Kendi | Kendi |
| Sipariş Statüsü | Tam | İlerlet | Fulfillment | Kargo girişi |
| İade Yönetimi | Tam | Kabul/Red | Görüntüle | Görüntüle |
| Finans/Hakediş | Tam | — | Görüntüle (kendi) | — |
| Kampanya | Tam | — | Kabul/Red | — |
| Kullanıcı Yönetimi | Tam | — | Kendi alt kullanıcılar | — |
| Raporlar | Tam | Kısıtlı | Kendi | Kısıtlı |
| Destek | Tam | Görüntüle/Aksiyon | Oluştur/Görüntüle | Görüntüle |

---

## 3. Kullanıcı Yolculukları

### 3.1 Tedarikçi Yolculuğu

#### 3.1.1 Tedarikçi Başvurusu ve Onboarding

**Story:** Yeni bir tedarikçi, CarrefourSA dropshipping programına dahil olmak için başvurusunu CarrefourSA e-ticaret sitesi üzerinden yapar. Başvuru, Supplier Hub'a iletilir; CSA Admin inceleyerek SAP'e aktarır. SAP üzerinde sözleşme imzalandıktan sonra tedarikçi aktif hale gelir ve Supplier Hub'a erişim kazanır.

**Adımlar:**

1. Tedarikçi, CarrefourSA e-ticaret sitesi (Ecom) üzerindeki başvuru formunu doldurur
   - Şirket bilgileri (ünvan, vergi no, adres)
   - Yetkili kişi bilgileri
   - Ürün kategorisi beyanı
   - Kargo kapasitesi beyanı
2. Ecom sistemi başvuruyu Supplier Hub'a (Drop) iletir
3. Drop sistemi Retter üzerinden ilgili CSA personeline bildirim gönderir
4. Drop sistemi başvuruyu SAP'e iletir
5. SAP üzerinde tedarikçi değerlendirme ve sözleşme süreci tamamlanır
6. SAP, Drop'a sözleşme onay bilgisini döner
7. Drop, Retter üzerinden tedarikçiye onay bildirimi gönderir
8. Tedarikçi, Supplier Hub'a giriş bilgileri ile erişim sağlar

**Veri Akışı:**
```
Ecom → Drop    : Tedarikçi başvuru verisi (POST /supplier/apply)
Drop → Retter  : Tedarikçi başvuru bildirimi (yeni başvuru eventi)
Drop → SAP     : Tedarikçi başvuru iletimi (SAP vendor creation request)
SAP → Drop     : Tedarikçi sözleşme onayı (vendor approved callback)
Drop → Retter  : Tedarikçi onay bildirimi (onboard completed eventi)
```

#### 3.1.2 Kargo Tanımlarının Yapılması

Tedarikçi, aktif olduktan sonra siparişleri kargolamak için kullanacağı kargo firmalarını ve teslimat kurallarını tanımlar.

**Adımlar:**
1. Tedarikçi Admin, Supplier Hub'a giriş yapar
2. Kargo Yönetimi > Kargo Tanımları ekranına gider
3. Anlaşmalı olduğu kargo firmalarını seçer (Aras, Yurtiçi, MNG, PTT, vb.)
4. Her kargo firması için kargo numarası şablonunu ve tracking URL formatını tanımlar
5. Teslimat süreleri (standart, hızlı) ve kapsam bölgelerini girer
6. Desi ve ağırlık bazlı kargo kurallarını oluşturur
7. Kargo tanımını kaydeder ve aktif eder

#### 3.1.3 Ürün Oluşturma / Yükleme

Tedarikçi ürünlerini tek tek veya toplu (Excel / API) olarak Supplier Hub'a yükler.

**Adımlar:**
1. Tedarikçi, Ürün Yönetimi > Yeni Ürün ekranına gider
2. Ürün temel bilgilerini girer: başlık, açıklama, kategori, marka, barkod (GTIN)
3. Varyant bilgilerini ekler (renk, beden, boyut vb.)
4. Ürün görsellerini yükler (en az 1 ana görsel zorunlu)
5. Fiyat ve stok miktarı girilir
6. Kargo bilgisi (desi, ağırlık, hacim) eklenir
7. Ürün taslak olarak kaydedilir ve CSA onayına sunulur

**Toplu Yükleme:**
1. Tedarikçi, şablon Excel dosyasını indirir
2. Ürün verilerini Excel'e doldurur
3. Dosyayı sisteme yükler
4. Sistem validasyon yapar ve hataları raporlar
5. Başarılı satırlar taslak olarak oluşturulur

#### 3.1.4 Ürün Audit (Onay Süreci)

**Adımlar:**
1. CSA Standart veya Admin, bekleyen ürün listesini görüntüler
2. Her ürünü detaylıca inceler: görseller, açıklama, kategori, fiyat, kargo bilgisi
3. Üç aksiyondan birini seçer:
   - **Onayla:** Ürün aktif hale gelir, Ecom'a senkronize edilir
   - **Reddet:** Tedarikçiye red gerekçesi bildirilir
   - **Revize İste:** Belirli alanlar için düzeltme notu eklenir; tedarikçiye bildirim gider
4. Tedarikçi, revizyon notunu görür, gerekli düzeltmeleri yapar ve tekrar gönderir

#### 3.1.5 Ürün Fiyat ve Stok Yönetimi

**Stok Güncelleme:**
1. Tedarikçi, stok güncelleme ekranından SKU bazlı stok miktarlarını günceller
2. Toplu güncelleme için Excel şablonu veya API kullanılabilir
3. Stok sıfırlandığında ürün otomatik olarak "Tükendi" statüsüne geçer ve Ecom'a bildirim gider

**Fiyat Güncelleme:**
1. Tedarikçi fiyat değişikliği talebini Supplier Hub'dan iletir
2. CSA, talep listesini görüntüler
3. CSA Standart/Admin onayla, reddet veya revize et aksiyonunu uygular
4. Onaylanan fiyat değişikliği Ecom'a senkronize edilir

**Otomatik Stok Senkronizasyonu:**
- Tedarikçi, API entegrasyonu varsa stok güncellemeleri gerçek zamanlı olarak Drop'a iletilir
- Drop, Ecom'a stok değişikliğini bildirir

#### 3.1.6 Tedarikçi Performans Puanları

Sistem, tedarikçi performansını aşağıdaki KPI'lar üzerinden otomatik olarak hesaplar:

- Sipariş kabul oranı (Order Acceptance Rate)
- Zamanında kargolama oranı (On-Time Shipment Rate)
- Teslimat başarı oranı (Delivery Success Rate)
- İptal oranı (Cancellation Rate)
- İade oranı (Return Rate)
- Müşteri şikayet oranı
- Ürün açıklama doğruluğu skoru

Performans puanı haftalık olarak hesaplanır. Düşük puan eşiklerine ulaşıldığında otomatik uyarı gönderilir; kritik eşiklerde tedarikçi askıya alınabilir.

#### 3.1.7 Ürün Güncelleme / Silme / Arşiv

**Güncelleme:**
1. Tedarikçi, aktif ürününü düzenler
2. Başlık, açıklama, görsel güncellemeleri doğrudan onaysız uygulanabilir (CSA konfigürasyonuna bağlı)
3. Kategori ve fiyat değişiklikleri CSA onayı gerektirebilir

**Silme:** Aktif siparişi olan ürünler silinemez. Tedarikçi ürünü "Arşiv" statüsüne alabilir.

**Arşivleme:** Arşivlenen ürün Ecom'dan kaldırılır; geçmiş sipariş verisi korunur.

#### 3.1.8 Sipariş Akışı ve Fulfillment

Müşteri CarrefourSA üzerinden sipariş verir; sistem ilgili siparişi tedarikçiye iletir.

**Adımlar:**
1. Ecom yeni sipariş bilgisini Drop'a iletir
2. Drop, ilgili tedarikçi hesabına sipariş oluşturur
3. Tedarikçiye Retter üzerinden yeni sipariş bildirimi gönderilir
4. Tedarikçi, siparişi görüntüler ve **Kabul / Red** kararı verir
   - Red: İptal süreci başlar (bkz. 3.1.10)
5. Tedarikçi, siparişi hazırlar ve kargoya verir
6. Tedarikçi, kargo firmasi ve takip numarasını sisteme girer
7. Drop, kargo bilgisini Ecom'a iletir
8. Ecom, müşteriye kargo bildirim e-postası/SMS gönderir
9. Kargo firmasi tracking bilgisi güncellendikçe Drop üzerinde statü güncellenir
10. Teslimat tamamlandığında sipariş "Teslim Edildi" statüsüne geçer

**Sipariş Statüleri:**
```
Yeni → Kabul Edildi → Hazırlanıyor → Kargoya Verildi → Yolda → Teslim Edildi
                ↓
             Reddedildi → İptal Edildi
```

#### 3.1.9 Kargo Süreci

1. Tedarikçi, sipariş detayından kargo formu oluşturur (kargo firması ve takip no)
2. Kargo etiketi sisteme yüklenir veya entegre kargo firmalarında otomatik oluşturulur
3. Kargo takip numarası Drop'a kaydedilir
4. Drop, takip numarasını Ecom'a iletir
5. Kargo firmasi entegrasyonu aktifse, teslimat durumu otomatik güncellenir
6. Teslimat süre aşımı durumunda sistem uyarı tetikler

#### 3.1.10 İptal ve İade Yönetimi

**İptal Süreci:**

*Müşteri kaynaklı iptal (kargo öncesi):*
1. Ecom, iptal talebini Drop'a iletir
2. Drop, tedarikçiye bildirim gönderir
3. Sipariş kargoya verilmediyse otomatik iptal onaylanır
4. Ecom üzerinden müşteriye iade başlatılır

*Kargo sonrası iptal:*
1. Kargo döndürme süreci başlatılır (iade akışına devredilir)

*Tedarikçi kaynaklı iptal:*
1. Tedarikçi sipariş kabulü sırasında red verir
2. Sistem otomatik olarak müşteriye iptal bildirimi gönderir
3. CSA, bu iptali tedarikçi performansına yansıtır

**İade Süreci:**
1. Müşteri, Ecom üzerinden iade talebi oluşturur (iade gerekçesi, görsel ekleme)
2. Ecom, iade talebini Drop'a iletir
3. CSA Standart, iade talebini görüntüler ve kabul/red kararı verir
4. Kabul edilirse müşteriye iade kargo kodu gönderilir
5. Ürün tedarikçi deposuna ulaştığında tedarikçi teslim alındı onayı verir
6. İade tamamlanır; finansal işlem (iade faturası) tetiklenir

**İade Gerekçeleri:**
- Ürün hasarlı / bozuk geldi
- Yanlış ürün gönderildi
- Ürün açıklamayla uyuşmuyor
- Ürün beğenilmedi (cayma hakkı, 14 gün)
- Eksik parça / aksesuar

#### 3.1.11 Komisyon Yönetimi

- Her ürün kategorisi için CarrefourSA komisyon oranı tanımlanır
- Komisyon oranları CSA Admin tarafından yönetilir
- Sipariş tamamlandığında komisyon tutarı otomatik hesaplanır: `(Satış Fiyatı × Komisyon Oranı)`
- İade gerçekleştiğinde komisyon iptali otomatik uygulanır
- Tedarikçi, kendi kategori bazlı komisyon oranlarını görüntüleyebilir

#### 3.1.12 Hakediş Yönetimi

1. CSA Admin, hakediş dönemi belirler (haftalık/2 haftalık/aylık)
2. Sistem, dönem sonunda her tedarikçi için hakediş hesabı oluşturur:
   - Tamamlanan siparişlerin net tutarı
   - Komisyon kesintisi
   - İade ve iptal düzeltmeleri
   - Varsa ceza kesintileri (SLA ihlali vb.)
3. Hakediş özeti tedarikçiye e-posta ve Supplier Hub üzerinden bildirilir
4. CSA Admin, hakediş listesini onaylar
5. Onaylanan hakediş SAP'e iletilir (ödeme emri oluşturmak için)
6. Ödeme tamamlandığında tedarikçiye bildirim gönderilir

#### 3.1.13 Raporlar

Tedarikçi Admin aşağıdaki raporlara erişebilir:
- Sipariş özet raporu (tarih aralığı, statü bazlı)
- Ürün performans raporu (satış adedi, gelir, iade oranı)
- Hakediş raporu (dönem bazlı)
- Stok durum raporu
- İptal ve iade raporu

#### 3.1.14 Kampanya Yönetimi (Tedarikçi Tarafı)

1. CSA Admin, belirli ürünleri veya kategorileri kapsayan kampanya teklifini tedarikçiye iletir
2. Tedarikçi, kampanya teklifini Supplier Hub üzerinden görüntüler
3. Tedarikçi, teklifi kabul veya reddeder
4. Kabul durumunda ürünler kampanya fiyatıyla Ecom'da listelenir
5. Kampanya süresi dolduğunda fiyatlar otomatik eski haline döner

### 3.2 CarrefourSA Kullanıcısı Yolculuğu

#### 3.2.1 Tedarikçi Onboarding Yönetimi

1. CSA Admin, bekleyen başvurular listesini görüntüler
2. Başvuru detaylarını (şirket bilgileri, belgeler, kategori beyanı) inceler
3. Onaylama veya red kararı verir
4. Onaylanan başvuru SAP'e iletilir; sözleşme süreci takip edilir

#### 3.2.2 Ürün Onay ve Yönetim

1. CSA Standart/Admin, bekleyen onay listesini görüntüler
2. Ürün detaylarını (görseller, açıklama, SEO bilgileri, kategori, fiyat) inceler
3. Onay, red veya revizyon kararı verir
4. Onaylanan ürünler Ecom'a senkronize edilir
5. CSA Admin, onaylı ürünlerde de sonradan düzenleme yapabilir

#### 3.2.3 Sipariş Takibi ve Müdahale

1. CSA Standart/Admin, tüm siparişleri filtreli olarak görüntüler
2. Geciken veya sorunlu siparişleri izler
3. Gerektiğinde sipariş statüsünü manuel olarak ilerletir
4. Tedarikçiyle bağlantılı sorunlarda destek talebi oluşturabilir

#### 3.2.4 İade Kararı

1. CSA, iade taleplerini listeler
2. Her iade için müşteri gerekçesi ve görseli inceler
3. Kabul/red kararı verir; gerekçe notu ekler
4. Kabul edilen iade için kargo etiketi müşteriye otomatik gönderilir

---

## 4. Modüller ve Use Case'ler

### 4.1 Dashboard

#### 4.1.1 CSA Admin / Standart Dashboard

**Görüntülenen KPI'lar:**
- Toplam aktif tedarikçi sayısı
- Bekleyen ürün onayı sayısı
- Günlük / haftalık yeni sipariş sayısı
- Açık iade talebi sayısı
- SLA ihlali riski taşıyan sipariş sayısı
- Dönem bazlı GMV (Gross Merchandise Value)
- Tedarikçi başvuru durumu özeti

**Grafikler:**
- Son 30 günlük sipariş trendi (çizgi grafik)
- Kategori bazlı satış dağılımı (pasta grafik)
- Tedarikçi performans dağılımı (çubuk grafik)

**Hızlı Erişim Linkleri:**
- Bekleyen ürün onayları
- Açık iade talepleri
- Yaklaşan hakediş tarihleri

#### 4.1.2 Tedarikçi Dashboard

**Görüntülenen KPI'lar:**
- Aktif ürün sayısı
- Bugünkü yeni sipariş sayısı
- Bekleyen kargo sayısı
- Açık iade sayısı
- Son dönem hakediş tutarı
- Genel performans skoru

**Grafikler:**
- Son 30 günlük sipariş trendi
- Ürün bazlı satış dağılımı
- İade oranı trendi

### 4.2 Tedarikçi Yönetimi

#### UC-T01: Tedarikçi Başvurusu Alma

**Aktör:** Sistem (Ecom'dan otomatik)
**Ön Koşul:** Ecom üzerinden başvuru formu doldurulmuş olmalı
**Ana Akış:**
1. Ecom, başvuru verilerini Drop API'ye POST eder
2. Sistem başvuruyu "Beklemede" statüsüyle oluşturur
3. CSA Admin'e bildirim gönderilir

#### UC-T02: Tedarikçi Başvurusu Onaylama

**Aktör:** CSA Admin
**Ana Akış:**
1. Admin, başvuruyu inceler
2. "Onayla" butonuna tıklar
3. Sistem başvuruyu SAP'e iletir
4. SAP sözleşme onayı dönünce tedarikçi aktif olur
5. Tedarikçiye Supplier Hub erişim bilgileri gönderilir

#### UC-T03: Tedarikçi Başvurusu Reddetme

**Aktör:** CSA Admin
**Ana Akış:**
1. Admin, red gerekçesini yazar
2. "Reddet" butonuna tıklar
3. Sistem, red bildirimini başvurucu e-postasına gönderir

#### UC-T04: Tedarikçi Profili Güncelleme

**Aktör:** Tedarikçi Admin / CSA Admin
**Ana Akış:** İletişim bilgileri, banka bilgisi, adres, yetkili kişi bilgilerini güncelleme. Kritik değişiklikler (banka hesabı vb.) CSA onayı gerektirebilir.

#### UC-T05: Tedarikçi Askıya Alma / Pasif Etme

**Aktör:** CSA Admin
**Ana Akış:**
1. Admin, tedarikçiyi askıya alma gerekçesini girer
2. Onaylar
3. Tedarikçinin tüm aktif ürünleri Ecom'dan kaldırılır
4. Yeni sipariş oluşturulmaz; mevcut aktif siparişler tamamlanır
5. Tedarikçiye bildirim gönderilir

### 4.3 Ürün Yönetimi

#### UC-U01: Ürün Oluşturma (Tek Ürün)

**Aktör:** Tedarikçi Admin / Tedarikçi Standart
**Ön Koşul:** Tedarikçi aktif ve onaylı olmalı
**Ana Akış:**
1. "Yeni Ürün" formunu aç
2. Zorunlu alanları doldur: kategori, marka, başlık, açıklama, barkod, fiyat, stok, kargo bilgisi
3. En az 1 ürün görseli yükle
4. Kaydet ve onaya gönder
**Validasyonlar:**
- Barkod (GTIN) benzersizliği kontrolü
- Görsel minimum çözünürlük: 800×800 px
- Fiyat > 0 olmalı
- Stok ≥ 0 olmalı
- Kategori seçimi zorunlu

#### UC-U02: Toplu Ürün Yükleme

**Aktör:** Tedarikçi Admin / Tedarikçi Standart
**Ana Akış:**
1. Excel şablonunu indir
2. Ürün verilerini doldur
3. Dosyayı yükle
4. Sistem validasyon raporu oluşturur (satır bazlı hata listesi)
5. Hatasız satırlar taslak olarak oluşturulur

#### UC-U03: Ürün Onayı (CSA)

**Aktör:** CSA Admin / CSA Standart
**Ana Akış:** (Bkz. 3.1.4)

#### UC-U04: Stok Güncelleme

**Aktör:** Tedarikçi Admin / Tedarikçi Standart
**Ana Akış:** SKU bazlı stok miktarını güncelle. Onay gerektirmez; anlık Ecom'a yansır.

#### UC-U05: Fiyat Güncelleme Talebi

**Aktör:** Tedarikçi Admin
**Ana Akış:**
1. Ürün(ler) için yeni fiyat gir
2. Değişiklik talebini gönder
3. CSA, talebi onaylar/reddeder/revize ister
4. Onaylanan fiyat Ecom'a yansır

#### UC-U06: Ürün Arşivleme

**Aktör:** Tedarikçi Admin / CSA Admin
**Kural:** Aktif (kargosuz) siparişi olan ürün arşivlenemez.

#### UC-U07: Ürün Görüntüleme ve Arama

**Aktör:** Tüm kullanıcılar (yetki sınırları dahilinde)
**Filtreler:** Statü, kategori, tedarikçi, marka, fiyat aralığı, onay tarihi, stok durumu

### 4.4 Sipariş Yönetimi

#### UC-S01: Sipariş Listesi Görüntüleme

**Aktör:** CSA Admin / CSA Standart / Tedarikçi Admin / Tedarikçi Standart
**Filtreler:** Tarih aralığı, statü, tedarikçi (CSA tarafı), sipariş no, müşteri adı (CSA tarafı)

#### UC-S02: Sipariş Detayı Görüntüleme

Sipariş üzerindeki tüm bilgiler: müşteri bilgileri (CSA için), ürün detayları, kargo bilgisi, ödeme tutarı, statü geçmişi, notlar

#### UC-S03: Sipariş Kabulü / Reddi (Tedarikçi)

**Aktör:** Tedarikçi Admin / Tedarikçi Standart
**Süre Kısıtı:** Yeni siparişler X saat içinde kabul edilmezse otomatik iptal tetiklenir (CSA konfigürasyonuna bağlı)

#### UC-S04: Sipariş Statüsü İlerletme

**Aktör:** CSA Standart / CSA Admin (manuel müdahale)
**Kullanım:** Anlaşmazlık veya sistem hatası durumunda statü manuel ilerletilebilir

#### UC-S05: Sipariş Notları

**Aktör:** Tüm kullanıcılar (iç notlar; müşteriye görünmez)

### 4.5 Kargo Yönetimi

#### UC-K01: Kargo Firması Tanımlama

**Aktör:** Tedarikçi Admin
**Bilgiler:** Kargo firması adı, API entegrasyonu (varsa), tracking URL şablonu, tahmini teslimat süresi

#### UC-K02: Kargo Bilgisi Girme

**Aktör:** Tedarikçi Admin / Tedarikçi Standart
**Ana Akış:**
1. Siparişi "Hazırlandı" olarak işaretle
2. Kargo firmasını seç
3. Takip numarasını gir
4. Kaydet → Ecom'a bildirim gönderilir

#### UC-K03: Kargo Takibi

**Aktör:** Tüm kullanıcılar
**Özellik:** Sisteme entegre kargo firmalarında takip bilgisi Supplier Hub üzerinden görüntülenir

#### UC-K04: Teslimat Süre Aşımı Uyarısı

**Aktör:** Sistem (otomatik)
**Tetikleyici:** Kargo verilme tarihinden itibaren beklenen teslimat süresi + X gün geçildiğinde
**Aksiyon:** Tedarikçiye ve CSA'ya uyarı bildirimi

### 4.6 İptal ve İade Yönetimi

#### UC-I01: Müşteri Kaynaklı İptal

**Ana Akış:** (Bkz. 3.1.10 – İptal Süreci)

#### UC-I02: Tedarikçi Kaynaklı İptal

**Ana Akış:** Tedarikçi siparişi reddeder → İptal otomatik işlenir → Müşteriye bildirim → Performans puanı etkilenir

#### UC-I03: İade Talebi Oluşturma

**Aktör:** Sistem (Ecom'dan otomatik)

#### UC-I04: İade Kabulü / Reddi

**Aktör:** CSA Admin / CSA Standart
**Ana Akış:** (Bkz. 3.1.10 – İade Süreci)

#### UC-I05: İade Teslim Alımı (Tedarikçi)

**Aktör:** Tedarikçi Admin / Tedarikçi Standart
**Ana Akış:** İade kargosunun depoya ulaşmasını sisteme işle → Finansal düzeltme otomatik tetiklenir

### 4.7 Finans ve Hakediş Yönetimi

#### UC-F01: Komisyon Oranı Tanımlama

**Aktör:** CSA Admin
**Özellik:** Kategori bazlı, tedarikçi bazlı veya ürün bazlı komisyon oranı tanımlanabilir
**Kurallar:** Oran değişikliği anlık siparişlere uygulanmaz; yeni siparişlerden itibaren geçerlidir

#### UC-F02: Hakediş Hesaplama

**Aktör:** Sistem (otomatik, dönem sonunda)
**Hesaplama:**
```
Brüt Satış = Σ(Tamamlanan Sipariş Tutarı)
Komisyon   = Σ(Sipariş Tutarı × Komisyon Oranı)
İade Düzeltmesi = Σ(İade Edilen Tutar)
Ceza = Σ(SLA İhlal Cezaları)
Net Hakediş = Brüt Satış - Komisyon - İade Düzeltmesi - Ceza
```

#### UC-F03: Hakediş Onayı

**Aktör:** CSA Admin
**Ana Akış:**
1. Hakediş listesini görüntüle
2. Detay incele
3. Onayla → SAP'e ödeme emri gönderilir

#### UC-F04: Tedarikçi Hakediş Görüntüleme

**Aktör:** Tedarikçi Admin
**Özellik:** Dönem bazlı hakediş detayı, sipariş kırılımı, komisyon kesintisi, net tutar

#### UC-F05: Fatura Yönetimi

**Aktör:** Tedarikçi Admin / CSA Admin
- Tedarikçi, her dönem için e-fatura oluşturur / yükler
- CSA, faturayı onaylar
- SAP'te fatura kaydı oluşturulur

### 4.8 Performans Yönetimi

#### UC-P01: Performans Skoru Hesaplama

**Aktör:** Sistem (otomatik, haftalık)
**Metriks Ağırlıkları (örnek):**

| Metrik | Ağırlık |
|---|---|
| Zamanında Kargolama Oranı | %30 |
| Teslimat Başarı Oranı | %25 |
| İptal Oranı (Tedarikçi Kaynaklı) | %20 |
| İade Oranı | %15 |
| Ürün Açıklama Uyumu | %10 |

**Skor Seviyeleri:**
- 90–100: Platinum
- 75–89: Gold
- 60–74: Silver
- < 60: Uyarı Seviyesi (otomatik bildirim)
- < 40: Askıya Alma riski

#### UC-P02: Performans Raporu Görüntüleme

**Aktör:** CSA Admin / Tedarikçi Admin
**Özellik:** Haftalık, aylık ve yıllık trend grafikleri; KPI kırılımı

#### UC-P03: Performans Uyarısı

**Aktör:** Sistem
**Tetikleyici:** Performans skoru uyarı eşiğine düştüğünde CSA Admin'e ve tedarikçiye bildirim

### 4.9 Kampanya Yönetimi

#### UC-C01: Kampanya Oluşturma

**Aktör:** CSA Admin
**Bilgiler:** Kampanya adı, başlangıç/bitiş tarihi, hedef ürünler/kategoriler, teklif edilen indirim oranı, tedarikçi katılım son tarihi

#### UC-C02: Kampanya Teklifi Gönderme

**Aktör:** Sistem
**Akış:** Kampanya oluşturulunca ilgili tedarikçilere bildirim ve teklif detayı gönderilir

#### UC-C03: Kampanya Teklifi Kabul / Reddi

**Aktör:** Tedarikçi Admin
**Ana Akış:**
1. Tedarikçi, kampanya teklifini görüntüler
2. Kabul veya reddet
3. Kabul edilirse belirtilen ürünler kampanya fiyatıyla güncellenir

#### UC-C04: Kampanya Performans Takibi

**Aktör:** CSA Admin
**Özellik:** Kampanya süresince satış adetleri, ciro ve katılım oranı görüntülenir

### 4.10 Kullanıcı Yönetimi

#### UC-KU01: CSA Kullanıcısı Oluşturma

**Aktör:** CSA Admin
**Bilgiler:** Ad soyad, e-posta, rol (Admin / Standart), izin seti

#### UC-KU02: Tedarikçi Alt Kullanıcısı Oluşturma

**Aktör:** Tedarikçi Admin
**Bilgiler:** Ad soyad, e-posta, rol (Admin / Standart), yetki seti

#### UC-KU03: Kullanıcı Deaktivasyonu

**Aktör:** CSA Admin (CSA kullanıcıları için) / Tedarikçi Admin (kendi alt kullanıcıları için)

#### UC-KU04: Şifre Sıfırlama

**Aktör:** Kullanıcının kendisi (self-service) veya üst yetki (admin reset)

### 4.11 Raporlar

#### Raporlar — CSA Admin

| Rapor | Açıklama | Format |
|---|---|---|
| GMV Raporu | Dönem bazlı toplam satış hacmi | Tablo, grafik, Excel export |
| Tedarikçi Performans Raporu | Tüm tedarikçiler için skor kırılımı | Tablo, Excel export |
| Ürün Analitik Raporu | Satış, iade, stok tükenme | Tablo, grafik |
| Sipariş Analitik Raporu | Statü dağılımı, SLA uyumu | Tablo, grafik |
| Hakediş Özet Raporu | Dönem bazlı komisyon ve hakediş | Tablo, Excel export |
| Kategori Raporu | Kategori bazlı satış dağılımı | Tablo, pasta grafik |

#### Raporlar — Tedarikçi Admin

| Rapor | Açıklama |
|---|---|
| Sipariş Özet Raporu | Kendi siparişleri |
| Ürün Performans Raporu | Satış, iade, stok |
| Hakediş Detay Raporu | Dönem bazlı kırılım |
| İade Raporu | Gerekçe bazlı iade analizi |

### 4.12 Destek

#### UC-D01: Destek Talebi Oluşturma

**Aktör:** Tedarikçi Admin
**Kategoriler:** Teknik sorun, ürün onay sorunu, hakediş sorunu, sipariş sorunu, genel soru
**Bilgiler:** Konu, açıklama, öncelik, ilgili sipariş/ürün referansı, ek dosya

#### UC-D02: Destek Talebi Görüntüleme ve Aksiyon

**Aktör:** CSA Admin / CSA Standart
**Ana Akış:** Açık talepleri listele, cevap yaz, statü güncelle (Açık / İşlemde / Çözüldü / Kapatıldı)

#### UC-D03: Destek Talebi Takibi

**Aktör:** Tedarikçi
**Özellik:** Talep statüsü, CSA yanıtları, çözüm geçmişi

---

## 5. Entegrasyonlar

### 5.1 Ecom (CarrefourSA E-Ticaret Platformu)

Ecom, CarrefourSA'nın müşteriye açık e-ticaret platformudur. Drop (Supplier Hub backend) ile çift yönlü veri alışverişi yapar.

| Entegrasyon Noktası | Yön | Tetikleyici | Veri |
|---|---|---|---|
| Tedarikçi Başvurusu | Ecom → Drop | Yeni başvuru | Tedarikçi profil verisi |
| Ürün Listeleme | Drop → Ecom | Ürün onayı | Ürün data, fiyat, stok |
| Stok Güncelleme | Drop → Ecom | Stok değişimi | SKU, stok miktarı |
| Fiyat Güncelleme | Drop → Ecom | Fiyat onayı | SKU, yeni fiyat |
| Yeni Sipariş | Ecom → Drop | Sipariş oluşturma | Sipariş detayı |
| Kargo Bilgisi | Drop → Ecom | Kargo girişi | Takip no, kargo firması |
| İptal Bildirimi | Drop → Ecom | İptal onayı | Sipariş no, gerekçe |
| İade Talebi | Ecom → Drop | Müşteri iade isteği | İade detayı |
| İade Onayı | Drop → Ecom | CSA kabulü | İade ID, onay |
| Ürün Kaldırma | Drop → Ecom | Arşivleme / Askıya alma | SKU listesi |

### 5.2 SAP

SAP, CarrefourSA'nın ERP sistemidir. Tedarikçi sözleşme yönetimi ve finansal işlemler bu sistem üzerinden yürütülür.

| Entegrasyon Noktası | Yön | Tetikleyici | Veri |
|---|---|---|---|
| Tedarikçi Başvurusu İletme | Drop → SAP | CSA ön onayı | Tedarikçi profil ve belgeleri |
| Sözleşme Onayı | SAP → Drop | SAP sözleşme tamamlandı | Vendor ID, sözleşme tarihi |
| Hakediş Ödeme Emri | Drop → SAP | CSA hakediş onayı | Tedarikçi, tutar, dönem |
| Fatura Kaydı | Drop → SAP | Fatura onayı | Fatura no, tutar, KDV |
| Ödeme Onayı | SAP → Drop | Ödeme gerçekleşti | Tedarikçi, ödeme tarihi, referans |

### 5.3 Retter

Retter, CarrefourSA'nın olay tabanlı (event-driven) bildirim ve gerçek zamanlı veri alışveriş platformudur.

| Event | Yön | Tetikleyici | Alıcı |
|---|---|---|---|
| `supplier.applied` | Drop → Retter | Yeni başvuru geldi | CSA Admin |
| `supplier.onboarded` | Drop → Retter | Sözleşme onaylandı | Tedarikçi |
| `supplier.suspended` | Drop → Retter | Tedarikçi askıya alındı | Tedarikçi Admin |
| `product.pending_approval` | Drop → Retter | Ürün onaya gönderildi | CSA Standart |
| `product.approved` | Drop → Retter | Ürün onaylandı | Tedarikçi |
| `product.rejected` | Drop → Retter | Ürün reddedildi | Tedarikçi |
| `order.new` | Drop → Retter | Yeni sipariş | Tedarikçi |
| `order.cancelled` | Drop → Retter | Sipariş iptal | Tedarikçi / Müşteri |
| `order.shipped` | Drop → Retter | Kargo verildi | CSA / Müşteri |
| `return.requested` | Drop → Retter | İade talebi | CSA Standart |
| `return.approved` | Drop → Retter | İade onaylandı | Tedarikçi |
| `settlement.ready` | Drop → Retter | Hakediş hazır | Tedarikçi |
| `settlement.paid` | Drop → Retter | Ödeme yapıldı | Tedarikçi Admin |
| `performance.warning` | Drop → Retter | Performans düştü | CSA Admin + Tedarikçi |

### 5.4 Kargo Entegrasyonları

Supplier Hub, kargo firmalarıyla iki modda entegre olabilir:

**Manuel Mod:** Tedarikçi takip numarasını sisteme manuel girer. Sistem takip numarasını Ecom'a iletir.

**API Mod:** Kargo firmasının API'si ile doğrudan entegrasyon. Kargo etiketi Supplier Hub üzerinden oluşturulur; teslimat durumu otomatik güncellenir.

| Kargo Firması | Entegrasyon Tipi | Özellikler |
|---|---|---|
| Aras Kargo | API | Etiket oluşturma, takip |
| Yurtiçi Kargo | API | Etiket oluşturma, takip |
| MNG Kargo | API | Etiket oluşturma, takip |
| PTT Kargo | Manuel | Takip no girişi |
| Diğer | Manuel | Takip no girişi |

### 5.5 Entegrasyon Veri Akış Diyagramları

#### Tedarikçi Onboarding Akışı
```
Müşteri/Tedarikçi → [Ecom Başvuru Formu]
        ↓
[Ecom] → POST /api/supplier/apply → [Drop]
        ↓
[Drop] → event: supplier.applied → [Retter] → CSA Admin Bildirimi
        ↓
CSA Admin Onayı
        ↓
[Drop] → POST /sap/vendor/create → [SAP]
        ↓
[SAP] → callback: vendor.approved → [Drop]
        ↓
[Drop] → event: supplier.onboarded → [Retter] → Tedarikçi Bildirimi
        ↓
Tedarikçi Supplier Hub'a Erişim Kazanır
```

#### Sipariş Fulfillment Akışı
```
Müşteri Sipariş Verir → [Ecom]
        ↓
[Ecom] → POST /api/order/new → [Drop]
        ↓
[Drop] → event: order.new → [Retter] → Tedarikçi Bildirimi
        ↓
Tedarikçi Siparişi Kabul Eder
        ↓
Tedarikçi Kargo Bilgisi Girer → [Drop]
        ↓
[Drop] → PATCH /api/order/{id}/shipment → [Ecom] → Müşteri Bildirim Email/SMS
        ↓
[Kargo Firması API] → Teslimat Durumu → [Drop] → [Ecom]
        ↓
Teslimat Tamamlanır → Sipariş "Teslim Edildi"
```

#### Hakediş Akışı
```
Dönem Sonu
        ↓
[Drop] Otomatik Hakediş Hesapla
        ↓
[Drop] → event: settlement.ready → [Retter] → Tedarikçi Bildirimi
        ↓
CSA Admin Hakediş Onaylar
        ↓
[Drop] → POST /sap/payment/create → [SAP]
        ↓
[SAP] → callback: payment.completed → [Drop]
        ↓
[Drop] → event: settlement.paid → [Retter] → Tedarikçi Bildirimi
```

---

## 6. Veri Modelleri

### 6.1 Tedarikçi (Supplier)

```
Supplier {
  id                  : UUID (PK)
  name                : String          // Şirket ünvanı
  tax_number          : String          // Vergi numarası
  tax_office          : String          // Vergi dairesi
  address             : Address         // Fatura / şirket adresi
  contact_name        : String          // Yetkili kişi adı
  contact_email       : String          // Yetkili e-posta
  contact_phone       : String          // Yetkili telefon
  bank_iban           : String (masked) // Banka IBAN
  bank_name           : String
  sap_vendor_id       : String          // SAP vendor referansı
  status              : Enum            // pending_review | active | suspended | rejected | closed
  performance_score   : Float
  performance_tier    : Enum            // platinum | gold | silver | warning
  commission_profile  : UUID (FK)       // Komisyon profili referansı
  created_at          : DateTime
  updated_at          : DateTime
  onboarded_at        : DateTime
}

Address {
  street              : String
  district            : String
  city                : String
  postal_code         : String
  country             : String (default: TR)
}
```

### 6.2 Ürün (Product)

```
Product {
  id                  : UUID (PK)
  supplier_id         : UUID (FK)
  title               : String
  description         : Text
  category_id         : UUID (FK)
  brand               : String
  barcode             : String (GTIN)
  sku                 : String          // Tedarikçi kendi SKU'su
  ecom_product_id     : String          // Ecom'daki ürün ID (onaydan sonra)
  status              : Enum            // draft | pending_approval | approved | rejected | revision | archived
  base_price          : Decimal
  list_price          : Decimal         // KDV dahil satış fiyatı
  vat_rate            : Float
  currency            : String (default: TRY)
  images              : ProductImage[]
  attributes          : ProductAttribute[]
  variants            : ProductVariant[]
  shipping_desi       : Float
  shipping_weight     : Float
  created_at          : DateTime
  updated_at          : DateTime
  approved_at         : DateTime
  approved_by         : UUID (FK → User)
  rejection_reason    : Text
  revision_notes      : Text
}

ProductVariant {
  id                  : UUID (PK)
  product_id          : UUID (FK)
  sku                 : String
  barcode             : String
  attributes          : { key: value }  // renk:kırmızı, beden:M vb.
  stock_quantity      : Int
  price               : Decimal
  status              : Enum            // active | passive
}
```

### 6.3 Sipariş (Order)

```
Order {
  id                  : UUID (PK)
  ecom_order_id       : String          // Ecom sipariş referansı
  supplier_id         : UUID (FK)
  customer            : CustomerSnapshot
  status              : Enum            // new | accepted | preparing | shipped | delivered | cancelled | return_in_progress | returned
  total_amount        : Decimal
  currency            : String
  shipping_address    : Address
  created_at          : DateTime
  accepted_at         : DateTime
  shipped_at          : DateTime
  delivered_at        : DateTime
  cancelled_at        : DateTime
  cancel_reason       : Text
  cancel_actor        : Enum            // customer | supplier | system | csa
  notes               : OrderNote[]
  lines               : OrderLine[]
}

CustomerSnapshot {
  name                : String
  email               : String (masked)
  phone               : String (masked)
}
```

### 6.4 Sipariş Kalemi (Order Line)

```
OrderLine {
  id                  : UUID (PK)
  order_id            : UUID (FK)
  product_id          : UUID (FK)
  variant_id          : UUID (FK)
  product_title       : String          // Snapshot
  sku                 : String
  quantity            : Int
  unit_price          : Decimal
  total_price         : Decimal
  commission_rate     : Float
  commission_amount   : Decimal
  status              : Enum            // active | cancelled | returned
}
```

### 6.5 Kargo (Shipment)

```
Shipment {
  id                  : UUID (PK)
  order_id            : UUID (FK)
  carrier             : String          // Kargo firması
  tracking_number     : String
  tracking_url        : String
  label_url           : String          // Kargo etiketi
  status              : Enum            // created | in_transit | delivered | failed | returning
  estimated_delivery  : Date
  shipped_at          : DateTime
  delivered_at        : DateTime
  tracking_events     : TrackingEvent[]
}

TrackingEvent {
  timestamp           : DateTime
  location            : String
  description         : String
  status_code         : String
}
```

### 6.6 İade (Return)

```
Return {
  id                  : UUID (PK)
  order_id            : UUID (FK)
  ecom_return_id      : String
  reason              : Enum            // damaged | wrong_product | mismatch | dislike | missing_part
  reason_description  : Text
  images              : String[]        // Fotoğraf URL'leri
  status              : Enum            // requested | approved | rejected | in_transit | received | completed | refunded
  requested_at        : DateTime
  reviewed_at         : DateTime
  reviewed_by         : UUID (FK → User)
  rejection_reason    : Text
  return_shipment     : ReturnShipment
  lines               : ReturnLine[]
}

ReturnLine {
  order_line_id       : UUID (FK)
  quantity            : Int
  refund_amount       : Decimal
}
```

### 6.7 Hakediş (Settlement)

```
Settlement {
  id                  : UUID (PK)
  supplier_id         : UUID (FK)
  period_start        : Date
  period_end          : Date
  gross_amount        : Decimal
  commission_total    : Decimal
  return_deductions   : Decimal
  penalty_deductions  : Decimal
  net_amount          : Decimal
  currency            : String
  status              : Enum            // calculated | pending_approval | approved | paid | disputed
  sap_payment_ref     : String
  created_at          : DateTime
  approved_at         : DateTime
  approved_by         : UUID (FK → User)
  paid_at             : DateTime
  items               : SettlementItem[]
}

SettlementItem {
  order_id            : UUID (FK)
  order_line_id       : UUID (FK)
  gross_amount        : Decimal
  commission_rate     : Float
  commission_amount   : Decimal
  return_adjustment   : Decimal
  net_amount          : Decimal
}
```

### 6.8 Komisyon (Commission)

```
CommissionProfile {
  id                  : UUID (PK)
  name                : String
  rules               : CommissionRule[]
  created_at          : DateTime
  updated_at          : DateTime
}

CommissionRule {
  id                  : UUID (PK)
  profile_id          : UUID (FK)
  scope               : Enum            // category | supplier | product
  scope_id            : UUID            // İlgili kategori/tedarikçi/ürün ID
  rate                : Float           // 0.00 – 1.00
  effective_from      : Date
  effective_to        : Date
}
```

### 6.9 Performans Skoru

```
PerformanceScore {
  id                  : UUID (PK)
  supplier_id         : UUID (FK)
  period_start        : Date
  period_end          : Date
  order_acceptance_rate     : Float
  on_time_shipment_rate     : Float
  delivery_success_rate     : Float
  cancellation_rate         : Float
  return_rate               : Float
  complaint_rate            : Float
  description_accuracy      : Float
  composite_score           : Float
  tier                      : Enum    // platinum | gold | silver | warning | critical
  calculated_at             : DateTime
}
```

### 6.10 Destek Talebi (Support Ticket)

```
SupportTicket {
  id                  : UUID (PK)
  supplier_id         : UUID (FK)
  created_by          : UUID (FK → User)
  category            : Enum            // technical | product | settlement | order | general
  priority            : Enum            // low | medium | high | critical
  subject             : String
  description         : Text
  attachments         : String[]
  related_order_id    : UUID (FK, nullable)
  related_product_id  : UUID (FK, nullable)
  status              : Enum            // open | in_progress | resolved | closed
  assigned_to         : UUID (FK → User, nullable)
  created_at          : DateTime
  updated_at          : DateTime
  resolved_at         : DateTime
  messages            : TicketMessage[]
}

TicketMessage {
  id                  : UUID (PK)
  ticket_id           : UUID (FK)
  sender_id           : UUID (FK → User)
  message             : Text
  attachments         : String[]
  created_at          : DateTime
}
```

---

## 7. Non-Functional Gereksinimler

### 7.1 Performans

- API yanıt süresi: P95 < 500ms (okuma), P95 < 1000ms (yazma)
- Dashboard yüklenme süresi: < 3 saniye
- Toplu ürün yükleme: 10.000 SKU dosyası < 5 dakika işleme
- Eş zamanlı kullanıcı: minimum 500

### 7.2 Güvenilirlik ve Erişilebilirlik

- Uptime SLA: %99,5 (aylık)
- Planlı bakım penceresi: haftalık, 01:00–03:00 arası
- Felaket kurtarma (DR): RTO < 4 saat, RPO < 1 saat

### 7.3 Güvenlik

- Kimlik doğrulama: JWT tabanlı, token süresi 8 saat
- Oturum yönetimi: Otomatik oturum kapatma 30 dk hareketsizlik
- Şifre politikası: Minimum 8 karakter, büyük/küçük harf + rakam + özel karakter
- 2FA: CSA Admin kullanıcıları için zorunlu
- Veri şifreleme: HTTPS/TLS 1.2+ (in-transit), AES-256 (at-rest)
- Audit log: Tüm kritik işlemlerin loglanması (kim, ne, ne zaman)
- KVKK uyumu: Müşteri kişisel verisine erişim loglanır ve maskeleme uygulanır

### 7.4 Ölçeklenebilirlik

- Mikro-servis mimarisi
- Horizontal scaling desteği
- Event-driven entegrasyon (Retter üzerinden)
- CDN kullanımı (ürün görselleri)

### 7.5 Kullanılabilirlik

- Türkçe dil desteği (birincil)
- Responsive tasarım (tablet desteği)
- WCAG 2.1 AA uyumu hedefi
- Tarayıcı desteği: Chrome 90+, Firefox 88+, Edge 90+, Safari 14+

---

## 8. Açık Konular ve Kararlar

| # | Konu | Durum | Karar Vericisi |
|---|---|---|---|
| 1 | Fiyat değişikliği hangi durumlarda CSA onayı gerektirir? | Açık | Ürün + Ticaret Ekibi |
| 2 | Hakediş döneminin varsayılan sıklığı nedir? | Açık | Finans Ekibi |
| 3 | Sipariş kabul süresi kaç saat olmalı? | Açık | Operasyon Ekibi |
| 4 | Tedarikçi kategorisi dışında ürün ekleyebilir mi? | Açık | Ürün Ekibi |
| 5 | Kargo entegrasyonu hangi firmalarla API, hangileriyle manuel? | Açık | Teknik Ekip |
| 6 | Performans skoru ağırlıkları kesinleşti mi? | Açık | Operasyon Ekibi |
| 7 | Ceza mekanizması (SLA ihlali kesintisi) tanımlanacak mı? | Açık | Hukuk + Finans |
| 8 | Müşteri iletişiminde tedarikçi adı gösterilecek mi? | Açık | Pazarlama |
| 9 | Yurt dışı tedarikçi kapsamı var mı? | Açık | Strateji Ekibi |
| 10 | Ecom entegrasyonu REST mi, event-based mi? | Açık | Teknik Ekip |

---

*Bu doküman yaşayan bir belgedir. Her sprint dönemi sonunda güncellenmesi beklenmektedir.*
