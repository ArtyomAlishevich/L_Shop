import { DeliveryDatabase } from '../../db/deliveryDatabase';
import { UsersDatabase } from '../../db/usersDatabase';
import { BasketsService } from './basketsService';
import { BoardGamesDatabase } from '../../db/boardGamesDatabase';
import { IDelivery, IDeliveryItem } from '../types/iDelivery';
import { IDeliveryRequestDTO } from '../types/iDeliveryRequestDTO';
import { NotFoundError } from '../types/notFoundError';
import { v4 as uuidv4 } from 'uuid';

export class DeliveryService {
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
                id: uuidv4(),
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

    static async getById(id: string): Promise<IDelivery | undefined> {
        try {
            return await DeliveryDatabase.getById(id);
        } catch (error) {
            throw error;
        }
    }
}