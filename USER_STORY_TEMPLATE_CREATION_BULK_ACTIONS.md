# Kullanıcı Hikayesi: Toplu İşlemlerde Şablon Oluşturma

## Hikaye ID
**US-COMM-001**

## Başlık
**Bir admin/tedarikçi olarak, seçili ürünlere dayalı CSV şablonları oluşturmak istiyorum, böylece önceden doldurulmuş bir şablon kullanarak ürünleri toplu olarak verimli bir şekilde oluşturabilir, güncelleyebilir veya değiştirebilirim.**

## Kullanıcı Hikayesi
Bir **admin veya tedarikçi kullanıcısı** olarak,  
**Toplu işlemlerde seçili ürünlerden CSV/Excel şablonları oluşturmak** istiyorum,  
Böylece **seçimime dayalı olarak ilgili sütunlar, kategoriye özel özellikler ve örnek veriler içeren standartlaştırılmış şablonlar oluşturabilirim**,  
Bu sayede **toplu ürün işlemlerini daha verimli ve doğru bir şekilde gerçekleştirebilirim**.

## Kabul Kriterleri

### AC1: Seçili Ürünlerden Şablon Oluşturma
- **Varsayılan olarak** Ürün listesinde bir veya daha fazla ürün seçmişimdir
- **Ne zaman** "Toplu İşlemler" → "Şablon İndir" seçeneğine tıklarsam
- **O zaman** Şablonu yapılandırmama izin veren bir modal pencere açılır
- **Ve** Şablon seçili ürünlerden veri içermelidir (uygulanabilirse)

### AC2: Şablon Tipi Seçimi
- **Varsayılan olarak** Şablon indirme modalındayım
- **Ne zaman** Şablon tipi seçeneklerini görürsem:
  - **Ürün Ekle** (Yeni Ürün): Yeni ürünler oluşturmak için
  - **Ürün Güncelle** (Ürün Güncelle): Mevcut ürünleri güncellemek için
  - **Stok & Fiyat Güncelle**: Sadece stok ve fiyatı güncellemek için
- **O zaman** Radyo butonları aracılığıyla bir şablon tipi seçebilirim
- **Ve** Açıklama seçilen tipe göre dinamik olarak güncellenir

### AC3: Kategoriye Dayalı Şablon Oluşturma
- **Varsayılan olarak** "Ürün Ekle" veya "Ürün Güncelle" şablon tipini seçmişimdir
- **Ne zaman** Bana bir kategori seçimi arayüzü gösterilirse
- **O zaman** Hiyerarşik bir ağaçtan bir veya birden fazla kategori seçebilirim
- **Ve** Seçili kategoriler açıkça gösterilir
- **Ve** Şablon, seçili kategorilerdeki tüm özellikler için sütunlar içerir
- **Ve** En az bir kategori seçilmelidir (doğrulama)

### AC4: Stok & Fiyat Şablonu (Kategori Gerekmez)
- **Varsayılan olarak** "Stok & Fiyat Güncelle" şablon tipini seçmişimdir
- **Ne zaman** Şablon oluşturma tetiklenirse
- **O zaman** Kategori seçimi gizlenir/gerekli değildir
- **Ve** Şablon sadece şunları içerir: SKU, Stok, Fiyat sütunları
- **Ve** Şablon kategori seçimi olmadan doğrudan oluşturulabilir

### AC5: Seçili Ürünler İçin Şablon İçeriği
- **Varsayılan olarak** Şablon modalını açmadan önce ürünler seçmişimdir
- **Ne zaman** Şablon tipi "Ürün Güncelle" veya "Stok & Fiyat Güncelle" ise
- **O zaman** Şablon seçili ürünlerin verileriyle önceden doldurulmalıdır:
  - **Ürün Güncelle**: SKU, Ad (TR/EN), mevcut Stok, mevcut Fiyat, mevcut Özellik değerleri
  - **Stok & Fiyat Güncelle**: SKU, mevcut Stok, mevcut Fiyat
- **Ve** Seçili ürünlerin bilgisi şablon satırlarında korunur

