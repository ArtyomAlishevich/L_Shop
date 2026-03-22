import { Router } from "express";
import { BasketsController } from "../controllers/basketsController";
import { authMiddleware } from "../middlewares/authMiddleware";

const basketsRouter : Router = Router();
basketsRouter.use(authMiddleware);
basketsRouter.get('/', BasketsController.get);
basketsRouter.get('/count', BasketsController.getCount);
basketsRouter.get('/sum', BasketsController.getSum);
basketsRouter.post('/add', BasketsController.add);
basketsRouter.post('/remove', BasketsController.remove);
basketsRouter.post('/clear', BasketsController.clear);
basketsRouter.post('/remove/allSimillar', BasketsController.removeAllSimilar);

export default basketsRouter;