# Data Model Cleanup: Removing Draft Products

## Current State
The system currently has **TWO conflicting concepts**:
1. Draft products in `mockData.products` (status: 'draft')
2. Requests in `mockData.requests` (product_create, product_update)

## The Ideal Model
**Products** and **Requests** must be completely separate:
- **Products**: Real system items (status: active, passive, rejected, etc. - NO draft)
- **Requests**: Supplier submissions (only become products when approved by admin)

## Action Items

### 1. Remove ALL Draft Products from mockData.products
**Draft product IDs to remove:**
- ID: 9 (Siyah Deri Ceket - Black Leather Jacket)
- ID: 10 (Kırmızı Elbise - Red Dress)
- ID: 20 (Siyah Saat - Black Watch)
- ID: 21 (Beyaz Spor Ayakkabı - White Sports Shoes)
- ID: 22 (?)
- ID: 23 (?)
- ID: 24 (?)
- ID: 25 (?)
- ID: 26 (?)
- ID: 27 (?)
- ID: 28 (?)

**Locations in clean.html:**
- Lines ~1340-2228: All draft products in mockData.products definition

### 2. Verify All Requests Are Complete
Ensure all requests in mockData.requests have complete product information:
- product_create requests should have: name, sku, categoryId, brandId, attributes, images, etc.
- product_update requests should reference existing products

### 3. Clean Up Code References
Remove or update code that:
- Treats draft products as editable items for suppliers
- Filters products by `status === 'draft'`
- Has special handling for draft status
- Submits draft products for review (this should be request approval instead)

**Files to update:**
- clean.html: Product filters, dashboard counts, tabs logic
- script.js: Draft product handling logic

### 4. Update UI Logic
- Remove "Taslak" (Draft) status from status options
- Update dashboard to show request counts instead of draft product counts
- Remove "Submit for review" for draft products (use request approval instead)
- Update product tabs to not show draft status

## Benefits After Cleanup
✓ Clean separation: Products vs Requests  
✓ No duplicate data  
✓ Clear business logic: requests must be approved before becoming products  
✓ Simpler data model  
✓ No conflicts  

## Timeline
1. Remove draft products from mockData
2. Update UI logic and filters
3. Test all workflows
4. Verify no broken references

