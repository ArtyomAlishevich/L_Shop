import { Request, Response } from "express";
import { NotFoundError } from "../types/notFoundError";
import { BasketsService } from "../services/basketsService";
import { DuplicateError } from "../types/duplicateError";
import { IBasket } from "../types/iBasket";

export class BasketsController {
    static get(req: Request, res: Response) : void{
        try {
            const userId = req.params.userId;
            const basket = BasketsService.get(userId as string);
            res.status(200).json({ data: basket });
        } catch (error) {
            console.log(`Ошибка при получении корзины: ` + (error as Error).message);

            if (error instanceof NotFoundError) {
                res.status(404).json({ error: 'Ошибка при получении корзины: '+ error.message });
                return;
            }

            res.status(500).json({ error: 'Ошибка при получении корзины ' + (error as Error).message });
        }
    }

    static getCount(req: Request, res: Response) : void {
        try {
            const userId = req.params.userId;
            const count = BasketsService.getCount(userId as string);
            res.status(200).json({ data: count });
        } catch (error) {
            console.log(`Ошибка при получении количества товаров в корзине: ` + (error as Error).message);

            if (error instanceof NotFoundError) {
                res.status(404).json({ error: 'Ошибка при получении количества товаров в корзине: ' + error.message });
                return;
            }

            res.status(500).json({ error: 'Ошибка при получении количества товаров в корзине: ' + (error as Error).message });
        }
    }

    static getSum(req: Request, res: Response) : void {
        try {
            const userId = req.params.userId;
            const sum = BasketsService.getSum(userId as string);
            res.status(200).json({ data: sum });
        } catch (error) {
            console.log(`Ошибка при получении суммы товаров в корзине: ` + (error as Error).message);

            if (error instanceof NotFoundError) {
                res.status(404).json({ error: 'Ошибка при получении суммы товаров в корзине: ' + error.message });
                return;
            }

            res.status(500).json({ error: 'Ошибка при получении суммы товаров в корзине: ' + (error as Error).message });
        }
    }

    static async add(req: Request, res: Response) : Promise<void> {
        try {
            const { boardGameId } = req.body;
            const userId = req.params.userId as string;

            if (!boardGameId) {
                res.status(400).json({ error: 'Ошибка при добавлении настольной игры в корзину: id настольной игры обязательно' });
                return;
            }

            if(typeof boardGameId !== "string") {
                res.status(400).json({ error: 'Ошибка при добавлении настольной игры в корзину: id настольной игры должно быть строкой'});
                return;
            }

            const basket = await BasketsService.add(boardGameId, userId);
            res.status(201).json({ data: basket });
        } catch (error) {
            console.log(`Ошибка при добавлении настольной игры в корзину: ` + (error as Error).message)

            if (error instanceof NotFoundError) {
                res.status(404).json({ error: 'Ошибка при добавлении настольной игры в корзину: ' + error.message });
                return;
            }

            res.status(500).json({ error: 'Ошибка при добавлении настольной игры в корзину: ' + (error as Error).message });
        }
    }

    static async remove(req: Request, res: Response) : Promise<void> {
        try {
            const { boardGameId } = req.body;
            const userId = req.params.userId as string;

            if (!boardGameId) {
                res.status(400).json({ error: 'Ошибка при удалении настольной игры из корзины: id настольной игры обязательно' });
                return;
            }

            if(typeof boardGameId !== "string") {
                res.status(400).json({ error: 'Ошибка при удалении настольной игры из корзины: id настольной игры должно быть строкой'});
                return;
            }
            
            const basket = await BasketsService.remove(boardGameId, userId);
            res.status(200).json({ data: basket });
        } catch (error) {
            console.log(`Ошибка при удалении настольной игры из корзины: ` + (error as Error).message)

            if (error instanceof NotFoundError) {
                res.status(404).json({ error: 'Ошибка при удалении настольной игры из корзины: ' + error.message });
                return;
            }

            res.status(500).json({ error: 'Ошибка при удалении настольной игры из корзины: ' + (error as Error).message });
        }
    }

    static async clear(req: Request, res: Response) : Promise<void> {
        try {
            const userId = req.params.userId as string;
            const basket = await BasketsService.clear(userId);
            res.status(200).json({ data: basket });
        } catch (error) {
            console.log(`Ошибка при очистке корзины: ` + (error as Error).message)

            if (error instanceof NotFoundError) {
                res.status(404).json({ error: 'Ошибка при очистке корзины: ' + error.message });
                return;
            }

            res.status(500).json('ошибка при очистке корзины: ' + (error as Error).message);
        }
    }

    static async removeAllSimilar(req: Request, res: Response) : Promise<void> {
        try {
            const userId = req.params.userId as string;
            const { boardGameId } = req.body;

            if (!boardGameId) {
                res.status(400).json({ error: 'Ошибка при удалении набора одинаковых настольных игр из корзины: id настольной игры обязательно' });
                return;
            }

            if (typeof boardGameId !== "string") {
                res.status(400).json({ error: 'Ошибка при удалении набора одинаковых настольных игр из корзины: id настольной игры должно быть строкой' });
                return;
            }

            const basket = await BasketsService.removeAllSimilar(userId, boardGameId);
            res.status(200).json({ data: basket });
        } catch (error) {
            console.log(`Ошибка при удалении набора одинаковых настольных игр из корзины: ` + (error as Error).message)

            if (error instanceof NotFoundError) {
                res.status(404).json({ error: 'Ошибка при удалении набора одинаковых настольных игр из корзины' + error.message });
                return;
            }

            res.status(500).json({ error: 'Ошибка при удалении набора одинаковых настольных игр из корзины' + (error as Error).message });
        }
    }
}