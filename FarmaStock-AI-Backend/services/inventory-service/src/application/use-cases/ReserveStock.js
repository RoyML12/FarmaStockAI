const {httpError}=require('@farmastock/shared');
module.exports=(repository)=>async(reference_key,items)=>{if(!reference_key)throw httpError(400,'Referencia de reserva obligatoria');return repository.reserveStock(reference_key,items)};
