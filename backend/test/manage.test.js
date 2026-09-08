import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import {createApp} from '../src/app.js';
import {eventRepository} from '../src/events/repository.js';
const body={title:'Nova izložba',description:'Opis izložbe u Beogradu.',category_id:1,location_id:1,starts_at:'2026-10-01T18:00:00Z',price:0};
function setup(role='organizer'){
 const user={id:7,role};let saved;
 const events={
  async create(d,id){saved={...d,id:1,organizer_id:id};return saved;},
  async update(id,d,u){return id===1?{...d,id,organizer_id:u.id}:undefined;},
  async remove(id){return id===1;},
  async owned(){return [];}
 };
 const app=createApp({repository:{async sessionUser(){return user;}},events});
 const send=(method,path)=>request(app)[method]('/api/manage'+path).set('Cookie','bg_session='+'a'.repeat(64)).set('Origin','http://localhost:5173').set('X-BG-Request','1');
 return {app,send};
}
test('Organizator kreira događaj sa svojim ID-jem; ne bira drugog vlasnika',async()=>{
 const s=setup();const r=await s.send('post','/events').send(body).expect(201);assert.equal(r.body.event.organizer_id,7);
 await s.send('post','/events').send({...body,organizer_id:2}).expect(400);
});
test('Posetilac i neprijavljen korisnik ne mogu da kreiraju',async()=>{
 await setup('visitor').send('post','/events').send(body).expect(403);
 const s=setup();await request(s.app).post('/api/manage/events').set('Origin','http://localhost:5173').set('X-BG-Request','1').send(body).expect(401);
});
test('Validacija odbija negativnu cenu, skript URL i prazan PATCH',async()=>{
 const s=setup();
 await s.send('post','/events').send({...body,price:-1}).expect(400);
 await s.send('post','/events').send({...body,ticket_url:'javascript:alert(1)'}).expect(400);
 await s.send('patch','/events/1').send({}).expect(400);
 await s.send('patch','/events/1').send({title:'Novo ime'}).expect(200);
 await s.send('delete','/events/2').send({}).expect(404);
});
test('Cross-site zahtev je odbijen',async()=>{
 await request(setup().app).post('/api/manage/events').send(body).expect(403);
});
test('Repository zahteva vlasništvo atomskom SQL proverom za PATCH i DELETE',async()=>{
 const calls=[];const repo=eventRepository({async query(sql,values){calls.push({sql,values});return {rows:[],rowCount:0};}});
 assert.equal(await repo.update(9,{title:'Promena'},{id:7,role:'organizer'}),undefined);
 assert.equal(await repo.remove(9,{id:7,role:'organizer'}),false);
 assert.match(calls[0].sql,/organizer_id=/);assert.deepEqual(calls[0].values,['Promena',9,7,false]);
 assert.match(calls[1].sql,/organizer_id=/);assert.deepEqual(calls[1].values,[9,7,false]);
 await repo.remove(9,{id:1,role:'admin'});assert.equal(calls[2].values[2],true);
});
