import React,{useEffect,useState} from 'react';
import {Link,Navigate} from 'react-router-dom';
import {api} from './api';
import {Button,Notice} from './components';
export function SaveButton({eventId,user}){
 const [saved,setSaved]=useState(false),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState('');
 useEffect(()=>{setLoading(true);setError('');setSaved(false);if(!user){setLoading(false);return;}const c=new AbortController();
 api('/saved-events',{signal:c.signal}).then(d=>setSaved(d.events.some(e=>e.id===Number(eventId)))).catch(e=>{if(e.name!=='AbortError')setError(e.message)}).finally(()=>{if(!c.signal.aborted)setLoading(false)});
 return()=>c.abort();},[eventId,user?.id]);
 if(!user)return <p><Link to="/login">Prijavi se da sačuvaš događaj</Link></p>;
 async function toggle(){setBusy(true);setError('');try{const d=await api('/saved-events/'+eventId,{method:saved?'DELETE':'POST',body:{}});setSaved(d.saved);}catch(e){setError(e.message);}finally{setBusy(false);}}
 return <div className="save-control"><Button disabled={busy||loading||!!error} aria-pressed={saved} onClick={toggle}>{loading?'Provera…':busy?'Sačekaj…':saved?'Ukloni iz mojih planova':'Želim da idem'}</Button><Notice error>{error}</Notice>{error&&<p>Osveži stranicu da pokušaš ponovo.</p>}</div>;
}
export function SavedEvents({user,loading}){
 const [events,setEvents]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(null);
 useEffect(()=>{if(!user)return;const c=new AbortController();setEvents(null);setError('');api('/saved-events',{signal:c.signal}).then(d=>setEvents(d.events)).catch(e=>{if(e.name!=='AbortError')setError(e.message)});return()=>c.abort();},[user?.id]);
 if(loading)return <Notice>Učitavanje naloga…</Notice>;
 if(!user)return <Navigate to="/login" replace/>;
 async function remove(id){setBusy(id);setError('');try{await api('/saved-events/'+id,{method:'DELETE',body:{}});setEvents(current=>current.filter(e=>e.id!==id));}catch(e){setError(e.message);}finally{setBusy(null);}}
 return <><p className="eyebrow">MOJI PLANOVI</p><h1 className="small-title">Želim <em>da idem.</em></h1><Notice error>{error}</Notice>
 {!events&&!error&&<Notice>Učitavanje događaja…</Notice>}
 {events?.length===0&&<p>Još nema sačuvanih događaja. <Link to="/events">Istraži događaje</Link> i otvori onaj koji te zanima.</p>}
 <div className="manage-list">{events?.map(e=><article key={e.id}><div><h2><Link to={'/events/'+e.id}>{e.title}</Link></h2><p>{e.location_name} · {new Intl.DateTimeFormat('sr-Latn-RS',{dateStyle:'medium',timeStyle:'short',timeZone:'Europe/Belgrade'}).format(new Date(e.starts_at))}</p></div><Button disabled={busy!==null} onClick={()=>remove(e.id)}>{busy===e.id?'Uklanjanje…':'Ukloni sa liste'}</Button></article>)}</div></>;
}
