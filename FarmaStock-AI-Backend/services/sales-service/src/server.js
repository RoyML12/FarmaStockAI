const express=require('express');const {pool,asyncRoute,errorHandler,internal,requestUser,httpError,waitDb}=require('@farmastock/shared');
const createSale=require('./application/use-cases/CreateSale');const app=express();app.use(express.json());
app.get('/health',asyncRoute(async(req,res)=>{await pool.query('SELECT 1');res.json({status:'ok',service:'sales'})}));
app.get('/',asyncRoute(async(req,res)=>{const [rows]=await pool.query('SELECT * FROM sales ORDER BY id DESC LIMIT 150');res.json(rows)}));
app.post('/',asyncRoute(async(req,res)=>res.status(201).json(await createSale(req.body,requestUser(req).id))));
app.get('/:id/items',asyncRoute(async(req,res)=>{const [rows]=await pool.query('SELECT * FROM sale_items WHERE sale_id=?',[req.params.id]);res.json(rows)}));
app.get('/internal/summary',internal,asyncRoute(async(req,res)=>{const days=Math.min(365,Math.max(1,Number(req.query.days)||30));const [rows]=await pool.query("SELECT si.product_id,SUM(si.quantity) AS quantity FROM sale_items si JOIN sales s ON s.id=si.sale_id WHERE s.status='completed' AND s.created_at >= DATE_SUB(NOW(),INTERVAL ? DAY) GROUP BY si.product_id",[days]);res.json(rows)}));
app.use(errorHandler);waitDb().then(()=>app.listen(3005,'0.0.0.0',()=>console.log('sales-service :3005'))).catch(e=>{console.error(e);process.exit(1)});
