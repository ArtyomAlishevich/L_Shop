import { IBoardGame } from '../types/iBoardGame';
import { BoardGamesDatabase } from '../../db/boardGamesDatabase';
import { NotFoundError } from '../types/notFoundError';
import { BasketsDatabase } from '../../db/basketsDatabase';
import boardGamesRouter from '../routers/boardGamesRouter';
import { CommentsDatabase } from '../../db/commentsDatabase';

export class BoardGamesService {
    static getAll(): IBoardGame[] {
        try {
            return BoardGamesDatabase.getAll();
        } catch (error) {
            throw error;
        }
    }

    static getById(id: string): IBoardGame {
        try {
            const game = BoardGamesDatabase.getById(id);
            if (!game) {
                throw new NotFoundError(`Не удалось найти игру с id ${id}`);
            }

            return game;
        } catch (error) {
            throw error;
        }
    }

    static async create(boardGame: Omit<IBoardGame, 'id' | 'averageRating'>) : Promise<IBoardGame> {
        try {
            return await BoardGamesDatabase.create(boardGame);
        } catch (error) {
            throw error;
        }
    }

    static async update(boardGameId: string, updatedData: Partial<IBoardGame>) : Promise<IBoardGame> {
        try {
            if (!BoardGamesDatabase.getById(boardGameId)) {
                throw new NotFoundError(`Не найдена игра с id ${boardGameId}`);
            }

            if (updatedData.price && BasketsDatabase.existsGameInAnyBaskets(boardGameId)) {
                await BasketsDatabase.updateSumAfterGamePriceChanging(boardGameId, updatedData.price);
                console.log(`Общая сумма корзины всех пользователей изменена в соответствии с измененной ценой настольной игры с id ${boardGameId}`);
            }
            return await BoardGamesDatabase.update(boardGameId, updatedData);
        } catch (error) {
            throw error;
        }
    }

    static async delete(boardGameId: string) : Promise<void> {
        try {
            if (!BoardGamesDatabase.getById(boardGameId)) {
                throw new NotFoundError(`Не найдена игра с id ${boardGameId}`);
            }

            if (BasketsDatabase.existsGameInAnyBaskets(boardGameId)) {
                await BasketsDatabase.deleteGameFromAllBaskets(boardGameId);
                console.log(`Из корзин всех пользователей удалены все товары с id ${boardGameId}`);
            }

            if (CommentsDatabase.existsAnyCommentOnBoardGame(boardGameId)) {
                await CommentsDatabase.deleteAllCommentsOnBoardGame(boardGameId);
                console.log(`Удалены все комментарии на игру с id ${boardGameId}`);
            }
            await BoardGamesDatabase.delete(boardGameId);
        } catch (error) {
            throw error;
        }
    }
}