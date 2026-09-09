import { UserModel } from '../models/user.js';
import { CategoryModel } from '../models/category.js';
import { LocationModel } from '../models/location.js';

export function adminRepository(pool) {
  const users = new UserModel(pool);
  const resources = {
    categories: new CategoryModel(pool),
    locations: new LocationModel(pool)
  };
  function resource(kind) {
    if (!Object.hasOwn(resources, kind)) throw new Error('Invalid resource');
    return resources[kind];
  }
  return {
    users: () => users.users(),
    role: (id, role) => users.role(id, role),
    list: kind => resource(kind).list(),
    write: (kind, id, data) => resource(kind).write(id, data),
    remove: (kind, id) => resource(kind).remove(id)
  };
}
