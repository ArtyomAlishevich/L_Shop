import { Router } from "express";
import { BoardGamesController } from "../controllers/boardGamesController";

const boardGamesRouter : Router = Router();
boardGamesRouter.get('/', BoardGamesController.getAll);
boardGamesRouter.get('/liked', BoardGamesController.getLikedGames);
boardGamesRouter.get('/:id', BoardGamesController.getById);
boardGamesRouter.post('/:id/like', BoardGamesController.like);
boardGamesRouter.post('/:id/unlike', BoardGamesController.unlike);

export default boardGamesRouter;