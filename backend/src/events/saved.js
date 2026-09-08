import { savedController } from './saved-controller.js';
import {Router} from 'express';
import {createHash} from 'node:crypto';
export function savedRoutes(events,auth,{origin='http://localhost:5173'}={}){
 const router=Router();
 const controller=savedController(events);
 router.use(async(req,res,next)=>{
  if(!['GET','HEAD'].includes(req.method)&&(req.get('Origin')!==origin||req.get('X-BG-Request')!=='1'))return res.status(403).json({error:{code:'CSRF_REJECTED',message:'Nedozvoljeno poreklo zahteva.'}});
  const token=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('bg_session='))?.slice(11);
  const user=token&&/^[a-f0-9]{64}$/.test(token)?await auth.sessionUser(createHash('sha256').update(token).digest('hex')):null;
  if(!user)return res.status(401).json({error:{code:'UNAUTHENTICATED',message:'Prijavite se.'}});
  req.user=user;next();
 });
 router.get('/', controller.list);
 router.param('id',(req,res,next,id)=>{
  if(!/^\d+$/.test(id)||Number(id)<1||Number(id)>2147483647)return res.status(400).json({error:{code:'VALIDATION_ERROR',message:'Neispravan događaj.'}});
  next();
 });
 router.post('/:id', controller.save);
 router.delete('/:id', controller.remove);
 return router;
}
