import { selection } from './event-selection.js';

export class EventModel {
  static table = "events";

  constructor(pool) {
    this.pool = pool;
  }

  async list({q='', category, date, maxPrice, page=1}) {
   const values=[]; const where=[];
   const param = value => { values.push(value); return '$'+values.length; };
   if(q) where.push('(e.title ILIKE '+param('%'+q+'%')+' OR e.description ILIKE $'+values.length+')');
   if(category) where.push('e.category_id='+param(category));
   if(date) where.push("(e.starts_at AT TIME ZONE 'Europe/Belgrade')::date="+param(date)+'::date');
   if(maxPrice !== undefined) where.push('e.price<='+param(maxPrice));
   const clause=where.length ? ' WHERE '+where.join(' AND ') : '';
   const count=await this.pool.query('SELECT count(*)::int AS total FROM events e'+clause,values);
   const rows=await this.pool.query(selection+clause+' ORDER BY e.starts_at,e.id LIMIT 12 OFFSET '+param((page-1)*12),values);
   return {events:rows.rows,total:count.rows[0].total,page,pageSize:12};
  }

  async owned(user) { return (await this.pool.query(selection+(user.role==='admin'?'':' WHERE e.organizer_id=$1')+' ORDER BY e.starts_at DESC',user.role==='admin'?[]:[user.id])).rows; }

  async create(data,userId) {
   return (await this.pool.query('INSERT INTO events(title,description,category_id,location_id,starts_at,price,ticket_url,organizer_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',[data.title.trim(),data.description.trim(),data.category_id,data.location_id,data.starts_at,data.price,data.ticket_url||null,userId])).rows[0];
  }

  async update(id,data,user) {
   const allowed=['title','description','category_id','location_id','starts_at','price','ticket_url'];
   const keys=Object.keys(data).filter(k=>allowed.includes(k));
   const values=keys.map(k=>data[k]);values.push(id,user.id,user.role==='admin');
   return (await this.pool.query('UPDATE events SET '+keys.map((k,i)=>k+'=$'+(i+1)).join(',')+' WHERE id=$'+(keys.length+1)+' AND (organizer_id=$'+(keys.length+2)+' OR $'+(keys.length+3)+'::boolean) RETURNING *',values)).rows[0];
  }

  async remove(id,user) { return (await this.pool.query('DELETE FROM events WHERE id=$1 AND (organizer_id=$2 OR $3::boolean) RETURNING id',[id,user.id,user.role==='admin'])).rowCount>0; }

  async get(id) { return (await this.pool.query(selection+' WHERE e.id=$1',[id])).rows[0]; }
}
