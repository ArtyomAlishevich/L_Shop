import { Request, Response } from "express";
import { NotFoundError } from "../types/notFoundError";
import { BasketsService } from "../services/basketsService";

export class BasketsController {
/**
 * @openapi
 * /baskets:
 *   get:
 *     summary: Получить корзину текущего пользователя
 *     tags: [Basket]
 *     security:
 *       - sessionCookie: []
 *     responses:
 *       200:
 *         description: Объект корзины
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Basket'
 *       401:
 *         description: Не авторизован (нет сессии)
 *       404:
 *         description: Корзина не найдена
 *       500:
 *         description: Ошибка сервера
 */
    static get(req: Request, res: Response) : void{
        try {
            const userId = req.session.userId;
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

/**
 * @openapi
 * /baskets/count:
 *   get:
 *     summary: Получить общее количество товаров в корзине
 *     tags: [Basket]
 *     security:
 *       - sessionCookie: []
 *     responses:
 *       200:
 *         description: Количество товаров
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: integer
 *                   example: 3
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Корзина не найдена
 *       500:
 *         description: Ошибка сервера
 */
    static getCount(req: Request, res: Response) : void {
        try {
            const userId = req.session.userId;
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

/**
 * @openapi
 * /baskets/sum:
 *   get:
 *     summary: Получить общую сумму товаров в корзине
 *     tags: [Basket]
 *     security:
 *       - sessionCookie: []
 *     responses:
 *       200:
 *         description: Сумма в рублях
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: integer
 *                   example: 5999
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Корзина не найдена
 *       500:
 *         description: Ошибка сервера
 */
    static getSum(req: Request, res: Response) : void {
        try {
            const userId = req.session.userId;
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
/**
 * @openapi
 * /baskets/add:
 *   post:
 *     summary: Добавить игру в корзину (увеличить количество на 1)
 *     tags: [Basket]
 *     security:
 *       - sessionCookie: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - boardGameId
 *             properties:
 *               boardGameId:
 *                 type: string
 *                 example: "123"
 *     responses:
 *       201:
 *         description: Обновлённая корзина
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Basket'
 *       400:
 *         description: Некорректный запрос
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Игра или корзина не найдены
 *       500:
 *         description: Ошибка сервера
 */
    static async add(req: Request, res: Response) : Promise<void> {
        try {
            const { boardGameId } = req.body;
            const userId = req.session.userId as string;

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

    /**
     * @openapi
     * /baskets/remove:
     *   post:
     *     summary: Удалить одну единицу игры из корзины
     *     description: Уменьшает количество игры на 1. Если количество становится 0 - игра удаляется из корзины
     *     tags: [Basket]
     *     security:
     *       - sessionCookie: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - boardGameId
     *             properties:
     *               boardGameId:
     *                 type: string
     *                 format: uuid
     *                 example: "123e4567-e89b-12d3-a456-426614174000"
     *     responses:
     *       200:
     *         description: Обновлённая корзина
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 data:
     *                   $ref: '#/components/schemas/Basket'
     *       400:
     *         description: Некорректный запрос
     *       401:
     *         description: Не авторизован
     *       404:
     *         description: Игра или корзина не найдены
     *       500:
     *         description: Ошибка сервера
     */
    static async remove(req: Request, res: Response) : Promise<void> {
        try {
            const { boardGameId } = req.body;
            const userId = req.session.userId;

            if (!boardGameId) {
                res.status(400).json({ error: 'Ошибка при удалении настольной игры из корзины: id настольной игры обязательно' });
                return;
            }

            if(typeof boardGameId !== "string") {
                res.status(400).json({ error: 'Ошибка при удалении настольной игры из корзины: id настольной игры должно быть строкой'});
                return;
            }
            
            const basket = await BasketsService.remove(boardGameId, userId as string);
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

     /**
     * @openapi
     * /baskets/clear:
     *   post:
     *     summary: Полная очистка корзины
     *     description: Удаляет все товары из корзины пользователя
     *     tags: [Basket]
     *     security:
     *       - sessionCookie: []
     *     responses:
     *       200:
     *         description: Пустая корзина
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 data:
     *                   $ref: '#/components/schemas/Basket'
     *       401:
     *         description: Не авторизован
     *       404:
     *         description: Корзина не найдена
     *       500:
     *         description: Ошибка сервера
     */
    static async clear(req: Request, res: Response) : Promise<void> {
        try {
            const userId = req.session.userId;
            const basket = await BasketsService.clear(userId as string);
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

    /**
     * @openapi
     * /basket/remove/allSimillar:
     *   post:
     *     summary: Удалить все одинаковые игры из корзины
     *     description: Полностью удаляет все экземпляры указанной игры из корзины
     *     tags: [Basket]
     *     security:
     *       - sessionCookie: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - boardGameId
     *             properties:
     *               boardGameId:
     *                 type: string
     *                 format: uuid
     *                 example: "123e4567-e89b-12d3-a456-426614174000"
     *     responses:
     *       200:
     *         description: Обновлённая корзина
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 data:
     *                   $ref: '#/components/schemas/Basket'
     *       400:
     *         description: Некорректный запрос
     *       401:
     *         description: Не авторизован
     *       404:
     *         description: Игра или корзина не найдены
     *       500:
     *         description: Ошибка сервера
     */
    static async removeAllSimilar(req: Request, res: Response) : Promise<void> {
        try {
            const userId = req.session.userId;
            const { boardGameId } = req.body;

            if (!boardGameId) {
                res.status(400).json({ error: 'Ошибка при удалении набора одинаковых настольных игр из корзины: id настольной игры обязательно' });
                return;
            }

            if (typeof boardGameId !== "string") {
                res.status(400).json({ error: 'Ошибка при удалении набора одинаковых настольных игр из корзины: id настольной игры должно быть строкой' });
                return;
            }

            const basket = await BasketsService.removeAllSimilar(userId as string, boardGameId);
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