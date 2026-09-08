import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app } from '../src/app.js';

test('Provera dostupnosti vraća JSON i bezbednosna zaglavlja', async () => {
  const response = await request(app).get('/api/health').expect(200);
  assert.equal(response.body.status, 'ok');
  assert.equal(response.headers['x-content-type-options'], 'nosniff');
});
test('Nepostojeća ruta vraća JSON grešku', async () => {
  const response = await request(app).get('/api/missing').expect(404);
  assert.equal(response.body.error.code, 'NOT_FOUND');
});
test('Neispravan JSON ne otkriva interne detalje', async () => {
  const response = await request(app).post('/api/health')
    .set('Content-Type', 'application/json').send('{').expect(400);
  assert.equal(response.body.error.code, 'INVALID_JSON');
  assert.equal(response.body.stack, undefined);
});
