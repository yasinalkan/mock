const {test} = require('node:test');
const assert = require('node:assert/strict');
require('./returns-model.js');
const M = global.ReturnModel;
const admin = {role:'admin',name:'Admin'};
const record = () => ({id:'R1',supplierId:1,status:'pending_approval',items:[{price:10,quantity:2,itemStatus:'pending'},{price:30,quantity:1,itemStatus:'pending'},{price:5,quantity:1,itemStatus:'pending'}],timeline:[]});
const decisions = [{status:'approved'},{status:'rejected',reason:'Kullanılmış'},{status:'rejected',reason:'Eksik parça'}];
test('mixed decisions keep rejected products pending shipment, partial shipments do not complete the return',()=>{
 const r=record(); M.decide(r,decisions,admin); assert.equal(r.status,'awaiting_return_shipment'); assert.equal(r.refundAmount,20); assert.equal(r.completedAt,undefined);
 M.ship(r,[1],'Kargo','T1',admin); assert.equal(r.status,'awaiting_return_shipment'); assert.equal(M.waiting(r).length,1);
 M.ship(r,[2],'Kargo','T2',admin); assert.equal(r.status,'completed'); assert.ok(r.completedAt); assert.equal(r.shipments.length,2); assert.equal(r.timeline.length,3);
});
test('incomplete decisions and missing reasons are rejected atomically',()=>{
 const r=record(), before=JSON.stringify(r);
 assert.throws(()=>M.decide(r,[{status:'approved'}],admin));
 assert.throws(()=>M.decide(r,[{status:'approved'},{status:'rejected'},{status:'approved'}],admin));
 assert.equal(JSON.stringify(r),before);
});
test('empty selection, approved items, duplicate shipping, missing tracking and unauthorized supplier are blocked',()=>{
 const r=record(); M.decide(r,decisions,admin);
 assert.throws(()=>M.ship(r,[],'K','T',admin)); assert.throws(()=>M.ship(r,[0],'K','T',admin));
 assert.throws(()=>M.ship(r,[1],'K',' ',admin)); assert.throws(()=>M.ship(r,[1],'K','T',{role:'supplier',supplierId:2}));
 assert.equal(r.shipments,undefined);
 M.ship(r,[1],'K','T',admin); assert.throws(()=>M.ship(r,[1],'K','T',admin)); assert.equal(r.shipments.length,1);
 assert.throws(()=>M.decide(r,decisions,admin));
});
test('all-approved decisions complete once and preserve refund totals',()=>{
 const r=record(); M.decide(r,r.items.map(()=>({status:'approved'})),admin); assert.equal(r.status,'completed'); assert.equal(r.refundAmount,55);
 assert.throws(()=>M.decide(r,decisions,admin)); assert.equal(r.timeline.length,1);
});
test('supplier ownership is enforced for decisions',()=>{
 const r=record(); assert.throws(()=>M.decide(r,decisions,{role:'supplier',supplierId:2}));
 M.decide(r,decisions,{role:'supplier',supplierId:1}); assert.equal(r.status,'awaiting_return_shipment');
});
const order=()=>({id:'O1',supplierId:2,status:'teslim edildi',shippingAddress:{name:'Demo'},items:[{id:'I1',sku:'S1',name:'A',qty:3,total:90},{id:'I2',sku:'S2',name:'B',qty:1,total:20,returnable:false}]});
test('creation uses real order lines, unit prices and supplier, and reserves quantities against duplicate returns',()=>{
 const records=[],o=order(); const r=M.create(o,[{index:0,quantity:2}],'wrong_size','',records,admin);
 assert.equal(r.supplierId,2); assert.equal(r.items[0].sku,'S1'); assert.equal(r.items[0].orderItemId,'I1'); assert.equal(r.items[0].price,30); assert.equal(r.refundAmount,60);
 assert.equal(M.available(o,0,records),1); assert.equal(M.available(o,1,records),0);
 assert.throws(()=>M.create(o,[{index:0,quantity:2}],'wrong_size','',records,admin)); assert.equal(records.length,1);
});
test('creation blocks non-delivered, ineligible, zero/fractional/negative counts and suppliers',()=>{
 const o=order(), records=[];
 for(const quantity of [0,-1,1.5,4]) assert.throws(()=>M.create(o,[{index:0,quantity}],'wrong_size','',records,admin));
 assert.throws(()=>M.create(o,[{index:1,quantity:1}],'wrong_size','',records,admin));
 assert.throws(()=>M.create(o,[{index:0,quantity:1}],'wrong_size','',records,{role:'supplier',supplierId:2}));
 o.status='kargolandı'; assert.throws(()=>M.create(o,[{index:0,quantity:1}],'wrong_size','',records,admin)); assert.equal(records.length,0);
});
