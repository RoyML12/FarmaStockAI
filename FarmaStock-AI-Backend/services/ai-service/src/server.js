const express=require('express');const {pool,asyncRoute,errorHandler,internal,requireRole,waitDb,httpError}=require('@farmastock/shared');
const scan=require('./application/use-cases/ScanExpiryRisk');const {answer}=require('./adapters/output/LangChainAdapter');const {indexRisks}=require('./adapters/output/QdrantAdapter');
const {indexSemanticRisks}=require('./adapters/output/SemanticQdrantAdapter');
const app=express();app.use(express.json());
app.get('/health',asyncRoute(async(req,res)=>{await pool.query('SELECT 1');res.json({status:'ok',service:'ai'})}));
app.get('/risks',asyncRoute(async(req,res)=>{const [[run]]=await pool.query('SELECT id FROM forecast_runs ORDER BY id DESC LIMIT 1');if(!run)return res.json([]);const [rows]=await pool.query("SELECT * FROM expiry_risks WHERE run_id=? ORDER BY FIELD(risk_level,'high','medium','low'),days_remaining LIMIT 300",[run.id]);res.json(rows)}));
async function performScan(){const r=await scan();await indexRisks(r.risks);void indexSemanticRisks(r.risks).catch(e => console.warn('[RAG] Error de indexación:', e.message));return r}
app.post('/scan',requireRole('admin','pharmacist'),asyncRoute(async(req,res)=>res.json(await performScan())));
app.post('/internal/scan',internal,asyncRoute(async(req,res)=>res.json(await performScan())));
app.post('/ask',asyncRoute(async(req,res)=>{const question=String(req.body.question||'').trim();if(!question||question.length>500)throw httpError(400,'Pregunta obligatoria, máximo 500 caracteres');const [[run]]=await pool.query('SELECT id FROM forecast_runs ORDER BY id DESC LIMIT 1');let risks=[];if(run)[risks]=await pool.query('SELECT * FROM expiry_risks WHERE run_id=? ORDER BY days_remaining LIMIT 30',[run.id]);res.json(await answer(question,risks))}));
app.use(errorHandler);waitDb().then(()=>app.listen(3007,'0.0.0.0',()=>console.log('ai-service :3007'))).catch(e=>{console.error(e);process.exit(1)});
