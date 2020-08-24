import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import SessionController from './app/controllers/SessionController';
import RecipientsController from './app/controllers/RecipientsController';
import DeliverymansController from './app/controllers/DeliverymansController';
import FileController from './app/controllers/FileController';

import auth from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/session', SessionController.store);

routes.use(auth);

routes.post('/recipients', RecipientsController.store);
routes.put('/recipients/:id', RecipientsController.update);

routes.post('/deliveryman', DeliverymansController.store);
routes.get('/deliveryman', DeliverymansController.index);
routes.put('/deliveryman/:id', DeliverymansController.update);
routes.delete('/deliveryman/:id', DeliverymansController.delete);

routes.post('/files', upload.single('file'), FileController.store);

export default routes;
