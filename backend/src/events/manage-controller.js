const fail=(res,status,message)=>res.status(status).json({error:{code:status===403?'FORBIDDEN':status===404?'NOT_FOUND':'VALIDATION_ERROR',message}});
const fields=['title','description','category_id','location_id','starts_at','price','ticket_url'];
function valid(data, partial=false) {
 if(!data||typeof data!=='object'||Array.isArray(data))return false;
 if(Object.keys(data).some(k=>!fields.includes(k))||!Object.keys(data).length)return false;
 if(!partial&&fields.filter(k=>k!=='ticket_url').some(k=>!(k in data)))return false;
 for(const [key,value] of Object.entries(data)){
  if(key==='title'&&(typeof value!=='string'||value.trim().length<3||value.length>160))return false;
  if(key==='description'&&(typeof value!=='string'||value.trim().length<10||value.length>10000))return false;
  if(['category_id','location_id'].includes(key)&&(!Number.isInteger(value)||value<1||value>2147483647))return false;
  if(key==='price'&&(typeof value!=='number'||!Number.isFinite(value)||value<0||value>99999999.99||Math.abs(value*100-Math.round(value*100))>0.00001))return false;
  if(key==='starts_at'&&(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}T.*(Z|[+-]\d{2}:\d{2})$/.test(value)||!Number.isFinite(Date.parse(value))))return false;
  if(key==='ticket_url'&&value!==null&&value!==''){
   if(typeof value!=='string'||value.length>2048)return false;
   try{if(!['https:','http:'].includes(new URL(value).protocol))return false;}catch{return false;}
  }
 }
 return true;
}

export function manageController(events) {
  const list = async(req,res)=>res.json({events:await events.owned(req.user)});
  const locations = async(_req,res)=>res.json({locations:await events.locations()});
  const create = async(req,res)=>{
  if(!valid(req.body))return fail(res,400,'Proverite polja događaja.');
  try{const event=await events.create(req.body,req.user.id);res.status(201).json({event});}
  catch(e){if(e.code==='23503')return fail(res,400,'Kategorija ili lokacija ne postoji.');throw e;}
 };
  const update = async(req,res)=>{
  if(!/^\d+$/.test(req.params.id)||Number(req.params.id)>2147483647||!valid(req.body,true))return fail(res,400,'Neispravan događaj ili izmena.');
  try{const event=await events.update(Number(req.params.id),req.body,req.user);
   if(!event)return fail(res,404,'Događaj nije pronađen ili nemate pravo izmene.');
   res.json({event});
  }catch(e){if(e.code==='23503')return fail(res,400,'Kategorija ili lokacija ne postoji.');throw e;}
 };
  const remove = async(req,res)=>{
  if(!/^\d+$/.test(req.params.id)||Number(req.params.id)>2147483647)return fail(res,400,'Neispravan identifikator.');
  if(!await events.remove(Number(req.params.id),req.user))return fail(res,404,'Događaj nije pronađen ili nemate pravo brisanja.');
  res.json({message:'Događaj je obrisan.'});
 };
  return { list, locations, create, update, remove };
}
