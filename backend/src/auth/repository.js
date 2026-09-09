import { UserModel } from '../models/user.js';
import { SessionModel } from '../models/session.js';

export function authRepository(pool) {
  const users = new UserModel(pool);
  const sessions = new SessionModel(pool);
  return {
    createUser: users.createUser.bind(users),
    findUser: users.findUser.bind(users),
    createSession: sessions.createSession.bind(sessions),
    sessionUser: sessions.sessionUser.bind(sessions),
    deleteSession: sessions.deleteSession.bind(sessions)
  };
}
