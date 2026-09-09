import { selection } from './event-selection.js';

export class SavedEventModel {
  static table = "saved_events";

  constructor(pool) {
    this.pool = pool;
  }

  async saved(userId) {return (await this.pool.query(selection+' JOIN saved_events s ON s.event_id=e.id WHERE s.user_id=$1 ORDER BY e.starts_at,e.id',[userId])).rows;}

  async save(userId,eventId) {
   const result=await this.pool.query('INSERT INTO saved_events(user_id,event_id) SELECT $1,id FROM events WHERE id=$2 ON CONFLICT(user_id,event_id) DO UPDATE SET user_id=EXCLUDED.user_id RETURNING event_id',[userId,eventId]);
   return result.rowCount>0;
  }

  async unsave(userId,eventId) {await this.pool.query('DELETE FROM saved_events WHERE user_id=$1 AND event_id=$2',[userId,eventId]);}
}
