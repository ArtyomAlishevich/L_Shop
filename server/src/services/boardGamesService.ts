import { IBoardGame } from '../types/iBoardGame';
import { BoardGamesDatabase } from '../../db/boardGamesDatabase';
import { NotFoundError } from '../types/notFoundError';

export class BoardGamesService {
    /**
     * Возвращает массив всех настольных игр.
     * 
     * @returns {IBoardGame[]} список всех игр из базы данных
     * 
     * @throws {Error} при ошибке чтения базы данных
     * 
     * @example
     * const allGames = BoardGamesService.getAll();
     * console.log(allGames.length); // 42
     */
    static getAll(): IBoardGame[] {
        try {
            return BoardGamesDatabase.getAll();
        } catch (error) {
            throw error;
        }
    }

    /**
     * Возвращает настольную игру по её идентификатору.
     * 
     * @param id - уникальный идентификатор игры
     * @returns {IBoardGame} объект игры
     * 
     * @throws {NotFoundError} если игра с указанным id не найдена
     * @throws {Error} при ошибке чтения базы данных
     * 
     * @example
     * try {
     *   const game = BoardGamesService.getById('123e4567-e89b-12d3-a456-426614174000');
     *   console.log(game.name); // 'Монополия'
     * } catch (error) {
     *   console.error('Игра не найдена');
     * }
     */
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