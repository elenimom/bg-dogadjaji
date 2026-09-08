import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app.js';
test('Javni pregled prosleđuje proverene filtere repository-ju',async()=>{
 let captured;
 const app=createApp({events:{async list(filters){captured=filters;return {events:[],total:0,page:filters.page,pageSize:12};}}});
 await request(app).get('/api/events?q=izlozba&maxPrice=0&category=2&page=3&date=2026-09-15').expect(200);
 assert.deepEqual(captured,{q:'izlozba',maxPrice:0,category:2,page:3,date:'2026-09-15'});
});
test('Neispravni filteri se odbijaju pre poziva baze',async()=>{
 const app=createApp({events:{async list(){throw new Error('Ne sme do baze');}}});
 for(const query of ['page=-1','page=abc','category=0','date=2026-02-30','maxPrice=-10','q=a&q=b'])
 await request(app).get('/api/events?'+query).expect(400);
});
test('Detalji razlikuju neispravan ID, nepostojeći događaj i uspeh',async()=>{
 const app=createApp({events:{async get(id){return id===1?{id:1,title:'Primer'}:undefined;}}});
 await request(app).get('/api/events/abc').expect(400);
 await request(app).get('/api/events/2').expect(404);
 const r=await request(app).get('/api/events/1').expect(200);assert.equal(r.body.event.id,1);
});
