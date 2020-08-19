import { Router } from 'express';

import SessionController from './app/controllers/SessionController';
import RecipientsController from './app/controllers/RecipientsController';
import DeliverymansController from './app/controllers/DeliverymansController';

import auth from './app/middlewares/auth';

const routes = new Router();

routes.post('/session', SessionController.store);
routes.post('/recipients', auth, RecipientsController.store);
routes.put('/recipients/:id', auth, RecipientsController.update);

routes.post('/deliveryman', auth, DeliverymansController.store);
// routes.get('/deliveryman', DeliverymanController.index);
// routes.put('/deliveryman', DeliverymanController.update);
// routes.delete('/deliveryman', DeliverymanController.delete);

export default routes;
