import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

function App() {
  const [status, setStatus] = useState('Proveravamo vezu sa serverom…');
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/health', { signal: controller.signal })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => setStatus(data.status === 'ok' ? 'Veza sa serverom radi.' : 'Server nije spreman.'))
      .catch(error => { if (error.name !== 'AbortError') setStatus('Server nije dostupan. Pokreni i backend.'); });
    return () => controller.abort();
  }, []);
  return <><header><a href="/" className="brand">BG<span> događaji</span></a><span>Vodič kroz Beograd</span></header>
    <main><p className="eyebrow">TVOJ GRAD. TVOJE SLOBODNO VREME.</p>
    <h1>Šta se dešava<br/><em>u Beogradu?</em></h1>
    <p className="intro">Izložbe, stand-up, svirke i mala otkrića koja menjaju planove.</p>
    <section><h2>Početna razvojna verzija</h2>
    <p>Postavljena je komunikacija između React interfejsa i Express API-ja.
    Pregled događaja i korisnički nalozi slede u narednim koracima.</p>
    <p role="status" className="status">{status}</p></section></main>
    <footer>Projekat iz Internet tehnologija · BG događaji</footer></>;
}
createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>);
