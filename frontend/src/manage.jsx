import React,{useEffect,useState} from 'react';
import {Navigate,Link} from 'react-router-dom';
import {api} from './api';
import {Button,Field,Notice} from './components';
const empty={title:'',description:'',category_id:'',location_id:'',starts_at:'',price:'0',ticket_url:''};
export function Manage({user,loading}){
 const [events,setEvents]=useState([]),[categories,setCategories]=useState([]),[locations,setLocations]=useState([]);
 const [error,setError]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[editing,setEditing]=useState(null),[form,setForm]=useState({...empty}),[ready,setReady]=useState(false);
 const allowed=user&&['organizer','admin'].includes(user.role);
 async function refresh(){const d=await api('/manage/events');setEvents(d.events);}
 useEffect(()=>{if(!allowed)return;const c=new AbortController();
 Promise.all([api('/manage/events',{signal:c.signal}),api('/categories',{signal:c.signal}),api('/manage/locations',{signal:c.signal})]).then(([a,b,d])=>{setEvents(a.events);setCategories(b.categories);setLocations(d.locations);setReady(true);}).catch(e=>{if(e.name!=='AbortError')setError(e.message)});
 return()=>c.abort();},[allowed,user?.id]);
 if(loading)return <Notice>Učitavanje…</Notice>;
 if(!user)return <Navigate to="/login" replace/>;
 if(!allowed)return <Notice error>Ova stranica je dostupna organizatorima i administratorima.</Notice>;
 const change=e=>setForm({...form,[e.target.name]:e.target.value});
 function edit(event){
  const date=new Date(event.starts_at);const local=new Date(date.getTime()-date.getTimezoneOffset()*60000).toISOString().slice(0,16);
  setEditing(event.id);setForm({...event,starts_at:local,ticket_url:event.ticket_url||''});setError('');setMessage('');window.scrollTo({top:0,behavior:'smooth'});
 }
 async function submit(e){
  e.preventDefault();if(busy)return;setBusy(true);setError('');setMessage('');
  try{const body={title:form.title,description:form.description,category_id:Number(form.category_id),location_id:Number(form.location_id),starts_at:new Date(form.starts_at).toISOString(),price:Number(form.price),ticket_url:form.ticket_url||null};
   await api('/manage/events'+(editing?'/'+editing:''),{method:editing?'PATCH':'POST',body});
   setForm({...empty});setEditing(null);await refresh();setMessage('Događaj je sačuvan.');
  }catch(e){setError(e.message);}finally{setBusy(false);}
 }
 async function remove(event){
  if(!window.confirm('Obrisati događaj „'+event.title+'“? Ova radnja se ne može poništiti.'))return;
  setBusy(true);setError('');setMessage('');
  try{await api('/manage/events/'+event.id,{method:'DELETE',body:{}});await refresh();if(editing===event.id){setEditing(null);setForm({...empty});}setMessage('Događaj je obrisan.');}
  catch(e){setError(e.message);}finally{setBusy(false);}
 }
 return <><p className="eyebrow">ORGANIZACIJA DOGAĐAJA</p><h1 className="small-title">{user.role==='admin'?'Svi događaji':'Moji događaji'}</h1>
 <Notice error>{error}</Notice><Notice>{message}</Notice>
 {!ready&&!error&&<Notice>Učitavanje podataka…</Notice>}
 {ready&&<section className="form-panel"><h2>{editing?'Izmeni događaj':'Novi događaj'}</h2>
 <form onSubmit={submit}><fieldset disabled={busy}>
 <Field name="title" label="Naziv" value={form.title} onChange={change} required minLength={3} maxLength={160}/>
 <label className="field"><span>Opis</span><textarea name="description" value={form.description} onChange={change} required minLength={10} maxLength={10000} rows={5}/></label>
 <div className="form-columns"><label className="field"><span>Kategorija</span><select name="category_id" value={form.category_id} onChange={change} required><option value="">Izaberi kategoriju</option>{categories.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
 <label className="field"><span>Lokacija</span><select name="location_id" value={form.location_id} onChange={change} required><option value="">Izaberi lokaciju</option>{locations.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label></div>
 <p className="hint">Kategorije i lokacije biraš iz postojećih zapisa. Datum se unosi u vremenskoj zoni tvog uređaja.</p>
 <div className="form-columns"><Field name="starts_at" label="Datum i vreme" type="datetime-local" value={form.starts_at} onChange={change} required/>
 <Field name="price" label="Cena u RSD (0 za besplatno)" type="number" min="0" max="99999999.99" step="0.01" value={form.price} onChange={change} required/></div>
 <Field name="ticket_url" label="Link ka kartama (opciono)" type="url" value={form.ticket_url} onChange={change} maxLength={2048}/>
 <Button type="submit">{busy?'Čuvanje…':'Sačuvaj događaj'}</Button>
 {editing&&<Button type="button" onClick={()=>{setEditing(null);setForm({...empty});}}>Otkaži izmenu</Button>}
 </fieldset></form></section>}
 <div className="manage-list">{events.map(event=><article key={event.id}><div><h2><Link to={'/events/'+event.id}>{event.title}</Link></h2><p>{event.location_name}</p></div><div className="actions"><Button disabled={busy} onClick={()=>edit(event)}>Izmeni</Button><Button disabled={busy} onClick={()=>remove(event)}>Obriši</Button></div></article>)}
 {ready&&!events.length&&<p>Još nemaš događaje. Dodaj prvi kroz formu iznad.</p>}</div></>;
}
