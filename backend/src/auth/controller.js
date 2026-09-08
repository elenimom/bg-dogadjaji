import { randomBytes } from 'node:crypto';
import { hashPassword, verifyPassword } from './password.js';
import { digest, safeUser, error, cookieName } from './session.js';

export function authController(repository, { secure = false } = {}) {
  const options = { httpOnly: true, sameSite: 'strict', secure, path: '/' };
  async function startSession(req, res, user) {
    if (req.sessionHash) await repository.deleteSession(req.sessionHash);
    const value = randomBytes(32).toString('hex');
    const maxAge = 8 * 60 * 60 * 1000;
    await repository.createSession(digest(value), user.id, new Date(Date.now() + maxAge));
    res.cookie(cookieName, value, { ...options, maxAge });
  }
  const register = async (req, res) => {
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
  };
  const login = async (req, res) => {
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
  };
  const me = (req, res) => {
    if (!req.user) return error(res, 401, 'UNAUTHENTICATED', 'Prijavite se.');
    res.json({ user: safeUser(req.user) });
  };
  const logout = async (req, res) => {
    if (req.sessionHash) await repository.deleteSession(req.sessionHash);
    res.clearCookie(cookieName, options);
    res.json({ message: 'Uspešno ste odjavljeni.' });
  };
  return { register, login, me, logout };
}
