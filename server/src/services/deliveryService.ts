import { DeliveryDatabase } from '../../db/deliveryDatabase';
import { UsersDatabase } from '../../db/usersDatabase';
import { BasketsService } from './basketsService';
import { BoardGamesDatabase } from '../../db/boardGamesDatabase';
import { IDelivery, IDeliveryItem } from '../types/iDelivery';
import { IDeliveryRequestDTO } from '../types/iDeliveryRequestDTO';
import { NotFoundError } from '../types/notFoundError';
import uuid from 'uuid';

export class DeliveryService {
     /**
     * Создаёт новый заказ (доставку) на основе текущей корзины пользователя.
     * 
     * @param userId - идентификатор пользователя, оформляющего заказ
     * @param data - данные для оформления доставки
     * @param data.phone - контактный телефон
     * @param data.email - email для уведомлений
     * @param data.country - страна доставки
     * @param data.city - город доставки
     * @param data.street - улица доставки
     * @param data.house - номер дома
     * @param data.apartment - номер квартиры (опционально)
     * @param data.paymentMethod - способ оплаты ('card' или 'cash')
     * 
     * @returns {Promise<IDelivery>} созданный объект доставки
     * 
     * @throws {NotFoundError} если пользователь не найден
     * @throws {NotFoundError} если корзина не найдена
     * @throws {NotFoundError} если игра из корзины не найдена в каталоге
     * @throws {Error} если корзина пуста
     * @throws {Error} если у игры нет параметров доставки
     * 
     * @example
     * const delivery = await DeliveryService.create('user-123', {
     *   phone: '+71234567890',
     *   email: 'user@example.com',
     *   country: 'Россия',
     *   city: 'Москва',
     *   street: 'Ленина',
     *   house: '10',
     *   apartment: '15',
     *   paymentMethod: 'card'
     * });
     */
    static async create(userId: string, data: IDeliveryRequestDTO): Promise<IDelivery> {
        try {
            const user = UsersDatabase.getById(userId);
            if (!user) {
                throw new NotFoundError(`Пользователь с id ${userId} не найден`);
            }

            const basket = BasketsService.get(userId);
            if (basket.count === 0) {
                throw new Error('Нельзя оформить доставку с пустой корзиной');
            }

            const items: IDeliveryItem[] = [];
            let totalDeliverySum = 0;

            for (const basketItem of basket.boardGames) {
                const boardGame = BoardGamesDatabase.getById(basketItem.boardGameId);
                if (!boardGame) {
                    throw new NotFoundError(`Игра с id ${basketItem.boardGameId} не найдена`);
                }
                if (!boardGame.delivery) {
                    throw new Error(`Для игры ${boardGame.name} не указаны параметры доставки`);
                }

                const pricePerUnit = basketItem.sum / basketItem.count;

                items.push({
                    boardGameId: basketItem.boardGameId,
                    count: basketItem.count,
                    price: pricePerUnit,
                    delivery: {
                        startCountry: boardGame.delivery.startCountry,
                        startTown: boardGame.delivery.startTown,
                        startStreet: boardGame.delivery.startStreet,
                        startHouseNumber: boardGame.delivery.startHouseNumber,
                        closestDate: boardGame.delivery.closestDate,
                        price: boardGame.delivery.price
                    }
                });

                totalDeliverySum += boardGame.delivery.price * basketItem.count;
            }

            const totalSum = basket.sum;
            const totalOrderSum = totalSum + totalDeliverySum;

            const delivery: IDelivery = {
                id: uuid.v4(),
                userId,
                contact: {
                    phone: data.phone,
                    email: data.email
                },
                address: {
                    country: data.country,
                    city: data.city,
                    street: data.street,
                    house: data.house,
                    apartment: data.apartment
                },
                paymentMethod: data.paymentMethod,
                items,
                totalCount: basket.count,
                totalSum,
                totalDeliverySum,
                totalOrderSum,
                createdAt: new Date().toISOString(),
                status: 'created'
            };

            const savedDelivery = await DeliveryDatabase.create(delivery);
            await BasketsService.clear(userId);
            return savedDelivery;
        } catch (error) {
            throw error;
        }
    }

     /**
     * Получает информацию о доставке по её идентификатору.
     * 
     * @param id - уникальный идентификатор доставки
     * @returns {Promise<IDelivery | undefined>} объект доставки или undefined, если не найдена
     * 
     * @throws {Error} при ошибке чтения базы данных
     * 
     * @example
     * const delivery = await DeliveryService.getById('123e4567-e89b-12d3-a456-426614174000');
     * if (delivery) {
     *   console.log(delivery.status); // 'created'
     * }
     */
    static async getById(id: string): Promise<IDelivery | undefined> {
        try {
            return await DeliveryDatabase.getById(id);
        } catch (error) {
            throw error;
        }
    }
}