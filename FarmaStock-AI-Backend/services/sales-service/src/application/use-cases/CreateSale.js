const {validateSale}=require('../../domain/entities/Sale');
const {pool,jsonFetch,serviceUrl,publish,httpError}=require('@farmastock/shared');
module.exports=async (data,actor_id)=>{
const {client_request_id,byProduct}=validateSale(data);
let [[sale]]=await pool.query('SELECT * FROM sales WHERE client_request_id=?',[client_request_id]);
if(sale&&sale.status==='completed')return {...sale,replayed:true};
const reference_key=`sale:${client_request_id}`;
if(!sale){const products=[];for(const [id,quantity] of byProduct){const p=await jsonFetch(serviceUrl('catalog')+'/internal/products/'+id);products.push({product_id:id,product_name:p.name,quantity,unit_price:Number(p.price)})}
 const total=Number(products.reduce((sum,p)=>sum+p.quantity*p.unit_price,0).toFixed(2));const db=await pool.getConnection();try{await db.beginTransaction();const [r]=await db.query('INSERT INTO sales(client_request_id,total,status,created_by) VALUES (?,?,?,?)',[client_request_id,total,'pending',actor_id]);for(const p of products)await db.query('INSERT INTO sale_items(sale_id,product_id,product_name,quantity,unit_price) VALUES (?,?,?,?,?)',[r.insertId,p.product_id,p.product_name,p.quantity,p.unit_price]);await db.commit()}catch(e){await db.rollback();if(e.code!=='ER_DUP_ENTRY')throw e}finally{db.release()}[[sale]]=await pool.query('SELECT * FROM sales WHERE client_request_id=?',[client_request_id]);}
const [stored]=await pool.query('SELECT product_id,quantity FROM sale_items WHERE sale_id=?',[sale.id]);
try{await jsonFetch(serviceUrl('inventory')+'/internal/reservations',{method:'POST',body:JSON.stringify({reference_key,items:stored})});await jsonFetch(serviceUrl('inventory')+'/internal/reservations/'+encodeURIComponent(reference_key)+'/confirm',{method:'POST',body:'{}'});await pool.query("UPDATE sales SET status='completed' WHERE id=?",[sale.id]);await publish('sale.completed',{sale_id:sale.id,total:sale.total,items:stored,dedupe_key:`sale.completed:${sale.id}`});return {id:sale.id,total:sale.total,status:'completed'}}catch(e){
 try{await jsonFetch(serviceUrl('inventory')+'/internal/reservations/'+encodeURIComponent(reference_key)+'/release',{method:'POST',body:'{}'})}catch(_){}
 if(e.status===409||e.status===400)await pool.query("UPDATE sales SET status='failed' WHERE id=?",[sale.id]);throw e}
};
