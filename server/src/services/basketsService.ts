import { BasketsDatabase } from "../../db/basketsDatabase";
import { UsersDatabase } from "../../db/usersDatabase";
import { DuplicateError } from "../types/duplicateError";
import { IBasket } from "../types/iBasket";
import { IUser } from "../types/iUser";
import { NotFoundError } from "../types/notFoundError";

export class BasketsService {
    /**
     * Возвращает корзину пользователя.
     * 
     * @param userId - идентификатор пользователя
     * @returns {IBasket} объект корзины с товарами
     * 
     * @throws {NotFoundError} если пользователь не найден
     * @throws {NotFoundError} если у пользователя нет корзины
     * 
     * @example
     * const basket = BasketsService.get('123e4567-e89b-12d3-a456-426614174000');
     * console.log(basket.count); // 3
     */
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

     /**
     * Создаёт пустую корзину для нового пользователя.
     * Вызывается автоматически при регистрации пользователя.
     * 
     * @param user - объект пользователя
     * @param user.id - идентификатор пользователя
     * 
     * @returns {Promise<void>}
     * 
     * @throws {Error} при ошибке создания корзины в базе данных
     * 
     * @example
     * await BasketsService.create(newUser);
     */
    static async create(user: IUser) : Promise<void> {
        try {
            await BasketsDatabase.create(user);
        } catch (error) {
            throw error;
        }
    }

     /**
     * Возвращает общее количество товаров в корзине пользователя.
     * Суммирует quantity всех позиций в корзине.
     * 
     * @param userId - идентификатор пользователя
     * @returns {number} общее количество единиц товаров
     * 
     * @throws {NotFoundError} если пользователь не найден
     * @throws {NotFoundError} если корзина не найдена
     * 
     * @example
     * const count = BasketsService.getCount('123e4567-e89b-12d3-a456-426614174000');
     * console.log(count); // 5
     */
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

     /**
     * Возвращает общую сумму товаров в корзине пользователя.
     * Суммирует price * quantity для всех позиций.
     * 
     * @param userId - идентификатор пользователя
     * @returns {number} сумма в рублях
     * 
     * @throws {NotFoundError} если пользователь не найден
     * @throws {NotFoundError} если корзина не найдена
     * 
     * @example
     * const sum = BasketsService.getSum('123e4567-e89b-12d3-a456-426614174000');
     * console.log(sum); // 5999
     */
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

     /**
     * Добавляет одну единицу игры в корзину.
     * Если игра уже есть в корзине - увеличивает количество на 1.
     * Если игры нет - добавляет новую позицию с quantity = 1.
     * 
     * @param boardGameId - идентификатор настольной игры
     * @param userId - идентификатор пользователя
     * 
     * @returns {Promise<IBasket>} обновлённая корзина
     * 
     * @throws {NotFoundError} если пользователь не найден
     * @throws {Error} если не удалось обновить корзину
     * 
     * @example
     * const updatedBasket = await BasketsService.add(
     *   '123e4567-e89b-12d3-a456-426614174000',
     *   'user-123'
     * );
     */
    static async add(boardGameId: string, userId: string) : Promise<IBasket> {
        try {
            if (!UsersDatabase.getById(userId)) {
                throw new NotFoundError(`Не найден пользователь с id ${userId}`);
            }

            const basket = await BasketsDatabase.add(boardGameId, userId);
            return basket;
        } catch (error) {
            throw error;
        }
    }

     /**
     * Удаляет одну единицу игры из корзины.
     * Если количество становится равным 0 - позиция удаляется из корзины.
     * 
     * @param boardGameId - идентификатор настольной игры
     * @param userId - идентификатор пользователя
     * 
     * @returns {Promise<IBasket>} обновлённая корзина
     * 
     * @throws {NotFoundError} если пользователь не найден
     * @throws {NotFoundError} если игра не найдена в корзине
     * @throws {Error} при ошибке обновления корзины
     * 
     * @example
     * const updatedBasket = await BasketsService.remove(
     *   '123e4567-e89b-12d3-a456-426614174000',
     *   'user-123'
     * );
     */
    static async remove(boardGameId: string, userId: string) : Promise<IBasket> {
        try {
            if (!UsersDatabase.getById(userId)) {
                throw new NotFoundError(`Не найден пользователь с id ${userId}`);
            }

            const basket = await BasketsDatabase.remove(boardGameId, userId);
            return basket;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Полностью очищает корзину пользователя.
     * Удаляет все товары из корзины.
     * 
     * @param userId - идентификатор пользователя
     * 
     * @returns {Promise<IBasket>} пустая корзина
     * 
     * @throws {NotFoundError} если пользователь не найден
     * @throws {Error} при ошибке очистки корзины
     * 
     * @example
     * const emptyBasket = await BasketsService.clear('user-123');
     * console.log(emptyBasket.count); // 0
     */
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

     /**
     * Удаляет все одинаковые игры из корзины.
     * Полностью удаляет позицию с указанной игрой независимо от количества.
     * 
     * @param userId - идентификатор пользователя
     * @param boardGameId - идентификатор настольной игры
     * 
     * @returns {Promise<IBasket>} обновлённая корзина
     * 
     * @throws {NotFoundError} если пользователь не найден
     * @throws {NotFoundError} если игра не найдена в корзине
     * @throws {Error} при ошибке удаления
     * 
     * @example
     * const updatedBasket = await BasketsService.removeAllSimilar(
     *   'user-123',
     *   '123e4567-e89b-12d3-a456-426614174000'
     * );
     */
    static async removeAllSimilar(userId: string, boardGameId: string) : Promise<IBasket> {
        try {
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