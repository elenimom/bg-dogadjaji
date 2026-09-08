import { integrationController } from './controller.js';
import {Router} from 'express';
import {rateLimit} from 'express-rate-limit';
export function integrationRoutes(events,{fetcher=fetch}={}){
 const r=Router();
 const controller=integrationController(events,{fetcher});
 r.use(rateLimit({windowMs:60000,limit:20,standardHeaders:'draft-7',legacyHeaders:false,message:{error:{code:'RATE_LIMITED',message:'Sačekajte pre nove pretrage.'}}}));
 r.get('/geocode', controller.geocode);
 r.get('/weather/:id', controller.weather);
 return r;
}
