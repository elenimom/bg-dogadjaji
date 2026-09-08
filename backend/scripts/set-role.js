import {createPool} from '../src/db.js';
const [email,role]=process.argv.slice(2);
if(!email||!['visitor','organizer','admin'].includes(role))throw new Error('Upotreba: db:role email visitor|organizer|admin');
const pool=createPool();
try{
 const r=await pool.query('UPDATE users SET role=$1 WHERE email=$2 RETURNING id,name,role',[role,email.toLowerCase()]);
 if(!r.rowCount)throw new Error('Korisnik nije pronađen.');
 console.log('Ažurirana uloga:',r.rows[0].role);
}finally{await pool.end();}
