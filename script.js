// Function to get commission rate for a supplier and product (for display purposes)
function getSupplierCommissionRate(productId, supplierId) {
    const product = mockData.products.find(p => p.id === productId);
    if (!product) {
        return 12; // Default commission rate
    }
    
    const commissionRules = mockData.commissionRules || [];
    const currentDate = new Date();
    
    // Priority: 1. Supplier+Category rule, 2. Supplier-specific rule, 3. Category-specific rule, 4. Default rate
    const supplierCategoryRule = commissionRules.find(rule => 
        rule.type === 'supplier_category' && 
        rule.supplierId === supplierId &&
        rule.categoryId === product.categoryId &&
        new Date(rule.startDate) <= currentDate &&
        (!rule.endDate || new Date(rule.endDate) >= currentDate)
    );
    
    const supplierRule = commissionRules.find(rule => 
        rule.type === 'supplier' && 
        rule.supplierId === supplierId &&
        new Date(rule.startDate) <= currentDate &&
        (!rule.endDate || new Date(rule.endDate) >= currentDate)
    );
    
    const categoryRule = commissionRules.find(rule => 
        rule.type === 'category' && 
        rule.categoryId === product.categoryId &&
        new Date(rule.startDate) <= currentDate &&
        (!rule.endDate || new Date(rule.endDate) >= currentDate)
    );
    
    if (supplierCategoryRule) {
        return supplierCategoryRule.rate;
    } else if (supplierRule) {
        return supplierRule.rate;
    } else if (categoryRule) {
        return categoryRule.rate;
    }
    
    return 12; // Default rate
}

// Function to calculate commission rate for a specific item
function calculateItemCommissionRate(item, order) {
    if (!item || !order) {
        return 12; // Default commission rate
    }
    
    const commissionRules = mockData.commissionRules || [];
    
    // Find the product to get category and supplier info
    const product = mockData.products.find(p => p.sku === item.sku);
    if (!product) {
        return 12; // Default rate if product not found
    }
    
    // Find applicable commission rule
    let applicableRate = 12; // Default rate
    
    // Priority: 1. Supplier+Category rule, 2. Supplier-specific rule, 3. Category-specific rule, 4. Default rate
    const supplierCategoryRule = commissionRules.find(rule => 
        rule.type === 'supplier_category' && 
        rule.supplierId === order.supplierId &&
        rule.categoryId === product.categoryId &&
        new Date(rule.startDate) <= new Date(order.date) &&
        (!rule.endDate || new Date(rule.endDate) >= new Date(order.date))
    );
    
    const supplierRule = commissionRules.find(rule => 
        rule.type === 'supplier' && 
        rule.supplierId === order.supplierId &&
        new Date(rule.startDate) <= new Date(order.date) &&
        (!rule.endDate || new Date(rule.endDate) >= new Date(order.date))
    );
    
    const categoryRule = commissionRules.find(rule => 
        rule.type === 'category' && 
        rule.categoryId === product.categoryId &&
        new Date(rule.startDate) <= new Date(order.date) &&
        (!rule.endDate || new Date(rule.endDate) >= new Date(order.date))
    );
    
    if (supplierCategoryRule) {
        applicableRate = supplierCategoryRule.rate;
    } else if (supplierRule) {
        applicableRate = supplierRule.rate;
    } else if (categoryRule) {
        applicableRate = categoryRule.rate;
    }
    
    return applicableRate;
}
// Function to calculate weighted average commission rate for an order
function calculateWeightedAverageCommissionRate(order) {
    if (!order || !order.items || order.items.length === 0) {
        return 12; // Default commission rate
    }
    
    const commissionRules = mockData.commissionRules || [];
    let totalWeightedRate = 0;
    let totalAmount = 0;
    
    // Process each item in the order
    order.items.forEach(item => {
        const itemAmount = item.total || 0;
        if (itemAmount <= 0) return;
        
        // Find the product to get category and supplier info
        const product = mockData.products.find(p => p.sku === item.sku);
        if (!product) {
            // If product not found, use default rate
            totalWeightedRate += itemAmount * 12; // Default 12%
            totalAmount += itemAmount;
            return;
        }
        
        // Find applicable commission rule
        let applicableRate = 12; // Default rate
        
        // Priority: 1. Supplier+Category rule, 2. Supplier-specific rule, 3. Category-specific rule, 4. Default rate
        const supplierCategoryRule = commissionRules.find(rule => 
            rule.type === 'supplier_category' && 
            rule.supplierId === order.supplierId &&
            rule.categoryId === product.categoryId &&
            new Date(rule.startDate) <= new Date(order.date) &&
            (!rule.endDate || new Date(rule.endDate) >= new Date(order.date))
        );
        
        const supplierRule = commissionRules.find(rule => 
            rule.type === 'supplier' && 
            rule.supplierId === order.supplierId &&
            new Date(rule.startDate) <= new Date(order.date) &&
            (!rule.endDate || new Date(rule.endDate) >= new Date(order.date))
        );
        
        const categoryRule = commissionRules.find(rule => 
            rule.type === 'category' && 
            rule.categoryId === product.categoryId &&
            new Date(rule.startDate) <= new Date(order.date) &&
            (!rule.endDate || new Date(rule.endDate) >= new Date(order.date))
        );
        
        if (supplierCategoryRule) {
            applicableRate = supplierCategoryRule.rate;
        } else if (supplierRule) {
            applicableRate = supplierRule.rate;
        } else if (categoryRule) {
            applicableRate = categoryRule.rate;
        }
        
        // Add to weighted calculation
        totalWeightedRate += itemAmount * applicableRate;
        totalAmount += itemAmount;
    });
    
    // Calculate weighted average
    if (totalAmount > 0) {
        return Math.round((totalWeightedRate / totalAmount) * 100) / 100; // Round to 2 decimal places
    }
    
    return 12; // Default rate if no valid items
}
// Export function for orders
function exportOrdersToCSV(userType) {
  const orders = Array.isArray(mockData.orders) ? mockData.orders : [];
  const suppliers = Array.isArray(mockData.suppliers) ? mockData.suppliers : [];
  
  // Get filtered orders based on current filters
  let filteredOrders = orders;
  
  if (userType === 'admin') {
    const filterType = document.getElementById('ord-filter-type')?.value || '';
    const filterValue = (document.getElementById('ord-filter-value')?.value || '').toLowerCase();
    const supplierFilter = document.getElementById('ord-supplier-id')?.value || '';
    const statusFilter = document.getElementById('ord-status')?.value || '';
    const dateRangeFilter = document.getElementById('ord-date-range')?.value || '';
    
    filteredOrders = orders.filter(o => {
      // Supplier filter (separate)
      if (supplierFilter && String(o.supplierId) !== String(supplierFilter)) return false;
      
      // Unified filter
      if (filterValue) {
        if (filterType === 'search') {
          const text = `${o.id} ${o.status || ''} ${(o.items || []).map(i => `${i.sku} ${i.name || ""}`).join(' ')}`.toLowerCase();
          if (!text.includes(filterValue)) return false;
        } else if (filterType === 'customer') {
          const name = (o.shippingAddress?.name || '').toLowerCase();
          const phone = (o.shippingAddress?.phone || '').toLowerCase();
          const email = (o.shippingAddress?.email || '').toLowerCase();
          if (!name.includes(filterValue) && !phone.includes(filterValue) && !email.includes(filterValue)) return false;
        }
      }
      
      // Status filter (separate)
      if (statusFilter && o.status !== statusFilter) return false;
      
      // Date range filter (separate)
      if (dateRangeFilter && o.date) {
        const orderDate = new Date(o.date);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        switch (dateRangeFilter) {
          case 'today':
            if (orderDate < today) return false;
            break;
          case 'week':
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            if (orderDate < weekAgo) return false;
            break;
          case 'month':
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            if (orderDate < monthAgo) return false;
            break;
          case 'quarter':
            const quarterAgo = new Date(today);
            quarterAgo.setMonth(quarterAgo.getMonth() - 3);
            if (orderDate < quarterAgo) return false;
            break;
          case 'year':
            const yearAgo = new Date(today);
            yearAgo.setFullYear(yearAgo.getFullYear() - 1);
            if (orderDate < yearAgo) return false;
            break;
        }
      }
      
      return true;
    });
  } else if (userType === 'supplier') {
    const currentUser = window.currentUser || {};
    const supplierId = currentUser.supplierId;
    if (supplierId) {
      filteredOrders = orders.filter(o => String(o.supplierId) === String(supplierId));
    }
    
    // Apply additional filters
    const filterType = document.getElementById('sord-filter-type')?.value || 'search';
    const filterValue = (document.getElementById('sord-filter-value')?.value || '').toLowerCase();
    const statusFilter = document.getElementById('sord-status')?.value || '';
    const dateRangeFilter = document.getElementById('sord-date-range')?.value || '';

    filteredOrders = filteredOrders.filter(order => {
      // Unified filter
      if (filterValue) {
        if (filterType === 'search') {
          const searchText = `${order.id} ${(order.items || []).map(i => `${i.sku} ${i.name || ''}`).join(' ')}`.toLowerCase();
          if (!searchText.includes(filterValue)) return false;
        } else if (filterType === 'customer') {
          const name = (order.shippingAddress?.name || '').toLowerCase();
          const phone = (order.shippingAddress?.phone || '').toLowerCase();
          const email = (order.shippingAddress?.email || '').toLowerCase();
          if (!name.includes(filterValue) && !phone.includes(filterValue) && !email.includes(filterValue)) return false;
        }
      }
      
      // Status filter (separate)
      if (statusFilter && order.status !== statusFilter) return false;
      
      // Date range filter (separate)
      if (dateRangeFilter && order.date) {
        const orderDate = new Date(order.date);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        switch (dateRangeFilter) {
          case 'today': if (orderDate < today) return false; break;
          case 'week': const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7); if (orderDate < weekAgo) return false; break;
          case 'month': const monthAgo = new Date(today); monthAgo.setMonth(monthAgo.getMonth() - 1); if (orderDate < monthAgo) return false; break;
          case 'quarter': const quarterAgo = new Date(today); quarterAgo.setMonth(quarterAgo.getMonth() - 3); if (orderDate < quarterAgo) return false; break;
          case 'year': const yearAgo = new Date(today); yearAgo.setFullYear(yearAgo.getFullYear() - 1); if (orderDate < yearAgo) return false; break;
        }
      }
      
      return true;
    });
  }
  
  // Prepare CSV data
  const headers = userType === 'admin' 
    ? ['Sipariş ID', 'Tedarikçi', 'Müşteri', 'Ürün Sayısı', 'Toplam Adet', 'Tarih', 'Durum', 'Komisyon Oranı (%)', 'Tutar (₺)']
    : ['Sipariş ID', 'Müşteri', 'Ürün Sayısı', 'Toplam Adet', 'Tarih', 'Durum', 'Komisyon Oranı (%)', 'Tutar (₺)'];
  
  const csvData = filteredOrders.map(order => {
    const supplierName = (suppliers.find(s => String(s.id) === String(order.supplierId)) || {}).name || ('Tedarikçi ' + order.supplierId);
    const customerName = order.shippingAddress?.name || 'Bilinmiyor';
    const itemCount = (order.items || []).length;
    const totalItemQuantity = (order.items || []).reduce((sum, item) => sum + (item.qty || 0), 0);
    const dateStr = order.date ? new Date(order.date).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' }) : '-';
    const totalAmount = order.total || 0;
    const commissionRate = calculateWeightedAverageCommissionRate(order);
    
    if (userType === 'admin') {
      return [order.id, supplierName, customerName, itemCount, totalItemQuantity, dateStr, order.status, commissionRate.toFixed(2), totalAmount.toFixed(2)];
    } else {
      return [order.id, customerName, itemCount, totalItemQuantity, dateStr, order.status, commissionRate.toFixed(2), totalAmount.toFixed(2)];
    }
  });
  
  // Create CSV content
  const csvContent = [headers, ...csvData]
    .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  
  // Create and download file
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `siparisler_${userType}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Show success message
  if (typeof showToast === 'function') {
    showToast(`${filteredOrders.length} sipariş CSV olarak dışa aktarıldı.`);
  }
}
renderers['orders'] = () => {
  // Enforce access control
  if (window.currentUser?.role === 'supplier') {
    showModal('Erişim Yok', '<p>Bu sayfa sadece yöneticiler içindir.</p>', 'Kapat', closeModal);
    navigateTo('#dashboard'); return;
  }
  const orders = Array.isArray(mockData.orders) ? mockData.orders : [];
  const suppliers = Array.isArray(mockData.suppliers) ? mockData.suppliers
                   : Array.from(new Set(orders.map(o => o.supplierId))).map(id => ({ id, name: 'Tedarikçi ' + id }));
  // Ensure drawer/backdrop exist once globally so header/sidebar remain visible
  function ensureOrdersDrawer() {
    let backdrop = document.getElementById('orders-drawer-backdrop');
    let drawer = document.getElementById('orders-drawer');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'orders-drawer-backdrop';
      backdrop.className = 'orders-drawer-backdrop';
      document.body.appendChild(backdrop);
    }
    if (!drawer) {
      drawer = document.createElement('aside');
      drawer.id = 'orders-drawer';
      drawer.className = 'orders-drawer';
      drawer.innerHTML = `
      <div class="h-full flex flex-col bg-white">
        <div class="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-shopping-bag text-blue-600"></i>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900">Sipariş Detayı</h3>
                <p class="text-sm text-gray-500">Sipariş bilgilerini görüntüleyin ve düzenleyin</p>
              </div>
            </div>
          <div class="flex items-center gap-2">
              <button id="orders-save" class="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors shadow-sm">
                <i class="fas fa-save mr-2"></i>Kaydet
              </button>
              <button id="orders-drawer-close" class="px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors" title="Kapat">
                <i class="fas fa-times"></i>
              </button>
          </div>
        </div>
      </div>
        <div id="orders-drawer-body" class="p-6 overflow-auto flex-1 bg-gray-50"></div>
        </div>`;
      document.body.appendChild(drawer);
    }
  }
  ensureOrdersDrawer();
  // Set page title and render content into main layout
  if (typeof pageTitle !== 'undefined') pageTitle.textContent = 'Siparişler';
  if (!pageContent) return;
  pageContent.innerHTML = `
    <div class="space-y-4">
      <div class="flex flex-col gap-3">
      <div class="bg-white p-3 rounded-lg shadow-sm border">
        <div class="flex flex-col gap-3">
          <div class="flex flex-col md:flex-row md:items-end gap-3">
            <div class="flex-1 md:flex-none md:w-48">
              <label class="block text-xs font-medium text-gray-700 mb-1">Filtre Türü</label>
              <select id="ord-filter-type" class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                <option value="search">Sipariş ID / SKU / Ürün</option>
                <option value="customer">Müşteri (Ad, Telefon, E-posta)</option>
              </select>
            </div>
            <div class="flex-1" id="ord-filter-input-container">
              <label class="block text-xs font-medium text-gray-700 mb-1" id="ord-filter-label">Sipariş ID / SKU / Ürün</label>
              <input id="ord-filter-value" type="text" placeholder="Sipariş ID, SKU veya ürün adı..." class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div class="flex gap-2">
              <button id="ord-apply" class="px-3 py-1.5 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700">Uygula</button>
              <button id="ord-clear" class="px-3 py-1.5 text-sm rounded-md border hover:bg-gray-50">Temizle</button>
              <button id="ord-export" class="px-3 py-1.5 text-sm rounded-md bg-green-600 text-white hover:bg-green-700 flex items-center space-x-1">
                <i class="fas fa-download"></i>
                <span>Dışa Aktar</span>
              </button>
            </div>
          </div>
          <div class="flex flex-col md:flex-row md:items-end gap-3 pt-3 border-t border-gray-200">
            <div class="flex-1">
              <label class="block text-xs font-medium text-gray-700 mb-1">Tedarikçi</label>
              <div class="relative">
                <input id="ord-supplier-search" type="text" placeholder="Tedarikçi ara..." class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
                <div id="ord-supplier-dropdown" class="hidden absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  ${suppliers.map(s => `<div class="px-3 py-2 hover:bg-gray-100 cursor-pointer supplier-option" data-supplier-id="${s.id}">${s.name || ('Tedarikçi ' + s.id)}</div>`).join('')}
                </div>
              </div>
              <input type="hidden" id="ord-supplier-id" value="" />
            </div>
            <div class="flex-1">
              <label class="block text-xs font-medium text-gray-700 mb-1">Durum</label>
              <select id="ord-status" class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Tüm Durumlar</option>
                <option value="hazırlanıyor">Hazırlanıyor</option>
                <option value="kargolandı">Kargolandı</option>
                <option value="teslim edildi">Teslim Edildi</option>
                <option value="iptal">İptal</option>
              </select>
            </div>
            <div class="flex-1">
              <label class="block text-xs font-medium text-gray-700 mb-1">Tarih Aralığı</label>
              <select id="ord-date-range" class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Tüm Zamanlar</option>
                <option value="today">Bugün</option>
                <option value="week">Bu Hafta</option>
                <option value="month">Bu Ay</option>
                <option value="quarter">Son 3 Ay</option>
                <option value="year">Bu Yıl</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      </div>
      <div class="rounded-lg border shadow-sm overflow-hidden">
        <div class="max-h-[60vh] overflow-auto">
        <table id="admin-orders-table" class="min-w-full">
            <thead class="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th class="text-left text-xs font-semibold text-gray-500 px-3 py-2 w-36 sortable-header sort-none">Sipariş ID</th>
                <th class="text-left text-xs font-semibold text-gray-500 px-3 py-2 w-56 sortable-header sort-none">Tedarikçi</th>
                <th class="text-left text-xs font-semibold text-gray-500 px-3 py-2 w-32 sortable-header sort-none">Müşteri</th>
                <th class="text-left text-xs font-semibold text-gray-500 px-3 py-2 w-24 sortable-header sort-none">Toplam Adet</th>
                <th class="text-left text-xs font-semibold text-gray-500 px-3 py-2 w-32 sortable-header sort-none">Tarih</th>
                <th class="text-left text-xs font-semibold text-gray-500 px-3 py-2 w-32 sortable-header sort-none">Durum</th>
                <th class="text-right text-xs font-semibold text-gray-500 px-3 py-2 w-28 sortable-header sort-none">Tutar</th>
            </tr>
          </thead>
            <tbody id="ord-rows" class="divide-y divide-gray-100"></tbody>
        </table>
        </div>
      </div>
      <div id="admin-orders-pagination"></div>
    </div>`;
  function numberTRY(x){ return (typeof x==='number') ? (x.toLocaleString('tr-TR',{style:'currency',currency:'TRY'})) : '-'; }
  function openOrderDetail(order){
    const bd = document.getElementById('orders-drawer-body');
    const backdrop = document.getElementById('orders-drawer-backdrop');
    const drawer = document.getElementById('orders-drawer');
    const supplierName=(suppliers.find(s=>String(s.id)===String(order.supplierId))||{}).name||('Tedarikçi '+order.supplierId);
    const items = (order.items||[]).map(i=>`
      <div class="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
        <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
          <i class="fas fa-box text-gray-500"></i>
        </div>
        <div class="flex-1">
          <div class="font-medium text-gray-900">${i.name||'-'}</div>
          <div class="text-sm text-gray-500">${i.sku||''}${i.qty? ' • Adet: '+i.qty:''}</div>
        </div>
        <div class="text-right">
          <div class="font-semibold text-gray-900">${numberTRY(i.total||0)}</div>
          ${i.qty ? `<div class="text-xs text-gray-500">${numberTRY((i.total||0)/i.qty)} / adet</div>` : ''}
        </div>
      </div>`).join('');
    const addr = (order.shippingAddress||{});
    const pay = (order.payment||{});
    const hist = (order.timeline||[]).map((t, index)=>`
      <div class="flex items-start space-x-4 p-3 bg-gray-50 rounded-lg">
        <div class="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <i class="fas fa-circle text-blue-500 text-xs"></i>
        </div>
        <div class="flex-1">
          <div class="text-sm font-medium text-gray-900">${t.message||''}</div>
          <div class="text-xs text-gray-500 mt-1">${(t.date||'').replace('T',' ').slice(0,16)}</div>
        </div>
      </div>`).join('') || '<div class="text-center py-8 text-gray-500"><i class="fas fa-history text-4xl mb-2"></i><p>Zaman çizelgesi bulunamadı</p></div>';
    bd.innerHTML = `
      <div class="space-y-6" id="order-edit-form" data-order-id="${order.id}">
        <!-- Order Header -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-3">
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-receipt text-blue-600 text-lg"></i>
              </div>
              <div>
                <h2 class="text-xl font-bold text-gray-900">${order.id}</h2>
                <p class="text-sm text-gray-500">${supplierName} • ${(order.date||'').slice(0,10)}</p>
              </div>
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold text-green-600">${numberTRY(order.total||0)}</div>
              <div class="text-sm text-gray-500">Toplam Tutar</div>
            </div>
          </div>
          
          <!-- Status and Payment Info -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="flex items-center space-x-2 mb-2">
                <i class="fas fa-info-circle text-blue-500"></i>
                <span class="text-sm font-medium text-gray-700">Durum</span>
              </div>
              <select id="od-status" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              ${['hazırlanıyor','kargolandı','teslim edildi','iptal'].map(s => `<option ${s===order.status ? 'selected' : ''}>${s}</option>`).join('')}
            </select>
          </div>
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="flex items-center space-x-2 mb-2">
                <i class="fas fa-credit-card text-green-500"></i>
                <span class="text-sm font-medium text-gray-700">Ödeme</span>
              </div>
              <div class="text-sm text-gray-900">${pay.method||'-'}</div>
              <div class="text-xs text-gray-500">${pay.status||'-'}</div>
            </div>
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="flex items-center space-x-2 mb-2">
                <i class="fas fa-truck text-orange-500"></i>
                <span class="text-sm font-medium text-gray-700">Kargo</span>
              </div>
              <div class="text-sm text-gray-900">${(order.shipping&&order.shipping.carrier)||'-'}</div>
              <div class="text-xs text-gray-500">${(order.shipping&&order.shipping.tracking)||'-'}</div>
            </div>
          </div>
        </div>
        <!-- Products Section -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center space-x-2 mb-4">
            <i class="fas fa-shopping-cart text-blue-500"></i>
            <h3 class="text-lg font-semibold text-gray-900">Ürünler</h3>
            <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">${(order.items||[]).length} ürün</span>
          </div>
          <div class="space-y-3">
            ${items||'<div class="text-center py-8 text-gray-500"><i class="fas fa-box-open text-4xl mb-2"></i><p>Ürün bulunamadı</p></div>'}
          </div>
        </div>
        <!-- Address Section -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center space-x-2 mb-4">
            <i class="fas fa-map-marker-alt text-green-500"></i>
            <h3 class="text-lg font-semibold text-gray-900">Teslimat Adresi</h3>
          </div>
          <div class="grid grid-cols-1 gap-3">
        <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
              <input id="od-addr-name" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Ad Soyad" value="${addr.name||''}"/>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Adres Satırı 1</label>
              <input id="od-addr-line1" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Adres 1" value="${addr.line1||''}"/>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Adres Satırı 2</label>
              <input id="od-addr-line2" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Adres 2" value="${addr.line2||''}"/>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Şehir</label>
                <input id="od-addr-city" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Şehir" value="${addr.city||''}"/>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Posta Kodu</label>
                <input id="od-addr-postal" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Posta Kodu" value="${addr.postalCode||''}"/>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Ülke</label>
              <input id="od-addr-country" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Ülke" value="${addr.country||''}"/>
            </div>
          </div>
        </div>
        <!-- Payment and Shipping Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Payment Information -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div class="flex items-center space-x-2 mb-4">
              <i class="fas fa-credit-card text-green-500"></i>
              <h3 class="text-lg font-semibold text-gray-900">Ödeme Bilgileri</h3>
              </div>
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Ödeme Yöntemi</label>
                <select id="od-payment-method" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="Kredi Kartı" ${pay.method === 'Kredi Kartı' ? 'selected' : ''}>Kredi Kartı</option>
                  <option value="Havale/EFT" ${pay.method === 'Havale/EFT' ? 'selected' : ''}>Havale/EFT</option>
                  <option value="Kapıda Ödeme" ${pay.method === 'Kapıda Ödeme' ? 'selected' : ''}>Kapıda Ödeme</option>
                  <option value="Banka Kartı" ${pay.method === 'Banka Kartı' ? 'selected' : ''}>Banka Kartı</option>
                </select>
            </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Ödeme Durumu</label>
                <select id="od-payment-status" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="ödendi" ${pay.status === 'ödendi' ? 'selected' : ''}>Ödendi</option>
                  <option value="onay bekliyor" ${pay.status === 'onay bekliyor' ? 'selected' : ''}>Onay Bekliyor</option>
                  <option value="beklemede" ${pay.status === 'beklemede' ? 'selected' : ''}>Beklemede</option>
                  <option value="iptal" ${pay.status === 'iptal' ? 'selected' : ''}>İptal</option>
                </select>
          </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Ödeme Tarihi</label>
                <input id="od-payment-date" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" type="date" value="${pay.date || ''}"/>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">İşlem ID</label>
                <input id="od-payment-transaction" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="İşlem ID" value="${pay.transactionId || ''}"/>
            </div>
          </div>
        </div>
          <!-- Shipping Information -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div class="flex items-center space-x-2 mb-4">
              <i class="fas fa-truck text-orange-500"></i>
              <h3 class="text-lg font-semibold text-gray-900">Kargo Bilgileri</h3>
            </div>
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Kargo Firması</label>
                <select id="od-ship-carrier" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="Yurtiçi" ${(order.shipping&&order.shipping.carrier) === 'Yurtiçi' ? 'selected' : ''}>Yurtiçi Kargo</option>
                  <option value="Aras" ${(order.shipping&&order.shipping.carrier) === 'Aras' ? 'selected' : ''}>Aras Kargo</option>
                  <option value="MNG" ${(order.shipping&&order.shipping.carrier) === 'MNG' ? 'selected' : ''}>MNG Kargo</option>
                  <option value="PTT" ${(order.shipping&&order.shipping.carrier) === 'PTT' ? 'selected' : ''}>PTT Kargo</option>
                  <option value="Sürat" ${(order.shipping&&order.shipping.carrier) === 'Sürat' ? 'selected' : ''}>Sürat Kargo</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Takip Numarası</label>
                <input id="od-ship-tracking" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Takip No" value="${(order.shipping&&order.shipping.tracking)||''}"/>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Kargo Durumu</label>
                <select id="od-ship-status" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="hazırlanıyor" ${(order.shipping&&order.shipping.status) === 'hazırlanıyor' ? 'selected' : ''}>Hazırlanıyor</option>
                  <option value="kargoya verildi" ${(order.shipping&&order.shipping.status) === 'kargoya verildi' ? 'selected' : ''}>Kargoya Verildi</option>
                  <option value="yolda" ${(order.shipping&&order.shipping.status) === 'yolda' ? 'selected' : ''}>Yolda</option>
                  <option value="teslim edildi" ${(order.shipping&&order.shipping.status) === 'teslim edildi' ? 'selected' : ''}>Teslim Edildi</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tahmini Teslimat</label>
                <input id="od-ship-eta" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" type="date" value="${(order.shipping&&order.shipping.eta)||''}"/>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Kargo Ücreti</label>
                <input id="od-ship-cost" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="₺0.00" value="${(order.shipping&&order.shipping.cost)||''}"/>
              </div>
            </div>
          </div>
        </div>
        <!-- Timeline Section -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center space-x-2 mb-4">
            <i class="fas fa-history text-purple-500"></i>
            <h3 class="text-lg font-semibold text-gray-900">Zaman Çizelgesi</h3>
            <span class="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">${(order.timeline||[]).length} adım</span>
          </div>
          <div class="space-y-3">
          ${hist}
          </div>
        </div>
        <!-- Notes Section -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center space-x-2 mb-4">
            <i class="fas fa-sticky-note text-yellow-500"></i>
            <h3 class="text-lg font-semibold text-gray-900">Sipariş Notları</h3>
          </div>
          <textarea id="od-note" rows="4" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none" placeholder="Sipariş hakkında notlarınızı buraya yazabilirsiniz...">${order.note||''}</textarea>
        </div>
      </div>`;
    // Actions: Save & Print
    document.getElementById('orders-save').onclick = () => {
      const form = document.getElementById('order-edit-form');
      const oid = form?.dataset?.orderId;
      if(!oid) return;
      const idx = (mockData.orders||[]).findIndex(x=>String(x.id)===String(oid));
      if(idx === -1) return;
      // Collect values
      const status = document.getElementById('od-status').value;
      const addr = {
        name: document.getElementById('od-addr-name').value,
        line1: document.getElementById('od-addr-line1').value,
        line2: document.getElementById('od-addr-line2').value,
        city: document.getElementById('od-addr-city').value,
        postalCode: document.getElementById('od-addr-postal').value,
        country: document.getElementById('od-addr-country').value
      };
      const shipping = {
        carrier: document.getElementById('od-ship-carrier').value,
        tracking: document.getElementById('od-ship-tracking').value,
        eta: document.getElementById('od-ship-eta').value
      };
      const note = document.getElementById('od-note').value;
      // Persist
      const cur = mockData.orders[idx];
      mockData.orders[idx] = { ...cur, status, shippingAddress: addr, shipping, note };
      // Append timeline entry
      const now = new Date();
      const pad = (n)=> String(n).padStart(2,'0');
      const ts = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
      mockData.orders[idx].timeline = Array.isArray(cur.timeline) ? [...cur.timeline, { date: ts, message: 'Sipariş güncellendi' }] : [{ date: ts, message: 'Sipariş güncellendi' }];
      // Rerender list & keep drawer open
      renderRows();
      openOrderDetail(mockData.orders[idx]);
      if (typeof showToast === 'function') showToast('Sipariş kaydedildi.');
    };
    document.getElementById('orders-print').onclick = () => {
      const printWin = window.open('', '_blank');
      if(!printWin) return;
      const bodyHtml = document.getElementById('orders-drawer-body').innerHTML;
      printWin.document.write(`<!DOCTYPE html><html><head><title>Sipariş Özeti</title></head><body>${bodyHtml}
