# Kullanıcı Hikayesi: Ürün Görsel Yönetimi - Backend API

## Hikaye ID
**US-BACKEND-002**

## Başlık
**Bir backend developer olarak, ürünlere görsel ekleme ve çıkarma işlemleri için REST API endpoint'leri geliştirmek istiyorum, böylece frontend uygulaması ürün görsellerini güvenli ve verimli bir şekilde yönetebilsin.**

## Kullanıcı Hikayesi
Bir **backend developer** olarak,  
**Ürün görsellerini yönetmek için RESTful API endpoint'leri oluşturmak** istiyorum,  
Böylece **görsel yükleme, silme, sıralama ve doğrulama işlemlerini güvenli ve performanslı bir şekilde gerçekleştirebilirim**,  
Bu sayede **frontend uygulaması ürün görsellerini sorunsuz bir şekilde yönetebilir ve kullanıcı deneyimi iyileştirilir**.

## Kabul Kriterleri

### AC1: Ürüne Görsel Ekleme API Endpoint'i
- **Varsayılan olarak** Geçerli bir ürün ID'si vardır
- **Ne zaman** `POST /api/products/{productId}/images` endpoint'ine bir istek gelirse
- **O zaman** Sistem şu doğrulamaları yapar:
  - Dosya formatı (JPEG, PNG, WebP, GIF)
  - Dosya boyutu (maksimum 10MB)
  - Ürün ID'sinin geçerliliği
  - Kullanıcının yetkisi (admin veya ürünün tedarikçisi)
- **Ve** Görsel başarıyla yüklenirse:
  - Dosya güvenli bir depolama alanına kaydedilir
  - Veritabanına görsel kaydı eklenir (product_id, image_url, order_index, created_at)
  - 201 Created statüsü ve görsel bilgileri döner
- **Ve** Hata durumunda uygun HTTP status kodu ve hata mesajı döner

### AC2: Çoklu Görsel Ekleme Desteği
- **Varsayılan olarak** Ürüne birden fazla görsel eklenebilir
- **Ne zaman** Aynı istekte birden fazla görsel dosyası gönderilirse
- **O zaman** Sistem her görseli sırayla işler
- **Ve** Her görsel için ayrı veritabanı kaydı oluşturur
- **Ve** Görsellerin sırası `order_index` alanıyla yönetilir
- **Ve** İlk eklenen görsel varsayılan olarak ana görsel (order_index: 0) olarak atanır
- **Ve** Maksimum görsel sayısı sınırı kontrol edilir (örn: 10 görsel/ürün)

### AC3: Görsel Silme API Endpoint'i
- **Varsayılan olarak** Bir ürünün görseli vardır
- **Ne zaman** `DELETE /api/products/{productId}/images/{imageId}` endpoint'ine istek gelirse
- **O zaman** Sistem şu kontrolleri yapar:
  - Görsel kaydının varlığı
  - Görselin ilgili ürüne ait olduğu
  - Kullanıcının yetkisi
- **Ve** Görsel başarıyla silinirse:
  - Dosya depolama alanından kaldırılır
  - Veritabanı kaydı silinir (soft delete veya hard delete)
  - Kalan görsellerin order_index değerleri yeniden düzenlenir
  - 204 No Content statüsü döner
- **Ve** Son görsel silindiğinde ürün durumu "resim yok" olarak işaretlenir

### AC4: Görsel Sıralama Güncelleme
- **Varsayılan olarak** Ürünün birden fazla görseli vardır
- **Ne zaman** `PATCH /api/products/{productId}/images/reorder` endpoint'ine istek gelirse
- **O zaman** İstek gövdesi görsel ID'leri ve yeni sıralamayı içerir
- **Ve** Sistem tüm görsellerin order_index değerlerini günceller
- **Ve** 200 OK statüsü ve güncellenmiş görsel listesi döner
- **Ve** Ana görsel değişikliği varsa bu özel olarak loglanır



### AC4: Dosya Depolama ve CDN Entegrasyonu
- **Varsayılan olarak** Görsel dosyaları yüklenmiştir
- **Ne zaman** Dosya sisteme kaydedilirse
- **O zaman** Dosya yapılandırılmış bir dizin yapısına kaydedilir:
  - `/products/{productId}/images/{timestamp}_{filename}`
- **Ve** Farklı boyutlarda thumbnail'ler otomatik oluşturulur:
  - Küçük: 150x150px
  - Orta: 500x500px
  - Büyük: 1200x1200px (orijinal maksimum)
