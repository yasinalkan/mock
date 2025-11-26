# Kullanıcı Hikayesi: Ürün Detay Sayfası Görüntüleme - Frontend UI

## Kullanıcı Hikayesi
Bir **admin, tedarikçi veya müşteri kullanıcısı** olarak,  
**Ürün detay sayfasında ürünün tüm bilgilerini düzenli ve anlaşılır bir şekilde görüntülemek** istiyorum,  
Böylece **ürün hakkında kapsamlı bilgi edinebilir ve gerekli işlemleri gerçekleştirebilirim**,  
Bu sayede **ürün yönetimi ve karar verme süreçlerimi daha verimli hale getirebilirim**.

## Kabul Kriterleri

### AC1: Ürün Detay Sayfası Header Bölümü - Context Aware
- **Varsayılan olarak** Ürün detay sayfasındayım
- **Ne zaman** Sayfa yüklendiğinde
- **O zaman** Header bölümü şunları içerir:
  - Ürün ana görseli (büyük, yüksek kalite)
  - Ürün adı (Türkçe ve İngilizce)
  - SKU bilgisi
  - Kategori bilgisi
  - Marka bilgisi
  - Durum badge'leri (Aktif/Pasif, Onaylandı/Beklemede)
  - Breadcrumb navigasyonu
  - **Ürün tipi badge'i**: "Ana Ürün" veya "Varyant" (varsa)
  - **Arşiv durumu badge'i**: "Arşivlenmiş" (eğer arşivlenmişse)
