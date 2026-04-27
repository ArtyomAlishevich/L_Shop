import { Request, Response } from "express";
import { IBoardGameCreateDTO } from "../types/iBoardGameCreateDTO";
import { BoardGamesService } from "../services/boardGamesService";
import { NotFoundError } from "../types/notFoundError";
import { IBoardGameUpdateDTO } from "../types/iBoardGameUpdateDTO";

export class AdminController {
    static async createBoardGame(req: Request, res:Response) : Promise<void> {
        try {
            const newBoardGameData : IBoardGameCreateDTO = req.body;
            if (!newBoardGameData) {
                console.log('Ошибка при создании настольной игры: в теле запроса отсутствует информация о новой настольной игре');
                res.status(400).json({ error: 'Ошибка при создании настольной игры: в теле запроса отсутствует информация о новой настольной игре' });
                return;
            }

            if (!newBoardGameData.name.ru || !newBoardGameData.name.en || !newBoardGameData.description.ru 
                || !newBoardGameData.description.en || !newBoardGameData.categories.ru || !newBoardGameData.categories.en) {
                console.log('Ошибка при создании настольной игры: недостаточно данных об имени, описании и категориях игры на английском и русском языках');
                res.status(400).json({ error: 'Ошибка при создании настольной игры: недостаточно данных об имени, описании и категориях игры на английском и русском языках' });
                return;
            }

            const newBoardGame = await BoardGamesService.create(newBoardGameData);
            res.status(201).json({ data: newBoardGame });
        } catch (error) {
            console.log(`Ошибка при создании настольной игры: ${(error as Error).message}`);
            res.status(500).json({ error: `Ошибка при создании настольной игры: ${(error as Error).message}` });
        }
    }

    static async updateBoardGame(req: Request, res:Response) : Promise<void> {
        try {
            const boardGameId = req.params.id as string;
            const updatedBoardGameData : IBoardGameUpdateDTO = req.body;
            if (!updatedBoardGameData) {
                console.log('Ошибка при обновлении настольной игры: в теле запроса отсутствует информация об обновленной настольной игре');
                res.status(400).json({ error: 'Ошибка при обновлении настольной игры: в теле запроса отсутствует информация об обновленной настольной игре'});
                return;
            }

            const updatedBoardGame = await BoardGamesService.update(boardGameId, updatedBoardGameData);
            res.status(200).json(updatedBoardGame);
        } catch (error) {
            console.log(`Ошибка при обновлении настольной игры: ${(error as Error).message}`);

            if (error instanceof NotFoundError) {
                res.status(404).json({ error: `Ошибка при обновлении настольной игры: ${error.message}` });
                return;
            }

            res.status(500).json({ error: `Ошибка при обновлении настольной игры: ${(error as Error).message}` });
        }
    }

    static async deleteBoardGame(req: Request, res: Response) {
        try {
            const id = req.params.id as string;

            await BoardGamesService.delete(id);
            res.status(204).send();
        } catch (error) {
            console.log(`Ошибка при удалении настольной игры: ${(error as Error).message}`);

            if (error instanceof NotFoundError) {
                res.status(404).json({ error: `Ошибка при удалении настольной игры: ${error.message}` });
                return;
            }

            res.status(500).json({ error: `Ошибка при удалении настольной игры: ${(error as Error).message}` });
        }
    }
}