/* Return lifecycle shared by the prototype UI and regression checks. */
(function (root) {
  const fail = message => { throw new Error(message); };
  const canAccess = (record, user) => user?.role === 'admin' ||
    (user?.role === 'supplier' && String(record.supplierId) === String(user.supplierId));
  const assertAccess = (record, user) => canAccess(record, user) || fail('Bu iade için yetkiniz bulunmuyor.');
  const waiting = record => record.items.map((item, index) => ({ item, index }))
    .filter(({ item }) => item.itemStatus === 'rejected' && !item.returnShipmentId);
  function recalculate(record) {
    record.refundAmount = record.items.reduce((sum, item) => sum + (item.itemStatus === 'approved' ? item.price * item.quantity : 0), 0);
    if (record.items.some(item => !item.itemStatus || item.itemStatus === 'pending')) {
      record.status = 'pending_approval';
      delete record.completedAt;
    } else if (waiting(record).length) {
      record.status = 'awaiting_return_shipment';
      delete record.completedAt;
    } else {
      record.status = 'completed';
      record.completedAt = record.completedAt || new Date().toISOString();
    }
    return record;
  }
  function log(record, user, message) {
    (record.timeline ||= []).push({ date: new Date().toISOString(), status: record.status,
      message, user: user.name || user.role, userRole: user.role });
  }
  function decide(record, decisions, user) {
    assertAccess(record, user);
    if (record.decisionsSubmittedAt || record.status !== 'pending_approval') fail('Bu iadenin kararları zaten gönderilmiş.');
    if (decisions.length !== record.items.length || !decisions.length) fail('Her ürün için bir karar seçin.');
    decisions.forEach(d => {
      if (!['approved', 'rejected'].includes(d.status)) fail('Her ürün için bir karar seçin.');
      if (d.status === 'rejected' && !String(d.reason || '').trim()) fail('Reddedilen ürünler için neden belirtin.');
    });
    record.items.forEach((item, index) => {
      item.itemStatus = decisions[index].status;
      item.rejectionReason = decisions[index].status === 'rejected' ? decisions[index].reason.trim() : '';
    });
    record.decisionsSubmittedAt = new Date().toISOString();
    recalculate(record);
    log(record, user, `İade kararları gönderildi: ${record.items.filter(i => i.itemStatus === 'approved').length} ürün onaylandı, ${waiting(record).length} ürün reddedildi.`);
  }
  function ship(record, indices, carrier, tracking, user) {
    assertAccess(record, user);
    if (record.status !== 'awaiting_return_shipment') fail('Bu iade geri gönderim beklemiyor.');
    const unique = [...new Set(indices)];
    if (!unique.length) fail('Gönderim için en az bir ürün seçin.');
    if (!String(carrier || '').trim() || !String(tracking || '').trim()) fail('Kargo firması ve takip numarası zorunludur.');
    const available = new Set(waiting(record).map(x => x.index));
    if (unique.some(index => !available.has(index))) fail('Seçilen ürün zaten gönderilmiş veya gönderime uygun değil.');
    const shipment = { id: `RS-${Date.now()}-${(record.shipments || []).length + 1}`, itemIndices: unique,
      carrier: carrier.trim(), tracking: tracking.trim(), createdAt: new Date().toISOString() };
    (record.shipments ||= []).push(shipment);
    unique.forEach(index => { record.items[index].returnShipmentId = shipment.id; });
    recalculate(record);
    log(record, user, `${unique.length} ürün için geri gönderim oluşturuldu. ${shipment.carrier} · ${shipment.tracking}`);
    return shipment;
  }
  const quantity = item => Number(item.quantity ?? item.qty ?? 1);
  const itemKey = (item, index) => String(item.orderItemId ?? item.id ?? `${item.sku}:${index}`);
  const unitPrice = item => Number(item.price ?? item.unitPrice ?? (Number(item.total || 0) / quantity(item)));
  function available(order, index, records) {
    const item = order.items[index];
    if (!item || item.returnable === false || !['teslim edildi', 'tamamlandı', 'delivered', 'completed'].includes(order.status)) return 0;
    const used = records.filter(r => String(r.orderId) === String(order.id)).reduce((sum, r) => sum + r.items.reduce((n, it) =>
      n + ((it.orderItemId ? String(it.orderItemId) === itemKey(item, index) : it.sku === item.sku) ? Number(it.quantity || 1) : 0), 0), 0);
    return Math.max(0, quantity(item) - used);
  }
  function create(order, selections, reason, description, records, user) {
    if (user?.role !== 'admin') fail('İade talebini yalnızca yönetici oluşturabilir.');
    if (!order || order.supplierId == null) fail('Geçerli bir sipariş seçin.');
    if (!selections.length) fail('En az bir ürün seçin.');
    if (!['defective_product', 'wrong_size', 'not_as_described', 'changed_mind'].includes(reason)) fail('İade sebebini seçin.');
    if (new Set(selections.map(s => s.index)).size !== selections.length) fail('Aynı ürün birden fazla seçilemez.');
    const items = selections.map(s => {
      const max = available(order, s.index, records);
      if (!Number.isInteger(s.quantity) || s.quantity < 1 || s.quantity > max) fail('İade adedi uygun miktarı aşıyor veya ürün iade edilemez.');
      const item = order.items[s.index];
      const price = unitPrice(item);
      if (!Number.isFinite(price) || price < 0) fail('Ürün fiyatı geçersiz.');
      return { ...item, orderItemId: itemKey(item, s.index), quantity: s.quantity, price, reason, itemStatus: 'pending' };
    });
    const record = { id: `RET-${Date.now()}-${records.length + 1}`, orderId: order.id,
      supplierId: order.supplierId, customerId: order.customerId,
      customerName: order.customerName || order.customer?.name || order.shippingAddress?.name || '',
      customerEmail: order.customerEmail || order.customer?.email || '',
      shippingAddress: { ...order.shippingAddress }, customerPhone: order.customerPhone || order.customer?.phone || '',
      status: 'pending_approval', reason, description: String(description || '').trim(),
      requestedAt: new Date().toISOString(), refundAmount: items.reduce((s, i) => s + i.price * i.quantity, 0),
      refundMethod: 'original_payment', items, images: [], timeline: [], shipments: [], notes: '' };
    log(record, user, 'Sipariş ürünlerinden iade talebi oluşturuldu.');
    records.push(record);
    return record;
  }
  root.ReturnModel = { canAccess, waiting, recalculate, decide, ship, available, create, quantity, unitPrice };
})(typeof window === 'undefined' ? globalThis : window);
