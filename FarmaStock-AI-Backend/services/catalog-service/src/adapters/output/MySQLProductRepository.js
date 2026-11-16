const {pool}=require('@farmastock/shared');
module.exports={
 list:async(search='')=>{const [rows]=await pool.query(`SELECT p.*,c.name AS category_name FROM products p LEFT JOIN categories c ON c.id=p.category_id WHERE p.is_active=1 AND (p.name LIKE ? OR p.sku LIKE ? OR p.generic_name LIKE ?) ORDER BY p.id DESC LIMIT 250`,Array(3).fill('%'+search+'%'));return rows},
 byId:async(id)=>{const [[row]]=await pool.query('SELECT * FROM products WHERE id=?',[id]);return row},
 create:async(p)=>{const [r]=await pool.query('INSERT INTO products (sku,name,generic_name,barcode,category_id,presentation,price,reorder_level) VALUES (?,?,?,?,?,?,?,?)',[p.sku,p.name,p.generic_name||null,p.barcode||null,p.category_id||null,p.presentation||'Unidad',p.price,p.reorder_level]);return r.insertId},
 update:async(id,p)=>{const [r]=await pool.query('UPDATE products SET name=?,generic_name=?,barcode=?,category_id=?,presentation=?,price=?,reorder_level=?,is_active=? WHERE id=?',[p.name,p.generic_name||null,p.barcode||null,p.category_id||null,p.presentation||'Unidad',p.price,p.reorder_level,p.is_active?1:0,id]);return r.affectedRows},
 categories:async()=>{const [rows]=await pool.query('SELECT * FROM categories ORDER BY name');return rows}
};
