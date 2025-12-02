# Kullanıcı Hikayesi: Ürün Görsel Yönetimi - Frontend UI

## Kullanıcı Hikayesi
Bir **admin veya tedarikçi kullanıcısı** olarak,  
**Ürün oluşturma ve düzenleme ekranlarında görselleri kolayca yüklemek, silmek ve düzenlemek** istiyorum,  
Böylece **ürünlerime ait görselleri hızlı ve kolay bir şekilde yönetebilirim**,  
Bu sayede **müşterilerime ürünlerimi görsel olarak daha iyi tanıtabilirim**.

## Kabul Kriterleri

### AC1: Görsel Yükleme Alanı (Upload Zone)
- **Varsayılan olarak** Ürün oluşturma/düzenleme sayfasındayım
- **Ne zaman** "Görseller" bölümünü görürsem
- **O zaman** Görsel yükleme alanı şunları içerir:
  - Büyük, belirgin bir yükleme kutusu
  - "Görselleri buraya sürükleyin veya tıklayarak seçin" metni
  - Görsel ikonu
  - Desteklenen formatlar bilgisi (JPG, PNG, WebP, GIF)
  - Maksimum dosya boyutu bilgisi (10MB)
  - Maksimum görsel sayısı bilgisi (10 adet)
- **Ve** Alan hem tıklama hem de sürükle-bırak (drag & drop) yöntemini destekler

### AC2: Dosya Seçimi - Tıklama Yöntemi
- **Varsayılan olarak** Görsel yükleme alanındayım
- **Ne zaman** Yükleme kutusuna tıklarsam
- **O zaman** Dosya tarayıcısı açılır
- **Ve** Sadece görsel dosyaları gösterir (filtre uygulanmış)
- **Ve** Çoklu dosya seçimine izin verir
- **Ne zaman** Dosyaları seçip "Aç" butonuna tıklarsam
- **O zaman** Seçili dosyalar yükleme için kuyruğa eklenir

### AC3: Dosya Seçimi - Sürükle Bırak Yöntemi
- **Varsayılan olarak** Görsel yükleme alanı görünür durumda
- **Ne zaman** Dosyaları yükleme alanına sürüklerim
- **O zaman** Alan görsel olarak vurgulanır (highlight)
- **Ve** "Dosyaları buraya bırakın" mesajı görünür
- **Ne zaman** Dosyaları bırakırsam
- **O zaman** Dosyalar yükleme için kuyruğa eklenir
- **Ve** Alan normal haline döner

### AC4: Görsel Önizleme ve Yükleme Durumu
- **Varsayılan olarak** Bir veya daha fazla dosya seçilmiştir
- **Ne zaman** Yükleme başladığında
- **O zaman** Her görsel için önizleme kartı gösterilir:
  - Küçük görsel önizlemesi (thumbnail)
  - Dosya adı
  - Dosya boyutu
  - Yükleme progress bar
  - Yükleme yüzdesi (0-100%)
  - İptal butonu (yükleme devam ederken)
- **Ve** Yükleme tamamlandığında:
  - Yeşil onay işareti gösterilir
  - Progress bar kaybolur
  - Düzenleme/silme butonları aktif olur

### AC5: Yüklü Görsellerin Görüntülenmesi
- **Varsayılan olarak** Ürünün görselleri yüklenmiştir
- **Ne zaman** Ürün düzenleme sayfasını açarsam
- **O zaman** Tüm görseller grid layout'ta gösterilir
- **Ve** Her görsel kartı şunları içerir:
  - Görsel önizlemesi (orta boy)
  - Görsel sırası numarası
  - Ana görsel badge'i (ilk görselde "Ana Görsel" etiketi)
  - Silme butonu (çöp kutusu ikonu)
  - Sürükleme handle (altı nokta ikonu)
- **Ve** Görseller sıralamalarına göre (order_index) dizilir

