const {httpError}=require('@farmastock/shared');
function validateSale(data){const client_request_id=String(data.client_request_id||'').trim(),items=data.items;
 if(!client_request_id||client_request_id.length>100||!Array.isArray(items)||!items.length||items.length>50)throw httpError(400,'Identificador de solicitud e ítems obligatorios');
 const byProduct=new Map();for(const x of items){const id=Number(x.product_id),qty=Number(x.quantity);if(!Number.isInteger(id)||id<1||!Number.isInteger(qty)||qty<1)throw httpError(400,'Cantidad o producto incorrectos');byProduct.set(id,(byProduct.get(id)||0)+qty)}
 return {client_request_id,byProduct};
}
module.exports={validateSale};
