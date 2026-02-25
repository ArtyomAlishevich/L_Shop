import { IBoardGame } from '../src/types/iBoardGame';
import data from './boardGames.json';

export class BoardGamesDatabase {
    static getAll(): IBoardGame[] {
        try {
            return data.boardGames;
        } catch (error) {
            throw error;
        }
    }

    static getById(id: string): IBoardGame | undefined {
        try {
            return data.boardGames.find(game => game.id === id);
        } catch (error) {
            throw error;
        }
    }

    
}