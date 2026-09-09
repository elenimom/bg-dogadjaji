import { serverConfig } from '../src/config.js';
serverConfig();
// Besplatan servis nema pre-deploy korak: migracije zavrsavamo pre HTTP servera.
await import('./migrate.js');
if (process.env.SEED_DEMO === 'true') await import('./seed.js');
await import('../src/server.js');