- **Ve** Header responsive tasarıma sahiptir (mobilde dikey, desktop'ta yatay düzen)
- **Ve** Varyant ürün ise ana ürün linki gösterilir: "Ana Ürün: [Ana Ürün Adı]"
- **Ve** Arşivlenmiş ürün ise header'da uyarı stili (gri tonlar) kullanılır

### AC2: Ürün Görselleri Galerisi
- **Varsayılan olarak** Ürünün birden fazla görseli vardır
- **Ne zaman** Ürün görselleri bölümüne gelirsem
- **O zaman** Görseller şu şekilde gösterilir:
  - Ana görsel büyük format (lightbox açılabilir)
  - Thumbnail görselleri altında veya yanında grid layout
  - Görsel sayısı badge'i (örn: "5/10")
  - Görsel değiştirme ok butonları (← →)
  - Zoom/lightbox özelliği (tıklayınca büyütme)
- **Ve** Görseller lazy loading ile yüklenir (performans)
- **Ve** Görsel yoksa placeholder görsel gösterilir

### AC3: Ürün Bilgileri Sekmeleri (Tabs) - Role-Based
- **Varsayılan olarak** Ürün detay sayfasındayım
- **Ne zaman** Sayfa yüklendiğinde
- **O zaman** Sekme yapısı kullanıcı rolüne göre değişir:

  **Admin için tüm sekmeler:**
  - **Genel Bilgiler**: Ad, açıklama, kategori, marka, SKU
  - **Stok ve Fiyat**: Stok durumu, fiyat bilgileri, tüm tedarikçi fiyatları
  - **Özellikler**: Ürün özellikleri (attributes), teknik detaylar
  - **Görseller**: Ürün görselleri galerisi
  - **Varyantlar**: Ürün varyantları (varsa)
  - **Karşılaştırma**: Mevcut vs talep edilen değişiklikler
  - **Varlıklar**: Ürün dosyaları ve dokümanlar
  - **Senkronizasyon**: Dış platform senkronizasyon durumu
  - **Loglar**: Değişiklik geçmişi ve aktivite logları

  **Tedarikçi için sınırlı sekmeler:**
  - **Genel Bilgiler**: Ad, açıklama, kategori, marka, SKU (sadece görüntüleme)
  - **Stok ve Fiyat**: Sadece kendi stok ve fiyat bilgileri
  - **Özellikler**: Ürün özellikleri (düzenlenebilir)
  - **Görseller**: Ürün görselleri galerisi
  - **Karşılaştırma**: Bekleyen güncelleme talepleri karşılaştırması
  - **Loglar**: Sadece kendi yaptığı değişiklikler

- **Ve** Aktif sekme görsel olarak vurgulanır
- **Ve** Sekmeler arasında geçiş smooth animasyonla yapılır
- **Ve** Kullanıcı rolüne göre erişim yetkisi olmayan sekmeler gizlenir

### AC4: Genel Bilgiler Sekmesi
- **Varsayılan olarak** "Genel Bilgiler" sekmesindeyim
- **Ne zaman** Sekmeye tıkladığımda
- **O zaman** Şu bilgiler görüntülenir:
  - Ürün adı (TR/EN)
  - Ürün açıklaması (zengin metin formatında)
  - Kategori hiyerarşisi
  - Marka bilgisi
  - SKU kodu
  - Ürün durumu
  - Oluşturulma tarihi
  - Son güncelleme tarihi
  - SEO bilgileri (meta description, keywords)
- **Ve** Admin/tedarikçi ise düzenleme butonları görünür
- **Ve** Müşteri ise sadece görüntüleme modu aktif

### AC5: Stok ve Fiyat Bilgileri - Role-Based
- **Varsayılan olarak** "Stok ve Fiyat" sekmesindeyim
- **Ne zaman** Sekmeye tıkladığımda
- **O zaman** Bilgiler kullanıcı rolüne göre değişir:

  **Admin için:**
  - Toplam stok miktarı
  - Tüm tedarikçi bazlı stok dağılımı (tablo)
  - Minimum, maksimum, ortalama fiyat
  - Tüm tedarikçi bazlı fiyat listesi
  - Stok durumu grafiği
  - Fiyat karşılaştırma tablosu

  **Tedarikçi için:**
  - Sadece kendi stok miktarı
  - Sadece kendi fiyat bilgisi
  - Stok ve fiyat düzenleme butonları
  - Stok geçmişi (kendi değişiklikleri)

- **Ve** Stok yoksa kırmızı uyarı gösterilir
- **Ve** Fiyat bilgileri para birimi formatında gösterilir (₺)
- **Ve** Tedarikçi diğer tedarikçilerin bilgilerini göremez

### AC6: Ürün Özellikleri (Attributes) Görüntüleme
- **Varsayılan olarak** "Özellikler" sekmesindeyim
- **Ne zaman** Sekmeye tıkladığımda
- **O zaman** Ürün özellikleri şu formatta gösterilir:
  - Özellik adı ve değeri (key-value çiftleri)
  - Özellikler kategorilere göre gruplandırılmış
  - Teknik özellikler ayrı bölümde
  - Görsel özellikler (renk, boyut) vurgulanmış
  - Özellik değerleri badge veya tag formatında
- **Ve** Özellik yoksa "Özellik bilgisi bulunmamaktadır" mesajı gösterilir
- **Ve** Admin/tedarikçi ise düzenleme imkanı sunulur

### AC7: Ürün Varyantları Görüntüleme - Ana Ürün vs Varyant Ürün
- **Varsayılan olarak** Ürün detay sayfasındayım
- **Ne zaman** Sayfa yüklendiğinde
- **O zaman** Ürün tipine göre görünüm değişir:

  **Ana Ürün için:**
  - "Varyantlar" sekmesi görünür ve aktif
  - Varyantlar tablo formatında listelenir:
    - Varyant tablosu (SKU, özellikler, stok, fiyat)
    - Her varyant için ayrı detay sayfasına link
    - Varyant karşılaştırma özelliği
    - Varyant filtreleme (stok durumu, fiyat aralığı)
  - Ana ürün bilgileri üstte gösterilir
  - Varyant sayısı badge ile gösterilir
  - "Ana Ürün" badge'i header'da görünür

  **Varyant Ürün için:**
  - "Varyantlar" sekmesi gizlenir veya "Ana Ürüne Dön" butonu gösterilir
  - Ana ürün bilgisi header'da gösterilir (link ile)
  - "Bu ürün bir varyanttır" bilgi mesajı gösterilir
  - Ana ürün linkine tıklayınca ana ürün detay sayfasına yönlendirilir
  - Varyant özellikleri vurgulanmış şekilde gösterilir

- **Ve** Varyant yoksa "Bu ürünün varyantı bulunmamaktadır" mesajı gösterilir
- **Ve** Ürün tipi (ana/varyant) badge ile gösterilir


### AC9: Değişiklik Geçmişi (Logs)
- **Varsayılan olarak** "Loglar" sekmesindeyim
- **Ne zaman** Sekmeye tıkladığımda
- **O zaman** Değişiklik geçmişi şu formatta gösterilir:
  - Kronolojik sıralama (en yeni üstte)
  - Her değişiklik için: tarih, kullanıcı, işlem, detaylar
  - Değişiklik türü ikonları (oluşturma, güncelleme, silme)
  - Filtreleme seçenekleri (tarih, kullanıcı, işlem türü)
  - Sayfalama (pagination)
- **Ve** Log yoksa "Değişiklik geçmişi bulunmamaktadır" mesajı gösterilir

### AC10: Responsive Tasarım
- **Varsayılan olarak** Farklı ekran boyutlarında görüntüleme
- **Ne zaman** Sayfa mobil, tablet veya desktop'ta açılırsa
- **O zaman** Layout responsive olarak değişir:
  - Mobil: Tek sütun, dikey düzen, hamburger menü
  - Tablet: 2 sütun, orta boyutlu görseller
  - Desktop: Tam genişlik, yan panel, büyük görseller
- **Ve** Tüm içerik okunabilir ve erişilebilir
- **Ve** Butonlar dokunmatik kullanım için yeterince büyük

### AC11: Loading States ve Error Handling
- **Varsayılan olarak** Sayfa yükleniyor veya hata durumu
- **Ne zaman** Veri yüklenirken
- **O zaman** Loading skeleton veya spinner gösterilir
- **Ve** Hata durumunda:
  - Kullanıcı dostu hata mesajı
  - "Tekrar Dene" butonu
  - Geri dönüş linki
- **Ve** Ürün bulunamazsa 404 sayfası gösterilir

### AC12: Hızlı İşlemler (Quick Actions) - Role & Status Based
- **Varsayılan olarak** Ürün detay sayfasındayım (admin/tedarikçi)
- **Ne zaman** Sayfa yüklendiğinde
- **O zaman** Hızlı işlem butonları kullanıcı rolüne ve ürün durumuna göre değişir:

  **Admin için (Aktif Ürün):**
  - Düzenle butonu
  - Kopyala butonu (yeni ürün oluştur)
  - Arşivle butonu
  - Sil butonu (onay modalı ile)
  - Dışa Aktar butonu
  - Onayla/Reddet butonları (bekleyen talep varsa)

  **Admin için (Arşivlenmiş Ürün):**
  - Geri Al butonu (arşivden çıkar)
  - Kopyala butonu
  - Sil butonu (kalıcı silme)
  - Dışa Aktar butonu
  - "Arşivlenmiş" badge'i görünür
  - Düzenle butonu gizlenir veya devre dışı

  **Tedarikçi için (Aktif Ürün):**
  - Düzenle butonu (güncelleme talebi oluşturur)
  - Görselleri Yönet butonu
  - Özellikleri Güncelle butonu
  - "Güncelleme Talebi Gönder" butonu
  - Arşivle butonu (sadece kendi ürünleri için)

  **Tedarikçi için (Arşivlenmiş Ürün):**
  - Geri Al butonu (arşivden çıkar)
  - "Arşivlenmiş" badge'i görünür
  - Düzenle butonları devre dışı

- **Ve** Butonlar kullanıcı rolüne göre gösterilir/gizlenir
- **Ve** Arşivlenmiş ürünlerde uyarı mesajı gösterilir: "Bu ürün arşivlenmiştir"
- **Ve** Arşivlenmiş ürünlerde bazı sekmeler devre dışı olabilir

### AC13: Breadcrumb Navigasyonu
- **Varsayılan olarak** Ürün detay sayfasındayım
- **Ne zaman** Sayfa yüklendiğinde
- **O zaman** Breadcrumb şu formatta gösterilir:
  - Ana Sayfa > Ürünler > [Kategori] > [Ürün Adı]
  - Her seviye tıklanabilir link
  - Son seviye aktif (tıklanamaz)
- **Ve** Breadcrumb responsive (mobilde kısaltılmış)

### AC14: SEO ve Meta Bilgileri
- **Varsayılan olarak** Ürün detay sayfası açıldığında
- **Ne zaman** Sayfa yüklendiğinde
- **O zaman** Meta tag'ler dinamik olarak ayarlanır:
  - `<title>`: Ürün adı - Site Adı
  - `<meta name="description">`: Ürün açıklaması
  - `<meta property="og:title">`: Ürün adı
  - `<meta property="og:image">`: Ürün görseli
  - `<meta property="og:description">`: Ürün açıklaması
- **Ve** Structured data (JSON-LD) eklenir (Schema.org Product)

## Teknik Gereksinimler

### TR1: Component Yapısı
```
ProductDetailPage/
├── ProductDetailHeader.tsx       # Header bölümü (görsel, ad, badge'ler)
├── ProductImageGallery.tsx       # Görsel galerisi
├── ProductTabs.tsx               # Sekme navigasyonu
├── ProductGeneralTab.tsx         # Genel bilgiler sekmesi
├── ProductStockPriceTab.tsx      # Stok ve fiyat sekmesi
├── ProductAttributesTab.tsx      # Özellikler sekmesi
├── ProductVariantsTab.tsx        # Varyantlar sekmesi
├── ProductComparisonTab.tsx      # Karşılaştırma sekmesi
├── ProductLogsTab.tsx            # Loglar sekmesi
├── ProductQuickActions.tsx       # Hızlı işlemler
├── Breadcrumb.tsx                # Breadcrumb navigasyon
└── hooks/
    ├── useProductDetail.ts       # Ürün detay verisi
    ├── useProductImages.ts       # Görsel yönetimi
    └── useProductTabs.ts         # Sekme yönetimi
```

### TR2: API Entegrasyonu
**Kullanılacak Endpoint'ler:**
- `GET /api/products/{productId}` - Ürün detay bilgileri
- `GET /api/products/{productId}/images` - Ürün görselleri
- `GET /api/products/{productId}/variants` - Ürün varyantları
- `GET /api/products/{productId}/logs` - Değişiklik geçmişi
- `GET /api/products/{productId}/suppliers` - Tedarikçi bilgileri

**Örnek API Call:**
```typescript
// Ürün detay bilgileri
const fetchProductDetail = async (productId: number) => {
  const response = await fetch(`/api/products/${productId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error('Ürün bulunamadı');
  }
  
  return response.json();
};
```

### TR3: State Management
```typescript
interface ProductDetailState {
  product: Product | null;
  images: ProductImage[];
  variants: ProductVariant[];
  logs: ChangeLog[];
  activeTab: string;
  loading: boolean;
  error: string | null;
  userRole: 'admin' | 'supplier' | 'customer';
  isArchived: boolean;
  productType: 'main' | 'variant';
  mainProduct: Product | null; // Varyant ürün için ana ürün bilgisi
}

