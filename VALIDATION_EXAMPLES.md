# Validasyon ve Kontrol Örnekleri

Bu doküman ürün yönetimi işlemleri için frontend ve backend validasyon örneklerini içerir.

## İçindekiler
1. [Ürün Oluşturma Validasyonu](#ürün-oluşturma-validasyonu)
2. [Ürün Güncelleme Validasyonu](#ürün-güncelleme-validasyonu)
3. [Kategori Ekleme/Güncelleme Validasyonu](#kategori-ekleme-güncelleme-validasyonu)
4. [Attribute Ekleme/Güncelleme Validasyonu](#attribute-ekleme-güncelleme-validasyonu)

---

## Ürün Oluşturma Validasyonu

### Frontend Validasyon (TypeScript/React)

```typescript
// types/product.ts
interface ProductCreateInput {
  sku: string;
  name_tr: string;
  name_en: string;
  category_id: number;
  brand_id: number;
  supplier_id: number;
  price: number;
  stock: number;
  description_tr?: string;
  description_en?: string;
  attributes?: Record<string, any>;
  images?: File[];
}

interface ValidationError {
  field: string;
  message: string;
}

// validators/productValidator.ts
export class ProductValidator {
  
  static validateProductCreate(data: ProductCreateInput): ValidationError[] {
    const errors: ValidationError[] = [];

    // SKU Validasyonu
    if (!data.sku || data.sku.trim() === '') {
      errors.push({ field: 'sku', message: 'SKU zorunludur' });
    } else if (data.sku.length < 5) {
      errors.push({ field: 'sku', message: 'SKU en az 5 karakter olmalıdır' });
    } else if (data.sku.length > 50) {
      errors.push({ field: 'sku', message: 'SKU en fazla 50 karakter olabilir' });
    } else if (!/^[A-Z0-9-_]+$/i.test(data.sku)) {
      errors.push({ field: 'sku', message: 'SKU sadece harf, rakam, tire ve alt çizgi içerebilir' });
    }

    // Ürün Adı (Türkçe) Validasyonu
    if (!data.name_tr || data.name_tr.trim() === '') {
      errors.push({ field: 'name_tr', message: 'Ürün adı (Türkçe) zorunludur' });
    } else if (data.name_tr.length < 3) {
      errors.push({ field: 'name_tr', message: 'Ürün adı en az 3 karakter olmalıdır' });
    } else if (data.name_tr.length > 200) {
      errors.push({ field: 'name_tr', message: 'Ürün adı en fazla 200 karakter olabilir' });
    }


    // Kategori Validasyonu
    if (!data.category_id) {
      errors.push({ field: 'category_id', message: 'Kategori seçimi zorunludur' });
    } else if (data.category_id <= 0) {
      errors.push({ field: 'category_id', message: 'Geçerli bir kategori seçiniz' });
    }

    // Marka Validasyonu
    if (!data.brand_id) {
      errors.push({ field: 'brand_id', message: 'Marka seçimi zorunludur' });
    } else if (data.brand_id <= 0) {
      errors.push({ field: 'brand_id', message: 'Geçerli bir marka seçiniz' });
    }

    // Fiyat Validasyonu
    if (data.price === undefined || data.price === null) {
      errors.push({ field: 'price', message: 'Fiyat zorunludur' });
    } else if (data.price < 0) {
      errors.push({ field: 'price', message: 'Fiyat negatif olamaz' });
    } else if (data.price > 1000000) {
      errors.push({ field: 'price', message: 'Fiyat 1.000.000 TL\'den fazla olamaz' });
    } else if (!Number.isFinite(data.price)) {
      errors.push({ field: 'price', message: 'Geçerli bir fiyat giriniz' });
    }

    // Stok Validasyonu
    if (data.stock === undefined || data.stock === null) {
      errors.push({ field: 'stock', message: 'Stok miktarı zorunludur' });
    } else if (data.stock < 0) {
      errors.push({ field: 'stock', message: 'Stok negatif olamaz' });
    } else if (!Number.isInteger(data.stock)) {
      errors.push({ field: 'stock', message: 'Stok tam sayı olmalıdır' });
    } else if (data.stock > 1000000) {
      errors.push({ field: 'stock', message: 'Stok 1.000.000 adetten fazla olamaz' });
    }

    // Açıklama Validasyonu (opsiyonel ama girilmişse kontrol et)
    if (data.description_tr && data.description_tr.length > 5000) {
      errors.push({ field: 'description_tr', message: 'Açıklama en fazla 5000 karakter olabilir' });
    }
    if (data.description_en && data.description_en.length > 5000) {
      errors.push({ field: 'description_en', message: 'Açıklama en fazla 5000 karakter olabilir' });
    }

    // Görsel Validasyonu
    if (data.images && data.images.length > 0) {
      if (data.images.length > 10) {
        errors.push({ field: 'images', message: 'En fazla 10 görsel yükleyebilirsiniz' });
      }
      
      data.images.forEach((file, index) => {
        // Dosya boyutu kontrolü
        if (file.size > 10 * 1024 * 1024) {
          errors.push({ 
            field: `images[${index}]`, 
            message: `Görsel ${index + 1}: Dosya boyutu 10MB\'dan küçük olmalıdır` 
          });
        }
        
        // Dosya tipi kontrolü
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
          errors.push({ 
            field: `images[${index}]`, 
            message: `Görsel ${index + 1}: Sadece JPG, PNG, WebP ve GIF formatları desteklenir` 
          });
        }
      });
    }

    // Attribute Validasyonu (kategoriye göre zorunlu alanlar)
    if (data.attributes) {
      const requiredAttributes = this.getRequiredAttributesByCategory(data.category_id);
      
      requiredAttributes.forEach(attr => {
        if (!data.attributes![attr.key]) {
          errors.push({ 
            field: `attributes.${attr.key}`, 
            message: `${attr.name} zorunludur` 
          });
        }
      });
    }

    return errors;
  }

  // Kategoriye göre zorunlu attribute'ları getir (API'den çekilebilir)
  static getRequiredAttributesByCategory(categoryId: number): Array<{key: string, name: string}> {
    // Bu örnek için sabit data, gerçekte API'den gelir
    const categoryAttributeMap: Record<number, Array<{key: string, name: string}>> = {
      100: [ // Elektronik
        { key: 'color', name: 'Renk' },
        { key: 'warranty', name: 'Garanti' }
      ],
      101: [ // Giyim
        { key: 'color', name: 'Renk' },
        { key: 'size', name: 'Beden' }
      ]
    };
    
    return categoryAttributeMap[categoryId] || [];
  }

  // Real-time validation (her alan değiştiğinde)
  static validateField(field: string, value: any): string | null {
    switch (field) {
      case 'sku':
        if (!value || value.trim() === '') return 'SKU zorunludur';
        if (value.length < 5) return 'SKU en az 5 karakter olmalıdır';
        if (!/^[A-Z0-9-_]+$/i.test(value)) return 'SKU sadece harf, rakam, tire ve alt çizgi içerebilir';
        return null;

      case 'price':
        if (value === undefined || value === null || value === '') return 'Fiyat zorunludur';
        if (isNaN(value) || value < 0) return 'Fiyat negatif olamaz';
        if (value > 1000000) return 'Fiyat 1.000.000 TL\'den fazla olamaz';
        return null;

      case 'stock':
        if (value === undefined || value === null || value === '') return 'Stok zorunludur';
        if (isNaN(value) || value < 0) return 'Stok negatif olamaz';
        if (!Number.isInteger(Number(value))) return 'Stok tam sayı olmalıdır';
        return null;

      default:
        return null;
    }
  }
}

// Kullanım örneği - React Component
import { useState } from 'react';
import { ProductValidator } from './validators/productValidator';

