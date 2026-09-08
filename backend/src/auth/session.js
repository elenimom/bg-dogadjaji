import { createHash } from 'node:crypto';
export const digest = value => createHash('sha256').update(value).digest('hex');
export const safeUser = ({ id, name, email, role }) => ({ id, name, email, role });
export const error = (res, status, code, message) => res.status(status).json({ error: { code, message } });
export const cookieName = 'bg_session';
export function token(req) {
  return (req.headers.cookie || '').split(';').map(v => v.trim()).find(v => v.startsWith(cookieName + '='))?.slice(cookieName.length + 1);
}