### AC6: Ürün Ekleme İçin Şablon İçeriği
- **Varsayılan olarak** "Ürün Ekle" şablon tipini seçmişimdir
- **Ne zaman** Bir veya daha fazla kategori seçersem
- **O zaman** Şablon şunları içerir:
  - Standart sütunlar: SKU, Ad (TR), Ad (EN), Kategori ID, Stok, Fiyat
  - Kategoriye özel özellik sütunları (seçili kategorilere göre)
  - Veri girişi için örnek/boş satırlar
- **Ve** Özellik sütunları seçili kategorilerden özellik adlarıyla etiketlenir
- **Ve** Zorunlu özellikler açıkça işaretlenir

### AC7: Şablon Dosya Formatı
- **Varsayılan olarak** Şablonumu yapılandırmışımdır
- **Ne zaman** "Şablon İndir" butonuna tıklarsam
- **O zaman** Şablon CSV dosyası olarak oluşturulur
- **Ve** Dosya adı formatı: `product_template_[tip]_[zaman_damgası].csv` veya `product_template_[kategori]_[zaman_damgası].csv`
- **Ve** Dosya kodlaması UTF-8'dir
- **Ve** Dosya hemen indirilebilir

### AC8: Çoklu Kategori Şablonu
- **Varsayılan olarak** Şablon modalında birden fazla kategori seçmişimdir
- **Ne zaman** Şablon oluşturulursa
- **O zaman** Şablon şunlar için sütunlar içerir:
  - Standart ürün alanları
  - Tüm seçili kategorilerden tüm özelliklerin birleşimi
  - Her ürünün hangi kategoriye ait olduğunu belirtmek için Kategori ID sütunu

### AC9: Boş Şablon Oluşturma
- **Varsayılan olarak** "Ürün Ekle" şablon tipini seçmişimdir
- **Ne zaman** Ürün önceden seçilmemişse (isteğe bağlı senaryo)
- **O zaman** Şablon şunları içerir:
  - Tüm gerekli sütunlarla başlık satırı
  - Veri girişi için en az 3-5 boş satır
  - İlk satırda örnek veri (isteğe bağlı, rehberlik için)

### AC10: Doğrulama ve Hata Yönetimi
- **Varsayılan olarak** Şablon oluşturma akışındayım
- **Ne zaman** Kategori seçmeden şablon oluşturmaya çalışırsam (Ekle/Güncelle tipleri için)
- **O zaman** Hata mesajı gösterilir: "Lütfen en az bir kategori seçin."
- **Ve** Modal kategori seçimine izin vermek için açık kalır
- **Ne zaman** Kategorileri seçer ve devam edersem
- **O zaman** Şablon başarıyla oluşturulur

### AC11: Şablon Özelliklerinin Dahil Edilmesi
- **Varsayılan olarak** Seçili kategorilerin ilişkili özellikleri vardır
- **Ne zaman** Şablon oluşturulursa
- **O zaman** Her özellik şablonda bir sütun olarak görünür
- **Ve** Sütun adları özellik `name` alanını kullanır (örn: "color", "size")
- **Ve** Zorunlu özellikler dahil edilir (uygulanabilirse)
- **Ve** İsteğe bağlı özellikler dahil edilir (uygulanabilirse)

### AC12: Toplu İşlem Bağlamı Entegrasyonu
- **Varsayılan olarak** Toplu seçimin etkin olduğu bir ürün listesi sayfasındayım
- **Ne zaman** Onay kutularını kullanarak bir veya daha fazla ürün seçersem
- **O zaman** "Toplu İşlemler" açılır menüsü görünür
- **Ve** "Şablon İndir" seçeneği açılır menüde mevcuttur
- **Ne zaman** "Şablon İndir"e tıklarsam
- **O zaman** Seçili ürünlerin bilgisi şablon ön doldurma için kullanılabilir

## Teknik Gereksinimler

### TR1: Veri Ön Doldurma
- Seçili ürünlerin verileri çıkarılmalı ve şablon satırlarına dahil edilmelidir
- "Ürün Güncelle" için: Tüm mevcut ürün değerlerini dahil et
- "Stok & Fiyat Güncelle" için: Sadece SKU, mevcut stok, mevcut fiyatı dahil et

### TR2: Kategori Özellik Toplama
- Birden fazla kategori seçildiğinde, tüm benzersiz özellikleri topla
- Özellik sütunları seçili kategorilerdeki tüm özellikleri içermelidir
- Yinelenen özellik sütunları olmamalıdır

