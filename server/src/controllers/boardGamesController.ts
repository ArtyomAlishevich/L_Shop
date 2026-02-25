import { Request, Response } from "express";
import { BoardGamesService } from "../services/boardGamesService";
import { NotFoundError } from "../types/notFoundError";

export class BoardGamesController {
    static getAll(req: Request, res: Response) {
        try {
            const data = BoardGamesService.getAll();
            res.status(200).json({data: data});
        } catch(error) {
            console.log((error as Error).message);
            res.status(500).json(`Ошибка при получении всех настольных игр: ${(error as Error).message}`);
        }
    }

    static getById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            if (!id || id === '') {
                res.status(400).json({ message: 'Ошибка при получении игры по id: Id не может быть пустым' });
                return;
            }

            const boardGame = BoardGamesService.getById(id as string);
            res.status(200).json({ data: boardGame });
        } catch (error) {
            console.log((error as Error).message);
            if (error instanceof NotFoundError) {
                res.status(404).json({ message: `Ошибка при получении настольной игры по id: ${error.message}`});
                return;
            }

            res.status(500).json({ message: `Ошибка при получении настольной игры по id: ${(error as Error).message}`});
        }
    }
}