### AC6: Ana Görsel Belirleme
- **Varsayılan olarak** Ürünün birden fazla görseli vardır
- **Ne zaman** Bir görsel kartına tıklarsam
- **O zaman** O görsel detay modali açılır veya vurgulanır
- **Ve** "Ana Görsel Yap" butonu görünür
- **Ne zaman** "Ana Görsel Yap" butonuna tıklarsam
- **O zaman** Seçili görsel ilk sıraya taşınır
- **Ve** "Ana Görsel" badge'i yeni görsele eklenir
- **Ve** Önceki ana görselden badge kaldırılır
- **Ve** Başarı mesajı gösterilir: "Ana görsel güncellendi"

### AC7: Görsel Silme
- **Varsayılan olarak** En az bir görsel mevcuttur
- **Ne zaman** Bir görselin silme butonuna tıklarsam
- **O zaman** Onay modalı açılır:
  - "Bu görseli silmek istediğinizden emin misiniz?"
  - "İptal" butonu
  - "Sil" butonu (kırmızı)
- **Ne zaman** "Sil" butonuna tıklarsam
- **O zaman** Görsel silinir
- **Ve** Görsel kartı animasyonla kaybolur
- **Ve** Kalan görseller yeniden düzenlenir
- **Ve** Başarı mesajı gösterilir: "Görsel silindi"
- **Ve** Ana görsel silinirse, bir sonraki görsel otomatik olarak ana görsel olur

### AC8: Görsel Sıralama - Drag & Drop
- **Varsayılan olarak** Birden fazla görsel mevcuttur
- **Ne zaman** Bir görseli sürükle-bırak handle'ından tutup sürüklerim
- **O zaman** Görsel kartı görsel olarak "tutulmuş" duruma geçer
- **Ve** Diğer görseller arasında yer açılır (placeholder)
- **Ve** Sürüklerken mevcut pozisyon gerçek zamanlı güncellenir
- **Ne zaman** Görseli yeni pozisyona bırakırsam
- **O zaman** Görsel yeni pozisyona yerleşir
- **Ve** Diğer görseller kaydırılır
- **Ve** Sıralama backend'e kaydedilir
- **Ve** Başarı mesajı gösterilir (opsiyonel, sessiz güncelleme)

### AC9: Hata Yönetimi - Geçersiz Dosya Formatı
- **Varsayılan olarak** Dosya seçme işlemindeyim
- **Ne zaman** Desteklenmeyen formatta bir dosya (örn: PDF, DOC) seçersem
- **O zaman** Hata mesajı gösterilir:
  - Kırmızı renkli bildirim
  - "Geçersiz dosya formatı: document.pdf"
  - "Desteklenen formatlar: JPG, PNG, WebP, GIF"
  - Dosya yüklenmez
- **Ve** Diğer geçerli dosyalar normal şekilde yüklenir

### AC10: Hata Yönetimi - Dosya Boyutu Aşımı
- **Varsayılan olarak** Büyük bir dosya seçilmiştir (>10MB)
- **Ne zaman** Dosya doğrulama yapılırsa
- **O zaman** Hata mesajı gösterilir:
  - "Dosya çok büyük: image.jpg (15MB)"
  - "Maksimum dosya boyutu: 10MB"
  - Dosya yüklenmez
- **Ve** Kullanıcıya dosyayı küçültmesi önerilir

### AC11: Hata Yönetimi - Maksimum Görsel Sayısı
- **Varsayılan olarak** Ürünün 10 görseli vardır (maksimum)
- **Ne zaman** Yeni görsel eklemeye çalışırsam
- **O zaman** Yükleme alanı devre dışı bırakılır
- **Ve** Uyarı mesajı gösterilir:
  - "Maksimum görsel sayısına ulaştınız (10/10)"
  - "Yeni görsel eklemek için mevcut görselleri silin"
- **Ve** Yükleme alanı soluk/disabled görünür

