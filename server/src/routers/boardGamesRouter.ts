import { Router } from "express";
import { BoardGamesController } from "../controllers/boardGamesController";

const boardGamesRouter : Router = Router();
boardGamesRouter.get('/', BoardGamesController.getAll);

export default boardGamesRouter;