import { Router } from "express";
import { adminMiddleware } from "../middlewares/adminMiddleware";
import { AdminController } from "../controllers/adminController";
import { authMiddleware } from "../middlewares/authMiddleware";

const adminRouter : Router = Router();
adminRouter.use(authMiddleware);
adminRouter.use(adminMiddleware);

adminRouter.post('/boardGame', AdminController.createBoardGame);
adminRouter.put('/boardGame/:id', AdminController.updateBoardGame);
adminRouter.delete('/boardGame/:id', AdminController.deleteBoardGame);

export default adminRouter;