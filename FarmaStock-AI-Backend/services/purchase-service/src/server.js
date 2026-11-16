const {validateOrder}=require('./domain/entities/PurchaseOrder');
const receiveOrder=require('./application/use-cases/ReceivePurchaseOrder');
const express=require('express');const {pool,asyncRoute,errorHandler,internal,requireRole,requestUser,httpError,jsonFetch,serviceUrl,publish,waitDb}=require('@farmastock/shared');
const app=express();app.use(express.json());
app.get('/health',asyncRoute(async(req,res)=>{await pool.query('SELECT 1');res.json({status:'ok',service:'purchase'})}));
app.get('/suppliers',asyncRoute(async(req,res)=>{const [rows]=await pool.query('SELECT * FROM suppliers ORDER BY id DESC');res.json(rows)}));
app.post('/suppliers',requireRole('admin','pharmacist'),asyncRoute(async(req,res)=>{if(!String(req.body.name||'').trim())throw httpError(400,'Nombre obligatorio');const [r]=await pool.query('INSERT INTO suppliers(name,phone,email) VALUES (?,?,?)',[req.body.name.trim(),req.body.phone||null,req.body.email||null]);res.status(201).json({id:r.insertId,...req.body})}));
app.get('/orders',asyncRoute(async(req,res)=>{const [orders]=await pool.query('SELECT o.*,s.name AS supplier_name FROM purchase_orders o JOIN suppliers s ON s.id=o.supplier_id ORDER BY o.id DESC LIMIT 200');res.json(orders)}));
app.get('/orders/:id',asyncRoute(async(req,res)=>{const [[o]]=await pool.query('SELECT * FROM purchase_orders WHERE id=?',[req.params.id]);if(!o)throw httpError(404,'Orden inexistente');const [items]=await pool.query('SELECT * FROM purchase_order_items WHERE order_id=?',[o.id]);res.json({...o,items})}));
app.post('/orders',requireRole('admin','pharmacist'),asyncRoute(async(req,res)=>{const supplier_id=Number(req.body.supplier_id),items=req.body.items;
validateOrder(supplier_id,items);const [[supplier]]=await pool.query('SELECT id FROM suppliers WHERE id=?',[supplier_id]);if(!supplier)throw httpError(404,'Proveedor inexistente');
for(const x of items){await jsonFetch(serviceUrl('catalog')+'/internal/products/'+x.product_id)}
const db=await pool.getConnection();try{await db.beginTransaction();const [r]=await db.query('INSERT INTO purchase_orders(supplier_id,created_by) VALUES (?,?)',[supplier_id,requestUser(req).id]);for(const x of items)await db.query('INSERT INTO purchase_order_items(order_id,product_id,quantity,unit_cost,lot_number,expiry_date) VALUES (?,?,?,?,?,?)',[r.insertId,Number(x.product_id),Number(x.quantity),Number(x.unit_cost),x.lot_number||null,x.expiry_date||null]);await db.commit();await publish('purchase.created',{order_id:r.insertId});res.status(201).json({id:r.insertId,status:'pending'})}catch(e){await db.rollback();throw e}finally{db.release()}
}));
app.post('/orders/:id/receive',requireRole('admin','pharmacist'),asyncRoute(async(req,res)=>res.json(await receiveOrder(Number(req.params.id)))));
app.use(errorHandler);waitDb().then(()=>app.listen(3004,'0.0.0.0',()=>console.log('purchase-service :3004'))).catch(e=>{console.error(e);process.exit(1)});
