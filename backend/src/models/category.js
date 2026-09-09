export class CategoryModel {
  static table = "categories";

  constructor(pool) {
    this.pool = pool;
  }

  async list() { return (await this.pool.query('SELECT * FROM categories ORDER BY id')).rows; }

  async byName() { return (await this.pool.query('SELECT * FROM categories ORDER BY name')).rows; }

  async write(id, data) {
    const values = [data.name];
    if (id) {
      values.push(id);
      return (await this.pool.query('UPDATE categories SET name=$1 WHERE id=$2 RETURNING *', values)).rows[0];
    }
    return (await this.pool.query('INSERT INTO categories(name) VALUES ($1) RETURNING *', values)).rows[0];
  }

  async remove(id) { return (await this.pool.query('DELETE FROM categories WHERE id=$1 RETURNING id', [id])).rowCount > 0; }
}
