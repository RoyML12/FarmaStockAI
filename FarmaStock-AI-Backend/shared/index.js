const mysql = require('mysql2/promise');
const amqp = require('amqplib');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');

const pool = mysql.createPool({host:process.env.DB_HOST || 'mysql',port:Number(process.env.DB_PORT||3306),user:process.env.DB_USER,password:process.env.DB_PASSWORD,database:process.env.DB_NAME,waitForConnections:true,connectionLimit:10,decimalNumbers:true,dateStrings:true});
function fail(res,code,message){return res.status(code).json({error:message});}
const asyncRoute=fn=>(req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next);
function errorHandler(err,req,res,next){ console.error(`[${process.env.SERVICE_NAME||'service'}]`,err);if(res.headersSent)return next(err);return fail(res,err.status||500,err.status?err.message:'Error interno del servidor'); }
function internal(req,res,next){if(!process.env.INTERNAL_KEY||req.get('x-internal-key')!==process.env.INTERNAL_KEY)return fail(res,403,'Acceso interno denegado');next();}
function requireRole(...roles){return (req,res,next)=>{const role=req.get('x-user-role');if(!role||!roles.includes(role))return fail(res,403,'Permisos insuficientes');next();};}
function requestUser(req){return {id:Number(req.get('x-user-id')||0),role:req.get('x-user-role')||'unknown'};}
function httpError(status,message){const e=new Error(message);e.status=status;return e;}
async function jsonFetch(url,options={}){const r=await fetch(url,{...options,signal:AbortSignal.timeout(10000),headers:{'Content-Type':'application/json','x-internal-key':process.env.INTERNAL_KEY,...(options.headers||{})}});let body=await r.text();try{body=JSON.parse(body)}catch(_){}if(!r.ok){throw httpError(r.status,typeof body==='object'&&body?.error?body.error:`Servicio remoto: ${r.status}`)}return body;}
function serviceUrl(name){return process.env[`${name.toUpperCase()}_URL`] || `http://${name}-service:${({auth:3001,catalog:3002,inventory:3003,purchase:3004,sales:3005,notification:3006,ai:3007})[name]}`;}
let channel=null;let connecting=null;
async function getChannel(){if(channel)return channel;if(connecting)return connecting;connecting=(async()=>{let connection=await amqp.connect(process.env.RABBITMQ_URL||'amqp://guest:guest@rabbitmq:5672');connection.on('close',()=>{channel=null});connection.on('error',()=>{channel=null});channel=await connection.createChannel();await channel.assertExchange('farmastock.events','topic',{durable:true});return channel})();try{return await connecting}finally{connecting=null}}
async function publish(type,payload){const message={event_id:randomUUID(),type,payload,occurred_at:new Date().toISOString()};try{const ch=await getChannel();ch.publish('farmastock.events',type,Buffer.from(JSON.stringify(message)),{persistent:true,contentType:'application/json',messageId:message.event_id});return true}catch(err){console.warn('No se pudo publicar evento:',type,err.message);return false}}
async function subscribe(queue,bindings,handler){let stopped=false;const boot=async()=>{while(!stopped){try{const ch=await getChannel();await ch.assertQueue(queue,{durable:true,arguments:{'x-dead-letter-exchange':'farmastock.dead'}});for(const key of bindings)await ch.bindQueue(queue,'farmastock.events',key);await ch.prefetch(10);ch.consume(queue,async msg=>{if(!msg)return;try{const event=JSON.parse(msg.content.toString());await handler(event);ch.ack(msg)}catch(e){console.error('Error en consumidor:',e);try{ch.nack(msg,false,false)}catch(_){}}});return}catch(e){console.log('RabbitMQ no disponible; reintentando:',e.message);await new Promise(r=>setTimeout(r,5000))}}};await boot();return ()=>{stopped=true};}
async function waitDb(){for(let i=0;i<40;i++){try{await pool.query('SELECT 1');return}catch(e){console.log('Esperando MySQL:',e.code||e.message);await new Promise(r=>setTimeout(r,3000))}}throw new Error('MySQL no está disponible');}
function signToken(user){return jwt.sign({sub:String(user.id),role:user.role,email:user.email},process.env.JWT_SECRET,{expiresIn:'8h',issuer:'farmastock-ai'});}
module.exports={pool,fail,asyncRoute,errorHandler,internal,requireRole,requestUser,httpError,jsonFetch,serviceUrl,publish,subscribe,waitDb,signToken};
