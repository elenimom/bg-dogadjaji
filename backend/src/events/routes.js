import { Router } from 'express';
import { eventController } from './controller.js';
export function eventRoutes(repository) {
 const router=Router();
 const controller=eventController(repository);
 router.get('/categories', controller.categories);
 router.get('/events', controller.list);
 router.get('/events/:id', controller.details);
 return router;
}