### AC12: Yükleme İptali
- **Varsayılan olarak** Bir veya daha fazla görsel yüklenmektedir
- **Ne zaman** Progress bar gösterilirken iptal butonuna tıklarsam
- **O zaman** Yükleme işlemi durdurulur
- **Ve** Görsel kartı kaldırılır
- **Ve** Backend'e gönderilen istek iptal edilir (HTTP abort)
- **Ve** Bilgi mesajı gösterilir: "Yükleme iptal edildi"

### AC13: Responsive Tasarım
- **Varsayılan olarak** Farklı ekran boyutlarında görüntüleme
- **Ne zaman** Sayfa mobil cihazda açılırsa
- **O zaman** Görsel grid düzeni responsive olarak değişir:
  - Desktop: 4 sütun
  - Tablet: 3 sütun
  - Mobil: 2 sütun
- **Ve** Tüm butonlar dokunmatik kullanım için yeterince büyük
- **Ve** Drag & drop mobilde alternatif yöntemle değiştirilir (yukarı/aşağı ok butonları)

### AC14: Loading States ve Feedback
- **Varsayılan olarak** Kullanıcı bir işlem başlatmıştır
- **Ne zaman** Backend isteği devam ederken
- **O zaman** Uygun loading indicator gösterilir:
  - Yükleme: Progress bar
  - Silme: Spinner ve disabled buton
  - Sıralama: Fade animasyon
- **Ve** İşlem başarılı olduğunda başarı feedback'i verilir
- **Ve** İşlem başarısız olduğunda hata mesajı gösterilir

## Teknik Gereksinimler

### TR1: Component Yapısı
```
ImageManager/
├── ImageUploadZone.tsx          # Ana yükleme alanı
├── ImagePreviewCard.tsx         # Tek görsel kartı
├── ImageGrid.tsx                # Görsel grid layout
├── ImageUploadProgress.tsx      # Progress bar component
├── ImageDeleteModal.tsx         # Silme onay modalı
├── ImageDetailModal.tsx         # Görsel detay modal (opsiyonel)
└── hooks/
    ├── useImageUpload.ts        # Görsel yükleme logic
    ├── useImageDelete.ts        # Görsel silme logic
    └── useImageReorder.ts       # Sıralama logic
```

### TR2: API Entegrasyonu
**Kullanılacak Endpoint'ler:**
- `POST /api/products/{productId}/images` - Görsel yükleme
- `DELETE /api/products/{productId}/images/{imageId}` - Görsel silme
- `GET /api/products/{productId}/images` - Görselleri listele
- `PATCH /api/products/{productId}/images/reorder` - Sıralama

**Örnek API Call:**
```typescript
// Görsel yükleme
const uploadImage = async (productId: number, files: File[]) => {
  const formData = new FormData();
  files.forEach(file => formData.append('images', file));
  
  const response = await fetch(`/api/products/${productId}/images`, {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
};
```

### TR3: State Management
```typescript
interface ImageState {
  images: ProductImage[];
  uploading: boolean;
  uploadProgress: Record<string, number>;
  errors: string[];
}

interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  thumbnail_url: string;
  order_index: number;
  is_primary: boolean;
  file_size: number;
  created_at: string;
}
```

### TR4: Drag & Drop Kütüphanesi
- **react-beautiful-dnd**: Görsel sıralama için
- **react-dropzone**: Dosya yükleme alanı için
- Alternatif: **dnd-kit** (modern, daha hafif)

### TR5: Dosya Validasyonu (Frontend)
```typescript
const validateFile = (file: File): ValidationResult => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Geçersiz dosya formatı' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'Dosya çok büyük (max 10MB)' };
  }
  
  return { valid: true };
};
```

### TR6: Progress Tracking
```typescript
const uploadWithProgress = async (file: File, onProgress: (progress: number) => void) => {
  const xhr = new XMLHttpRequest();
  
  xhr.upload.addEventListener('progress', (e) => {
    if (e.lengthComputable) {
      const progress = (e.loaded / e.total) * 100;
      onProgress(progress);
    }
  });
  
  // ... upload implementation
};
```

