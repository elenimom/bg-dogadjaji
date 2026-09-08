import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import {createApp} from '../src/app.js';
import {eventRepository} from '../src/events/repository.js';
function setup(){
 const calls=[];
 const app=createApp({repository:{async sessionUser(){return {id:7,role:'visitor'};}},events:{
 async saved(id){calls.push(['list',id]);return [];},
 async save(user,event){calls.push(['save',user,event]);return event===1;},
 async unsave(user,event){calls.push(['remove',user,event]);}
 }});
 const send=(method,path)=>request(app)[method]('/api/saved-events'+path).set('Cookie','bg_session='+'a'.repeat(64)).set('Origin','http://localhost:5173').set('X-BG-Request','1');
 return {app,send,calls};
}
test('Lista zahteva prijavu i koristi ID iz sesije',async()=>{
 const s=setup();await request(s.app).get('/api/saved-events').expect(401);
 await s.send('get','?user_id=99').expect(200);assert.deepEqual(s.calls,[['list',7]]);
});
test('Čuvanje i uklanjanje ignorišu tuđi ID u zahtevu',async()=>{
 const s=setup();
 await s.send('post','/1').send({user_id:99}).expect(200);
 await s.send('delete','/1').send({user_id:99}).expect(200);
 assert.deepEqual(s.calls,[['save',7,1],['remove',7,1]]);
});
test('Nepostojeći događaj, neispravan ID i tuđe poreklo su odbijeni',async()=>{
 const s=setup();
 await s.send('post','/2').send({}).expect(404);
 await s.send('post','/abc').send({}).expect(400);
 await request(s.app).post('/api/saved-events/1').send({}).expect(403);
});
test('SQL ograničava uklanjanje na vlasnika i čuvanje rešava duplikate',async()=>{
 const calls=[];const repo=eventRepository({async query(sql,values){calls.push({sql,values});return {rowCount:1,rows:[]};}});
 await repo.unsave(7,2);assert.match(calls[0].sql,/user_id=\$1 AND event_id=\$2/);assert.deepEqual(calls[0].values,[7,2]);
 await repo.save(7,2);assert.match(calls[1].sql,/ON CONFLICT/);assert.deepEqual(calls[1].values,[7,2]);
});
