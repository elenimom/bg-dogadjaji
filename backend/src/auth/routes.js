import { Router } from 'express';
import { createHash, randomBytes } from 'node:crypto';
import { hashPassword, verifyPassword } from './password.js';
const digest = value => createHash('sha256').update(value).digest('hex');
const safeUser = ({ id, name, email, role }) => ({ id, name, email, role });
const error = (res, status, code, message) => res.status(status).json({ error: { code, message } });
const cookieName = 'bg_session';
function token(req) {
  return (req.headers.cookie || '').split(';').map(v => v.trim()).find(v => v.startsWith(cookieName + '='))?.slice(cookieName.length + 1);
}
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return error(res, 401, 'UNAUTHENTICATED', 'Prijavite se.');
    if (!roles.includes(req.user.role)) return error(res, 403, 'FORBIDDEN', 'Nemate dozvolu.');
    next();
  };
}
export function authRoutes(repository, { origin = 'http://localhost:5173', secure = false } = {}) {
  const router = Router();
  const options = { httpOnly: true, sameSite: 'strict', secure, path: '/' };
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
  async function startSession(req, res, user) {
    if (req.sessionHash) await repository.deleteSession(req.sessionHash);
    const value = randomBytes(32).toString('hex');
    const maxAge = 8 * 60 * 60 * 1000;
    await repository.createSession(digest(value), user.id, new Date(Date.now() + maxAge));
    res.cookie(cookieName, value, { ...options, maxAge });
  }
  router.post('/register', async (req, res) => {
    const { name, email, password } = req.body || {};
    if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100 ||
        typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        typeof password !== 'string' || password.length < 12 || password.length > 128) {
      return error(res, 400, 'VALIDATION_ERROR', 'Unesite ime, ispravan email i lozinku od 12 do 128 znakova.');
    }
    try {
      // Uloga iz zahteva se namerno ne prosleđuje bazi.
      const user = await repository.createUser({ name: name.trim(), email: email.toLowerCase(), passwordHash: await hashPassword(password) });
      await startSession(req, res, user);
      res.status(201).json({ user: safeUser(user) });
    } catch (e) {
      if (e.code === '23505') return error(res, 409, 'EMAIL_EXISTS', 'Email je već registrovan.');
      throw e;
    }
  });
  router.post('/login', async (req, res) => {
    const { email, password } = req.body || {};
    if (typeof email !== 'string' || email.length > 254 || typeof password !== 'string' || password.length > 128) {
      return error(res, 400, 'VALIDATION_ERROR', 'Unesite email i lozinku.');
    }
    const user = await repository.findUser(email.toLowerCase().trim());
    // Izvršava scrypt i za nepoznat email radi približno jednakog trajanja.
    const valid = await verifyPassword(password, user?.password_hash || ('0'.repeat(32) + ':' + '0'.repeat(128)));
    if (!user || !valid) return error(res, 401, 'INVALID_CREDENTIALS', 'Pogrešan email ili lozinka.');
    await startSession(req, res, user);
    res.json({ user: safeUser(user) });
  });
  router.get('/me', (req, res) => {
    if (!req.user) return error(res, 401, 'UNAUTHENTICATED', 'Prijavite se.');
    res.json({ user: safeUser(req.user) });
  });
  router.post('/logout', async (req, res) => {
    if (req.sessionHash) await repository.deleteSession(req.sessionHash);
    res.clearCookie(cookieName, options);
    res.json({ message: 'Uspešno ste odjavljeni.' });
  });
  return router;
}
