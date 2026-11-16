const express=require('express');
const {pool,asyncRoute,errorHandler,internal,requireRole,requestUser,httpError,jsonFetch,serviceUrl,publish,waitDb}=require('@farmastock/shared');
const inventoryRepo=require('./adapters/output/MySQLStockRepository');
const reserveStock=require('./application/use-cases/ReserveStock')(inventoryRepo);const completeReservation=require('./application/use-cases/CompleteReservation')(inventoryRepo);
const app=express();app.use(express.json({limit:'1mb'}));
app.get('/health',asyncRoute(async(req,res)=>{await pool.query('SELECT 1');res.json({status:'ok',service:'inventory'})}));
async function productExists(id){return jsonFetch(serviceUrl('catalog')+'/internal/products/'+id)}
async function notifyStock(product_id){try{const [p,rows]=await Promise.all([productExists(product_id),pool.query('SELECT COALESCE(SUM(quantity),0) AS quantity,COALESCE(SUM(reserved),0) AS reserved FROM batches WHERE product_id=? AND expiry_date>=CURDATE()',[product_id])]);const s=rows[0][0];if(s.quantity-s.reserved<=p.reorder_level)await publish('inventory.stock.low',{product_id,product_name:p.name,available:s.quantity-s.reserved,reorder_level:p.reorder_level})}catch(e){console.warn('No se pudo calcular stock bajo',e.message)}}
app.get('/warehouses',asyncRoute(async(req,res)=>{const [r]=await pool.query('SELECT * FROM warehouses');res.json(r)}));
app.get('/batches',asyncRoute(async(req,res)=>{const [r]=await pool.query('SELECT *,GREATEST(quantity-reserved,0) AS available FROM batches ORDER BY expiry_date ASC LIMIT 400');res.json(r)}));
app.get('/stock',asyncRoute(async(req,res)=>{const [r]=await pool.query('SELECT product_id,SUM(quantity) AS quantity,SUM(reserved) AS reserved,SUM(CASE WHEN expiry_date>=CURDATE() THEN quantity-reserved ELSE 0 END) AS available FROM batches GROUP BY product_id ORDER BY product_id');res.json(r)}));
app.get('/internal/batches',internal,asyncRoute(async(req,res)=>{const [r]=await pool.query('SELECT *,GREATEST(quantity-reserved,0) AS available FROM batches WHERE quantity>0 ORDER BY expiry_date');res.json(r)}));
async function receiveBatch(data,actor){const product_id=Number(data.product_id),quantity=Number(data.quantity),unit_cost=Number(data.unit_cost||0),lot_number=String(data.lot_number||'').trim(),expiry_date=String(data.expiry_date||''),reference_key=data.reference_key?String(data.reference_key):null;
if(!Number.isInteger(product_id)||product_id<1||!Number.isInteger(quantity)||quantity<1||!lot_number||!/^\d{4}-\d{2}-\d{2}$/.test(expiry_date)||!Number.isFinite(unit_cost)||unit_cost<0)throw httpError(400,'Lote, producto, cantidad, costo o fecha incorrectos');
await productExists(product_id);
const db=await pool.getConnection();try{await db.beginTransaction();if(reference_key){const [[old]]=await db.query('SELECT id FROM stock_movements WHERE reference_key=?',[reference_key]);if(old){await db.commit();return {replayed:true,reference_key}}}
await db.query('INSERT INTO batches(product_id,warehouse_id,lot_number,expiry_date,quantity,unit_cost) VALUES (?,1,?,?,?,?) ON DUPLICATE KEY UPDATE quantity=quantity+VALUES(quantity)',[product_id,lot_number,expiry_date,quantity,unit_cost]);
const [[batch]]=await db.query('SELECT id FROM batches WHERE product_id=? AND warehouse_id=1 AND lot_number=?',[product_id,lot_number]);await db.query('INSERT INTO stock_movements(batch_id,product_id,movement_type,quantity,reference_key,actor_user_id) VALUES (?,?,?,?,?,?)',[batch.id,product_id,'entry',quantity,reference_key,actor||null]);await db.commit();await publish('inventory.batch.received',{product_id,batch_id:batch.id,quantity,expiry_date});return {batch_id:batch.id,quantity,replayed:false}}catch(e){await db.rollback();throw e}finally{db.release()}}
app.post('/batches',requireRole('admin','pharmacist'),asyncRoute(async(req,res)=>res.status(201).json(await receiveBatch(req.body,requestUser(req).id))));
app.post('/internal/batches/receive',internal,asyncRoute(async(req,res)=>res.json(await receiveBatch(req.body,null))));
app.get('/movements',asyncRoute(async(req,res)=>{const [r]=await pool.query('SELECT * FROM stock_movements ORDER BY id DESC LIMIT 250');res.json(r)}));
app.post('/internal/reservations',internal,asyncRoute(async(req,res)=>res.status(201).json(await reserveStock(req.body.reference_key,req.body.items))));
app.post('/internal/reservations/:key/confirm',internal,asyncRoute(async(req,res)=>{const r=await completeReservation(req.params.key,'confirmed');await publish('inventory.stock.changed',{reference_key:req.params.key,items:r.changed});for(const p of new Set(r.changed.map(x=>x.product_id)))await notifyStock(p);res.json(r)}));
app.post('/internal/reservations/:key/release',internal,asyncRoute(async(req,res)=>res.json(await completeReservation(req.params.key,'released'))));
app.use(errorHandler);waitDb().then(()=>app.listen(3003,'0.0.0.0',()=>console.log('inventory-service :3003'))).catch(e=>{console.error(e);process.exit(1)});
