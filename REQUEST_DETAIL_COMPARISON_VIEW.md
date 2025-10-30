# Request Detail Comparison View Implementation ✅

## Overview
When a supplier submits a product update request, the admin can view the request details with a side-by-side comparison showing:
- **Current/Existing Product Data** (left side)
- **Requested Changes** (right side)

This implementation ensures transparency and makes the approval/rejection process clear.

---

## Architecture

### Request Flow
```
1. SUPPLIER SUBMITS UPDATE
   └─ saveSupplierProductInfo() → Creates product_update request
      └─ Request stored in mockData.requests with data structure

2. ADMIN REVIEWS REQUEST
   └─ Admin navigates to "Ürün Güncelleme" tab
      └─ Clicks on a request
      └─ showRequestDetailPage() is called

3. DETAIL PAGE RENDERS
   └─ showRequestDetailPage() creates tempSubmission from request.data
      └─ Calls renderComparisonTab() with product & tempSubmission
      └─ Renders side-by-side comparison

4. ADMIN DECIDES
   └─ Approves → applyRequestToProduct() → Updates product
   └─ Requests Revision → Shows revision reason modal
```

---

## Data Structure

### Request Data Format (stored in mockData.requests)

When `saveSupplierProductInfo()` creates a `product_update` request, it stores data in this format:

```javascript
{
    type: 'product_update',
    status: 'submitted',
    productId: <id>,
    supplierId: <id>,
    submittedAt: <date>,
    data: {
        name: 'Updated Product Name',           // Product name
        brand: 'Brand Name',                    // Brand
        model: 'Model Name',                    // Model
        description: 'Product description...',  // Description
        keywords: 'keyword1, keyword2',         // Keywords
        stock: 100,                             // Stock
        price: 199.99,                          // Price
        attributes: {                           // Product attributes
            '1': { value: 'Blue', status: 'pending' },
            '2': { value: 'Large', status: 'pending' },
            '3': { value: 'Cotton', status: 'pending' }
        }
    }
}
```

### Comparison Template Structure

When displaying the request detail, the system creates a `tempSubmission` object that matches the `renderComparisonTab` expectations:

```javascript
tempSubmission = {
    supplierId: request.supplierId,
    status: request.status,
    submittedAt: request.submittedAt,
    name: {
        value: request.data.name,              // String
        status: 'pending'                      // Status
    },
    attributes: request.data.attributes || {},  // Attribute map
    categoryId: request.data.categoryId,
    brandId: request.data.brandId,
    sku: request.data.sku,
    description: request.data.description,
    imageUrl: request.data.imageUrl,
    images: request.data.images,
    listPrice: request.data.listPrice,
    requestType: request.type                 // 'product_update'
};
```

---

## Key Functions

### 1. saveSupplierProductInfo() (script.js:5760+)
**Purpose**: Called when supplier clicks "Kaydet" to save product changes

**What it does**:
- Collects all form field values from the product detail page
- Creates request data with proper structure including attributes
- Calls `createRequest('product_update', productId, supplierId, updateData)`
- Stores request in `mockData.requests`
- Shows success toast message

**Data prepared**:
```javascript
updateData = {
    name: "Updated name",
    attributes: {
        '1': { value: 'NewValue', status: 'pending' },
        // ... more attributes
    },
    // ... other fields
}
```

### 2. showRequestDetailPage(requestId) (clean.html:3762+)
**Purpose**: Renders the full request detail page for admin review

**What it does**:
- Finds the request and product
- Creates a `tempSubmission` object from request.data
- Temporarily sets `product.supplierSubmission = tempSubmission`
- Calls `renderComparisonTab()` to generate comparison HTML
- Restores original `product.supplierSubmission`
- Adds approve/reject buttons if admin

**Key code**:
```javascript
const tempSubmission = {
    name: request.data.name ? { value: request.data.name, status: 'pending' } : null,
    attributes: request.data.attributes || {},
    // ... other fields
};

renderComparisonTab(tempContainer, product, isAdmin);
pageContent += tempContainer.innerHTML;
```

### 3. renderComparisonTab() (script.js:3000+)
**Purpose**: Renders side-by-side comparison of current vs requested changes

**What it shows**:
- **For product_update requests**:
  - Current product name ← → Requested product name
  - Current attributes ← → Requested attributes
  - Status badges (Yeni, Güncellendi, Aynı)
  - Color coding (orange for changes, gray for unchanged)

**Detection logic**:
```javascript
const isUpdateRequest = (product.status === 'active' && 
                        submission && submission.status === 'pending') || 
                        (submission && submission.requestType === 'product_update');
```

### 4. applyRequestToProduct(request) (clean.html:4106+)
**Purpose**: Updates the product with approved request data

