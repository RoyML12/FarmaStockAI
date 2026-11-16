const {pool}=require('@farmastock/shared');
module.exports={byEmail:async email=>{const [[user]]=await pool.query('SELECT * FROM users WHERE email=? AND is_active=1',[email]);return user}, count:async()=>{const [[r]]=await pool.query('SELECT COUNT(*) AS n FROM users');return r.n}};
