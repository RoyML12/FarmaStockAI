const {validateProduct}=require('../../domain/entities/Product');
const {httpError}=require('@farmastock/shared');
module.exports=(repo)=>async(input,id)=>{const data=validateProduct(input,!id);
if(id){const old=await repo.byId(id);if(!old)throw httpError(404,'Producto inexistente');const merged={...old,...data,sku:old.sku};await repo.update(id,merged);return repo.byId(id)}
const newId=await repo.create(data);return repo.byId(newId)};
