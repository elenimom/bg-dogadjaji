import React,{useEffect,useState} from 'react';
import {Navigate} from 'react-router-dom';
import {api} from './api';
import {Button,Field,Notice} from './components';
function Resources({kind}){
 const blank={name:'',address:'',latitude:'',longitude:''};
 const [items,setItems]=useState([]),[form,setForm]=useState(blank),[id,setId]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('');
 const location=kind==='locations';
 async function refresh(){setItems((await api('/admin/'+kind)).items);}
 useEffect(()=>{refresh().catch(e=>setError(e.message));},[kind]);
 const change=e=>setForm({...form,[e.target.name]:e.target.value});
 async function save(e){e.preventDefault();setBusy(true);setError('');setMessage('');
 try{const body={name:form.name};if(location)Object.assign(body,{address:form.address,latitude:Number(form.latitude),longitude:Number(form.longitude)});
 await api('/admin/'+kind+(id?'/'+id:''),{method:id?'PATCH':'POST',body});setId(null);setForm(blank);await refresh();setMessage('Sačuvano.');
 }catch(e){setError(e.message);}finally{setBusy(false);}}
 async function remove(item){if(!window.confirm('Obrisati „'+item.name+'“?'))return;setBusy(true);setError('');setMessage('');try{await api('/admin/'+kind+'/'+item.id,{method:'DELETE',body:{}});await refresh();if(id===item.id){setId(null);setForm(blank);}setMessage('Obrisano.');}catch(e){setError(e.message);}finally{setBusy(false);}}
 return <section><h2>{location?'Lokacije':'Kategorije'}</h2><Notice error>{error}</Notice><Notice>{message}</Notice>
 <form onSubmit={save}><fieldset disabled={busy}><Field label="Naziv" name="name" value={form.name} onChange={change} required minLength={2} maxLength={location?150:80}/>
 {location&&<><Field label="Adresa" name="address" value={form.address} onChange={change} required minLength={3} maxLength={250}/><div className="form-columns"><Field label="Geografska širina" name="latitude" type="number" min="-90" max="90" step="any" value={form.latitude} onChange={change} required/><Field label="Geografska dužina" name="longitude" type="number" min="-180" max="180" step="any" value={form.longitude} onChange={change} required/></div><p className="hint">Koordinate su potrebne za budući prikaz lokacije na mapi.</p></>}
 <Button>{busy?'Sačekaj…':id?'Sačuvaj izmenu':'Dodaj'}</Button>{id&&<Button type="button" onClick={()=>{setId(null);setForm(blank);}}>Otkaži</Button>}</fieldset></form>
 <div className="manage-list">{items.map(item=><article key={item.id}><div><strong>{item.name}</strong>{location&&<p>{item.address}</p>}</div><div className="actions"><Button disabled={busy} onClick={()=>{setId(item.id);setForm({...blank,...item});}}>Izmeni</Button><Button disabled={busy} onClick={()=>remove(item)}>Obriši</Button></div></article>)}</div></section>;
}
function Users({onUserChange,currentUser}){
 const [users,setUsers]=useState([]),[error,setError]=useState(''),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 useEffect(()=>{api('/admin/users').then(d=>setUsers(d.users)).catch(e=>setError(e.message));},[]);
 async function role(user,value){
  if(!window.confirm('Promeniti ulogu korisnika '+user.name+'?'))return;
  setBusy(true);setError('');setMessage('');
  try{const d=await api('/admin/users/'+user.id+'/role',{method:'PATCH',body:{role:value}});setUsers(rows=>rows.map(u=>u.id===user.id?d.user:u));if(user.id===currentUser.id)onUserChange(d.user);setMessage('Uloga je sačuvana.');}
  catch(e){setError(e.message);}finally{setBusy(false);}
 }
 return <section><h2>Korisničke uloge</h2><Notice error>{error}</Notice><Notice>{message}</Notice><div className="manage-list">{users.map(user=><article key={user.id}><div><strong>{user.name}</strong><p>{user.email}</p></div><label className="field"><span>Uloga za {user.name}</span><select disabled={busy} value={user.role} onChange={e=>role(user,e.target.value)}><option value="visitor">Posetilac</option><option value="organizer">Organizator</option><option value="admin">Administrator</option></select></label></article>)}</div></section>;
}
export function Admin({user,loading,onUserChange}){
 const [tab,setTab]=useState('categories');
 if(loading)return <Notice>Učitavanje…</Notice>;
 if(!user)return <Navigate to="/login" replace/>;
 if(user.role!=='admin')return <Notice error>Ova stranica je dostupna samo administratorima.</Notice>;
 return <><p className="eyebrow">ADMINISTRACIJA</p><h1 className="small-title">Uredi <em>svoj grad.</em></h1><div className="actions">{[['categories','Kategorije'],['locations','Lokacije'],['users','Korisnici']].map(([key,label])=><Button key={key} aria-pressed={tab===key} onClick={()=>setTab(key)}>{label}</Button>)}</div>{tab==='users'?<Users currentUser={user} onUserChange={onUserChange}/>:<Resources kind={tab} key={tab}/>}</>;
}
