export function serverConfig(env = process.env) {
  const secure = env.NODE_ENV === 'production';
  const rawOrigin = env.APP_ORIGIN || env.RENDER_EXTERNAL_URL || (secure ? '' : 'http://localhost:5173');
  let url;
  try { url = new URL(rawOrigin); } catch { throw new Error('Podesiti ispravan APP_ORIGIN ili RENDER_EXTERNAL_URL.'); }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('APP_ORIGIN mora biti samo adresa sajta, bez putanje i pristupnih podataka.');
  }
  if (secure && url.protocol !== 'https:') throw new Error('Produkcija zahteva HTTPS APP_ORIGIN.');
  const port = Number(env.PORT || 3001);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Neispravan PORT.');
  return { secure, origin: url.origin, port, serveFrontend: env.SERVE_FRONTEND === 'true',
    trustProxy: env.RENDER === 'true' ? 1 : false };
}
