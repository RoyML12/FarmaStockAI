const express=require('express');
const bcrypt=require('bcryptjs');
const {pool,asyncRoute,errorHandler,waitDb,requireRole,httpError,signToken}=require('@farmastock/shared');
const app=express();app.use(express.json({limit:'200kb'}));app.disable('x-powered-by');
app.get('/health',asyncRoute(async(req,res)=>{await pool.query('SELECT 1');res.json({status:'ok',service:'auth'})}));
const cleanEmail=e=>String(e||'').trim().toLowerCase();
const userRepo=require('./adapters/output/MySQLUserRepository');
const authenticate=require('./application/use-cases/AuthenticateUser')(userRepo);
app.post('/login',asyncRoute(async(req,res)=>res.json(await authenticate(req.body))));
app.get('/users',requireRole('admin'),asyncRoute(async(req,res)=>{const [rows]=await pool.query('SELECT id,full_name,email,role,is_active,created_at FROM users ORDER BY id DESC');res.json(rows)}));
app.post('/users',requireRole('admin'),asyncRoute(async(req,res)=>{
 const {full_name,password,role='staff'}=req.body,email=cleanEmail(req.body.email);
 if(!full_name||!email.includes('@')||String(password||'').length<8||!['admin','pharmacist','staff'].includes(role))throw httpError(400,'Nombre, correo válido, rol y contraseña de 8+ caracteres son obligatorios');
 const hash=await bcrypt.hash(password,12);
 try{const [r]=await pool.query('INSERT INTO users(full_name,email,password_hash,role) VALUES (?,?,?,?)',[String(full_name).trim(),email,hash,role]);res.status(201).json({id:r.insertId,full_name,email,role})}catch(e){if(e.code==='ER_DUP_ENTRY')throw httpError(409,'Correo ya registrado');throw e}
}));
app.use(errorHandler);
(async()=>{await waitDb();const [[r]]=await pool.query('SELECT COUNT(*) AS n FROM users');if(!r.n){const email=cleanEmail(process.env.SEED_ADMIN_EMAIL||'admin@farmastock.local'),password=process.env.SEED_ADMIN_PASSWORD;if(!password||password.length<8)throw Error('SEED_ADMIN_PASSWORD debe tener 8+ caracteres');await pool.query('INSERT INTO users(full_name,email,password_hash,role) VALUES (?,?,?,?)',['Administrador demo',email,await bcrypt.hash(password,12),'admin']);console.log('Usuario administrador demo creado:',email)}app.listen(3001,'0.0.0.0',()=>console.log('auth-service :3001'))})().catch(e=>{console.error(e);process.exit(1)});
