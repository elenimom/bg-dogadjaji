const selection = `SELECT e.*, c.name AS category_name, l.name AS location_name,
 l.address, l.latitude, l.longitude, u.name AS organizer_name
 FROM events e JOIN categories c ON c.id=e.category_id
 JOIN locations l ON l.id=e.location_id JOIN users u ON u.id=e.organizer_id`;
export function eventRepository(pool) {
 return {
  async list({q='', category, date, maxPrice, page=1}) {
   const values=[]; const where=[];
   const param = value => { values.push(value); return '$'+values.length; };
   if(q) where.push('(e.title ILIKE '+param('%'+q+'%')+' OR e.description ILIKE $'+values.length+')');
   if(category) where.push('e.category_id='+param(category));
   if(date) where.push("(e.starts_at AT TIME ZONE 'Europe/Belgrade')::date="+param(date)+'::date');
   if(maxPrice !== undefined) where.push('e.price<='+param(maxPrice));
   const clause=where.length ? ' WHERE '+where.join(' AND ') : '';
   const count=await pool.query('SELECT count(*)::int AS total FROM events e'+clause,values);
   const rows=await pool.query(selection+clause+' ORDER BY e.starts_at,e.id LIMIT 12 OFFSET '+param((page-1)*12),values);
   return {events:rows.rows,total:count.rows[0].total,page,pageSize:12};
  },
  async get(id) { return (await pool.query(selection+' WHERE e.id=$1',[id])).rows[0]; },
  async categories() { return (await pool.query('SELECT id,name FROM categories ORDER BY name')).rows; }
 };
}
