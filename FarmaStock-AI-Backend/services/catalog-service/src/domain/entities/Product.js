const {httpError}=require('@farmastock/shared');
function validateProduct(input,creating){const price=Number(input.price),reorder_level=Number(input.reorder_level??10);
 if(!String(input.name||'').trim()||(creating&&!String(input.sku||'').trim())||!Number.isFinite(price)||price<0||!Number.isInteger(reorder_level)||reorder_level<0)throw httpError(400,'Nombre, SKU, precio válido y mínimo de existencias son obligatorios');
 if(input.category_id!==null&&input.category_id!==undefined&&input.category_id!==''&&!Number.isInteger(Number(input.category_id)))throw httpError(400,'Categoría inválida');
 return {...input,name:String(input.name).trim(),sku:String(input.sku||'').trim(),price,reorder_level,is_active:input.is_active!==false};
}
module.exports={validateProduct};
