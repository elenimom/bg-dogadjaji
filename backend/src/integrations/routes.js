import {Router} from 'express';
import {rateLimit} from 'express-rate-limit';
export function integrationRoutes(events,{fetcher=fetch}={}){
 const r=Router();const cache=new Map();
 async function get(url){
  const hit=cache.get(url);if(hit&&hit.until>Date.now())return hit.data;
  const response=await fetcher(url,{signal:AbortSignal.timeout(8000),headers:{'User-Agent':'BGEventsStudentProject/1.0'}});
  if(!response.ok)throw new Error('Provider unavailable');
  const data=await response.json();
  if(cache.size>=200)cache.delete(cache.keys().next().value);
  cache.set(url,{data,until:Date.now()+15*60*1000});return data;
 }
 r.use(rateLimit({windowMs:60000,limit:20,standardHeaders:'draft-7',legacyHeaders:false,message:{error:{code:'RATE_LIMITED',message:'Sačekajte pre nove pretrage.'}}}));
 r.get('/geocode',async(req,res)=>{
  const q=req.query.q;if(typeof q!=='string'||q.trim().length<3||q.length>150)return res.status(400).json({error:{code:'VALIDATION_ERROR',message:'Unesite najmanje tri znaka.'}});
  try{
   const url=new URL('https://photon.komoot.io/api/');url.search=new URLSearchParams({q:q.trim(),limit:'5',lat:'44.8178',lon:'20.4569',bbox:'19.8,44.3,21.0,45.1'}).toString();
   const data=await get(url.href);
   if(!Array.isArray(data.features))throw new Error('Invalid response');
   const results=data.features.filter(f=>f.geometry?.type==='Point'&&f.geometry.coordinates.every(Number.isFinite)).map(f=>({name:f.properties.name||f.properties.street||q,address:[f.properties.street,f.properties.housenumber,f.properties.city].filter(Boolean).join(' '),latitude:f.geometry.coordinates[1],longitude:f.geometry.coordinates[0]}));
   res.json({results,source:'Photon / OpenStreetMap'});
  }catch{res.status(503).json({error:{code:'EXTERNAL_UNAVAILABLE',message:'Pretraga lokacija trenutno nije dostupna. Koordinate možete uneti ručno.'}});}
 });
 r.get('/weather/:id',async(req,res)=>{
  if(!/^\d+$/.test(req.params.id)||Number(req.params.id)<1||Number(req.params.id)>2147483647)return res.status(400).json({error:{code:'VALIDATION_ERROR',message:'Neispravan događaj.'}});
  const event=await events.get(Number(req.params.id));if(!event)return res.status(404).json({error:{code:'NOT_FOUND',message:'Događaj nije pronađen.'}});
  const date=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Belgrade',year:'numeric',month:'2-digit',day:'2-digit'});
  const day=date.format(new Date(event.starts_at));const today=date.format(new Date());const gap=(Date.parse(day)-Date.parse(today))/86400000;
  if(gap<0||gap>15)return res.json({available:false,message:gap<0?'Događaj je prošao.':'Prognoza će biti dostupna do 16 dana pre događaja.'});
  try{
   const url=new URL('https://api.open-meteo.com/v1/forecast');url.search=new URLSearchParams({latitude:String(event.latitude),longitude:String(event.longitude),daily:'temperature_2m_max,temperature_2m_min,precipitation_probability_max',timezone:'Europe/Belgrade',forecast_days:'16'}).toString();
   const data=await get(url.href);const i=data.daily?.time?.indexOf(day);
   if(i===undefined||i<0)return res.json({available:false,message:'Prognoza za izabrani datum još nije dostupna.'});
   const min=data.daily.temperature_2m_min?.[i],max=data.daily.temperature_2m_max?.[i],rain=data.daily.precipitation_probability_max?.[i];
   if(!Number.isFinite(min)||!Number.isFinite(max))throw new Error('Invalid forecast');
   res.json({available:true,date:day,min,max,rain:Number.isFinite(rain)?rain:null,source:'Open-Meteo'});
  }catch{res.status(503).json({error:{code:'EXTERNAL_UNAVAILABLE',message:'Prognoza trenutno nije dostupna. Pokušajte kasnije.'}});}
 });
 return r;
}
