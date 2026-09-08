import React, {useEffect,useState} from 'react';
import {Link,useParams,useSearchParams} from 'react-router-dom';
import {EventsMap,Weather} from './integrations';
import {SaveButton} from './saved';
import {api} from './api';
import {Button,Field,Notice} from './components';
const dateLabel=value=>new Intl.DateTimeFormat('sr-Latn-RS',{dateStyle:'medium',timeStyle:'short',timeZone:'Europe/Belgrade'}).format(new Date(value));
const priceLabel=value=>Number(value)===0?'Besplatno':new Intl.NumberFormat('sr-Latn-RS',{style:'currency',currency:'RSD',maximumFractionDigits:0}).format(value);
export function EventCard({event}) {
 return <article className="event-card"><div className={'event-art tone-'+event.category_id%4} aria-hidden="true"><span>{event.category_name}</span><b>BG.</b></div>
 <div className="event-body"><p className="event-date">{dateLabel(event.starts_at)}</p><h2><Link to={'/events/'+event.id}>{event.title}</Link></h2><p>{event.location_name}</p><strong>{priceLabel(event.price)}</strong></div></article>;
}
export function Events(){
 const [params,setParams]=useSearchParams();const query=params.toString();
 const [data,setData]=useState(null),[categories,setCategories]=useState([]),[error,setError]=useState('');
 useEffect(()=>{const c=new AbortController();api('/categories',{signal:c.signal}).then(d=>setCategories(d.categories)).catch(e=>{if(e.name!=='AbortError')setError(e.message)});return()=>c.abort();},[]);
 useEffect(()=>{const c=new AbortController();setData(null);setError('');api('/events?'+query,{signal:c.signal}).then(setData).catch(e=>{if(e.name!=='AbortError')setError(e.message)});return()=>c.abort();},[query]);
 function search(e){e.preventDefault();const next=new URLSearchParams();for(const [key,value]of new FormData(e.currentTarget))if(value)next.set(key,value);setParams(next);}
 function page(delta){const next=new URLSearchParams(params);next.set('page',String(data.page+delta));setParams(next);}
 return <><p className="eyebrow">PRONAĐI SVOJ SLEDEĆI IZLAZAK</p><h1 className="small-title">Beograd ima <em>plan.</em></h1>
 <form className="filters" onSubmit={search} key={query}>
 <Field label="Pretraga" name="q" defaultValue={params.get('q')||''} maxLength={120} placeholder="Izložba, svirka…"/>
 <label className="field"><span>Kategorija</span><select name="category" defaultValue={params.get('category')||''}><option value="">Sve kategorije</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
 <Field label="Datum" name="date" type="date" defaultValue={params.get('date')||''}/>
 <Field label="Cena do (RSD)" name="maxPrice" type="number" min="0" max="99999999" step="0.01" defaultValue={params.get('maxPrice')||''}/>
 <Button type="submit">Pronađi</Button><Link to="/events">Poništi filtere</Link></form>
 <Notice error>{error}</Notice>{!data&&!error&&<Notice>Učitavanje događaja…</Notice>}
 {data&&<><p role="status">{data.total} događaja odgovara pretrazi.</p><EventsMap events={data.events}/><div className="event-grid">{data.events.map(e=><EventCard event={e} key={e.id}/>)}</div>
 {!data.events.length&&<p>Nema događaja za izabrane filtere. Pokušaj drugačiju pretragu.</p>}
 <div className="pagination"><Button disabled={data.page<=1} onClick={()=>page(-1)}>Prethodna</Button><span>Strana {data.page}</span><Button disabled={data.page*data.pageSize>=data.total} onClick={()=>page(1)}>Sledeća</Button></div></>}</>;
}
export function EventDetails({user}){
 const {id}=useParams();const [event,setEvent]=useState(null),[error,setError]=useState('');
 useEffect(()=>{const c=new AbortController();setEvent(null);setError('');api('/events/'+id,{signal:c.signal}).then(d=>setEvent(d.event)).catch(e=>{if(e.name!=='AbortError')setError(e.message)});return()=>c.abort();},[id]);
 if(error)return <><Notice error>{error}</Notice><Link to="/events">Svi događaji</Link></>;
 if(!event)return <Notice>Učitavanje događaja…</Notice>;
 let ticket;try{const url=new URL(event.ticket_url);if(['https:','http:'].includes(url.protocol))ticket=url.href;}catch{}
 return <><Link to="/events">← Svi događaji</Link><p className="eyebrow">{event.category_name}</p><h1 className="small-title">{event.title}</h1>
 <div className="details-layout"><section><h2>O događaju</h2><p className="description">{event.description}</p></section><section><h2>Isplaniraj dolazak</h2><Weather eventId={event.id}/><SaveButton eventId={event.id} user={user}/><dl><dt>Kada</dt><dd>{dateLabel(event.starts_at)}</dd><dt>Gde</dt><dd>{event.location_name}<br/>{event.address}</dd><dt>Cena</dt><dd>{priceLabel(event.price)}</dd><dt>Organizator</dt><dd>{event.organizer_name}</dd></dl>{ticket&&<a className="button" href={ticket} target="_blank" rel="noopener noreferrer">Informacije o kartama</a>}</section></div></>;
}
