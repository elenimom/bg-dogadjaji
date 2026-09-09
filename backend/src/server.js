import { fileURLToPath } from 'node:url';
import { access } from 'node:fs/promises';
import { serverConfig } from './config.js';
import { adminRepository } from './admin/repository.js';
import { eventRepository } from './events/repository.js';
import { createApp } from './app.js';
import { createPool } from './db.js';
import { authRepository } from './auth/repository.js';
const config = serverConfig();
const frontendDir = config.serveFrontend ? fileURLToPath(new URL('../../frontend/dist/', import.meta.url)) : undefined;
if (frontendDir) await access(new URL('../../frontend/dist/index.html', import.meta.url));
const pool = createPool();
await pool.query('SELECT 1');
const app = createApp({ repository: authRepository(pool), events: eventRepository(pool), admin: adminRepository(pool),
  origin: config.origin, secure: config.secure, trustProxy: config.trustProxy, frontendDir });
const server = app.listen(config.port, '0.0.0.0', () => console.log('API je spreman.'));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(async () => { await pool.end(); process.exit(0); }));