interface Product {
  id: number;
  name: { tr: string; en: string };
  sku: string;
  categoryId: number;
  brandId: number;
  description: { tr: string; en: string };
  status: 'active' | 'inactive' | 'pending';
  images: ProductImage[];
  attributes: Record<string, AttributeValue>;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
  mainProductId?: number; // Varyant ürün için ana ürün ID
  productType: 'main' | 'variant';
  supplierId?: number; // Tedarikçi ID (tedarikçi ürünü ise)
}
```

### TR4: Routing
```typescript
// Route yapısı
/products/detail/:productId
/products/detail/:productId/:tabName

// Örnek kullanım
navigateTo(`/products/detail/${productId}`);
navigateTo(`/products/detail/${productId}/attributes`);
```

### TR5: Image Gallery Kütüphaneleri
- **react-image-gallery**: Görsel galerisi için
- **react-lightbox**: Lightbox/zoom özelliği için
- Alternatif: **swiper** (modern slider)

### TR6: Tab Management - Role & Context Based
```typescript
// Tab tanımlamaları
const allTabs = [
  { id: 'general', label: 'Genel Bilgiler', icon: 'info', roles: ['admin', 'supplier', 'customer'] },
  { id: 'stock-price', label: 'Stok ve Fiyat', icon: 'box', roles: ['admin', 'supplier'] },
  { id: 'attributes', label: 'Özellikler', icon: 'list', roles: ['admin', 'supplier', 'customer'] },
  { id: 'images', label: 'Görseller', icon: 'image', roles: ['admin', 'supplier', 'customer'] },
  { id: 'variants', label: 'Varyantlar', icon: 'layers', roles: ['admin'], showOnlyForMainProduct: true },
  { id: 'comparison', label: 'Karşılaştırma', icon: 'compare', roles: ['admin', 'supplier'] },
  { id: 'assets', label: 'Varlıklar', icon: 'file', roles: ['admin'] },
  { id: 'sync', label: 'Senkronizasyon', icon: 'sync', roles: ['admin'] },
  { id: 'logs', label: 'Loglar', icon: 'history', roles: ['admin', 'supplier'] }
];