- **Ve** Dosyalar CDN'e yüklenir (opsiyonel, yapılandırılabilir)
- **Ve** URL'ler veritabanına kaydedilir

### AC6: Dosya Format ve Boyut Doğrulama
- **Varsayılan olarak** Bir görsel dosyası yüklenmek üzeredir
- **Ne zaman** Dosya doğrulama yapılırsa
- **O zaman** Sistem şu kontrolleri yapar:
  - MIME type kontrolü (image/jpeg, image/png, image/webp, image/gif)
  - Dosya uzantısı kontrolü (.jpg, .jpeg, .png, .webp, .gif)
  - Maksimum dosya boyutu (10MB)
  - Minimum boyut gereksinimleri (örn: minimum 200x200px)
  - Görsel bütünlüğü (corrupt dosya kontrolü)
- **Ve** Geçersiz dosyalar için 400 Bad Request ve açıklayıcı hata mesajı döner




## Teknik Gereksinimler

### TR1: API Endpoint Detayları

**1. Görsel Ekleme**
```
POST /api/products/{productId}/images
Content-Type: multipart/form-data

Request Body:
- images: File[] (multipart)
- alt_text: string (optional)
- title: string (optional)

Response 201:
{
    "success": true,
    "data": {
        "images": [
            {
                "id": 123,
                "product_id": 1,
                "image_url": "https://cdn.example.com/products/1/images/123.jpg",
                "thumbnail_url": "https://cdn.example.com/products/1/images/thumbs/123_small.jpg",
                "order_index": 0,
                "is_primary": true,
                "created_at": "2024-01-15T10:30:00Z"
            }
        ]
    },
    "message": "Images uploaded successfully"
}
```

**2. Görsel Silme**
```
DELETE /api/products/{productId}/images/{imageId}

Response 204: No Content

Response 404:
{
    "success": false,
    "error": {
        "code": "IMAGE_NOT_FOUND",
        "message": "Image not found"
    }
}
```

**3. Görsel Listeleme**
```
GET /api/products/{productId}/images

Response 200:
{
    "success": true,
    "data": {
        "images": [...]
    }
}
```


### TR2: Dosya İşleme Kütüphaneleri
- **File Storage**: AWS S3, Google Cloud Storage, veya local filesystem
- **Validation**: python-magic (MIME type), PIL.Image (görsel doğrulama)
- **CDN**: CloudFront, Cloudflare, Fastly (opsiyonel)

### TR3: Performans Optimizasyonu
- Thumbnail oluşturma asenkron queue'da yapılır (Celery, RabbitMQ)
- Büyük dosya yüklemeleri için chunk upload desteği
- Rate limiting: Kullanıcı başına 10 istek/dakika
- File upload timeout: 30 saniye
- Maximum concurrent uploads: 5 dosya

### TR4: Hata Kodları
```
400 - Bad Request: Geçersiz dosya formatı, boyut aşımı
401 - Unauthorized: Authentication gerekli
403 - Forbidden: Yetkisiz erişim
404 - Not Found: Ürün veya görsel bulunamadı
413 - Payload Too Large: Dosya boyutu limiti aşıldı
415 - Unsupported Media Type: Desteklenmeyen dosya formatı
422 - Unprocessable Entity: Geçersiz görsel dosyası
500 - Internal Server Error: Sunucu hatası
503 - Service Unavailable: Storage servisi erişilemez
```


## Kullanıcı Senaryoları

### Senaryo 1: Tek Görsel Yükleme
1. Frontend, ürün ID 1 için bir görsel yüklemek ister
2. `POST /api/products/1/images` endpoint'ine multipart/form-data ile istek gönderilir
3. Backend dosya validasyonunu yapar (format: JPG, boyut: 2MB)
4. Dosya `/products/1/images/1705318200_product.jpg` olarak kaydedilir
5. Thumbnail'ler oluşturulur (150x150, 500x500, 1200x1200)
6. Veritabanına görsel kaydı eklenir
7. Response olarak görsel bilgileri döner
8. Frontend yeni görseli kullanıcıya gösterir

