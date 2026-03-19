import { Request, Response } from 'express';
import { DeliveryService } from '../services/deliveryService';
import { NotFoundError } from '../types/notFoundError';
import { IDeliveryRequestDTO } from '../types/iDeliveryRequestDTO';

export class DeliveryController {
    /**
     * @openapi
     * /delivery:
     *   post:
     *     summary: Оформить доставку (создать заказ)
     *     description: Создает заказ на основе текущей корзины пользователя и очищает корзину
     *     tags: [Delivery]
     *     security:
     *       - sessionCookie: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - phone
     *               - email
     *               - country
     *               - city
     *               - street
     *               - house
     *               - paymentMethod
     *             properties:
     *               phone:
     *                 type: string
     *                 description: Номер телефона для связи
     *                 example: "+71234567890"
     *               email:
     *                 type: string
     *                 format: email
     *                 description: Email для уведомлений
     *                 example: "user@example.com"
     *               country:
     *                 type: string
     *                 description: Страна доставки
     *                 example: "Россия"
     *               city:
     *                 type: string
     *                 description: Город доставки
     *                 example: "Москва"
     *               street:
     *                 type: string
     *                 description: Улица доставки
     *                 example: "Ленина"
     *               house:
     *                 type: string
     *                 description: Номер дома
     *                 example: "10"
     *               apartment:
     *                 type: string
     *                 description: Номер квартиры (опционально)
     *                 example: "15"
     *               paymentMethod:
     *                 type: string
     *                 enum: [card, cash]
     *                 description: Способ оплаты
     *                 example: "card"
     *     responses:
     *       201:
     *         description: Созданный заказ
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 data:
     *                   $ref: '#/components/schemas/Delivery'
     *       400:
     *         description: Некорректный запрос или пустая корзина
     *       401:
     *         description: Пользователь не авторизован
     *       404:
     *         description: Пользователь или игра не найдены
     *       500:
     *         description: Ошибка сервера
     */
    static async create(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.session.userId as string;
            const { phone, email, country, city, street, house, apartment, paymentMethod } = req.body;

            if (!phone || !email || !country || !city || !street || !house || !paymentMethod) {
                res.status(400).json({
                    error: 'Ошибка оформления доставки: phone, email, country, city, street, house, paymentMethod обязательны'
                });
                return;
            }

            if (typeof phone !== 'string' || typeof email !== 'string' || typeof country !== 'string' ||
                typeof city !== 'string' || typeof street !== 'string' || typeof house !== 'string' ||
                (apartment && typeof apartment !== 'string') || typeof paymentMethod !== 'string') {
                res.status(400).json({ error: 'Все поля должны быть строками' });
                return;
            }

            const deliveryData: IDeliveryRequestDTO = {
                phone, email, country, city, street, house, apartment, paymentMethod
            };

            const delivery = await DeliveryService.create(userId, deliveryData);
            res.status(201).json({ data: delivery });
        } catch (error) {
            console.log(`Ошибка при оформлении доставки: ${(error as Error).message}`);

            if (error instanceof NotFoundError) {
                res.status(404).json({ error: error.message });
                return;
            }

            if (error instanceof Error && error.message === 'Нельзя оформить доставку с пустой корзиной') {
                res.status(400).json({ error: error.message });
                return;
            }

            res.status(500).json({ error: `Ошибка при оформлении доставки: ${(error as Error).message}` });
        }
    }

    
    /**
     * @openapi
     * /delivery/{id}:
     *   get:
     *     summary: Получить информацию о заказе по ID
     *     description: Возвращает детальную информацию о конкретном заказе (только для владельца)
     *     tags: [Delivery]
     *     security:
     *       - sessionCookie: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: ID заказа
     *         example: "123e4567-e89b-12d3-a456-426614174000"
     *     responses:
     *       200:
     *         description: Информация о заказе
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 data:
     *                   $ref: '#/components/schemas/Delivery'
     *       400:
     *         description: Некорректный ID заказа
     *       401:
     *         description: Пользователь не авторизован
     *       403:
     *         description: Доступ запрещен (заказ принадлежит другому пользователю)
     *       404:
     *         description: Заказ не найден
     *       500:
     *         description: Ошибка сервера
     */
    static async getById(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.session.userId;
            const { id } = req.params;

            console.log('getById запрос:', { userId, id });
            console.log('Сессия:', req.session);

            if (!userId) {
                console.log('Нет userId в сессии');
                res.status(401).json({ error: 'Не авторизован' });
                return;
            }

            if (!id || Array.isArray(id)) {
                console.log('Некорректный ID:', id);
                res.status(400).json({ error: 'Некорректный ID заказа' });
                return;
            }

            console.log('Ищем заказ с ID:', id);
            const delivery = await DeliveryService.getById(id as string);
            console.log('Найден заказ:', delivery);

            if (!delivery) {
                console.log('Заказ не найден');
                res.status(404).json({ error: 'Заказ не найден' });
                return;
            }

            console.log('userId из заказа:', delivery.userId);
            console.log('userId из сессии:', userId);

            if (delivery.userId !== userId) {
                console.log('Доступ запрещен - другой пользователь');
                res.status(403).json({ error: 'Доступ запрещен' });
                return;
            }

            console.log('Заказ найден и доступ разрешен');
            res.json({ data: delivery });
        } catch (error) {
            console.error('Ошибка получения заказа:', error);
            res.status(500).json({ error: 'Ошибка получения заказа' });
        }
    }
}