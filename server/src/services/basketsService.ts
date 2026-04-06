import { BasketsDatabase } from "../../db/basketsDatabase";
import { BoardGamesDatabase } from "../../db/boardGamesDatabase";
import { UsersDatabase } from "../../db/usersDatabase";
import { DuplicateError } from "../types/duplicateError";
import { IBasket } from "../types/iBasket";
import { IUser } from "../types/iUser";
import { NotFoundError } from "../types/notFoundError";

export class BasketsService {
    static get(userId: string) : IBasket {
        try {
            if (!UsersDatabase.getById(userId)) {
                throw new NotFoundError(`Не найден пользователь с id ${userId}`);
            }

            const basket = BasketsDatabase.get(userId);
            if (!basket) {
                throw new NotFoundError(`У пользователя с id ${userId} не найдена корзина`);
            }
            
            console.log(`Получена корзина для пользователя с id ${userId}`);
            return basket;
        } catch (error) {
            throw error;
        }
    }

    static async create(user: IUser) : Promise<void> {
        try {
            await BasketsDatabase.create(user);
        } catch (error) {
            throw error;
        }
    }

    static getCount(userId: string) : number {
        try {
            if (!UsersDatabase.getById(userId)) {
                throw new NotFoundError(`Не найден пользователь с id ${userId}`);
            }

            const count = BasketsDatabase.getCount(userId);
            if (count === undefined) {
                throw new NotFoundError(`У пользователя с id ${userId} не найдена корзина`);
            }
            console.log(`У пользователя с id ${userId} найдено ${count} товаров в корзине`);
            return count;
        }
        catch (error) {
            throw error;
        }
    }

    static getSum(userId: string) : number {
        try {
            if (!UsersDatabase.getById(userId)) {
                throw new NotFoundError(`Не найден пользователь с id ${userId}`);
            }
            
            const sum = BasketsDatabase.getSum(userId);
            if (sum === undefined) {
                throw new NotFoundError(`У пользователя с id ${userId} не найдена корзина`);
            }
            
            console.log(`У пользователя с id ${userId} найдено товаров в корзине на сумму ${sum} рублей`);
            return sum;
        } catch (error) {
            throw error;
        }
    }

    static async add(boardGameId: string, userId: string) : Promise<IBasket> {
        try {
            const boardGame = BoardGamesDatabase.getById(boardGameId);
            if (!boardGame) {
                throw new NotFoundError(`Не найдена настольная игра ${boardGameId}`);
            }

            if (!UsersDatabase.getById(userId)) {
                throw new NotFoundError(`Не найден пользователь с id ${userId}`);
            }

            const basket = await BasketsDatabase.add(boardGameId, userId);
            return basket;
        } catch (error) {
            throw error;
        }
    }

    static async remove(boardGameId: string, userId: string) : Promise<IBasket> {
        try {
            const boardGame = BoardGamesDatabase.getById(boardGameId);
            if (!boardGame) {
                throw new NotFoundError(`Не найдена настольная игра ${boardGameId}`);
            }

            if (!UsersDatabase.getById(userId)) {
                throw new NotFoundError(`Не найден пользователь с id ${userId}`);
            }

            const basket = await BasketsDatabase.remove(boardGameId, userId);
            return basket;
        } catch (error) {
            throw error;
        }
    }

    static async clear(userId: string) : Promise<IBasket> {
        try {
            if (!UsersDatabase.getById(userId)) {
                throw new NotFoundError(`Не найден пользователь с id ${userId}`);
            }

            const basket = await BasketsDatabase.clear(userId);
            return basket;
        } catch (error) {
            throw error;
        }
    }

    static async removeAllSimilar(userId: string, boardGameId: string) : Promise<IBasket> {
        try {
            const boardGame = BoardGamesDatabase.getById(boardGameId);
            if (!boardGame) {
                throw new NotFoundError(`Не найдена настольная игра ${boardGameId}`);
            }

            if (!UsersDatabase.getById(userId)) {
                throw new NotFoundError(`Не найден пользователь с id ${userId}`);
            }

            const basket = await BasketsDatabase.removeAllSimilar(userId, boardGameId);
            return basket;
        } catch (error) {
            throw error;
        }
    }
}