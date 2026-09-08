import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { requireRole } from '../src/auth/routes.js';

function setup() {
  const users = [], sessions = new Map();
  const repository = {
    async createUser({ name,email,passwordHash }) {
      if (users.some(u => u.email === email)) throw Object.assign(new Error(), { code:'23505' });
      const u = { id:users.length+1,name,email,password_hash:passwordHash,role:'visitor' };
      users.push(u); return u;
    },
    async findUser(email) { return users.find(u => u.email === email); },
    async createSession(hash,id,expires) { sessions.set(hash,{ id,expires }); },
    async sessionUser(hash) { const s=sessions.get(hash); return s && s.expires>new Date() ? users.find(u => u.id===s.id) : undefined; },
    async deleteSession(hash) { sessions.delete(hash); }
  };
  const app = createApp({ repository });
  const agent = request.agent(app);
  const post = path => agent.post('/api/auth/'+path).set('Origin','http://localhost:5173').set('X-BG-Request','1');
  return { app,agent,post,users,sessions };
}
const input = { name:'Test korisnik', email:'test@example.com', password:'DovoljnoDugaLozinka123!' };
test('Registracija ignoriše traženu admin ulogu i ne vraća hash', async () => {
  const s=setup();
  const r=await s.post('register').send({...input, role:'admin'}).expect(201);
  assert.equal(r.body.user.role,'visitor');
  assert.equal(r.body.user.password_hash,undefined);
  assert.notEqual(s.users[0].password_hash,input.password);
  assert.match(r.headers['set-cookie'][0],/HttpOnly/);
  assert.match(r.headers['set-cookie'][0],/SameSite=Strict/);
  await s.agent.get('/api/auth/me').expect(200);
});
test('Prijava, pogrešna lozinka, rotacija sesije i odjava', async () => {
  const s=setup();
  await s.post('register').send(input).expect(201);
  const before=[...s.sessions.keys()][0];
  await s.post('login').send({...input,password:'pogresna'}).expect(401);
  await s.post('login').send(input).expect(200);
  assert.equal(s.sessions.has(before),false);
  const cookie=(await s.post('login').send(input)).headers['set-cookie'][0].split(';')[0];
  await s.post('logout').send({}).expect(200);
  await s.agent.get('/api/auth/me').expect(401);
  await request(s.app).get('/api/auth/me').set('Cookie',cookie).expect(401);
});
test('Nepoznat email, duplikat emaila i validacija', async () => {
  const s=setup();
  await s.post('login').send(input).expect(401);
  await s.post('register').send({...input,password:'kratka'}).expect(400);
  await s.post('register').send(input).expect(201);
  await s.post('register').send({...input,email:input.email.toUpperCase()}).expect(409);
});
test('Zahtev sa drugog sajta ili bez zaglavlja je odbijen', async () => {
  const s=setup();
  await request(s.app).post('/api/auth/register').send(input).expect(403);
  await request(s.app).post('/api/auth/register').set('Origin','https://evil.example').set('X-BG-Request','1').send(input).expect(403);
});
test('Provera uloga odbija posetioca i neprijavljenog korisnika', () => {
  let status; let passed=false;
  const res={status(n){status=n;return this;},json(){}};
  const guard=requireRole('admin');
  guard({},res,()=>{passed=true;}); assert.equal(status,401);
  guard({user:{role:'visitor'}},res,()=>{passed=true;}); assert.equal(status,403);
  assert.equal(passed,false);
  guard({user:{role:'admin'}},res,()=>{passed=true;}); assert.equal(passed,true);
});
