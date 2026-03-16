import { Request, Response } from 'express';
import { DeliveryService } from '../services/deliveryService';
import { NotFoundError } from '../types/notFoundError';
import { IDeliveryRequestDTO } from '../types/iDeliveryRequestDTO';

export class DeliveryController {
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

    static async getById(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.session.userId;
            const { id } = req.params;

            console.log('🔍 getById запрос:', { userId, id });
            console.log('📌 Сессия:', req.session);

            if (!userId) {
                console.log('❌ Нет userId в сессии');
                res.status(401).json({ error: 'Не авторизован' });
                return;
            }

            if (!id || Array.isArray(id)) {
                console.log('❌ Некорректный ID:', id);
                res.status(400).json({ error: 'Некорректный ID заказа' });
                return;
            }

            console.log('🔎 Ищем заказ с ID:', id);
            const delivery = await DeliveryService.getById(id as string);
            console.log('📦 Найден заказ:', delivery);

            if (!delivery) {
                console.log('❌ Заказ не найден');
                res.status(404).json({ error: 'Заказ не найден' });
                return;
            }

            console.log('👤 userId из заказа:', delivery.userId);
            console.log('👤 userId из сессии:', userId);

            if (delivery.userId !== userId) {
                console.log('❌ Доступ запрещен - другой пользователь');
                res.status(403).json({ error: 'Доступ запрещен' });
                return;
            }

            console.log('✅ Заказ найден и доступ разрешен');
            res.json({ data: delivery });
        } catch (error) {
            console.error('❌ Ошибка получения заказа:', error);
            res.status(500).json({ error: 'Ошибка получения заказа' });
        }
    }
}