const {allocateFEFO}=require('../../domain/services/FEFO');
const {pool,httpError}=require('@farmastock/shared');
async function reserveStock(reference_key,lines){
if(!reference_key||!Array.isArray(lines)||!lines.length||lines.length>50)throw httpError(400,'Reserva inválida');
const grouped=new Map();for(const item of lines){const id=Number(item.product_id),qty=Number(item.quantity);if(!Number.isInteger(id)||id<1||!Number.isInteger(qty)||qty<1)throw httpError(400,'Producto/cantidad inválidos');grouped.set(id,(grouped.get(id)||0)+qty)}
const db=await pool.getConnection();try{await db.beginTransaction();const [[existing]]=await db.query('SELECT * FROM reservations WHERE reference_key=? FOR UPDATE',[reference_key]);if(existing){await db.commit();return {reservation_id:existing.id,status:existing.status,replayed:true}}
const [result]=await db.query('INSERT INTO reservations(reference_key) VALUES (?)',[reference_key]);
for(const [product_id,requested] of [...grouped.entries()].sort((a,b)=>a[0]-b[0])){
 const [batches]=await db.query('SELECT id,expiry_date,quantity,reserved FROM batches WHERE product_id=? AND expiry_date>=CURDATE() AND quantity>reserved ORDER BY expiry_date,id FOR UPDATE',[product_id]);const {allocations,remaining}=allocateFEFO(batches,requested);
 if(remaining)throw httpError(409,`Existencias insuficientes para producto ${product_id}`);
 for(const allocation of allocations){await db.query('UPDATE batches SET reserved=reserved+? WHERE id=?',[allocation.quantity,allocation.batch_id]);await db.query('INSERT INTO reservation_items(reservation_id,batch_id,product_id,quantity) VALUES (?,?,?,?)',[result.insertId,allocation.batch_id,product_id,allocation.quantity])}
}
await db.commit();return {reservation_id:result.insertId,status:'active',replayed:false};
}catch(err){await db.rollback();throw err}finally{db.release()}
};

async function completeReservation(reference_key,action){
const db=await pool.getConnection();let changed=[];
try{await db.beginTransaction();const [[r]]=await db.query('SELECT * FROM reservations WHERE reference_key=? FOR UPDATE',[reference_key]);if(!r)throw httpError(404,'Reserva inexistente');
if(r.status===action){await db.commit();return {status:r.status,replayed:true,changed:[]}}
if(r.status!=='active')throw httpError(409,`La reserva ya está ${r.status}`);
const [rows]=await db.query('SELECT * FROM reservation_items WHERE reservation_id=? ORDER BY batch_id FOR UPDATE',[r.id]);
for(const item of rows){
 if(action==='confirmed'){
  const [update]=await db.query('UPDATE batches SET quantity=quantity-?,reserved=reserved-? WHERE id=? AND quantity>=? AND reserved>=?',[item.quantity,item.quantity,item.batch_id,item.quantity,item.quantity]);if(update.affectedRows!==1)throw httpError(409,'Stock alterado durante la confirmación');
  await db.query('INSERT INTO stock_movements(batch_id,product_id,movement_type,quantity,reference_key) VALUES (?,?,?,?,?)',[item.batch_id,item.product_id,'sale',item.quantity,`sale:${reference_key}:${item.batch_id}`]);
 }else {const [update]=await db.query('UPDATE batches SET reserved=reserved-? WHERE id=? AND reserved>=?',[item.quantity,item.batch_id,item.quantity]);if(update.affectedRows!==1)throw httpError(409,'Reserva ya modificada');}
 changed.push({product_id:item.product_id,batch_id:item.batch_id,quantity:item.quantity});
}
await db.query('UPDATE reservations SET status=? WHERE id=?',[action,r.id]);await db.commit();return {status:action,replayed:false,changed};
}catch(e){await db.rollback();throw e}finally{db.release()}
};

module.exports={reserveStock,completeReservation};
