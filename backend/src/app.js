import { integrationRoutes } from './integrations/routes.js';
import { adminRoutes } from './admin/routes.js';
import { savedRoutes } from './events/saved.js';
import { manageRoutes } from './events/manage.js';
import { eventRoutes } from './events/routes.js';
import express from 'express';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { authRoutes } from './auth/routes.js';

export function createApp({ repository, events, admin, origin, secure = false } = {}) {
  const app = express();
  app.use(helmet());
  app.use(express.json({ limit: '32kb' }));
  app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'bg-events-api' }));
  if (repository) app.use('/api/auth', rateLimit({
    windowMs: 15 * 60 * 1000, limit: 60, standardHeaders: 'draft-7', legacyHeaders: false,
    skip: req => req.method === 'GET',
    message: { error: { code: 'RATE_LIMITED', message: 'Previše pokušaja. Pokušajte kasnije.' } }
  }), authRoutes(repository, { origin, secure }));
  if (admin && repository) app.use('/api/admin', adminRoutes(admin, repository, { origin }));
  if (events && repository) app.use('/api/saved-events', savedRoutes(events, repository, { origin }));
  if (events && repository) app.use('/api/manage', manageRoutes(events, repository, { origin }));
  if (events) app.use('/api/integrations', integrationRoutes(events));
  if (events) app.use('/api', eventRoutes(events));
  app.use((_req, res) => res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Ruta nije pronađena.' } }));
  app.use((err, _req, res, _next) => {
    const status = [400, 413].includes(err.status) ? err.status : 500;
    res.status(status).json({ error: {
      code: status === 400 ? 'INVALID_JSON' : status === 413 ? 'PAYLOAD_TOO_LARGE' : 'INTERNAL_ERROR',
      message: status === 400 ? 'Neispravan JSON zahtev.' : status === 413 ? 'Zahtev je prevelik.' : 'Greška na serveru.'
    } });
  });
  return app;
}
export const app = createApp();
