import { Router } from "express";
import { BasketsController } from "../controllers/basketsController";

const basketsRouter : Router = Router();
basketsRouter.get('/user/:userId', BasketsController.get);
basketsRouter.get('/user/:userId/count', BasketsController.getCount);
basketsRouter.get('/user/:userId/sum', BasketsController.getSum);
basketsRouter.post('/user/:userId/add', BasketsController.add);
basketsRouter.post('/user/:userId/remove', BasketsController.remove);
basketsRouter.post('/user/:userId/clear', BasketsController.clear);
basketsRouter.post('/user/:userId/remove/allSimillar', BasketsController.removeAllSimilar);

export default basketsRouter;