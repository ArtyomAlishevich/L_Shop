import { v4 as uuidv4 } from 'uuid';
import { IBoardGame } from '../src/types/iBoardGame';
import data from './boardGames.json';
import fs from 'fs/promises';
import path from 'path';

export class BoardGamesDatabase {
    static getAll(): IBoardGame[] {
        try {
            return data.boardGames;
        } catch (error) {
            throw error;
        }
    }

    static getById(id: string) : IBoardGame | undefined {
        try {
            return data.boardGames.find(game => game.id === id);
        } catch (error) {
            throw error;
        }
    }

    static async create(boardGame: Omit<IBoardGame, 'id' | 'averageRating'>): Promise<IBoardGame> {
        try {
            const newGame: IBoardGame = {
                ...boardGame,
                id: uuidv4(),
                averageRating: 0
            };
            (data.boardGames as IBoardGame[]).push(newGame);
            await fs.writeFile(path.join(__dirname, 'boardGames.json'), JSON.stringify(data, null, 2));
            console.log(`Создана новая игра: ${newGame.name.ru}`);
            return newGame;
        } catch (error) {
            throw error;
        }
    }

    static async update(id: string, updatedData: Partial<IBoardGame>): Promise<IBoardGame> {
        try {
            const index = data.boardGames.findIndex(g => g.id === id);
            (data.boardGames as IBoardGame[])[index] = {...data.boardGames[index], ...updatedData };
            await fs.writeFile(path.join(__dirname, 'boardGames.json'), JSON.stringify(data, null, 2));
            console.log(`Обновлена игра ${data.boardGames[index].name.ru}`);
            return data.boardGames[index];
        } catch (error) {
            throw error;
        }
    }

    static async delete(id: string) : Promise<void> {
        try {
            data.boardGames = data.boardGames.filter(g => g.id !== id);
            await fs.writeFile(path.join(__dirname, 'boardGames.json'), JSON.stringify(data, null, 2));
            console.log(`Удалена игра с id ${id}`);
        } catch (error) {
            throw error;
        }
    }
}