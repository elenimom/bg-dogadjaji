import { Router } from 'express';
import { authController } from './controller.js';
import { digest, error, token } from './session.js';
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return error(res, 401, 'UNAUTHENTICATED', 'Prijavite se.');
    if (!roles.includes(req.user.role)) return error(res, 403, 'FORBIDDEN', 'Nemate dozvolu.');
    next();
  };
}
export function authRoutes(repository, { origin = 'http://localhost:5173', secure = false } = {}) {
  const router = Router();
  const controller = authController(repository, { secure });
  // Sopstveno zaglavlje i tačna provera Origin-a sprečavaju cross-site zahteve.
  // API ne omogućava CORS drugim poreklima.
  router.use((req, res, next) => {
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) &&
        (req.get('Origin') !== origin || req.get('X-BG-Request') !== '1')) {
      return error(res, 403, 'CSRF_REJECTED', 'Nedozvoljeno poreklo zahteva.');
    }
    next();
  });
  router.use(async (req, _res, next) => {
    const value = token(req);
    if (value && /^[a-f0-9]{64}$/.test(value)) {
      req.sessionHash = digest(value);
      req.user = await repository.sessionUser(req.sessionHash);
    }
    next();
  });
  router.post('/register', controller.register);
  router.post('/login', controller.login);
  router.get('/me', controller.me);
  router.post('/logout', controller.logout);
  return router;
}