function showToast(msg){
  const t = document.createElement('div');
  t.className = 'fixed bottom-4 right-4 bg-black text-white text-sm px-3 py-2 rounded shadow';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(()=>{ t.remove(); }, 1800);
}
// Mock data initialization
window.mockData = window.mockData || {};
window.mockData.suppliers = window.mockData.suppliers || [
    { id: 1, name: 'ModaTedarik', status: 'approved' }, 
    { id: 2, name: 'Ayakkabı A.Ş.', status: 'approved' },
    { id: 3, name: 'Başka Tedarikçi', status: 'approved' }
];
window.mockData.orders = window.mockData.orders || [
  { id: 'ORD-1001', supplierId: 1, customerId: 'CUST-001', date: '2025-09-15', status: 'hazırlanıyor', total: 3499.90,
    items: [
      { sku: '8683822429962-41', name: 'Kahverengi Deri Ayakkabı 41', qty: 1, total: 2999.90 },
      { sku: '8683822429962-Temizlik', name: 'Bakım Kiti', qty: 1, total: 500.00 }
    ],
    shippingAddress: { name: 'Ahmet Yılmaz', line1: 'Gül Sk. No:12', city: 'İstanbul', postalCode: '34000', country: 'TR' },
    payment: { method: 'Kredi Kartı', status: 'ödendi' },
    shipping: { carrier: 'Yurtiçi', tracking: 'YK123456', eta: '2025-09-20' },
    timeline: [
      { date: '2025-09-15T09:10:00', message: 'Sipariş alındı' },
      { date: '2025-09-15T12:30:00', message: 'Hazırlanıyor' }
    ],
    note: 'Hediye paketi istendi.'
  },
  { id: 'ORD-1002', supplierId: 2, customerId: 'CUST-002', date: '2025-09-16', status: 'kargolandı', total: 1299.00,
    items: [{ sku: '8683822429963', name: 'Mavi Keten Gömlek', qty: 1, total: 1299.00 }],
    shippingAddress: { name: 'Elif Demir', line1: 'Lale Cd. No:5', city: 'Ankara', postalCode: '06000', country: 'TR' },
    payment: { method: 'Havale/EFT', status: 'onay bekliyor' },
    shipping: { carrier: 'Aras', tracking: 'AR987654', eta: '2025-09-19' },
    timeline: [
      { date: '2025-09-16T10:00:00', message: 'Sipariş alındı' },
      { date: '2025-09-16T18:45:00', message: 'Kargolandı' }
    ]
  }
];
</body></html>`);
      printWin.document.close();
      printWin.focus();
      printWin.print();
      printWin.close();
    };
    backdrop.classList.add('open'); drawer.classList.add('open');
    document.getElementById('orders-drawer-close').onclick = closeDrawer;
    backdrop.onclick = closeDrawer;
    function closeDrawer(){ drawer.classList.remove('open'); backdrop.classList.remove('open'); }
  }
  function statusPill(status){
    const map = {
      'hazırlanıyor': 'bg-amber-100 text-amber-800 border border-amber-200',
      'kargolandı': 'bg-blue-100 text-blue-800 border border-blue-200',
      'teslim edildi': 'bg-green-100 text-green-800 border border-green-200',
      'iptal': 'bg-red-100 text-red-800 border border-red-200'
    };
    const cls = map[status] || 'bg-gray-100 text-gray-800 border border-gray-200';
    const iconMap = {
      'hazırlanıyor': 'fas fa-clock',
      'kargolandı': 'fas fa-shipping-fast',
      'teslim edildi': 'fas fa-check-circle',
      'iptal': 'fas fa-times-circle'
    };
    const icon = iconMap[status] || 'fas fa-question-circle';
    return `<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${cls} shadow-sm">
      <i class="${icon} mr-1"></i>
      ${status||'-'}
    </span>`;
  }
  function initials(name){
    if(!name) return '—';
    const parts = String(name).split(' ').filter(Boolean);
    const a = (parts[0]||'').charAt(0);
    const b = (parts[1]||'').charAt(0);
    return (a+b).toUpperCase();
  }
  // Handle filter type change
  function updateFilterInput() {
    const filterType = document.getElementById('ord-filter-type').value;
    const container = document.getElementById('ord-filter-input-container');
    const label = document.getElementById('ord-filter-label');
    
    const placeholder = filterType === 'search' 
      ? 'Sipariş ID, SKU veya ürün adı...'
      : 'Müşteri adı, telefon veya e-posta...';
    const labelText = filterType === 'search'
      ? 'Sipariş ID / SKU / Ürün'
      : 'Müşteri (Ad, Telefon, E-posta)';
    label.textContent = labelText;
    container.innerHTML = `
      <label class="block text-xs font-medium text-gray-700 mb-1" id="ord-filter-label">${labelText}</label>
      <input id="ord-filter-value" type="text" placeholder="${placeholder}" class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
    `;
  }
  
  // Supplier search functionality
  function initSupplierSearch() {
    const searchInput = document.getElementById('ord-supplier-search');
    const dropdown = document.getElementById('ord-supplier-dropdown');
    const supplierIdInput = document.getElementById('ord-supplier-id');
    
    searchInput.addEventListener('focus', () => {
      dropdown.classList.remove('hidden');
    });
    
    searchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase();
      const options = dropdown.querySelectorAll('.supplier-option');
      let hasVisibleOptions = false;
      
      options.forEach(option => {
        const text = option.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
          option.classList.remove('hidden');
          hasVisibleOptions = true;
        } else {
          option.classList.add('hidden');
        }
      });
      
      if (hasVisibleOptions) {
        dropdown.classList.remove('hidden');
      } else {
        dropdown.classList.add('hidden');
      }
    });
    
    dropdown.addEventListener('click', (e) => {
      const option = e.target.closest('.supplier-option');
      if (option) {
        const supplierId = option.getAttribute('data-supplier-id');
        const supplierName = option.textContent;
        searchInput.value = supplierName;
        supplierIdInput.value = supplierId;
        dropdown.classList.add('hidden');
        renderRows();
      }
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.add('hidden');
      }
    });
    
    // Clear selection when clearing search
    searchInput.addEventListener('keyup', (e) => {
      if (e.target.value === '') {
        supplierIdInput.value = '';
        renderRows();
      }
    });
  }
  
  function renderRows(){
    const filterType = document.getElementById('ord-filter-type').value;
    const filterValue = (document.getElementById('ord-filter-value')?.value || '').toLowerCase();
    const supplierFilter = document.getElementById('ord-supplier-id')?.value || '';
    const statusFilter = document.getElementById('ord-status')?.value || '';
    const dateRangeFilter = document.getElementById('ord-date-range')?.value || '';
    
    const filteredOrders = orders.filter(o=>{
      // Supplier filter (separate)
      if (supplierFilter && String(o.supplierId) !== String(supplierFilter)) return false;
      
      // Unified filter
      if (filterValue) {
        if (filterType === 'search') {
          const text = `${o.id} ${o.status||''} ${(o.items||[]).map(i => `${i.sku} ${i.name||""}`).join(' ')}`.toLowerCase();
          if (!text.includes(filterValue)) return false;
        } else if (filterType === 'customer') {
          const name = (o.shippingAddress?.name || '').toLowerCase();
          const phone = (o.shippingAddress?.phone || '').toLowerCase();
          const email = (o.shippingAddress?.email || '').toLowerCase();
          if (!name.includes(filterValue) && !phone.includes(filterValue) && !email.includes(filterValue)) return false;
        }
      }
      
      // Status filter (separate)
      if (statusFilter && o.status !== statusFilter) return false;
      
      // Date range filter (separate)
      if (dateRangeFilter && o.date) {
        const orderDate = new Date(o.date);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        switch (dateRangeFilter) {
          case 'today':
            if (orderDate < today) return false;
            break;
          case 'week':
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            if (orderDate < weekAgo) return false;
            break;
          case 'month':
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            if (orderDate < monthAgo) return false;
            break;
          case 'quarter':
            const quarterAgo = new Date(today);
            quarterAgo.setMonth(quarterAgo.getMonth() - 3);
            if (orderDate < quarterAgo) return false;
            break;
          case 'year':
            const yearAgo = new Date(today);
            yearAgo.setFullYear(yearAgo.getFullYear() - 1);
            if (orderDate < yearAgo) return false;
            break;
        }
      }
      
      return true;
    });
    
    // Apply pagination
    const paginatedOrders = paginateData(filteredOrders, window.paginationState.currentPage);
    
    // Set render function for pagination
    window.paginationState.renderFunction = renderRows;
    
    const rows=paginatedOrders.map(o=>{
      const supplierName=(suppliers.find(s=>String(s.id)===String(o.supplierId))||{}).name||('Tedarikçi '+o.supplierId);
      const shown = (o.items||[]).slice(0,3).map(i=>`<span class=\"inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-800 mr-1 mb-1\"><span class=\"font-mono\">${i.sku}</span>${i.qty?`<span class=\\\"text-indigo-700\\\">×${i.qty}</span>`:''}</span>`).join('');
      const extra = (o.items||[]).length>3 ? `<span class=\"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700\">+${(o.items||[]).length-3}</span>` : '';
      const dateStr = o.date ? new Date(o.date).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' }) : '-';
      const customerName = o.shippingAddress?.name || 'Bilinmiyor';
      const itemCount = (o.items || []).length;
      const totalItemQuantity = (o.items || []).reduce((sum, item) => sum + (item.qty || 0), 0);
      
      return `<tr class=\"hover:bg-gray-50 even:bg-white odd:bg-gray-50/40 cursor-pointer transition-colors duration-150\" data-order-id=\"${o.id}\">\n        <td class=\"px-3 py-3 text-sm text-gray-700 font-medium\">\n          <div class=\"flex items-center space-x-2\">\n            <i class=\"fas fa-receipt text-blue-500\"></i>\n            <span class=\"font-mono\">${o.id}</span>\n          </div>\n        </td>\n        <td class=\"px-3 py-3 text-sm\">\n          <div class=\"flex items-center gap-2\">\n            <div class=\"w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs flex items-center justify-center font-semibold shadow-sm\">${initials(supplierName)}</div>\n            <div class=\"leading-5 font-medium text-gray-900\">${supplierName}</div>\n          </div>\n        </td>\n        <td class=\"px-3 py-3 text-sm text-gray-600\">\n          <div class=\"flex items-center space-x-1\">\n            <i class=\"fas fa-user text-gray-400\"></i>\n            <span class=\"font-medium\">${customerName}</span>\n          </div>\n        </td>\n        <td class=\"px-3 py-3 text-sm text-gray-600\">\n          <div class=\"flex items-center space-x-1\">\n            <i class=\"fas fa-box text-gray-400\"></i>\n            <span class=\"font-medium\">${totalItemQuantity}</span>\n          </div>\n        </td>\n        <td class=\"px-3 py-3 text-sm text-gray-600\">\n          <div class=\"flex items-center space-x-1\">\n            <i class=\"fas fa-calendar-alt text-gray-400\"></i>\n            <span>${dateStr}</span>\n          </div>\n        </td>\n        <td class=\"px-3 py-3 text-sm\">${statusPill(o.status)}</td>\n        <td class=\"px-3 py-3 text-sm text-right font-semibold text-green-600\">\n          <div class=\"flex items-center justify-end space-x-1\">\n    <span>${numberTRY(o.total)}</span>\n          </div>\n        </td>\n      </tr>`;
    }).join('');
    document.getElementById('ord-rows').innerHTML = rows || `<tr><td colspan="7" class="p-8 text-center text-gray-500">
      <div class="flex flex-col items-center space-y-3">
        <i class="fas fa-inbox text-4xl text-gray-300"></i>
        <p class="text-sm">Kayıt bulunamadı</p>
      </div>
    </td></tr>`;
    
    // Render pagination
    renderPagination('admin-orders-pagination');
    
    // Make the admin orders table sortable
    setTimeout(() => makeTableSortable('admin-orders-table'), 100);
  }
  // Initialize filter input and supplier search
  updateFilterInput();
  initSupplierSearch();
  document.getElementById('ord-filter-type').addEventListener('change', updateFilterInput);
  
  document.getElementById('ord-apply').addEventListener('click', ()=>{ window.paginationState.currentPage = 1; renderRows(); });
  document.getElementById('ord-clear').addEventListener('click', ()=>{ 
    document.getElementById('ord-filter-type').value = 'search';
    updateFilterInput();
    document.getElementById('ord-supplier-search').value = '';
    document.getElementById('ord-supplier-id').value = '';
    document.getElementById('ord-status').value = '';
    document.getElementById('ord-date-range').value = '';
    window.paginationState.currentPage = 1; 
    renderRows(); 
  });
  
  // Add event listeners for separate filters
  document.getElementById('ord-status')?.addEventListener('change', renderRows);
  document.getElementById('ord-date-range')?.addEventListener('change', renderRows);
  document.getElementById('ord-export').addEventListener('click', () => exportOrdersToCSV('admin'));
  pageContent.addEventListener('click', (e)=>{
    const tr = e.target.closest('tr[data-order-id]'); 
    if(!tr) return;
    const oid = tr.getAttribute('data-order-id');
    const order = orders.find(x=>String(x.id)===String(oid)); 
    if(order) {
      // Navigate to separate order detail page instead of opening drawer
      navigateTo(`#orderDetail/${oid}`);
    }
  });
  renderRows();
};
// Supplier Orders (visible to suppliers via menu)
        renderers['supplierFinance'] = () => {
            const user = window.currentUser || {};
            if (user.role !== 'supplier') {
                showModal('Erişim Yok', '<p>Bu sayfa sadece tedarikçiler içindir.</p>', 'Kapat', closeModal);
                navigateTo('#products/aktif'); return;
            }
            pageTitle.textContent = 'Finans - Tedarikçi';
            pageContent.innerHTML = `
                <div class="space-y-6">
                    <!-- Summary Cards -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div class="bg-white p-6 rounded-lg shadow">
                            <div class="flex items-center">
                                <div class="p-2 bg-green-100 rounded-lg">
                                    <i class="fas fa-wallet text-green-600"></i>
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm font-medium text-gray-500">Toplam Kazanç</p>
                                    <p class="text-2xl font-semibold text-gray-900">₺${(mockData.supplierPayouts?.reduce((sum, p) => sum + p.amount, 0) || 0).toLocaleString('tr-TR')}</p>
                                </div>
                            </div>
                        </div>
                        <div class="bg-white p-6 rounded-lg shadow">
                            <div class="flex items-center">
                                <div class="p-2 bg-blue-100 rounded-lg">
                                    <i class="fas fa-clock text-blue-600"></i>
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm font-medium text-gray-500">Bekleyen Ödeme</p>
                                    <p class="text-2xl font-semibold text-gray-900">₺${(mockData.supplierPayouts?.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0) || 0).toLocaleString('tr-TR')}</p>
                                </div>
                            </div>
                        </div>
                        <div class="bg-white p-6 rounded-lg shadow">
                            <div class="flex items-center">
                                <div class="p-2 bg-purple-100 rounded-lg">
                                    <i class="fas fa-percentage text-purple-600"></i>
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm font-medium text-gray-500">Toplam Komisyon</p>
                                    <p class="text-2xl font-semibold text-gray-900">₺${(mockData.supplierPayouts?.reduce((sum, p) => sum + p.commission, 0) || 0).toLocaleString('tr-TR')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- Hakedişler (Combined) -->
                    <div class="bg-white rounded-lg shadow">
                        <div class="px-6 py-4 border-b border-gray-200">
                            <div class="flex items-center justify-between">
                                <h3 class="text-lg font-semibold text-gray-900">Hakedişler</h3>
                                <div class="flex gap-3">
                                    <span class="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                                        Bekleyen: ${(mockData.supplierPayouts || []).filter(p => p.status === 'pending').length}
                                    </span>
                                    <span class="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                                        Geçmiş: ${(mockData.supplierPayouts || []).filter(p => p.status === 'completed').length}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hakediş ID</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dönem</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sipariş Sayısı</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Komisyon</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Tutar</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-200">
                                    ${(mockData.supplierPayouts || []).map(payout => `
                                        <tr class="hover:bg-gray-50">
                                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${payout.id}</td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${payout.period}</td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${payout.orders}</td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₺${payout.commission.toLocaleString('tr-TR')}</td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">₺${payout.amount.toLocaleString('tr-TR')}</td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                ${new Date(payout.date).toLocaleDateString('tr-TR')}
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap">
                                                <span class="px-2 py-1 text-xs font-semibold rounded-full ${payout.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}">
                                                    ${payout.status === 'pending' ? 'Bekleyen' : 'Geçmiş'}
                                                </span>
                                            </td>
                                        </tr>
                                    `).join('')}
                                    ${(mockData.supplierPayouts || []).length === 0 ? `
                                        <tr>
                                            <td colspan="7" class="px-6 py-8 text-center text-gray-500">
                                                <i class="fas fa-inbox text-4xl text-gray-300 mb-2"></i>
                                                <p>Hakediş bulunmuyor</p>
                                            </td>
                                        </tr>
                                    ` : ''}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        };
        renderers['adminFinance'] = () => {
            const user = window.currentUser || {};
            if (user.role !== 'admin') {
                showModal('Erişim Yok', '<p>Bu sayfa sadece yöneticiler içindir.</p>', 'Kapat', closeModal);
                navigateTo('#dashboard'); return;
            }
            pageTitle.textContent = 'Finans - Yönetici';
            pageContent.innerHTML = `
                <div class="space-y-6">
                    <!-- Summary Cards -->
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div class="bg-white p-6 rounded-lg shadow">
                            <div class="flex items-center">
                                <div class="p-2 bg-green-100 rounded-lg">
                                    <i class="fas fa-chart-line text-green-600"></i>
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm font-medium text-gray-500">Toplam Komisyon Geliri</p>
                                    <p class="text-2xl font-semibold text-gray-900">₺${(mockData.adminRevenue?.totalCommissionEarned || 0).toLocaleString('tr-TR')}</p>
                                </div>
                            </div>
                        </div>
                        <div class="bg-white p-6 rounded-lg shadow">
                            <div class="flex items-center">
                                <div class="p-2 bg-blue-100 rounded-lg">
                                    <i class="fas fa-calendar text-blue-600"></i>
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm font-medium text-gray-500">Bu Ay Gelir</p>
                                    <p class="text-2xl font-semibold text-gray-900">₺${(mockData.adminRevenue?.monthlyRevenue?.[0]?.amount || 0).toLocaleString('tr-TR')}</p>
                                </div>
                            </div>
                        </div>
                        <div class="bg-white p-6 rounded-lg shadow">
                            <div class="flex items-center">
                                <div class="p-2 bg-purple-100 rounded-lg">
                                    <i class="fas fa-shopping-cart text-purple-600"></i>
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm font-medium text-gray-500">Bu Ay Sipariş</p>
                                    <p class="text-2xl font-semibold text-gray-900">${mockData.adminRevenue?.monthlyRevenue?.[0]?.orders || 0}</p>
                                </div>
                            </div>
                        </div>
                        <div class="bg-white p-6 rounded-lg shadow">
                            <div class="flex items-center">
                                <div class="p-2 bg-orange-100 rounded-lg">
                                    <i class="fas fa-percentage text-orange-600"></i>
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm font-medium text-gray-500">Ortalama Komisyon</p>
                                    <p class="text-2xl font-semibold text-gray-900">15%</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- Monthly Revenue Chart -->
                    <div class="bg-white rounded-lg shadow">
                        <div class="px-6 py-4 border-b border-gray-200">
                            <h3 class="text-lg font-semibold text-gray-900">Aylık Gelir Trendi</h3>
                        </div>
                        <div class="p-6">
                            ${(() => {
                                const monthlyData = mockData.adminRevenue?.monthlyRevenue || [];
                                if (monthlyData.length === 0) return '<div class="text-center text-gray-500 py-8">Veri bulunamadı</div>';
                                
                                const maxAmount = Math.max(...monthlyData.map(m => m.amount));
                                const minAmount = Math.min(...monthlyData.map(m => m.amount));
                                const range = maxAmount - minAmount;
                                const padding = range * 0.1; // 10% padding
                                const chartHeight = 200;
                                const chartWidth = 600;
                                const pointRadius = 6;
                                
                                // Calculate points for the line chart
                                const points = monthlyData.map((month, index) => {
                                    const x = (index / (monthlyData.length - 1)) * (chartWidth - 100) + 50;
                                    const y = chartHeight - 50 - ((month.amount - minAmount + padding) / (range + padding * 2)) * (chartHeight - 100);
                                    return { x, y, month, amount: month.amount, orders: month.orders };
                                });
                                
                                // Create SVG path for the line
                                const pathData = points.map((point, index) => 
                                    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
                                ).join(' ');
                                // Create area path (for gradient fill)
                                const areaPath = `M ${points[0].x} ${chartHeight - 50} ${pathData} L ${points[points.length - 1].x} ${chartHeight - 50} Z`;
                                return `
                                    <div class="relative">
                                        <svg width="100%" height="${chartHeight}" viewBox="0 0 ${chartWidth} ${chartHeight}" class="overflow-visible">
                                            <!-- Grid lines -->
                                            <defs>
                                                <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                    <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:0.3" />
                                                    <stop offset="100%" style="stop-color:#3B82F6;stop-opacity:0.05" />
                                                </linearGradient>
                                            </defs>
                                            
                                            <!-- Horizontal grid lines -->
                                            ${[0, 0.25, 0.5, 0.75, 1].map(ratio => {
                                                const y = chartHeight - 50 - (ratio * (chartHeight - 100));
                                                const value = minAmount + (range * (1 - ratio));
                                                return `
                                                    <line x1="50" y1="${y}" x2="${chartWidth - 50}" y2="${y}" stroke="#E5E7EB" stroke-width="1" stroke-dasharray="2,2"/>
                                                    <text x="40" y="${y + 4}" text-anchor="end" class="text-xs fill-gray-500">₺${value.toLocaleString('tr-TR', {maximumFractionDigits: 0})}</text>
                                                `;
                                            }).join('')}
                                            
                                            <!-- Area fill -->
                                            <path d="${areaPath}" fill="url(#revenueGradient)" />
                                            
                                            <!-- Line -->
                                            <path d="${pathData}" stroke="#3B82F6" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                                            
                                            <!-- Data points -->
                                            ${points.map(point => `
                                                <circle cx="${point.x}" cy="${point.y}" r="${pointRadius}" fill="#3B82F6" stroke="white" stroke-width="2">
                                                    <title>${point.month.month}: ₺${point.amount.toLocaleString('tr-TR')} (${point.orders} sipariş)</title>
                                                </circle>
                                            `).join('')}
                                            
                                            <!-- Month labels -->
                                            ${points.map(point => `
                                                <text x="${point.x}" y="${chartHeight - 20}" text-anchor="middle" class="text-xs fill-gray-600">
                                                    ${point.month.month.split(' ')[0]}
                                                </text>
                                            `).join('')}
                                        </svg>
                                        
                                        <!-- Legend -->
                                        <div class="mt-4 flex items-center justify-center space-x-6">
                                            <div class="flex items-center space-x-2">
                                                <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                                                <span class="text-sm text-gray-600">Komisyon Geliri</span>
                                            </div>
                                            <div class="text-sm text-gray-500">
                                                Toplam: ₺${monthlyData.reduce((sum, m) => sum + m.amount, 0).toLocaleString('tr-TR')}
                                            </div>
                                        </div>
                                        
                                        <!-- Data summary -->
                                        <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                            ${monthlyData.map(month => `
                                                <div class="text-center p-3 bg-gray-50 rounded-lg">
                                                    <div class="text-sm font-medium text-gray-900">${month.month}</div>
                                                    <div class="text-lg font-semibold text-blue-600">₺${month.amount.toLocaleString('tr-TR')}</div>
                                                    <div class="text-xs text-gray-500">${month.orders} sipariş</div>
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                `;
                            })()}
                        </div>
                    </div>
                    <!-- Commission Details Table -->
                    <div class="bg-white rounded-lg shadow">
                        <div class="px-6 py-4 border-b border-gray-200">
                            <h3 class="text-lg font-semibold text-gray-900">Komisyon Detayları</h3>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Komisyon ID</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tedarikçi</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sipariş Sayısı</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Toplam Satış</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Komisyon Oranı</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Komisyon Geliri</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-200">
                                    ${(mockData.adminCommissions || []).map(commission => `
                                        <tr class="hover:bg-gray-50">
                                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${commission.id}</td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${commission.supplier}</td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${commission.orderCount}</td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₺${commission.totalSales.toLocaleString('tr-TR')}</td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">%${commission.commissionRate}</td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">₺${commission.commissionEarned.toLocaleString('tr-TR')}</td>
                                            <td class="px-6 py-4 whitespace-nowrap">
                                                <span class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                    ${commission.status === 'paid' ? 'Ödendi' : commission.status}
                                                </span>
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(commission.date).toLocaleDateString('tr-TR')}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        };
        renderers['supplierStoreManagement'] = () => {
            const user = window.currentUser || {};
            if (user.role !== 'supplier') {
                showModal('Erişim Yok', '<p>Bu sayfa sadece tedarikçiler içindir.</p>', 'Kapat', closeModal);
                navigateTo('#products/aktif'); return;
            }
            pageTitle.textContent = 'Mağaza Yönetimi';
            pageContent.innerHTML = `
                <div class="space-y-6">
                    <!-- Store Overview -->
                    <div class="bg-white p-6 rounded-lg shadow">
                        <div class="flex items-center justify-between mb-6">
                            <h2 class="text-xl font-semibold text-gray-900">Mağaza Durumu</h2>
                            <button onclick="showAddStoreModal()" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                <i class="fas fa-plus mr-2"></i>Yeni Mağaza Ekle
                            </button>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div class="bg-green-50 p-4 rounded-lg border border-green-200">
                                <div class="flex items-center">
                                    <i class="fas fa-store text-green-600 text-2xl mr-3"></i>
                                    <div>
                                        <div class="text-2xl font-bold text-green-700">3</div>
                                        <div class="text-sm text-green-600">Aktif Mağaza</div>
                                    </div>
                                </div>
                            </div>
                            <div class="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                <div class="flex items-center">
                                    <i class="fas fa-pause-circle text-yellow-600 text-2xl mr-3"></i>
                                    <div>
                                        <div class="text-2xl font-bold text-yellow-700">1</div>
                                        <div class="text-sm text-yellow-600">Pasif Mağaza</div>
                                    </div>
                                </div>
                            </div>
                            <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <div class="flex items-center">
                                    <i class="fas fa-shopping-cart text-blue-600 text-2xl mr-3"></i>
                                    <div>
                                        <div class="text-2xl font-bold text-blue-700">156</div>
                                        <div class="text-sm text-blue-600">Toplam Sipariş</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- Stores List -->
                    <div class="bg-white rounded-lg shadow">
                        <div class="px-6 py-4 border-b border-gray-200">
                            <h3 class="text-lg font-semibold text-gray-900">Mağazalarım</h3>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mağaza Adı</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ürün Sayısı</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Son Güncelleme</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-200">
                                    <tr class="hover:bg-gray-50">
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <div class="flex items-center">
                                                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                                    <i class="fas fa-store text-blue-600"></i>
                                                </div>
                                                <div>
                                                    <div class="text-sm font-medium text-gray-900">Store 1</div>
                                                    <div class="text-sm text-gray-500">Ana Mağaza</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <span class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                Aktif
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">45</td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2 saat önce</td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div class="flex space-x-2">
                                                <button onclick="toggleStoreStatus(1)" class="text-yellow-600 hover:text-yellow-900">
                                                    <i class="fas fa-pause"></i>
                                                </button>
                                                <button onclick="editStore(1)" class="text-blue-600 hover:text-blue-900">
                                                    <i class="fas fa-edit"></i>
                                                </button>
                                                <button onclick="viewStoreDetails(1)" class="text-green-600 hover:text-green-900">
                                                    <i class="fas fa-eye"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr class="hover:bg-gray-50">
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <div class="flex items-center">
                                                <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                                                    <i class="fas fa-store text-orange-600"></i>
                                                </div>
                                                <div>
                                                    <div class="text-sm font-medium text-gray-900">Store 2</div>
                                                    <div class="text-sm text-gray-500">İkinci Mağaza</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <span class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                Aktif
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">32</td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1 gün önce</td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div class="flex space-x-2">
                                                <button onclick="toggleStoreStatus(2)" class="text-yellow-600 hover:text-yellow-900">
                                                    <i class="fas fa-pause"></i>
                                                </button>
                                                <button onclick="editStore(2)" class="text-blue-600 hover:text-blue-900">
                                                    <i class="fas fa-edit"></i>
                                                </button>
                                                <button onclick="viewStoreDetails(2)" class="text-green-600 hover:text-green-900">
                                                    <i class="fas fa-eye"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr class="hover:bg-gray-50">
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <div class="flex items-center">
                                                <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                                                    <i class="fas fa-store text-purple-600"></i>
                                                </div>
                                                <div>
                                                    <div class="text-sm font-medium text-gray-900">Store 3</div>
                                                    <div class="text-sm text-gray-500">Üçüncü Mağaza</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <span class="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                Pasif
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">18</td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">3 gün önce</td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div class="flex space-x-2">
                                                <button onclick="toggleStoreStatus(3)" class="text-green-600 hover:text-green-900">
                                                    <i class="fas fa-play"></i>
                                                </button>
                                                <button onclick="editStore(3)" class="text-blue-600 hover:text-blue-900">
                                                    <i class="fas fa-edit"></i>
                                                </button>
                                                <button onclick="viewStoreDetails(3)" class="text-green-600 hover:text-green-900">
                                                    <i class="fas fa-eye"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        };
        renderers['supplierUserManagement'] = () => {
            const user = window.currentUser || {};
            if (user.role !== 'supplier') {
                showModal('Erişim Yok', '<p>Bu sayfa sadece tedarikçiler içindir.</p>', 'Kapat', closeModal);
                navigateTo('#products/aktif'); return;
            }
            
            // Supplier users data - representing team members
            // Store in window for access by permissions modal
            // Only initialize if it doesn't exist to preserve newly added users
            if (!window.supplierUsers || window.supplierUsers.length === 0) {
                window.supplierUsers = [
                    { id: 1, name: 'Ahmet Yılmaz', email: 'ahmet@modatedarik.com', role: 'Admin', title: 'Sahip', status: 'active', lastLogin: '2 saat önce', permissions: ['Ürün Yönetimi', 'Sipariş Yönetimi', 'Kullanıcı Yönetimi'], pagePermissions: {}, avatarColor: 'blue', avatarInitials: 'AY' },
                    { id: 2, name: 'Elif Demir', email: 'elif@modatedarik.com', role: 'Standart Kullanıcı', title: 'Standart Kullanıcı', status: 'active', lastLogin: '1 gün önce', permissions: ['Ürün Yönetimi', 'Stok Güncelleme'], pagePermissions: {}, avatarColor: 'green', avatarInitials: 'ED' },
                    { id: 3, name: 'Mehmet Kaya', email: 'mehmet@modatedarik.com', role: 'Standart Kullanıcı', title: 'Standart Kullanıcı', status: 'active', lastLogin: '3 saat önce', permissions: ['Sipariş Yönetimi', 'Müşteri Hizmetleri'], pagePermissions: {}, avatarColor: 'orange', avatarInitials: 'MK' },
                    { id: 4, name: 'Zeynep Aktaş', email: 'zeynep@modatedarik.com', role: 'Standart Kullanıcı', title: 'Standart Kullanıcı', status: 'inactive', lastLogin: '-', permissions: ['Sadece Görüntüleme'], pagePermissions: {}, avatarColor: 'yellow', avatarInitials: 'ZA' }
                ];
            }
            
            const supplierUsers = window.supplierUsers;
            
            const renderUserRows = (users) => {
                return users.map(u => {
                    const getStatusBadge = (status) => {
                        if (status === 'active') {
                            return '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Aktif</span>';
                        } else {
                            return '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Pasif</span>';
                        }
                    };
                    
                    const getRoleBadge = (role) => {
                        const roleClasses = {
                            'Admin': 'bg-purple-100 text-purple-800',
                            'Standart Kullanıcı': 'bg-blue-100 text-blue-800'
                        };
                        const roleClass = roleClasses[role] || 'bg-gray-100 text-gray-800';
                        return `<span class="px-2 py-1 text-xs font-semibold rounded-full ${roleClass}">${role}</span>`;
                    };
                    
                    const getAvatarColor = (color) => {
                        const colors = {
                            'blue': 'bg-blue-100 text-blue-600',
                            'green': 'bg-green-100 text-green-600',
                            'orange': 'bg-orange-100 text-orange-600',
                            'yellow': 'bg-yellow-100 text-yellow-600'
                        };
                        return colors[color] || 'bg-gray-100 text-gray-600';
                    };
                    
                    // Check if user has custom page permissions (pagePermissions object)
                    const hasRestrictedPermissions = u.pagePermissions && typeof u.pagePermissions === 'object' && Object.keys(u.pagePermissions).length > 0 && Object.values(u.pagePermissions).some(p => p === false);
                    const permissionIndicator = hasRestrictedPermissions ? '<i class="fas fa-key text-purple-500 ml-1 text-xs" title="Özel izinler tanımlı"></i>' : '';
                    
                    const actionButtons = `
                        <button onclick="showAddUserModal(${u.id})" class="text-blue-600 hover:text-blue-900" title="Düzenle">
                            <i class="fas fa-edit"></i>
                        </button>
                    `;
                    
                    return `
                        <tr class="hover:bg-gray-50">
                            <td class="px-6 py-4 whitespace-nowrap">
                                <input type="checkbox" class="supplier-user-checkbox rounded border-gray-300 text-blue-600 focus:ring-blue-500" data-user-id="${u.id}">
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex items-center">
                                    <div class="w-10 h-10 ${getAvatarColor(u.avatarColor)} rounded-full flex items-center justify-center mr-3">
                                        <span class="font-semibold">${u.avatarInitials}</span>
                                    </div>
                                    <div>
                                        <div class="text-sm font-medium text-gray-900 flex items-center">
                                            ${u.name}
                                            ${permissionIndicator}
                                        </div>
                                        <div class="text-sm text-gray-500">${u.title}</div>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${u.email}</td>
                            <td class="px-6 py-4 whitespace-nowrap">${getRoleBadge(u.role)}</td>
                            <td class="px-6 py-4 whitespace-nowrap">${getStatusBadge(u.status)}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${u.lastLogin}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div class="flex space-x-2">${actionButtons}</div>
                            </td>
                        </tr>
                    `;
                }).join('');
            };
            
            // Initial pagination setup
            paginateData(supplierUsers, 1);
            const initialRows = renderUserRows(paginateData(supplierUsers, 1));
            
            pageTitle.textContent = 'Kullanıcı Yönetimi';
            pageContent.innerHTML = `
                <div class="space-y-6">
                    <!-- Users List -->
                    <div class="bg-white rounded-lg shadow">
                        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h3 class="text-lg font-semibold text-gray-900">Kullanıcılarım</h3>
                            <button onclick="showAddUserModal()" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                <i class="fas fa-user-plus mr-2"></i>Yeni Kullanıcı Ekle
                            </button>
                        </div>
                        
                        <!-- Search and Filter Section -->
                        <div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <!-- Search Input -->
                                    <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Arama</label>
                                    <div class="relative">
                                        <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                                        <input type="text" id="supplierUserSearchInput" 
                                               class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                               placeholder="Ad, soyad veya e-posta ile ara...">
                                    </div>
                                </div>
                                
                                <!-- Role Filter -->
                                    <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Rol</label>
                                    <select id="supplierUserRoleFilter" 
                                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                        <option value="">Tüm Roller</option>
                                        <option value="Admin">Admin</option>
                                        <option value="Standart Kullanıcı">Standart Kullanıcı</option>
                                    </select>
                                    </div>
                                
                                <!-- Status Filter -->
                                    <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Durum</label>
                                    <select id="supplierUserStatusFilter" 
                                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                        <option value="">Tüm Durumlar</option>
                                        <option value="active">Aktif</option>
                                        <option value="inactive">Pasif</option>
                                    </select>
                                    </div>
                                </div>
                            
                            <!-- Results Count -->
                            <div id="supplierUserSearchResults" class="mt-3 text-sm text-gray-500 hidden">
                                <span id="supplierUserSearchCount"></span>
                            </div>
                            
                            <!-- Bulk Actions -->
                            <div class="mt-4 flex items-center justify-between">
                                <div class="text-sm text-gray-600">
                                    <span id="selectedSupplierUsersCount">0</span> kullanıcı seçildi
                                </div>
                                <div class="relative">
                                    <button id="bulkSupplierActionsBtn" disabled class="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
                                        <i class="fas fa-tasks mr-2"></i> Toplu İşlemler
                                        <i class="fas fa-chevron-down ml-2"></i>
                                    </button>
                                    <div id="bulkSupplierActionsDropdown" class="hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                                        <div class="py-1">
                                            <button id="bulkSupplierActivate" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700">
                                                <i class="fas fa-check-circle mr-2"></i> Aktifleştir
                                            </button>
                                            <button id="bulkSupplierDeactivate" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-700">
                                                <i class="fas fa-pause-circle mr-2"></i> Pasifleştir
                                            </button>
                                            <button id="bulkSupplierDelete" class="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50">
                                                <i class="fas fa-trash mr-2"></i> Sil
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                                    </div>
                        
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                                            <input type="checkbox" id="selectAllSupplierUsers" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                                        </th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kullanıcı</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">E-posta</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Son Giriş</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody id="supplierUserTableBody" class="bg-white divide-y divide-gray-200">
                                    ${initialRows}
                                </tbody>
                            </table>
                        </div>
                        <div id="supplier-user-pagination"></div>
                    </div>
                </div>
            `;
            
            // Search and Filter Functionality
            const searchInput = document.getElementById('supplierUserSearchInput');
            const roleFilter = document.getElementById('supplierUserRoleFilter');
            const statusFilter = document.getElementById('supplierUserStatusFilter');
            const tableBody = document.getElementById('supplierUserTableBody');
            const searchResults = document.getElementById('supplierUserSearchResults');
            const searchCount = document.getElementById('supplierUserSearchCount');
            
            let filteredUsers = [...supplierUsers];
            
            const renderUsersTable = () => {
                const paginatedUsers = paginateData(filteredUsers, window.paginationState.currentPage);
                
                if (paginatedUsers.length === 0) {
                    tableBody.innerHTML = `
                        <tr>
                            <td colspan="8" class="px-6 py-8 text-center text-gray-500">
                                <i class="fas fa-search text-4xl mb-2 text-gray-300"></i>
                                <p>Sonuç bulunamadı</p>
                            </td>
                        </tr>
                    `;
                } else {
                    tableBody.innerHTML = renderUserRows(paginatedUsers);
                }
                
                renderPagination('supplier-user-pagination');
            };
            
            window.paginationState.renderFunction = renderUsersTable;
            
            const applyFilters = () => {
                const searchTerm = (searchInput?.value || '').toLowerCase().trim();
                const selectedRole = roleFilter?.value || '';
                const selectedStatus = statusFilter?.value || '';
                
                filteredUsers = supplierUsers.filter(u => {
                    // Search filter
                    if (searchTerm) {
                        const name = (u.name || '').toLowerCase();
                        const email = (u.email || '').toLowerCase();
                        if (!name.includes(searchTerm) && !email.includes(searchTerm)) {
                            return false;
                        }
                    }
                    
                    // Role filter
                    if (selectedRole && u.role !== selectedRole) {
                        return false;
                    }
                    
                    // Status filter
                    if (selectedStatus && u.status !== selectedStatus) {
                        return false;
                    }
                    
                    return true;
                });
                
                window.paginationState.currentPage = 1;
                renderUsersTable();
                
                // Update results count
                if (searchTerm || selectedRole || selectedStatus) {
                    searchCount.textContent = `${filteredUsers.length} kullanıcı bulundu`;
                    searchResults.classList.remove('hidden');
                } else {
                    searchResults.classList.add('hidden');
                }
            };
            
            // Add event listeners
            if (searchInput) {
                searchInput.addEventListener('input', applyFilters);
            }
            if (roleFilter) {
                roleFilter.addEventListener('change', applyFilters);
            }
            if (statusFilter) {
                statusFilter.addEventListener('change', applyFilters);
            }
            
            // Initial render
            renderPagination('supplier-user-pagination');
            
            // Setup bulk actions functionality
            setTimeout(() => {
                setupBulkSupplierUserActions();
            }, 100);
        };
        
        // Bulk supplier user actions functionality
        function setupBulkSupplierUserActions() {
            const selectAllCheckbox = document.getElementById('selectAllSupplierUsers');
            const bulkActionsBtn = document.getElementById('bulkSupplierActionsBtn');
            const bulkActionsDropdown = document.getElementById('bulkSupplierActionsDropdown');
            const selectedUsersCount = document.getElementById('selectedSupplierUsersCount');
            const bulkActivate = document.getElementById('bulkSupplierActivate');
            const bulkDeactivate = document.getElementById('bulkSupplierDeactivate');
            const bulkDelete = document.getElementById('bulkSupplierDelete');
            
            if (!bulkActionsBtn) return;
            
            // Update selected count and button state
            const updateBulkActionsState = () => {
                const checkboxes = document.querySelectorAll('.supplier-user-checkbox:checked');
                const count = checkboxes.length;
                
                if (selectedUsersCount) {
                    selectedUsersCount.textContent = count;
                }
                
                if (bulkActionsBtn) {
                    if (count > 0) {
                        bulkActionsBtn.disabled = false;
                        bulkActionsBtn.classList.remove('bg-gray-400', 'hover:bg-gray-500');
                        bulkActionsBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');
                    } else {
                        bulkActionsBtn.disabled = true;
                        bulkActionsBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
                        bulkActionsBtn.classList.add('bg-gray-400', 'hover:bg-gray-500');
                    }
                }
                
                // Update select all checkbox
                if (selectAllCheckbox) {
                    const allCheckboxes = document.querySelectorAll('.supplier-user-checkbox');
                    const allChecked = allCheckboxes.length > 0 && checkboxes.length === allCheckboxes.length;
                    selectAllCheckbox.checked = allChecked;
                    selectAllCheckbox.indeterminate = count > 0 && count < allCheckboxes.length;
                }
            };
            
            // Select all checkbox
            if (selectAllCheckbox) {
                selectAllCheckbox.addEventListener('change', (e) => {
                    const checkboxes = document.querySelectorAll('.supplier-user-checkbox');
                    checkboxes.forEach(cb => {
                        cb.checked = e.target.checked;
                    });
                    updateBulkActionsState();
                });
            }
            
            // Individual checkboxes
            document.addEventListener('change', (e) => {
                if (e.target.classList.contains('supplier-user-checkbox')) {
                    updateBulkActionsState();
                }
            });
            
            // Toggle dropdown
            if (bulkActionsBtn) {
                bulkActionsBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (!bulkActionsBtn.disabled && bulkActionsDropdown) {
                        bulkActionsDropdown.classList.toggle('hidden');
                    }
                });
            }
            
            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (bulkActionsDropdown && !bulkActionsDropdown.contains(e.target) && !bulkActionsBtn?.contains(e.target)) {
                    bulkActionsDropdown.classList.add('hidden');
                }
            });
            
            // Bulk activate
            if (bulkActivate) {
                bulkActivate.addEventListener('click', () => {
                    const selectedIds = Array.from(document.querySelectorAll('.supplier-user-checkbox:checked'))
                        .map(cb => parseInt(cb.dataset.userId));
                    
                    if (selectedIds.length === 0) return;
                    
                    selectedIds.forEach(userId => {
                        const user = (window.supplierUsers || []).find(u => u.id === userId);
                        if (user) {
                            user.status = 'active';
                        }
                    });
                    
                    if (bulkActionsDropdown) bulkActionsDropdown.classList.add('hidden');
                    if (typeof showToast === 'function') {
                        showToast(`${selectedIds.length} kullanıcı aktifleştirildi.`);
                    }
                    if (typeof renderers !== 'undefined' && renderers.supplierUserManagement) {
                        renderers.supplierUserManagement();
                    }
                });
            }
            
            // Bulk deactivate
            if (bulkDeactivate) {
                bulkDeactivate.addEventListener('click', () => {
                    const selectedIds = Array.from(document.querySelectorAll('.supplier-user-checkbox:checked'))
                        .map(cb => parseInt(cb.dataset.userId));
                    
                    if (selectedIds.length === 0) return;
                    
                    selectedIds.forEach(userId => {
                        const user = (window.supplierUsers || []).find(u => u.id === userId);
                        if (user) {
                            user.status = 'inactive';
                        }
                    });
                    
                    if (bulkActionsDropdown) bulkActionsDropdown.classList.add('hidden');
                    if (typeof showToast === 'function') {
                        showToast(`${selectedIds.length} kullanıcı pasifleştirildi.`);
                    }
                    if (typeof renderers !== 'undefined' && renderers.supplierUserManagement) {
                        renderers.supplierUserManagement();
                    }
                });
            }
            
            // Bulk delete
            if (bulkDelete) {
                bulkDelete.addEventListener('click', () => {
                    const selectedIds = Array.from(document.querySelectorAll('.supplier-user-checkbox:checked'))
                        .map(cb => parseInt(cb.dataset.userId));
                    
                    if (selectedIds.length === 0) return;
                    
                    if (confirm(`${selectedIds.length} kullanıcıyı silmek istediğinize emin misiniz?`)) {
                        window.supplierUsers = (window.supplierUsers || []).filter(u => !selectedIds.includes(u.id));
                        
                        if (bulkActionsDropdown) bulkActionsDropdown.classList.add('hidden');
                        if (typeof showToast === 'function') {
                            showToast(`${selectedIds.length} kullanıcı silindi.`);
                        }
                        if (typeof renderers !== 'undefined' && renderers.supplierUserManagement) {
                            renderers.supplierUserManagement();
                        }
                    }
                });
            }
            
            // Initial state
            updateBulkActionsState();
        }
        renderers['supplierOrders'] = () => {
  const user = window.currentUser || {};
  if (user.role !== 'supplier' || user.supplierId == null) {
    showModal('Erişim Yok', '<p>Bu sayfa sadece tedarikçiler içindir.</p>', 'Kapat', closeModal);
    navigateTo('#products/yeni-gelenler'); return;
  }
  const allOrders = Array.isArray(mockData.orders) ? mockData.orders : [];
  const orders = allOrders.filter(o => String(o.supplierId) === String(user.supplierId));
           // Ensure orders drawer exists for supplier order details
           function ensureOrdersDrawer() {
             let drawer = document.getElementById('orders-drawer');
             let backdrop = document.getElementById('orders-drawer-backdrop');
             if (!drawer || !backdrop) {
               backdrop = document.createElement('div');
               backdrop.id = 'orders-drawer-backdrop';
               backdrop.className = 'orders-drawer-backdrop';
               document.body.appendChild(backdrop);
               
               drawer = document.createElement('div');
               drawer.id = 'orders-drawer';
               drawer.className = 'orders-drawer';
               drawer.innerHTML = `
                 <div class="flex flex-col h-full bg-white">
                   <div class="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                     <div class="flex items-center justify-between">
                       <div class="flex items-center space-x-3">
                         <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                           <i class="fas fa-shopping-bag text-blue-600"></i>
                         </div>
                         <div>
                           <h3 class="text-lg font-semibold text-gray-900">Sipariş Detayı</h3>
                           <p class="text-sm text-gray-500">Sipariş bilgilerini görüntüleyin</p>
                         </div>
                       </div>
                       <button id="orders-drawer-close" class="px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors" title="Kapat">
                         <i class="fas fa-times"></i>
                       </button>
                     </div>
                   </div>
                   <div id="orders-drawer-body" class="p-6 overflow-auto flex-1 bg-gray-50"></div>
                   <div class="p-6 border-t border-gray-200 bg-white">
                     <button id="orders-save" class="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm" style="display: none;">
                       <i class="fas fa-save mr-2"></i>Kaydet
                     </button>
                   </div>
                 </div>`;
               document.body.appendChild(drawer);
             }
           }
  ensureOrdersDrawer();
  if (typeof pageTitle !== 'undefined') pageTitle.textContent = 'Tedarikçi Siparişleri';
  if (!pageContent) return;
  pageContent.innerHTML = `
    <div class="space-y-4">
      <!-- Filter Section -->
      <div class="bg-white p-3 rounded-lg shadow-sm border">
        <div class="flex flex-col gap-3">
          <div class="flex flex-col md:flex-row md:items-end gap-3">
            <div class="flex-1 md:flex-none md:w-48">
              <label class="block text-xs font-medium text-gray-700 mb-1">Filtre Türü</label>
              <select id="sord-filter-type" class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                <option value="search">Sipariş ID / SKU / Ürün</option>
                <option value="customer">Müşteri (Ad, Telefon, E-posta)</option>
              </select>
            </div>
            <div class="flex-1" id="sord-filter-input-container">
              <label class="block text-xs font-medium text-gray-700 mb-1" id="sord-filter-label">Sipariş ID / SKU / Ürün</label>
              <input id="sord-filter-value" type="text" placeholder="Sipariş ID, SKU veya ürün adı..." class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>
          <div class="flex flex-col md:flex-row md:items-end gap-3 pt-3 border-t border-gray-200">
            <div class="flex-1">
              <label class="block text-xs font-medium text-gray-700 mb-1">Durum</label>
              <select id="sord-status" class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Tüm Durumlar</option>
                <option value="hazırlanıyor">Hazırlanıyor</option>
                <option value="kargolandı">Kargolandı</option>
                <option value="teslim edildi">Teslim Edildi</option>
                <option value="iptal">İptal</option>
              </select>
            </div>
            <div class="flex-1">
              <label class="block text-xs font-medium text-gray-700 mb-1">Tarih Aralığı</label>
              <select id="sord-date-range" class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Tüm Zamanlar</option>
                <option value="today">Bugün</option>
                <option value="week">Bu Hafta</option>
                <option value="month">Bu Ay</option>
                <option value="quarter">Son 3 Ay</option>
                <option value="year">Bu Yıl</option>
              </select>
            </div>
          </div>
        </div>
        <div class="flex justify-between items-center mt-3">
          <div class="flex space-x-2">
            <button id="sord-apply" class="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-1 focus:ring-blue-500">
              <i class="fas fa-search mr-1"></i>Filtrele
            </button>
            <button id="sord-clear" class="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:ring-1 focus:ring-gray-500">
              <i class="fas fa-times mr-1"></i>Temizle
            </button>
            <button id="sord-export" class="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 focus:ring-1 focus:ring-green-500 flex items-center space-x-1">
              <i class="fas fa-download"></i>
              <span>Dışa Aktar</span>
            </button>
          </div>
          <div class="text-xs text-gray-500">
            <span id="sord-count">Toplam: ${orders.length} sipariş</span>
          </div>
        </div>
      </div>
      <!-- Orders Table -->
      <div class="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div class="max-h-[65vh] overflow-auto">
          <table id="supplier-orders-table" class="min-w-full">
            <thead class="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th class="text-left text-xs font-semibold text-gray-500 px-3 py-2 w-36 sortable-header sort-none">Sipariş ID</th>
                <th class="text-left text-xs font-semibold text-gray-500 px-3 py-2 w-32 sortable-header sort-none">Müşteri</th>
                <th class="text-left text-xs font-semibold text-gray-500 px-3 py-2 w-24 sortable-header sort-none">Toplam Adet</th>
                <th class="text-left text-xs font-semibold text-gray-500 px-3 py-2 w-32 sortable-header sort-none">Tarih</th>
                <th class="text-left text-xs font-semibold text-gray-500 px-3 py-2 w-32 sortable-header sort-none">Durum</th>
                <th class="text-right text-xs font-semibold text-gray-500 px-3 py-2 w-28 sortable-header sort-none">Tutar</th>
              </tr>
            </thead>
            <tbody id="sord-rows" class="divide-y divide-gray-100"></tbody>
          </table>
        </div>
      </div>
      <div id="supplier-orders-pagination"></div>
    </div>`;
  function numberTRY(x){ return (typeof x==='number') ? (x.toLocaleString('tr-TR',{style:'currency',currency:'TRY'})) : '-'; }
  function statusPill(status){
    const map = {
      'hazırlanıyor': 'bg-amber-100 text-amber-800 border border-amber-200',
      'kargolandı': 'bg-blue-100 text-blue-800 border border-blue-200',
      'teslim edildi': 'bg-green-100 text-green-800 border border-green-200',
      'iptal': 'bg-red-100 text-red-800 border border-red-200'
    };
    const cls = map[status] || 'bg-gray-100 text-gray-800 border border-gray-200';
    const iconMap = {
      'hazırlanıyor': 'fas fa-clock',
      'kargolandı': 'fas fa-shipping-fast',
      'teslim edildi': 'fas fa-check-circle',
      'iptal': 'fas fa-times-circle'
    };
    const icon = iconMap[status] || 'fas fa-question-circle';
    return `<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${cls} shadow-sm">
      <i class="${icon} mr-1"></i>
      ${status||'-'}
    </span>`;
  }
  // Handle filter type change for supplier
  function updateSupplierFilterInput() {
    const filterType = document.getElementById('sord-filter-type').value;
    const container = document.getElementById('sord-filter-input-container');
    const label = document.getElementById('sord-filter-label');
    
    const placeholder = filterType === 'search' 
      ? 'Sipariş ID, SKU veya ürün adı...'
      : 'Müşteri adı, telefon veya e-posta...';
    const labelText = filterType === 'search'
      ? 'Sipariş ID / SKU / Ürün'
      : 'Müşteri (Ad, Telefon, E-posta)';
    label.textContent = labelText;
    container.innerHTML = `
      <label class="block text-xs font-medium text-gray-700 mb-1" id="sord-filter-label">${labelText}</label>
      <input id="sord-filter-value" type="text" placeholder="${placeholder}" class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
    `;
  }
  
  function renderRows(){
    const filterType = document.getElementById('sord-filter-type')?.value || 'search';
    const filterValue = (document.getElementById('sord-filter-value')?.value || '').toLowerCase();
    const statusFilter = document.getElementById('sord-status')?.value || '';
    const dateRangeFilter = document.getElementById('sord-date-range')?.value || '';
    
    // Apply filters
    const filteredOrders = orders.filter(o => {
      // Unified filter
      if (filterValue) {
        if (filterType === 'search') {
          const searchText = `${o.id} ${o.status||''} ${(o.items||[]).map(i => `${i.sku} ${i.name||''}`).join(' ')}`.toLowerCase();
          if (!searchText.includes(filterValue)) return false;
        } else if (filterType === 'customer') {
          const name = (o.shippingAddress?.name || '').toLowerCase();
          const phone = (o.shippingAddress?.phone || '').toLowerCase();
          const email = (o.shippingAddress?.email || '').toLowerCase();
          if (!name.includes(filterValue) && !phone.includes(filterValue) && !email.includes(filterValue)) return false;
        }
      }
      
      // Status filter (separate)
      if (statusFilter && o.status !== statusFilter) return false;
      
      // Date range filter (separate)
      if (dateRangeFilter && o.date) {
        const orderDate = new Date(o.date);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        switch (dateRangeFilter) {
          case 'today':
            if (orderDate < today) return false;
            break;
          case 'week':
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            if (orderDate < weekAgo) return false;
            break;
          case 'month':
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            if (orderDate < monthAgo) return false;
            break;
          case 'quarter':
            const quarterAgo = new Date(today);
            quarterAgo.setMonth(quarterAgo.getMonth() - 3);
            if (orderDate < quarterAgo) return false;
            break;
          case 'year':
            const yearAgo = new Date(today);
            yearAgo.setFullYear(yearAgo.getFullYear() - 1);
            if (orderDate < yearAgo) return false;
            break;
        }
      }
      
      return true;
    });
    // Apply pagination
    const paginatedOrders = paginateData(filteredOrders, window.paginationState.currentPage);
    
    // Set render function for pagination
    window.paginationState.renderFunction = renderRows;
    
    // Update count
    const countEl = document.getElementById('sord-count');
    if (countEl) {
      countEl.textContent = `Görüntülenen: ${paginatedOrders.length} / Toplam: ${filteredOrders.length} sipariş`;
    }
    // Render filtered rows
    const rows = paginatedOrders.map(o => {
      const shown = (o.items||[]).slice(0,3).map(i=>`<span class=\"inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-800 mr-1 mb-1\"><span class=\"font-mono\">${i.sku}</span>${i.qty?`<span class=\\\"text-indigo-700\\\">×${i.qty}</span>`:''}</span>`).join('');
      const extra = (o.items||[]).length>3 ? `<span class=\"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700\">+${(o.items||[]).length-3}</span>` : '';
      const dateStr = o.date ? new Date(o.date).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' }) : '-';
      const customerName = o.shippingAddress?.name || 'Bilinmiyor';
      const itemCount = (o.items || []).length;
      const totalItemQuantity = (o.items || []).reduce((sum, item) => sum + (item.qty || 0), 0);
      
      return `<tr class=\"hover:bg-gray-50 even:bg-white odd:bg-gray-50/40 cursor-pointer transition-colors duration-150\" data-order-id=\"${o.id}\">\n        <td class=\"px-3 py-3 text-sm text-gray-700 font-medium\">\n          <div class=\"flex items-center space-x-2\">\n            <i class=\"fas fa-receipt text-blue-500\"></i>\n            <span class=\"font-mono\">${o.id}</span>\n          </div>\n        </td>\n        <td class=\"px-3 py-3 text-sm text-gray-600\">\n          <div class=\"flex items-center space-x-1\">\n            <i class=\"fas fa-user text-gray-400\"></i>\n            <span class=\"font-medium\">${customerName}</span>\n          </div>\n        </td>\n        <td class=\"px-3 py-3 text-sm text-gray-600\">\n          <div class=\"flex items-center space-x-1\">\n            <i class=\"fas fa-box text-gray-400\"></i>\n            <span class=\"font-medium\">${totalItemQuantity}</span>\n          </div>\n        </td>\n        <td class=\"px-3 py-3 text-sm text-gray-600\">\n          <div class=\"flex items-center space-x-1\">\n            <i class=\"fas fa-calendar-alt text-gray-400\"></i>\n            <span>${dateStr}</span>\n          </div>\n        </td>\n        <td class=\"px-3 py-3 text-sm\">${statusPill(o.status)}</td>\n        <td class=\"px-3 py-3 text-sm text-right font-semibold text-green-600\">\n          <div class=\"flex items-center justify-end space-x-1\">\n     <span>${numberTRY(o.total)}</span>\n          </div>\n        </td>\n      </tr>`;
    }).join('');
    
    document.getElementById('sord-rows').innerHTML = rows || `<tr><td colspan="6" class="p-8 text-center text-gray-500">
      <div class="flex flex-col items-center space-y-3">
        <i class="fas fa-inbox text-4xl text-gray-300"></i>
        <p class="text-sm">Filtreleme kriterlerine uygun sipariş bulunamadı</p>
      </div>
    </td></tr>`;
    
    // Render pagination
    renderPagination('supplier-orders-pagination');
    
    // Make the supplier orders table sortable
    setTimeout(() => makeTableSortable('supplier-orders-table'), 100);
  }
  pageContent.addEventListener('click', (e)=>{
    const tr = e.target.closest('tr[data-order-id]'); 
    if(!tr) return;
    const oid = tr.getAttribute('data-order-id');
    const order = orders.find(x=>String(x.id)===String(oid)); 
    if(order) {
      // Navigate to separate order detail page instead of opening drawer
      navigateTo(`#orderDetail/${oid}`);
    }
  });
  // Initialize pagination
  initializePagination();
  
  renderRows();
  // Add event listeners for filtering
  document.getElementById('sord-apply')?.addEventListener('click', renderRows);
  // Initialize supplier filter input
  updateSupplierFilterInput();
  document.getElementById('sord-filter-type').addEventListener('change', updateSupplierFilterInput);
  
  document.getElementById('sord-clear')?.addEventListener('click', () => {
    document.getElementById('sord-filter-type').value = 'search';
    updateSupplierFilterInput();
    document.getElementById('sord-status').value = '';
    document.getElementById('sord-date-range').value = '';
    renderRows();
  });
  document.getElementById('sord-export')?.addEventListener('click', () => exportOrdersToCSV('supplier'));
  // Auto-filter on input changes
  document.getElementById('sord-filter-value')?.addEventListener('input', renderRows);
  document.getElementById('sord-filter-value')?.addEventListener('change', renderRows);
  document.getElementById('sord-status')?.addEventListener('change', renderRows);
  document.getElementById('sord-date-range')?.addEventListener('change', renderRows);
  function openSupplierOrderDetail(order){
    const bd = document.getElementById('orders-drawer-body');
    const backdrop = document.getElementById('orders-drawer-backdrop');
    const drawer = document.getElementById('orders-drawer');
    if (!bd || !backdrop || !drawer) return;
    const items = (order.items||[]).map(i=>`
      <div class="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
        <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
          <i class="fas fa-box text-gray-500"></i>
        </div>
        <div class="flex-1">
          <div class="font-medium text-gray-900">${i.name||i.sku}</div>
          <div class="text-sm text-gray-500">SKU: ${i.sku}${i.qty? ' • Adet: '+i.qty:''}</div>
        </div>
        <div class="text-right">
          <div class="font-semibold text-gray-900">${numberTRY(i.total||0)}</div>
          ${i.qty ? `<div class="text-xs text-gray-500">${numberTRY((i.total||0)/i.qty)} / adet</div>` : ''}
        </div>
      </div>`).join('');
    const addr = order.shippingAddress || {};
    const pay = order.payment || {};
    const ship = order.shipping || {};
    const hist = (order.timeline||[]).map((t, index)=>`
      <div class="flex items-start space-x-4 p-3 bg-gray-50 rounded-lg">
        <div class="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <i class="fas fa-circle text-blue-500 text-xs"></i>
        </div>
        <div class="flex-1">
          <div class="text-sm font-medium text-gray-900">${t.message||''}</div>
          <div class="text-xs text-gray-500 mt-1">${(t.date||'').replace('T',' ').slice(0,16)}</div>
        </div>
      </div>`).join('') || '<div class="text-center py-8 text-gray-500"><i class="fas fa-history text-4xl mb-2"></i><p>Zaman çizelgesi bulunamadı</p></div>';
    bd.innerHTML = `
      <div class="space-y-6" id="supplier-order-form" data-order-id="${order.id}">
        <!-- Order Header -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-3">
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-receipt text-blue-600 text-lg"></i>
              </div>
              <div>
                <h2 class="text-xl font-bold text-gray-900">${order.id}</h2>
                <p class="text-sm text-gray-500">${order.date ? new Date(order.date).toLocaleDateString('tr-TR') : '-'}</p>
              </div>
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold text-green-600">${numberTRY(order.total||0)}</div>
              <div class="text-sm text-gray-500">Toplam Tutar</div>
            </div>
          </div>
          
          <!-- Status and Payment Info -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="flex items-center space-x-2 mb-2">
                <i class="fas fa-info-circle text-blue-500"></i>
                <span class="text-sm font-medium text-gray-700">Durum</span>
              </div>
              <select id="supplier-order-status" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                ${['hazırlanıyor','kargolandı','teslim edildi','iptal'].map(s => 
                  `<option value="${s}" ${s===order.status ? 'selected' : ''}>${s}</option>`
                ).join('')}
              </select>
            </div>
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="flex items-center space-x-2 mb-2">
                <i class="fas fa-credit-card text-green-500"></i>
                <span class="text-sm font-medium text-gray-700">Ödeme</span>
              </div>
              <div class="text-sm text-gray-900">${pay.method||'-'}</div>
              <div class="text-xs text-gray-500">${pay.status||'-'}</div>
            </div>
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="flex items-center space-x-2 mb-2">
                <i class="fas fa-truck text-orange-500"></i>
                <span class="text-sm font-medium text-gray-700">Kargo</span>
              </div>
              <div class="text-sm text-gray-900">${ship.carrier||'-'}</div>
              <div class="text-xs text-gray-500">${ship.tracking||'-'}</div>
            </div>
          </div>
        </div>
        <!-- Products Section -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center space-x-2 mb-4">
            <i class="fas fa-shopping-cart text-blue-500"></i>
            <h3 class="text-lg font-semibold text-gray-900">Ürünler</h3>
            <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">${(order.items||[]).length} ürün</span>
          </div>
          <div class="space-y-3">
            ${items||'<div class="text-center py-8 text-gray-500"><i class="fas fa-box-open text-4xl mb-2"></i><p>Ürün bulunamadı</p></div>'}
          </div>
        </div>
        <!-- Address Section -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center space-x-2 mb-4">
            <i class="fas fa-map-marker-alt text-green-500"></i>
            <h3 class="text-lg font-semibold text-gray-900">Teslimat Adresi</h3>
          </div>
          <div class="text-sm space-y-2">
            <div class="font-medium text-gray-900">${addr.name||'-'}</div>
            <div class="text-gray-600">${addr.line1||''}</div>
            ${addr.line2 ? `<div class="text-gray-600">${addr.line2}</div>` : ''}
            <div class="text-gray-600">${addr.city||''} ${addr.postalCode||''}</div>
            <div class="text-gray-600">${addr.country||''}</div>
          </div>
        </div>
        <!-- Payment and Shipping Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Payment Information -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div class="flex items-center space-x-2 mb-4">
              <i class="fas fa-credit-card text-green-500"></i>
              <h3 class="text-lg font-semibold text-gray-900">Ödeme Bilgileri</h3>
            </div>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-700">Ödeme Yöntemi:</span>
                <span class="text-sm text-gray-900">${pay.method||'-'}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-700">Ödeme Durumu:</span>
                <span class="text-sm text-gray-900">${pay.status||'-'}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-700">Ödeme Tarihi:</span>
                <span class="text-sm text-gray-900">${pay.date ? new Date(pay.date).toLocaleDateString('tr-TR') : '-'}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-700">İşlem ID:</span>
                <span class="text-sm text-gray-900">${pay.transactionId||'-'}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-700">Tutar:</span>
                <span class="text-sm font-semibold text-green-600">${numberTRY(order.total||0)}</span>
              </div>
            </div>
          </div>
          <!-- Shipping Information -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div class="flex items-center space-x-2 mb-4">
              <i class="fas fa-truck text-orange-500"></i>
              <h3 class="text-lg font-semibold text-gray-900">Kargo Bilgileri</h3>
            </div>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-700">Kargo Firması:</span>
                <span class="text-sm text-gray-900">${ship.carrier||'-'}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-700">Kargo Durumu:</span>
                <span class="text-sm text-gray-900">${ship.status||'-'}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-700">Takip Numarası:</span>
                <span class="text-sm text-gray-900">${ship.tracking||'-'}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-700">Tahmini Teslimat:</span>
                <span class="text-sm text-gray-900">${ship.eta ? new Date(ship.eta).toLocaleDateString('tr-TR') : '-'}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-700">Kargo Ücreti:</span>
                <span class="text-sm text-gray-900">${ship.cost ? numberTRY(ship.cost) : '-'}</span>
              </div>
            </div>
          </div>
        </div>
        <!-- Timeline Section -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center space-x-2 mb-4">
            <i class="fas fa-history text-purple-500"></i>
            <h3 class="text-lg font-semibold text-gray-900">Zaman Çizelgesi</h3>
            <span class="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">${(order.timeline||[]).length} adım</span>
          </div>
          <div class="space-y-3 max-h-64 overflow-y-auto">
            ${hist}
          </div>
        </div>
        <!-- Notes Section -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center space-x-2 mb-4">
            <i class="fas fa-sticky-note text-yellow-500"></i>
            <h3 class="text-lg font-semibold text-gray-900">Sipariş Notları</h3>
          </div>
          <textarea id="supplier-order-note" rows="4" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm" placeholder="Sipariş hakkında notlarınızı buraya yazabilirsiniz...">${order.note||''}</textarea>
        </div>
      </div>`;
    // Update save button functionality for suppliers
    const saveBtn = document.getElementById('orders-save');
    if (saveBtn) {
      saveBtn.style.display = 'block';
      saveBtn.textContent = 'Durumu Güncelle';
      saveBtn.onclick = () => saveSupplierOrderChanges(order.id);
    }
    const closeBtn = document.getElementById('orders-drawer-close');
    backdrop.classList.add('open');
    drawer.classList.add('open');
    const close = () => { drawer.classList.remove('open'); backdrop.classList.remove('open'); };
    backdrop.onclick = close;
    if (closeBtn) closeBtn.onclick = close;
  }
  function saveSupplierOrderChanges(orderId){
    const status = document.getElementById('supplier-order-status').value;
    const note = document.getElementById('supplier-order-note').value;
    
    // Find and update the order
    const orderIndex = mockData.orders.findIndex(o => String(o.id) === String(orderId));
    if (orderIndex === -1) return;
    
    // Update order
    mockData.orders[orderIndex].status = status;
    mockData.orders[orderIndex].note = note;
    
    // Add timeline entry
    const now = new Date();
    const pad = (n)=> String(n).padStart(2,'0');
    const ts = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    
    if (!mockData.orders[orderIndex].timeline) mockData.orders[orderIndex].timeline = [];
    mockData.orders[orderIndex].timeline.push({ 
      date: ts, 
      message: `Durum "${status}" olarak güncellendi${note ? ' (Not: ' + note + ')' : ''}` 
    });
    
    // Refresh the list and keep drawer open
    renderRows();
    openSupplierOrderDetail(mockData.orders[orderIndex]);
    
    if (typeof showToast === 'function') showToast('Sipariş durumu güncellendi.');
  }
  renderRows();
};
// Admin Suppliers management
renderers['adminSuppliers'] = () => {
    if ((window.currentUser||{}).role !== 'admin') { navigateTo('#dashboard'); return; }
    pageTitle.textContent = 'Tedarikçiler';
    
    // Check if suppliers array exists and has data
    if (!mockData.suppliers || mockData.suppliers.length === 0) {
        pageContent.innerHTML = `
            <div class="bg-white rounded-lg shadow">
                <div class="p-6">
                    <div class="text-center">
                        <h2 class="text-2xl font-bold text-gray-900">Tedarikçi Yönetimi</h2>
                        <p class="mt-2 text-red-500">Hata: Tedarikçi verisi bulunamadı.</p>
                        <p class="mt-1 text-sm text-gray-500">Lütfen sayfayı yenileyin.</p>
                    </div>
                </div>
            </div>
        `;
        return;
    }
    
    const renderSupplierRows = (suppliers) => {
        return suppliers.map(supplier => {
        const statusInfo = {
            approved: { text: 'Onaylandı', class: 'bg-green-100 text-green-800' },
            application_received: { text: 'Başvuru Alındı', class: 'bg-blue-100 text-blue-800' },
            rejected: { text: 'Reddedildi', class: 'bg-red-100 text-red-800' }
        }[supplier.status] || { text: supplier.status, class: 'bg-gray-100 text-gray-800' };
        
        const registrationDate = supplier.registrationDate ? new Date(supplier.registrationDate).toLocaleDateString('tr-TR') : '-';
        const lastActivity = supplier.lastActivity ? new Date(supplier.lastActivity).toLocaleDateString('tr-TR') : '-';
        
        return `
                <tr class="hover:bg-gray-50 cursor-pointer" data-supplier-id="${supplier.id}">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${supplier.name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${supplier.email || '-'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${supplier.phone || '-'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${registrationDate}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.class}">${statusInfo.text}</span>
                </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onclick="event.stopPropagation();">
                    <button onclick="showSupplierStatusModal(${supplier.id})" class="p-2 text-gray-500 hover:text-green-600" title="Durum Değiştir">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    };
    
    let filteredSuppliers = [...mockData.suppliers];
    
    const renderSuppliersTable = () => {
        const paginatedSuppliers = paginateData(filteredSuppliers, window.paginationState.currentPage);
        const supplierRows = renderSupplierRows(paginatedSuppliers);
        const tableBody = document.getElementById('supplierTableBody');
        
        if (tableBody) {
            tableBody.innerHTML = supplierRows || `
                <tr>
                    <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                        <i class="fas fa-search text-4xl mb-2 text-gray-300"></i>
                        <p>Sonuç bulunamadı</p>
                    </td>
                </tr>
            `;
        }
        
        renderPagination('admin-suppliers-pagination');
        attachSupplierRowClickListeners();
    };
    
    window.paginationState.renderFunction = renderSuppliersTable;
    paginateData(filteredSuppliers, 1);
    
    const initialRows = renderSupplierRows(paginateData(filteredSuppliers, 1));
    
    pageContent.innerHTML = `
        <div class="bg-white rounded-lg shadow">
            <div class="p-6">
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h2 class="text-2xl font-bold">Tedarikçi Yönetimi</h2>
                        <p class="mt-1 text-sm text-gray-500">Tedarikçilerin durumlarını görüntüleyin ve yönetin</p>
                    </div>
                    <button id="addSupplierBtn" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        <i class="fas fa-plus mr-2"></i> Yeni Tedarikçi Ekle
                    </button>
                </div>
                
                <!-- Search Bar -->
                <div class="mb-4">
                    <div class="relative">
                        <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                        <input type="text" id="supplierSearchInput" 
                               class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                               placeholder="Tedarikçi adı, e-posta veya telefon ile ara...">
                    </div>
                </div>
                
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tedarikçi Adı</th>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">E-posta</th>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefon</th>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kayıt Tarihi</th>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody id="supplierTableBody" class="bg-white divide-y divide-gray-200">${initialRows}</tbody>
                    </table>
                </div>
                
                <div id="admin-suppliers-pagination"></div>
                
                <div id="supplierSearchResults" class="mt-4 text-sm text-gray-500 hidden">
                    <span id="supplierSearchCount"></span>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('addSupplierBtn').addEventListener('click', showAddSupplierModal);
    
    // Search functionality
    const searchInput = document.getElementById('supplierSearchInput');
    const searchResults = document.getElementById('supplierSearchResults');
    const searchCount = document.getElementById('supplierSearchCount');
    
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            filteredSuppliers = [...mockData.suppliers];
            searchResults.classList.add('hidden');
        } else {
            filteredSuppliers = mockData.suppliers.filter(supplier => {
                const name = (supplier.name || '').toLowerCase();
                const email = (supplier.email || '').toLowerCase();
                const phone = (supplier.phone || '').toLowerCase();
                
                return name.includes(searchTerm) || 
                       email.includes(searchTerm) || 
                       phone.includes(searchTerm);
            });
            
            searchCount.textContent = `${filteredSuppliers.length} tedarikçi bulundu`;
            searchResults.classList.remove('hidden');
        }
        
        window.paginationState.currentPage = 1;
        renderSuppliersTable();
    });
    
    // Initial render
    renderPagination('admin-suppliers-pagination');
    attachSupplierRowClickListeners();
};

