export class LocationModel {
  static table = "locations";

  constructor(pool) {
    this.pool = pool;
  }

  async list() { return (await this.pool.query('SELECT * FROM locations ORDER BY id')).rows; }

  async byName() { return (await this.pool.query('SELECT * FROM locations ORDER BY name')).rows; }

  async write(id, data) {
    const values = [data.name, data.address, data.latitude, data.longitude];
    if (id) {
      values.push(id);
      return (await this.pool.query('UPDATE locations SET name=$1,address=$2,latitude=$3,longitude=$4 WHERE id=$5 RETURNING *', values)).rows[0];
    }
    return (await this.pool.query('INSERT INTO locations(name,address,latitude,longitude) VALUES ($1,$2,$3,$4) RETURNING *', values)).rows[0];
  }

  async remove(id) { return (await this.pool.query('DELETE FROM locations WHERE id=$1 RETURNING id', [id])).rowCount > 0; }
}
