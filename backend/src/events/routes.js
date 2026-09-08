import { Router } from 'express';
const invalid = res => res.status(400).json({error:{code:'VALIDATION_ERROR',message:'Neispravni filteri ili identifikator.'}});
export function eventRoutes(repository) {
 const router=Router();
 router.get('/categories',async (_req,res)=>res.json({categories:await repository.categories()}));
 router.get('/events',async (req,res)=>{
  const {q='',category,date,maxPrice,page='1'}=req.query;
  if(typeof q!=='string'||q.length>120||typeof page!=='string'||!/^\d+$/.test(page)||Number(page)<1||Number(page)>10000) return invalid(res);
  if(category!==undefined&&(typeof category!=='string'||!/^\d+$/.test(category)||Number(category)<1||Number(category)>2147483647))return invalid(res);
  if(date!==undefined&&(typeof date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date))||new Date(date).toISOString().slice(0,10)!==date))return invalid(res);
  if(maxPrice!==undefined&&(typeof maxPrice!=='string'||!/^\d+(\.\d{1,2})?$/.test(maxPrice)||Number(maxPrice)>99999999))return invalid(res);
  res.json(await repository.list({q:q.trim(),category:category?Number(category):undefined,date,maxPrice:maxPrice===undefined?undefined:Number(maxPrice),page:Number(page)}));
 });
 router.get('/events/:id',async(req,res)=>{
  if(!/^\d+$/.test(req.params.id)||Number(req.params.id)<1||Number(req.params.id)>2147483647)return invalid(res);
  const event=await repository.get(Number(req.params.id));
  if(!event)return res.status(404).json({error:{code:'NOT_FOUND',message:'Događaj nije pronađen.'}});
  res.json({event});
 });
 return router;
}
