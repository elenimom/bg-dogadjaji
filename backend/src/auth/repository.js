export function authRepository(pool) {
  return {
    async createUser({ name, email, passwordHash }) {
      const { rows } = await pool.query(
        "INSERT INTO users(name,email,password_hash) VALUES ($1,$2,$3) RETURNING id,name,email,role",
        [name, email, passwordHash]);
      return rows[0];
    },
    async findUser(email) {
      return (await pool.query('SELECT * FROM users WHERE email=$1', [email])).rows[0];
    },
    async createSession(hash, userId, expires) {
      await pool.query('DELETE FROM sessions WHERE expires_at <= NOW()');
      await pool.query('INSERT INTO sessions(token_hash,user_id,expires_at) VALUES ($1,$2,$3)', [hash,userId,expires]);
    },
    async sessionUser(hash) {
      return (await pool.query('SELECT u.id,u.name,u.email,u.role FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.expires_at>NOW()', [hash])).rows[0];
    },
    async deleteSession(hash) {
      await pool.query('DELETE FROM sessions WHERE token_hash=$1', [hash]);
    }
  };
}