### TR7: Styling & UI Framework
- **Tailwind CSS**: Modern utility-first styling
- **shadcn/ui**: Pre-built accessible components
- **Lucide Icons**: Modern icon set
- **Framer Motion**: Smooth animations

### TR8: Accessibility (A11y)
- Drag & drop için keyboard alternatifi (Tab + Arrow keys)
- ARIA labels tüm butonlarda
- Screen reader desteği
- Focus management (modal açılırken)
- Color contrast WCAG AA standartlarına uygun

## Kullanıcı Senaryoları

### Senaryo 1: Yeni Ürüne İlk Görsel Ekleme
1. Admin yeni ürün oluşturma sayfasını açar
2. "Görseller" bölümüne gelir
3. Bilgisayarından 3 ürün fotoğrafı seçer
4. Dosyaları sürükleyip yükleme alanına bırakır
5. Her görsel için progress bar görünür (0% → 100%)
6. Görseller başarıyla yüklenir
7. İlk görsel otomatik olarak ana görsel olarak işaretlenir
8. Görseller grid'de sıralı şekilde görüntülenir
9. Admin ürünü kaydeder

### Senaryo 2: Mevcut Ürünün Görsellerini Düzenleme
1. Tedarikçi ürün listesinden bir ürün seçer
2. Düzenle butonuna tıklar
3. Sayfa açılır, ürünün 5 görseli görünür
4. 3. görseli ana görsel yapmak ister
5. 3. görsele tıklar ve "Ana Görsel Yap" butonuna tıklar
6. Görsel ilk sıraya taşınır, "Ana Görsel" badge'i eklenir
7. Değişiklik backend'e kaydedilir
8. Başarı mesajı gösterilir

### Senaryo 3: Görsel Sıralama ve Silme
1. Admin ürün düzenleme sayfasında
2. Ürünün 8 görseli var
3. 5. görseli tutup 2. sıraya taşır (drag & drop)
4. Görseller yeniden sıralanır
5. Admin 7. görseli silmek ister
6. Silme butonuna tıklar
7. Onay modalı açılır
8. "Sil" butonuna tıklar
9. Görsel silinir ve grid güncellenir
10. Kalan 7 görsel yeniden düzenlenir

### Senaryo 4: Maksimum Görsel Sayısına Ulaşma
1. Tedarikçi ürün düzenliyor
2. Ürünün zaten 10 görseli var (maksimum)
3. Yeni görsel eklemeye çalışır
4. Yükleme alanı devre dışı durumda
5. Uyarı mesajı görünür: "Maksimum görsel sayısına ulaştınız"
6. Tedarikçi bir görseli siler
7. Yükleme alanı tekrar aktif olur
8. Yeni görsel ekleyebilir

### Senaryo 5: Hata Durumu - Geçersiz Dosya
1. Admin görsel yüklemek ister
2. Yanlışlıkla bir PDF dosyası seçer
3. Dosya yüklemeye çalışılır
4. Hata mesajı görünür: "Geçersiz dosya formatı: document.pdf"
5. Dosya yüklenmez
6. Admin doğru formatta görsel seçer
7. Bu sefer başarıyla yüklenir

### Senaryo 6: Mobil Cihazda Görsel Yönetimi
1. Tedarikçi mobil telefondan giriş yapar
2. Ürün düzenleme sayfasını açar
3. Görseller 2 sütunlu grid'de görünür
4. Drag & drop yerine yukarı/aşağı ok butonlarını görür
5. Bir görseli yukarı taşımak için ↑ butonuna tıklar
6. Görsel bir sıra yukarı çıkar
7. Silme butonu dokunmatik kullanım için yeterince büyük
8. Tüm işlemler mobilde sorunsuz çalışır

## Kapsam Dışı

### Bu Story Kapsamında YAPILMAYACAK:
- Görsel düzenleme (crop, rotate, filter, brightness)
- Görsel zoom/lightbox özelliği
- Görsel efektleri (blur, sepia, etc.)
- Toplu görsel yükleme (ZIP dosyası)
- URL'den görsel import
- Görsel optimize etme önerileri
- AI destekli görsel etiketleme
- Görsel SEO önerileri (alt text önerme)
- Görsel karşılaştırma (A/B testing)
- Görsel raporlama (hangi görsel daha çok görüntüleniyor)

