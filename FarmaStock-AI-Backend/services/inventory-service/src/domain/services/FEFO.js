// First Expired, First Out: asigna primero lotes vigentes con vencimiento más cercano.
function allocateFEFO(batches,requested){let remaining=requested;const allocations=[];
for(const b of [...batches].sort((a,b)=>String(a.expiry_date).localeCompare(String(b.expiry_date))||a.id-b.id)){
 if(!remaining)break;const available=Math.max(0,Number(b.quantity)-Number(b.reserved));const q=Math.min(remaining,available);if(q>0){allocations.push({batch_id:b.id,quantity:q});remaining-=q}
}
return {allocations,remaining};
}
module.exports={allocateFEFO};