function ProductCreateForm() {
  const [formData, setFormData] = useState<ProductCreateInput>({
    sku: '',
    name_tr: '',
    name_en: '',
    category_id: 0,
    brand_id: 0,
    supplier_id: 1,
    price: 0,
    stock: 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Real-time validation
    if (touched[field]) {
      const error = ProductValidator.validateField(field, value);
      setErrors(prev => ({
        ...prev,
        [field]: error || ''
      }));
    }
  };

  const handleFieldBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate on blur
    const error = ProductValidator.validateField(field, formData[field as keyof ProductCreateInput]);
    setErrors(prev => ({
      ...prev,
      [field]: error || ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Full validation
    const validationErrors = ProductValidator.validateProductCreate(formData);
    
    if (validationErrors.length > 0) {
      const errorMap: Record<string, string> = {};
      validationErrors.forEach(err => {
        errorMap[err.field] = err.message;
      });
      setErrors(errorMap);
      
      // Focus on first error
      const firstErrorField = document.querySelector(`[name="${validationErrors[0].field}"]`);
      if (firstErrorField) {
        (firstErrorField as HTMLElement).focus();
      }
      
      return;
    }

    // API call
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Backend'den gelen hataları göster
        if (errorData.errors) {
          setErrors(errorData.errors);
        }
        return;
      }

      // Success
      const product = await response.json();
      console.log('Ürün oluşturuldu:', product);
      
    } catch (error) {
      console.error('Hata:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* SKU */}
      <div>
        <label>SKU *</label>
        <input
          type="text"
          name="sku"
          value={formData.sku}
          onChange={(e) => handleFieldChange('sku', e.target.value)}
          onBlur={() => handleFieldBlur('sku')}
          className={errors.sku ? 'error' : ''}
        />
        {errors.sku && <span className="error-message">{errors.sku}</span>}
      </div>

      {/* Price */}
      <div>
        <label>Fiyat (TL) *</label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={(e) => handleFieldChange('price', parseFloat(e.target.value))}
          onBlur={() => handleFieldBlur('price')}
          step="0.01"
          min="0"
          className={errors.price ? 'error' : ''}
        />
        {errors.price && <span className="error-message">{errors.price}</span>}
      </div>

      {/* Diğer alanlar... */}

      <button type="submit">Ürün Oluştur</button>
    </form>
  );
}
```

### Backend Validasyon (Python/Django)

```python
# validators.py
import re
from typing import Dict, List, Any
from decimal import Decimal

class ProductValidator:
    """Ürün validasyon kuralları"""
    
    SKU_MIN_LENGTH = 5
    SKU_MAX_LENGTH = 50
    NAME_MIN_LENGTH = 3
    NAME_MAX_LENGTH = 200
    DESCRIPTION_MAX_LENGTH = 5000
    MAX_PRICE = Decimal('1000000.00')
    MAX_STOCK = 1000000
    MAX_IMAGES = 10
    
    @staticmethod
    def validate_product_create(data: Dict[str, Any]) -> Dict[str, List[str]]:
        """
        Ürün oluşturma için validasyon
        Returns: {field_name: [error_messages]}
        """
        errors = {}
        
        # SKU Validasyonu
        sku = data.get('sku', '').strip()
        if not sku:
            errors['sku'] = ['SKU zorunludur']
        elif len(sku) < ProductValidator.SKU_MIN_LENGTH:
            errors['sku'] = [f'SKU en az {ProductValidator.SKU_MIN_LENGTH} karakter olmalıdır']
        elif len(sku) > ProductValidator.SKU_MAX_LENGTH:
            errors['sku'] = [f'SKU en fazla {ProductValidator.SKU_MAX_LENGTH} karakter olabilir']
        elif not re.match(r'^[A-Z0-9\-_]+$', sku, re.IGNORECASE):
            errors['sku'] = ['SKU sadece harf, rakam, tire ve alt çizgi içerebilir']
        elif ProductValidator._sku_exists(sku):
            errors['sku'] = ['Bu SKU zaten kullanımda']
        
        # Ürün Adı (Türkçe)
        name_tr = data.get('name_tr', '').strip()
        if not name_tr:
            errors['name_tr'] = ['Ürün adı (Türkçe) zorunludur']
        elif len(name_tr) < ProductValidator.NAME_MIN_LENGTH:
            errors['name_tr'] = [f'Ürün adı en az {ProductValidator.NAME_MIN_LENGTH} karakter olmalıdır']
        elif len(name_tr) > ProductValidator.NAME_MAX_LENGTH:
            errors['name_tr'] = [f'Ürün adı en fazla {ProductValidator.NAME_MAX_LENGTH} karakter olabilir']
        
        # Ürün Adı (İngilizce)
        name_en = data.get('name_en', '').strip()
        if not name_en:
            errors['name_en'] = ['Ürün adı (İngilizce) zorunludur']
        elif len(name_en) < ProductValidator.NAME_MIN_LENGTH:
            errors['name_en'] = [f'Ürün adı en az {ProductValidator.NAME_MIN_LENGTH} karakter olmalıdır']
        elif len(name_en) > ProductValidator.NAME_MAX_LENGTH:
            errors['name_en'] = [f'Ürün adı en fazla {ProductValidator.NAME_MAX_LENGTH} karakter olabilir']
        
        # Kategori Validasyonu
        category_id = data.get('category_id')
        if not category_id:
            errors['category_id'] = ['Kategori seçimi zorunludur']
        elif not ProductValidator._category_exists(category_id):
            errors['category_id'] = ['Geçersiz kategori']
        elif not ProductValidator._category_is_active(category_id):
            errors['category_id'] = ['Bu kategori aktif değil']
        
        # Marka Validasyonu
        brand_id = data.get('brand_id')
        if not brand_id:
            errors['brand_id'] = ['Marka seçimi zorunludur']
        elif not ProductValidator._brand_exists(brand_id):
            errors['brand_id'] = ['Geçersiz marka']
        
        # Tedarikçi Validasyonu
        supplier_id = data.get('supplier_id')
        if not supplier_id:
            errors['supplier_id'] = ['Tedarikçi ID zorunludur']
        elif not ProductValidator._supplier_exists(supplier_id):
            errors['supplier_id'] = ['Geçersiz tedarikçi']
        
        # Fiyat Validasyonu
        try:
            price = Decimal(str(data.get('price', 0)))
            if price < 0:
                errors['price'] = ['Fiyat negatif olamaz']
            elif price > ProductValidator.MAX_PRICE:
                errors['price'] = [f'Fiyat {ProductValidator.MAX_PRICE} TL\'den fazla olamaz']
        except (ValueError, TypeError, DecimalException):
            errors['price'] = ['Geçerli bir fiyat giriniz']
        
        # Stok Validasyonu
        try:
            stock = int(data.get('stock', 0))
            if stock < 0:
                errors['stock'] = ['Stok negatif olamaz']
            elif stock > ProductValidator.MAX_STOCK:
                errors['stock'] = [f'Stok {ProductValidator.MAX_STOCK} adetten fazla olamaz']
        except (ValueError, TypeError):
            errors['stock'] = ['Stok tam sayı olmalıdır']
        
        # Açıklama Validasyonu
        description_tr = data.get('description_tr', '')
        if description_tr and len(description_tr) > ProductValidator.DESCRIPTION_MAX_LENGTH:
            errors['description_tr'] = [f'Açıklama en fazla {ProductValidator.DESCRIPTION_MAX_LENGTH} karakter olabilir']
        
        description_en = data.get('description_en', '')
        if description_en and len(description_en) > ProductValidator.DESCRIPTION_MAX_LENGTH:
            errors['description_en'] = [f'Açıklama en fazla {ProductValidator.DESCRIPTION_MAX_LENGTH} karakter olabilir']
        
        # Attribute Validasyonu (kategoriye göre zorunlu alanlar)
        if category_id:
            required_attrs = ProductValidator._get_required_attributes(category_id)
            attributes = data.get('attributes', {})
            
            for attr in required_attrs:
                if attr['key'] not in attributes or not attributes[attr['key']]:
                    if 'attributes' not in errors:
                        errors['attributes'] = []
                    errors['attributes'].append(f"{attr['name']} zorunludur")
        
        return errors
    
    @staticmethod
    def _sku_exists(sku: str) -> bool:
        """SKU'nun var olup olmadığını kontrol et"""
        from .models import Product
        return Product.objects.filter(sku=sku).exists()
    
    @staticmethod
    def _category_exists(category_id: int) -> bool:
        """Kategorinin var olup olmadığını kontrol et"""
        from .models import Category
        return Category.objects.filter(id=category_id).exists()
    
    @staticmethod
    def _category_is_active(category_id: int) -> bool:
        """Kategorinin aktif olup olmadığını kontrol et"""
        from .models import Category
        try:
            category = Category.objects.get(id=category_id)
            return category.is_active
        except Category.DoesNotExist:
            return False
    
    @staticmethod
    def _brand_exists(brand_id: int) -> bool:
        """Markanın var olup olmadığını kontrol et"""
        from .models import Brand
        return Brand.objects.filter(id=brand_id).exists()
    
    @staticmethod
    def _supplier_exists(supplier_id: int) -> bool:
        """Tedarikçinin var olup olmadığını kontrol et"""
        from .models import Supplier
        return Supplier.objects.filter(id=supplier_id).exists()
    
    @staticmethod
    def _get_required_attributes(category_id: int) -> List[Dict[str, str]]:
        """Kategoriye ait zorunlu attribute'ları getir"""
        from .models import CategoryAttribute
        attrs = CategoryAttribute.objects.filter(
            category_id=category_id,
            is_required=True
        ).values('key', 'name')
        return list(attrs)


# views.py (Django REST Framework)
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .validators import ProductValidator
from .models import Product
from .serializers import ProductSerializer

class ProductCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Yeni ürün oluştur"""
        
        # 1. Validasyon
        validation_errors = ProductValidator.validate_product_create(request.data)
        
        if validation_errors:
            return Response({
                'success': False,
                'errors': validation_errors,
                'message': 'Validasyon hataları mevcut'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # 2. Yetki kontrolü (tedarikçi sadece kendi ürününü oluşturabilir)
        if request.user.role == 'supplier':
            if request.data.get('supplier_id') != request.user.supplier_id:
                return Response({
                    'success': False,
                    'error': 'Başka tedarikçi için ürün oluşturamazsınız'
                }, status=status.HTTP_403_FORBIDDEN)
        
        # 3. Ürün oluştur
        try:
            product = Product.objects.create(
                sku=request.data['sku'],
                name_tr=request.data['name_tr'],
                name_en=request.data['name_en'],
                category_id=request.data['category_id'],
                brand_id=request.data['brand_id'],
                supplier_id=request.data['supplier_id'],
                price=request.data['price'],
                stock=request.data['stock'],
                description_tr=request.data.get('description_tr', ''),
                description_en=request.data.get('description_en', ''),
                status='draft',  # Yeni ürünler taslak olarak başlar
                created_by=request.user
            )
            
            # 4. Attribute'ları kaydet
            if 'attributes' in request.data:
                for key, value in request.data['attributes'].items():
                    ProductAttribute.objects.create(
                        product=product,
                        attribute_key=key,
                        attribute_value=value
                    )
            
            # 5. Serializer ile response
            serializer = ProductSerializer(product)
            
            return Response({
                'success': True,
                'data': serializer.data,
                'message': 'Ürün başarıyla oluşturuldu'
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': 'Ürün oluşturulurken hata oluştu',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
```

---

## Ürün Güncelleme Validasyonu

### Frontend Validasyon (TypeScript)

```typescript
// validators/productUpdateValidator.ts
export class ProductUpdateValidator {
  
  static validateProductUpdate(
    productId: number, 
    originalData: ProductCreateInput,
    updateData: Partial<ProductCreateInput>
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    // Ürün ID kontrolü
    if (!productId || productId <= 0) {
      errors.push({ field: 'id', message: 'Geçerli bir ürün ID\'si gerekli' });
    }

    // Sadece gönderilen alanları validate et
    if (updateData.sku !== undefined) {
      // SKU değiştiriliyorsa, yeni SKU'nun geçerli olması gerekir
      if (updateData.sku !== originalData.sku) {
        const skuError = ProductValidator.validateField('sku', updateData.sku);
        if (skuError) {
          errors.push({ field: 'sku', message: skuError });
        }
      }
    }

    if (updateData.price !== undefined) {
      const priceError = ProductValidator.validateField('price', updateData.price);
      if (priceError) {
        errors.push({ field: 'price', message: priceError });
      }
    }

    if (updateData.stock !== undefined) {
      const stockError = ProductValidator.validateField('stock', updateData.stock);
      if (stockError) {
        errors.push({ field: 'stock', message: stockError });
      }
    }

    // Kategori değiştiriliyorsa
    if (updateData.category_id !== undefined && updateData.category_id !== originalData.category_id) {
      // Yeni kategorinin zorunlu attribute'larını kontrol et
      if (updateData.attributes) {
        const requiredAttrs = ProductValidator.getRequiredAttributesByCategory(updateData.category_id);
        
        requiredAttrs.forEach(attr => {
          if (!updateData.attributes![attr.key]) {
            errors.push({ 
              field: `attributes.${attr.key}`, 
              message: `Yeni kategoride ${attr.name} zorunludur` 
            });
          }
        });
      } else {
        errors.push({ 
          field: 'attributes', 
          message: 'Kategori değiştirirken zorunlu attribute\'lar girilmelidir' 
        });
      }
    }

    // Stok azaltılıyorsa, bekleyen siparişleri kontrol et
    if (updateData.stock !== undefined && updateData.stock < originalData.stock) {
      // Bu frontend'de tam kontrol edilemez, backend'den uyarı gelebilir
      // Ama kullanıcıyı uyarabiliriz
      const stockDifference = originalData.stock - updateData.stock;
      if (stockDifference > 100) {
        // Warning, error değil
        console.warn(`Stok ${stockDifference} adet azaltılıyor. Bekleyen siparişleri kontrol edin.`);
      }
    }

    return errors;
  }

  // Sadece değişen alanları gönder (PATCH için)
  static getChangedFields(
    original: ProductCreateInput, 
    updated: ProductCreateInput
  ): Partial<ProductCreateInput> {
    const changed: Partial<ProductCreateInput> = {};

    (Object.keys(updated) as Array<keyof ProductCreateInput>).forEach(key => {
      if (JSON.stringify(original[key]) !== JSON.stringify(updated[key])) {
        changed[key] = updated[key];
      }
    });

    return changed;
  }
}

// Kullanım örneği
function ProductEditForm({ productId }: { productId: number }) {
  const [originalData, setOriginalData] = useState<ProductCreateInput | null>(null);
  const [formData, setFormData] = useState<ProductCreateInput | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Ürün verilerini yükle
    fetchProduct(productId).then(data => {
      setOriginalData(data);
      setFormData(data);
    });
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!originalData || !formData) return;

    // Sadece değişen alanları al
    const changedFields = ProductUpdateValidator.getChangedFields(originalData, formData);

    if (Object.keys(changedFields).length === 0) {
      alert('Hiçbir değişiklik yapılmadı');
      return;
    }

    // Validasyon
    const validationErrors = ProductUpdateValidator.validateProductUpdate(
      productId,
      originalData,
      changedFields
    );

    if (validationErrors.length > 0) {
      const errorMap: Record<string, string> = {};
      validationErrors.forEach(err => {
        errorMap[err.field] = err.message;
      });
      setErrors(errorMap);
      return;
    }

    // API call (PATCH)
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(changedFields)
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.errors) {
          setErrors(errorData.errors);
        }
        return;
      }

      const updatedProduct = await response.json();
      console.log('Ürün güncellendi:', updatedProduct);
      
    } catch (error) {
      console.error('Hata:', error);
    }
  };

  return <form onSubmit={handleSubmit}>{/* Form fields */}</form>;
}
```

### Backend Validasyon (Python)

```python
# validators.py (devamı)
class ProductValidator:
    
    @staticmethod
    def validate_product_update(product_id: int, update_data: Dict[str, Any]) -> Dict[str, List[str]]:
        """
        Ürün güncelleme için validasyon
        Sadece gönderilen alanları validate eder
        """
        errors = {}
        
        # Ürün var mı kontrol et
        try:
            from .models import Product
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            errors['id'] = ['Ürün bulunamadı']
            return errors
        
        # SKU güncellenmişse
        if 'sku' in update_data:
            sku = update_data['sku'].strip()
            if not sku:
                errors['sku'] = ['SKU boş olamaz']
            elif sku != product.sku and ProductValidator._sku_exists(sku):
                errors['sku'] = ['Bu SKU zaten kullanımda']
            elif len(sku) < ProductValidator.SKU_MIN_LENGTH:
                errors['sku'] = [f'SKU en az {ProductValidator.SKU_MIN_LENGTH} karakter olmalıdır']
        
        # Fiyat güncellenmişse
        if 'price' in update_data:
            try:
                price = Decimal(str(update_data['price']))
                if price < 0:
                    errors['price'] = ['Fiyat negatif olamaz']
                elif price > ProductValidator.MAX_PRICE:
                    errors['price'] = [f'Fiyat {ProductValidator.MAX_PRICE} TL\'den fazla olamaz']
                
                # Fiyat düşürülüyorsa, belirli bir yüzdenin üzerindeyse uyar
                old_price = product.price
                if price < old_price:
                    price_drop_percentage = ((old_price - price) / old_price) * 100
                    if price_drop_percentage > 50:
                        # Warning (error değil, sadece uyarı)
                        errors['price_warning'] = [f'Fiyat %{price_drop_percentage:.1f} düşürülüyor']
                        
            except (ValueError, TypeError):
                errors['price'] = ['Geçerli bir fiyat giriniz']
        
        # Stok güncellenmişse
        if 'stock' in update_data:
            try:
                new_stock = int(update_data['stock'])
                if new_stock < 0:
                    errors['stock'] = ['Stok negatif olamaz']
                else:
                    # Bekleyen siparişleri kontrol et
                    pending_orders_count = ProductValidator._get_pending_orders_count(product_id)
                    if new_stock < pending_orders_count:
                        errors['stock'] = [
                            f'Stok {pending_orders_count} adetten az olamaz. '
                            f'Bekleyen {pending_orders_count} adet sipariş var.'
                        ]
            except (ValueError, TypeError):
                errors['stock'] = ['Stok tam sayı olmalıdır']
        
        # Kategori değiştiriliyorsa
        if 'category_id' in update_data:
            new_category_id = update_data['category_id']
            if new_category_id != product.category_id:
                if not ProductValidator._category_exists(new_category_id):
                    errors['category_id'] = ['Geçersiz kategori']
                else:
                    # Yeni kategorinin zorunlu attribute'larını kontrol et
                    required_attrs = ProductValidator._get_required_attributes(new_category_id)
                    existing_attrs = product.get_attributes_dict()  # Mevcut attribute'lar
                    
                    missing_attrs = []
                    for attr in required_attrs:
                        if attr['key'] not in existing_attrs and \
                           (attr['key'] not in update_data.get('attributes', {})):
                            missing_attrs.append(attr['name'])
                    
                    if missing_attrs:
                        errors['attributes'] = [
                            f"Yeni kategoride şu alanlar zorunludur: {', '.join(missing_attrs)}"
                        ]
        
        # Status güncellenmişse
        if 'status' in update_data:
            allowed_statuses = ['draft', 'pending_review', 'active', 'inactive', 'rejected']
            if update_data['status'] not in allowed_statuses:
                errors['status'] = [f'Geçersiz durum. İzin verilenler: {", ".join(allowed_statuses)}']
            
            # Statü değişim kuralları
            if update_data['status'] == 'active' and product.status == 'draft':
                # Taslaktan aktif'e geçiş için zorunlu kontroller
                if not product.has_images():
                    errors['status'] = ['Ürün aktif yapılmadan önce en az 1 görsel eklenmelidir']
                if not product.has_required_attributes():
                    errors['status'] = ['Tüm zorunlu alanlar doldurulmalıdır']
        
        return errors
    
    @staticmethod
    def _get_pending_orders_count(product_id: int) -> int:
        """Bekleyen siparişteki ürün adedi"""
        from .models import OrderItem
        from django.db.models import Sum
        
        count = OrderItem.objects.filter(
            product_id=product_id,
            order__status__in=['pending', 'processing']
        ).aggregate(total=Sum('quantity'))['total'] or 0
        
        return count


# views.py
class ProductUpdateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def patch(self, request, product_id):
        """Ürünü güncelle (partial update)"""
        
        # 1. Ürün var mı?
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Ürün bulunamadı'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # 2. Yetki kontrolü
        if request.user.role == 'supplier':
            if product.supplier_id != request.user.supplier_id:
                return Response({
                    'success': False,
                    'error': 'Bu ürünü düzenleme yetkiniz yok'
                }, status=status.HTTP_403_FORBIDDEN)
        
        # 3. Validasyon
        validation_errors = ProductValidator.validate_product_update(product_id, request.data)
        
        if validation_errors:
            return Response({
                'success': False,
                'errors': validation_errors,
                'message': 'Validasyon hataları mevcut'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # 4. Güncelleme
        try:
            # Sadece gönderilen alanları güncelle
            for field, value in request.data.items():
                if field != 'attributes':  # Attribute'lar ayrı işlenir
                    setattr(product, field, value)
            
            product.updated_by = request.user
            product.save()
            
            # Attribute'ları güncelle
            if 'attributes' in request.data:
                for key, value in request.data['attributes'].items():
                    ProductAttribute.objects.update_or_create(
                        product=product,
                        attribute_key=key,
                        defaults={'attribute_value': value}
                    )
            
            serializer = ProductSerializer(product)
            
            return Response({
                'success': True,
                'data': serializer.data,
                'message': 'Ürün başarıyla güncellendi'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': 'Ürün güncellenirken hata oluştu',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
```

---

## Kategori Ekleme/Güncelleme Validasyonu

### Frontend Validasyon (TypeScript)

```typescript
// types/category.ts
interface CategoryInput {
  name_tr: string;
  name_en: string;
  parent_id?: number | null;
  description_tr?: string;
  description_en?: string;
  icon?: string;
  is_active?: boolean;
  display_order?: number;
}

// validators/categoryValidator.ts
export class CategoryValidator {
  
  static validateCategoryCreate(data: CategoryInput): ValidationError[] {
    const errors: ValidationError[] = [];

    // Kategori Adı (Türkçe)
    if (!data.name_tr || data.name_tr.trim() === '') {
      errors.push({ field: 'name_tr', message: 'Kategori adı (Türkçe) zorunludur' });
    } else if (data.name_tr.length < 2) {
      errors.push({ field: 'name_tr', message: 'Kategori adı en az 2 karakter olmalıdır' });
    } else if (data.name_tr.length > 100) {
      errors.push({ field: 'name_tr', message: 'Kategori adı en fazla 100 karakter olabilir' });
    }

    // Kategori Adı (İngilizce)
    if (!data.name_en || data.name_en.trim() === '') {
      errors.push({ field: 'name_en', message: 'Kategori adı (İngilizce) zorunludur' });
    } else if (data.name_en.length < 2) {
      errors.push({ field: 'name_en', message: 'Kategori adı en az 2 karakter olmalıdır' });
    } else if (data.name_en.length > 100) {
      errors.push({ field: 'name_en', message: 'Kategori adı en fazla 100 karakter olabilir' });
    }

    // Parent Kategori
    if (data.parent_id !== undefined && data.parent_id !== null) {
      if (data.parent_id <= 0) {
        errors.push({ field: 'parent_id', message: 'Geçersiz üst kategori' });
      }
      // Bu kontrol API'den yapılmalı
      // Parent kategorinin var olup olmadığı
      // Parent kategorinin aktif olup olmadığı
      // Circular reference kontrolü (A > B > C > A gibi)
    }

    // Açıklama
    if (data.description_tr && data.description_tr.length > 500) {
      errors.push({ field: 'description_tr', message: 'Açıklama en fazla 500 karakter olabilir' });
    }
    if (data.description_en && data.description_en.length > 500) {
      errors.push({ field: 'description_en', message: 'Açıklama en fazla 500 karakter olabilir' });
    }

    // Display Order
    if (data.display_order !== undefined) {
      if (!Number.isInteger(data.display_order)) {
        errors.push({ field: 'display_order', message: 'Sıralama tam sayı olmalıdır' });
      } else if (data.display_order < 0) {
        errors.push({ field: 'display_order', message: 'Sıralama negatif olamaz' });
      }
    }

    // Icon (opsiyonel ama girilmişse format kontrolü)
    if (data.icon) {
      // Icon URL veya icon name olabilir
      if (data.icon.startsWith('http')) {
        // URL ise, geçerli URL kontrolü
        try {
          new URL(data.icon);
        } catch {
          errors.push({ field: 'icon', message: 'Geçersiz icon URL\'si' });
        }
      } else if (data.icon.length > 50) {
        errors.push({ field: 'icon', message: 'Icon adı en fazla 50 karakter olabilir' });
      }
    }

    return errors;
  }

  static validateCategoryUpdate(
    categoryId: number,
    original: CategoryInput,
    update: Partial<CategoryInput>
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!categoryId || categoryId <= 0) {
      errors.push({ field: 'id', message: 'Geçerli bir kategori ID\'si gerekli' });
    }

    // Sadece gönderilen alanları validate et
    if (update.name_tr !== undefined) {
      const nameError = this.validateField('name_tr', update.name_tr);
      if (nameError) errors.push({ field: 'name_tr', message: nameError });
    }

    if (update.name_en !== undefined) {
      const nameError = this.validateField('name_en', update.name_en);
      if (nameError) errors.push({ field: 'name_en', message: nameError });
    }

    // Parent değiştiriliyor mu?
    if (update.parent_id !== undefined && update.parent_id !== original.parent_id) {
      // Circular reference kontrolü (backend'de yapılmalı)
      if (update.parent_id === categoryId) {
        errors.push({ field: 'parent_id', message: 'Kategori kendi üst kategorisi olamaz' });
      }
    }

    return errors;
  }

  static validateField(field: string, value: any): string | null {
    if (field === 'name_tr' || field === 'name_en') {
      if (!value || value.trim() === '') return 'Kategori adı zorunludur';
      if (value.length < 2) return 'Kategori adı en az 2 karakter olmalıdır';
      if (value.length > 100) return 'Kategori adı en fazla 100 karakter olabilir';
    }
    return null;
  }

  // Kategori hiyerarşi derinliği kontrolü
  static async validateCategoryDepth(parentId: number | null): Promise<string | null> {
    if (!parentId) return null;

    try {
      const response = await fetch(`/api/categories/${parentId}/depth`);
      const data = await response.json();
      
      const MAX_DEPTH = 5; // Maksimum 5 seviye
      if (data.depth >= MAX_DEPTH) {
        return `Kategori hiyerarşisi en fazla ${MAX_DEPTH} seviye olabilir`;
      }
      
      return null;
    } catch (error) {
      console.error('Derinlik kontrolü başarısız:', error);
      return null; // Hata durumunda geçiş ver, backend kontrol edecek
    }
  }
}

// Kullanım örneği
function CategoryForm() {
  const [formData, setFormData] = useState<CategoryInput>({
    name_tr: '',
    name_en: '',
    parent_id: null,
    is_active: true,
    display_order: 0
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasyon
    const validationErrors = CategoryValidator.validateCategoryCreate(formData);

    // Derinlik kontrolü (async)
    if (formData.parent_id) {
      const depthError = await CategoryValidator.validateCategoryDepth(formData.parent_id);
      if (depthError) {
        validationErrors.push({ field: 'parent_id', message: depthError });
      }
    }

    if (validationErrors.length > 0) {
      const errorMap: Record<string, string> = {};
      validationErrors.forEach(err => {
        errorMap[err.field] = err.message;
      });
      setErrors(errorMap);
      return;
    }

    // API call
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.errors) {
          setErrors(errorData.errors);
        }
        return;
      }

      const category = await response.json();
      console.log('Kategori oluşturuldu:', category);
      
    } catch (error) {
      console.error('Hata:', error);
    }
  };

  return <form onSubmit={handleSubmit}>{/* Form fields */}</form>;
}
```

### Backend Validasyon (Python)

```python
# validators.py
class CategoryValidator:
    """Kategori validasyon kuralları"""
    
    NAME_MIN_LENGTH = 2
    NAME_MAX_LENGTH = 100
    DESCRIPTION_MAX_LENGTH = 500
    MAX_DEPTH = 5  # Maksimum hiyerarşi derinliği
    
    @staticmethod
    def validate_category_create(data: Dict[str, Any]) -> Dict[str, List[str]]:
        """Kategori oluşturma validasyonu"""
        errors = {}
        
        # Kategori adı (Türkçe)
        name_tr = data.get('name_tr', '').strip()
        if not name_tr:
            errors['name_tr'] = ['Kategori adı (Türkçe) zorunludur']
        elif len(name_tr) < CategoryValidator.NAME_MIN_LENGTH:
            errors['name_tr'] = [f'Kategori adı en az {CategoryValidator.NAME_MIN_LENGTH} karakter olmalıdır']
        elif len(name_tr) > CategoryValidator.NAME_MAX_LENGTH:
            errors['name_tr'] = [f'Kategori adı en fazla {CategoryValidator.NAME_MAX_LENGTH} karakter olabilir']
        elif CategoryValidator._category_name_exists(name_tr, 'tr'):
            errors['name_tr'] = ['Bu kategori adı zaten kullanılıyor']
        
        # Kategori adı (İngilizce)
        name_en = data.get('name_en', '').strip()
        if not name_en:
            errors['name_en'] = ['Kategori adı (İngilizce) zorunludur']
        elif len(name_en) < CategoryValidator.NAME_MIN_LENGTH:
            errors['name_en'] = [f'Kategori adı en az {CategoryValidator.NAME_MIN_LENGTH} karakter olmalıdır']
        elif len(name_en) > CategoryValidator.NAME_MAX_LENGTH:
            errors['name_en'] = [f'Kategori adı en fazla {CategoryValidator.NAME_MAX_LENGTH} karakter olabilir']
        
        # Parent kategori
        parent_id = data.get('parent_id')
        if parent_id is not None:
            if not CategoryValidator._category_exists(parent_id):
                errors['parent_id'] = ['Üst kategori bulunamadı']
            elif not CategoryValidator._category_is_active(parent_id):
                errors['parent_id'] = ['Üst kategori aktif değil']
            else:
                # Derinlik kontrolü
                depth = CategoryValidator._get_category_depth(parent_id)
                if depth >= CategoryValidator.MAX_DEPTH:
                    errors['parent_id'] = [
                        f'Kategori hiyerarşisi en fazla {CategoryValidator.MAX_DEPTH} seviye olabilir'
                    ]
        
        # Açıklama
        description_tr = data.get('description_tr', '')
        if description_tr and len(description_tr) > CategoryValidator.DESCRIPTION_MAX_LENGTH:
            errors['description_tr'] = [
                f'Açıklama en fazla {CategoryValidator.DESCRIPTION_MAX_LENGTH} karakter olabilir'
            ]
        
        description_en = data.get('description_en', '')
        if description_en and len(description_en) > CategoryValidator.DESCRIPTION_MAX_LENGTH:
            errors['description_en'] = [
                f'Açıklama en fazla {CategoryValidator.DESCRIPTION_MAX_LENGTH} karakter olabilir'
            ]
        
        # Display order
        display_order = data.get('display_order', 0)
        if not isinstance(display_order, int):
            errors['display_order'] = ['Sıralama tam sayı olmalıdır']
        elif display_order < 0:
            errors['display_order'] = ['Sıralama negatif olamaz']
        
        return errors
    
    @staticmethod
    def validate_category_update(category_id: int, update_data: Dict[str, Any]) -> Dict[str, List[str]]:
        """Kategori güncelleme validasyonu"""
        errors = {}
        
        # Kategori var mı?
        from .models import Category
        try:
            category = Category.objects.get(id=category_id)
        except Category.DoesNotExist:
            errors['id'] = ['Kategori bulunamadı']
            return errors
        
        # İsim güncellenmişse
        if 'name_tr' in update_data:
            name_tr = update_data['name_tr'].strip()
            if not name_tr:
                errors['name_tr'] = ['Kategori adı boş olamaz']
            elif CategoryValidator._category_name_exists(name_tr, 'tr', exclude_id=category_id):
                errors['name_tr'] = ['Bu kategori adı zaten kullanılıyor']
        
        # Parent değiştiriliyorsa
        if 'parent_id' in update_data:
            new_parent_id = update_data['parent_id']
            
            if new_parent_id is not None:
                # Kendini parent yapamaz
                if new_parent_id == category_id:
                    errors['parent_id'] = ['Kategori kendi üst kategorisi olamaz']
                # Parent var mı?
                elif not CategoryValidator._category_exists(new_parent_id):
                    errors['parent_id'] = ['Üst kategori bulunamadı']
                # Circular reference kontrolü
                elif CategoryValidator._would_create_circular_reference(category_id, new_parent_id):
                    errors['parent_id'] = ['Bu işlem döngüsel referans oluşturur']
                # Derinlik kontrolü
                else:
                    depth = CategoryValidator._get_category_depth(new_parent_id)
                    if depth >= CategoryValidator.MAX_DEPTH:
                        errors['parent_id'] = [
                            f'Kategori hiyerarşisi en fazla {CategoryValidator.MAX_DEPTH} seviye olabilir'
                        ]
        
        # Kategori deaktif ediliyor mu ve alt ürünleri var mı?
        if 'is_active' in update_data and not update_data['is_active']:
            if category.is_active:  # Aktiften pasife geçiş
                # Alt kategorileri kontrol et
                child_count = Category.objects.filter(parent_id=category_id, is_active=True).count()
                if child_count > 0:
                    errors['is_active'] = [
                        f'Bu kategorinin {child_count} aktif alt kategorisi var. '
                        'Önce alt kategorileri deaktif ediniz.'
                    ]
                
                # Ürünleri kontrol et
                product_count = Product.objects.filter(category_id=category_id, status='active').count()
                if product_count > 0:
                    errors['is_active'] = [
                        f'Bu kategoride {product_count} aktif ürün var. '
                        'Önce ürünleri başka kategoriye taşıyın veya deaktif edin.'
                    ]
        
        return errors
    
    @staticmethod
    def _category_exists(category_id: int) -> bool:
        from .models import Category
        return Category.objects.filter(id=category_id).exists()
    
    @staticmethod
    def _category_is_active(category_id: int) -> bool:
        from .models import Category
        try:
            category = Category.objects.get(id=category_id)
            return category.is_active
        except Category.DoesNotExist:
            return False
    
    @staticmethod
    def _category_name_exists(name: str, lang: str, exclude_id: int = None) -> bool:
        from .models import Category
        field = f'name_{lang}'
        query = Category.objects.filter(**{field: name})
        if exclude_id:
            query = query.exclude(id=exclude_id)
        return query.exists()
    
    @staticmethod
    def _get_category_depth(category_id: int) -> int:
        """Kategorinin hiyerarşi derinliğini hesapla"""
        from .models import Category
        depth = 0
        current_id = category_id
        
        while current_id is not None:
            try:
                category = Category.objects.get(id=current_id)
                current_id = category.parent_id
                depth += 1
                
                if depth > 10:  # Sonsuz döngü koruması
                    break
            except Category.DoesNotExist:
                break
        
        return depth
    
    @staticmethod
    def _would_create_circular_reference(category_id: int, new_parent_id: int) -> bool:
        """
        Circular reference kontrolü
        Örnek: A > B > C yapısında, A'nın parent'ını C yaparsak döngü oluşur
        """
        from .models import Category
        
        current_id = new_parent_id
        visited = set()
        
        while current_id is not None:
            if current_id == category_id:
                return True  # Döngü tespit edildi
            
            if current_id in visited:
                return True  # Zaten döngü var
            
            visited.add(current_id)
            
            try:
                category = Category.objects.get(id=current_id)
                current_id = category.parent_id
            except Category.DoesNotExist:
                break
        
        return False


# views.py
class CategoryCreateView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]  # Sadece admin
    
    def post(self, request):
        """Yeni kategori oluştur"""
        
        # Validasyon
        validation_errors = CategoryValidator.validate_category_create(request.data)
        
        if validation_errors:
            return Response({
                'success': False,
                'errors': validation_errors,
                'message': 'Validasyon hataları mevcut'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Kategori oluştur
        try:
            category = Category.objects.create(
                name_tr=request.data['name_tr'],
                name_en=request.data['name_en'],
                parent_id=request.data.get('parent_id'),
                description_tr=request.data.get('description_tr', ''),
                description_en=request.data.get('description_en', ''),
                icon=request.data.get('icon', ''),
                is_active=request.data.get('is_active', True),
                display_order=request.data.get('display_order', 0),
                created_by=request.user
            )
            
            serializer = CategorySerializer(category)
            
            return Response({
                'success': True,
                'data': serializer.data,
                'message': 'Kategori başarıyla oluşturuldu'
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': 'Kategori oluşturulurken hata oluştu',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
```

---

## Attribute Ekleme/Güncelleme Validasyonu

### Frontend Validasyon (TypeScript)

```typescript
// types/attribute.ts
interface AttributeInput {
  key: string;
  name_tr: string;
  name_en: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'boolean' | 'date';
  is_required: boolean;
  is_filterable: boolean;
  is_variant: boolean;  // Varyant oluşturmak için kullanılır mı? (renk, beden gibi)
  display_order: number;
  options?: AttributeOption[];  // select/multiselect için
  validation_rules?: AttributeValidation;
}

interface AttributeOption {
  value: string;
  label_tr: string;
  label_en: string;
}

interface AttributeValidation {
  min?: number;
  max?: number;
  pattern?: string;  // regex
  custom_message?: string;
}

// validators/attributeValidator.ts
export class AttributeValidator {
  
  static validateAttributeCreate(data: AttributeInput): ValidationError[] {
    const errors: ValidationError[] = [];

    // Key (benzersiz tanımlayıcı)
    if (!data.key || data.key.trim() === '') {
      errors.push({ field: 'key', message: 'Attribute key zorunludur' });
    } else if (!/^[a-z_][a-z0-9_]*$/.test(data.key)) {
      errors.push({ 
        field: 'key', 
        message: 'Key küçük harf, rakam ve alt çizgi içerebilir (snake_case)' 
      });
    } else if (data.key.length < 2 || data.key.length > 50) {
      errors.push({ field: 'key', message: 'Key 2-50 karakter arası olmalıdır' });
    }

    // İsim (Türkçe)
    if (!data.name_tr || data.name_tr.trim() === '') {
      errors.push({ field: 'name_tr', message: 'Attribute adı (Türkçe) zorunludur' });
    } else if (data.name_tr.length < 2 || data.name_tr.length > 100) {
      errors.push({ field: 'name_tr', message: 'Attribute adı 2-100 karakter arası olmalıdır' });
    }

    // İsim (İngilizce)
    if (!data.name_en || data.name_en.trim() === '') {
      errors.push({ field: 'name_en', message: 'Attribute adı (İngilizce) zorunludur' });
    } else if (data.name_en.length < 2 || data.name_en.length > 100) {
      errors.push({ field: 'name_en', message: 'Attribute adı 2-100 karakter arası olmalıdır' });
    }

    // Tip
    const allowedTypes = ['text', 'number', 'select', 'multiselect', 'boolean', 'date'];
    if (!data.type) {
      errors.push({ field: 'type', message: 'Attribute tipi zorunludur' });
    } else if (!allowedTypes.includes(data.type)) {
      errors.push({ 
        field: 'type', 
        message: `Geçersiz tip. İzin verilenler: ${allowedTypes.join(', ')}` 
      });
    }

    // Select/Multiselect için options zorunlu
    if (data.type === 'select' || data.type === 'multiselect') {
      if (!data.options || data.options.length === 0) {
        errors.push({ 
          field: 'options', 
          message: 'Select/Multiselect tipi için seçenekler zorunludur' 
        });
      } else {
        // Her option'ı validate et
        data.options.forEach((option, index) => {
          if (!option.value || option.value.trim() === '') {
            errors.push({ 
              field: `options[${index}].value`, 
              message: `Seçenek ${index + 1}: Değer zorunludur` 
            });
          }
          if (!option.label_tr || option.label_tr.trim() === '') {
            errors.push({ 
              field: `options[${index}].label_tr`, 
              message: `Seçenek ${index + 1}: Türkçe etiket zorunludur` 
            });
          }
          if (!option.label_en || option.label_en.trim() === '') {
            errors.push({ 
              field: `options[${index}].label_en`, 
              message: `Seçenek ${index + 1}: İngilizce etiket zorunludur` 
            });
          }
        });

        // Duplicate değer kontrolü
        const values = data.options.map(opt => opt.value);
        const duplicates = values.filter((val, idx) => values.indexOf(val) !== idx);
        if (duplicates.length > 0) {
          errors.push({ 
            field: 'options', 
            message: `Duplicate değerler: ${duplicates.join(', ')}` 
          });
        }
      }
    }

    // Validation rules (number tipi için)
    if (data.type === 'number' && data.validation_rules) {
      const { min, max } = data.validation_rules;
      if (min !== undefined && max !== undefined && min > max) {
        errors.push({ 
          field: 'validation_rules', 
          message: 'Min değer max değerden büyük olamaz' 
        });
      }
    }

    // Display order
    if (data.display_order !== undefined) {
      if (!Number.isInteger(data.display_order)) {
        errors.push({ field: 'display_order', message: 'Sıralama tam sayı olmalıdır' });
      } else if (data.display_order < 0) {
        errors.push({ field: 'display_order', message: 'Sıralama negatif olamaz' });
      }
    }

    // Varyant kontrolü
    if (data.is_variant) {
      // Sadece belirli tipler varyant olabilir
      const variantAllowedTypes = ['text', 'select'];
      if (!variantAllowedTypes.includes(data.type)) {
        errors.push({ 
          field: 'is_variant', 
          message: `Varyant sadece ${variantAllowedTypes.join(', ')} tiplerinde kullanılabilir` 
        });
      }
    }

    return errors;
  }

  static validateAttributeUpdate(
    attributeId: number,
    original: AttributeInput,
    update: Partial<AttributeInput>
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!attributeId || attributeId <= 0) {
      errors.push({ field: 'id', message: 'Geçerli bir attribute ID\'si gerekli' });
    }

    // Key değiştirilemez (güncelleme sırasında)
    if (update.key !== undefined && update.key !== original.key) {
      errors.push({ 
        field: 'key', 
        message: 'Attribute key değiştirilemez. Yeni attribute oluşturun.' 
      });
    }

    // Tip değiştirilemez (mevcut verileri etkileyebilir)
    if (update.type !== undefined && update.type !== original.type) {
      errors.push({ 
        field: 'type', 
        message: 'Attribute tipi değiştirilemez. Bu mevcut ürün verilerini etkileyebilir.' 
      });
    }

    // Diğer alanları validate et
    if (update.name_tr !== undefined) {
      const error = this.validateField('name_tr', update.name_tr);
      if (error) errors.push({ field: 'name_tr', message: error });
    }

    if (update.name_en !== undefined) {
      const error = this.validateField('name_en', update.name_en);
      if (error) errors.push({ field: 'name_en', message: error });
    }

    // Zorunlu'dan opsiyonel'e geçiş uyarısı (error değil)
    if (update.is_required !== undefined && 
        original.is_required && 
        !update.is_required) {
      console.warn('Zorunlu attribute opsiyonel yapılıyor. Mevcut ürünler etkilenmeyecek.');
    }

    // Opsiyonel'den zorunlu'ya geçiş kontrolü
    if (update.is_required !== undefined && 
        !original.is_required && 
        update.is_required) {
      // Bu alanı doldurmayan ürünler olabilir
      // Backend'den kontrol edilmeli
      console.warn('Attribute zorunlu yapılıyor. Tüm ürünlerde bu alan dolu olmalı.');
    }

    return errors;
  }

  static validateField(field: string, value: any): string | null {
    if (field === 'name_tr' || field === 'name_en') {
      if (!value || value.trim() === '') return 'Attribute adı zorunludur';
      if (value.length < 2) return 'Attribute adı en az 2 karakter olmalıdır';
      if (value.length > 100) return 'Attribute adı en fazla 100 karakter olabilir';
    }

    if (field === 'key') {
      if (!value || value.trim() === '') return 'Key zorunludur';
      if (!/^[a-z_][a-z0-9_]*$/.test(value)) {
        return 'Key küçük harf, rakam ve alt çizgi içerebilir (snake_case)';
      }
    }

    return null;
  }
}

// Kullanım örneği - Dynamic Attribute Form
function AttributeForm() {
  const [formData, setFormData] = useState<AttributeInput>({
    key: '',
    name_tr: '',
    name_en: '',
    type: 'text',
    is_required: false,
    is_filterable: false,
    is_variant: false,
    display_order: 0,
    options: []
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleTypeChange = (newType: string) => {
    setFormData(prev => ({
      ...prev,
      type: newType as any,
      // Select/Multiselect için boş options array ekle
      options: (newType === 'select' || newType === 'multiselect') ? [] : undefined
    }));
  };

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [
        ...(prev.options || []),
        { value: '', label_tr: '', label_en: '' }
      ]
    }));
  };

  const removeOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options?.filter((_, i) => i !== index)
    }));
  };

  const updateOption = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options?.map((opt, i) => 
        i === index ? { ...opt, [field]: value } : opt
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasyon
    const validationErrors = AttributeValidator.validateAttributeCreate(formData);

    if (validationErrors.length > 0) {
      const errorMap: Record<string, string> = {};
      validationErrors.forEach(err => {
        errorMap[err.field] = err.message;
      });
      setErrors(errorMap);
      return;
    }

    // API call
    try {
      const response = await fetch('/api/attributes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.errors) {
          setErrors(errorData.errors);
        }
        return;
      }

      const attribute = await response.json();
      console.log('Attribute oluşturuldu:', attribute);
      
    } catch (error) {
      console.error('Hata:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Key */}
      <input
        type="text"
        placeholder="color, size, material..."
        value={formData.key}
        onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value }))}
      />

      {/* Type Select */}
      <select
        value={formData.type}
        onChange={(e) => handleTypeChange(e.target.value)}
      >
        <option value="text">Metin</option>
        <option value="number">Sayı</option>
        <option value="select">Seçim (Tek)</option>
        <option value="multiselect">Seçim (Çoklu)</option>
        <option value="boolean">Evet/Hayır</option>
        <option value="date">Tarih</option>
      </select>

      {/* Options (sadece select/multiselect için) */}
      {(formData.type === 'select' || formData.type === 'multiselect') && (
        <div>
          <h4>Seçenekler</h4>
          {formData.options?.map((option, index) => (
            <div key={index}>
              <input
                placeholder="Değer (value)"
                value={option.value}
                onChange={(e) => updateOption(index, 'value', e.target.value)}
              />
              <input
                placeholder="Etiket (TR)"
                value={option.label_tr}
                onChange={(e) => updateOption(index, 'label_tr', e.target.value)}
              />
              <input
                placeholder="Etiket (EN)"
                value={option.label_en}
                onChange={(e) => updateOption(index, 'label_en', e.target.value)}
              />
              <button type="button" onClick={() => removeOption(index)}>Sil</button>
            </div>
          ))}
          <button type="button" onClick={addOption}>Seçenek Ekle</button>
        </div>
      )}

      {/* Checkboxes */}
      <label>
        <input
          type="checkbox"
          checked={formData.is_required}
          onChange={(e) => setFormData(prev => ({ ...prev, is_required: e.target.checked }))}
        />
        Zorunlu Alan
      </label>

      <label>
        <input
          type="checkbox"
          checked={formData.is_filterable}
          onChange={(e) => setFormData(prev => ({ ...prev, is_filterable: e.target.checked }))}
        />
        Filtrelenebilir
      </label>

      <label>
        <input
          type="checkbox"
          checked={formData.is_variant}
          onChange={(e) => setFormData(prev => ({ ...prev, is_variant: e.target.checked }))}
        />
        Varyant Oluşturur (renk, beden gibi)
      </label>

      <button type="submit">Attribute Oluştur</button>
    </form>
  );
}
```

### Backend Validasyon (Python)

```python
# validators.py
import json
import re

class AttributeValidator:
    """Attribute validasyon kuralları"""
    
    KEY_MIN_LENGTH = 2
    KEY_MAX_LENGTH = 50
    NAME_MIN_LENGTH = 2
    NAME_MAX_LENGTH = 100
    ALLOWED_TYPES = ['text', 'number', 'select', 'multiselect', 'boolean', 'date']
    VARIANT_ALLOWED_TYPES = ['text', 'select']
    
    @staticmethod
    def validate_attribute_create(data: Dict[str, Any]) -> Dict[str, List[str]]:
        """Attribute oluşturma validasyonu"""
        errors = {}
        
        # Key
        key = data.get('key', '').strip()
        if not key:
            errors['key'] = ['Attribute key zorunludur']
        elif not re.match(r'^[a-z_][a-z0-9_]*$', key):
            errors['key'] = ['Key küçük harf, rakam ve alt çizgi içerebilir (snake_case)']
        elif len(key) < AttributeValidator.KEY_MIN_LENGTH or len(key) > AttributeValidator.KEY_MAX_LENGTH:
            errors['key'] = [f'Key {AttributeValidator.KEY_MIN_LENGTH}-{AttributeValidator.KEY_MAX_LENGTH} karakter arası olmalıdır']
        elif AttributeValidator._attribute_key_exists(key):
            errors['key'] = ['Bu key zaten kullanımda']
        
        # İsim (Türkçe)
        name_tr = data.get('name_tr', '').strip()
        if not name_tr:
            errors['name_tr'] = ['Attribute adı (Türkçe) zorunludur']
        elif len(name_tr) < AttributeValidator.NAME_MIN_LENGTH or len(name_tr) > AttributeValidator.NAME_MAX_LENGTH:
            errors['name_tr'] = [f'Attribute adı {AttributeValidator.NAME_MIN_LENGTH}-{AttributeValidator.NAME_MAX_LENGTH} karakter arası olmalıdır']
        
        # İsim (İngilizce)
        name_en = data.get('name_en', '').strip()
        if not name_en:
            errors['name_en'] = ['Attribute adı (İngilizce) zorunludur']
        elif len(name_en) < AttributeValidator.NAME_MIN_LENGTH or len(name_en) > AttributeValidator.NAME_MAX_LENGTH:
            errors['name_en'] = [f'Attribute adı {AttributeValidator.NAME_MIN_LENGTH}-{AttributeValidator.NAME_MAX_LENGTH} karakter arası olmalıdır']
        
        # Tip
        attr_type = data.get('type')
        if not attr_type:
            errors['type'] = ['Attribute tipi zorunludur']
        elif attr_type not in AttributeValidator.ALLOWED_TYPES:
            errors['type'] = [f"Geçersiz tip. İzin verilenler: {', '.join(AttributeValidator.ALLOWED_TYPES)}"]
        
        # Select/Multiselect için options kontrolü
        if attr_type in ['select', 'multiselect']:
            options = data.get('options', [])
            if not options:
                errors['options'] = ['Select/Multiselect tipi için seçenekler zorunludur']
            else:
                # Her option'ı validate et
                option_values = []
                for idx, option in enumerate(options):
                    if not option.get('value'):
                        errors[f'options[{idx}].value'] = [f'Seçenek {idx + 1}: Değer zorunludur']
                    else:
                        option_values.append(option['value'])
                    
                    if not option.get('label_tr'):
                        errors[f'options[{idx}].label_tr'] = [f'Seçenek {idx + 1}: Türkçe etiket zorunludur']
                    if not option.get('label_en'):
                        errors[f'options[{idx}].label_en'] = [f'Seçenek {idx + 1}: İngilizce etiket zorunludur']
                
                # Duplicate değer kontrolü
                if len(option_values) != len(set(option_values)):
                    errors['options'] = ['Seçenek değerleri benzersiz olmalıdır']
        
        # Validation rules
        if 'validation_rules' in data and data['validation_rules']:
            rules = data['validation_rules']
            if attr_type == 'number':
                min_val = rules.get('min')
                max_val = rules.get('max')
                if min_val is not None and max_val is not None and min_val > max_val:
                    errors['validation_rules'] = ['Min değer max değerden büyük olamaz']
        
        # Varyant kontrolü
        if data.get('is_variant', False):
            if attr_type not in AttributeValidator.VARIANT_ALLOWED_TYPES:
                errors['is_variant'] = [
                    f"Varyant sadece {', '.join(AttributeValidator.VARIANT_ALLOWED_TYPES)} tiplerinde kullanılabilir"
                ]
        
        # Display order
        display_order = data.get('display_order', 0)
        if not isinstance(display_order, int) or display_order < 0:
            errors['display_order'] = ['Sıralama negatif olmayan tam sayı olmalıdır']
        
        return errors
    
    @staticmethod
    def validate_attribute_update(attribute_id: int, update_data: Dict[str, Any]) -> Dict[str, List[str]]:
        """Attribute güncelleme validasyonu"""
        errors = {}
        
        # Attribute var mı?
        from .models import Attribute
        try:
            attribute = Attribute.objects.get(id=attribute_id)
        except Attribute.DoesNotExist:
            errors['id'] = ['Attribute bulunamadı']
            return errors
        
        # Key değiştirilemez
        if 'key' in update_data and update_data['key'] != attribute.key:
            errors['key'] = ['Attribute key değiştirilemez']
        
        # Tip değiştirilemez (mevcut verileri etkileyebilir)
        if 'type' in update_data and update_data['type'] != attribute.type:
            # Bu ürünü kullanan ürün var mı kontrol et
            product_count = ProductAttribute.objects.filter(attribute_key=attribute.key).count()
            if product_count > 0:
                errors['type'] = [
                    f'Bu attribute {product_count} üründe kullanılıyor. Tip değiştirilemez.'
                ]
        
        # Zorunlu'dan opsiyonel'e geçiş (uyarı, error değil)
        if 'is_required' in update_data:
            if attribute.is_required and not update_data['is_required']:
                # İzin ver ama log at
                pass
            elif not attribute.is_required and update_data['is_required']:
                # Opsiyonel'den zorunlu'ya geçiş
                # Bu alanı doldurmayan ürünler var mı kontrol et
                from django.db.models import Q
                empty_count = Product.objects.filter(
                    category__attributes__contains=attribute.key
                ).exclude(
                    Q(attributes__has_key=attribute.key) & 
                    ~Q(attributes__get(attribute.key)='')
                ).count()
                
                if empty_count > 0:
                    errors['is_required'] = [
                        f'{empty_count} üründe bu alan boş. Zorunlu yapmadan önce doldurun.'
                    ]
        
        # İsim güncellemesi
        if 'name_tr' in update_data:
            name_tr = update_data['name_tr'].strip()
            if not name_tr:
                errors['name_tr'] = ['Attribute adı boş olamaz']
        
        if 'name_en' in update_data:
            name_en = update_data['name_en'].strip()
            if not name_en:
                errors['name_en'] = ['Attribute adı boş olamaz']
        
        return errors
    
    @staticmethod
    def _attribute_key_exists(key: str, exclude_id: int = None) -> bool:
        from .models import Attribute
        query = Attribute.objects.filter(key=key)
        if exclude_id:
            query = query.exclude(id=exclude_id)
        return query.exists()


# views.py
class AttributeCreateView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def post(self, request):
        """Yeni attribute oluştur"""
        
        # Validasyon
        validation_errors = AttributeValidator.validate_attribute_create(request.data)
        
        if validation_errors:
            return Response({
                'success': False,
                'errors': validation_errors,
                'message': 'Validasyon hataları mevcut'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Attribute oluştur
        try:
            attribute = Attribute.objects.create(
                key=request.data['key'],
                name_tr=request.data['name_tr'],
                name_en=request.data['name_en'],
                type=request.data['type'],
                is_required=request.data.get('is_required', False),
                is_filterable=request.data.get('is_filterable', False),
                is_variant=request.data.get('is_variant', False),
                display_order=request.data.get('display_order', 0),
                options=json.dumps(request.data.get('options', [])),
                validation_rules=json.dumps(request.data.get('validation_rules', {})),
                created_by=request.user
            )
            
            serializer = AttributeSerializer(attribute)
            
            return Response({
                'success': True,
                'data': serializer.data,
                'message': 'Attribute başarıyla oluşturuldu'
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': 'Attribute oluşturulurken hata oluştu',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
```

---

## Özet: Validasyon Best Practices

### Frontend
1. **Real-time validation** - Kullanıcı yazarken feedback
2. **On blur validation** - Alan terk edildiğinde kontrol
3. **Submit validation** - Form submit edildiğinde tam kontrol
4. **Clear error messages** - Kullanıcı dostu hata mesajları
5. **Visual feedback** - Hatalı alanları vurgula

### Backend
1. **Never trust frontend** - Her veriyi backend'de de kontrol et
2. **Database-level validation** - Veritabanı kısıtlamaları kullan
3. **Business rules** - İş kurallarını backend'de uygula
4. **Atomic operations** - Transaction kullan
5. **Detailed logging** - Hataları logla

### Genel
- **Consistent messages** - Frontend ve backend mesajları tutarlı olmalı
- **I18n support** - Çoklu dil desteği
- **Security** - SQL injection, XSS önlemleri
- **Performance** - Gereksiz API çağrılarından kaçın
- **User experience** - Kullanıcıyı yönlendir, engelleme

