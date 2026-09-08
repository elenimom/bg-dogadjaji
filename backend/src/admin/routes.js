import { adminController } from './controller.js';
import {Router} from 'express';
import {createHash} from 'node:crypto';
import {requireRole} from '../auth/routes.js';
const fail=(res,status,message)=>res.status(status).json({error:{code:status===409?'CONFLICT':status===404?'NOT_FOUND':'INVALID_REQUEST',message}});
export function adminRoutes(repo,auth,{origin='http://localhost:5173'}={}){
 const r=Router();
 const controller=adminController(repo);
 r.use(async(req,res,next)=>{
  if(!['GET','HEAD'].includes(req.method)&&(req.get('Origin')!==origin||req.get('X-BG-Request')!=='1'))return fail(res,403,'Nedozvoljeno poreklo zahteva.');
  const t=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('bg_session='))?.slice(11);
  if(t&&/^[a-f0-9]{64}$/.test(t))req.user=await auth.sessionUser(createHash('sha256').update(t).digest('hex'));
  next();
 });
 r.use(requireRole('admin'));
 r.param('id',(req,res,next,id)=>/^\d+$/.test(id)&&Number(id)>0&&Number(id)<=2147483647?next():fail(res,400,'Neispravan identifikator.'));
 r.get('/users', controller.users);
 r.patch('/users/:id/role', controller.changeRole);
 for(const kind of ['categories','locations']){
  const resource=controller.resource(kind);
  r.get('/'+kind,resource.list);
  r.post('/'+kind,resource.write);
  r.patch('/'+kind+'/:id',resource.write);
  r.delete('/'+kind+'/:id',resource.remove);
 }

 return r;
}
