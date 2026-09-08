export function savedController(events) {
  const list = async(req,res)=>res.json({events:await events.saved(req.user.id)});
  const save = async(req,res)=>{
  if(!await events.save(req.user.id,Number(req.params.id)))return res.status(404).json({error:{code:'NOT_FOUND',message:'Događaj nije pronađen.'}});
  res.json({saved:true});
 };
  const remove = async(req,res)=>{await events.unsave(req.user.id,Number(req.params.id));res.json({saved:false});};
  return { list, save, remove };
}
