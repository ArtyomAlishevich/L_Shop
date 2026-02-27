import { Router } from "express";
import { AuthController } from "../controllers/authController";

const authRouter : Router = Router();
authRouter.post('/login', AuthController.login);
authRouter.post('/register', AuthController.register);
authRouter.post('/logout', AuthController.logout);

export default authRouter;