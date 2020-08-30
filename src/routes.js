import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import SessionController from './app/controllers/SessionController';
import RecipientsController from './app/controllers/RecipientsController';
import DeliverymansController from './app/controllers/DeliverymansController';
import FileController from './app/controllers/FileController';
import DeliveriesController from './app/controllers/DeliveriesController';

import auth from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

// Session controller
routes.post('/session', SessionController.store);

// Rota de autenticação
routes.use(auth);

// Recipients controller
routes.post('/recipients', RecipientsController.store);
routes.put('/recipients/:id', RecipientsController.update);

// Deliverymans controller
routes.post('/deliveryman', DeliverymansController.store);
routes.get('/deliveryman', DeliverymansController.index);
routes.put('/deliveryman/:id', DeliverymansController.update);
routes.delete('/deliveryman/:id', DeliverymansController.delete);

// Files controller
routes.post('/files', upload.single('file'), FileController.store);

// Deliverys controller
routes.post('/delivery', DeliveriesController.store);
routes.get('/delivery', DeliveriesController.index);
routes.put('/delivery/:id', DeliveriesController.update);
routes.delete('/delivery/:id', DeliveriesController.delete);

export default routes;
