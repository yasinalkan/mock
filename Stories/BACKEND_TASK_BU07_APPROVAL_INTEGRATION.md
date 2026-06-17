# TASK-BU-07: Ürün Onay Sürecine Entegrasyon

**Task ID:** TASK-BU-07  
**Modül:** Ürün Yönetimi / Benzerlik & Sahtecilik Analizi  
**Öncelik:** Yüksek  
**Tahmini Efor:** 2 gün  
**Bağımlılık:** TASK-BU-05 (Risk Puanlama), TASK-BU-06 (API Endpoint'ler)  
**Etiketler:** `backend`, `integration`, `approval-flow`, `business-logic`

> **v1.1 Güncelleme:** Barkod ve görsel benzerliği job tetikleme adımları kaldırıldı; yalnızca metin benzerliği job'ı tetiklenir.

---

## Kullanıcı Hikayesi

Bir **backend developer** olarak,  
**Mevcut ürün onay (audit) akışına sahtecilik analizi adımını entegre etmek** istiyorum,  
Böylece **ürün onaya gönderildiğinde analiz otomatik tetiklensin, yüksek riskli ürünler CSA incelemesine alınsın ve onay kararı risk seviyesine göre şekillenebilsin**,  
Bu sayede **CSA Admin sahtecilik riski taşıyan ürünleri normal ürün kuyruğundan ayırt ederek öncelikli olarak inceleyebilir**.

---

## Kabul Kriterleri

### AC1: Otomatik Analiz Tetikleme — Ürün Onaya Gönderildiğinde

- **Varsayılan olarak** Tedarikçi ürünü "Onaya Gönder" aksiyonunu gerçekleştirmiştir
- **Ne zaman** Ürünün `status` alanı `pending_approval` olarak değiştirilirse
- **O zaman** Sistem otomatik olarak şunları yapar:
  - Metin benzerliği job'ı kuyruğa alınır (BU-03)
  - Job tamamlandığında risk puanlama motoru (BU-05) otomatik olarak çalışır
- **Ve** Bu süreç ürünün normal `pending_approval` akışını bloklamaz; paralel çalışır
- **Ve** Tetikleme mekanizması ürün model hook'u (post_save signal veya event) üzerinden çalışır

### AC2: Risk Seviyesine Göre Onay Akışı Yönlendirmesi

- **Varsayılan olarak** Risk analizi tamamlanmıştır
- **Ne zaman** Risk puanlama motoru sonucu `counterfeit_flags` tablosuna yazıldığında
- **O zaman** Sistem risk seviyesine göre şu aksiyonları gerçekleştirir:

| Risk Seviyesi | Aksiyon |
|---|---|
| `low` | Normal onay kuyruğuna girer, ek müdahale yok |
| `medium` | Onay kuyruğunda sarı uyarı işareti ile gösterilir |
| `high` | Onay kuyruğunda kırmızı işaret; inceleme öncesinde sahtecilik analizi ekranı açılır |
| `critical` | Ürün otomatik olarak `flagged_for_review` statüsüne geçirilir; normal onay akışı askıya alınır |

- **Ve** `flagged_for_review` statüsü şu anlama gelir: CSA Admin önce BU-06 "İnceleme Kararı" endpoint'i üzerinden karara varmalıdır; ardından onay / red kararı verilebilir
- **Ve** CSA Standart kullanıcısı `high` ve `critical` ürünleri onaylayamaz; yalnızca CSA Admin onaylayabilir

### AC3: Yeni Ürün Statüsü: `flagged_for_review`

- **Varsayılan olarak** `products` tablosundaki `status` Enum'ı mevcuttur
- **Ne zaman** Migration çalıştırıldığında
- **O zaman** `status` Enum'ına yeni değer eklenir: `flagged_for_review`
- **Ve** Bu statüdeki ürünler:
  - Ecom'a senkronize edilmez
  - Tedarikçiye "İnceleniyor" olarak gösterilir
  - CSA Admin listesinde "Sahtecilik İncelemesi Bekliyor" filtresi ile görünür
- **Ve** `flagged_for_review` → `pending_approval` geçişi yalnızca CSA Admin "Sahte Değil / Dismiss" kararından sonra gerçekleşir
- **Ve** `flagged_for_review` → `rejected` geçişi yalnızca CSA Admin "Sahte Ürün Onayla" kararından sonra gerçekleşir

### AC4: Onay Kararı Validasyonu — Yüksek Riskli Ürünler İçin Zorunlu İnceleme

- **Varsayılan olarak** CSA Admin veya Standart ürünü onaylamak ya da reddetmek üzeredir
- **Ne zaman** `PATCH /api/products/{id}/status` (onay/red endpoint'i) isteği gelirse
- **O zaman** Sistem şu validasyonu yapar:
  - Ürünün `counterfeit_flags` kaydı var mı?
  - `risk_level` `high` veya `critical` mi?
  - İnceleme kararı (`reviewed_at`) alınmış mı?
- **Ve** `high`/`critical` riskli ürün için inceleme kararı alınmadan onay verilmeye çalışılırsa: `403 Forbidden` + açıklayıcı hata mesajı döner
- **Ve** `medium`/`low` riskli ürünler için ek validasyon olmadan onay / red kararı verilebilir

### AC5: Analiz Tamamlanmadan Önce Onay Talebi

- **Varsayılan olarak** CSA Admin analiz tamamlanmadan ürünü onaylamak istemektedir
- **Ne zaman** Analiz job'ları henüz tamamlanmamışken onay endpoint'ine istek gelirse
- **O zaman** Sistem şunları yapar:
  - Mevcut analiz durumunu (job'ların tamamlanma yüzdesi) döner
  - Analiz tamamlanmadan onay verilmesine izin verilip verilmeyeceği konfigüre edilebilir:
    - `require_analysis_before_approval: true` (varsayılan) → 423 Locked döner
    - `require_analysis_before_approval: false` → Uyarıyla birlikte onay verilir

### AC6: Tedarikçiye Geri Bildirim

- **Varsayılan olarak** Ürün `flagged_for_review` statüsüne geçmiştir
- **Ne zaman** Tedarikçi ürün detayını görüntülerse
- **O zaman** Tedarikçiye şu mesaj gösterilir:
  - Statü: "İnceleniyor"
  - Detay: "Ürününüz ek güvenlik incelemesine alınmıştır. İnceleme tamamlandıktan sonra bildirim alacaksınız."
- **Ve** Sahtecilik analiz sonucu veya risk detayları tedarikçiye gösterilmez (güvenlik)
- **Ve** CSA `confirmed_counterfeit` kararı verirse tedarikçiye red bildirimi gider:
  - "Ürününüz platform standartlarını karşılamadığı için reddedilmiştir."

---

## Teknik Gereksinimler

### TR1: Ürün Statüsü Değişikliğinde Hook Mekanizması

```python
# Django signal örneği
@receiver(post_save, sender=Product)
def on_product_status_change(sender, instance, **kwargs):
    if instance.status == ProductStatus.PENDING_APPROVAL:
        # Metin benzerliği job'ını kuyruğa al
        analyze_product_text_similarity.delay(instance.id)
        # Job tamamlandığında risk motoru otomatik tetiklenir (BU-05)

# Event-driven alternatif (Retter event'i)
# product.pending_approval → consumer → job tetikleme
```

### TR2: Risk Analizi Tamamlandığında Aksiyon

```python
@receiver(analysis_completed, sender=CounterfeitRiskEngine)
def on_risk_analysis_completed(sender, product_id, risk_level, **kwargs):
    if risk_level == RiskLevel.CRITICAL:
        Product.objects.filter(id=product_id).update(
            status=ProductStatus.FLAGGED_FOR_REVIEW,
            counterfeit_risk_level=risk_level
        )
        # BU-08: CSA Admin bildirim
        send_counterfeit_alert.delay(product_id)
    else:
        # Ürün pending_approval statüsünde kalır
        Product.objects.filter(id=product_id).update(
            counterfeit_risk_level=risk_level,
            similarity_analyzed_at=now()
        )
```

### TR3: Onay Endpoint'ine Validasyon Ekleme (Mevcut Endpoint Güncelleme)

```python
def validate_approval_allowed(product: Product, actor: User) -> None:
    flag = CounterfeitFlag.objects.filter(product=product).first()

    if not flag:
        return  # Analiz yapılmamış, sorun yok

    if flag.risk_level in ["high", "critical"]:
        if not flag.reviewed_at:
            raise PermissionDenied(
                "Bu ürün için sahtecilik incelemesi tamamlanmadan onay verilemez."
            )
        if flag.status == "confirmed_counterfeit":
            raise PermissionDenied(
                "Bu ürün sahte olarak onaylanmıştır; standart onay verilemez."
            )

    if flag.risk_level in ["high", "critical"] and not actor.is_csa_admin:
        raise PermissionDenied(
            "Yüksek riskli ürünler yalnızca CSA Admin tarafından onaylanabilir."
        )
```

### TR4: `products` Tablosu Status Enum Güncellemesi

```sql
-- Migration
ALTER TYPE product_status_enum ADD VALUE 'flagged_for_review'
  AFTER 'pending_approval';
```

### TR5: Konfigürasyon Tablosu Eklemeleri

```
risk_scoring_config ek değerleri:
  key: "require_analysis_before_approval"   value: "true"
  key: "auto_flag_on_critical"              value: "true"
  key: "high_risk_requires_admin_approval"  value: "true"
```

---

## Kullanıcı Senaryoları

### Senaryo 1: Normal Akış (Düşük Risk)
1. Tedarikçi ürünü onaya gönderir → `pending_approval`
2. Analiz job'ları paralel çalışır
3. Risk skoru 15 → `risk_level: low`
4. Ürün `pending_approval` statüsünde kalır
5. CSA Standart normal ürün listesinde görür ve onaylar

### Senaryo 2: Kritik Risk — Otomatik Durdurma
1. Tedarikçi ürünü onaya gönderir → `pending_approval`
2. Analiz tamamlanır: risk skoru 88 → `risk_level: critical`
3. Ürün otomatik olarak `flagged_for_review` statüsüne geçer
4. CSA Admin "Sahtecilik İncelemesi Bekliyor" listesinde görür
5. CSA Admin analiz detaylarını inceler ve `confirmed_counterfeit` kararı verir
6. Ürün `rejected` statüsüne geçer, tedarikçiye bildirim gider

### Senaryo 3: Yüksek Risk — Zorunlu İnceleme
1. Risk skoru 60 → `risk_level: high`
2. CSA Standart ürünü onaylamaya çalışır → 403 Forbidden
3. CSA Admin inceleme kararını verir: `confirmed_legitimate`
4. Ürün `pending_approval` statüsüne döner
5. CSA Standart artık onaylayabilir

---

## Kapsam Dışı

- Frontend onay ekranı güncellemeleri (ayrı frontend story)
- Tedarikçi itiraz mekanizması — gelecek sprint
- Otomatik onay (auto-approve low-risk products) — gelecek sprint

---

## Test Senaryoları

### Unit Tests
1. `test_analysis_triggered_on_pending_approval()` — Status değişince job kuyruğa alınıyor mu
2. `test_critical_risk_changes_status_to_flagged()` — Critical risk → `flagged_for_review`
3. `test_approval_blocked_without_review()` — High risk ürün incelemesiz onaylanamaz
4. `test_csa_standard_cannot_approve_high_risk()` — Standart kullanıcı high risk onaylayamaz
5. `test_low_risk_approval_unblocked()` — Low risk ürün normal onaylanabilir

### Integration Tests
1. `test_end_to_end_critical_flow()` — Submission → analysis → flagged → review → reject
2. `test_analysis_does_not_block_ui()` — Analiz sürerken ürün `pending_approval` listesinde görünüyor

---

## Definition of Done (DoD)

✅ Status hook mekanizması çalışıyor  
✅ `flagged_for_review` statüsü migration ile eklendi  
✅ Onay validasyon kontrolü integration testlerden geçiyor  
✅ Tedarikçiye maskelenmiş geri bildirim doğru gösteriliyor  
✅ Konfigürasyon değerleri seed dosyasında mevcut  
✅ Code review tamamlandı  

---

## Tahmini Efor

| Alt Görev | Süre |
|---|---|
| Hook mekanizması (signal / event consumer) | 0.5 gün |
| `flagged_for_review` statüsü migration | 0.5 gün |
| Onay endpoint'ine validasyon ekleme | 0.5 gün |
| Testler | 0.5 gün |
| **Toplam** | **2 gün** |
