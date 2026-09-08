import { createPool } from '../src/db.js';
import { hashPassword } from '../src/auth/password.js';
import { randomBytes } from 'node:crypto';
const pool=createPool();const client=await pool.connect();
try{
 await client.query('BEGIN');
 await client.query('SELECT pg_advisory_xact_lock(8421702)');
 const user=await client.query("INSERT INTO users(name,email,password_hash,role) VALUES ($1,$2,$3,'organizer') ON CONFLICT(email) DO NOTHING RETURNING id",
 ['Demo organizator','demo-organizer@example.invalid',await hashPassword(randomBytes(32).toString('hex'))]);
 const id=user.rows[0]?.id||(await client.query('SELECT id FROM users WHERE email=$1',['demo-organizer@example.invalid'])).rows[0].id;
 const items=[['Izložba','Boje grada',0],['Stand-up','Veče komedije',900],['Svirka','Akustično veče',1200],['Radionica','Crtanje uz kafu',1800],['Žurka','Ples do ponoći',700],['Izložba','Fotografije Beograda',0]];
 let location=(await client.query('SELECT id FROM locations WHERE name=$1',['Demo prostor - Beograd'])).rows[0];
 if(!location)location=(await client.query('INSERT INTO locations(name,address,latitude,longitude) VALUES ($1,$2,$3,$4) RETURNING id',['Demo prostor - Beograd','Demonstraciona lokacija, centar Beograda',44.8178,20.4569])).rows[0];
 for(const [i,[category,title,price]]of items.entries()){
  await client.query('INSERT INTO categories(name) VALUES ($1) ON CONFLICT(name) DO NOTHING',[category]);
  const cat=(await client.query('SELECT id FROM categories WHERE name=$1',[category])).rows[0].id;
  const name='[DEMO] '+title;
  const exists=await client.query('SELECT id FROM events WHERE organizer_id=$1 AND title=$2',[id,name]);
  if(!exists.rowCount)await client.query("INSERT INTO events(organizer_id,category_id,location_id,title,description,starts_at,price) VALUES ($1,$2,$3,$4,$5, date_trunc('day',NOW()) + ($6::int * INTERVAL '1 day') + INTERVAL '18 hours',$7)",
  [id,cat,location.id,name,'Izmišljeni događaj za demonstraciju seminarskog projekta. Termin, cena i lokacija nisu stvarna ponuda. Ovaj primer služi proveri pretrage, filtera i prikaza detalja.',i+2,price]);
 }
 await client.query('COMMIT');console.log('Demo podaci su spremni. Nisu napravljene javne pristupne lozinke.');
}catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();await pool.end();}
