import express from 'express';
import helmet from 'helmet';

export const app = express();
app.use(helmet());
app.use(express.json({ limit: '32kb' }));

// Rutu koristi frontend za proveru da li je API dostupan.
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'bg-events-api' });
});

app.use((_req, res) => res.status(404).json({
  error: { code: 'NOT_FOUND', message: 'Ruta nije pronađena.' }
}));
app.use((err, _req, res, _next) => {
  const status = err.status === 400 ? 400 : 500;
  res.status(status).json({ error: {
    code: status === 400 ? 'INVALID_JSON' : 'INTERNAL_ERROR',
    message: status === 400 ? 'Neispravan JSON zahtev.' : 'Greška na serveru.'
  } });
});