### Senaryo 2: Çoklu Görsel Yükleme
1. Frontend, ürün ID 5 için 5 görsel yüklemek ister
2. `POST /api/products/5/images` endpoint'ine 5 dosya ile istek gönderilir
3. Backend her dosyayı sırayla doğrular
4. İlk görsel ana görsel (order_index: 0) olarak ayarlanır
5. Diğer görseller sırasıyla 1, 2, 3, 4 index'leri alır
6. Her görsel için thumbnail'ler oluşturulur
7. 5 veritabanı kaydı oluşturulur
8. Response olarak tüm yüklenen görsellerin bilgileri döner

### Senaryo 3: Geçersiz Dosya Yükleme
1. Frontend, PDF formatında bir dosya yüklemek ister
2. `POST /api/products/1/images` endpoint'ine PDF dosyası gönderilir
3. Backend MIME type kontrolü yapar
4. Dosya formatı geçersiz bulunur
5. Response 415 Unsupported Media Type döner:
   ```json
   {
       "success": false,
       "error": {
           "code": "INVALID_FILE_FORMAT",
           "message": "Unsupported file format. Allowed: JPEG, PNG, WebP, GIF"
       }
   }
   ```


## Kapsam Dışı

### Bu Story Kapsamında YAPILMAYACAK:
- Frontend görsel yönetim arayüzü (ayrı frontend story)
- Görsel düzenleme özellikleri (crop, rotate, filter)
- Video yükleme desteği
- Görsel arama ve filtreleme
- AI tabanlı görsel analizi (otomatik tagging, nesne tanıma)
- Görsel format dönüştürme (manuel)
- Toplu görsel indirme (bulk export)
- Görsel versiyonlama
- Görsel paylaşım/ortak çalışma özellikleri

### Gelecek Story'lerde Yapılabilir:
- Görsel optimizasyon otomasyonu
- AI destekli alt text oluşturma
- Görsel kalite kontrol otomasyonu
- İleri düzey metadata yönetimi

## Test Senaryoları

### Unit Tests
1. **test_upload_valid_image()**: Geçerli görsel yükleme
2. **test_upload_invalid_format()**: Geçersiz format reddetme
3. **test_upload_oversized_file()**: Büyük dosya reddetme
4. **test_delete_image()**: Görsel silme
5. **test_reorder_images()**: Görsel sıralama
6. **test_set_primary_image()**: Ana görsel ayarlama
7. **test_unauthorized_access()**: Yetki kontrolü
8. **test_thumbnail_generation()**: Thumbnail oluşturma

### Integration Tests
1. **test_upload_and_retrieve()**: Yükleme ve listeleme flow
2. **test_upload_delete_cascade()**: Ürün silindiğinde görseller silinsin
3. **test_multiple_images_order()**: Çoklu görsel sıralama
4. **test_storage_integration()**: Storage servisi entegrasyonu
5. **test_cdn_url_generation()**: CDN URL oluşturma

### Load Tests
1. **test_concurrent_uploads()**: 100 eş zamanlı yükleme
2. **test_large_file_upload()**: 10MB dosya yükleme
3. **test_burst_requests()**: Ani trafik artışı

## Notlar

- Bu story sadece **backend API** geliştirmesini kapsar
- Frontend entegrasyonu ayrı bir story'de ele alınmalıdır
- Thumbnail oluşturma işlemi asenkron olarak yapılmalı (performans)
- Storage maliyetlerini kontrol altında tutmak için eski görseller için retention policy belirlenebilir
- CDN kullanımı opsiyonel ancak production için şiddetle önerilir
- Görsel metadata'sı SEO için önemlidir (alt_text, title)
- Güvenlik testleri özellikle dikkat edilmesi gereken bir konudur
- API dokümantasyonu Swagger/OpenAPI formatında oluşturulmalıdır

## Definition of Done (DoD)

✅ Tüm kabul kriterleri karşılanmış  
✅ Integration testleri yazılmış ve geçiyor  
✅ API dokümantasyonu tamamlanmış (Swagger)  
✅ Code review tamamlanmış  
✅ Performance testleri yapılmış  
✅ Staging ortamında test edilmiş  

## Tahmini Effort
- **Backend API Development**: 5 gün
- **Database Schema & Migration**: 1 gün
- **File Storage Integration**: 2 gün
- **Image Processing**: 2 gün
- **Testing**: 3 gün
- **Documentation**: 1 gün
- **Code Review & Refactoring**: 1 gün

**Toplam**: ~15 gün (3 hafta sprint)

## Öncelik
**Yüksek (High)** - Ürün yönetiminin temel bir özelliği

## Etiketler
`backend`, `api`, `file-upload`, `image-management`, `product-management`, `rest-api`