### TR3: Dosya Oluşturma
- Excel uyumluluğu için uygun kodlamayla CSV formatı kullan (BOM ile UTF-8)
- Virgül, tırnak, satır sonu içeren alanlar için uygun CSV kaçış
- Başlık satırı ilk satır olmalıdır

### TR4: Modal Durum Yönetimi
- Şablon tipi seçimi açıklama metnini dinamik olarak güncellemelidir
- Kategori seçimi şablon tipine göre göster/gizle
- Seçili kategori sayısı gösterilmelidir

## Kullanıcı Senaryoları

### Senaryo 1: Seçili Ürünlerin Toplu Güncelleme Şablonu
1. Kullanıcı ürün listesine gider
2. Kullanıcı onay kutularını kullanarak 10 ürün seçer
3. Kullanıcı "Toplu İşlemler" → "Şablon İndir"e tıklar
4. Kullanıcı "Ürün Güncelle" şablon tipini seçer
5. Sistem kategori seçimini gösterir (seçili ürünlerin kategorileri)
6. Kullanıcı kategorileri onaylar (veya ek kategori seçer)
7. Sistem seçili ürünlerin verileriyle önceden doldurulmuş 10 satırlık CSV oluşturur
8. Kullanıcı şablon dosyasını indirir
9. Kullanıcı şablonu düzenleyebilir ve ürünleri güncellemek için yeniden yükleyebilir

### Senaryo 2: Kategori Özellikleriyle Yeni Ürün Şablonu
1. Kullanıcı "Toplu İşlemler" → "Şablon İndir"e tıklar
2. Kullanıcı "Ürün Ekle" şablon tipini seçer
3. Kullanıcı "Giyim" kategorisini seçer
4. Sistem "Giyim"in şu özelliklere sahip olduğunu gösterir: renk, beden, malzeme
5. Kullanıcı seçimi onaylar
6. Sistem şu sütunlarla şablon oluşturur: SKU, Ad TR, Ad EN, Kategori ID, Stok, Fiyat, Renk, Beden, Malzeme
7. Kullanıcı şablonu indirir
8. Kullanıcı şablonu yeni ürün verileriyle doldurur

### Senaryo 3: Hızlı Stok & Fiyat Güncelleme Şablonu
1. Kullanıcı 50 ürün seçer
2. Kullanıcı "Toplu İşlemler" → "Şablon İndir"e tıklar
3. Kullanıcı "Stok & Fiyat Güncelle" şablon tipini seçer
4. Sistem hemen şablonu oluşturur (kategori seçimi gerekmez)
5. Şablon şunları içerir: SKU, mevcut Stok, mevcut Fiyat ile 50 satır
6. Kullanıcı indirir, değerleri günceller ve ardından yeniden yükler

## Fonksiyonel Olmayan Gereksinimler

- Şablon oluşturma, 1000'e kadar seçili ürün için < 2 saniyede tamamlanmalıdır
- Şablon dosya boyutu makul olmalıdır (1000 ürün için < 10MB)
- Şablon Excel ile uyumlu olmalıdır (BOM ile UTF-8 CSV formatı)
- Modal duyarlı olmalı ve mobil cihazlarda çalışmalıdır
- Şablon oluşturma UI'ı bloke etmemelidir (gerekirse asenkron)

## Bağımlılıklar

- Ürün seçimi işlevselliği
- Özelliklerle kategori veri yapısı
- Özellik veri modeli
- CSV oluşturma yardımcı programları
- Dosya indirme işlevselliği

## Kapsam Dışı

- Şablon özelleştirme (sütun sırası, biçimlendirme)
- Excel (.xlsx) formatı oluşturma (sadece CSV)
- İndirmeden önce şablon doğrulama
- İndirmeden önce şablon önizleme
- Şablon paylaşımı/ortak çalışma özellikleri

## Notlar

- Bu özellik toplu ürün yönetimi iş akışlarını geliştirir
- Manuel veri girişi hatalarını azaltır
- Hem admin hem de tedarikçi kullanıcı rollerini destekler
- Şablon formatı mevcut içe/dışa aktarma işlevselliğiyle tutarlı olmalıdır