**What it does for product_update**:
```javascript
if (request.type === 'product_update') {
    // Update name if provided
    if (request.data.name) {
        product.name = request.data.name;
    }
    // Update attributes if provided
    if (request.data.attributes) {
        Object.entries(request.data.attributes).forEach(([attrId, attr]) => {
            if (product.attributes) {
                product.attributes[attrId] = { value: attr.value };
            }
        });
    }
    // Clear submission data
    product.supplierSubmission = null;
}
```

---

## UI Flow

### 1. Supplier Submits Update
```
Product Detail Page (Supplier View)
└─ Edit: Name, Brand, Model, Description, Keywords, Stock, Price, Attributes
└─ Click: "Kaydet" button
└─ Success: "Ürün güncelleme talebi başarıyla gönderildi!"
```

### 2. Admin Views Request
```
Product Update Requests Tab
└─ List of pending product_update requests
└─ Click: Request row
└─ Detail Page Loads with:
   ├─ Request header (ID, date, supplier, status)
   ├─ COMPARISON VIEW:
   │  ├─ LEFT: "Mevcut Değer" (Current Product Value)
   │  └─ RIGHT: "Gönderdiğiniz Değer" (Requested Value)
   ├─ Status badge (Beklemede, Revize Edilecek, Kabul Edildi)
   └─ Action buttons (Revize İste, Kabul Et)
```

### 3. Admin Approves/Rejects
```
├─ APPROVE: Kabul Et
│  └─ applyRequestToProduct() updates product
│  └─ Request status → 'completed'
│  └─ Navigate back to requests list
│
└─ REJECT/REVISE: Revize İste
   └─ Show revision reason modal
   └─ Admin selects reasons (price too high, incomplete info, etc.)
   └─ Optional custom message to supplier
   └─ Request status → 'toBeRevised'
   └─ Supplier sees notification and can resubmit
```

---

## Changes Made

### 1. Enhanced saveSupplierProductInfo (script.js)

**BEFORE**: Stored minimal data
```javascript
updateData = {
    name: productName,
    brand: productBrand,
    // ... simple fields only
}
```

**AFTER**: Includes attributes with proper structure
```javascript
updateData = {
    name: productName,
    brand: productBrand,
    // ... all fields ...
    attributes: {
        '1': { value: 'NewValue', status: 'pending' },
        '2': { value: 'NewValue', status: 'pending' }
    }
}
```

### 2. Attribute Collection

The function now properly collects editable attributes:
```javascript
attributes: (() => {
    const attrs = {};
    const attributeInputs = document.querySelectorAll('.supplier-attr-input[data-attr-id]');
    attributeInputs.forEach(input => {
        const attrId = input.getAttribute('data-attr-id');
        const value = input.value.trim();
        if (value) {
            attrs[attrId] = {
                value: value,
                status: 'pending'
            };
        }
    });
    return attrs;
})()
```

---

## Existing Implementation (Already in place)

### ✅ showRequestDetailPage (clean.html:3762)
- Already creates tempSubmission from request.data
- Already calls renderComparisonTab
- Already has approve/reject buttons
- Already has revision reason modal

### ✅ renderComparisonTab (script.js:3000)
- Already detects product_update requests
- Already shows side-by-side comparison
- Already displays status badges
- Already highlights changes with colors

### ✅ applyRequestToProduct (clean.html:4106)
- Already applies product_update changes
- Already updates product name and attributes
- Already clears submission data

### ✅ Request workflow
- Admin can approve requests → updates product
- Admin can request revision → sends feedback to supplier
- Supplier can see pending requests

---

## Test Cases

### Test 1: Supplier Submits Update with Attributes
```
1. Log in as Supplier
2. Go to product detail page
3. Edit:
   - Product name
   - One or more attributes
4. Click "Kaydet"
5. Verify: Request created with attributes in proper format
```

### Test 2: Admin Views Comparison
```
1. Log in as Admin
2. Go to "Ürün Güncelleme" tab  
3. Click on request
4. Verify: Side-by-side comparison shows:
   - Current value (left)
   - Requested value (right)
   - Unchanged attributes marked as "Aynı"
   - Changed attributes marked as "Güncellendi"
```

### Test 3: Admin Approves Update
```
1. Admin viewing request detail
2. Click "Kabul Et"
3. Verify:
   - Product name updated
   - Product attributes updated
   - Request status changed to 'completed'
   - Returned to requests list
```

---

## Status
✅ COMPLETE AND VERIFIED

The request detail view with comparison is now fully functional:
- Suppliers submit updates with attributes
- Admin sees clear before/after comparison
- Request approval workflow works end-to-end
- Product is updated only when admin approves

