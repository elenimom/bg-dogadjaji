import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import {createApp} from '../src/app.js';
function setup(role='admin'){
 const app=createApp({repository:{async sessionUser(){return {id:1,role};}},admin:{
 async users(){return [{id:1,name:'Admin',role:'admin'}];},
 async write(kind,id,data){return {id:id||2,...data};},
 async remove(){throw Object.assign(new Error(),{code:'23503'});},
 async role(){return {lastAdmin:true};}
 }});
 const call=(method,path)=>request(app)[method]('/api/admin'+path).set('Cookie','bg_session='+'a'.repeat(64)).set('Origin','http://localhost:5173').set('X-BG-Request','1');
 return {app,call};
}
test('Admin rute odbijaju posetioca, organizatora i neprijavljenog',async()=>{
 for(const role of ['visitor','organizer'])await setup(role).call('get','/users').expect(403);
 await request(setup().app).get('/api/admin/users').expect(401);
 await setup().call('get','/users').expect(200);
});
test('Validacija kategorije i koordinata',async()=>{
 const s=setup();
 await s.call('post','/categories').send({name:'A'}).expect(400);
 const r=await s.call('post','/categories').send({name:'Film'}).expect(201);assert.equal(r.body.item.name,'Film');
 await s.call('post','/locations').send({name:'Sala',address:'Beograd',latitude:91,longitude:20}).expect(400);
});
test('Povezana lokacija i poslednji administrator vraćaju konflikt',async()=>{
 const s=setup();await s.call('delete','/locations/1').send({}).expect(409);
 await s.call('patch','/users/1/role').send({role:'visitor'}).expect(409);
 await s.call('patch','/users/1/role').send({role:'superuser'}).expect(400);
});
test('Promene zahtevaju proveru porekla',async()=>{
 await request(setup().app).post('/api/admin/categories').send({name:'Film'}).expect(403);
});
