const {calculateRisk}=require('../../domain/services/riskCalculator');
const {pool,jsonFetch,serviceUrl,publish}=require('@farmastock/shared');
module.exports=async()=>{
const [products,batches,sales]=await Promise.all([
 jsonFetch(serviceUrl('catalog')+'/products',{headers:{'x-user-role':'admin'}}),
 jsonFetch(serviceUrl('inventory')+'/internal/batches'),
 jsonFetch(serviceUrl('sales')+'/internal/summary?days=30')
]);
const names=new Map(products.map(x=>[Number(x.id),x.name]));const demand=new Map(sales.map(x=>[Number(x.product_id),Number(x.quantity)/30]));
const [result]=await pool.query('INSERT INTO forecast_runs(products_scanned) VALUES (?)',[products.length]);const today=new Date();today.setUTCHours(0,0,0,0);let entries=[];
for(const b of batches){const expiry=new Date(String(b.expiry_date).slice(0,10)+'T00:00:00Z');const days_remaining=Math.round((expiry-today)/86400000);const available=Number(b.quantity)-Number(b.reserved);if(available<=0)continue;
const avg_daily_demand=demand.get(Number(b.product_id))||0;
// Simplificación: no asigna demanda compartida entre múltiples lotes del mismo producto.
const {estimated_leftover,risk_level}=calculateRisk({quantity:available,days_remaining,avg_daily_demand});
const x={run_id:result.insertId,product_id:Number(b.product_id),product_name:names.get(Number(b.product_id))||'Producto #'+b.product_id,batch_id:Number(b.id),lot_number:b.lot_number,expiry_date:String(b.expiry_date).slice(0,10),days_remaining,quantity:available,avg_daily_demand,estimated_leftover,risk_level};
await pool.query('INSERT INTO expiry_risks SET ?',[x]);entries.push(x);
if(risk_level==='high'&&estimated_leftover>0)await publish('inventory.expiry.risk',{...x,dedupe_key:`expiry:${x.batch_id}:${today.toISOString().slice(0,10)}`});
}
await publish('prediction.generated',{run_id:result.insertId,products_scanned:products.length,risks:entries.length});return {run_id:result.insertId,products_scanned:products.length,batches_scanned:entries.length,high_risk:entries.filter(x=>x.risk_level==='high').length,risks:entries};
};
