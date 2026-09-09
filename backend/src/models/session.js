export class SessionModel {
  static table = "sessions";

  constructor(pool) {
    this.pool = pool;
  }

  async createSession(hash, userId, expires) {
      await this.pool.query('DELETE FROM sessions WHERE expires_at <= NOW()');
      await this.pool.query('INSERT INTO sessions(token_hash,user_id,expires_at) VALUES ($1,$2,$3)', [hash,userId,expires]);
    }

  async sessionUser(hash) {
      return (await this.pool.query('SELECT u.id,u.name,u.email,u.role FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.expires_at>NOW()', [hash])).rows[0];
    }

  async deleteSession(hash) {
      await this.pool.query('DELETE FROM sessions WHERE token_hash=$1', [hash]);
    }
}
