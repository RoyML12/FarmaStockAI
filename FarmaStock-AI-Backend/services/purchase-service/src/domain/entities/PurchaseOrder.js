const {httpError}=require('@farmastock/shared');
function validateOrder(supplier_id,items){if(!Number.isInteger(Number(supplier_id))||Number(supplier_id)<1||!Array.isArray(items)||!items.length||items.length>50)throw httpError(400,'Proveedor e ítems obligatorios');for(const x of items){if(!Number.isInteger(Number(x.product_id))||Number(x.product_id)<1||!Number.isInteger(Number(x.quantity))||Number(x.quantity)<1||!Number.isFinite(Number(x.unit_cost))||Number(x.unit_cost)<0)throw httpError(400,'Ítem de compra inválido')}}
module.exports={validateOrder};
