import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { CommentsController } from "../controllers/commentsController";

const commentRouter : Router = Router();
commentRouter.use(authMiddleware);

commentRouter.post('/', CommentsController.add);
commentRouter.delete('/:id', CommentsController.delete);

export default commentRouter;