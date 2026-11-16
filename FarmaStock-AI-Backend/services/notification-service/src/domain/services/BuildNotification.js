function fromEvent(event){const p=event.payload||{};let title='',message='',severity='info';
 switch(event.type){
 case 'inventory.stock.low':title='Stock bajo';message=`${p.product_name||'Producto '+p.product_id}: quedan ${p.available} unidades (mínimo ${p.reorder_level}).`;severity='warning';break;
 case 'inventory.expiry.risk':title='Riesgo de caducidad';message=`${p.product_name}: lote ${p.lot_number}, ${p.days_remaining} días restantes y ${p.estimated_leftover} unidades estimadas en riesgo.`;severity='critical';break;
 case 'purchase.received':title='Compra recibida';message=`Se recibió la orden de compra #${p.order_id}.`;break;
 case 'sale.completed':title='Venta registrada';message=`Venta #${p.sale_id} por $${p.total} MXN.`;break;
 default:return null;
 }
 return {title,message,severity,event_id:p.dedupe_key||event.event_id,event_type:event.type,payload:JSON.stringify(p)};
}
module.exports={fromEvent};
