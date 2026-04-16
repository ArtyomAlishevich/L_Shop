import { IBasket } from "../src/types/iBasket";
import { IUser } from "../src/types/iUser";
import basketsData from '../db/baskets.json';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from "path";
import { NotFoundError } from "../src/types/notFoundError";
import { IBasketBoardGame } from "../src/types/iBasketBoardGame";
import { BoardGamesDatabase } from "./boardGamesDatabase";
import boardGamesData from './boardGames.json';
import { IBoardGame } from "../src/types/iBoardGame";
export class BasketsDatabase {
    static get(userId: string) : IBasket | undefined {
        try {
            return basketsData.baskets.find(b => b.userId == userId);
        } catch (error) {
            throw error;
        }
    } 

    static async create(user: IUser) : Promise<void> {
        try {
            const newUserBasket : IBasket = {
                id: uuidv4(),
                userId: user.id,
                count: 0,
                sum: 0,
                boardGames: []
            };
            basketsData.baskets.push(newUserBasket);
            await fs.writeFile(path.join(__dirname, 'baskets.json'), JSON.stringify(basketsData, null, 2));
            console.log(`Для нового пользователя ${user.login} создана корзина`);
        } catch (error) {
            throw error;
        }
    }

    static getCount(userId: string) : number | undefined {
        try {
            const count = basketsData.baskets.find((item: IBasket) => item.userId === userId)?.count;
            return count;
        } catch (error) {
            throw error;
        }
    }

    static getSum(userId: string) : number | undefined {
        try {
            const sum = basketsData.baskets.find((item: IBasket) => item.userId === userId)?.sum;
            return sum;
        } catch (error) {
            throw error;
        }
    }

    static async add(boardGameId: string, userId: string) : Promise<IBasket> {
        try {
            const boardGame = BoardGamesDatabase.getById(boardGameId)!;
            const basketIndex = basketsData.baskets.findIndex((item: IBasket) => item.userId === userId);
            if (basketIndex === -1) {
                throw new NotFoundError(`Не найдена корзина у пользователя с id ${userId}`);
            }

            const basket = basketsData.baskets[basketIndex];
            const existingBasketBoardGameIndex = basket.boardGames.findIndex(
                (item: IBasketBoardGame) => item.boardGameId === boardGameId);
            if (existingBasketBoardGameIndex !== -1) {
                basket.boardGames[existingBasketBoardGameIndex].count += 1;
                basket.boardGames[existingBasketBoardGameIndex].sum += boardGame.price;
            }
            else {
                const newBasketBoardGame : IBasketBoardGame = {
                    boardGameId: boardGame.id,
                    count: 1,
                    sum: boardGame.price
                }
                basket.boardGames.push(newBasketBoardGame);
            }

            basket.count += 1;
            basket.sum += boardGame.price;
            basketsData.baskets[basketIndex] = basket;
            await fs.writeFile(path.join(__dirname, 'baskets.json'), JSON.stringify(basketsData, null, 2));
            console.log(`Пользователю с id ${userId} добавлена в корзину настольная игра с id ${boardGameId}`);
            return basket;
        } catch (error) {
            throw error;
        }
    }

    static async remove(boardGameId: string, userId: string) : Promise<IBasket> {
        try {
            const boardGame = BoardGamesDatabase.getById(boardGameId)!;
            const basketIndex = basketsData.baskets.findIndex((item: IBasket) => item.userId === userId);
            if (basketIndex === -1) {
                throw new NotFoundError(`Не найдена корзина у пользователя с id ${userId}`);
            }

            const basket = basketsData.baskets[basketIndex];
            const existingBasketBoardGameIndex = basket.boardGames.findIndex((item: IBasketBoardGame) => item.boardGameId === boardGameId);
            if (existingBasketBoardGameIndex === -1) {
                throw new NotFoundError(`У пользователя с id ${userId} в корзине нет настольной игры с id ${boardGameId}`);
            }

            if (basket.boardGames[existingBasketBoardGameIndex].count === 1) {
                basket.boardGames = basket.boardGames.filter((item: IBasketBoardGame) => item !== basket.boardGames[existingBasketBoardGameIndex]);
            }
            else {
                --basket.boardGames[existingBasketBoardGameIndex].count;
                basket.boardGames[existingBasketBoardGameIndex].sum -= boardGame.price;
            }

            --basket.count;
            basket.sum -= boardGame.price;
            basketsData.baskets[basketIndex] = basket;
            await fs.writeFile(path.join(__dirname, 'baskets.json'), JSON.stringify(basketsData, null, 2));
            console.log(`У пользователя с id ${userId} удалена из корзины настольная игра с id ${boardGame.id}`);
            return basket;
        } catch (error) {
            throw error;
        }
    }

