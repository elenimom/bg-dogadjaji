import { Router } from 'express';
import { createHash } from 'node:crypto';
import { requireRole } from '../auth/routes.js';
import { manageController } from './manage-controller.js';
const fail=(res,status,message)=>res.status(status).json({error:{code:status===403?'FORBIDDEN':status===404?'NOT_FOUND':'VALIDATION_ERROR',message}});
export function manageRoutes(events,auth,{origin='http://localhost:5173'}={}){
 const router=Router();
 const controller=manageController(events);
 router.use(async(req,res,next)=>{
  if(!['GET','HEAD','OPTIONS'].includes(req.method)&&(req.get('Origin')!==origin||req.get('X-BG-Request')!=='1'))return fail(res,403,'Nedozvoljeno poreklo zahteva.');
  const token=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('bg_session='))?.slice(11);
  if(token&&/^[a-f0-9]{64}$/.test(token))req.user=await auth.sessionUser(createHash('sha256').update(token).digest('hex'));
  next();
 });
 router.use(requireRole('organizer','admin'));
 router.get('/events', controller.list);
 router.get('/locations', controller.locations);
 router.post('/events', controller.create);
 router.patch('/events/:id', controller.update);
 router.delete('/events/:id', controller.remove);
 return router;
}
