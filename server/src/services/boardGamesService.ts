import { IBoardGame } from '../types/iBoardGame';
import { BoardGamesDatabase } from '../../db/boardGamesDatabase';
import { NotFoundError } from '../types/notFoundError';

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


}