function attachSupplierRowClickListeners() {
    const tableBody = document.getElementById('supplierTableBody');
    if (tableBody) {
        // Remove existing listeners by cloning
        const newTableBody = tableBody.cloneNode(true);
        tableBody.parentNode.replaceChild(newTableBody, tableBody);
        
        // Add new event listener
        newTableBody.addEventListener('click', (e) => {
            const row = e.target.closest('tr[data-supplier-id]');
            if (!row) return;
            
            // Don't navigate if clicking on buttons or action area
            if (e.target.closest('button') || 
                e.target.closest('td[onclick*="stopPropagation"]')) {
                return;
            }
            
            const supplierId = row.getAttribute('data-supplier-id');
            if (supplierId) {
                showSupplierDetailModal(parseInt(supplierId));
            }
        });
    }
}
function showToast(msg){
  const t = document.createElement('div');
  t.className = 'fixed bottom-4 right-4 bg-black text-white text-sm px-3 py-2 rounded shadow';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(()=>{ t.remove(); }, 1800);
}
// --- PRICE REVIEW MODAL ---
function showPriceReviewModal(productId) {
    const product = mockData.products.find(p => p.id === productId);
    if (!product || !product.supplierSubmission || !product.supplierSubmission.priceRequests) {
        showModal('Hata', '<p>Bu ürün için fiyat talebi bulunamadı.</p>', 'Tamam', closeModal);
        return;
    }
    const priceRequests = product.supplierSubmission.priceRequests;
    const pendingRequests = priceRequests.filter(req => req.status === 'pending');
    
    if (pendingRequests.length === 0) {
        showModal('Bilgi', '<p>Bu ürün için bekleyen fiyat talebi bulunmuyor.</p>', 'Tamam', closeModal);
        return;
    }
    const title = `${t('price_review')} - ${t(product.name)}`;
    
    let body = `
        <div class="space-y-6">
            <div class="bg-blue-50 p-4 rounded-lg">
                <div class="flex items-center">
                    <i class="fas fa-info-circle text-blue-500 text-lg mr-3"></i>
                    <div>
                        <h3 class="font-semibold text-blue-800">${t('price_requests')}</h3>
                        <p class="text-sm text-blue-600">${pendingRequests.length} adet bekleyen fiyat talebi</p>
                    </div>
                </div>
            </div>
    `;
    pendingRequests.forEach((request, index) => {
        const isStockPriceUpdate = request.requestType === 'stock_price_update';
        const priceChange = request.currentPrice > 0 ? ((request.requestedPrice - request.currentPrice) / request.currentPrice * 100).toFixed(1) : '0';
        const changeColor = priceChange > 0 ? 'text-red-600' : 'text-green-600';
        const changeIcon = priceChange > 0 ? 'fa-arrow-up' : 'fa-arrow-down';
        const recommendationColor = request.validationInfo && request.validationInfo.recommendation === 'approve' ? 'text-green-600' : 'text-red-600';
        const recommendationIcon = request.validationInfo && request.validationInfo.recommendation === 'approve' ? 'fa-check-circle' : 'fa-times-circle';
        
        body += `
            <div class="border border-gray-200 rounded-lg p-4">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h4 class="font-semibold text-gray-800">${request.supplierName}</h4>
                        <p class="text-sm text-gray-500">${new Date(request.requestDate || request.submittedAt).toLocaleDateString('tr-TR')}</p>
                        ${isStockPriceUpdate ? '<span class="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full mt-1">Stok & Fiyat Güncelleme</span>' : ''}
                    </div>
                    <div class="text-right">
                        <div class="text-sm text-gray-600">${t('price_change')}</div>
                        <div class="font-semibold ${changeColor}">
                            <i class="fas ${changeIcon} mr-1"></i>${priceChange}%
                        </div>
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div class="space-y-2">
                        <div class="flex justify-between">
                            <span class="text-sm text-gray-600">${t('current_price')}:</span>
                            <span class="font-medium">${request.currentPrice.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-sm text-gray-600">${t('requested_price')}:</span>
                            <span class="font-medium">${request.requestedPrice.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
                        </div>
                        ${isStockPriceUpdate ? `
                        <div class="flex justify-between">
                            <span class="text-sm text-gray-600">Mevcut Stok:</span>
                            <span class="font-medium">${request.currentStock || 0} adet</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-sm text-gray-600">Talep Edilen Stok:</span>
                            <span class="font-medium">${request.requestedStock || 0} adet</span>
                        </div>
                        ` : ''}
                    </div>
                    <div class="space-y-2">
                        <div class="flex justify-between">
                            <span class="text-sm text-gray-600">${t('change_reason')}:</span>
                            <span class="text-sm">${request.reason || 'Stok ve fiyat güncelleme talebi'}</span>
                        </div>
                    </div>
                </div>
                         <div class="bg-gray-50 p-3 rounded-lg mb-4">
                             <h5 class="font-semibold text-gray-800 mb-2">${t('market_analysis')}</h5>
                             <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                 <div>
                                     <span class="text-gray-600">${t('platform_average')}:</span>
                                     <span class="font-medium ml-2">${request.validationInfo ? request.validationInfo.platformAverage.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }) : 'N/A'}</span>
                                 </div>
                                 <div>
                                     <span class="text-gray-600">${t('recommendation')}:</span>
                                     <span class="font-medium ml-2 ${recommendationColor}">
                                         <i class="fas ${recommendationIcon} mr-1"></i>
                                         ${request.validationInfo && request.validationInfo.recommendation === 'approve' ? 'Onayla' : 'Reddet'}
                                     </span>
                                 </div>
                             </div>
                             <div class="mt-2">
                                 <span class="text-gray-600 text-sm">${t('unique_product_prices')}:</span>
                                 <div class="flex flex-wrap gap-1 mt-1">
                                     ${request.validationInfo && request.validationInfo.uniqueProductPrices ? request.validationInfo.uniqueProductPrices.map(price => 
                                         `<span class="px-2 py-1 bg-white rounded text-xs">${price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>`
                                     ).join('') : 'N/A'}
                                 </div>
                             </div>
                             <div class="mt-2 text-sm text-gray-600">
                                 <strong>${t('margin_analysis')}:</strong> ${request.validationInfo ? request.validationInfo.marginAnalysis : 'N/A'}
                             </div>
                         </div>
                <div class="flex justify-end space-x-2">
                    <button onclick="handlePriceDecisionCustom(${productId}, ${request.supplierId}, 'reject')" 
                            class="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 font-medium">
                        <i class="fas fa-times mr-2"></i>${t('reject_price')}
                    </button>
                    <button onclick="handlePriceDecisionCustom(${productId}, ${request.supplierId}, 'approve')" 
                            class="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 font-medium">
                        <i class="fas fa-check mr-2"></i>${t('approve_price')}
                    </button>
                </div>
            </div>
        `;
    });
    body += `</div>`;
    // Create a wider custom modal for price review
    showPriceReviewModalCustom(title, body);
}
function handlePriceDecision(productId, supplierId, decision) {
    const product = mockData.products.find(p => p.id === productId);
    if (!product || !product.supplierSubmission || !product.supplierSubmission.priceRequests) {
        return;
    }
    const request = product.supplierSubmission.priceRequests.find(req => req.supplierId === supplierId);
    if (!request) {
        return;
    }
    // Update the request status
    request.status = decision;
    request.decidedAt = new Date().toISOString();
    request.decidedBy = window.currentUser.name;
    // If approved, update the supplier product price and stock
    if (decision === 'approve') {
        const supplierProduct = mockData.supplierProducts.find(sp => 
            sp.productId === productId && sp.supplierId === supplierId
        );
        if (supplierProduct) {
            supplierProduct.price = request.requestedPrice;
            // Update stock if this is a stock & price update request
            if (request.requestType === 'stock_price_update' && request.requestedStock !== undefined) {
                supplierProduct.stock = request.requestedStock;
            }
        } else {
            // Create new supplier product record if it doesn't exist
            mockData.supplierProducts.push({
                productId: productId,
                supplierId: supplierId,
                price: request.requestedPrice,
                stock: request.requestType === 'stock_price_update' ? (request.requestedStock || 0) : 0
            });
        }
    }
    // Show success message
    const message = decision === 'approve' ? t('price_approved') : t('price_rejected');
    showToast(`${message} - ${request.supplierName}`);
    // Close modal and refresh the view
    closeModal();
    handleRouteChange();
}
// Custom wider modal for price review
function showPriceReviewModalCustom(title, body) {
    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modalOverlay.style.backdropFilter = 'blur(2px)';
    
    // Create modal content with wider max-width
    modalOverlay.innerHTML = `
        <div class="modal-content bg-white rounded-lg shadow-xl w-full max-w-4xl transform opacity-100 max-h-[90vh] overflow-y-auto">
            <div class="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                <h3 class="text-lg font-semibold">${title}</h3>
                <button class="close-modal p-2 rounded-md hover:bg-gray-100" onclick="closePriceReviewModal()">&times;</button>
            </div>
            <div class="p-6">
                ${body}
            </div>
            <div class="p-4 bg-gray-50 border-t rounded-b-lg flex justify-end space-x-2 sticky bottom-0">
                <button onclick="closePriceReviewModal()" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Kapat</button>
            </div>
        </div>
    `;
    
    // Add to document
    document.body.appendChild(modalOverlay);
    
    // Add click outside to close
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closePriceReviewModal();
        }
    });
    
    // Add escape key to close
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closePriceReviewModal();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}
function closePriceReviewModal() {
    const modalOverlay = document.querySelector('.modal-overlay');
    if (modalOverlay) {
        modalOverlay.remove();
    }
}
// Custom price decision handler for the wider modal
function handlePriceDecisionCustom(productId, supplierId, decision) {
    const product = mockData.products.find(p => p.id === productId);
    if (!product || !product.supplierSubmission || !product.supplierSubmission.priceRequests) {
        return;
    }
    const request = product.supplierSubmission.priceRequests.find(req => req.supplierId === supplierId);
    if (!request) {
        return;
    }
    // Update the request status
    request.status = decision;
    request.decidedAt = new Date().toISOString();
    request.decidedBy = window.currentUser.name;
    // If approved, update the supplier product price and stock
    if (decision === 'approve') {
        const supplierProduct = mockData.supplierProducts.find(sp => 
            sp.productId === productId && sp.supplierId === supplierId
        );
        if (supplierProduct) {
            supplierProduct.price = request.requestedPrice;
            // Update stock if this is a stock & price update request
            if (request.requestType === 'stock_price_update' && request.requestedStock !== undefined) {
                supplierProduct.stock = request.requestedStock;
            }
        } else {
            // Create new supplier product record if it doesn't exist
            mockData.supplierProducts.push({
                productId: productId,
                supplierId: supplierId,
                price: request.requestedPrice,
                stock: request.requestType === 'stock_price_update' ? (request.requestedStock || 0) : 0
            });
        }
    }
    // Show success message
    const message = decision === 'approve' ? t('price_approved') : t('price_rejected');
    showToast(`${message} - ${request.supplierName}`);
    // Close modal and refresh the view
    closePriceReviewModal();
    handleRouteChange();
}
// --- ENHANCED REVIEW DECISION BUTTONS ---
function generateDecisionButtons(productId, fieldId, currentStatus) {
    const statusClasses = {
        pending: 'bg-yellow-100 text-yellow-800',
        approved: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800'
    };
    
    const statusTexts = {
        pending: 'Bekliyor',
        approved: 'Onaylandı',
        rejected: 'Reddedildi'
    };
    
    const currentClass = statusClasses[currentStatus] || 'bg-gray-100 text-gray-800';
    const currentText = statusTexts[currentStatus] || 'Bilinmiyor';
    
    return `
        <div class="flex flex-col space-y-1">
            <span class="px-2 py-1 text-xs font-semibold rounded-full ${currentClass}">${currentText}</span>
            <div class="flex space-x-1">
                <button onclick="updateFieldStatus(${productId}, ${fieldId}, 'approved')" 
                        class="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200" 
                        title="Onayla">
                    <i class="fas fa-check"></i>
                </button>
                <button onclick="updateFieldStatus(${productId}, ${fieldId}, 'rejected')" 
                        class="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200" 
                        title="Reddet">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `;
}
function generateEnhancedDecisionButtons(productId, fieldId, currentStatus) {
    const statusClasses = {
        pending: 'bg-yellow-100 text-yellow-800',
        approved: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800'
    };
    
    const statusTexts = {
        pending: 'Bekliyor',
        approved: 'Onaylandı',
        rejected: 'Reddedildi'
    };
    
    const currentClass = statusClasses[currentStatus] || 'bg-gray-100 text-gray-800';
    const currentText = statusTexts[currentStatus] || 'Bilinmiyor';
    
    return `
        <div class="flex flex-col space-y-2">
            <span class="px-3 py-1 text-xs font-semibold rounded-full ${currentClass}">${currentText}</span>
            <div class="flex flex-col space-y-1">
                <button onclick="updateFieldStatusWithReason(${productId}, ${fieldId}, 'approved')" 
                        class="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 flex items-center justify-center" 
                        title="Onayla">
                    <i class="fas fa-check mr-1"></i>Onayla
                </button>
                <button onclick="updateFieldStatusWithReason(${productId}, ${fieldId}, 'rejected')" 
                        class="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center justify-center" 
                        title="Reddet">
                    <i class="fas fa-times mr-1"></i>Reddet
                </button>
            </div>
        </div>
    `;
}
function updateFieldStatusWithReason(productId, fieldId, status) {
    if (status === 'rejected') {
        // Show modal for rejection reason
        const body = `
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Red Nedeni</label>
                    <textarea id="rejection-reason" rows="3" 
                              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                              placeholder="Red nedenini açıklayın..."></textarea>
                </div>
                <div class="bg-yellow-50 p-3 rounded-lg">
                    <div class="flex items-start">
                        <i class="fas fa-exclamation-triangle text-yellow-500 text-sm mt-1 mr-2"></i>
                        <div class="text-sm text-yellow-700">
                            <p class="font-semibold">Dikkat:</p>
                            <p>Bu alan reddedildiğinde, tedarikçiye bildirim gönderilecek ve düzeltme istenecektir.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        showModal('Red Nedeni', body, 'Reddet', () => {
            const reason = document.getElementById('rejection-reason').value.trim();
            if (!reason) {
                alert('Lütfen red nedenini belirtin.');
                return;
            }
            updateFieldStatus(productId, fieldId, status, reason);
            closeModal();
        });
    } else {
        updateFieldStatus(productId, fieldId, status);
    }
}
function updateFieldStatus(productId, fieldId, status, reason = '') {
    const product = mockData.products.find(p => p.id === productId);
    if (!product || !product.supplierSubmission) return;
    
    if (fieldId === "'name'") {
        product.supplierSubmission.name.status = status;
        if (reason) {
            product.supplierSubmission.name.rejectionReason = reason;
        }
    } else {
        if (product.supplierSubmission.attributes[fieldId]) {
            product.supplierSubmission.attributes[fieldId].status = status;
            if (reason) {
                product.supplierSubmission.attributes[fieldId].rejectionReason = reason;
            }
        }
    }
    
    // Add to review history
    if (!product.reviewHistory) {
        product.reviewHistory = [];
    }
    
    product.reviewHistory.push({
        reviewer: window.currentUser?.name || 'Admin',
        action: status === 'approved' ? 'Onayladı' : 'Reddetti',
        field: fieldId === "'name'" ? 'Ürün Adı' : `Alan ${fieldId}`,
        reason: reason,
        timestamp: new Date().toISOString()
    });
    
    // Refresh the review page
    handleRouteChange();
}
function addReviewComment(productId) {
    const commentInput = document.getElementById('new-comment');
    const comment = commentInput.value.trim();
    
    if (!comment) {
        alert('Lütfen bir yorum girin.');
        return;
    }
    
    const product = mockData.products.find(p => p.id === productId);
    if (!product) return;
    
    if (!product.reviewHistory) {
        product.reviewHistory = [];
    }
    
    product.reviewHistory.push({
        reviewer: window.currentUser?.name || 'Admin',
        comment: comment,
        timestamp: new Date().toISOString()
    });
    
    commentInput.value = '';
    
    // Refresh the review page
    handleRouteChange();
}
function saveReviewProgress(productId) {
    const product = mockData.products.find(p => p.id === productId);
    if (!product) return;
    
    // Add save action to review history
    if (!product.reviewHistory) {
        product.reviewHistory = [];
    }
    
    product.reviewHistory.push({
        reviewer: window.currentUser?.name || 'Admin',
        action: 'İlerlemeyi Kaydetti',
        timestamp: new Date().toISOString()
    });
    
    showToast('İnceleme ilerlemesi kaydedildi.');
}
// --- BULK ACTIONS FUNCTIONALITY ---
        function updateBulkActionsVisibility() {
    const bulkActionsBar = document.getElementById('bulk-actions-bar');
    const actionsBtn = document.getElementById('actionsBtn');
    const selectedCheckboxes = document.querySelectorAll('.product-checkbox:checked');
    const selectedCount = selectedCheckboxes.length;
    
    if (bulkActionsBar) {
        const countSpan = document.getElementById('selected-count');
        if (countSpan) {
            countSpan.textContent = selectedCount;
        }
        
        if (selectedCount > 0) {
            bulkActionsBar.classList.remove('hidden');
        } else {
            bulkActionsBar.classList.add('hidden');
        }
    }
    
    // Enable/disable actions button based on selection
    if (actionsBtn) {
        if (selectedCount > 0) {
            actionsBtn.disabled = false;
            actionsBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            actionsBtn.classList.add('hover:bg-gray-100');
        } else {
            actionsBtn.disabled = true;
            actionsBtn.classList.add('opacity-50', 'cursor-not-allowed');
            actionsBtn.classList.remove('hover:bg-gray-100');
        }
    }
}
function getSelectedProductIds() {
    const selectedCheckboxes = document.querySelectorAll('.product-checkbox:checked');
    return Array.from(selectedCheckboxes).map(cb => parseInt(cb.dataset.id));
}
function clearSelection() {
    document.querySelectorAll('.product-checkbox').forEach(checkbox => {
        checkbox.checked = false;
    });
    document.getElementById('selectAllCheckbox').checked = false;
    updateBulkActionsVisibility();
}
function bulkApproveProducts() {
    const selectedIds = getSelectedProductIds();
    if (selectedIds.length === 0) {
        alert('Lütfen onaylanacak ürünleri seçin.');
        return;
    }
    
    const confirmMessage = `${selectedIds.length} ürünü toplu olarak onaylamak istediğinizden emin misiniz?`;
    if (!confirm(confirmMessage)) {
        return;
    }
    
    let approvedCount = 0;
    selectedIds.forEach(productId => {
        const product = mockData.products.find(p => p.id === productId);
        if (product && product.supplierSubmission) {
            // Approve all pending fields
            if (product.supplierSubmission.name.status === 'pending') {
                product.supplierSubmission.name.status = 'approved';
            }
            
            Object.keys(product.supplierSubmission.attributes || {}).forEach(attrId => {
                if (product.supplierSubmission.attributes[attrId].status === 'pending') {
                    product.supplierSubmission.attributes[attrId].status = 'approved';
                }
            });
            
            // Add to review history
            if (!product.reviewHistory) {
                product.reviewHistory = [];
            }
            
            product.reviewHistory.push({
                reviewer: window.currentUser?.name || 'Admin',
                action: 'Toplu Onaylama',
                timestamp: new Date().toISOString()
            });
            
            approvedCount++;
        }
    });
    
    showToast(`${approvedCount} ürün başarıyla onaylandı.`);
    clearSelection();
    handleRouteChange();
}
function bulkRejectProducts() {
    const selectedIds = getSelectedProductIds();
    if (selectedIds.length === 0) {
        alert('Lütfen reddedilecek ürünleri seçin.');
        return;
    }
    
    // Show rejection reason modal
    const body = `
        <div class="space-y-4">
            <div class="bg-red-50 p-4 rounded-lg">
                <div class="flex items-center">
                    <i class="fas fa-exclamation-triangle text-red-500 text-xl mr-3"></i>
                    <div>
                        <h3 class="font-semibold text-red-800">Toplu Red İşlemi</h3>
                        <p class="text-sm text-red-600">${selectedIds.length} ürün reddedilecek</p>
                    </div>
                </div>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Red Nedeni *</label>
                <textarea id="bulk-rejection-reason" rows="3" 
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          placeholder="Toplu red nedenini açıklayın..."></textarea>
            </div>
            <div class="bg-yellow-50 p-3 rounded-lg">
                <div class="flex items-start">
                    <i class="fas fa-info-circle text-yellow-500 text-sm mt-1 mr-2"></i>
                    <div class="text-sm text-yellow-700">
                        <p class="font-semibold">Bilgi:</p>
                        <p>Tüm seçili ürünler aynı nedenle reddedilecek ve tedarikçilere bildirim gönderilecektir.</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    showModal('Toplu Red İşlemi', body, 'Reddet', () => {
        const reason = document.getElementById('bulk-rejection-reason').value.trim();
        if (!reason) {
            alert('Lütfen red nedenini belirtin.');
            return;
        }
        
        let rejectedCount = 0;
        selectedIds.forEach(productId => {
            const product = mockData.products.find(p => p.id === productId);
            if (product && product.supplierSubmission) {
                // Reject all pending fields
                if (product.supplierSubmission.name.status === 'pending') {
                    product.supplierSubmission.name.status = 'rejected';
                    product.supplierSubmission.name.rejectionReason = reason;
                }
                
                Object.keys(product.supplierSubmission.attributes || {}).forEach(attrId => {
                    if (product.supplierSubmission.attributes[attrId].status === 'pending') {
                        product.supplierSubmission.attributes[attrId].status = 'rejected';
                        product.supplierSubmission.attributes[attrId].rejectionReason = reason;
                    }
                });
                
                // Add to review history
                if (!product.reviewHistory) {
                    product.reviewHistory = [];
                }
                
                product.reviewHistory.push({
                    reviewer: window.currentUser?.name || 'Admin',
                    action: 'Toplu Red',
                    reason: reason,
                    timestamp: new Date().toISOString()
                });
                
                rejectedCount++;
            }
        });
        
        showToast(`${rejectedCount} ürün reddedildi.`);
        clearSelection();
        closeModal();
        handleRouteChange();
    });
}
function bulkAssignToReviewer() {
    const selectedIds = getSelectedProductIds();
    if (selectedIds.length === 0) {
        alert('Lütfen atanacak ürünleri seçin.');
        return;
    }
    
    // Mock reviewers list
    const reviewers = [
        { id: 1, name: 'Ahmet Yılmaz', email: 'ahmet@company.com' },
        { id: 2, name: 'Elif Demir', email: 'elif@company.com' },
        { id: 3, name: 'Mehmet Kaya', email: 'mehmet@company.com' }
    ];
    
    const body = `
        <div class="space-y-4">
            <div class="bg-blue-50 p-4 rounded-lg">
                <div class="flex items-center">
                    <i class="fas fa-user text-blue-500 text-xl mr-3"></i>
                    <div>
                        <h3 class="font-semibold text-blue-800">İncelemeye Atama</h3>
                        <p class="text-sm text-blue-600">${selectedIds.length} ürün atanacak</p>
                    </div>
                </div>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">İnceleyici Seçin *</label>
                <select id="reviewer-select" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">İnceleyici seçin...</option>
                    ${reviewers.map(r => `<option value="${r.id}">${r.name} (${r.email})</option>`).join('')}
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Öncelik</label>
                <select id="priority-select" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="normal">Normal</option>
                    <option value="high">Yüksek</option>
                    <option value="urgent">Acil</option>
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Not (İsteğe bağlı)</label>
                <textarea id="assignment-note" rows="3" 
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="İnceleyiciye not..."></textarea>
            </div>
        </div>
    `;
    
    showModal('İncelemeye Atama', body, 'Ata', () => {
        const reviewerId = document.getElementById('reviewer-select').value;
        const priority = document.getElementById('priority-select').value;
        const note = document.getElementById('assignment-note').value.trim();
        
        if (!reviewerId) {
            alert('Lütfen bir inceleyici seçin.');
            return;
        }
        
        const reviewer = reviewers.find(r => r.id == reviewerId);
        
        selectedIds.forEach(productId => {
            const product = mockData.products.find(p => p.id === productId);
            if (product) {
                // Add assignment info
                product.assignedReviewer = {
                    id: reviewerId,
                    name: reviewer.name,
                    email: reviewer.email,
                    assignedAt: new Date().toISOString(),
                    priority: priority,
                    note: note
                };
                
                // Add to review history
                if (!product.reviewHistory) {
                    product.reviewHistory = [];
                }
                
                product.reviewHistory.push({
                    reviewer: window.currentUser?.name || 'Admin',
                    action: `İncelemeye Atandı: ${reviewer.name}`,
                    priority: priority,
                    note: note,
                    timestamp: new Date().toISOString()
                });
            }
        });
        
        showToast(`${selectedIds.length} ürün ${reviewer.name} kullanıcısına atandı.`);
        clearSelection();
        closeModal();
        handleRouteChange();
    });
}
function bulkSetPriority() {
    const selectedIds = getSelectedProductIds();
    if (selectedIds.length === 0) {
        alert('Lütfen öncelik belirlenecek ürünleri seçin.');
        return;
    }
    
    const body = `
        <div class="space-y-4">
            <div class="bg-yellow-50 p-4 rounded-lg">
                <div class="flex items-center">
                    <i class="fas fa-flag text-yellow-500 text-xl mr-3"></i>
                    <div>
                        <h3 class="font-semibold text-yellow-800">Öncelik Belirleme</h3>
                        <p class="text-sm text-yellow-600">${selectedIds.length} ürün için öncelik belirlenecek</p>
                    </div>
                </div>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Öncelik Seviyesi *</label>
                <select id="priority-level" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500">
                    <option value="low">Düşük</option>
                    <option value="normal" selected>Normal</option>
                    <option value="high">Yüksek</option>
                    <option value="urgent">Acil</option>
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Açıklama (İsteğe bağlı)</label>
                <textarea id="priority-reason" rows="3" 
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                          placeholder="Öncelik nedenini açıklayın..."></textarea>
            </div>
        </div>
    `;
    
    showModal('Öncelik Belirleme', body, 'Belirle', () => {
        const priority = document.getElementById('priority-level').value;
        const reason = document.getElementById('priority-reason').value.trim();
        
        const priorityTexts = {
            low: 'Düşük',
            normal: 'Normal',
            high: 'Yüksek',
            urgent: 'Acil'
        };
        
        selectedIds.forEach(productId => {
            const product = mockData.products.find(p => p.id === productId);
            if (product) {
                product.priority = {
                    level: priority,
                    reason: reason,
                    setAt: new Date().toISOString(),
                    setBy: window.currentUser?.name || 'Admin'
                };
                
                // Add to review history
                if (!product.reviewHistory) {
                    product.reviewHistory = [];
                }
                
                product.reviewHistory.push({
                    reviewer: window.currentUser?.name || 'Admin',
                    action: `Öncelik Belirlendi: ${priorityTexts[priority]}`,
                    reason: reason,
                    timestamp: new Date().toISOString()
                });
            }
        });
        
        showToast(`${selectedIds.length} ürün için öncelik "${priorityTexts[priority]}" olarak belirlendi.`);
        clearSelection();
        closeModal();
        handleRouteChange();
    });
}
function bulkExport() {
    const selectedIds = getSelectedProductIds();
    if (selectedIds.length === 0) {
        alert('Lütfen dışa aktarılacak ürünleri seçin.');
        return;
    }
    
    const selectedProducts = mockData.products.filter(p => selectedIds.includes(p.id));
    
    // Create CSV content
    let csvContent = 'ID,SKU,Ürün Adı,Kategori,Durum,Stok,Fiyat,Son Güncelleme\n';
    
    selectedProducts.forEach(product => {
        const category = mockData.categories.find(c => c.id === product.categoryId) || { name: { tr: 'Kategorisiz' } };
        const price = getProductPrice(product.id) || 0;
        const stock = getProductStock(product.id) || 0;
        
        csvContent += `${product.id},"${product.sku}","${t(product.name)}","${t(category.name)}","${product.status}",${stock},${price},"${product.lastUpdated}"\n`;
    });
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `products_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast(`${selectedIds.length} ürün CSV formatında dışa aktarıldı.`);
    clearSelection();
}

// --- FORM STATE MANAGEMENT ---
// Object to store form field values per tab
let formStatePerTab = {};
let currentProductTab = null;

function saveFormState(tabName) {
    // Save all input and select values from the current tab
    const container = document.getElementById('product-tab-content');
    if (!container || !tabName) return;
    
    // Initialize cache for this tab if it doesn't exist
    if (!formStatePerTab[tabName]) {
        formStatePerTab[tabName] = {};
    }
    
    const inputs = container.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        // Create a unique key based on input id or data attributes
        let key = input.id || input.getAttribute('name') || input.getAttribute('data-attr-id');
        if (!key) return;
        
        if (input.type === 'checkbox') {
            formStatePerTab[tabName][key] = input.checked;
        } else {
            formStatePerTab[tabName][key] = input.value;
        }
    });
}

function restoreFormState(tabName) {
    // Only restore if we have saved state for this specific tab
    const container = document.getElementById('product-tab-content');
    if (!container || !tabName || !formStatePerTab[tabName]) return;
    
    setTimeout(() => {
        const inputs = container.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            let key = input.id || input.getAttribute('name') || input.getAttribute('data-attr-id');
            if (!key || !formStatePerTab[tabName].hasOwnProperty(key)) return;
            
            if (input.type === 'checkbox') {
                input.checked = formStatePerTab[tabName][key];
            } else {
                input.value = formStatePerTab[tabName][key];
            }
        });
    }, 0);
}
// --- PRODUCT TAB RENDERING ---
function renderProductTab(tabName, product) {
    
    const container = document.getElementById('product-tab-content');
    if (!container) {
        console.error('product-tab-content container not found!');
        return;
    }
    
    const user = window.currentUser || {};
    const isSupplier = user.role === 'supplier';
    
    // Save form state before rendering new tab
    saveFormState(currentProductTab);
    
    switch (tabName) {
         case 'comparison':
             renderComparisonTab(container, product, isSupplier);
             break;
        case 'general':
            renderGeneralTab(container, product, isSupplier, user.supplierId);
            break;
        case 'stock-price':
            renderStockPriceTab(container, product, isSupplier);
            break;
        case 'attributes':
            renderAttributesTab(container, product, isSupplier);
            break;
        case 'images':
            renderImagesTab(container, product, isSupplier);
            break;
        case 'variants':
            if (!isSupplier) renderVariantsTab(container, product);
            break;
        case 'assets':
            if (!isSupplier) renderAssetsTab(container, product);
            break;
        case 'sync':
            if (!isSupplier) renderSyncTab(container, product);
            break;
        case 'logs':
            if (!isSupplier) {
                // Ensure we have the latest product data with changeLogs
                const latestProduct = mockData.products.find(p => p.id === product.id) || product;
                renderLogsTab(container, latestProduct);
            }
            break;
        default:
            container.innerHTML = '<p class="text-gray-500">Bilinmeyen sekme</p>';
    }
    
    // Restore form state after rendering new tab
    restoreFormState(tabName); currentProductTab = tabName;;
}
 function renderComparisonTab(container, product, isSupplier) {
     try {
         const category = mockData.categories.find(c => c.id === product.categoryId) || { name: { tr: 'Kategorisiz', en: 'Uncategorized' } };
         const brand = mockData.brands.find(b => b.id === product.brandId) || { name: 'Bilinmeyen Marka' };
         const price = product.isNew ? 0 : getProductPrice(product.id);
         const stock = product.isNew ? 0 : getProductStock(product.id);
         
         // Get supplier submission data
         const submission = product.supplierSubmission;
         if (!submission) {
             container.innerHTML = '<div class="text-center p-10 text-gray-500">Güncelleme verisi bulunamadı.</div>';
             return;
         }
         
         // Determine if this is a new product request or update request
         const isNewProductRequest = (product.status === 'draft' && submission) || (submission && submission.requestType === 'product_create');
         const isUpdateRequest = (product.status === 'active' && submission && submission.status === 'pending') || (submission && submission.requestType === 'product_update');
         
         console.log('renderComparisonTab Debug:', {
             productId: product.id,
             productName: product.name,
             status: product.status,
             submission: submission,
             isNewProductRequest: isNewProductRequest,
             isUpdateRequest: isUpdateRequest
         });
         
         // Helper function to get attribute value
         const getAttributeValue = (attrId, isSubmission = false) => {
             if (isSubmission && submission.attributes && submission.attributes[attrId]) {
                 return submission.attributes[attrId].value;
             } else if (product.attributes && product.attributes[attrId]) {
                 return product.attributes[attrId].value;
             }
             return '-';
         };
         
         // Helper function to get attribute status
         const getAttributeStatus = (attrId) => {
             if (submission.attributes && submission.attributes[attrId]) {
                 return submission.attributes[attrId].status;
             }
             return 'approved';
         };
         
         // Get category attributes for comparison
         const categoryAttributes = mockData.attributes.filter(attr => 
             category.attributes && category.attributes.includes(attr.id)
         );
         
         container.innerHTML = `
             <div class="space-y-6">
                 <!-- Header -->
                 <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                     <div class="flex items-center justify-between">
                         <div>
                             <h3 class="text-lg font-semibold text-gray-900">${isNewProductRequest ? 'Yeni Ürün Talebi - Onay Bekliyor' : 'Güncelleme Onayı Bekleyen Ürün'}</h3>
                             <p class="text-sm text-gray-600 mt-1">${isNewProductRequest ? 'Gönderdiğiniz yeni ürün talebi admin onayı beklemektedir' : 'Bu ürün için gönderdiğiniz güncelleme talebi admin onayı beklemektedir'}</p>
                         </div>
                         <div class="flex items-center space-x-2">
                             <span class="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                                 <i class="fas fa-clock mr-1"></i>Onay Bekliyor
                             </span>
                         </div>
                     </div>
                 </div>
                 
                 <!-- Submission Info -->
                 <div class="bg-white rounded-lg shadow-sm border p-6">
                     <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div class="flex items-center space-x-3">
                             <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                 <i class="fas fa-calendar-alt text-blue-600"></i>
                             </div>
                             <div>
                                 <p class="text-sm font-medium text-gray-700">Gönderim Tarihi</p>
                                 <p class="text-sm text-gray-600">${new Date(submission.submittedAt).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                             </div>
                         </div>
                         ${!isSupplier ? `
                         <div class="flex items-center space-x-3">
                             <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                 <i class="fas fa-user text-green-600"></i>
                             </div>
                             <div>
                                 <p class="text-sm font-medium text-gray-700">Tedarikçi</p>
                                 <p class="text-sm text-gray-600">${mockData.suppliers.find(s => s.id === submission.supplierId)?.name || 'Bilinmeyen Tedarikçi'}</p>
                             </div>
                         </div>
                         ` : ''}
                     </div>
                 </div>
                 
                 <!-- Changes Overview -->
                 <div class="bg-white rounded-lg shadow-sm border overflow-hidden">
                     <div class="px-6 py-4 border-b border-gray-200">
                         <h4 class="text-lg font-semibold text-gray-900">${isNewProductRequest ? 'Gönderilen Ürün Bilgileri' : 'Gönderilen Güncellemeler'}</h4>
                         <p class="text-sm text-gray-600 mt-1">${isNewProductRequest ? 'Admin onayı için gönderdiğiniz yeni ürün bilgileri' : 'Admin onayı için gönderdiğiniz değişiklikler'}</p>
                     </div>
                      <div class="p-6">
                          <div class="space-y-4">
                              ${submission.name && submission.name.value ? `
                              <div class="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                                  <div class="flex items-center space-x-3 mb-3">
                                      <i class="fas fa-tag text-orange-600"></i>
                                      <p class="font-medium text-gray-900">Ürün Adı</p>
                                      <span class="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">${isNewProductRequest ? 'Yeni' : 'Güncellendi'}</span>
                                  </div>
                                  <div class="grid grid-cols-1 ${isNewProductRequest ? '' : 'md:grid-cols-2'} gap-4">
                                      ${!isNewProductRequest ? `
                                      <div class="bg-white p-3 rounded-lg border">
                                          <div class="text-sm text-gray-600 mb-1">Mevcut Değer</div>
                                          <div class="font-medium text-gray-800">${t(product.name)}</div>
                                      </div>
                                      ` : ''}
                                      <div class="bg-orange-100 p-3 rounded-lg border border-orange-300">
                                          <div class="text-sm text-orange-700 mb-1">${isNewProductRequest ? 'Gönderilen Değer' : 'Gönderdiğiniz Değer'}</div>
                                          <div class="font-medium text-orange-900">${t(submission.name.value)}</div>
                                      </div>
                                  </div>
                              </div>
                              ` : ''}
                              
                              <!-- Category -->
                              ${submission.categoryId ? `
                              <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                  <div class="flex items-center space-x-3 mb-3">
                                      <i class="fas fa-folder text-blue-600"></i>
                                      <p class="font-medium text-gray-900">Kategori</p>
                                      <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">Yeni</span>
                                  </div>
                                  <div class="bg-white p-3 rounded-lg border">
                                      <div class="font-medium text-gray-800">${mockData.categories.find(c => c.id === submission.categoryId)?.name?.tr || 'Bilinmiyor'}</div>
                                  </div>
                              </div>
                              ` : ''}
                              
                              <!-- SKU -->
                              ${submission.sku ? `
                              <div class="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                  <div class="flex items-center space-x-3 mb-3">
                                      <i class="fas fa-barcode text-purple-600"></i>
                                      <p class="font-medium text-gray-900">SKU / Barkod</p>
                                      <span class="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">Yeni</span>
                                  </div>
                                  <div class="bg-white p-3 rounded-lg border">
                                      <div class="font-medium text-gray-800">${submission.sku}</div>
                                  </div>
                              </div>
                              ` : ''}
                              
                              <!-- Price -->
                              ${submission.listPrice !== undefined && submission.listPrice !== null ? `
                              <div class="p-4 bg-green-50 border border-green-200 rounded-lg">
                                  <div class="flex items-center space-x-3 mb-3">
                                      <i class="fas fa-money-bill-wave text-green-600"></i>
                                      <p class="font-medium text-gray-900">Fiyat</p>
                                      <span class="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Yeni</span>
                                  </div>
                                  <div class="bg-white p-3 rounded-lg border">
                                      <div class="font-medium text-gray-800">${submission.listPrice} ₺</div>
                                  </div>
                              </div>
                              ` : ''}
                              
                              <!-- Stock -->
                              ${submission.stock !== undefined && submission.stock !== null ? `
                              <div class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                  <div class="flex items-center space-x-3 mb-3">
                                      <i class="fas fa-boxes text-yellow-600"></i>
                                      <p class="font-medium text-gray-900">Stok</p>
                                      <span class="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">Yeni</span>
                                  </div>
                                  <div class="bg-white p-3 rounded-lg border">
                                      <div class="font-medium text-gray-800">${submission.stock} adet</div>
                                  </div>
                              </div>
                              ` : ''}
                              
                              <!-- Description -->
                              ${submission.description ? `
                              <div class="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                                  <div class="flex items-center space-x-3 mb-3">
                                      <i class="fas fa-file-alt text-indigo-600"></i>
                                      <p class="font-medium text-gray-900">Açıklama</p>
                                      <span class="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full">Yeni</span>
                                  </div>
                                  <div class="bg-white p-3 rounded-lg border">
                                      <div class="font-medium text-gray-800">${submission.description}</div>
                                  </div>
                              </div>
                              ` : ''}
                              
                              <!-- Attributes -->
                              ${Object.entries(submission.attributes || {}).length > 0 ? `<h5 class="font-medium text-gray-900 mt-4 mb-2">Özellikler</h5>` : ''}
                              
                              ${Object.entries(submission.attributes || {}).map(([attrId, attrData]) => {
                                  const attribute = mockData.attributes.find(a => a.id == attrId);
                                  const currentValue = product.attributes && product.attributes[attrId] ? product.attributes[attrId].value : '-';
                                  const isChanged = currentValue !== attrData.value;
                                  
                                  return `
                                  <div class="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                                      <div class="flex items-center space-x-3 mb-3">
                                          <i class="fas fa-cog text-orange-600"></i>
                                          <p class="font-medium text-gray-900">${attribute ? t(attribute.label) : 'Özellik'}</p>
                                          <span class="px-2 py-1 ${isNewProductRequest ? 'bg-orange-100 text-orange-800' : (isChanged ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-600')} text-xs font-medium rounded-full">
                                              ${isNewProductRequest ? 'Yeni' : (isChanged ? 'Güncellendi' : 'Aynı')}
                                          </span>
                                      </div>
                                      <div class="grid grid-cols-1 ${isNewProductRequest ? '' : 'md:grid-cols-2'} gap-4">
                                          ${!isNewProductRequest ? `
                                          <div class="bg-white p-3 rounded-lg border">
                                              <div class="text-sm text-gray-600 mb-1">Mevcut Değer</div>
                                              <div class="font-medium text-gray-800">${currentValue}</div>
                                          </div>
                                          ` : ''}
                                          <div class="bg-orange-100 p-3 rounded-lg border border-orange-300">
                                              <div class="text-sm text-orange-700 mb-1">${isNewProductRequest ? 'Gönderilen Değer' : 'Gönderdiğiniz Değer'}</div>
                                              <div class="font-medium text-orange-900">${attrData.value}</div>
                                          </div>
                                      </div>
                                  </div>
                                  `;
                              }).join('')}
                          </div>
                      </div>
                 </div>

             </div>
         `;
         
     } catch (error) {
         console.error('Error rendering comparison tab:', error);
         container.innerHTML = '<div class="text-center p-10 text-red-500">Karşılaştırma verileri yüklenirken hata oluştu.</div>';
     }
 }
function renderGeneralTab(container, product, isSupplier, supplierId) {
    
    try {
        const category = mockData.categories.find(c => c.id === product.categoryId) || { name: { tr: 'Kategorisiz', en: 'Uncategorized' } };
        const brand = mockData.brands.find(b => b.id === product.brandId) || { name: 'Bilinmeyen Marka' };
        const price = product.isNew ? 0 : getProductPrice(product.id);
        const stock = product.isNew ? 0 : getProductStock(product.id);
        
        // Check if there's a toBeRevised request for this product
        const toBeRevisedRequest = isSupplier && supplierId ? 
            mockData.requests.find(r => 
                r.productId == product.id && 
                r.supplierId == supplierId && 
                r.status === 'toBeRevised' &&
                (r.type === 'product_update' || r.type === 'product_create')
            ) : null;
        
        // Get request data to pre-populate form if it exists
        const requestData = toBeRevisedRequest?.data || {};
    
        // Check if this is a draft product or new product that can be edited
        const isDraftEditable = isSupplier && ((product.status === 'draft' && !product.supplierSubmission) || product.isNew);
        // Check if there's a toBeRevised request - suppliers should be able to edit these directly
        const hasToBeRevisedRequest = isSupplier && toBeRevisedRequest !== null;
        
        // For suppliers: show editable form if it's a draft/new product OR if there's a toBeRevised request
        // When there's a toBeRevised request, always show editable form (even if product is not draft)
        // For new products, always show editable form with category dropdown
        if ((isDraftEditable && !hasToBeRevisedRequest) || (product.isNew && isSupplier)) {
            // Build category tree HTML with search for new products
            const buildCategoryTreeForProduct = (categories, parentId = null, depth = 0, searchTerm = '') => {
                const lowerCaseSearchTerm = searchTerm.toLowerCase();
                
                // Get ancestors for matching categories
                const getAncestors = (catId) => {
                    let ancestors = new Set();
                    let current = categories.find(c => c.id === catId);
                    while (current && current.parentId !== null) {
                        ancestors.add(current.parentId);
                        current = categories.find(c => c.id === current.parentId);
                    }
                    return ancestors;
                };
                
                let filteredCategories = categories;
                let ancestorIds = new Set();
                
                if (searchTerm) {
                    const matchingCategories = categories.filter(c => {
                        const name = typeof c.name === 'object' ? t(c.name) : c.name;
                        return name.toLowerCase().includes(lowerCaseSearchTerm);
                    });
                    matchingCategories.forEach(c => {
                        getAncestors(c.id).forEach(id => ancestorIds.add(id));
                    });
                    filteredCategories = categories.filter(c => 
                        matchingCategories.some(mc => mc.id === c.id) || ancestorIds.has(c.id)
                    );
                }
                
                const treeItems = filteredCategories
                    .filter(c => c.parentId === parentId)
                    .map(c => {
                        const children = buildCategoryTreeForProduct(categories, c.id, depth + 1, searchTerm);
                        const hasChildren = categories.some(cat => cat.parentId === c.id);
                        const uniqueId = `product-cat-children-${c.id}`;
                        const shouldShow = !searchTerm || ancestorIds.has(c.id) || 
                            (typeof c.name === 'object' ? t(c.name) : c.name).toLowerCase().includes(lowerCaseSearchTerm);
                        const childrenHTML = children && shouldShow ? 
                            `<div id="${uniqueId}" class="ml-3 border-l border-gray-200 ${searchTerm ? '' : 'hidden'}">${children}</div>` : '';
                        const toggleIcon = hasChildren ? 
                            `<i class="fas fa-chevron-right text-gray-400 mr-1 text-xs transition-transform" id="product-cat-icon-${c.id}" style="display: inline-block; width: 12px; ${searchTerm ? 'transform: rotate(90deg);' : ''}"></i>` : 
                            '<span style="display: inline-block; width: 12px;"></span>';
                        
                        const categoryName = typeof c.name === 'object' ? t(c.name) : c.name;
                        const isSelected = product.categoryId && c.id == product.categoryId;
                        
                        return `<div class="py-1 px-2 hover:bg-gray-100 transition-colors rounded ${isSelected ? 'bg-blue-100' : ''}" data-category-id="${c.id}">
                            <div class="flex items-center">
                                ${hasChildren ? `<span onclick="toggleProductCategoryChildren('${uniqueId}', 'product-cat-icon-${c.id}'); event.stopPropagation();" style="cursor: pointer; display: flex; align-items: center;">${toggleIcon}</span>` : toggleIcon}
                                ${hasChildren ? '<i class="fas fa-folder text-gray-400 text-xs"></i>' : '<i class="fas fa-file text-gray-300 text-xs"></i>'}
                                <span class="text-sm text-gray-700 ml-1 category-name flex-1" style="cursor: pointer;" onclick="selectProductCategory('${c.id}');">${categoryName}</span>
                            </div>
                            ${childrenHTML}
                        </div>`;
                    })
                    .join('');
                
                return treeItems;
            };
            
            const selectedCategory = product.categoryId ? mockData.categories.find(c => c.id === product.categoryId) : null;
            const selectedName = selectedCategory ? (typeof selectedCategory.name === 'object' ? t(selectedCategory.name) : selectedCategory.name) : 'Kategori seçilmedi';
            const treeHTML = buildCategoryTreeForProduct(mockData.categories, null, 0, '');
            
            // Use category tree for new products, simple select for draft products
            const categoryFieldHTML = product.isNew ? `
                <div class="space-y-3">
                    <div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                        <div class="flex items-center space-x-2 mb-2">
                            <i class="fas fa-sitemap text-blue-600"></i>
                            <label class="block text-sm font-semibold text-gray-700">Kategori</label>
                        </div>
                        <p class="text-xs text-gray-600">Kategori ağacından bir kategori seçin veya arama yaparak bulun.</p>
                    </div>
                    
                    <div id="product-category-tree-container" class="max-h-64 overflow-y-auto border border-gray-200 rounded-lg bg-white p-4">
                        <div class="mb-3 pb-3 border-b border-gray-200">
                            <div class="relative">
                                <input type="text" id="product-category-search" 
                                       class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                       placeholder="Kategori ara...">
                                <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                            </div>
                        </div>
                        <div id="product-category-tree">
                            ${treeHTML}
                        </div>
                    </div>
                    
                    <div id="product-selected-category-display" class="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <small class="text-gray-600">Seçilen: </small>
                        <span id="product-selected-cat-name" class="font-semibold text-blue-700">
                            ${selectedName}
                        </span>
                    </div>
                    
                    <input type="hidden" id="edit-product-category" value="${product.categoryId || ''}">
                </div>
            ` : `
                <select id="edit-product-category" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    ${mockData.categories.map(c => 
                        `<option value="${c.id}" ${c.id === product.categoryId ? 'selected' : ''}>${t(c.name)}</option>`
                    ).join('')}
                </select>
            `;
            
            container.innerHTML = `
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="space-y-6">
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <h3 class="text-lg font-semibold mb-4">Temel Bilgiler</h3>
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Ürün Adı</label>
                                    <input type="text" id="edit-product-name" value="${product.isNew ? '' : t(product.name)}" placeholder="Ürün adını girin..." class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">${t('sku_header')}</label>
                                    <input type="text" value="${product.sku}" class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100" readonly>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                                    ${categoryFieldHTML}
                                </div>
                                
                            </div>
                        </div>
                        
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <h3 class="text-lg font-semibold mb-4">Kategori Özellikleri</h3>
                            <div id="category-attributes-container">
                                <p class="text-sm text-gray-500">Lütfen bir kategori seçerek başlayın.</p>
                            </div>
                        </div>
                        
                    </div>
                </div>
            `;
            // Add event listeners for category change
            if (product.isNew) {
                // For new products with category tree
                // Add search functionality
                const searchInput = document.getElementById('product-category-search');
                if (searchInput) {
                    searchInput.addEventListener('input', (e) => {
                        filterProductCategoryTree(e.target.value);
                    });
                }
                
                // Make selectProductCategory and toggleProductCategoryChildren available globally
                window.selectProductCategory = function(categoryId) {
                    const hiddenInput = document.getElementById('edit-product-category');
                    const displaySpan = document.getElementById('product-selected-cat-name');
                    
                    if (hiddenInput) {
                        hiddenInput.value = categoryId || '';
                    }
                    
                    // Update display
                    if (categoryId) {
                        const category = mockData.categories.find(c => c.id == categoryId);
                        const categoryName = category ? (typeof category.name === 'object' ? t(category.name) : category.name) : '';
                        if (displaySpan) {
                            displaySpan.textContent = categoryName || 'Kategori seçilmedi';
                        }
                    } else {
                        if (displaySpan) {
                            displaySpan.textContent = 'Kategori seçilmedi';
                        }
                    }
                    
                    // Update visual selection
                    const container = document.getElementById('product-category-tree-container');
                    if (container) {
                        container.querySelectorAll('[data-category-id]').forEach(el => {
                            el.classList.remove('bg-blue-100');
                        });
                        if (categoryId) {
                            const selectedEl = container.querySelector(`[data-category-id="${categoryId}"]`);
                            if (selectedEl) {
                                selectedEl.classList.add('bg-blue-100');
                            }
                        }
                    }
                    
                    // Render category attributes
                    if (categoryId && typeof renderCategoryAttributes === 'function') {
                        renderCategoryAttributes(categoryId);
                    }
                };
                
                window.toggleProductCategoryChildren = function(elementId, iconId) {
                    const element = document.getElementById(elementId);
                    const icon = document.getElementById(iconId);
                    if (element) {
                        element.classList.toggle('hidden');
                        if (icon) {
                            icon.style.transform = element.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(90deg)';
                        }
                    }
                };
                
                window.filterProductCategoryTree = function(searchTerm) {
                    const lowerCaseSearchTerm = searchTerm.toLowerCase();
                    const treeContainer = document.getElementById('product-category-tree');
                    if (!treeContainer) return;
                    
                    const buildFilteredTree = (categories, parentId = null, depth = 0) => {
                        // Get ancestors for matching categories
                        const getAncestors = (catId) => {
                            let ancestors = new Set();
                            let current = categories.find(c => c.id === catId);
                            while (current && current.parentId !== null) {
                                ancestors.add(current.parentId);
                                current = categories.find(c => c.id === current.parentId);
                            }
                            return ancestors;
                        };
                        
                        let filteredCategories = categories;
                        let ancestorIds = new Set();
                        
                        if (searchTerm) {
                            const matchingCategories = categories.filter(c => {
                                const name = typeof c.name === 'object' ? t(c.name) : c.name;
                                return name.toLowerCase().includes(lowerCaseSearchTerm);
                            });
                            matchingCategories.forEach(c => {
                                getAncestors(c.id).forEach(id => ancestorIds.add(id));
                            });
                            filteredCategories = categories.filter(c => 
                                matchingCategories.some(mc => mc.id === c.id) || ancestorIds.has(c.id)
                            );
                        }
                        
                        const treeItems = filteredCategories
                            .filter(c => c.parentId === parentId)
                            .map(c => {
                                const children = buildFilteredTree(categories, c.id, depth + 1);
                                const hasChildren = categories.some(cat => cat.parentId === c.id);
                                const uniqueId = `product-cat-children-${c.id}`;
                                const shouldShow = !searchTerm || ancestorIds.has(c.id) || 
                                    (typeof c.name === 'object' ? t(c.name) : c.name).toLowerCase().includes(lowerCaseSearchTerm);
                                const childrenHTML = children && shouldShow ? 
                                    `<div id="${uniqueId}" class="ml-3 border-l border-gray-200 ${searchTerm ? '' : 'hidden'}">${children}</div>` : '';
                                const toggleIcon = hasChildren ? 
                                    `<i class="fas fa-chevron-right text-gray-400 mr-1 text-xs transition-transform" id="product-cat-icon-${c.id}" style="display: inline-block; width: 12px; ${searchTerm ? 'transform: rotate(90deg);' : ''}"></i>` : 
                                    '<span style="display: inline-block; width: 12px;"></span>';
                                
                                const categoryName = typeof c.name === 'object' ? t(c.name) : c.name;
                                const hiddenInput = document.getElementById('edit-product-category');
                                const isSelected = hiddenInput && hiddenInput.value && c.id == hiddenInput.value;
                                
                                return `<div class="py-1 px-2 hover:bg-gray-100 transition-colors rounded ${isSelected ? 'bg-blue-100' : ''}" data-category-id="${c.id}">
                                    <div class="flex items-center">
                                        ${hasChildren ? `<span onclick="toggleProductCategoryChildren('${uniqueId}', 'product-cat-icon-${c.id}'); event.stopPropagation();" style="cursor: pointer; display: flex; align-items: center;">${toggleIcon}</span>` : toggleIcon}
                                        ${hasChildren ? '<i class="fas fa-folder text-gray-400 text-xs"></i>' : '<i class="fas fa-file text-gray-300 text-xs"></i>'}
                                        <span class="text-sm text-gray-700 ml-1 category-name flex-1" style="cursor: pointer;" onclick="selectProductCategory('${c.id}');">${categoryName}</span>
                                    </div>
                                    ${childrenHTML}
                                </div>`;
                            })
                            .join('');
                        
                        return treeItems;
                    };
                    
                    treeContainer.innerHTML = buildFilteredTree(mockData.categories, null, 0);
                };
                
                // Render attributes for the current category if one is selected
                if (product.categoryId && typeof renderCategoryAttributes === 'function') {
                    renderCategoryAttributes(product.categoryId);
                }
            } else {
                // For draft products with select dropdown
                const categorySelect = document.getElementById('edit-product-category');
                if (categorySelect) {
                    categorySelect.addEventListener('change', (e) => {
                        const selectedCategoryId = e.target.value;
                        if (typeof renderCategoryAttributes === 'function') {
                            renderCategoryAttributes(selectedCategoryId);
                        }
                    });
                    
                    // Render attributes for the current category if one is selected
                    if (product.categoryId && typeof renderCategoryAttributes === 'function') {
                        renderCategoryAttributes(product.categoryId);
                    }
                }
            }
        } else if (isSupplier) {
            // Editable version for suppliers on published products
            // This includes products with toBeRevised requests - fields are pre-populated and editable
            const supplierUser = window.currentUser || {};
            const supplierId = supplierUser.supplierId;
            
            const categoryName = t(category.name);
            const brandName = brand.name;
            
            // Pre-populate with request data if toBeRevised request exists
            const productNameValue = requestData.name !== undefined ? requestData.name : (typeof product.name === 'string' ? product.name : (product.name?.tr || ''));
            const productBrandValue = requestData.brand !== undefined ? requestData.brand : (product.brand || '');
            const productModelValue = requestData.model !== undefined ? requestData.model : (product.model || '');
            const productDescriptionValue = requestData.description !== undefined ? requestData.description : (product.description || '');
            const productKeywordsValue = requestData.keywords !== undefined ? requestData.keywords : (product.keywords || '');
            const productBrandIdValue = requestData.brandId !== undefined ? requestData.brandId : product.brandId;
            
            // Show notice if there's a toBeRevised request
            const toBeRevisedNotice = toBeRevisedRequest ? `
                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <div class="flex items-center space-x-2">
                        <i class="fas fa-exclamation-triangle text-yellow-600"></i>
                        <p class="text-sm font-medium text-yellow-800">Bu ürün için revize edilecek bir talep bulunmaktadır. Değişiklikleriniz mevcut talebe kaydedilecektir.</p>
                    </div>
                </div>
            ` : '';
            
            const editableAttributes = (() => {
                const defs = (mockData.attributes || []).slice().sort((a, b) => (a.id || 0) - (b.id || 0));
                // Use request data attributes if available, otherwise use product attributes
                const productAttributes = requestData.attributes || product.attributes || {};
                if (defs.length === 0) return '<p class="text-gray-600">Bu ürün için özellik değeri girilmemiş.</p>';
                return defs.map(attribute => {
                    const attrData = productAttributes[attribute.id] || productAttributes[String(attribute.id)] || {};
                    // Get value from request data if it exists, otherwise from product
                    const value = typeof attrData.value !== 'undefined' && attrData.value !== null ? String(attrData.value) : '';
                    
                    // Check if this attribute was rejected
                    const isRejected = attrData.validationStatus === 'rejected';
                    const rejectionReason = attrData.rejectionReason || '';
                    const borderClass = isRejected ? 'border-red-300 bg-red-50' : 'border-gray-300';
                    const inputClass = isRejected ? 'border-red-300 bg-red-50' : 'border-gray-300';
                    
                    // Generate input field based on attribute type
                    let inputField = '';
                    if (attribute.type === 'Select' && attribute.options && attribute.options.length > 0) {
                        // Render as select dropdown with options
                        const optionsHtml = attribute.options.map(opt => {
                            const isSelected = value === String(opt);
                            return `<option value="${opt.replace(/"/g, '&quot;')}" ${isSelected ? 'selected' : ''}>${opt}</option>`;
                        }).join('');
                        inputField = `<select class="w-full px-2 py-1 border rounded text-sm supplier-attr-input ${inputClass}" data-attr-id="${attribute.id}">
                            <option value="">Seçiniz...</option>
                            ${optionsHtml}
                        </select>`;
                    } else if (attribute.type === 'Number') {
                        // Render as number input
                        inputField = `<input type="number" value="${value.replace(/"/g, '&quot;')}" class="w-full px-2 py-1 border rounded text-sm supplier-attr-input ${inputClass}" data-attr-id="${attribute.id}" placeholder="${t(attribute.label)}">`;
                    } else {
                        // Render as text input (default)
                        inputField = `<input type="text" value="${value.replace(/"/g, '&quot;')}" class="w-full px-2 py-1 border rounded text-sm supplier-attr-input ${inputClass}" data-attr-id="${attribute.id}" placeholder="${t(attribute.label)}">`;
                    }
                    
                    return `
                        <div class="grid grid-cols-3 gap-4 p-3 border rounded-md ${borderClass}">
                            <div>
                                <label class="font-medium flex items-center">
                                    ${t(attribute.label)}
                                    ${isRejected ? '<i class="fas fa-exclamation-triangle text-red-500 ml-2" title="Bu alan reddedildi"></i>' : ''}
                                </label>
                                ${isRejected && rejectionReason ? `<div class="text-xs text-red-600 mt-1">${rejectionReason}</div>` : ''}
                            </div>
                            <div>
                                ${inputField}
                            </div>
                            <div class="text-right">
                                ${isRejected ? 
                                    '<span class="text-xs text-red-600 font-medium">Reddedildi</span>' : 
                                    '<span class="text-xs text-gray-500">Düzenlenebilir</span>'
                                }
                            </div>
                        </div>`;
                }).join('');
            })();
            container.innerHTML = `
                ${toBeRevisedNotice}
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="space-y-6">
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <div class="flex justify-between items-start mb-4">
                                <h3 class="text-lg font-semibold">Temel Bilgiler</h3>
                            </div>
                            <div class="space-y-3">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Ürün Adı <span class="text-red-500">*</span></label>
                                    <input type="text" id="supplierProductName" value="${productNameValue.replace(/"/g, '&quot;')}" class="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" placeholder="Ürün adını girin">
                                </div>
                                <div class="flex justify-between pt-2 border-t">
                                    <span class="text-gray-600">SKU:</span>
                                    <span class="font-medium">${product.sku}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Kategori:</span>
                                    <span class="font-medium cursor-pointer text-blue-600 hover:text-blue-800 hover:underline" onclick="showCategoryDetail(${product.categoryId})">${categoryName}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Marka:</span>
                                    <span class="font-medium">${brandName}</span>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">Marka</label>
                                        <select id="supplierProductBrand" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"><option value="">Marka Seçin</option>${mockData.brands.map(b => `<option value="${b.id}" ${productBrandIdValue === b.id ? 'selected' : ''}>${b.name}</option>`).join('')}</select>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">Model</label>
                                        <input type="text" id="supplierProductModel" value="${productModelValue.replace(/"/g, '&quot;')}" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="Model adını girin">
                                    </div>

                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">Ürün Kodu</label>
                                        <input type="text" id="supplierProductCode" value="${(product.productCode||'').replace(/"/g, '&quot;')}" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="Ürün kodunu girin">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">GTIN/Barkod</label>
                                        <input type="text" id="supplierGTIN" value="${(product.gtin||'').replace(/"/g, '&quot;')}" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="GTIN/Barkod girin">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">Menşei Ülke</label>
                                        <input type="text" id="supplierOriginCountry" value="${(product.originCountry||'').replace(/"/g, '&quot;')}" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="Menşei ülke">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">Üretici</label>
                                        <input type="text" id="supplierManufacturer" value="${(product.manufacturer||'').replace(/"/g, '&quot;')}" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="Üretici">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">Garanti Süresi (Ay)</label>
                                        <input type="number" id="supplierWarranty" value="${typeof product.warrantyMonths==='number'?product.warrantyMonths:''}" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="0" min="0">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">Minimum Sipariş Miktarı</label>
                                        <input type="number" id="supplierMinOrder" value="${typeof product.minOrderQuantity==='number'?product.minOrderQuantity:''}" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="1" min="1">
                                    </div>
                                    <div class="md:col-span-2">
                                        <label for="supplierProductDescription" class="block text-sm font-medium text-gray-700">Ürün Açıklaması</label>
                                        <textarea id="supplierProductDescription" rows="5" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="Ürün açıklaması">${(productDescriptionValue||'').replace(/</g,'&lt;')}</textarea>
                                    </div>
                                    <div class="md:col-span-2">
                                        <label for="supplierProductKeywords" class="block text-sm font-medium text-gray-700">Anahtar Kelimeler</label>
                                        <input type="text" id="supplierProductKeywords" value="${productKeywordsValue.replace(/"/g, '&quot;')}" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="virgülle ayırın">
                                    </div>
                                </div>
                            </div>
                        </div>
                        <!-- Attributes Section (editable) -->
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <h3 class="text-lg font-semibold mb-4 flex items-center">
                                <i class="fas fa-tags text-green-600 mr-2"></i>
                                Ürün Özellikleri
                            </h3>
                            <div class="space-y-3">
                                ${editableAttributes}
                            </div>
                        </div>
                        <div class="flex justify-end">
                            <button id="supplier-save-product" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                <i class="fas fa-save mr-2"></i>Kaydet
                            </button>
                        </div>
                    </div>
                </div>
            `;
            // Wire up save
            const btn = document.getElementById('supplier-save-product');
            if (btn) {
                btn.addEventListener('click', () => saveSupplierProductInfo());
            }
        } else {
            // Read-only version for other products
            container.innerHTML = `
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="space-y-6">
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <div class="flex justify-between items-start mb-4">
                                <h3 class="text-lg font-semibold">Temel Bilgiler</h3>
                            </div>
                            <div class="space-y-3">
                                <div class="flex justify-between">
                                    <span class="text-gray-600">SKU:</span>
                                    <span class="font-medium">${product.sku}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Kategori:</span>
                                    <span class="font-medium cursor-pointer text-blue-600 hover:text-blue-800 hover:underline" onclick="showCategoryDetail(${product.categoryId})">${t(category.name)}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Marka:</span>
                                    <span class="font-medium">${brand.name}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Durum:</span>
                                    <span class="font-medium">${product.status}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Ana Ürün ID:</span>
                                    <a href="#main-product/${product.mainProductId || product.id}" class="font-medium text-blue-600 hover:underline">${product.mainProductId || product.id}</a>
                                </div>
                                
                            </div>
                        </div>
                        
                        ${product.status === 'rejected' && isSupplier ? `
                        <!-- Rejection Information Section -->
                        <div class="bg-red-50 border border-red-200 p-4 rounded-lg">
                            <h3 class="text-lg font-semibold mb-4 flex items-center text-red-800">
                                <i class="fas fa-exclamation-triangle text-red-600 mr-2"></i>
                                Red Bilgileri
                            </h3>
                            <div class="space-y-3">
                                ${product.rejectionReasons && product.rejectionReasons.length > 0 ? `
                                <div>
                                    <h4 class="font-medium text-red-700 mb-2">Red Sebepleri:</h4>
                                    <ul class="list-disc list-inside space-y-1">
                                        ${product.rejectionReasons.map(reason => `
                                            <li class="text-sm text-red-600">${reason}</li>
                                        `).join('')}
                                    </ul>
                                </div>
                                ` : ''}
                                <div class="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span class="font-semibold text-red-700">Red Tarihi:</span>
                                        <span class="ml-2 text-red-600">${product.rejectedAt ? new Date(product.rejectedAt).toLocaleDateString('tr-TR') : 'Bilinmiyor'}</span>
                                    </div>
                                    <div>
                                        <span class="font-semibold text-red-700">Red Eden:</span>
                                        <span class="ml-2 text-red-600">${product.rejectedBy || 'Bilinmiyor'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        ` : ''}
                        
                        <!-- Attributes Section -->
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <h3 class="text-lg font-semibold mb-4 flex items-center">
                                <i class="fas fa-tags text-green-600 mr-2"></i>
                                Ürün Özellikleri
                            </h3>
                            <div class="space-y-3">
                                ${(() => {
                                    // Generate attributes content (show all defined attributes, fallback to '-')
                                    const allAttributeDefs = (mockData.attributes || []).slice().sort((a, b) => (a.id || 0) - (b.id || 0));
                                    
                                    if (allAttributeDefs.length === 0) {
                                        return '<p class="text-gray-600">Bu ürün için özellik değeri girilmemiş.</p>';
                                    } else {
                                        const productAttributes = product.attributes || {};
                                        return allAttributeDefs.map(attribute => {
                                            const attrData = productAttributes[attribute.id] || productAttributes[String(attribute.id)];
                                            const value = attrData && typeof attrData.value !== 'undefined' && attrData.value !== null && String(attrData.value).trim() !== '' ? attrData.value : '-';
                                            
                                            // Check if this attribute was rejected (for suppliers viewing rejected products)
                                            const isRejected = attrData && attrData.validationStatus === 'rejected';
                                            const rejectionReason = attrData && attrData.rejectionReason || '';
                                            const borderClass = isRejected ? 'border-red-200 bg-red-50' : 'border-gray-200';
                                            const textClass = isRejected ? 'text-red-600' : 'text-gray-600';
                                            const valueClass = isRejected ? 'text-red-800 font-semibold' : 'font-medium';
                                            
                                            return `
                                                <div class="flex justify-between items-center py-2 border-b ${borderClass} last:border-b-0">
                                                    <div class="flex items-center">
                                                        <span class="${textClass} font-medium flex items-center">
                                                            ${t(attribute.label)}:
                                                            ${isRejected ? '<i class="fas fa-exclamation-triangle text-red-500 ml-2" title="Bu alan reddedildi"></i>' : ''}
                                                        </span>
                                                        ${isRejected && rejectionReason ? `<div class="text-xs text-red-600 ml-2">(${rejectionReason})</div>` : ''}
                                                    </div>
                                                    <span class="${valueClass}">${value}</span>
                                                </div>
                                            `;
                                        }).join('');
                                    }
                                })()}
                            </div>
                        </div>
                    </div>
                    
                    <div class="space-y-6">
                        ${(() => {
                            if (!isSupplier) return '';
                            const user = window.currentUser || {};
                            const supplierId = user.supplierId;
                            const supplierProduct = mockData.supplierProducts.find(sp => sp.productId === product.id && sp.supplierId === supplierId);
                            const isArchived = product.isArchived || (supplierProduct?.isArchived);
                            if (!isArchived) return '';
                            return `
                                <div class="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                    <h3 class="text-lg font-semibold mb-3 text-yellow-900">Ürün Durumu</h3>
                                    <div class="space-y-3">
                                        <div class="flex items-center">
                                            <i class="fas fa-archive text-yellow-600 mr-2"></i>
                                            <span class="text-yellow-800">Bu ürün arşivlenmiş durumda</span>
                                        </div>
                                    </div>
                                </div>
                            `;
                        })()}
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error in renderGeneralTab:', error);
        container.innerHTML = `
            <div class="p-6 text-center">
                <div class="text-red-600 mb-4">
                    <i class="fas fa-exclamation-triangle text-4xl"></i>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Hata Oluştu</h3>
                <p class="text-gray-600">Genel Bilgiler sekmesi yüklenirken bir hata oluştu.</p>
                <p class="text-sm text-gray-500 mt-2">Hata: ${error.message}</p>
            </div>
        `;
    }
}
// Save handler for supplier product edits

function archiveSupplierProduct(productId) {
    const currentUser = window.currentUser || {};
    const currentSupplierId = currentUser.supplierId;
    
    if (!currentSupplierId) {
        showToast('Tedarikçi bilgisi bulunamadı', 'error');
        return;
    }
    
    let supplierProduct = mockData.supplierProducts.find(sp => 
        sp.productId === productId && sp.supplierId === currentSupplierId
    );
    
    if (!supplierProduct) {
        // Create supplier product entry if it doesn't exist
        supplierProduct = {
            productId: productId,
            supplierId: currentSupplierId,
            stock: 0,
            price: 0,
            isArchived: false,
            isBanned: false
        };
        mockData.supplierProducts.push(supplierProduct);
    }
    
    if (confirm('Bu ürünü arşivlemek istediğinizden emin misiniz?')) {
        supplierProduct.isArchived = true;
        showToast('Ürün başarıyla arşivlendi', 'success');
        handleRouteChange();
    }
}

function unarchiveSupplierProduct(productId) {
    const currentUser = window.currentUser || {};
    const currentSupplierId = currentUser.supplierId;
    
    if (!currentSupplierId) {
        showToast('Tedarikçi bilgisi bulunamadı', 'error');
        return;
    }
    
    const supplierProduct = mockData.supplierProducts.find(sp => 
        sp.productId === productId && sp.supplierId === currentSupplierId
    );
    
    if (!supplierProduct) {
        showToast('Ürün bulunamadı', 'error');
        return;
    }
    
    if (confirm('Bu ürünü aktif duruma taşımak istediğinizden emin misiniz?')) {
        supplierProduct.isArchived = false;
        showToast('Ürün başarıyla aktif duruma alındı', 'success');
        handleRouteChange();
    }
}
// Function to submit stock & price update request
function submitStockPriceUpdateRequest(productId) {
    const product = mockData.products.find(p => p.id === productId);
    if (!product) {
        showToast('Ürün bulunamadı.', 'error');
        return;
    }
    
    const user = window.currentUser || {};
    const isSupplier = user.role === 'supplier';
    
    if (!isSupplier) {
        showToast('Bu işlem sadece tedarikçiler tarafından yapılabilir.', 'error');
        return;
    }
    
    const supplierId = user.supplierId;
    if (!supplierId) {
        showToast('Tedarikçi bilgisi bulunamadı.', 'error');
        return;
    }
    
    // Get current values
    const currentPrice = getProductPrice(productId, supplierId);
    const currentStock = getProductStock(productId, supplierId);
    
    // Create the request
    const request = {
        id: Date.now(),
        supplierId: supplierId,
        supplierName: mockData.suppliers.find(s => s.id === supplierId)?.name || 'Bilinmeyen Tedarikçi',
        productId: productId,
        currentPrice: currentPrice,
        requestedPrice: currentPrice, // Will be updated by user
        currentStock: currentStock,
        requestedStock: currentStock, // Will be updated by user
        status: 'pending',
        requestDate: new Date().toISOString(),
        requestType: 'stock_price_update'
    };
    
    // Initialize supplierSubmission if it doesn't exist
    if (!product.supplierSubmission) {
        product.supplierSubmission = {
            supplierId: supplierId,
            status: 'pending',
            submissionDate: new Date().toISOString()
        };
    }
    
    // Initialize priceRequests array if it doesn't exist
    if (!product.supplierSubmission.priceRequests) {
        product.supplierSubmission.priceRequests = [];
    }
    
    // Add the request
    product.supplierSubmission.priceRequests.push(request);
    
    showToast('Stok ve fiyat güncelleme talebi başarıyla gönderildi.', 'success');
    
    // Refresh the current view
    if (window.location.hash.includes('products/detail/')) {
        renderProductTab('stock-price', product);
    }
}
// Function to submit stock & price update request with user input values
function submitStockPriceUpdateRequestWithValues(productId) {
    const product = mockData.products.find(p => p.id === productId);
    if (!product) {
        showToast('Ürün bulunamadı.', 'error');
        return;
    }
    
    const user = window.currentUser || {};
    const isSupplier = user.role === 'supplier';
    
    if (!isSupplier) {
        showToast('Bu işlem sadece tedarikçiler tarafından yapılabilir.', 'error');
        return;
    }
    
    const supplierId = user.supplierId;
    if (!supplierId) {
        showToast('Tedarikçi bilgisi bulunamadı.', 'error');
        return;
    }
    
    // Get input values
    const newStockInput = document.getElementById(`new-stock-${productId}`);
    const newPriceInput = document.getElementById(`new-price-${productId}`);
    
    if (!newStockInput || !newPriceInput) {
        showToast('Form alanları bulunamadı.', 'error');
        return;
    }
    
    const newStock = parseInt(newStockInput.value) || 0;
    const newPrice = parseFloat(newPriceInput.value) || 0;
    
    // Get current values
    const currentPrice = getProductPrice(productId, supplierId);
    const currentStock = getProductStock(productId, supplierId);
    
    // Check if there are any changes
    if (newStock === currentStock && newPrice === currentPrice) {
        showToast('Değişiklik yapılmadı. Lütfen yeni değerler girin.', 'warning');
        return;
    }
    
    // Create the request using new request system
    const requestData = {
        currentPrice: currentPrice,
        requestedPrice: newPrice,
        currentStock: currentStock,
        requestedStock: newStock
    };
    
    const newRequest = createRequest('stock_price_update', productId, supplierId, requestData);
    
    showToast('Stok ve fiyat güncelleme talebi başarıyla gönderildi.', 'success');
    
    // Refresh the current view
    if (window.location.hash.includes('products/detail/')) {
        renderProductTab('stock-price', product);
    }
}
function renderStockPriceTab(container, product, isSupplier) {
    
    // Helper function to generate commission rates section
    const getCommissionRatesSection = (product, isSupplier, supplierId) => {
        const user = window.currentUser || {};
        let productSuppliers = [];
        
        if (isSupplier && supplierId) {
            // Supplier view: show only their own rate
            const supplier = mockData.suppliers.find(s => s.id === supplierId);
            if (supplier) {
                const commissionRate = getSupplierCommissionRate(product.id, supplierId);
                productSuppliers = [{ supplier, commissionRate }];
            }
        } else if (!isSupplier) {
            // Admin view: show all suppliers that have this product
            productSuppliers = mockData.supplierProducts
                .filter(sp => sp.productId === product.id)
                .map(sp => {
                    const supplier = mockData.suppliers.find(s => s.id === sp.supplierId);
                    if (!supplier) return null;
                    const commissionRate = getSupplierCommissionRate(product.id, supplier.id);
                    return { supplier, commissionRate };
                })
                .filter(Boolean);
        }
        
        if (productSuppliers.length === 0) {
            return '';
        }
        
        return `
            <div class="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-4">
                <h3 class="text-lg font-semibold mb-4 flex items-center">
                    <i class="fas fa-percentage text-blue-600 mr-2"></i>
                    Komisyon Oranları
                </h3>
                <div class="space-y-3">
                    ${productSuppliers.map(({ supplier, commissionRate }) => `
                        <div class="bg-white p-3 rounded-md border border-blue-100">
                            <div class="flex justify-between items-center">
                                <div>
                                    <div class="font-medium text-gray-900">${supplier.name}</div>
                                </div>
                                <div class="text-right">
                                    <div class="text-2xl font-bold text-blue-600">${commissionRate.toFixed(1)}%</div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    };
    
    try {
        const price = product.isNew ? 0 : getProductPrice(product.id);
        const stock = product.isNew ? 0 : getProductStock(product.id);
        
    
        // Check if this is a draft product or new product that can be edited
        const isDraftEditable = isSupplier && ((product.status === 'draft' && !product.supplierSubmission) || product.isNew);
        
        if (isDraftEditable) {
            // Editable version for draft products
            container.innerHTML = `
                <div class="max-w-2xl">
                    <div class="bg-blue-50 p-6 rounded-lg">
                        <h3 class="text-lg font-semibold mb-4">Stok ve Fiyat Bilgileri</h3>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Stok Miktarı</label>
                                <input type="number" id="edit-product-stock" value="${stock || 0}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Fiyat (TRY)</label>
                                    <input type="number" step="0.01" id="edit-product-list-price-try" value="${product.listPrice || 0}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="0.00">
                            </div>
                            
                        </div>
                    </div>
                    ${getCommissionRatesSection(product, isSupplier, window.currentUser?.supplierId || window.currentUser?.id)}
                </div>
            `;
        } else if (isSupplier) {
            // Read-only version for suppliers (other products)
            const user = window.currentUser || {};
            const supplierId = user.supplierId;
            const currentPrice = getProductPrice(product.id, supplierId);
            const currentStock = getProductStock(product.id, supplierId);
            
            container.innerHTML = `
                <div class="max-w-2xl">
                    <div class="bg-blue-50 p-6 rounded-lg">
                        <h3 class="text-lg font-semibold mb-4">Stok ve Fiyat Bilgileri</h3>
                        <div class="space-y-4">
                            <div class="bg-white p-4 rounded-lg border border-blue-200">
                                <h4 class="font-medium text-gray-900 mb-3">Mevcut Değerler</h4>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Mevcut Stok</label>
                                        <input type="number" value="${currentStock || 0}" class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100" readonly>
                            </div>
                                <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Mevcut Fiyat (TRY)</label>
                                        <input type="number" step="0.01" value="${currentPrice || 0}" class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100" readonly>
                                </div>
                                </div>
                            </div>
                            
                            <div class="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                <h4 class="font-medium text-gray-900 mb-3">Yeni Değerler</h4>
                                <div class="space-y-4">
                                <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Yeni Stok Miktarı</label>
                                        <input type="number" id="new-stock-${product.id}" value="${currentStock || 0}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" min="0">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Yeni Fiyat (TRY)</label>
                                        <input type="number" step="0.01" id="new-price-${product.id}" value="${currentPrice || 0}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" min="0">
                                        <p class="text-xs text-gray-500 mt-1">Fiyat değişikliği onay gerektirir</p>
                                    </div>
                                </div>
                            </div>
                            
                            <button onclick="submitStockPriceUpdateRequestWithValues(${product.id})" class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Stok/Fiyat Güncelleme Talebi Gönder</button>
                        </div>
                    </div>
                    ${getCommissionRatesSection(product, isSupplier, supplierId)}
                </div>
            `;
        } else {
            // Admin view - show all suppliers' data
            container.innerHTML = `
                <div class="max-w-4xl">
                    <div class="bg-blue-50 p-6 rounded-lg">
                        <h3 class="text-lg font-semibold mb-4">Tedarikçi Stok ve Fiyat Bilgileri</h3>
                        <div class="space-y-4">
                            ${(() => {
                                // Get all suppliers that have data for this product
                                const supplierData = mockData.supplierProducts.filter(sp => sp.productId === product.id);
                                
                                if (supplierData.length === 0) {
                                    return '<p class="text-gray-500 text-sm">Bu ürün için henüz tedarikçi bilgisi bulunmuyor.</p>';
                                }
                                
                                return supplierData.map(sp => {
                                    const supplier = mockData.suppliers.find(s => s.id === sp.supplierId);
                                    const supplierName = supplier ? supplier.name : 'Bilinmeyen Tedarikçi';
                                    
                                    return `
                                        <div class="bg-white p-4 rounded-lg border border-blue-200">
                                            <div class="flex items-center justify-between mb-3">
                                                <div class="flex items-center">
                                                    <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-800 text-sm flex items-center justify-center mr-3">
                                                        ${supplierName.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <span class="font-medium text-gray-900">${supplierName}</span>
                                                        <p class="text-sm text-gray-500">Tedarikçi ID: ${sp.supplierId}</p>
                                                    </div>
                                                </div>

                                            </div>
                                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div class="bg-gray-50 p-3 rounded-lg">
                                                    <div class="flex items-center justify-between">
                                                        <span class="text-sm text-gray-600">Stok Miktarı</span>
                                                        <span class="text-lg font-semibold ${sp.stock > 0 ? 'text-green-600' : 'text-red-600'}">${sp.stock || 0} adet</span>
                                                    </div>
                                                    ${sp.stock > 0 ? '<p class="text-xs text-green-600 mt-1"></p>' : '<p class="text-xs text-red-600 mt-1">Stokta yok</p>'}
                                                </div>
                                                <div class="bg-gray-50 p-3 rounded-lg">
                                                    <div class="flex items-center justify-between">
                                                        <span class="text-sm text-gray-600">Son Güncelleme</span>
                                                        <span class="text-sm font-medium text-gray-700">${new Date(sp.lastUpdated || Date.now()).toLocaleDateString('tr-TR')}</span>
                                                    </div>

                                                </div>
                                            </div>
                                            <div class="mt-4">
                                                <div class="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                                    <div class="flex items-center justify-between mb-2">
                                                        <span class="text-sm font-medium text-blue-800">Fiyat (TRY)</span>
                                                        <span class="text-lg font-semibold text-blue-600">${sp.listPrice ? sp.listPrice.toFixed(2) + ' ₺' : 'Belirtilmemiş'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                        </div>
                                    `;
                                }).join('');
                            })()}
                        </div>
                        <div class="mt-6 pt-4 border-t border-blue-200">
                            <button onclick="submitStockPriceUpdateRequest(${product.id})" class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Stok/Fiyat Güncelle</button>
                        </div>
                    </div>
                    ${getCommissionRatesSection(product, false, null)}
                </div>
            `;
        }
    } catch (error) {
        console.error('Error in renderStockPriceTab:', error);
        container.innerHTML = `
            <div class="p-6 text-center">
                <div class="text-red-600 mb-4">
                    <i class="fas fa-exclamation-triangle text-4xl"></i>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Hata Oluştu</h3>
                <p class="text-gray-600">Stok & Fiyat sekmesi yüklenirken bir hata oluştu.</p>
                <p class="text-sm text-gray-500 mt-2">Hata: ${error.message}</p>
            </div>
        `;
    }
}
function renderAttributesTab(container, product, isSupplier) {
    const attributeRows = Object.entries(product.attributes || {}).map(([attrId, attrData]) => {
        const attribute = mockData.attributes.find(a => a.id == attrId);
        if (!attribute) return '';
        
        const statusBadge = attrData.validationStatus === 'approved' ? 
            '<span class="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Onaylandı</span>' :
            attrData.validationStatus === 'rejected' ?
            '<span class="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Reddedildi</span>' :
            '<span class="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Bekliyor</span>';
            
        return `
            <tr class="border-b hover:bg-gray-50">
                <td class="p-3 font-medium">${t(attribute.label)}</td>
                <td class="p-3">${attrData.value}</td>
                <td class="p-3">${statusBadge}</td>
                ${!isSupplier ? `<td class="p-3 text-right">
                    <button class="text-blue-600 hover:text-blue-800 mr-2">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>` : ''}
            </tr>
        `;
    }).join('');
    
    container.innerHTML = `
        <div class="overflow-x-auto">
            <table class="w-full text-left">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="p-3 text-sm font-semibold">Özellik</th>
                        <th class="p-3 text-sm font-semibold">Değer</th>
                        <th class="p-3 text-sm font-semibold">Durum</th>
                        ${!isSupplier ? '<th class="p-3 text-sm font-semibold text-right">İşlemler</th>' : ''}
                    </tr>
                </thead>
                <tbody>
                    ${attributeRows || `<tr><td colspan="${isSupplier ? '3' : '4'}" class="p-6 text-center text-gray-500">Henüz özellik tanımlanmamış</td></tr>`}
                </tbody>
            </table>
        </div>
    `;
}
function renderImagesTab(container, product, isSupplier) {
    const images = product.images || [];
    
    const imageCards = images.map(image => {
        const imageUrl = image.url || image;
        const imageAlt = image.alt || image.title || t(product.name);
        
        return `
            <div class="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <!-- Image Preview -->
                <div class="relative group">
                    <img src="${imageUrl}" class="w-full h-48 object-cover">
                    <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                        <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button onclick="viewImageFullscreen('${imageUrl}')" class="px-3 py-2 bg-white text-gray-800 rounded-md hover:bg-gray-100">
                                <i class="fas fa-search-plus mr-2"></i>Büyüt
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Action Button -->
                <div class="p-4">
                    <button onclick="deleteImage(${image.id || image})" class="w-full px-3 py-2 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200">
                        <i class="fas fa-trash mr-2"></i>Görseli Sil
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    // Create add image card
    const addImageCard = `
        <div class="bg-white border-2 border-dashed border-gray-300 rounded-lg overflow-hidden hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer">
            <div class="h-48 flex flex-col items-center justify-center p-4" onclick="uploadNewImage()">
                <i class="fas fa-plus-circle text-4xl text-gray-400 mb-3"></i>
                <p class="text-sm font-medium text-gray-600">Görsel Ekle</p>
            </div>
        </div>
    `;
    
    container.innerHTML = `
        <div class="space-y-6">
            <!-- Action Bar -->
            <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold">Ürün Görselleri (${images.length})</h3>
            </div>
            
            <!-- Image Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${imageCards}
                ${addImageCard}
            </div>
        </div>
    `;
}
function renderVariantsTab(container, product) {
    const category = mockData.categories.find(c => c.id === product.categoryId) || { name: { tr: 'Kategorisiz', en: 'Uncategorized' } };
    const variantAttributeIds = category.variantAttributes || []; 
    const variantAttributeLabels = variantAttributeIds.map(id => mockData.attributes.find(a => a.id === id)); 
    
    // Find other variants of the main product
    const mainProductId = product.mainProductId || product.id;
    const relatedVariants = mockData.products.filter(p => 
        p.mainProductId === mainProductId && p.id !== product.id
    );
    
    let variantContent = ''; 
    
    // Show related variants section
    if (relatedVariants.length > 0) {
        const variantRows = relatedVariants.map(variant => { 
            const price = getProductPrice(variant.id); 
            const priceText = price ? `${price.toFixed(2)} ₺` : '-'; 
            const stock = getProductStock(variant.id); 
            const statusClass = variant.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
            
            // Get variant attributes for display
            const variantAttrs = variantAttributeIds.map(id => {
                const attrValue = variant.attributes && variant.attributes[id] ? variant.attributes[id].value : '-';
                return `<td class="p-3 text-sm">${attrValue}</td>`;
            }).join('');
            
            return `<tr class="border-b hover:bg-gray-50">
                <td class="p-3">
                    <a href="#products/detail/${variant.id}" class="flex items-center space-x-3 hover:text-blue-600">
                        <img src="${variant.imageUrl}" alt="${t(variant.name)}" class="w-10 h-10 rounded-md object-cover">
                        <div>
                            <div class="font-medium text-sm">${t(variant.name)}</div>
                            <div class="text-xs text-gray-500">${variant.sku}</div>
                        </div>
                    </a>
                </td>
                ${variantAttrs}
                <td class="p-3 text-sm font-medium">${priceText}</td>
                <td class="p-3 text-sm">${stock > 0 ? stock : `<span class="text-red-500 font-semibold">Tükendi</span>`}</td>
                <td class="p-3"><span class="px-2 py-1 text-xs font-semibold rounded-full ${statusClass}">${variant.status === 'active' ? 'Aktif' : 'Pasif'}</span></td>
                <td class="p-3 text-right">
                    <a href="#products/detail/${variant.id}" class="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-md hover:bg-blue-200">
                        Görüntüle <i class="fas fa-chevron-right ml-1"></i>
                    </a>
                </td>
            </tr>`;
        }).join('');
        
        variantContent = `
            <div class="mb-6">
                <h4 class="font-semibold mb-4">İlgili Varyantlar</h4>
                <div class="overflow-x-auto">
                    <table class="w-full text-left">
                        <thead class="table-header">
                            <tr>
                                <th class="p-3 w-10"><input type="checkbox"></th>
                                ${variantAttributeLabels.map(attr => `<th class="p-3 text-sm font-semibold">${attr ? t(attr.label) : ''}</th>`).join('')}
                                <th class="p-3 text-sm font-semibold">${t('sku_header')}</th>
                                <th class="p-3 text-sm font-semibold">Fiyat</th>
                                <th class="p-3 text-sm font-semibold">Stok</th>
                                <th class="p-3 text-sm font-semibold">Durum</th>
                                <th class="p-3 text-sm font-semibold text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>${variantRows}</tbody>
                    </table>
                </div>
            </div>
        `;
    } else if (relatedVariants.length === 0) { 
        const variantAttrs = variantAttributeLabels.map(attr => attr ? t(attr.label) : '').filter(Boolean).join(', '); 
        let variantInfo = '<p class="text-gray-600">Bu kategori için varyant özellikleri tanımlanmamış.</p>'; 
        if (variantAttrs) { 
            variantInfo = `<p class="text-gray-600">Bu kategorideki varyantlar şu özelliklere göre oluşturulur: <span class="font-semibold">${variantAttrs}</span></p>`; 
        } 
        variantContent = `${variantInfo}<p class="mt-4 text-gray-600">Bu ürün için henüz varyant oluşturulmadı.</p>`; 
    } 
    
    container.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <h4 class="font-semibold">Varyantlar</h4>
            <button onclick="showAddVariantModal(${product.id})" class="px-4 py-2 border rounded-md text-sm hover:bg-gray-100">
                <i class="fas fa-box mr-2"></i>Varyant Ekle
            </button>
        </div>
        ${variantContent}
    `;
}
function renderAssetsTab(container, product) {
    // Simply use the same rendering as images tab
    renderImagesTab(container, product, false);
}
function showImagesInAssetsTab() {
    // Get the current product from the URL or context
    const currentHash = window.location.hash;
    const productIdMatch = currentHash.match(/detail\/(\d+)/);
    if (!productIdMatch) return;
    
    const productId = parseInt(productIdMatch[1]);
    const product = mockData.products.find(p => p.id === productId);
    if (!product) return;
    
    // Get the container and render images directly
    const container = document.getElementById('product-tab-content');
    if (!container) return;
    
    // Call the renderImagesTab function directly
    renderImagesTab(container, product, false);
}
function renderLogsTab(container, product) {
    try {
    // Store product ID for pagination
    window.currentProductId = product.id;
    
    const allChangeLogs = product.changeLogs || [];
    
    if (allChangeLogs.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-history text-4xl text-gray-400 mb-4"></i>
                <h3 class="text-lg font-semibold text-gray-600 mb-2">Değişiklik Logları</h3>
                <p class="text-gray-500">Bu ürün için henüz değişiklik kaydı bulunmuyor.</p>
            </div>
        `;
        return;
    }
    
    // Get unique actions for filter dropdown
    const uniqueActions = [...new Set(allChangeLogs.map(log => log.action))];
    const actionLabels = {
        'product_updated': 'Ürün Güncellendi',
        'image_uploaded': 'Görsel Yüklendi',
        'status_changed': 'Durum Değiştirildi',
        'stock_updated': 'Stok Güncellendi',
        'attribute_approved': 'Özellik Onaylandı',
        'attribute_rejected': 'Özellik Reddedildi',
        'price_updated': 'Fiyat Güncellendi',
        'category_changed': 'Kategori Değiştirildi',
        'description_updated': 'Açıklama Güncellendi'
    };
    
    // Filter logs based on current filters (will be set by filter controls)
    const filterLogs = (logs) => {
        const actionFilter = document.getElementById('logActionFilter')?.value || '';
        const roleFilter = document.getElementById('logRoleFilter')?.value || '';
        const startDateFilter = document.getElementById('logStartDate')?.value || '';
        const endDateFilter = document.getElementById('logEndDate')?.value || '';
        
        return logs.filter(log => {
            // Action filter
            if (actionFilter && log.action !== actionFilter) {
                return false;
            }
            
            // Role filter
            if (roleFilter && log.userRole !== roleFilter) {
                return false;
            }
            
            // Date filter
            const logDate = new Date(log.timestamp);
            if (startDateFilter) {
                const startDate = new Date(startDateFilter);
                startDate.setHours(0, 0, 0, 0);
                if (logDate < startDate) {
                    return false;
                }
            }
            if (endDateFilter) {
                const endDate = new Date(endDateFilter);
                endDate.setHours(23, 59, 59, 999);
                if (logDate > endDate) {
                    return false;
                }
            }
            
            return true;
        });
    };
    
    // Initialize pagination state for logs
    if (!window.logPaginationState) {
        window.logPaginationState = {
            currentPage: 1,
            itemsPerPage: 10,
            totalItems: 0,
            totalPages: 0,
            currentData: []
        };
    }
    
    // Initial render with all logs
    const changeLogs = filterLogs(allChangeLogs);
    
    // Sort all logs by timestamp in descending order (newest first)
    const sortedLogs = changeLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Paginate logs
    const paginatedLogs = paginateLogs(sortedLogs, window.logPaginationState.currentPage);
    
    const logEntries = paginatedLogs.map(log => {
            const actionIcons = {
                'product_updated': 'fas fa-edit',
                'image_uploaded': 'fas fa-image',
                'status_changed': 'fas fa-toggle-on',
                'stock_updated': 'fas fa-boxes',
                'attribute_approved': 'fas fa-check-circle',
                'attribute_rejected': 'fas fa-times-circle',
                'price_updated': 'fas fa-dollar-sign',
                'category_changed': 'fas fa-tags',
                'description_updated': 'fas fa-align-left'
            };
            
            const categoryColors = {
                'product_info': 'bg-blue-100 text-blue-800',
                'media': 'bg-purple-100 text-purple-800',
                'status': 'bg-green-100 text-green-800',
                'inventory': 'bg-orange-100 text-orange-800',
                'attributes': 'bg-yellow-100 text-yellow-800',
                'pricing': 'bg-red-100 text-red-800'
            };
            
            const categoryLabels = {
                'product_info': 'Ürün Bilgileri',
                'media': 'Medya',
                'status': 'Durum',
                'inventory': 'Envanter',
                'attributes': 'Özellikler',
                'pricing': 'Fiyatlandırma'
            };
            
            const userRoleColors = {
                'admin': 'bg-blue-100 text-blue-800',
                'supplier': 'bg-green-100 text-green-800'
            };
            
            const logDate = new Date(log.timestamp);
            const dateStr = logDate.toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            const timeStr = logDate.toLocaleTimeString('tr-TR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            const dateTimeStr = `${dateStr} ${timeStr}`;
            
            let detailsHtml = '';
            if (log.details) {
                if (log.details.changes) {
                    detailsHtml = `
                        <div class="mt-2 space-y-1">
                            ${log.details.changes.map(change => `
                                <div class="text-xs text-gray-600">
                                    <span class="font-medium">${change.field}:</span>
                                    <span class="text-red-600 line-through">${change.oldValue}</span>
                                    <span class="mx-1">→</span>
                                    <span class="text-green-600 font-medium">${change.newValue}</span>
                                </div>
                            `).join('')}
                        </div>
                    `;
                } else if (log.details.oldStatus && log.details.newStatus) {
                    detailsHtml = `
                        <div class="mt-2 text-xs text-gray-600">
                            <span class="text-red-600 line-through">${log.details.oldStatus}</span>
                            <span class="mx-1">→</span>
                            <span class="text-green-600 font-medium">${log.details.newStatus}</span>
                            ${log.details.reason ? `<div class="mt-1 text-gray-500">${log.details.reason}</div>` : ''}
                        </div>
                    `;
                } else if (log.details.oldStock !== undefined && log.details.newStock !== undefined) {
                    detailsHtml = `
                        <div class="mt-2 text-xs text-gray-600">
                            <span class="text-red-600 line-through">${log.details.oldStock} adet</span>
                            <span class="mx-1">→</span>
                            <span class="text-green-600 font-medium">${log.details.newStock} adet</span>
                            ${log.details.supplier ? `<div class="mt-1 text-gray-500">Tedarikçi: ${log.details.supplier}</div>` : ''}
                        </div>
                    `;
                } else if (log.details.oldPrice && log.details.newPrice) {
                    detailsHtml = `
                        <div class="mt-2 text-xs text-gray-600">
                            <span class="text-red-600 line-through">${log.details.oldPrice} ₺</span>
                            <span class="mx-1">→</span>
                            <span class="text-green-600 font-medium">${log.details.newPrice} ₺</span>
                            ${log.details.reason ? `<div class="mt-1 text-gray-500">${log.details.reason}</div>` : ''}
                        </div>
                    `;
                } else if (log.details.attribute) {
                    detailsHtml = `
                        <div class="mt-2 text-xs text-gray-600">
                            <span class="font-medium">Özellik:</span> ${log.details.attribute}
                            <div><span class="font-medium">Değer:</span> ${log.details.value}</div>
                            ${log.details.reason ? `<div class="text-red-600">Sebep: ${log.details.reason}</div>` : ''}
                        </div>
                    `;
                } else if (log.details.imageUrl) {
                    detailsHtml = `
                        <div class="mt-2 text-xs text-gray-600">
                            <div><span class="font-medium">Tip:</span> ${log.details.imageType}</div>
                            <div><span class="font-medium">Kalite:</span> ${log.details.quality}%</div>
                        </div>
                    `;
                }
            }
            
            return `
                <div class="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div class="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <i class="${actionIcons[log.action] || 'fas fa-circle'} text-sm text-gray-600"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-2">
                                <span class="font-medium text-gray-900">${log.actionLabel}</span>
                            </div>
                            <span class="text-xs text-gray-500">${dateTimeStr}</span>
                        </div>
                        ${detailsHtml}
                        <div class="flex items-center justify-between mt-2">
                            <div class="flex items-center space-x-2">
                                <span class="px-2 py-1 text-xs font-medium rounded-full ${userRoleColors[log.userRole] || 'bg-gray-100 text-gray-800'}">
                                    ${log.userRole === 'admin' ? 'Admin' : 'Tedarikçi'}
                                </span>
                                <span class="text-xs text-gray-500">${log.user}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
    }).join('');
    
    // Calculate statistics
    const totalChanges = changeLogs.length;
    const adminChanges = changeLogs.filter(log => log.userRole === 'admin').length;
    const supplierChanges = changeLogs.filter(log => log.userRole === 'supplier').length;
    const categoryStats = changeLogs.reduce((stats, log) => {
        stats[log.category] = (stats[log.category] || 0) + 1;
        return stats;
    }, {});
    
    container.innerHTML = `
        <div class="space-y-6">
            <!-- Statistics Overview -->
            <!-- <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div class="bg-white border rounded-lg p-4">
                    <div class="flex items-center">
                        <i class="fas fa-history text-2xl text-blue-600 mr-3"></i>
                        <div>
                            <div class="text-2xl font-bold text-gray-900">${totalChanges}</div>
                            <div class="text-sm text-gray-600">Toplam Değişiklik</div>
                        </div>
                    </div>
                </div>
                <div class="bg-white border rounded-lg p-4">
                    <div class="flex items-center">
                        <i class="fas fa-user-shield text-2xl text-blue-600 mr-3"></i>
                        <div>
                            <div class="text-2xl font-bold text-blue-600">${adminChanges}</div>
                            <div class="text-sm text-gray-600">Admin Değişikliği</div>
                        </div>
                    </div>
                </div>
                <div class="bg-white border rounded-lg p-4">
                    <div class="flex items-center">
                        <i class="fas fa-user text-2xl text-green-600 mr-3"></i>
                        <div>
                            <div class="text-2xl font-bold text-green-600">${supplierChanges}</div>
                            <div class="text-sm text-gray-600">Tedarikçi Değişikliği</div>
                        </div>
                    </div>
                </div>
                <div class="bg-white border rounded-lg p-4">
                    <div class="flex items-center">
                        <i class="fas fa-calendar text-2xl text-purple-600 mr-3"></i>
                        <div>
                            <div class="text-2xl font-bold text-purple-600">${new Set(changeLogs.map(log => new Date(log.timestamp).toLocaleDateString('tr-TR'))).size}</div>
                            <div class="text-sm text-gray-600">Gün</div>
                        </div>
                    </div>
                </div>
            </div> -->
            
            <!-- Category Breakdown -->
            <!-- <div class="bg-white border rounded-lg p-6">
                <h3 class="text-lg font-semibold mb-4">Değişiklik Kategorileri</h3>
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    ${Object.entries(categoryStats).map(([category, count]) => {
                        const categoryLabels = {
                            'product_info': 'Ürün Bilgileri',
                            'media': 'Medya',
                            'status': 'Durum',
                            'inventory': 'Envanter',
                            'attributes': 'Özellikler',
                            'pricing': 'Fiyatlandırma'
                        };
                        const categoryColors = {
                            'product_info': 'bg-blue-100 text-blue-800',
                            'media': 'bg-purple-100 text-purple-800',
                            'status': 'bg-green-100 text-green-800',
                            'inventory': 'bg-orange-100 text-orange-800',
                            'attributes': 'bg-yellow-100 text-yellow-800',
                            'pricing': 'bg-red-100 text-red-800'
                        };
                        return `
                            <div class="text-center">
                                <div class="text-2xl font-bold text-gray-900">${count}</div>
                                <div class="text-sm text-gray-600">${categoryLabels[category] || category}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div> -->
            <!-- Change Log Timeline -->
            <div class="bg-white border rounded-lg p-6">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-lg font-semibold">Değişiklik Geçmişi</h3>
                    <div class="flex items-center space-x-3">
                        <!-- Date Range Picker -->
                        <div class="flex items-center border border-gray-300 rounded-md overflow-hidden">
                            <input type="date" id="logStartDate" class="px-3 py-2 border-0 focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Başlangıç">
                            <span class="text-gray-500 px-2 border-l border-gray-300">-</span>
                            <input type="date" id="logEndDate" class="px-3 py-2 border-0 border-l border-gray-300 focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Bitiş">
                        </div>
                        <button class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200" onclick="document.getElementById('logFiltersPanel').classList.toggle('hidden')">
                            <i class="fas fa-filter mr-1"></i>Filtrele
                        </button>
                    </div>
                </div>
                
                <!-- Filter Panel -->
                <div id="logFiltersPanel" class="hidden mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <!-- Action Filter -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">İşlem Tipi</label>
                            <select id="logActionFilter" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                <option value="">Tüm İşlemler</option>
                                ${uniqueActions.map(action => `
                                    <option value="${action}">${actionLabels[action] || action}</option>
                                `).join('')}
                            </select>
                        </div>
                        
                        <!-- Role Filter -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Kullanıcı Rolü</label>
                            <select id="logRoleFilter" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                <option value="">Tüm Roller</option>
                                <option value="admin">Admin</option>
                                <option value="supplier">Tedarikçi</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="mt-4 flex items-center justify-between">
                        <button id="clearLogFilters" class="text-sm text-blue-600 hover:text-blue-800">
                            <i class="fas fa-times mr-1"></i>Filtreleri Temizle
                        </button>
                        <div class="text-sm text-gray-600">
                            <span id="filteredLogCount">${changeLogs.length}</span> / <span>${allChangeLogs.length}</span> kayıt gösteriliyor
                        </div>
                    </div>
                </div>
                
                <div id="logEntriesContainer" class="space-y-4">
                    ${changeLogs.length === 0 ? `
                        <div class="text-center py-8">
                            <i class="fas fa-filter text-4xl text-gray-400 mb-4"></i>
                            <h3 class="text-lg font-semibold text-gray-600 mb-2">Sonuç Bulunamadı</h3>
                            <p class="text-gray-500">Seçilen filtrelere uygun kayıt bulunamadı.</p>
                        </div>
                    ` : logEntries}
                </div>
                
                ${changeLogs.length > 0 ? `<div id="log-pagination" class="mt-6"></div>` : ''}
            </div>
        </div>
    `;
    
    // Setup filter event listeners
    setupLogFilters(container, product, allChangeLogs, actionLabels);
    
    // Render pagination
    if (changeLogs.length > 0) {
        renderLogPagination();
    }
    
    } catch (error) {
        console.error('Error rendering logs tab:', error);
        container.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-exclamation-triangle text-4xl text-red-400 mb-4"></i>
                <h3 class="text-lg font-semibold text-red-600 mb-2">Hata Oluştu</h3>
                <p class="text-gray-500">Değişiklik logları yüklenirken bir hata oluştu.</p>
                <p class="text-xs text-gray-400 mt-2">${error.message}</p>
        </div>
    `;
    }
}

// Pagination helper for logs
function paginateLogs(data, page = 1, itemsPerPage = 10) {
    if (!window.logPaginationState) {
        window.logPaginationState = {
            currentPage: 1,
            itemsPerPage: 10,
            totalItems: 0,
            totalPages: 0,
            currentData: []
        };
    }
    
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    window.logPaginationState.currentPage = page;
    window.logPaginationState.itemsPerPage = itemsPerPage;
    window.logPaginationState.totalItems = data.length;
    window.logPaginationState.totalPages = Math.ceil(data.length / itemsPerPage);
    window.logPaginationState.currentData = data.slice(startIndex, endIndex);
    
    return window.logPaginationState.currentData;
}

// Render pagination for logs
function renderLogPagination() {
    const container = document.getElementById('log-pagination');
    if (!container || !window.logPaginationState) {
        return;
    }
    
    const { currentPage, totalPages, totalItems, itemsPerPage } = window.logPaginationState;
    
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);
    
    let paginationHTML = `
        <div class="flex items-center justify-between border-t border-gray-200 pt-4">
            <div class="text-sm text-gray-700">
                <span>${startItem}-${endItem}</span> / <span>${totalItems}</span> kayıt gösteriliyor
            </div>
            <div class="flex items-center space-x-2">
    `;
    
    // Previous button
    if (currentPage > 1) {
        paginationHTML += `
            <button onclick="changeLogPage(${currentPage - 1})" class="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <i class="fas fa-chevron-left"></i>
            </button>
        `;
    } else {
        paginationHTML += `
            <button disabled class="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-300 bg-white cursor-not-allowed">
                <i class="fas fa-chevron-left"></i>
            </button>
        `;
    }
    
    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    if (startPage > 1) {
        paginationHTML += `
            <button onclick="changeLogPage(1)" class="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">1</button>
        `;
        if (startPage > 2) {
            paginationHTML += `<span class="px-2 text-gray-500">...</span>`;
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        if (i === currentPage) {
            paginationHTML += `
                <button class="px-3 py-2 border border-blue-500 rounded-md text-sm font-medium text-blue-600 bg-blue-50">${i}</button>
            `;
        } else {
            paginationHTML += `
                <button onclick="changeLogPage(${i})" class="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">${i}</button>
            `;
        }
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<span class="px-2 text-gray-500">...</span>`;
        }
        paginationHTML += `
            <button onclick="changeLogPage(${totalPages})" class="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">${totalPages}</button>
        `;
    }
    
    // Next button
    if (currentPage < totalPages) {
        paginationHTML += `
            <button onclick="changeLogPage(${currentPage + 1})" class="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
    } else {
        paginationHTML += `
            <button disabled class="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-300 bg-white cursor-not-allowed">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
    }
    
    paginationHTML += `
            </div>
        </div>
    `;
    
    container.innerHTML = paginationHTML;
}

// Change log page function (needs to be global for onclick)
window.changeLogPage = function(page) {
    if (!window.logPaginationState) return;
    
    const container = document.getElementById('product-tab-content');
    if (!container) return;
    
    // Get the current product
    const productId = window.currentProductId;
    if (!productId) return;
    
    const product = mockData.products.find(p => p.id === productId);
    if (!product) return;
    
    // Update page
    window.logPaginationState.currentPage = page;
    
    // Re-render logs tab
    renderLogsTab(container, product);
};

function setupLogFilters(container, product, allChangeLogs, actionLabels) {
    const logActionFilter = document.getElementById('logActionFilter');
    const logRoleFilter = document.getElementById('logRoleFilter');
    const logStartDate = document.getElementById('logStartDate');
    const logEndDate = document.getElementById('logEndDate');
    const clearLogFilters = document.getElementById('clearLogFilters');
    const logEntriesContainer = document.getElementById('logEntriesContainer');
    const filteredLogCount = document.getElementById('filteredLogCount');
    
    const renderFilteredLogs = () => {
        // Reset to page 1 when filters change
        if (window.logPaginationState) {
            window.logPaginationState.currentPage = 1;
        }
        // Get filter values
        const actionFilter = logActionFilter?.value || '';
        const roleFilter = logRoleFilter?.value || '';
        const startDateFilter = logStartDate?.value || '';
        const endDateFilter = logEndDate?.value || '';
        
        // Filter logs
        const filteredLogs = allChangeLogs.filter(log => {
            // Action filter
            if (actionFilter && log.action !== actionFilter) {
                return false;
            }
            
            // Role filter
            if (roleFilter && log.userRole !== roleFilter) {
                return false;
            }
            
            // Date filter
            const logDate = new Date(log.timestamp);
            if (startDateFilter) {
                const startDate = new Date(startDateFilter);
                startDate.setHours(0, 0, 0, 0);
                if (logDate < startDate) {
                    return false;
                }
            }
            if (endDateFilter) {
                const endDate = new Date(endDateFilter);
                endDate.setHours(23, 59, 59, 999);
                if (logDate > endDate) {
                    return false;
                }
            }
            
            return true;
        });
        
        // Update count
        if (filteredLogCount) {
            filteredLogCount.textContent = filteredLogs.length;
        }
        
        // Sort all logs by timestamp in descending order (newest first)
        const sortedLogs = filteredLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        // Paginate logs
        const paginatedLogs = paginateLogs(sortedLogs, window.logPaginationState?.currentPage || 1);
        
        // Render log entries
        const logEntries = paginatedLogs.map(log => {
                const actionIcons = {
                    'product_updated': 'fas fa-edit',
                    'image_uploaded': 'fas fa-image',
                    'status_changed': 'fas fa-toggle-on',
                    'stock_updated': 'fas fa-boxes',
                    'attribute_approved': 'fas fa-check-circle',
                    'attribute_rejected': 'fas fa-times-circle',
                    'price_updated': 'fas fa-dollar-sign',
                    'category_changed': 'fas fa-tags',
                    'description_updated': 'fas fa-align-left'
                };
                
                const categoryColors = {
                    'product_info': 'bg-blue-100 text-blue-800',
                    'media': 'bg-purple-100 text-purple-800',
                    'status': 'bg-green-100 text-green-800',
                    'inventory': 'bg-orange-100 text-orange-800',
                    'attributes': 'bg-yellow-100 text-yellow-800',
                    'pricing': 'bg-red-100 text-red-800'
                };
                
                const categoryLabels = {
                    'product_info': 'Ürün Bilgileri',
                    'media': 'Medya',
                    'status': 'Durum',
                    'inventory': 'Envanter',
                    'attributes': 'Özellikler',
                    'pricing': 'Fiyatlandırma'
                };
                
                const userRoleColors = {
                    'admin': 'bg-blue-100 text-blue-800',
                    'supplier': 'bg-green-100 text-green-800'
                };
                
                const logDate = new Date(log.timestamp);
                const dateStr = logDate.toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                const timeStr = logDate.toLocaleTimeString('tr-TR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                });
                const dateTimeStr = `${dateStr} ${timeStr}`;
                
                let detailsHtml = '';
                if (log.details) {
                    if (log.details.changes) {
                        detailsHtml = `
                            <div class="mt-2 space-y-1">
                                ${log.details.changes.map(change => `
                                    <div class="text-xs text-gray-600">
                                        <span class="font-medium">${change.field}:</span>
                                        <span class="text-red-600 line-through">${change.oldValue}</span>
                                        <span class="mx-1">→</span>
                                        <span class="text-green-600 font-medium">${change.newValue}</span>
                                    </div>
                                `).join('')}
                            </div>
                        `;
                    } else if (log.details.oldStatus && log.details.newStatus) {
                        detailsHtml = `
                            <div class="mt-2 text-xs text-gray-600">
                                <span class="text-red-600 line-through">${log.details.oldStatus}</span>
                                <span class="mx-1">→</span>
                                <span class="text-green-600 font-medium">${log.details.newStatus}</span>
                                ${log.details.reason ? `<div class="mt-1 text-gray-500">${log.details.reason}</div>` : ''}
                            </div>
                        `;
                    } else if (log.details.oldStock !== undefined && log.details.newStock !== undefined) {
                        detailsHtml = `
                            <div class="mt-2 text-xs text-gray-600">
                                <span class="text-red-600 line-through">${log.details.oldStock} adet</span>
                                <span class="mx-1">→</span>
                                <span class="text-green-600 font-medium">${log.details.newStock} adet</span>
                                ${log.details.supplier ? `<div class="mt-1 text-gray-500">Tedarikçi: ${log.details.supplier}</div>` : ''}
                            </div>
                        `;
                    } else if (log.details.oldPrice && log.details.newPrice) {
                        detailsHtml = `
                            <div class="mt-2 text-xs text-gray-600">
                                <span class="text-red-600 line-through">${log.details.oldPrice} ₺</span>
                                <span class="mx-1">→</span>
                                <span class="text-green-600 font-medium">${log.details.newPrice} ₺</span>
                                ${log.details.reason ? `<div class="mt-1 text-gray-500">${log.details.reason}</div>` : ''}
                            </div>
                        `;
                    } else if (log.details.attribute) {
                        detailsHtml = `
                            <div class="mt-2 text-xs text-gray-600">
                                <span class="font-medium">Özellik:</span> ${log.details.attribute}
                                <div><span class="font-medium">Değer:</span> ${log.details.value}</div>
                                ${log.details.reason ? `<div class="text-red-600">Sebep: ${log.details.reason}</div>` : ''}
                            </div>
                        `;
                    } else if (log.details.imageUrl) {
                        detailsHtml = `
                            <div class="mt-2 text-xs text-gray-600">
                                <div><span class="font-medium">Tip:</span> ${log.details.imageType}</div>
                                <div><span class="font-medium">Kalite:</span> ${log.details.quality}%</div>
                            </div>
                        `;
                    }
                }
                
                return `
                    <div class="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div class="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <i class="${actionIcons[log.action] || 'fas fa-circle'} text-sm text-gray-600"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center space-x-2">
                                    <span class="font-medium text-gray-900">${log.actionLabel}</span>
                                    <span class="px-2 py-1 text-xs font-medium rounded-full ${categoryColors[log.category] || 'bg-gray-100 text-gray-800'}">
                                        ${categoryLabels[log.category] || log.category}
                                    </span>
                                </div>
                                <span class="text-xs text-gray-500">${dateTimeStr}</span>
                            </div>
                            <p class="text-sm text-gray-600 mt-1">${log.description}</p>
                            ${detailsHtml}
                            <div class="flex items-center justify-between mt-2">
                                <div class="flex items-center space-x-2">
                                    <span class="px-2 py-1 text-xs font-medium rounded-full ${userRoleColors[log.userRole] || 'bg-gray-100 text-gray-800'}">
                                        ${log.userRole === 'admin' ? 'Admin' : 'Tedarikçi'}
                                    </span>
                                    <span class="text-xs text-gray-500">${log.user}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
        }).join('');
        
        // Update the container
        if (logEntriesContainer) {
            if (filteredLogs.length === 0) {
                logEntriesContainer.innerHTML = `
                    <div class="text-center py-8">
                        <i class="fas fa-filter text-4xl text-gray-400 mb-4"></i>
                        <h3 class="text-lg font-semibold text-gray-600 mb-2">Sonuç Bulunamadı</h3>
                        <p class="text-gray-500">Seçilen filtrelere uygun kayıt bulunamadı.</p>
                    </div>
                `;
                // Hide pagination
                const paginationContainer = document.getElementById('log-pagination');
                if (paginationContainer) {
                    paginationContainer.innerHTML = '';
                }
            } else {
                logEntriesContainer.innerHTML = logEntries;
                // Render pagination
                renderLogPagination();
            }
        }
    };
    
    // Add event listeners
    if (logActionFilter) {
        logActionFilter.addEventListener('change', renderFilteredLogs);
    }
    if (logRoleFilter) {
        logRoleFilter.addEventListener('change', renderFilteredLogs);
    }
    if (logStartDate) {
        logStartDate.addEventListener('change', renderFilteredLogs);
    }
    if (logEndDate) {
        logEndDate.addEventListener('change', renderFilteredLogs);
    }
    if (clearLogFilters) {
        clearLogFilters.addEventListener('click', () => {
            if (logActionFilter) logActionFilter.value = '';
            if (logRoleFilter) logRoleFilter.value = '';
            if (logStartDate) logStartDate.value = '';
            if (logEndDate) logEndDate.value = '';
            renderFilteredLogs();
        });
    }
}
// Image management functions
function viewImageFullscreen(imageUrl) {
    const body = `
        <div class="text-center">
            <img src="${imageUrl}" alt="Tam Boyut Görsel" class="max-w-full max-h-[70vh] mx-auto rounded-lg">
        </div>
    `;
    
    showModal('Görsel Önizleme', body, 'Kapat', closeModal);
    
    // Hide confirm button for preview modal
    const confirmBtn = document.getElementById('modal-confirm');
    if (confirmBtn) confirmBtn.classList.add('hidden');
}
function downloadImage(imageUrl, imageName) {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${imageName || 'image'}.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('Görsel indiriliyor...');
}
function editImage(imageId) {
    showToast(`Görsel düzenleme özelliği yakında aktif olacak (ID: ${imageId})`);
}
function replaceImage(imageId) {
    showToast(`Görsel değiştirme özelliği yakında aktif olacak (ID: ${imageId})`);
}
function deleteImage(imageId) {
    if (confirm('Bu görseli silmek istediğinizden emin misiniz?')) {
        showToast(`Görsel silindi (ID: ${imageId})`);
    }
}
function uploadNewImage() {
    showToast('Yeni görsel yükleme özelliği yakında aktif olacak');
}
function optimizeAllImages() {
    showToast('Görsel optimizasyonu başlatılıyor...');
}
// --- DATE RANGE FILTERING FOR FINANCE PAGES ---
function setupDateRangeFiltering() {
    // Set default date range (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    // Set hidden date inputs
    document.getElementById('startDate').value = startDate.toISOString().split('T')[0];
    document.getElementById('endDate').value = endDate.toISOString().split('T')[0];
    
    // Update the visible date range input
    updateDateRangeDisplay();
    
    // Quick date range selection
    document.getElementById('quickDateRange').addEventListener('change', (e) => {
        const quickRange = e.target.value;
        if (quickRange) {
            setQuickDateRange(quickRange);
        }
    });
    
    // Apply date range filter
    document.getElementById('applyDateRange').addEventListener('click', applyDateRangeFilter);
    
    // Reset date range
    document.getElementById('resetDateRange').addEventListener('click', resetDateRange);
    
    // Click handler for date range input to open date picker
    document.getElementById('dateRangeInput').addEventListener('click', openDateRangePicker);
    
    // Auto-apply filter on date change
    document.getElementById('startDate').addEventListener('change', () => {
        updateDateRangeDisplay();
        applyDateRangeFilter();
    });
    document.getElementById('endDate').addEventListener('change', () => {
        updateDateRangeDisplay();
        applyDateRangeFilter();
    });
    
    // Initial filter application
    applyDateRangeFilter();
}
function setQuickDateRange(range) {
    const today = new Date();
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    
    let startDate, endDate;
    
    switch (range) {
        case 'today':
            startDate = endDate = new Date(today);
            break;
        case 'yesterday':
            startDate = endDate = new Date(today);
            startDate.setDate(startDate.getDate() - 1);
            break;
        case 'thisWeek':
            startDate = new Date(today);
            startDate.setDate(startDate.getDate() - startDate.getDay());
            endDate = new Date(today);
            break;
        case 'lastWeek':
            startDate = new Date(today);
            startDate.setDate(startDate.getDate() - startDate.getDay() - 7);
            endDate = new Date(today);
            endDate.setDate(endDate.getDate() - endDate.getDay() - 1);
            break;
        case 'thisMonth':
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            endDate = new Date(today);
            break;
        case 'lastMonth':
            startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            endDate = new Date(today.getFullYear(), today.getMonth(), 0);
            break;
        case 'thisQuarter':
            const quarter = Math.floor(today.getMonth() / 3);
            startDate = new Date(today.getFullYear(), quarter * 3, 1);
            endDate = new Date(today);
            break;
        case 'lastQuarter':
            const lastQuarter = Math.floor(today.getMonth() / 3) - 1;
            const year = lastQuarter < 0 ? today.getFullYear() - 1 : today.getFullYear();
            const month = lastQuarter < 0 ? 9 : lastQuarter * 3;
            startDate = new Date(year, month, 1);
            endDate = new Date(year, month + 3, 0);
            break;
        case 'thisYear':
            startDate = new Date(today.getFullYear(), 0, 1);
            endDate = new Date(today);
            break;
        case 'lastYear':
            startDate = new Date(today.getFullYear() - 1, 0, 1);
            endDate = new Date(today.getFullYear() - 1, 11, 31);
            break;
    }
    
    startDateInput.value = startDate.toISOString().split('T')[0];
    endDateInput.value = endDate.toISOString().split('T')[0];
    
    // Clear quick range selection
    document.getElementById('quickDateRange').value = '';
    
    // Update the display
    updateDateRangeDisplay();
}
function updateDateRangeDisplay() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const dateRangeInput = document.getElementById('dateRangeInput');
    
    if (startDate && endDate) {
        const startFormatted = new Date(startDate).toLocaleDateString('tr-TR');
        const endFormatted = new Date(endDate).toLocaleDateString('tr-TR');
        dateRangeInput.value = `${startFormatted} - ${endFormatted}`;
    } else {
        dateRangeInput.value = '';
    }
}
function openDateRangePicker() {
    // Create a modal for date range selection
    const body = `
        <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Başlangıç Tarihi</label>
                    <input type="date" id="modalStartDate" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Bitiş Tarihi</label>
                    <input type="date" id="modalEndDate" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                </div>
            </div>
            <div class="bg-blue-50 p-3 rounded-lg">
                <div class="flex items-start">
                    <i class="fas fa-info-circle text-blue-500 text-sm mt-1 mr-2"></i>
                    <div class="text-sm text-blue-700">
                        <p class="font-semibold">Bilgi:</p>
                        <p>Tarih aralığını seçtikten sonra "Uygula" butonuna tıklayın.</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Set current values
    const currentStartDate = document.getElementById('startDate').value;
    const currentEndDate = document.getElementById('endDate').value;
    
    showModal('Tarih Aralığı Seçin', body, 'Uygula', () => {
        const modalStartDate = document.getElementById('modalStartDate').value;
        const modalEndDate = document.getElementById('modalEndDate').value;
        
        if (!modalStartDate || !modalEndDate) {
            alert('Lütfen başlangıç ve bitiş tarihlerini seçin.');
            return;
        }
        
        if (new Date(modalStartDate) > new Date(modalEndDate)) {
            alert('Başlangıç tarihi bitiş tarihinden sonra olamaz.');
            return;
        }
        
        // Update the hidden inputs
        document.getElementById('startDate').value = modalStartDate;
        document.getElementById('endDate').value = modalEndDate;
        
        // Update display and apply filter
        updateDateRangeDisplay();
        applyDateRangeFilter();
        closeModal();
    });
    
    // Set current values in modal
    setTimeout(() => {
        document.getElementById('modalStartDate').value = currentStartDate;
        document.getElementById('modalEndDate').value = currentEndDate;
    }, 100);
}
function applyDateRangeFilter() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    if (!startDate || !endDate) {
        showToast('Lütfen başlangıç ve bitiş tarihlerini seçin.');
        return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
        showToast('Başlangıç tarihi bitiş tarihinden sonra olamaz.');
        return;
    }
    
    // Update date range info
    const startDateFormatted = new Date(startDate).toLocaleDateString('tr-TR');
    const endDateFormatted = new Date(endDate).toLocaleDateString('tr-TR');
    document.getElementById('dateRangeInfo').textContent = `${startDateFormatted} - ${endDateFormatted}`;
    
    // Filter and update finance data
    filterFinanceDataByDateRange(startDate, endDate);
}
function resetDateRange() {
    // Reset to last 30 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    document.getElementById('startDate').value = startDate.toISOString().split('T')[0];
    document.getElementById('endDate').value = endDate.toISOString().split('T')[0];
    document.getElementById('quickDateRange').value = '';
    
    // Update the display
    updateDateRangeDisplay();
    
    document.getElementById('dateRangeInfo').textContent = 'Tüm zamanlar';
    
    // Reset finance data
    filterFinanceDataByDateRange(null, null);
}
function filterFinanceDataByDateRange(startDate, endDate) {
    const user = window.currentUser || {};
    const isSupplier = user.role === 'supplier';
    
    if (isSupplier) {
        filterSupplierFinanceData(startDate, endDate);
    } else {
        filterAdminFinanceData(startDate, endDate);
    }
}
function filterSupplierFinanceData(startDate, endDate) {
    let filteredPayouts = mockData.supplierPayouts || [];
    let filteredRevenue = mockData.supplierRevenue || [];
    
    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Include the entire end date
        
        // Filter payouts
        filteredPayouts = filteredPayouts.filter(payout => {
            const payoutDate = new Date(payout.date);
            return payoutDate >= start && payoutDate <= end;
        });
        
        // Filter revenue data
        filteredRevenue = filteredRevenue.filter(revenue => {
            const revenueDate = new Date(revenue.date);
            return revenueDate >= start && revenueDate <= end;
        });
    }
    
    // Update summary cards
    const completedPayouts = filteredPayouts.filter(p => p.status === 'completed');
    const pendingPayouts = filteredPayouts.filter(p => p.status === 'pending');
    
    const totalPayout = completedPayouts.reduce((sum, p) => sum + p.amount, 0);
    const pendingAmount = pendingPayouts.reduce((sum, p) => sum + p.amount, 0);
    const lastPayment = completedPayouts[0] || { amount: 0, date: 'N/A' };
    
    // Update display elements
    const totalPayoutEl = document.getElementById('totalPayoutAmount');
    const pendingAmountEl = document.getElementById('pendingAmountDisplay');
    const lastPaymentAmountEl = document.getElementById('lastPaymentAmount');
    const lastPaymentDateEl = document.getElementById('lastPaymentDate');
    
    if (totalPayoutEl) totalPayoutEl.textContent = totalPayout.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' });
    if (pendingAmountEl) pendingAmountEl.textContent = pendingAmount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' });
    if (lastPaymentAmountEl) lastPaymentAmountEl.textContent = lastPayment.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' });
    if (lastPaymentDateEl) lastPaymentDateEl.textContent = lastPayment.date === 'N/A' ? 'Yok' : new Date(lastPayment.date).toLocaleDateString('tr-TR');
    
    // Update filtered data count
    const filteredCountEl = document.getElementById('filteredDataCount');
    if (filteredCountEl) {
        filteredCountEl.textContent = `${filteredPayouts.length} ödeme, ${filteredRevenue.length} gelir kaydı`;
    }
    
    // Refresh the current tab content
    const currentHash = window.location.hash;
    if (currentHash.includes('#finance/')) {
        const activeTab = currentHash.split('/')[1];
        renderFinanceSubTab(activeTab);
    }
}
function filterAdminFinanceData(startDate, endDate) {
    let filteredRevenue = mockData.adminRevenue || [];
    let filteredTransactions = mockData.transactions || [];
    let filteredPaymentHistory = mockData.paymentHistory || [];
    
    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        
        // Filter revenue data
        if (Array.isArray(filteredRevenue)) {
            filteredRevenue = filteredRevenue.filter(revenue => {
                const revenueDate = new Date(revenue.date);
                return revenueDate >= start && revenueDate <= end;
            });
        }
        
        // Filter transactions
        filteredTransactions = filteredTransactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            return transactionDate >= start && transactionDate <= end;
        });
        
        // Filter payment history
        filteredPaymentHistory = filteredPaymentHistory.filter(payment => {
            const paymentDate = new Date(payment.date);
            return paymentDate >= start && paymentDate <= end;
        });
    }
    
    // Calculate filtered totals
    const totalRevenue = Array.isArray(filteredRevenue) ? 
        filteredRevenue.reduce((sum, rev) => sum + (rev.commissionEarned || 0), 0) : 0;
    const totalSales = Array.isArray(filteredRevenue) ? 
        filteredRevenue.reduce((sum, rev) => sum + (rev.totalSales || 0), 0) : 0;
    const avgCommissionRate = totalSales > 0 ? (totalRevenue / totalSales * 100).toFixed(1) : 0;
    const lastRevenue = Array.isArray(filteredRevenue) && filteredRevenue.length > 0 ? filteredRevenue[0] : null;
    
    // Update display elements
    const totalRevenueEl = document.getElementById('totalRevenueAmount');
    const totalSalesEl = document.getElementById('totalSalesAmount');
    const avgCommissionEl = document.getElementById('avgCommissionRateDisplay');
    const lastRevenueEl = document.getElementById('lastRevenuePeriod');
    
    if (totalRevenueEl) totalRevenueEl.textContent = totalRevenue.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' });
    if (totalSalesEl) totalSalesEl.textContent = totalSales.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' });
    if (avgCommissionEl) avgCommissionEl.textContent = `${avgCommissionRate}%`;
    if (lastRevenueEl) lastRevenueEl.textContent = lastRevenue ? lastRevenue.period : 'Yok';
    
    // Update filtered data count
    const filteredCountEl = document.getElementById('filteredDataCount');
    if (filteredCountEl) {
        const revenueCount = Array.isArray(filteredRevenue) ? filteredRevenue.length : 0;
        filteredCountEl.textContent = `${revenueCount} gelir kaydı, ${filteredTransactions.length} işlem, ${filteredPaymentHistory.length} ödeme`;
    }
    
    // Refresh the current tab content
    const currentHash = window.location.hash;
    if (currentHash.includes('#finance/')) {
        const activeTab = currentHash.split('/')[1];
        renderAdminFinanceSubTab(activeTab);
    }
}
        // Generate context-aware bulk actions dropdown
        function generateBulkActionsDropdown(activeTab, isSupplier) {
            let actions = [];
            
            if (activeTab === 'fiyat-stok-istekleri') {
                // Price Update Requests - Admin only
                actions = [
                    '<a href="#" id="bulk-approve-prices" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><i class="fas fa-check-circle w-4 mr-2 text-green-500"></i>Fiyat Taleplerini Onayla</a>',
                    '<a href="#" id="bulk-reject-prices" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><i class="fas fa-times-circle w-4 mr-2 text-red-500"></i>Fiyat Taleplerini Reddet</a>'
                ];
            } else if (activeTab === 'urun-guncelleme') {
                // Awaiting Updates - Admin only
                actions = [
                    '<a href="#" id="bulk-approve" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><i class="fas fa-check-circle w-4 mr-2 text-green-500"></i>Güncellemeleri Onayla</a>',
                    '<a href="#" id="bulk-reject" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><i class="fas fa-times-circle w-4 mr-2 text-red-500"></i>Güncellemeleri Reddet</a>',
                    '<div class="border-t border-gray-100 my-1"></div>',
                    '<a href="#" id="bulk-assign-reviewer" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><i class="fas fa-user-check w-4 mr-2 text-blue-500"></i>İnceleyici Ata</a>',
                    '<a href="#" id="bulk-set-priority" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><i class="fas fa-flag w-4 mr-2 text-orange-500"></i>Öncelik Belirle</a>'
                ];
            } else if (activeTab === 'yeni-urun-talepleri') {
                // New Product Requests - Combined view for both admins and suppliers
                if (isSupplier) {
                    // Supplier view - can withdraw submissions and edit
                    actions = [
                        '<a href="#" id="bulk-withdraw-submission" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><i class="fas fa-undo w-4 mr-2 text-orange-500"></i>Gönderimleri Geri Çek</a>',
                        '<a href="#" id="bulk-edit-submitted" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><i class="fas fa-edit w-4 mr-2 text-yellow-500"></i>Gönderilenleri Düzenle</a>',
                        '<div class="border-t border-gray-100 my-1"></div>',
                        '<a href="#" id="bulk-export" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><i class="fas fa-download w-4 mr-2 text-purple-500"></i>Seçilenleri Dışa Aktar</a>'
                    ];
                } else {
                    // Admin view - can approve, reject, assign reviewer, etc.
                    actions = [
                        '<a href="#" id="bulk-approve" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><i class="fas fa-check-circle w-4 mr-2 text-green-500"></i>Ürünleri Onayla</a>',
                        '<a href="#" id="bulk-reject" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><i class="fas fa-times-circle w-4 mr-2 text-red-500"></i>Ürünleri Reddet</a>',
                        '<div class="border-t border-gray-100 my-1"></div>',
                        '<a href="#" id="bulk-assign-reviewer" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><i class="fas fa-user-check w-4 mr-2 text-blue-500"></i>İnceleyici Ata</a>',
                        '<a href="#" id="bulk-set-priority" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><i class="fas fa-flag w-4 mr-2 text-orange-500"></i>Öncelik Belirle</a>',
                        '<div class="border-t border-gray-100 my-1"></div>',
                        '<a href="#" id="bulk-export" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><i class="fas fa-download w-4 mr-2 text-purple-500"></i>Seçilenleri Dışa Aktar</a>'
                    ];
                }
            } else if (activeTab === 'aktif') {
                if (isSupplier) {
                    // Approved Products - Supplier view
                    actions = [
                        '<a href="#" id="bulk-update-stock" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><i class="fas fa-boxes w-4 mr-2 text-blue-500"></i>Stok Güncelle</a>',
                        '<a href="#" id="bulk-update-price" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><i class="fas fa-tag w-4 mr-2 text-green-500"></i>Fiyat Güncelle</a>',
                        '<div class="border-t border-gray-100 my-1"></div>',
                        '<a href="#" id="bulk-archive" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><i class="fas fa-archive w-4 mr-2 text-orange-500"></i>Arşivle</a>',
                        '<a href="#" id="bulk-ban" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><i class="fas fa-ban w-4 mr-2 text-red-500"></i>Yasakla</a>',
                        '<div class="border-t border-gray-100 my-1"></div>',
                        '<a href="#" id="bulk-export" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><i class="fas fa-download w-4 mr-2 text-purple-500"></i>Seçilenleri Dışa Aktar</a>'
                    ];
                } else {
                    // Approved Products - Admin view
                    actions = [
                        '<a href="#" id="bulk-activate" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><i class="fas fa-toggle-on w-4 mr-2 text-blue-500"></i>Seçilenleri Aktif Et</a>',
                        '<a href="#" id="bulk-deactivate" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><i class="fas fa-toggle-off w-4 mr-2 text-gray-500"></i>Seçilenleri Pasif Et</a>',
                        '<div class="border-t border-gray-100 my-1"></div>',
                        '<a href="#" id="bulk-update-stock-price" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><i class="fas fa-edit w-4 mr-2 text-yellow-500"></i>Stok/Fiyat Güncelle</a>',
                        '<a href="#" id="bulk-assign-supplier" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><i class="fas fa-handshake w-4 mr-2 text-indigo-500"></i>Tedarikçi Ata</a>',
                        '<div class="border-t border-gray-100 my-1"></div>',
                        '<a href="#" id="bulk-export" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><i class="fas fa-download w-4 mr-2 text-purple-500"></i>Seçilenleri Dışa Aktar</a>',
                        '<a href="#" id="bulk-add-file" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><i class="fas fa-file-import w-4 mr-2"></i>Dosya ile Ürünler</a>',
                        '<a href="#" id="bulk-update-file" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><i class="fas fa-file-upload w-4 mr-2"></i>Dosya ile Güncelle</a>',
                        '<a href="#" id="bulk-download-template" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><i class="fas fa-file-download w-4 mr-2"></i>Şablon İndir</a>'
                    ];
                }
            } else if (activeTab === 'archived') {
                if (isSupplier) {
                    // Archived Products - Supplier view
                    actions = [
                        '<a href="#" id="bulk-unarchive" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><i class="fas fa-undo w-4 mr-2 text-green-500"></i>Arşivden Çıkar</a>',
                        '<a href="#" id="bulk-ban" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><i class="fas fa-ban w-4 mr-2 text-red-500"></i>Yasakla</a>',
                        '<div class="border-t border-gray-100 my-1"></div>',
                        '<a href="#" id="bulk-export" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><i class="fas fa-download w-4 mr-2 text-purple-500"></i>Seçilenleri Dışa Aktar</a>'
                    ];
                } else {
                    // Archived Products - Admin view
                    actions = [
                        '<a href="#" id="bulk-unarchive" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><i class="fas fa-undo w-4 mr-2 text-green-500"></i>Arşivden Çıkar</a>',
                        '<a href="#" id="bulk-ban" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><i class="fas fa-ban w-4 mr-2 text-red-500"></i>Yasakla</a>',
                        '<div class="border-t border-gray-100 my-1"></div>',
                        '<a href="#" id="bulk-export" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><i class="fas fa-download w-4 mr-2 text-purple-500"></i>Seçilenleri Dışa Aktar</a>'
                    ];
                }
            } else if (activeTab === 'banned') {
                if (isSupplier) {
                    // Non-banned Products - Supplier view
                    actions = [
                        '<a href="#" id="bulk-ban" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><i class="fas fa-ban w-4 mr-2 text-red-500"></i>Yasakla</a>',
                        '<a href="#" id="bulk-archive" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><i class="fas fa-archive w-4 mr-2 text-orange-500"></i>Arşivle</a>',
                        '<div class="border-t border-gray-100 my-1"></div>',
                        '<a href="#" id="bulk-export" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><i class="fas fa-download w-4 mr-2 text-purple-500"></i>Seçilenleri Dışa Aktar</a>'
                    ];
                } else {
                    // Non-banned Products - Admin view
                    actions = [
                        '<a href="#" id="bulk-ban" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><i class="fas fa-ban w-4 mr-2 text-red-500"></i>Yasakla</a>',
                        '<a href="#" id="bulk-archive" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><i class="fas fa-archive w-4 mr-2 text-orange-500"></i>Arşivle</a>',
                        '<div class="border-t border-gray-100 my-1"></div>',
                        '<a href="#" id="bulk-export" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><i class="fas fa-download w-4 mr-2 text-purple-500"></i>Seçilenleri Dışa Aktar</a>'
                    ];
                }
            } else {
                // Default actions for any other tab
                actions = [
                    '<a href="#" id="bulk-approve" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><i class="fas fa-check-circle w-4 mr-2 text-green-500"></i>Seçilenleri Onayla</a>',
                    '<div class="border-t border-gray-100 my-1"></div>',
                    '<a href="#" id="bulk-activate" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><i class="fas fa-toggle-on w-4 mr-2 text-blue-500"></i>Seçilenleri Aktif Et</a>',
                    '<a href="#" id="bulk-deactivate" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><i class="fas fa-toggle-off w-4 mr-2 text-gray-500"></i>Seçilenleri Pasif Et</a>',
                    '<div class="border-t border-gray-100 my-1"></div>',
                    '<a href="#" id="bulk-export" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><i class="fas fa-download w-4 mr-2 text-purple-500"></i>Seçilenleri Dışa Aktar</a>',
                    '<a href="#" id="bulk-update-stock" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><i class="fas fa-boxes w-4 mr-2 text-blue-500"></i>Stok Güncelle</a>',
                    '<a href="#" id="bulk-update-price" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><i class="fas fa-tag w-4 mr-2 text-green-500"></i>Fiyat Güncelle</a>'
                ];
            }
            
            // Ensure we always have at least some actions
            if (actions.length === 0) {
                actions = [
                    '<a href="#" id="bulk-export" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><i class="fas fa-download w-4 mr-2 text-purple-500"></i>Seçilenleri Dışa Aktar</a>',
                    '<a href="#" id="bulk-update-stock" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><i class="fas fa-boxes w-4 mr-2 text-blue-500"></i>Stok Güncelle</a>',
                    '<a href="#" id="bulk-update-price" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><i class="fas fa-tag w-4 mr-2 text-green-500"></i>Fiyat Güncelle</a>'
                ];
            }
            
            return actions.join('');
        }
        function generateActionsDropdown(activeTab, isSupplier) {
            let actions = [];
            
            // Admin users should not see actions button (handled in HTML), but return empty for safety
            if (!isSupplier) {
                return '';
            }
            
            // Supplier actions based on requirements
            if (activeTab === 'yeni-urun-talepleri') {
                // Supplier view - New product requests: Talebi geri çek
                actions = [
                    '<a href="#" id="action-withdraw-request" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><i class="fas fa-undo w-4 mr-2 text-orange-500"></i>Talebi Geri Çek</a>'
                ];
            } else if (activeTab === 'urun-guncelleme') {
                // Supplier view - Product update requests: Talebi geri çekme
                actions = [
                    '<a href="#" id="action-withdraw-request" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><i class="fas fa-undo w-4 mr-2 text-orange-500"></i>Talebi Geri Çek</a>'
                ];
            } else if (activeTab === 'fiyat-stok-istekleri') {
                // Supplier view - Price & Stock update requests: Talebi geri çekme
                actions = [
                    '<a href="#" id="action-withdraw-request" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><i class="fas fa-undo w-4 mr-2 text-orange-500"></i>Talebi Geri Çek</a>'
                ];
            } else if (activeTab === 'aktif' || activeTab === 'approved') {
                // Supplier view - Aktif Ürünler: arşivleme ve stok güncelleme
                actions = [
                    '<a href="#" id="action-update-stock" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><i class="fas fa-boxes w-4 mr-2 text-blue-500"></i>Stok Güncelle</a>',
                    '<div class="border-t border-gray-100 my-1"></div>',
                    '<a href="#" id="action-archive" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><i class="fas fa-archive w-4 mr-2 text-orange-500"></i>Arşivle</a>'
                ];
            } else if (activeTab === 'out-of-stock') {
                // Supplier view - Pasif > Stoğu Bitenler: stok güncelleme
                actions = [
                    '<a href="#" id="action-update-stock" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><i class="fas fa-boxes w-4 mr-2 text-blue-500"></i>Stok Güncelle</a>'
                ];
            } else if (activeTab === 'archived-items') {
                // Supplier view - Pasif > Arşivlenenler: arşivden çıkarma
                actions = [
                    '<a href="#" id="action-unarchive" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><i class="fas fa-redo w-4 mr-2 text-green-500"></i>Arşivden Çıkar</a>'
                ];
            } else if (activeTab === 'gonderilenler' || activeTab === 'submitted') {
                // Submitted products - Supplier view (fallback)
                actions = [
                    '<a href="#" id="action-withdraw-submission" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><i class="fas fa-undo w-4 mr-2 text-orange-500"></i>Gönderimi Geri Çek</a>'
                ];
            } else {
                // Default actions for any other tab
                actions = [];
            }
            
            // Return empty string if no actions (button will be disabled)
            return actions.join('');
        }
        // Setup dynamic bulk action event listeners
        function setupBulkActionEventListeners(activeTab, isSupplier, bulkActionsDropdown) {
            // Price Update Requests actions
            const bulkApprovePrices = document.getElementById('bulk-approve-prices');
            const bulkRejectPrices = document.getElementById('bulk-reject-prices');
            if (bulkApprovePrices) {
                bulkApprovePrices.addEventListener('click', (e) => { e.preventDefault(); bulkApprovePriceRequests(); bulkActionsDropdown.classList.add('hidden'); });
            }
            if (bulkRejectPrices) {
                bulkRejectPrices.addEventListener('click', (e) => { e.preventDefault(); bulkRejectPriceRequests(); bulkActionsDropdown.classList.add('hidden'); });
            }
            // General approval/rejection actions
            const bulkApprove = document.getElementById('bulk-approve');
            const bulkReject = document.getElementById('bulk-reject');
            const bulkReapprove = document.getElementById('bulk-reapprove');
            if (bulkApprove) bulkApprove.addEventListener('click', (e) => { e.preventDefault(); handleBulkAction('approve'); bulkActionsDropdown.classList.add('hidden'); });
            if (bulkReject) bulkReject.addEventListener('click', (e) => { e.preventDefault(); handleBulkAction('reject'); bulkActionsDropdown.classList.add('hidden'); });
            if (bulkReapprove) bulkReapprove.addEventListener('click', (e) => { e.preventDefault(); handleBulkAction('reapprove'); bulkActionsDropdown.classList.add('hidden'); });
            // Activation/deactivation actions
            const bulkActivate = document.getElementById('bulk-activate');
            const bulkDeactivate = document.getElementById('bulk-deactivate');
            if (bulkActivate) bulkActivate.addEventListener('click', (e) => { e.preventDefault(); handleBulkAction('activate'); bulkActionsDropdown.classList.add('hidden'); });
            if (bulkDeactivate) bulkDeactivate.addEventListener('click', (e) => { e.preventDefault(); handleBulkAction('deactivate'); bulkActionsDropdown.classList.add('hidden'); });
            // Stock and price update actions
            const bulkUpdateStockPrice = document.getElementById('bulk-update-stock-price');
            const bulkUpdateStock = document.getElementById('bulk-update-stock');
            const bulkUpdatePrice = document.getElementById('bulk-update-price');
            if (bulkUpdateStockPrice) bulkUpdateStockPrice.addEventListener('click', (e) => { e.preventDefault(); showBulkUpdateModal(); bulkActionsDropdown.classList.add('hidden'); });
            if (bulkUpdateStock) bulkUpdateStock.addEventListener('click', (e) => { e.preventDefault(); showBulkStockUpdateModal(); bulkActionsDropdown.classList.add('hidden'); });
            if (bulkUpdatePrice) bulkUpdatePrice.addEventListener('click', (e) => { e.preventDefault(); showBulkPriceUpdateModal(); bulkActionsDropdown.classList.add('hidden'); });
            // Assignment actions
            const bulkAssignReviewer = document.getElementById('bulk-assign-reviewer');
            const bulkAssignSupplier = document.getElementById('bulk-assign-supplier');
            if (bulkAssignReviewer) bulkAssignReviewer.addEventListener('click', (e) => { e.preventDefault(); showBulkAssignReviewerModal(); bulkActionsDropdown.classList.add('hidden'); });
            if (bulkAssignSupplier) bulkAssignSupplier.addEventListener('click', (e) => { e.preventDefault(); showBulkAssignSupplierModal(); bulkActionsDropdown.classList.add('hidden'); });
            // Priority and other actions
            const bulkSetPriority = document.getElementById('bulk-set-priority');
            const bulkEdit = document.getElementById('bulk-edit');
            const bulkResubmit = document.getElementById('bulk-resubmit');
            if (bulkSetPriority) bulkSetPriority.addEventListener('click', (e) => { e.preventDefault(); showBulkSetPriorityModal(); bulkActionsDropdown.classList.add('hidden'); });
            if (bulkEdit) bulkEdit.addEventListener('click', (e) => { e.preventDefault(); handleBulkAction('edit'); bulkActionsDropdown.classList.add('hidden'); });
            if (bulkResubmit) bulkResubmit.addEventListener('click', (e) => { e.preventDefault(); handleBulkAction('resubmit'); bulkActionsDropdown.classList.add('hidden'); });
            // Delete action
            const bulkDelete = document.getElementById('bulk-delete');
            if (bulkDelete) bulkDelete.addEventListener('click', (e) => { e.preventDefault(); handleBulkAction('delete'); bulkActionsDropdown.classList.add('hidden'); });
            // Export action
            const bulkExport = document.getElementById('bulk-export');
            if (bulkExport) bulkExport.addEventListener('click', (e) => { e.preventDefault(); handleBulkAction('export'); bulkActionsDropdown.classList.add('hidden'); });
            // Archive/Ban actions
            const bulkArchive = document.getElementById('bulk-archive');
            const bulkUnarchive = document.getElementById('bulk-unarchive');
            const bulkBan = document.getElementById('bulk-ban');
            const bulkUnban = document.getElementById('bulk-unban');
            if (bulkArchive) bulkArchive.addEventListener('click', (e) => { e.preventDefault(); handleBulkAction('archive'); bulkActionsDropdown.classList.add('hidden'); });
            if (bulkUnarchive) bulkUnarchive.addEventListener('click', (e) => { e.preventDefault(); handleBulkAction('unarchive'); bulkActionsDropdown.classList.add('hidden'); });
            if (bulkBan) bulkBan.addEventListener('click', (e) => { e.preventDefault(); handleBulkAction('ban'); bulkActionsDropdown.classList.add('hidden'); });
            if (bulkUnban) bulkUnban.addEventListener('click', (e) => { e.preventDefault(); handleBulkAction('unban'); bulkActionsDropdown.classList.add('hidden'); });
            // File operations
            const bulkAddFile = document.getElementById('bulk-add-file');
            const bulkUpdateFile = document.getElementById('bulk-update-file');
            const bulkDownloadTemplate = document.getElementById('bulk-download-template');
            console.log('bulkDownloadTemplate button found:', bulkDownloadTemplate);
            if (bulkAddFile) bulkAddFile.addEventListener('click', (e) => { e.preventDefault(); showBulkImportModal('add'); bulkActionsDropdown.classList.add('hidden'); });
            if (bulkUpdateFile) bulkUpdateFile.addEventListener('click', (e) => { e.preventDefault(); showBulkImportModal('update'); bulkActionsDropdown.classList.add('hidden'); });
            if (bulkDownloadTemplate) {
                console.log('Adding event listener to bulkDownloadTemplate');
                bulkDownloadTemplate.addEventListener('click', (e) => { 
                    console.log('bulkDownloadTemplate clicked!');
                    e.preventDefault(); 
                    showDownloadTemplateModal(); 
                    bulkActionsDropdown.classList.add('hidden'); 
                });
            } else {
                console.log('bulkDownloadTemplate button not found!');
            }
        }
        function setupActionEventListeners(activeTab, isSupplier, actionsDropdown) {
            // Draft/Submitted actions
            const actionSubmitForReview = document.getElementById('action-submit-for-review');
            const actionEditSelected = document.getElementById('action-edit-selected');
            const actionDeleteDrafts = document.getElementById('action-delete-drafts');
            const actionExportDrafts = document.getElementById('action-export-drafts');
            
            if (actionSubmitForReview) actionSubmitForReview.addEventListener('click', (e) => { e.preventDefault(); handleAction('submit-for-review'); actionsDropdown.classList.add('hidden'); });
            if (actionEditSelected) actionEditSelected.addEventListener('click', (e) => { e.preventDefault(); handleAction('edit-selected'); actionsDropdown.classList.add('hidden'); });
            if (actionDeleteDrafts) actionDeleteDrafts.addEventListener('click', (e) => { e.preventDefault(); handleAction('delete-drafts'); actionsDropdown.classList.add('hidden'); });
            if (actionExportDrafts) actionExportDrafts.addEventListener('click', (e) => { e.preventDefault(); handleAction('export-drafts'); actionsDropdown.classList.add('hidden'); });
            
            // Admin draft actions
            const actionApproveDrafts = document.getElementById('action-approve-drafts');
            const actionRejectDrafts = document.getElementById('action-reject-drafts');
            const actionAssignReviewer = document.getElementById('action-assign-reviewer');
            const actionSetPriority = document.getElementById('action-set-priority');
            
            if (actionApproveDrafts) actionApproveDrafts.addEventListener('click', (e) => { e.preventDefault(); handleAction('approve-drafts'); actionsDropdown.classList.add('hidden'); });
            if (actionRejectDrafts) actionRejectDrafts.addEventListener('click', (e) => { e.preventDefault(); handleAction('reject-drafts'); actionsDropdown.classList.add('hidden'); });
            if (actionAssignReviewer) actionAssignReviewer.addEventListener('click', (e) => { e.preventDefault(); handleAction('assign-reviewer'); actionsDropdown.classList.add('hidden'); });
            if (actionSetPriority) actionSetPriority.addEventListener('click', (e) => { e.preventDefault(); handleAction('set-priority'); actionsDropdown.classList.add('hidden'); });
            
            // Submitted actions
            const actionWithdrawSubmission = document.getElementById('action-withdraw-submission');
            const actionEditSubmitted = document.getElementById('action-edit-submitted');
            const actionExportSubmitted = document.getElementById('action-export-submitted');
            const actionApproveSubmitted = document.getElementById('action-approve-submitted');
            const actionRejectSubmitted = document.getElementById('action-reject-submitted');
            
            if (actionWithdrawSubmission) actionWithdrawSubmission.addEventListener('click', (e) => { e.preventDefault(); handleAction('withdraw-submission'); actionsDropdown.classList.add('hidden'); });
            if (actionEditSubmitted) actionEditSubmitted.addEventListener('click', (e) => { e.preventDefault(); handleAction('edit-submitted'); actionsDropdown.classList.add('hidden'); });
            if (actionExportSubmitted) actionExportSubmitted.addEventListener('click', (e) => { e.preventDefault(); handleAction('export-submitted'); actionsDropdown.classList.add('hidden'); });
            if (actionApproveSubmitted) actionApproveSubmitted.addEventListener('click', (e) => { e.preventDefault(); handleAction('approve-submitted'); actionsDropdown.classList.add('hidden'); });
            if (actionRejectSubmitted) actionRejectSubmitted.addEventListener('click', (e) => { e.preventDefault(); handleAction('reject-submitted'); actionsDropdown.classList.add('hidden'); });
            
            // Approved actions
            const actionUpdateStock = document.getElementById('action-update-stock');
            const actionUpdatePrice = document.getElementById('action-update-price');
            const actionRequestPriceUpdate = document.getElementById('action-request-price-update');
            const actionExportApproved = document.getElementById('action-export-approved');
            const actionActivateProducts = document.getElementById('action-activate-products');
            const actionDeactivateProducts = document.getElementById('action-deactivate-products');
            const actionUpdateStockPrice = document.getElementById('action-update-stock-price');
            const actionAssignSupplier = document.getElementById('action-assign-supplier');
            
            if (actionUpdateStock) actionUpdateStock.addEventListener('click', (e) => { e.preventDefault(); handleAction('update-stock'); actionsDropdown.classList.add('hidden'); });
            if (actionUpdatePrice) actionUpdatePrice.addEventListener('click', (e) => { e.preventDefault(); handleAction('update-price'); actionsDropdown.classList.add('hidden'); });
            if (actionRequestPriceUpdate) actionRequestPriceUpdate.addEventListener('click', (e) => { e.preventDefault(); handleAction('request-price-update'); actionsDropdown.classList.add('hidden'); });
            if (actionExportApproved) actionExportApproved.addEventListener('click', (e) => { e.preventDefault(); handleAction('export-approved'); actionsDropdown.classList.add('hidden'); });
            if (actionActivateProducts) actionActivateProducts.addEventListener('click', (e) => { e.preventDefault(); handleAction('activate-products'); actionsDropdown.classList.add('hidden'); });
            if (actionDeactivateProducts) actionDeactivateProducts.addEventListener('click', (e) => { e.preventDefault(); handleAction('deactivate-products'); actionsDropdown.classList.add('hidden'); });
            if (actionUpdateStockPrice) actionUpdateStockPrice.addEventListener('click', (e) => { e.preventDefault(); handleAction('update-stock-price'); actionsDropdown.classList.add('hidden'); });
            if (actionAssignSupplier) actionAssignSupplier.addEventListener('click', (e) => { e.preventDefault(); handleAction('assign-supplier'); actionsDropdown.classList.add('hidden'); });
            
            // Rejected actions
            const actionResubmitRejected = document.getElementById('action-resubmit-rejected');
            const actionEditRejected = document.getElementById('action-edit-rejected');
            const actionDeleteRejected = document.getElementById('action-delete-rejected');
            const actionExportRejected = document.getElementById('action-export-rejected');
            const actionReapproveRejected = document.getElementById('action-reapprove-rejected');
            
            if (actionResubmitRejected) actionResubmitRejected.addEventListener('click', (e) => { e.preventDefault(); handleAction('resubmit-rejected'); actionsDropdown.classList.add('hidden'); });
            if (actionEditRejected) actionEditRejected.addEventListener('click', (e) => { e.preventDefault(); handleAction('edit-rejected'); actionsDropdown.classList.add('hidden'); });
            if (actionDeleteRejected) actionDeleteRejected.addEventListener('click', (e) => { e.preventDefault(); handleAction('delete-rejected'); actionsDropdown.classList.add('hidden'); });
            if (actionExportRejected) actionExportRejected.addEventListener('click', (e) => { e.preventDefault(); handleAction('export-rejected'); actionsDropdown.classList.add('hidden'); });
            if (actionReapproveRejected) actionReapproveRejected.addEventListener('click', (e) => { e.preventDefault(); handleAction('reapprove-rejected'); actionsDropdown.classList.add('hidden'); });
            
            // Price update request actions
            const actionApprovePriceRequests = document.getElementById('action-approve-price-requests');
            const actionRejectPriceRequests = document.getElementById('action-reject-price-requests');
            const actionExportPriceRequests = document.getElementById('action-export-price-requests');
            
            if (actionApprovePriceRequests) actionApprovePriceRequests.addEventListener('click', (e) => { e.preventDefault(); handleAction('approve-price-requests'); actionsDropdown.classList.add('hidden'); });
            if (actionRejectPriceRequests) actionRejectPriceRequests.addEventListener('click', (e) => { e.preventDefault(); handleAction('reject-price-requests'); actionsDropdown.classList.add('hidden'); });
            if (actionExportPriceRequests) actionExportPriceRequests.addEventListener('click', (e) => { e.preventDefault(); handleAction('export-price-requests'); actionsDropdown.classList.add('hidden'); });
            
            // Default actions
            const actionExportSelected = document.getElementById('action-export-selected');
            if (actionExportSelected) actionExportSelected.addEventListener('click', (e) => { e.preventDefault(); handleAction('export-selected'); actionsDropdown.classList.add('hidden'); });
            
            // New supplier-specific actions
            const actionWithdrawRequest = document.getElementById('action-withdraw-request');
            const actionArchive = document.getElementById('action-archive');
            const actionUnarchive = document.getElementById('action-unarchive');
            
            if (actionWithdrawRequest) actionWithdrawRequest.addEventListener('click', (e) => { e.preventDefault(); handleAction('withdraw-request'); actionsDropdown.classList.add('hidden'); });
            if (actionArchive) actionArchive.addEventListener('click', (e) => { e.preventDefault(); handleAction('archive'); actionsDropdown.classList.add('hidden'); });
            if (actionUnarchive) actionUnarchive.addEventListener('click', (e) => { e.preventDefault(); handleAction('unarchive'); actionsDropdown.classList.add('hidden'); });
        }
        function handleAction(actionType) {
            const selectedProductIds = getSelectedProductIds();
            
            if (selectedProductIds.length === 0) {
                showToast('Lütfen en az bir ürün seçin.');
                return;
            }
            
            const selectedCount = selectedProductIds.length;
            
            switch (actionType) {
                case 'submit-for-review':
                    // Submit selected draft products for review
                    selectedProductIds.forEach(id => {
                        const product = mockData.products.find(p => p.id === id);
                        if (product && product.status === 'draft') {
                            product.status = 'submitted';
                            product.submittedAt = new Date().toISOString();
                        }
                    });
                    showToast(`${selectedCount} ürün inceleme için gönderildi.`);
                    break;
                    
                case 'edit-selected':
                    // Open edit modal for first selected product
                    if (selectedProductIds.length > 0) {
                        navigateTo(`#products/detail/${selectedProductIds[0]}`);
                    }
                    break;
                    
                case 'delete-drafts':
                    if (confirm(`${selectedCount} taslağı silmek istediğinizden emin misiniz?`)) {
                        mockData.products = mockData.products.filter(p => !selectedProductIds.includes(p.id));
                        showToast(`${selectedCount} taslak silindi.`);
                    }
                    break;
                    
                case 'export-drafts':
                    showToast(`${selectedCount} taslak dışa aktarılıyor...`);
                    break;
                    
                case 'approve-drafts':
                    selectedProductIds.forEach(id => {
                        const product = mockData.products.find(p => p.id === id);
                        if (product) {
                            product.status = 'approved';
                            product.approvedAt = new Date().toISOString();
                        }
                    });
                    showToast(`${selectedCount} taslak onaylandı.`);
                    break;
                    
                case 'reject-drafts':
                    selectedProductIds.forEach(id => {
                        const product = mockData.products.find(p => p.id === id);
                        if (product) {
                            product.status = 'rejected';
                            product.rejectedAt = new Date().toISOString();
                        }
                    });
                    showToast(`${selectedCount} taslak reddedildi.`);
                    break;
                    
                case 'assign-reviewer':
                    showToast('İnceleyici atama özelliği yakında eklenecek.');
                    break;
                    
                case 'set-priority':
                    showToast('Öncelik belirleme özelliği yakında eklenecek.');
                    break;
                    
                case 'withdraw-submission':
                    selectedProductIds.forEach(id => {
                        const product = mockData.products.find(p => p.id === id);
                        if (product && product.status === 'submitted') {
                            product.status = 'draft';
                            product.submittedAt = null;
                        }
                    });
                    showToast(`${selectedCount} gönderim geri çekildi.`);
                    break;
                    
                case 'edit-submitted':
                    if (selectedProductIds.length > 0) {
                        navigateTo(`#products/detail/${selectedProductIds[0]}`);
                    }
                    break;
                    
                case 'export-submitted':
                    showToast(`${selectedCount} gönderilen ürün dışa aktarılıyor...`);
                    break;
                    
                case 'approve-submitted':
                    selectedProductIds.forEach(id => {
                        const product = mockData.products.find(p => p.id === id);
                        if (product && product.status === 'submitted') {
                            product.status = 'approved';
                            product.approvedAt = new Date().toISOString();
                        }
                    });
                    showToast(`${selectedCount} gönderilen ürün onaylandı.`);
                    break;
                    
                case 'reject-submitted':
                    selectedProductIds.forEach(id => {
                        const product = mockData.products.find(p => p.id === id);
                        if (product && product.status === 'submitted') {
                            product.status = 'rejected';
                            product.rejectedAt = new Date().toISOString();
                        }
                    });
                    showToast(`${selectedCount} gönderilen ürün reddedildi.`);
                    break;
                    
                case 'update-stock':
                    showToast('Stok güncelleme özelliği yakında eklenecek.');
                    break;
                    
                case 'update-price':
                    showToast('Fiyat güncelleme özelliği yakında eklenecek.');
                    break;
                    
                case 'request-price-update':
                    showToast('Fiyat güncelleme talebi özelliği yakında eklenecek.');
                    break;
                    
                case 'export-approved':
                    showToast(`${selectedCount} aktif ürün dışa aktarılıyor...`);
                    break;
                    
                case 'activate-products':
                    selectedProductIds.forEach(id => {
                        const product = mockData.products.find(p => p.id === id);
                        if (product) {
                            product.active = true;
                        }
                    });
                    showToast(`${selectedCount} ürün aktif edildi.`);
                    break;
                case 'deactivate-products':
                    selectedProductIds.forEach(id => {
                        const product = mockData.products.find(p => p.id === id);
                        if (product) {
                            product.active = false;
                        }
                    });
                    showToast(`${selectedCount} ürün pasif edildi.`);
                    break;
                    
                case 'update-stock-price':
                    showToast('Stok/Fiyat güncelleme özelliği yakında eklenecek.');
                    break;
                    
                case 'assign-supplier':
                    showToast('Tedarikçi atama özelliği yakında eklenecek.');
                    break;
                    
                case 'resubmit-rejected':
                    selectedProductIds.forEach(id => {
                        const product = mockData.products.find(p => p.id === id);
                        if (product && product.status === 'rejected') {
                            product.status = 'submitted';
                            product.submittedAt = new Date().toISOString();
                            product.rejectedAt = null;
                        }
                    });
                    showToast(`${selectedCount} reddedilen ürün tekrar gönderildi.`);
                    break;
                    
                case 'edit-rejected':
                    if (selectedProductIds.length > 0) {
                        navigateTo(`#products/detail/${selectedProductIds[0]}`);
                    }
                    break;
                    
                case 'delete-rejected':
                    if (confirm(`${selectedCount} reddedilen ürünü silmek istediğinizden emin misiniz?`)) {
                        mockData.products = mockData.products.filter(p => !selectedProductIds.includes(p.id));
                        showToast(`${selectedCount} reddedilen ürün silindi.`);
                    }
                    break;
                    
                case 'export-rejected':
                    showToast(`${selectedCount} reddedilen ürün dışa aktarılıyor...`);
                    break;
                case 'reapprove-rejected':
                    selectedProductIds.forEach(id => {
                        const product = mockData.products.find(p => p.id === id);
                        if (product && product.status === 'rejected') {
                            product.status = 'approved';
                            product.approvedAt = new Date().toISOString();
                            product.rejectedAt = null;
                        }
                    });
                    showToast(`${selectedCount} reddedilen ürün tekrar onaylandı.`);
                    break;
                    
                case 'approve-price-requests':
                    showToast(`${selectedCount} fiyat talebi onaylandı.`);
                    break;
                    
                case 'reject-price-requests':
                    showToast(`${selectedCount} fiyat talebi reddedildi.`);
                    break;
                    
                case 'export-price-requests':
                    showToast(`${selectedCount} fiyat talebi dışa aktarılıyor...`);
                    break;
                    
                case 'withdraw-request':
                    // Withdraw request for supplier (for yeni-urun-talepleri, urun-guncelleme, fiyat-stok-istekleri)
                    selectedProductIds.forEach(id => {
                        // Find and update the request
                        const request = mockData.requests?.find(r => r.productId === id && (r.status === 'submitted' || r.status === 'toBeRevised'));
                        if (request) {
                            request.status = 'withdrawn';
                            request.withdrawnAt = new Date().toISOString();
                        }
                        // Also update product status if applicable
                        const product = mockData.products.find(p => p.id === id);
                        if (product && product.status === 'draft' && product.supplierSubmission) {
                            product.supplierSubmission.status = 'withdrawn';
                        }
                    });
                    showToast(`${selectedCount} talep geri çekildi.`);
                    break;
                    
                case 'archive':
                    // Archive products for supplier (Aktif Ürünler tab)
                    const user = window.currentUser || {};
                    const supplierId = user.supplierId;
                    selectedProductIds.forEach(id => {
                        let supplierProduct = mockData.supplierProducts.find(sp => sp.productId === id && sp.supplierId === supplierId);
                        if (!supplierProduct) {
                            supplierProduct = {
                                productId: id,
                                supplierId: supplierId,
                                stock: 0,
                                price: 0,
                                isArchived: false,
                                isBanned: false
                            };
                            mockData.supplierProducts.push(supplierProduct);
                        }
                        supplierProduct.isArchived = true;
                    });
                    showToast(`${selectedCount} ürün arşivlendi.`);
                    break;
                    
                case 'unarchive':
                    // Unarchive products for supplier (Arşivlenenler tab)
                    const currentUser = window.currentUser || {};
                    const currentSupplierId = currentUser.supplierId;
                    selectedProductIds.forEach(id => {
                        const supplierProduct = mockData.supplierProducts.find(sp => sp.productId === id && sp.supplierId === currentSupplierId);
                        if (supplierProduct) {
                            supplierProduct.isArchived = false;
                        }
                    });
                    showToast(`${selectedCount} ürün arşivden çıkarıldı.`);
                    break;
                    
                case 'export-selected':
                default:
                    showToast(`${selectedCount} seçilen ürün dışa aktarılıyor...`);
                    break;
            }
            
            // Refresh the current view
            const currentHash = window.location.hash;
            if (currentHash.includes('#products/')) {
                handleRouteChange();
            }
        }
        // Supplier Product Update Functions
        function saveSupplierProductInfo() {
    const productId = getCurrentProductId();
    if (!productId) return;
    
    const user = window.currentUser || {};
    if (user.role !== 'supplier') return;
    
    // Get form values
    const productName = document.getElementById('supplierProductName')?.value;
    console.log('DEBUG: productName field:', document.getElementById('supplierProductName'), 'value:', productName);
    const productBrand = document.getElementById('supplierProductBrand')?.value;
    const productModel = document.getElementById('supplierProductModel')?.value;
    const productDescription = document.getElementById('supplierProductDescription')?.value;
    const productKeywords = document.getElementById('supplierProductKeywords')?.value;
    
    // Validate required fields
    if (!productName || !productName.trim()) {
        showToast('Ürün adı gereklidir.');
        return;
    }
    
    // Find the product
    const product = mockData.products.find(p => p.id == productId);
    if (!product) {
        showToast('Ürün bulunamadı.');
        return;
    }
    
    // Create product update request instead of directly updating product
    const supplierId = user.supplierId;
    if (!supplierId) {
        showToast('Tedarikçi bilgisi bulunamadı.');
        return;
    }
    
    // Collect product attributes from form
    const attributeInputs = document.querySelectorAll('.supplier-attr-input[data-attr-id]');
    const attributes = {};
    attributeInputs.forEach(input => {
        const attrId = input.getAttribute('data-attr-id');
        const value = input.value.trim();
        if (attrId) {
            attributes[attrId] = {
                value: value,
                status: 'pending'
            };
        }
    });
    
    // Prepare update data
    const updateData = {
        name: productName.trim(),
        brand: productBrand?.trim(),
        model: productModel?.trim(),
        description: productDescription?.trim(),
        keywords: productKeywords?.trim(),
        attributes: attributes
    };
    
    // Check if there's an existing toBeRevised request for this product
    const existingRequest = mockData.requests.find(r => 
        r.productId == productId && 
        r.supplierId == supplierId && 
        r.status === 'toBeRevised' &&
        (r.type === 'product_update' || r.type === 'product_create')
    );
    
    try {
        if (existingRequest) {
            // Update existing toBeRevised request with new data
            existingRequest.data = { ...existingRequest.data, ...updateData };
            existingRequest.submittedAt = new Date().toISOString();
            showToast('Talep başarıyla güncellendi! Tekrar göndermek için talep detay sayfasına gidin.');
        } else {
            // Create new product_update request
            const newRequest = createRequest('product_update', productId, supplierId, updateData);
            showToast('Ürün güncelleme talebi başarıyla gönderildi! Admin tarafından onaylanmayı beklemektedir.');
        }
        
        // Refresh the product detail view
        setTimeout(() => {
            const currentHash = window.location.hash;
            if (currentHash.includes('#products/detail/')) {
                handleRouteChange();
            }
        }, 1000);
    } catch (error) {
        console.error('Error submitting product update request:', error);
        showToast('Ürün güncelleme talebi gönderilirken hata oluştu: ' + error.message);
    }
}
function saveSupplierAttributes() {
    const productId = getCurrentProductId();
    if (!productId) return;
    
    const user = window.currentUser || {};
    if (user.role !== 'supplier') return;
    
    // Find the product
    const product = mockData.products.find(p => p.id == productId);
    if (!product) {
        showToast('Ürün bulunamadı.');
        return;
    }
    
    // Get all editable attribute inputs
    const attributeInputs = document.querySelectorAll('#product-tab-content input[type="text"], #product-tab-content input[type="number"]');
    const updatedAttributes = {};
    let hasChanges = false;
    
    attributeInputs.forEach(input => {
        const value = input.value.trim();
        if (value) {
            // Find the attribute ID from the input's context
            const attributeRow = input.closest('.grid');
            if (attributeRow) {
                const label = attributeRow.querySelector('label');
                if (label) {
                    const attributeName = label.textContent.trim();
                    // Find attribute by name
                    const attribute = mockData.attributes.find(attr => 
                        t(attr.label) === attributeName || attr.label.tr === attributeName
                    );
                    if (attribute) {
                        updatedAttributes[attribute.id] = { value: value };
                        hasChanges = true;
                    }
                }
            }
        }
    });
    
    if (!hasChanges) {
        showToast('Güncellenecek özellik bulunamadı.');
        return;
    }
    
    // Update product attributes
    if (!product.attributes) product.attributes = {};
    Object.assign(product.attributes, updatedAttributes);
    
    // Add to change log
    if (!product.changeLog) product.changeLog = [];
    product.changeLog.unshift({
        id: Date.now(),
        action: 'supplier_attribute_update',
        user: user.name,
        userRole: 'supplier',
        timestamp: new Date().toISOString(),
        changes: updatedAttributes,
        message: 'Tedarikçi tarafından ürün özellikleri güncellendi'
    });
    
    showToast('Ürün özellikleri başarıyla güncellendi!');
    
    // Refresh the attributes tab
    setTimeout(() => {
        renderProductTab('attributes', product);
    }, 1000);
}
function previewSupplierProduct() {
    const productId = getCurrentProductId();
    if (!productId) return;
    
    const user = window.currentUser || {};
    if (user.role !== 'supplier') return;
    
    // Get current form values
    const productName = document.getElementById('supplierProductName')?.value || '';
    const productBrand = document.getElementById('supplierProductBrand')?.value || '';
    const productModel = document.getElementById('supplierProductModel')?.value || '';
    const productDescription = document.getElementById('supplierProductDescription')?.value || '';
    const productKeywords = document.getElementById('supplierProductKeywords')?.value || '';
    
    // Create preview content
    const previewContent = `
        <div class="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <div class="text-center mb-6">
                <h2 class="text-2xl font-bold text-gray-900 mb-2">Ürün Önizlemesi</h2>
                <p class="text-gray-600">Güncellenmiş ürün bilgilerinizin nasıl görüneceği</p>
            </div>
            
            <div class="space-y-6">
                <div class="border-b pb-4">
                    <h3 class="text-lg font-semibold text-gray-900 mb-2">${productName || 'Ürün Adı'}</h3>
                    <div class="flex flex-wrap gap-2 text-sm text-gray-600">
                        ${productBrand ? `<span class="bg-green-100 text-green-800 px-2 py-1 rounded">${productBrand}</span>` : ''}
                        ${productModel ? `<span class="bg-purple-100 text-purple-800 px-2 py-1 rounded">${productModel}</span>` : ''}
                    </div>
                </div>
                

                
                ${productDescription ? `
                <div>
                    <h4 class="font-semibold text-gray-900 mb-2">Açıklama</h4>
                    <p class="text-gray-700 leading-relaxed">${productDescription}</p>
                </div>
                ` : ''}
                
                ${productKeywords ? `
                <div>
                    <h4 class="font-semibold text-gray-900 mb-2">Anahtar Kelimeler</h4>
                    <div class="flex flex-wrap gap-1">
                        ${productKeywords.split(',').map(keyword => 
                            `<span class="bg-gray-200 text-gray-700 px-2 py-1 rounded text-sm">${keyword.trim()}</span>`
                        ).join('')}
                    </div>
                </div>
                ` : ''}
            </div>
            
            <div class="mt-6 pt-4 border-t text-center">
                <button onclick="closeModal()" class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Kapat
                </button>
            </div>
        </div>
    `;
    
    showModal('Ürün Önizlemesi', previewContent, 'Kapat', closeModal);
}
function getCurrentProductId() {
    const hash = window.location.hash;
    const match = hash.match(/#products\/detail\/(\d+)/);
    return match ? parseInt(match[1]) : null;
}
// Supplier Product Detail Function
renderers['supplierProductDetail'] = (productId) => {
    const user = window.currentUser || {};
    if (user.role !== 'supplier') {
        showModal('Erişim Yok', '<p>Bu sayfa sadece tedarikçiler içindir.</p>', 'Kapat', closeModal);
        navigateTo('#products/aktif');
        return;
    }
    const product = mockData.products.find(p => p.id == productId);
    if (!product) {
        pageContent.innerHTML = '<div class="text-center p-10"><h2 class="text-2xl font-bold">Ürün Bulunamadı</h2><p class="text-gray-500">Aradığınız ürün bulunamadı.</p></div>';
        pageTitle.textContent = 'Ürün Bulunamadı';
        return;
    }
    // Check if supplier has access to this product
    const supplierId = user.supplierId;
    const hasAccess = mockData.supplierProducts.some(sp => sp.productId == productId && sp.supplierId == supplierId);
    
    if (!hasAccess) {
        showModal('Erişim Yok', '<p>Bu ürüne erişim yetkiniz bulunmuyor.</p>', 'Kapat', closeModal);
        navigateTo('#products/aktif');
        return;
    }
    pageTitle.textContent = `Ürün Detayı - ${t(product.name)}`;
    
    const category = mockData.categories.find(c => c.id === product.categoryId) || { name: { tr: 'Kategorisiz', en: 'Uncategorized' } };
    
    pageContent.innerHTML = `
        <div class="bg-white rounded-lg shadow-sm border">
            <!-- Product Header -->
            <div class="p-6 border-b border-gray-200">
                <div class="flex items-start justify-between">
                    <div class="flex items-start space-x-4">
                        <img src="${product.imageUrl}" alt="${t(product.name)}" class="w-20 h-20 object-cover rounded-lg border">
                        <div>
                            <h1 class="text-2xl font-bold text-gray-900">${t(product.name)}</h1>
                            <p class="text-gray-600 mt-1">${product.sku} • ${t(category.name)}</p>
                            <div class="flex items-center space-x-2 mt-2">
                                <span class="px-2 py-1 text-xs font-semibold rounded-full ${product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                                    ${product.status === 'active' ? 'Aktif' : 'Pasif'}
                                </span>
                                <span class="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                    Onaylandı
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="text-right flex flex-col items-end space-y-4">
                        ${(() => {
                            const supplierUser = window.currentUser || {};
                            const supplierId = supplierUser.supplierId;
                            const supplierProduct = mockData.supplierProducts.find(sp => sp.productId === product.id && sp.supplierId === supplierId);
                            const isArchived = product.isArchived || (supplierProduct?.isArchived);
                            if (isArchived) {
                                return `<button onclick="unarchiveSupplierProduct(${product.id})" class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium flex items-center space-x-2"><i class="fas fa-redo"></i><span>Aktifleştir</span></button>`;
                            } else {
                                return `<button onclick="archiveSupplierProduct(${product.id})" class="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 font-medium flex items-center space-x-2"><i class="fas fa-archive"></i><span>Arşivle</span></button>`;
                            }
                        })()}
                        <div>
                            <div class="text-sm text-gray-500">Son Güncelleme</div>
                            <div class="text-sm font-medium">${new Date(product.lastUpdated).toLocaleDateString('tr-TR')}</div>
                        </div>
                    </div>

                </div>
            </div>
            <!-- Tabs -->
            <div class="border-b border-gray-200">
                <nav class="flex space-x-8 px-6">
                    <button class="tab-button active py-4 px-1 border-b-2 border-blue-500 text-blue-600 font-medium" data-tab="general">
                        <i class="fas fa-info-circle mr-2"></i>Genel Bilgiler
                    </button>
                    <button class="tab-button py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium" data-tab="attributes">
                        <i class="fas fa-tags mr-2"></i>Özellikler
                    </button>
                    <button class="tab-button py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium" data-tab="images">
                        <i class="fas fa-images mr-2"></i>Görseller
                    </button>
                </nav>
            </div>
            <!-- Tab Content -->
            <div id="product-tab-content" class="p-6">
                <!-- Content will be loaded here -->
            </div>
        </div>
    `;
    // Initialize with general tab
    renderProductTab('general', product);
    // Add tab switching functionality
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.dataset.tab;
            
            // Update active tab
            document.querySelectorAll('.tab-button').forEach(btn => {
                btn.classList.remove('active', 'border-blue-500', 'text-blue-600');
                btn.classList.add('border-transparent', 'text-gray-500');
            });
            button.classList.add('active', 'border-blue-500', 'text-blue-600');
            button.classList.remove('border-transparent', 'text-gray-500');
            
            // Render tab content with form state preservation
            saveFormState(currentProductTab);
            renderProductTab(tabName, product);
            restoreFormState(tabName);
            currentProductTab = tabName;
        });
    });
    // Add event listeners for save buttons
    setTimeout(() => {
        const saveBtn = document.getElementById('saveSupplierProductInfo');
        if (saveBtn) {
            saveBtn.addEventListener('click', saveSupplierProductInfo);
        }
        
        const previewBtn = document.getElementById('previewSupplierProduct');
        if (previewBtn) {
            previewBtn.addEventListener('click', previewSupplierProduct);
        }
        
        const saveAttributesBtn = document.getElementById('saveSupplierAttributes');
        if (saveAttributesBtn) {
            saveAttributesBtn.addEventListener('click', saveSupplierAttributes);
        }
    }, 100);
};
// Render sidebar navigation based on user role
function renderNavigation() {
    const sidebarNav = document.getElementById('sidebar-nav');
    if (!sidebarNav) return;
    const user = window.currentUser || {};
    const isSupplier = user.role === 'supplier';
    let navigationHTML = '';
    if (isSupplier) {
        // Supplier navigation - removed "Aktif Ürünler" as it's redundant with "Ürünler"
        navigationHTML = `
            <div class="px-4 py-2">
                <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ana Menü</h3>
            </div>
            <a href="#dashboard" class="sidebar-link">
                <i class="fas fa-tachometer-alt"></i>
                <span>Dashboard</span>
            </a>
            <a href="#products/gonderilenler" class="sidebar-link">
                <i class="fas fa-box"></i>
                <span>Ürünler</span>
            </a>
            <a href="#supplierOrders" class="sidebar-link">
                <i class="fas fa-shopping-cart"></i>
                <span>Siparişler</span>
            </a>
            <a href="#returns" class="sidebar-link">
                <i class="fas fa-undo"></i>
                <span>İade İşlemleri</span>
            </a>
            <a href="#finance" class="sidebar-link">
                <i class="fas fa-chart-line"></i>
                <span>Finans</span>
            </a>
            
            <div class="px-4 py-2 mt-4">
                <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ayarlar</h3>
            </div>
            <a href="#supplierSettings" class="sidebar-link">
                <i class="fas fa-cog"></i>
                <span>Ayarlar</span>
            </a>
        `;
    } else {
        // Admin navigation
        navigationHTML = `
            <div class="px-4 py-2">
                <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ana Menü</h3>
            </div>
            <a href="#dashboard" class="sidebar-link">
                <i class="fas fa-tachometer-alt"></i>
                <span>Dashboard</span>
            </a>
            <a href="#products" class="sidebar-link">
                <i class="fas fa-box"></i>
                <span>Ürünler</span>
            </a>
            <a href="#orders" class="sidebar-link">
                <i class="fas fa-shopping-cart"></i>
                <span>Siparişler</span>
            </a>
            <a href="#returns" class="sidebar-link">
                <i class="fas fa-undo"></i>
                <span>İade İşlemleri</span>
            </a>
            <a href="#finance" class="sidebar-link">
                <i class="fas fa-chart-line"></i>
                <span>Finans</span>
            </a>
            <a href="#categories" class="sidebar-link">
                <i class="fas fa-tags"></i>
                <span>Kategoriler</span>
            </a>
            <!-- <a href="#channels" class="sidebar-link">
                <i class="fas fa-broadcast-tower"></i>
                <span>Kanallar</span>
            </a> --> <!-- Hidden -->
            <a href="#attributes" class="sidebar-link">
                <i class="fas fa-list"></i>
                <span>Özellikler</span>
            </a>
            
            <div class="px-4 py-2 mt-4">
                <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ayarlar</h3>
            </div>
            <div class="pl-4">
                <a href="#adminSuppliers" class="sidebar-link">
                    <i class="fas fa-handshake"></i>
                    <span>Tedarikçi Listesi</span>
                </a>
                <a href="#settings/users" class="sidebar-link">
                    <i class="fas fa-users"></i>
                    <span>Kullanıcı Yönetimi</span>
                </a>
                <a href="#settings/api-keys" class="sidebar-link">
                    <i class="fas fa-key"></i>
                    <span>API Anahtarları</span>
                </a>
#settings/commissions" class="sidebar-link">
                    <i class="fas fa-percentage"></i>
                    <span>Komisyon Yönetimi</span>
                </a>
            </div>
        `;
    }
    sidebarNav.innerHTML = navigationHTML;
    // Add click event listeners to navigation links
    sidebarNav.querySelectorAll('a.sidebar-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            if (href) {
                navigateTo(href);
            }
        });
    });
}
// User switching functionality
function switchUser(userId) {
    const user = window.availableUsers.find(u => u.id === userId);
    if (user) {
        window.currentUser = user;
        
        // Update header display
        updateHeaderUserInfo();
        
        // Re-render navigation
        renderNavigation();
        
        // Dispatch event for other components that might need to update
        document.dispatchEvent(new CustomEvent('userChanged', { detail: user }));
        
        // Close user dropdown
        document.getElementById('userDropdown').classList.add('hidden');
        
        // Navigate to appropriate dashboard
        if (user.role === 'supplier') {
            navigateTo('#products/aktif');
        } else {
            navigateTo('#dashboard');
        }
    }
}
function updateHeaderUserInfo() {
    const user = window.currentUser || {};
    
    // Update header username
    const headerUsername = document.querySelector('#userMenuBtn span');
    if (headerUsername) {
        headerUsername.textContent = user.name || 'User';
    }
    
    // Update dropdown user info
    const currentUserName = document.getElementById('currentUserName');
    const currentUserEmail = document.getElementById('currentUserEmail');
    
    if (currentUserName) {
        currentUserName.textContent = user.name || 'User';
    }
    
    if (currentUserEmail) {
        const email = user.role === 'supplier' ? 'supplier@example.com' : 'admin@Marka.com';
        currentUserEmail.textContent = email;
    }
}
function renderUserSwitcher() {
    const userSwitcher = document.getElementById('userSwitcher');
    if (!userSwitcher) return;
    
    const currentUserId = window.currentUser?.id;
    
    const userOptions = window.availableUsers.map(user => {
        const isActive = user.id === currentUserId;
        const roleIcon = user.role === 'supplier' ? 'fas fa-handshake' : 'fas fa-user-shield';
        
        return `
            <button class="user-switch-btn w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2 ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}" 
                    data-user-id="${user.id}" ${isActive ? 'disabled' : ''}>
                <i class="${roleIcon} w-4"></i>
                <span>${user.name}</span>
                ${isActive ? '<i class="fas fa-check ml-auto text-blue-600"></i>' : ''}
            </button>
        `;
    }).join('');
    
    userSwitcher.innerHTML = userOptions;
    
    // Add event listeners to user switch buttons
    userSwitcher.querySelectorAll('.user-switch-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const userId = btn.dataset.userId;
            if (userId && userId !== currentUserId) {
                switchUser(userId);
            }
        });
    });
}
// Add event listeners when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Render navigation on page load
    renderNavigation();
    
    // Render user switcher
    renderUserSwitcher();
    
    // Update header user info
    updateHeaderUserInfo();
    
    // Re-render navigation when user changes
    document.addEventListener('userChanged', renderNavigation);
    
    // Sidebar toggle functionality
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    
    // Track if sidebar is open to prevent conflicts
    let sidebarOpen = false;
    
    function openSidebar() {
        if (sidebarOpen) return; // Prevent multiple opens
        
        sidebar.classList.remove('-translate-x-full');
        sidebarOverlay.classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
        sidebarOpen = true;
    }
    
    function closeSidebar() {
        if (!sidebarOpen) return; // Prevent multiple closes
        
        sidebar.classList.add('-translate-x-full');
        sidebarOverlay.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
        sidebarOpen = false;
    }
    
    // Remove any existing event listeners first
    document.querySelectorAll('#toggleSidebar').forEach(btn => {
        btn.replaceWith(btn.cloneNode(true)); // Remove all event listeners
    });
    
    // Add event listeners to all toggle buttons
    document.querySelectorAll('#toggleSidebar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openSidebar();
        });
    });
    
    // Add event listener to close button
    const closeSidebarBtn = document.getElementById('closeSidebar');
    if (closeSidebarBtn) {
        closeSidebarBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeSidebar();
        });
    }
    
    // Add event listener to overlay
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeSidebar();
        });
    }
    
    // Close sidebar when clicking on navigation links
    const sidebarNav = document.getElementById('sidebar-nav');
    if (sidebarNav) {
        sidebarNav.addEventListener('click', (e) => {
            if (e.target.closest('a.sidebar-link')) {
                closeSidebar();
            }
        });
    }
    
    // User menu toggle functionality - removed duplicate event listener
    // The main event listener is already defined earlier in the script
    
    // These will be attached when the product detail page is rendered
    setTimeout(() => {
        const saveBtn = document.getElementById('saveSupplierProductInfo');
        if (saveBtn) {
            saveBtn.addEventListener('click', saveSupplierProductInfo);
        }
        
        const previewBtn = document.getElementById('previewSupplierProduct');
        if (previewBtn) {
            previewBtn.addEventListener('click', previewSupplierProduct);
        }
        
        const saveAttributesBtn = document.getElementById('saveSupplierAttributes');
        if (saveAttributesBtn) {
            saveAttributesBtn.addEventListener('click', saveSupplierAttributes);
        }
    }, 100);
});
// Mock data initialization
window.mockData = window.mockData || {};
window.mockData.suppliers = window.mockData.suppliers || [
    { id: 1, name: 'ModaTedarik', status: 'approved' }, 
    { id: 2, name: 'Ayakkabı A.Ş.', status: 'approved' },
    { id: 3, name: 'Başka Tedarikçi', status: 'approved' }
];
window.mockData.orders = window.mockData.orders || [
  { id: 'ORD-1001', supplierId: 1, customerId: 'CUST-001', date: '2025-09-15', status: 'hazırlanıyor', total: 3499.90,
    items: [
      { sku: '8683822429962-41', name: 'Kahverengi Deri Ayakkabı 41', qty: 1, total: 2999.90 },
      { sku: '8683822429962-Temizlik', name: 'Bakım Kiti', qty: 1, total: 500.00 }
    ],
    shippingAddress: { name: 'Ahmet Yılmaz', line1: 'Gül Sk. No:12', city: 'İstanbul', postalCode: '34000', country: 'TR' },
    payment: { method: 'Kredi Kartı', status: 'ödendi' },
    shipping: { carrier: 'Yurtiçi', tracking: 'YK123456', eta: '2025-09-20' },
    timeline: [
      { date: '2025-09-15T09:10:00', message: 'Sipariş alındı' },
      { date: '2025-09-15T12:30:00', message: 'Hazırlanıyor' }
    ],
    note: 'Hediye paketi istendi.'
  },
  { id: 'ORD-1002', supplierId: 2, customerId: 'CUST-002', date: '2025-09-16', status: 'kargolandı', total: 1299.00,
    items: [{ sku: '8683822429963', name: 'Mavi Keten Gömlek', qty: 1, total: 1299.00 }],
    shippingAddress: { name: 'Elif Demir', line1: 'Lale Cd. No:5', city: 'Ankara', postalCode: '06000', country: 'TR' },
    payment: { method: 'Havale/EFT', status: 'onay bekliyor' },
    shipping: { carrier: 'Aras', tracking: 'AR987654', eta: '2025-09-19' },
    timeline: [
      { date: '2025-09-16T10:00:00', message: 'Sipariş alındı' },
      { date: '2025-09-16T18:45:00', message: 'Kargolandı' }
    ]
  },
  { id: 'ORD-1003', supplierId: 1, date: '2025-09-17', status: 'tamamlandı', total: 2450.00,
    items: [
      { sku: '8683822429964', name: 'Siyah Deri Cüzdan', qty: 2, total: 1800.00 },
      { sku: '8683822429965', name: 'Deri Anahtarlık', qty: 1, total: 650.00 }
    ],
    shippingAddress: { name: 'Mehmet Kaya', line1: 'Atatürk Bulvarı No:45', city: 'İzmir', postalCode: '35000', country: 'TR' },
    payment: { method: 'Kredi Kartı', status: 'ödendi' },
    shipping: { carrier: 'MNG', tracking: 'MNG456789', eta: '2025-09-18' },
    timeline: [
      { date: '2025-09-17T14:20:00', message: 'Sipariş alındı' },
      { date: '2025-09-17T16:30:00', message: 'Hazırlanıyor' },
      { date: '2025-09-17T18:15:00', message: 'Kargolandı' },
      { date: '2025-09-18T11:30:00', message: 'Teslim edildi' }
    ],
    note: 'Hızlı teslimat istendi.'
  },
  { id: 'ORD-1004', supplierId: 1, date: '2025-09-18', status: 'teslim edildi', total: 899.50,
    items: [{ sku: '8683822429966', name: 'Gri Pamuklu Tişört', qty: 3, total: 899.50 }],
    shippingAddress: { name: 'Ayşe Özkan', line1: 'Çiçek Sk. No:23', city: 'Bursa', postalCode: '16000', country: 'TR' },
    payment: { method: 'Kapıda Ödeme', status: 'beklemede' },
    shipping: { carrier: 'PTT', tracking: 'PTT789123', eta: '2025-09-22' },
    timeline: [
      { date: '2025-09-18T09:45:00', message: 'Sipariş alındı' }
    ]
  },
  { id: 'ORD-1005', supplierId: 2, date: '2025-09-19', status: 'iptal edildi', total: 2100.00,
    items: [{ sku: '8683822429967', name: 'Kırmızı Deri Çanta', qty: 1, total: 2100.00 }],
    shippingAddress: { name: 'Can Yıldız', line1: 'Gülbahar Cd. No:78', city: 'Antalya', postalCode: '07000', country: 'TR' },
    payment: { method: 'Kredi Kartı', status: 'iade edildi' },
    shipping: { carrier: null, tracking: null, eta: null },
    timeline: [
      { date: '2025-09-19T13:15:00', message: 'Sipariş alındı' },
      { date: '2025-09-19T15:30:00', message: 'Müşteri tarafından iptal edildi' }
    ],
    note: 'Müşteri fikrini değiştirdi.'
  },
  { id: 'ORD-1006', supplierId: 1, date: '2025-09-20', status: 'hazırlanıyor', total: 1850.75,
    items: [
      { sku: '8683822429968', name: 'Kahverengi Deri Kemer', qty: 1, total: 750.00 },
      { sku: '8683822429969', name: 'Siyah Deri Eldiven', qty: 2, total: 1100.75 }
    ],
    shippingAddress: { name: 'Fatma Şen', line1: 'Orhangazi Cd. No:12', city: 'Kocaeli', postalCode: '41000', country: 'TR' },
    payment: { method: 'Havale/EFT', status: 'ödendi' },
    shipping: { carrier: 'Yurtiçi', tracking: 'YK456123', eta: '2025-09-23' },
    timeline: [
      { date: '2025-09-20T11:30:00', message: 'Sipariş alındı' },
      { date: '2025-09-20T14:45:00', message: 'Hazırlanıyor' }
    ]
  },
  { id: 'ORD-1007', supplierId: 1, date: '2025-09-21', status: 'kargoda', total: 675.00,
    items: [{ sku: '8683822429970', name: 'Mavi Denim Pantolon', qty: 1, total: 675.00 }],
    shippingAddress: { name: 'Ali Veli', line1: 'Cumhuriyet Cd. No:89', city: 'Trabzon', postalCode: '61000', country: 'TR' },
    payment: { method: 'Kredi Kartı', status: 'ödendi' },
    shipping: { carrier: 'Aras', tracking: 'AR321654', eta: '2025-09-24' },
    timeline: [
      { date: '2025-09-21T08:15:00', message: 'Sipariş alındı' },
      { date: '2025-09-21T10:30:00', message: 'Hazırlanıyor' },
      { date: '2025-09-21T16:20:00', message: 'Kargolandı' }
    ]
  }
];
 
 // --- SUPPLIER UPDATE REQUEST ACTIONS ---
 function cancelUpdateRequest(productId) {
     const product = mockData.products.find(p => p.id === productId);
     if (!product || !product.supplierSubmission) {
         showToast('Ürün veya güncelleme verisi bulunamadı.', 'error');
         return;
     }
     
     showModal(
         'Güncelleme İsteğini İptal Et',
         '<p>Bu güncelleme isteğini iptal etmek istediğinizden emin misiniz?</p><p class="text-sm text-gray-600 mt-2">Bu işlem geri alınamaz.</p>',
         'İptal Et',
         () => {
             // Remove the supplier submission
             delete product.supplierSubmission;
             
             showToast('Güncelleme isteği başarıyla iptal edildi.', 'success');
             closeModal();
             
             // Navigate back to the products list
             navigateTo('#products/urun-guncelleme');
         }
     );
 }
 
 function editUpdateRequest(productId) {
     const product = mockData.products.find(p => p.id === productId);
     if (!product || !product.supplierSubmission) {
         showToast('Ürün veya güncelleme verisi bulunamadı.', 'error');
         return;
     }
     
     showToast('Güncelleme düzenleme özelliği yakında eklenecek.', 'info');
     // TODO: Implement edit update request functionality
 }