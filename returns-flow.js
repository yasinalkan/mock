/* Extends the existing return screens; Figma references: 14014:149557, 10993:72255. */
(function () {
  const M = window.ReturnModel;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money = value => Number(value || 0).toLocaleString('tr-TR', { style:'currency', currency:'TRY' });
  const user = () => window.currentUser || {};
  const find = id => mockData.returns.find(r => String(r.id) === String(id));
  window.returnSafeText = esc;
  const drafts = new Map();
  // Legacy rejected demo records also need the new return-shipment step.
  mockData.returns.filter(r => r.status === 'rejected' && M.waiting(r).length).forEach(r => M.recalculate(r));
  const asset = name => `assets/returns/${name}.svg`;
  let dialog, restoreFocus;
  function closeDialog() { if (dialog) { dialog.close(); dialog.remove(); dialog = null; restoreFocus?.focus(); } }
  function openDialog(title, body, footer, small = false, subtitle = '') {
    closeDialog();
    restoreFocus = document.activeElement;
    dialog = document.createElement('dialog');
    dialog.className = `rf-dialog ${small ? 'rf-small' : ''}`;
    dialog.setAttribute('aria-labelledby', 'rf-title');
    dialog.innerHTML = `<div class="rf-shell"><header class="rf-head"><div><h2 id="rf-title">${title}</h2>${subtitle ? `<p class="rf-sub">${subtitle}</p>` : ''}</div><button class="rf-close" aria-label="Kapat"><img src="${asset(small ? 'decision-imgCloseLine' : 'ship-imgCloseLine')}" alt=""></button><img class="rf-header-divider" src="${asset(small ? 'decision-imgContentDivider11' : 'ship-imgContentDivider11')}" alt=""></header>${body}<footer class="rf-footer">${footer}</footer>${small ? '' : `<img class="rf-divider" src="${asset('ship-imgContentDivider13')}" alt="">`}</div>`;
    document.body.append(dialog);
    dialog.querySelector('.rf-close').onclick = closeDialog;
    dialog.addEventListener('cancel', e => { e.preventDefault(); closeDialog(); });
    dialog.querySelector('[data-close]')?.addEventListener('click', closeDialog);
    dialog.showModal();
    return dialog;
  }
  function error(message) { const visibleModal = document.querySelector('#modal-template:not(.hidden)'); const el = dialog?.querySelector('#rf-error') || visibleModal?.querySelector('#rf-error') || document.querySelector('#pageContent #rf-error'); if (el) { el.textContent = message; el.scrollIntoView({block:'nearest'}); } }
  function getDraft(record) {
    if (!drafts.has(record.id)) drafts.set(record.id, record.items.map(i => ({status:i.itemStatus || 'pending',reason:i.rejectionReason || ''})));
    return drafts.get(record.id);
  }
  function editable(record) { return M.canAccess(record, user()) && record.status === 'pending_approval' && !record.decisionsSubmittedAt; }
  window.changeReturnItemStatus = function (id, index, status) {
    const record = find(id);
    if (!record || !editable(record) || !record.items[index]) return;
    const draft = getDraft(record);
    if (status !== 'rejected') { draft[index] = {status,reason:''}; renderers.returnDetail(id); return; }
    const body = `<label for="rf-reason" class="block text-sm font-medium">Red nedeni</label><textarea id="rf-reason" class="rf-input" rows="3" maxlength="500">${esc(draft[index].reason)}</textarea><p id="rf-error" class="rf-error" role="alert"></p>`;
    showModal('Ürünü Reddet', body, 'Kararı Kaydet', () => {
      const reason = document.getElementById('rf-reason').value.trim();
      if (!reason) { error('Lütfen red nedenini belirtin.'); return false; }
      draft[index] = {status:'rejected',reason}; renderers.returnDetail(id);
    });
    // A cancelled reason dialog must not leave an unsaved red decision in the select.
    pageContent.querySelectorAll('select[onchange*="changeReturnItemStatus"]').forEach((select, i) => { select.value = draft[i].status; });
  };
  const oldDetail = renderers.returnDetail;
  renderers.returnDetail = function (id) {
    const record = find(id);
    if (record && !M.canAccess(record, user())) {
      pageTitle.textContent = 'İade Detayı';
      pageContent.innerHTML = '<p class="p-6">Bu iade için yetkiniz bulunmuyor.</p>'; return;
    }
    oldDetail(id);
    if (!record) return;
    const draft = getDraft(record);
    pageContent.querySelectorAll('select[onchange*="changeReturnItemStatus"]').forEach((select, index) => {
      select.disabled = !editable(record);
      select.setAttribute('aria-label', `${record.items[index].name} için iade kararı`);
      select.value = draft[index]?.status || record.items[index].itemStatus;
      if (draft[index]?.reason) select.parentElement.insertAdjacentHTML('afterend', `<p class="mt-2 text-xs text-gray-500">Red nedeni: ${esc(draft[index].reason)}</p>`);
    });
    pageContent.querySelectorAll('button[onclick^="approveReturn("],button[onclick^="rejectReturn("]').forEach(b => b.remove());
    const panel = document.createElement('section');
    panel.className = 'rf-shipment-summary';
    if (editable(record)) {
      panel.innerHTML = `<h3 class="font-medium">İade Kararları</h3><p class="rf-help">Her ürün için karar seçin. Kararlar, gönderdiğinizde kaydedilir.</p><div class="rf-actions"><button class="rf-btn" id="rf-approve-all">Tümünü Onayla</button><button class="rf-btn rf-btn-primary" id="rf-submit-decisions">Kararları Gönder</button></div><p id="rf-error" class="rf-error" role="alert"></p>`;
    } else if (record.status === 'awaiting_return_shipment') {
      panel.innerHTML = `<h3 class="font-medium">İade Geri Gönderim Bekliyor</h3><p>${M.waiting(record).length} ürün müşteriye geri gönderilmeyi bekliyor.</p><button class="rf-btn rf-btn-primary" id="rf-create-shipment">Gönderi Oluştur</button>`;
    } else panel.innerHTML = '<h3 class="font-medium">İade Kararları</h3><p class="rf-help">Bu kaydın değerlendirmesi tamamlandı.</p>';
    for (const s of record.shipments || []) panel.innerHTML += `<div class="rf-note"><strong>Geri gönderim oluşturuldu · ${s.itemIndices.length} ürün</strong><p>${esc(s.carrier)} · Kargo Takip Numarası: <code>${esc(s.tracking)}</code></p><p class="rf-help">${s.itemIndices.map(i => esc(record.items[i].name)).join(', ')}</p></div>`;
    pageContent.querySelector(':scope > div').append(panel);
    document.getElementById('rf-approve-all')?.addEventListener('click', () => { drafts.set(id, record.items.map(() => ({status:'approved',reason:''}))); renderers.returnDetail(id); });
    document.getElementById('rf-submit-decisions')?.addEventListener('click', () => {
      try { M.decide(record, getDraft(record), user()); drafts.delete(id); renderers.returnDetail(id); decisionResult(record); } catch(e) { error(e.message); }
    });
    document.getElementById('rf-create-shipment')?.addEventListener('click', () => shipmentDialog(id));
  };
  // Route all entry points through the staged decision UI.
  window.showReturnDetailModal = id => navigateTo(`#returnDetail/${id}`);
  window.approveReturn = id => { const r = find(id); if (r && editable(r)) { drafts.set(id,r.items.map(() => ({status:'approved',reason:''}))); navigateTo(`#returnDetail/${id}`); renderers.returnDetail(id); } };
  window.rejectReturn = id => navigateTo(`#returnDetail/${id}`);
  window.updateReturnStatusFromItems = M.recalculate;
  const oldStatus = getReturnStatusInfo;
  window.getReturnStatusInfo = status => status === 'awaiting_return_shipment' ? {text:'Geri Gönderim Bekliyor',class:'bg-orange-100 text-orange-800'} : oldStatus(status);
  const oldReturns = renderers.returns;
  renderers.returns = function (tab = 'all') {
    oldReturns(tab);
    const count = mockData.returns.filter(r => M.canAccess(r,user()) && r.status === 'awaiting_return_shipment').length;
    const nav = document.getElementById('returns-tabs');
    nav.style.flexWrap = 'wrap';
    nav.insertAdjacentHTML('beforeend', `<a href="#returns/awaiting_return_shipment" class="tab-button ${tab === 'awaiting_return_shipment' ? 'active' : 'text-gray-500'} font-medium py-4">Geri Gönderim <span class="ml-2 px-2 py-1 text-xs bg-orange-100 rounded-full">${count}</span></a>`);
  };
  function decisionResult(record) {
    const rejected = M.waiting(record).length;
    const d = openDialog('İade Kararları', `<div class="rf-success"><span class="rf-success-icon"><img src="${asset('decision-imgCheckLine')}" alt=""></span><h3>İade kararları başarıyla gönderildi</h3><p>${rejected} ürün reddedildi, ${record.items.filter(i => i.itemStatus === 'approved').length} ürün onaylandı. Kararlar işleme alındı.</p></div>`, `<span class="rf-spacer"></span><button class="rf-btn" data-close>${rejected ? 'Daha Sonra' : 'Kapat'}</button>${rejected ? '<button class="rf-btn rf-btn-primary" id="rf-next-shipment">Gönderi Oluştur</button>' : ''}`, true);
    d.querySelector('#rf-next-shipment')?.addEventListener('click', () => shipmentDialog(record.id));
  }
  function productPhoto(item, record) {
    const source = item.image || item.imageUrl || record.images?.[0];
    return source ? `<img class="rf-product-photo" src="${esc(source)}" alt="${esc(item.name)}">` : '<span class="rf-product-photo rf-photo-empty" aria-label="Ürün görseli bulunmuyor">—</span>';
  }
  function shipmentDialog(id) {
    const record = find(id);
    if (!record || !M.canAccess(record,user()) || record.status !== 'awaiting_return_shipment') return;
    const available = M.waiting(record);
    const order = (mockData.orders || []).find(o => String(o.id) === String(record.orderId));
    const address = record.shippingAddress || order?.shippingAddress || {};
    const products = available.map(({item,index}) => `<div class="rf-product"><div class="rf-product-main"><input type="checkbox" checked class="rf-check rf-ship-item" value="${index}" aria-label="${esc(item.name)} gönderime dahil et">${productPhoto(item,record)}<div class="rf-product-text"><p><span class="rf-muted">${esc(item.name)}</span> <strong>${money(item.price * item.quantity)}</strong></p><small>SKU: ${esc(item.sku)} · Adet: ${item.quantity}${item.orderItemId ? ` · Order Item: ${esc(item.orderItemId)}` : ''}</small></div><span class="rf-badge"><img src="${asset('ship-imgDot')}" alt="">Reddedildi</span></div><div class="rf-note rf-note-divider"><img class="rf-divider" src="${asset('ship-imgContentDivider12')}" alt=""><span class="rf-muted">Not: </span>${esc(item.rejectionReason || '—')}</div></div>`).join('');
    const d = openDialog(`İade Geri Gönderimi <span class="rf-count">${available.length} Ürün</span>`, `<div class="rf-body"><section class="rf-section"><div class="rf-section-title"><div><h3>Gönderilecek Ürünler</h3><p>Reddedilen ürünler</p></div><label class="rf-check-label"><input id="rf-select-all" class="rf-check" type="checkbox" checked>Tümünü Seç</label></div><div class="rf-banner"><img src="${asset('ship-imgInformationFill')}" alt=""><span>Reddedilen ürünleri müşteriye geri göndermek için aşağıdan seçim yapın.</span><button aria-label="Bilgilendirmeyi kapat" id="rf-hide-info"><img src="${asset('ship-imgCloseLine1')}" alt=""></button></div>${products}</section><section class="rf-section"><div class="rf-section-title"><div><h3>Müşteri ve Kargo Bilgileri</h3><p>Siparişteki teslimat bilgileri</p></div></div><dl class="rf-grid"><div><dt>Adı Soyadı</dt><dd>${esc(address.name || record.customerName)}</dd></div><div><dt>Telefon</dt><dd>${esc(record.customerPhone || order?.customer?.phone || '—')}</dd></div><div><dt>Teslimat Adresi</dt><dd>${esc([address.line1,address.line2,address.city,address.postalCode].filter(Boolean).join(', ') || 'Siparişte adres bilgisi bulunmuyor.')}</dd></div></dl><div class="rf-grid mt-4"><label>Kargo Firması<input id="rf-carrier" class="rf-input" maxlength="80" value="${esc(order?.shipping?.carrier || '')}" required></label><label>Kargo Takip Numarası<input id="rf-tracking" class="rf-input" maxlength="100" required placeholder="Takip numarasını girin"></label></div><p id="rf-error" class="rf-error" role="alert"></p></section></div>`, `<span class="rf-spacer" id="rf-selected-count">${available.length}/${available.length}</span><button class="rf-btn" data-close>Daha Sonra</button><button class="rf-btn rf-btn-primary" id="rf-send">Gönder</button>`, false, `${esc(id)} · Reddedilen ürünleri müşteriye geri gönderebilirsiniz.`);
    const boxes = [...d.querySelectorAll('.rf-ship-item')];
    const all = d.querySelector('#rf-select-all');
    const update = () => { const count = boxes.filter(b=>b.checked).length; all.checked = count === boxes.length; all.indeterminate = count > 0 && count < boxes.length; d.querySelector('#rf-selected-count').textContent = `${count}/${boxes.length}`; };
    all.onchange = () => { boxes.forEach(b=>{b.checked=all.checked;}); update(); };
    boxes.forEach(b=>{b.onchange=update;});
    d.querySelector('#rf-hide-info').onclick = () => d.querySelector('.rf-banner').remove();
    d.querySelector('#rf-send').onclick = () => {
      try {
        const shipment = M.ship(record,boxes.filter(b=>b.checked).map(b=>Number(b.value)),d.querySelector('#rf-carrier').value,d.querySelector('#rf-tracking').value,user());
        renderers.returnDetail(id);
        openDialog('İade Geri Gönderim Oluşturuldu', `<div class="rf-success"><span class="rf-success-icon"><img src="${asset('decision-imgCheckLine')}" alt=""></span><h3>${shipment.itemIndices.length} ürün için gönderim oluşturuldu</h3><p>${esc(shipment.carrier)}</p><p>Kargo Takip Numarası</p><strong>${esc(shipment.tracking)}</strong>${M.waiting(record).length ? `<p class="rf-help mt-4">${M.waiting(record).length} ürün geri gönderim bekliyor.</p>` : ''}</div>`, '<span class="rf-spacer"></span><button class="rf-btn rf-btn-primary" data-close>Kapat</button>',true);
      } catch(e) { error(e.message); }
    };
  }
  window.showCreateReturnModal = function () {
    if (user().role !== 'admin') return;
    let selectedOrder;
    showModal('İade Talebi Oluştur', `<label for="rf-order-search" class="block text-sm font-medium">Sipariş ara</label><input id="rf-order-search" class="rf-input" placeholder="Sipariş numarası veya müşteri adı"><label for="rf-order" class="block text-sm font-medium mt-4">Sipariş</label><select id="rf-order" class="rf-input"><option value="">Sipariş seçin</option></select><div id="rf-order-info" class="rf-help mt-3"></div><div id="rf-order-items" class="rf-order-items"></div><label for="rf-create-reason" class="block text-sm font-medium mt-4">İade sebebi</label><select id="rf-create-reason" class="rf-input"><option value="">Sebep seçin</option><option value="defective_product">Hasarlı Ürün</option><option value="wrong_size">Yanlış Beden</option><option value="not_as_described">Açıklamaya Uygun Değil</option><option value="changed_mind">Fikrim Değişti</option></select><label for="rf-description" class="block text-sm font-medium mt-4">Açıklama (isteğe bağlı)</label><textarea id="rf-description" class="rf-input" rows="2" maxlength="1000"></textarea><p id="rf-total" class="mt-4 font-medium">Seçili ürün tutarı: ${money(0)}</p><p id="rf-error" class="rf-error" role="alert"></p>`, 'İade Talebi Oluştur', () => {
      try {
        const selections = [...document.querySelectorAll('.rf-create-check:checked')].map(b=>({index:Number(b.value),quantity:Number(document.getElementById(`rf-qty-${b.value}`).value)}));
        const record = M.create(selectedOrder,selections,document.getElementById('rf-create-reason').value,document.getElementById('rf-description').value,mockData.returns,user());
        navigateTo(`#returnDetail/${record.id}`); showToast('İade talebi oluşturuldu.');
      } catch(e) { error(e.message); return false; }
    });
    const select = document.getElementById('rf-order');
    const orders = mockData.orders || [];
    function list(query='') {
      const matches = orders.filter(o=>`${o.id} ${o.customerName || o.shippingAddress?.name || ''}`.toLocaleLowerCase('tr').includes(query.toLocaleLowerCase('tr')));
      select.innerHTML = '<option value="">Sipariş seçin</option>' + matches.map(o=>`<option value="${esc(o.id)}">${esc(o.id)} · ${esc(o.customerName || o.shippingAddress?.name || '')} · ${esc(o.status)}</option>`).join('');
      selectedOrder=undefined; document.getElementById('rf-order-items').innerHTML=''; document.getElementById('rf-order-info').textContent=matches.length ? '' : 'Aramanıza uygun sipariş bulunamadı.'; updateTotal();
    }
    function updateTotal() { const total=[...document.querySelectorAll('.rf-create-check:checked')].reduce((sum,b)=>sum+M.unitPrice(selectedOrder.items[Number(b.value)])*Number(document.getElementById(`rf-qty-${b.value}`).value),0); document.getElementById('rf-total').textContent=`Seçili ürün tutarı: ${money(total)}`; }
    list();
    document.getElementById('rf-order-search').oninput=e=>list(e.target.value);
    select.onchange=()=>{
      selectedOrder=orders.find(o=>String(o.id)===select.value);
      document.getElementById('rf-order-info').textContent=selectedOrder ? 'Yalnızca teslim edilmiş ve daha önce iade talebi açılmamış adetler seçilebilir.' : '';
      document.getElementById('rf-order-items').innerHTML=(selectedOrder?.items || []).map((item,index)=>{
        const max=M.available(selectedOrder,index,mockData.returns);
        return `<label class="rf-order-item"><input class="rf-create-check" type="checkbox" value="${index}" ${max ? '' : 'disabled'}><span>${esc(item.name)}<br><small class="rf-help">${esc(item.sku)} · ${money(M.unitPrice(item))}${max ? ` · Uygun adet: ${max}` : ' · İade edilemez'}</small></span><input id="rf-qty-${index}" type="number" min="1" max="${max}" value="${max ? 1 : 0}" ${max ? '' : 'disabled'} class="rf-input" aria-label="${esc(item.name)} iade adedi"></label>`;
      }).join('');
      document.querySelectorAll('.rf-create-check,#rf-order-items input[type=number]').forEach(i=>{i.onchange=updateTotal;i.oninput=updateTotal;}); updateTotal();
    };
  };
})();
