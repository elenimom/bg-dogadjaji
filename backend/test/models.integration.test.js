import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { createPool } from '../src/db.js';
import { UserModel } from '../src/models/user.js';
import { SessionModel } from '../src/models/session.js';
import { EventModel } from '../src/models/event.js';
import { CategoryModel } from '../src/models/category.js';
import { LocationModel } from '../src/models/location.js';
import { SavedEventModel } from '../src/models/saved-event.js';

test('Povezani modeli rade sa PostgreSQL bazom i cuvaju ogranicenja pristupa', {
  skip: process.env.RUN_DB_TESTS !== '1',
  timeout: 30000
}, async () => {
  const pool = createPool();
  const schema = 'test_models_' + randomBytes(8).toString('hex');
  const client = await pool.connect();
  let created = false;
  try {
    await client.query(`CREATE SCHEMA "${schema}"`);
    created = true;
    await client.query(`SET search_path TO "${schema}"`);
    const migrations = new URL('../migrations/', import.meta.url);
    for (const file of (await readdir(migrations)).filter(f => f.endsWith('.sql')).sort()) {
      await client.query(await readFile(new URL(file, migrations), 'utf8'));
    }
    // Svi modeli koriste izolovanu semu i istu konekciju, ukljucujuci transakciju promene uloge.
    const db = { query: client.query.bind(client), connect: async () => ({
      query: client.query.bind(client), release() {}
    }) };
    const users = new UserModel(db), sessions = new SessionModel(db);
    const categories = new CategoryModel(db), locations = new LocationModel(db);
    const events = new EventModel(db), saved = new SavedEventModel(db);
    const owner = await users.createUser({name:'Organizator',email:'owner@example.invalid',passwordHash:'test-only'});
    const visitor = await users.createUser({name:'Posetilac',email:'visitor@example.invalid',passwordHash:'test-only'});
    await users.role(owner.id,'admin');
    assert.deepEqual(await users.role(owner.id,'visitor'), {lastAdmin:true});
    assert.equal((await users.findUser('owner@example.invalid')).role,'admin');
    assert.equal((await users.users()).length,2);
    const category = await categories.write(null,{name:'Izlozba'});
    const location = await locations.write(null,{name:'Galerija',address:'Probna adresa 1',latitude:44.81,longitude:20.46});
    const input = {title:'Test dogadjaj',description:'Opis test dogadjaja.',category_id:category.id,
      location_id:location.id,starts_at:'2030-09-15T18:00:00Z',price:100};
    const event = await events.create(input,owner.id);
    const details = await events.get(event.id);
    assert.equal(details.category_name,'Izlozba');
    assert.equal(details.location_name,'Galerija');
    assert.equal(details.organizer_name,'Organizator');
    assert.equal((await events.list({})).total,1);
    await assert.rejects(events.create({...input,category_id:2147483647},owner.id),{code:'23503'});
    await assert.rejects(events.create({...input,price:-1},owner.id),{code:'23514'});
    const stranger = {...visitor,role:'organizer'};
    assert.equal(await events.update(event.id,{title:'Tudja izmena'},stranger),undefined);
    assert.equal(await events.remove(event.id,stranger),false);
    assert.equal((await events.update(event.id,{title:'Izmenjen dogadjaj'},{...owner,role:'organizer'})).title,'Izmenjen dogadjaj');
    assert.equal(await saved.save(visitor.id,event.id),true);
    assert.equal(await saved.save(visitor.id,event.id),true);
    assert.equal((await saved.saved(visitor.id)).length,1);
    await saved.unsave(owner.id,event.id);
    assert.equal((await saved.saved(visitor.id)).length,1);
    const hash = 'a'.repeat(64);
    await sessions.createSession(hash,visitor.id,new Date(Date.now()+60000));
    assert.equal((await sessions.sessionUser(hash)).id,visitor.id);
    await sessions.deleteSession(hash);
    assert.equal(await sessions.sessionUser(hash),undefined);
    await assert.rejects(categories.remove(category.id),{code:'23503'});
    assert.equal(await events.remove(event.id,{...owner,role:'organizer'}),true);
    assert.equal((await saved.saved(visitor.id)).length,0);
    assert.equal(await categories.remove(category.id),true);
    assert.equal(await locations.remove(location.id),true);
  } finally {
    try {
      await client.query('ROLLBACK');
      await client.query('SET search_path TO public');
      if (created) await client.query(`DROP SCHEMA "${schema}" CASCADE`);
    } finally {
      client.release();
      await pool.end();
    }
  }
});
