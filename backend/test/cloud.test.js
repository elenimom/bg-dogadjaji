import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { serverConfig } from '../src/config.js';

test('Cloud konfiguracija zahteva HTTPS i koristi Render adresu bez hardkodovanja', () => {
  const config = serverConfig({NODE_ENV:'production',RENDER:'true',RENDER_EXTERNAL_URL:'https://bg-example.onrender.com',PORT:'10000',SERVE_FRONTEND:'true'});
  assert.equal(config.origin,'https://bg-example.onrender.com');
  assert.equal(config.port,10000);
  assert.equal(config.secure,true);
  assert.equal(config.trustProxy,1);
  assert.equal(config.serveFrontend,true);
  assert.equal(serverConfig({}).trustProxy,false);
  assert.throws(() => serverConfig({NODE_ENV:'production',APP_ORIGIN:'http://localhost:5173'}),/HTTPS/);
  assert.throws(() => serverConfig({APP_ORIGIN:'https://user:password@example.com'}),/APP_ORIGIN/);
  assert.throws(() => serverConfig({APP_ORIGIN:'https://example.com/path'}),/APP_ORIGIN/);
  assert.throws(() => serverConfig({PORT:'wrong'}),/PORT/);
});

test('Cloud prikazuje React rute i zadrzava JSON greske za API i nedostajuce fajlove', async () => {
  const frontendDir = await mkdtemp(join(tmpdir(),'bg-frontend-'));
  try {
    await writeFile(join(frontendDir,'index.html'),'<!doctype html><div id="root">Test frontend</div>');
    const app = createApp({frontendDir,secure:true});
    for (const path of ['/','/events/5','/account','/saved','/admin']) {
      const r = await request(app).get(path).set('Accept','text/html').expect(200);
      assert.match(r.text,/Test frontend/);
      assert.match(r.headers['content-security-policy'], /https:\/\/\*\.basemaps\.cartocdn\.com/);
      assert.match(r.headers['content-security-policy'],/upgrade-insecure-requests/);
    }
    for (const path of ['/api/missing','/api','/missing.js']) {
      const r = await request(app).get(path).set('Accept','text/html').expect(404);
      assert.equal(r.body.error.code,'NOT_FOUND');
    }
    await request(app).get('/api/health').expect(200).expect('Content-Type',/json/);
    await request(app).get('/api/docs/').expect(200).expect('Content-Type',/html/);
    await request(app).post('/events').expect(404).expect('Content-Type',/json/);
  } finally { await rm(frontendDir,{recursive:true,force:true}); }
});

test('Produkcijska registracija postavlja Secure kolacic i odbija drugo poreklo', async () => {
  let sessions = 0;
  const repository = {
    createUser: async data => ({id:1,name:data.name,email:data.email,role:'visitor'}),
    createSession: async () => {sessions++;}
  };
  const app = createApp({repository,origin:'https://bg-example.onrender.com',secure:true,trustProxy:1});
  const body = {name:'Test korisnik',email:'test@example.invalid',password:'Test lozinka 123!'};
  const response = await request(app).post('/api/auth/register')
    .set('Origin','https://bg-example.onrender.com').set('X-BG-Request','1')
    .set('X-Forwarded-Proto','https').set('X-Forwarded-For','192.0.2.10').send(body).expect(201);
  const cookie = response.headers['set-cookie'][0];
  assert.match(cookie,/; Secure/);
  assert.match(cookie,/; HttpOnly/);
  assert.match(cookie,/; SameSite=Strict/);
  assert.equal(sessions,1);
  await request(app).post('/api/auth/register').set('Origin','https://other.example')
    .set('X-BG-Request','1').send(body).expect(403);
  assert.equal(sessions,1);
});
