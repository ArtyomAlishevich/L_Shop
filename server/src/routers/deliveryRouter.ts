import { Router } from 'express';
import { DeliveryController } from '../controllers/deliveryController';
import { authMiddleware } from '../middlewares/authMiddleware';

const deliveryRouter: Router = Router();
deliveryRouter.use(authMiddleware);
deliveryRouter.post('/', DeliveryController.create);
deliveryRouter.get('/:id', DeliveryController.getById);

export default deliveryRouter;