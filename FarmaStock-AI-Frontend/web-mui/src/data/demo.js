const datePlus = days => { const d = new Date(); d.setDate(d.getDate()+days); return d.toISOString().slice(0,10); };
const stamp = (daysAgo=0)=> {const d = new Date();d.setDate(d.getDate()-daysAgo);return d.toISOString();};
export function demoData(){
const products = [
{id:1,sku:'PARA-500',name:'Paracetamol 500 mg',generic_name:'Paracetamol',category_name:'Analgésicos',presentation:'Caja con 20 tabletas',price:45,reorder_level:15},
{id:2,sku:'IBU-400',name:'Ibuprofeno 400 mg',generic_name:'Ibuprofeno',category_name:'Antiinflamatorios',presentation:'Caja con 10 tabletas',price:62,reorder_level:20},
{id:3,sku:'AMOX-500',name:'Amoxicilina 500 mg',generic_name:'Amoxicilina',category_name:'Antibióticos',presentation:'Caja con 12 cápsulas',price:110,reorder_level:10},
{id:4,sku:'VITA-C',name:'Vitamina C 1 g',generic_name:'Ácido ascórbico',category_name:'Vitaminas',presentation:'Caja de efervescentes',price:95,reorder_level:12},
{id:5,sku:'LORA-10',name:'Loratadina 10 mg',generic_name:'Loratadina',category_name:'Antihistamínicos',presentation:'Caja con 10 tabletas',price:50,reorder_level:15},
{id:6,sku:'OME-20',name:'Omeprazol 20 mg',generic_name:'Omeprazol',category_name:'Gastrointestinal',presentation:'Caja con 14 cápsulas',price:84,reorder_level:16},
{id:7,sku:'NAP-250',name:'Naproxeno 250 mg',generic_name:'Naproxeno',category_name:'Analgésicos',presentation:'Caja con 20 tabletas',price:73,reorder_level:15},
{id:8,sku:'MET-850',name:'Metformina 850 mg',generic_name:'Metformina',category_name:'Metabólicos',presentation:'Caja con 30 tabletas',price:89,reorder_level:20}
];
const amounts=[145,8,34,92,67,18,12,110];
const batches=products.map((p,i)=>({id:i+1,product_id:p.id,lot_number:`FS-${String(630+i).padStart(4,'0')}`,quantity:amounts[i],reserved:0,available:amounts[i],unit_cost:p.price*.48,expiry_date:datePlus([120,6,18,280,43,12,35,200][i])}));
const stock=products.map((p,i)=>({product_id:p.id,quantity:amounts[i],reserved:0,available:amounts[i]}));
const sales=Array.from({length:16},(_,i)=>({id:1001+i,total:[348,625,195,480,710,320,290,530,180,375,620,264,430,154,340,720][i],status:'completed',created_at:stamp(i%7)}));
const notifications=[
{id:1,event_type:'inventory.expiry.risk',title:'Caducidad próxima',message:'Ibuprofeno 400 mg — lote FS-0631 vence en 6 días.',severity:'high',is_read:0,created_at:stamp(0)},
{id:2,event_type:'inventory.stock.low',title:'Stock bajo',message:'Ibuprofeno 400 mg tiene 8 unidades disponibles.',severity:'medium',is_read:0,created_at:stamp(0)},
{id:3,event_type:'inventory.expiry.risk',title:'Revisión de vencimientos',message:'Omeprazol 20 mg — lote FS-0635 requiere atención.',severity:'medium',is_read:0,created_at:stamp(1)},
{id:4,event_type:'purchase.created',title:'Pedido registrado',message:'Nueva orden de compra registrada para revisión.',severity:'low',is_read:1,created_at:stamp(2)}];
const risks=batches.map((b,i)=>({id:i+1,product_id:b.product_id,product_name:products[i].name,batch_id:b.id,lot_number:b.lot_number,expiry_date:b.expiry_date,days_remaining:[120,6,18,280,43,12,35,200][i],quantity:b.quantity,avg_daily_demand:[3,1,2,1,2,0.5,0.6,3][i],estimated_leftover:[0,2,0,0,0,12,0,0][i],risk_level:["low","high","medium","low","low","high","medium","low"][i]}));
return {products,categories:[{id:1,name:'Analgésicos'},{id:2,name:'Antibióticos'},{id:3,name:'Vitaminas'}],batches,stock,sales,notifications,risks,suppliers:[{id:1,name:'Distribuidora Demo Farma',phone:'9610000000',email:'compras@demo.mx'}],orders:[{id:201,supplier_id:1,supplier_name:'Distribuidora Demo Farma',status:'pending',created_at:stamp(2)}],movements:[],users:[]};
}
