export class UserModel {
  static table = "users";

  constructor(pool) {
    this.pool = pool;
  }

  async createUser({ name, email, passwordHash }) {
      const { rows } = await this.pool.query(
        "INSERT INTO users(name,email,password_hash) VALUES ($1,$2,$3) RETURNING id,name,email,role",
        [name, email, passwordHash]);
      return rows[0];
    }

  async findUser(email) {
      return (await this.pool.query('SELECT * FROM users WHERE email=$1', [email])).rows[0];
    }

  async users(){return (await this.pool.query('SELECT id,name,email,role FROM users ORDER BY id')).rows;}

  async role(id,role){
  const c=await this.pool.connect();
  try{await c.query('BEGIN');await c.query('LOCK TABLE users IN SHARE ROW EXCLUSIVE MODE');
   const target=(await c.query('SELECT role FROM users WHERE id=$1',[id])).rows[0];
   if(!target){await c.query('ROLLBACK');return null;}
   if(target.role==='admin'&&role!=='admin'){
    const n=(await c.query("SELECT count(*)::int AS n FROM users WHERE role='admin'")).rows[0].n;
    if(n<=1){await c.query('ROLLBACK');return {lastAdmin:true};}
   }
   const user=(await c.query('UPDATE users SET role=$1 WHERE id=$2 RETURNING id,name,email,role',[role,id])).rows[0];
   await c.query('COMMIT');return user;
  }catch(e){await c.query('ROLLBACK');throw e;}finally{c.release();}
 }
}
