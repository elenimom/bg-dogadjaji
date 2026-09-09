import { EventModel } from '../models/event.js';
import { SavedEventModel } from '../models/saved-event.js';
import { CategoryModel } from '../models/category.js';
import { LocationModel } from '../models/location.js';

export function eventRepository(pool) {
  const events = new EventModel(pool);
  const saved = new SavedEventModel(pool);
  const categories = new CategoryModel(pool);
  const locations = new LocationModel(pool);
  return {
    list: events.list.bind(events),
    owned: events.owned.bind(events),
    create: events.create.bind(events),
    update: events.update.bind(events),
    remove: events.remove.bind(events),
    get: events.get.bind(events),
    saved: saved.saved.bind(saved),
    save: saved.save.bind(saved),
    unsave: saved.unsave.bind(saved),
    categories: () => categories.byName(),
    locations: () => locations.byName()
  };
}