    static async clear(userId: string) : Promise<IBasket> {
        try {
            const basketIndex = basketsData.baskets.findIndex((item: IBasket) => item.userId === userId);
            if (basketIndex === -1) {
                throw new NotFoundError(`Не найдена корзина у пользователя с id ${userId}`);
            }

            const basket = basketsData.baskets[basketIndex];
            basket.boardGames = [];
            basket.count = 0;
            basket.sum = 0;
            basketsData.baskets[basketIndex] = basket;
            await fs.writeFile(path.join(__dirname, 'baskets.json'), JSON.stringify(basketsData, null, 2));
            console.log(`Очищена корзина у пользователя с id ${userId}`);
            return basket;
        } catch (error) {
            throw error;
        }
    }

    static async removeAllSimilar(userId: string, boardGameId: string) : Promise<IBasket> {
        try {
            const basketIndex = basketsData.baskets.findIndex((item: IBasket) => item.userId === userId);
            if (basketIndex === -1) {
                throw new NotFoundError(`Не найдена корзина у пользователя с id ${userId}`);
            }

            const basket = basketsData.baskets[basketIndex];
            const existingBoardGameIndex = basket.boardGames.findIndex((item: IBasketBoardGame) => item.boardGameId === boardGameId);
            if (existingBoardGameIndex === -1) {
                throw new NotFoundError(`У пользователя с id ${userId} в корзине нет настольной игры с id ${boardGameId}`);
            }

            basket.count -= basket.boardGames[existingBoardGameIndex].count;
            basket.sum -= basket.boardGames[existingBoardGameIndex].sum;
            basket.boardGames = basket.boardGames.filter((item: IBasketBoardGame) => item !== basket.boardGames[existingBoardGameIndex]);
            basketsData.baskets[basketIndex] = basket;
            await fs.writeFile(path.join(__dirname, 'baskets.json'), JSON.stringify(basketsData, null, 2));
            console.log(`У пользователя с id ${userId} удалены все настольные игры с id ${boardGameId} из корзины`);
            return basket;
        } catch (error) {
            throw error;
        }
    }

    static async deleteGameFromAllBaskets(boardGameId: string) : Promise<void> {
        try {
            basketsData.baskets.forEach((b: IBasket) => {
                if (b.boardGames.some((g: IBasketBoardGame) => g.boardGameId === boardGameId)) {
                    this.removeAllSimilar(b.userId, boardGameId);
                }
            });
            await fs.writeFile(path.join(__dirname, 'baskets.json'), JSON.stringify(basketsData, null, 2));
        } catch (error) {
            throw error;
        }
    }

    static existsGameInAnyBaskets(boardGameId: string) : boolean {
        try {
            return basketsData.baskets.some(b => b.boardGames.some(g => g.boardGameId === boardGameId));
        } catch (error) {
            throw error;
        }
    }

    static async updateSumAfterGamePriceChanging(boardGameId: string, newPrice: number) : Promise<void> {
        try {
            const oldBoardGamePrice = boardGamesData.boardGames.find((g: any) => g.id === boardGameId)?.price;
            if (oldBoardGamePrice && oldBoardGamePrice !== newPrice) {
                basketsData.baskets.forEach((b: IBasket) => {
                    let priceChangingBoardGameIndex = b.boardGames.findIndex(g => g.boardGameId === boardGameId);
                    if (priceChangingBoardGameIndex !== -1) {
                        const oldGameSum = b.boardGames[priceChangingBoardGameIndex].count * oldBoardGamePrice;
                        const newGameSum = b.boardGames[priceChangingBoardGameIndex].count * newPrice;
                        b.sum -= oldGameSum;
                        b.sum += newGameSum;
                        b.boardGames[priceChangingBoardGameIndex].sum = newGameSum;
                    }
                });
                await fs.writeFile(path.join(__dirname, 'baskets.json'), JSON.stringify(basketsData, null, 2));
            }
        } catch (error) {
            throw error;
        }
    }
}