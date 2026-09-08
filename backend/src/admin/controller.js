const fail=(res,status,message)=>res.status(status).json({error:{code:status===409?'CONFLICT':status===404?'NOT_FOUND':'INVALID_REQUEST',message}});

export function adminController(repo) {
  const users = async(_req,res)=>res.json({users:await repo.users()});
  const changeRole = async(req,res)=>{
  if(!['visitor','organizer','admin'].includes(req.body?.role))return fail(res,400,'Neispravna uloga.');
  const user=await repo.role(Number(req.params.id),req.body.role);
  if(!user)return fail(res,404,'Korisnik nije pronađen.');
  if(user.lastAdmin)return fail(res,409,'Poslednji administrator mora zadržati svoju ulogu.');
  res.json({user});
 };
  function resource(kind) {
    if (!['categories', 'locations'].includes(kind)) throw new Error('Nepoznat resurs.');
    const list = async (_req,res) => res.json({items:await repo.list(kind)});
  const writeItem=async(req,res)=>{
   const b=req.body;
   if(!b||typeof b.name!=='string'||b.name.trim().length<2||b.name.length>(kind==='categories'?80:150))return fail(res,400,'Unesite ispravan naziv.');
   const data={name:b.name.trim()};
   if(kind==='locations'){
    if(typeof b.address!=='string'||b.address.trim().length<3||b.address.length>250||typeof b.latitude!=='number'||!Number.isFinite(b.latitude)||Math.abs(b.latitude)>90||typeof b.longitude!=='number'||!Number.isFinite(b.longitude)||Math.abs(b.longitude)>180)return fail(res,400,'Proverite adresu i koordinate.');
    Object.assign(data,{address:b.address.trim(),latitude:b.latitude,longitude:b.longitude});
   }
   try{const item=await repo.write(kind,req.params.id?Number(req.params.id):null,data);if(!item)return fail(res,404,'Zapis nije pronađen.');res.status(req.params.id?200:201).json({item});}
   catch(e){if(e.code==='23505')return fail(res,409,'Naziv već postoji.');throw e;}
  };
  const remove = async(req,res)=>{
   try{if(!await repo.remove(kind,Number(req.params.id)))return fail(res,404,'Zapis nije pronađen.');res.json({message:'Zapis je obrisan.'});}
   catch(e){if(e.code==='23503')return fail(res,409,'Zapis koristi događaj i ne može se obrisati.');throw e;}
  };
    return { list, write: writeItem, remove };
  }
  return { users, changeRole, resource };
}