### Gelecek Story'lerde Yapılabilir:
- Görsel crop ve basic editing
- Lightbox/zoom özelliği
- Bulk görsel import (ZIP)
- AI alt text önerisi
- Görsel performans analytics

## Test Senaryoları

### Fonksiyonel Testler
1. ✅ Tek görsel yükleme başarılı
2. ✅ Çoklu görsel yükleme başarılı
3. ✅ Drag & drop ile yükleme başarılı
4. ✅ Görsel silme başarılı
5. ✅ Ana görsel değiştirme başarılı
6. ✅ Görsel sıralama başarılı
7. ✅ Geçersiz format reddediliyor
8. ✅ Büyük dosya reddediliyor
9. ✅ Maksimum görsel sayısı kontrolü çalışıyor
10. ✅ Yükleme iptali çalışıyor

### UI/UX Testler
1. ✅ Progress bar doğru çalışıyor
2. ✅ Hata mesajları görünüyor
3. ✅ Başarı mesajları görünüyor
4. ✅ Loading states doğru
5. ✅ Animasyonlar smooth
6. ✅ Responsive tasarım çalışıyor
7. ✅ Dark mode desteği (varsa)

### Accessibility Testler
1. ✅ Keyboard navigation çalışıyor
2. ✅ Screen reader uyumlu
3. ✅ ARIA labels mevcut
4. ✅ Focus management doğru
5. ✅ Color contrast yeterli

### Performance Testler
1. ✅ 10 görseli 5 saniyede yüklüyor
2. ✅ Büyük görseller optimize ediliyor
3. ✅ UI responsive kalıyor (lag yok)
4. ✅ Memory leak yok

## Definition of Done (DoD)

✅ Tüm kabul kriterleri karşılanmış  
✅ Tüm test senaryoları geçiyor  
✅ Responsive tasarım çalışıyor (desktop, tablet, mobile)  
✅ Accessibility standartlarına uygun  
✅ Code review tamamlanmış  
✅ Backend API'ler entegre edilmiş  
✅ Error handling tamamlanmış  
✅ Loading states eklenmiş  
✅ Animasyonlar eklenmiş  
✅ Component documentation yazılmış  
✅ Staging'de test edilmiş  
✅ Cross-browser test edilmiş (Chrome, Firefox, Safari)  

## Tahmini Effort
- **Component Development**: 4 gün
- **Drag & Drop Implementation**: 2 gün
- **API Integration**: 2 gün
- **Error Handling & Validation**: 1 gün
- **Responsive Design**: 1 gün
- **Accessibility**: 1 gün
- **Testing & Bug Fixes**: 2 gün
- **Code Review & Refactoring**: 1 gün

**Toplam**: ~14 gün (3 hafta sprint)

## Öncelik
**Yüksek (High)** - Ürün yönetiminin kritik bir parçası

## Bağımlılıklar
- Backend API endpoint'leri hazır olmalı (US-BACKEND-002)
- Ürün modeli ve state management hazır olmalı
- Authentication sistemi çalışıyor olmalı
- File upload infrastructure hazır olmalı

## Notlar
- Drag & drop kütüphanesi seçimi kritik (performans)
- Progress tracking için XHR veya Fetch API with streams kullanılabilir
- Thumbnail'ler backend'de oluşturulmalı, frontend'de değil
- Görsel optimizasyonu backend'de yapılmalı
- CDN kullanımı önemli (hızlı yükleme)
- Error messages kullanıcı dostu olmalı
- Loading states her durumda gösterilmeli
- Accessibility en baştan düşünülmeli, sonradan eklenmesin

## Etiketler
`frontend`, `react`, `typescript`, `file-upload`, `drag-and-drop`, `image-management`, `ui-ux`

