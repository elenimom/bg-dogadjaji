import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import {app} from '../src/app.js';
import {specification} from '../src/docs/routes.js';
test('OpenAPI javno vraća 28 dokumentovanih operacija i ispravne reference',async()=>{
 const r=await request(app).get('/api/openapi.json').expect(200);
 assert.equal(r.body.openapi,'3.0.3');
 const operations=Object.values(r.body.paths).flatMap(p=>Object.values(p));
 assert.equal(operations.length,28);
 assert.equal(new Set(operations.map(o=>o.operationId)).size,28);
 function check(value){
  if(!value||typeof value!=='object')return;
  if(value.$ref){const parts=value.$ref.replace('#/','').split('/');let target=specification;for(const part of parts)target=target?.[part];assert.ok(target,value.$ref);}
  Object.values(value).forEach(check);
 }check(specification);
});
test('Swagger HTML, biblioteka i inicijalizacija dostupni su uz CSP',async()=>{
 const r=await request(app).get('/api/docs/').expect(200);
 assert.match(r.text,/swagger-ui-bundle.js/);assert.ok(r.headers['content-security-policy']);
 const js=await request(app).get('/api/docs/init.js').expect(200);assert.match(js.text,/X-BG-Request/);assert.match(js.text,/validatorUrl:null/);
 await request(app).get('/api/docs/assets/swagger-ui.css').expect(200);
 await request(app).get('/api/docs/assets/swagger-ui-bundle.js').expect(200);
});

test('Swagger interceptor prihvata ucitavanje specifikacije bez metode',async()=>{
 const {runInNewContext}=await import('node:vm');
 const js=await request(app).get('/api/docs/init.js').expect(200);
 let config;
 runInNewContext(js.text,{window:{},SwaggerUIBundle:options=>{config=options;}});
 const read={url:'/api/openapi.json'};
 assert.equal(config.requestInterceptor(read),read);
 assert.equal(read.headers,undefined);
 for(const method of ['post','PATCH','DELETE']){
  const write={method,headers:{'Content-Type':'application/json'}};
  assert.equal(config.requestInterceptor(write),write);
  assert.equal(write.headers['X-BG-Request'],'1');
  assert.equal(write.headers['Content-Type'],'application/json');
 }
 const noHeaders={method:'POST'};
 config.requestInterceptor(noHeaders);
 assert.equal(noHeaders.headers['X-BG-Request'],'1');
});
