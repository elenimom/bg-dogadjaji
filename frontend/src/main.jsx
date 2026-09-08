import React, { createContext, useContext, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { api } from './api';
import { Button, Field, Notice } from './components';
import './style.css';
import { SavedEvents } from './saved';
import { Manage } from './manage';
import { Events, EventDetails } from './events';

const Auth = createContext();
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    api('/auth/me', { signal: controller.signal }).then(data => setUser(data.user))
      .catch(e => { if (e.name !== 'AbortError' && e.status !== 401) setError(e.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);
  return <Auth.Provider value={{ user, setUser, loading, error, setError }}>{children}</Auth.Provider>;
}
function Home() {
  return <><p className="eyebrow">TVOJ GRAD. TVOJE SLOBODNO VREME.</p>
    <h1>Šta se dešava<br/><em>u Beogradu?</em></h1>
    <p className="intro">Izložbe, stand-up, svirke i mala otkrića koja menjaju planove.</p>
    <section><h2>Tvoj sledeći izlazak počinje ovde</h2>
    <p>Pronađi događaj prema svom ukusu, datumu i budžetu.</p>
    <Link className="button" to="/events">Istraži događaje</Link></section></>;
}
function AuthForm({ register = false }) {
  const { user, setUser, loading, setError: clearGlobal } = useContext(Auth);
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  if (loading) return <Notice>Proveravamo prijavu…</Notice>;
  if (user) return <Navigate to="/account" replace/>;
  async function submit(event) {
    event.preventDefault();
    if (pending) return;
    const form = new FormData(event.currentTarget);
    setPending(true); setError('');
    try {
      const body = { email: form.get('email'), password: form.get('password') };
      if (register) body.name = form.get('name');
      const data = await api(register ? '/auth/register' : '/auth/login', { method: 'POST', body });
      setUser(data.user); clearGlobal(''); navigate('/account', { replace: true });
    } catch (e) { setError(e.message); } finally { setPending(false); }
  }
  return <div className="auth-layout"><div><p className="eyebrow">BG DOGAĐAJI</p>
    <h1 className="small-title">{register ? 'Napravi mesta za' : 'Dobro došla'}<br/><em>{register ? 'nove doživljaje.' : 'ponovo.'}</em></h1>
    <p className="intro">Jedan nalog za tvoje planove u gradu.</p></div>
    <section className="form-panel"><h2>{register ? 'Registracija' : 'Prijava'}</h2>
    <form onSubmit={submit}>
      <fieldset disabled={pending}>
        {register && <Field name="name" label="Ime i prezime" autoComplete="name" minLength={2} maxLength={100} required/>}
        <Field name="email" label="Email" type="email" autoComplete="email" maxLength={254} required/>
        <Field name="password" label="Lozinka" type="password" autoComplete={register ? 'new-password' : 'current-password'} minLength={register ? 12 : undefined} maxLength={128} required/>
        {register && <p className="hint">Koristi najmanje 12 znakova za lozinku.</p>}
        <Notice error>{error}</Notice>
        <Button type="submit">{pending ? 'Sačekaj…' : register ? 'Napravi nalog' : 'Prijavi se'}</Button>
      </fieldset>
    </form>
    <p>{register ? 'Već imaš nalog?' : 'Nemaš nalog?'} <Link to={register ? '/login' : '/register'}>{register ? 'Prijavi se' : 'Registruj se'}</Link></p>
    </section></div>;
}
function Account() {
  const { user, loading, error } = useContext(Auth);
  if (loading) return <Notice>Učitavanje naloga…</Notice>;
  if (error) return <Notice error>{error}</Notice>;
  if (!user) return <Navigate to="/login" replace/>;
  const roles = { visitor: 'Posetilac', organizer: 'Organizator', admin: 'Administrator' };
  return <><p className="eyebrow">MOJ NALOG</p><h1 className="small-title">Zdravo, <em>{user.name}.</em></h1>
    <section><h2>Podaci naloga</h2><dl><dt>Email</dt><dd>{user.email}</dd><dt>Uloga</dt><dd>{roles[user.role]}</dd></dl>
    <p>Otvori svoje planove i pogledaj sačuvane događaje.</p><Link to="/">Nazad na početnu</Link></section></>;
}
function App() {
  const { user, setUser, loading, error, setError } = useContext(Auth);
  const [pending, setPending] = useState(false);
  const navigate = useNavigate();
  async function logout() {
    setPending(true);
    try { await api('/auth/logout', { method: 'POST', body: {} }); setUser(null); setError(''); navigate('/'); }
    catch (e) { setError(e.message); } finally { setPending(false); }
  }
  return <><header><Link to="/" className="brand">BG<span> događaji</span></Link>
    <nav aria-label="Glavna navigacija"><Link to="/">Početna</Link><Link to="/events">Događaji</Link>
    {!loading && (user ? <><Link to="/account">Moj nalog</Link><Link to="/saved">Želim da idem</Link>{['organizer','admin'].includes(user.role)&&<Link to="/manage">Upravljanje</Link>}<Button onClick={logout} disabled={pending}>{pending ? 'Sačekaj…' : 'Odjavi se'}</Button></> : <><Link to="/login">Prijava</Link><Link to="/register">Registracija</Link></>)}</nav></header>
    <main><Notice error>{error}</Notice><Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/events" element={<Events/>}/><Route path="/events/:id" element={<EventDetails user={user}/>}/>
      <Route path="/login" element={<AuthForm key="login"/>}/>
      <Route path="/register" element={<AuthForm key="register" register/>}/>
      <Route path="/saved" element={<SavedEvents user={user} loading={loading}/>}/>
      <Route path="/manage" element={<Manage user={user} loading={loading}/>}/>
      <Route path="/account" element={<Account/>}/>
      <Route path="*" element={<><h1 className="small-title">Stranica nije pronađena.</h1><Link to="/">Vrati se na početnu</Link></>}/>
    </Routes></main><footer>Projekat iz Internet tehnologija · BG događaji</footer></>;
}
createRoot(document.getElementById('root')).render(<React.StrictMode><BrowserRouter><AuthProvider><App/></AuthProvider></BrowserRouter></React.StrictMode>);