// Filtrelenmiş tablar (role ve context'e göre)
const getVisibleTabs = (userRole: string, productType: 'main' | 'variant', isArchived: boolean) => {
  return allTabs.filter(tab => {
    // Role kontrolü
    if (!tab.roles.includes(userRole)) return false;
    
    // Ana ürün kontrolü (varyantlar sekmesi)
    if (tab.showOnlyForMainProduct && productType !== 'main') return false;
    
    // Arşivlenmiş ürün kontrolü (bazı sekmeler devre dışı)
    if (isArchived && ['sync', 'assets'].includes(tab.id)) return false;
    
    return true;
  });
};

const [activeTab, setActiveTab] = useState('general');
const visibleTabs = getVisibleTabs(userRole, productType, isArchived);
```

### TR7: Lazy Loading ve Performance




## Kullanıcı Senaryoları

### Senaryo 1: Admin Ürün Detayını Görüntüleme
1. Admin ürün listesinden bir ürün seçer
2. Ürün detay sayfası açılır
3. Header'da ürün görseli, adı, SKU ve durum badge'leri görünür
4. "Genel Bilgiler" sekmesi varsayılan olarak açıktır
5. Admin ürün bilgilerini görüntüler
6. "Görseller" sekmesine tıklar
7. Ürün görselleri galeride gösterilir
8. Bir görsele tıklayınca lightbox açılır
9. "Loglar" sekmesine tıklar
10. Değişiklik geçmişi kronolojik sırada görüntülenir

### Senaryo 2: Tedarikçi Kendi Ürününü Görüntüleme
1. Tedarikçi "Ürünlerim" sayfasından bir ürün seçer
2. Ürün detay sayfası açılır
3. Tedarikçi sadece kendi ürünlerini görebilir (yetki kontrolü)
4. Sadece tedarikçi için görünür sekmeler gösterilir (Varyantlar, Varlıklar, Senkronizasyon gizli)
5. "Stok ve Fiyat" sekmesine tıklar
6. Sadece kendi stok ve fiyat bilgilerini görür (diğer tedarikçilerin bilgileri gizli)
7. "Karşılaştırma" sekmesine tıklar
8. Bekleyen güncelleme talebi varsa karşılaştırma görünür
9. Talep yoksa bilgi mesajı gösterilir

### Senaryo 2a: Tedarikçi Arşivlenmiş Ürünü Görüntüleme
1. Tedarikçi arşivlenmiş bir ürünü seçer
2. Ürün detay sayfası açılır
3. Header'da "Arşivlenmiş" badge'i görünür
4. Hızlı işlemlerde "Geri Al" butonu görünür, "Düzenle" butonu devre dışı
5. Bazı sekmeler devre dışı veya sınırlı içerik gösterir
6. Uyarı mesajı: "Bu ürün arşivlenmiştir"

### Senaryo 3: Mobil Cihazda Ürün Detayı Görüntüleme
1. Kullanıcı mobil cihazdan ürün detay sayfasını açar
2. Layout responsive olarak dikey düzene geçer
3. Görseller mobil için optimize edilmiş boyutta gösterilir
4. Sekmeler mobil menüde gösterilir
5. Tüm içerik okunabilir ve erişilebilir
6. Butonlar dokunmatik kullanım için yeterince büyük

### Senaryo 4: Ürün Bulunamadı Durumu
1. Kullanıcı geçersiz bir ürün ID'si ile sayfaya erişmeye çalışır
2. API 404 hatası döner
3. Error boundary devreye girer
4. "Ürün bulunamadı" mesajı gösterilir
5. "Ürünlere Dön" butonu görünür
6. Kullanıcı butona tıklayarak ürün listesine döner

### Senaryo 5: Yavaş İnternet Bağlantısında Yükleme
1. Kullanıcı yavaş internet bağlantısı ile sayfayı açar
2. Loading skeleton gösterilir
3. Görseller lazy loading ile yüklenir
4. İçerik kademeli olarak görünür
5. Kullanıcı deneyimi bozulmaz

### Senaryo 6: Ana Ürün vs Varyant Ürün Görüntüleme
1. Admin bir ana ürünün detay sayfasını açar
2. Header'da "Ana Ürün" badge'i görünür
3. "Varyantlar" sekmesi görünür ve aktif
4. Tüm varyantlar tablo formatında listelenir
5. Her varyant için SKU, özellikler, stok ve fiyat bilgileri görünür
6. Bir varyanta tıklayınca o varyantın detay sayfası açılır
7. Varyant detay sayfasında:
   - "Varyant" badge'i görünür
   - "Ana Ürün: [Ana Ürün Adı]" linki header'da görünür
   - "Varyantlar" sekmesi gizlenir veya "Ana Ürüne Dön" butonu gösterilir
   - Ana ürün linkine tıklayınca ana ürün detay sayfasına dönülür

### Senaryo 7: Arşivlenmiş Ürün Görüntüleme (Admin)
1. Admin arşivlenmiş bir ürünü seçer
2. Ürün detay sayfası açılır
3. Header'da "Arşivlenmiş" badge'i görünür (gri tonlar)
4. Hızlı işlemlerde:
   - "Geri Al" butonu görünür (arşivden çıkar)
   - "Düzenle" butonu gizlenir veya devre dışı
   - "Sil" butonu görünür (kalıcı silme)
5. Bazı sekmeler devre dışı (Senkronizasyon, Varlıklar)
6. Uyarı mesajı: "Bu ürün arşivlenmiştir. Geri almak için 'Geri Al' butonunu kullanın."
7. Tüm bilgiler görüntülenebilir ancak düzenleme yapılamaz

## Kapsam Dışı

### Bu Story Kapsamında YAPILMAYACAK:
- Ürün düzenleme özellikleri (ayrı story)
- Ürün silme işlemi (ayrı story)
- Ürün görsel yükleme (ayrı story)
- Ürün varyant oluşturma (ayrı story)
- Ürün karşılaştırma özelliği (ayrı story)
- Ürün yorumları ve değerlendirmeleri (ayrı story)
- Ürün paylaşım özellikleri (ayrı story)
- Ürün favorilere ekleme (ayrı story)
- Ürün satın alma işlemi (ayrı story)
- Ürün raporlama ve analytics (ayrı story)

### Gelecek Story'lerde Yapılabilir:
- Ürün düzenleme formu
- Ürün görsel yönetimi
- Ürün varyant yönetimi
- Ürün karşılaştırma özelliği
- Ürün yorumları ve değerlendirmeleri
- Ürün paylaşım özellikleri
- Ürün favorilere ekleme
- Ürün satın alma entegrasyonu

## Test Senaryoları

### Fonksiyonel Testler
1. ✅ Ürün detay sayfası başarıyla yükleniyor
2. ✅ Tüm sekmeler doğru içerik gösteriyor
3. ✅ Görsel galerisi çalışıyor
4. ✅ Lightbox özelliği çalışıyor
5. ✅ Breadcrumb navigasyonu çalışıyor
6. ✅ Hızlı işlem butonları görünüyor/gizleniyor (role göre)
7. ✅ Ürün bulunamadı durumu doğru handle ediliyor
8. ✅ Loading states doğru gösteriliyor
9. ✅ Error handling çalışıyor
10. ✅ Responsive tasarım çalışıyor
11. ✅ **Role-based rendering**: Admin ve tedarikçi için farklı sekmeler gösteriliyor
12. ✅ **Tedarikçi görünümü**: Sadece kendi bilgileri görünüyor, diğer tedarikçilerin bilgileri gizli
13. ✅ **Ana ürün görünümü**: "Varyantlar" sekmesi görünüyor, varyant listesi doğru
14. ✅ **Varyant ürün görünümü**: "Varyantlar" sekmesi gizli, ana ürün linki görünüyor
15. ✅ **Arşivlenmiş ürün görünümü**: "Arşivlenmiş" badge'i görünüyor, düzenleme butonları devre dışı
16. ✅ **Arşivlenmemiş ürün görünümü**: Normal görünüm, tüm butonlar aktif
17. ✅ **Varyant → Ana ürün navigasyonu**: Link çalışıyor, geçiş smooth
18. ✅ **Arşiv durumu kontrolü**: Arşivlenmiş ürünlerde uyarı mesajı gösteriliyor
19. ✅ **Sekme filtreleme**: Role ve ürün tipine göre sekmeler doğru filtreleniyor
20. ✅ **Yetki kontrolü**: Tedarikçi sadece kendi ürünlerini görebiliyor

### UI/UX Testler
1. ✅ Tüm içerik okunabilir
2. ✅ Renk kontrastı yeterli
3. ✅ Animasyonlar smooth
4. ✅ Butonlar erişilebilir
5. ✅ Görseller optimize edilmiş
6. ✅ Sekme geçişleri smooth
7. ✅ Mobil deneyim kullanışlı

### Accessibility Testler
1. ✅ Keyboard navigation çalışıyor
2. ✅ Screen reader uyumlu
3. ✅ ARIA labels mevcut
4. ✅ Focus management doğru
5. ✅ Color contrast yeterli
6. ✅ Alt text tüm görsellerde

### Performance Testler
1. ✅ Sayfa 2 saniyede yükleniyor
2. ✅ Görseller lazy loading ile yükleniyor
3. ✅ Virtual scrolling loglar için çalışıyor
4. ✅ Memory leak yok
5. ✅ Bundle size optimize edilmiş

### SEO Testler
1. ✅ Meta tags doğru ayarlanmış
2. ✅ Structured data (JSON-LD) mevcut
3. ✅ Open Graph tags mevcut
4. ✅ Title tag dinamik
5. ✅ Canonical URL doğru

## Definition of Done (DoD)

✅ Tüm kabul kriterleri karşılanmış  
✅ Tüm test senaryoları geçiyor  
✅ Responsive tasarım çalışıyor (desktop, tablet, mobile)  
✅ Accessibility standartlarına uygun  
✅ Code review tamamlanmış  
✅ Backend API'ler entegre edilmiş  
✅ Error handling tamamlanmış  
✅ Loading states eklenmiş  
✅ SEO optimizasyonu yapılmış  
✅ Performance optimizasyonu yapılmış  
✅ Component documentation yazılmış  
✅ Staging'de test edilmiş  
✅ Cross-browser test edilmiş (Chrome, Firefox, Safari, Edge)  
✅ Lighthouse score 90+ (Performance, Accessibility, SEO)


## Özel Durumlar ve Görünüm Farklılıkları

### 1. Tedarikçi vs Admin Görünümleri

**Tedarikçi Görünümü:**
- Sınırlı sekme erişimi (Varyantlar, Varlıklar, Senkronizasyon gizli)
- Sadece kendi stok ve fiyat bilgileri görünür
- Düzenleme işlemleri güncelleme talebi oluşturur (direkt güncelleme yok)
- Sadece kendi yaptığı değişikliklerin logları görünür
- Hızlı işlemlerde sınırlı butonlar (Sil butonu yok, Arşivle sadece kendi ürünleri için)

**Admin Görünümü:**
- Tüm sekmelere erişim
- Tüm tedarikçilerin stok ve fiyat bilgileri görünür
- Direkt düzenleme yapabilir
- Tüm değişiklik logları görünür
- Tüm hızlı işlem butonları aktif
- Onay/Red butonları görünür (bekleyen talepler için)

### 2. Varyant Ürün vs Ana Ürün Görünümleri

**Ana Ürün Görünümü:**
- "Ana Ürün" badge'i header'da
- "Varyantlar" sekmesi görünür ve aktif
- Varyant listesi tablo formatında
- Varyant istatistikleri (toplam varyant, aktif varyant, stok durumu)
- Varyant karşılaştırma özelliği

**Varyant Ürün Görünümü:**
- "Varyant" badge'i header'da
- "Ana Ürün: [Ana Ürün Adı]" linki header'da (tıklanabilir)
- "Varyantlar" sekmesi gizlenir veya "Ana Ürüne Dön" butonu gösterilir
- Varyant özellikleri vurgulanmış şekilde gösterilir
- Ana ürün bilgileri üstte referans olarak gösterilir
- Ana ürün linkine tıklayınca ana ürün detay sayfasına yönlendirilir

### 3. Arşivlenmiş Ürün vs Arşivlenmemiş Ürün Görünümleri

**Arşivlenmiş Ürün Görünümü:**
- "Arşivlenmiş" badge'i header'da (gri tonlar)
- Header'da uyarı stili (gri tonlar, soluk görünüm)
- Hızlı işlemlerde:
  - "Geri Al" butonu görünür (arşivden çıkar)
  - "Düzenle" butonu gizlenir veya devre dışı
  - "Sil" butonu görünür (kalıcı silme)
- Bazı sekmeler devre dışı:
  - Senkronizasyon sekmesi gizlenir
  - Varlıklar sekmesi gizlenir veya sadece görüntüleme
- Uyarı mesajı: "Bu ürün arşivlenmiştir"
- Tüm bilgiler görüntülenebilir ancak düzenleme yapılamaz
- Breadcrumb'da "Arşivlenmiş Ürünler" linki gösterilir

**Arşivlenmemiş Ürün Görünümü:**
- Normal görünüm (renkli badge'ler, aktif butonlar)
- Tüm sekmeler aktif
- Tüm hızlı işlem butonları aktif
- Düzenleme yapılabilir

## Bağımlılıklar
- Backend API endpoint'leri hazır olmalı
- Ürün modeli ve veri yapısı tanımlı olmalı (productType, isArchived, mainProductId alanları)
- Authentication sistemi çalışıyor olmalı
- Image storage/CDN hazır olmalı
- Role-based access control (RBAC) çalışıyor olmalı
- Ürün tipi (ana/varyant) ve arşiv durumu bilgisi API'den gelmeli

## Notlar
- Lazy loading görseller için kritik (performans)
- SEO optimizasyonu e-ticaret için önemli
- Error boundaries tüm sayfada kullanılmalı
- Loading states her durumda gösterilmeli
- Accessibility en baştan düşünülmeli
- Meta tags dinamik olarak güncellenmeli
- Structured data Schema.org standartlarına uygun olmalı
- Breadcrumb navigasyonu UX için önemli
- Tab management URL'de saklanmalı (shareable links)
- **Role-based rendering**: Component'ler kullanıcı rolüne göre farklı içerik göstermeli
- **Context-aware UI**: Ürün tipi (ana/varyant) ve arşiv durumu UI'ı etkilemeli
- **Conditional rendering**: Sekmeler, butonlar ve içerikler duruma göre gösterilmeli/gizlenmeli
- **Permission checks**: Her işlem öncesi yetki kontrolü yapılmalı
- **Visual indicators**: Badge'ler ve renk kodlamaları durumu net şekilde göstermeli
- **Navigation flow**: Varyant ürün → Ana ürün geçişi smooth olmalı
- **Archive state**: Arşivlenmiş ürünlerde düzenleme işlemleri engellenmeli
