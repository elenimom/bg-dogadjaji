import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import request from 'supertest';
import {integrationRoutes} from '../src/integrations/routes.js';
function setup(fetcher,event={starts_at:new Date().toISOString(),latitude:44.8,longitude:20.4}){
 const app=express();app.use(integrationRoutes({async get(){return event;}},{fetcher}));return app;
}
test('Geokodiranje mapira GeoJSON, validira unos i kešira odgovor',async()=>{
 let calls=0;
 const app=setup(async()=>{calls++;return {ok:true,json:async()=>({features:[{geometry:{type:'Point',coordinates:[20.4,44.8]},properties:{name:'Galerija',street:'Ulica'}}]})};});
 await request(app).get('/geocode?q=a').expect(400);
 const r=await request(app).get('/geocode?q=Galerija').expect(200);assert.equal(r.body.results[0].latitude,44.8);
 await request(app).get('/geocode?q=Galerija').expect(200);assert.equal(calls,1);
});
test('Spoljašnja greška vraća 503',async()=>{
 await request(setup(async()=>{throw new Error('offline');})).get('/geocode?q=Beograd').expect(503);
});
test('Daleki datum ne poziva servis prognoze',async()=>{
 let called=false;const app=setup(async()=>{called=true;},{starts_at:'2099-01-01T18:00:00Z'});
 const r=await request(app).get('/weather/1').expect(200);assert.equal(r.body.available,false);assert.equal(called,false);
});
test('Prognoza koristi tačan datum i dnevne vrednosti',async()=>{
 const day=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Belgrade',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const app=setup(async()=>({ok:true,json:async()=>({daily:{time:[day],temperature_2m_min:[10],temperature_2m_max:[22],precipitation_probability_max:[15]}})}));
 const r=await request(app).get('/weather/1').expect(200);assert.equal(r.body.available,true);assert.equal(r.body.max,22);
});
