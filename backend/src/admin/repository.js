export function adminRepository(pool){
 const tables={categories:['name'],locations:['name','address','latitude','longitude']};
 return {
 async users(){return (await pool.query('SELECT id,name,email,role FROM users ORDER BY id')).rows;},
 async list(kind){if(!tables[kind])throw new Error('Invalid resource');return(await pool.query('SELECT * FROM '+kind+' ORDER BY id')).rows;},
 async write(kind,id,data){
  const keys=tables[kind];if(!keys)throw new Error('Invalid resource');
  const values=keys.map(k=>data[k]);
  const sql=id?'UPDATE '+kind+' SET '+keys.map((k,i)=>k+'=$'+(i+1)).join(',')+' WHERE id=$'+(keys.length+1)+' RETURNING *':'INSERT INTO '+kind+'('+keys.join(',')+') VALUES ('+keys.map((_,i)=>'$'+(i+1)).join(',')+') RETURNING *';
  if(id)values.push(id);return(await pool.query(sql,values)).rows[0];
 },
 async remove(kind,id){if(!tables[kind])throw new Error('Invalid resource');return(await pool.query('DELETE FROM '+kind+' WHERE id=$1 RETURNING id',[id])).rowCount>0;},
 async role(id,role){
  const c=await pool.connect();
  try{await c.query('BEGIN');await c.query('LOCK TABLE users IN SHARE ROW EXCLUSIVE MODE');
   const target=(await c.query('SELECT role FROM users WHERE id=$1',[id])).rows[0];
   if(!target){await c.query('ROLLBACK');return null;}
   if(target.role==='admin'&&role!=='admin'){
    const n=(await c.query("SELECT count(*)::int AS n FROM users WHERE role='admin'")).rows[0].n;
    if(n<=1){await c.query('ROLLBACK');return {lastAdmin:true};}
   }
   const user=(await c.query('UPDATE users SET role=$1 WHERE id=$2 RETURNING id,name,email,role',[role,id])).rows[0];
   await c.query('COMMIT');return user;
  }catch(e){await c.query('ROLLBACK');throw e;}finally{c.release();}
 }
 };
}
