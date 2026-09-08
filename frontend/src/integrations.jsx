import React,{useEffect,useRef,useState} from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {api} from './api';
import {Button,Notice} from './components';
export function EventsMap({events}){
 const ref=useRef();const mapRef=useRef();const [error,setError]=useState('');
 useEffect(()=>{
  const map=L.map(ref.current,{scrollWheelZoom:false}).setView([44.8178,20.4569],12);mapRef.current=map;
  const tiles=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'}).addTo(map);
  tiles.on('tileerror',()=>setError('Podloga mape trenutno nije dostupna. Koristite listu događaja.'));
  const groups=new Map(),points=[];const colors=['#36512b','#9b4632','#66509b','#957014'];
  for(const e of events){
   const lat=Number(e.latitude),lon=Number(e.longitude);if(!Number.isFinite(lat)||!Number.isFinite(lon))continue;
   if(!groups.has(e.category_id))groups.set(e.category_id,{name:e.category_name,layer:L.layerGroup().addTo(map)});
   const popup=document.createElement('div');const a=document.createElement('a');a.textContent=e.title;a.href='/events/'+e.id;popup.append(a,document.createElement('br'),document.createTextNode(e.location_name));
   L.circleMarker([lat,lon],{radius:10,color:colors[e.category_id%4],fillOpacity:.8}).bindPopup(popup).addTo(groups.get(e.category_id).layer);points.push([lat,lon]);
  }
  // Leaflet nazive slojeva tumači kao HTML, pa tekst prvo bezbedno kodiramo.
  const overlays={};for(const {name,layer}of groups.values()){const el=document.createElement('span');el.textContent=name;overlays[el.innerHTML]=layer;}
  L.control.layers(null,overlays,{collapsed:false}).addTo(map);
  if(points.length)map.fitBounds(points,{padding:[35,35],maxZoom:15});
  const observer=new ResizeObserver(()=>map.invalidateSize());observer.observe(ref.current);
  return()=>{observer.disconnect();map.remove();mapRef.current=null;};
 },[events]);
 return <><p>Mapa prikazuje događaje sa trenutne stranice rezultata. Kategorije uključuješ i isključuješ u uglu mape.</p><Button onClick={()=>mapRef.current?.setView([44.8178,20.4569],12)}>Centar Beograda</Button><Notice error>{error}</Notice><div ref={ref} className="events-map" aria-label="Mapa događaja u Beogradu"/></>;
}
export function Weather({eventId}){
 const [data,setData]=useState(null),[error,setError]=useState('');
 useEffect(()=>{const c=new AbortController();setData(null);setError('');api('/integrations/weather/'+eventId,{signal:c.signal}).then(setData).catch(e=>{if(e.name!=='AbortError')setError(e.message)});return()=>c.abort();},[eventId]);
 return <div className="weather"><h3>Vreme na dan događaja</h3><Notice error>{error}</Notice>{!data&&!error&&<Notice>Učitavanje prognoze…</Notice>}
 {data&&(data.available?<p>{data.min}–{data.max} °C{data.rain!==null&&<> · Verovatnoća padavina: {data.rain}%</>}</p>:<p>{data.message}</p>)}<small>Prognoza: <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">Open-Meteo</a>. Vrednosti su dnevne i mogu se promeniti.</small></div>;
}
export function LocationSearch({onChoose}){
 const [q,setQ]=useState(''),[results,setResults]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
 async function search(){setBusy(true);setError('');setResults(null);try{setResults((await api('/integrations/geocode?q='+encodeURIComponent(q))).results);}catch(e){setError(e.message);}finally{setBusy(false);}}
 return <div><h3>Pronađi lokaciju u Beogradu</h3><label className="field"><span>Adresa ili naziv prostora</span><input value={q} onChange={e=>setQ(e.target.value)} maxLength={150}/></label><Button type="button" disabled={busy||q.trim().length<3} onClick={search}>{busy?'Pretraga…':'Pronađi koordinate'}</Button><Notice error>{error}</Notice>
 {results?.length===0&&<p>Nema rezultata. Pokušaj precizniju adresu ili unesi koordinate ručno.</p>}
 {results?.map((r,i)=><p key={i}><Button type="button" onClick={()=>onChoose(r)}>{r.name} — {r.address}</Button></p>)}
 <p className="hint">Izvor: <a href="https://photon.komoot.io/">Photon</a> / <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>. Proveri izabranu adresu pre čuvanja.</p></div>;
}
