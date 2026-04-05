import { BoardGamesDatabase } from '../../db/boardGamesDatabase';
import { RecommendationsDatabase } from '../../db/recommendationsDatabase';
import { IUserCategory } from '../types/iUserCategory';

export class RecommendationService {
    static async likeBoardGame(userId: string, boardGameId: string): Promise<void> {
        const game = BoardGamesDatabase.getById(boardGameId);
        if (!game || !game.categories?.ru) return;

        let likedGames = RecommendationsDatabase.getUserLikedGames(userId) || [];
        let userCats = RecommendationsDatabase.getUserCategories(userId) || [];

        if (likedGames.includes(boardGameId)) {
            return;
        }

        likedGames.push(boardGameId);

        for (const cat of game.categories.ru) {
            const existing = userCats.find(c => c.category === cat);
            if (existing) {
                existing.weight += 1;
                existing.lastUpdated = new Date().toISOString();
            } else {
                userCats.push({ category: cat, weight: 1, lastUpdated: new Date().toISOString() });
            }
        }

        userCats = userCats.map(c => ({ ...c, weight: Math.min(c.weight, 10) }));

        await RecommendationsDatabase.updateUserData(userId, likedGames, userCats);
    }

    static async unlikeBoardGame(userId: string, boardGameId: string): Promise<void> {
        const game = BoardGamesDatabase.getById(boardGameId);
        if (!game || !game.categories?.ru) return;

        let likedGames = RecommendationsDatabase.getUserLikedGames(userId) || [];
        let userCats = RecommendationsDatabase.getUserCategories(userId) || [];

        if (!likedGames.includes(boardGameId)) {
            return;
        }

        likedGames = likedGames.filter((id: string) => id !== boardGameId);

        for (const cat of game.categories.ru) {
            const existing = userCats.find(c => c.category === cat);
            if (existing) {
                existing.weight -= 1;
                if (existing.weight <= 0) {
                    userCats = userCats.filter(c => c.category !== cat);
                } else {
                    existing.lastUpdated = new Date().toISOString();
                }
            }
        }

        await RecommendationsDatabase.updateUserData(userId, likedGames, userCats);
    }

    static getTopCategories(userId: string, limit = 5): IUserCategory[] {
        const cats = RecommendationsDatabase.getUserCategories(userId) || [];
        return cats.sort((a, b) => b.weight - a.weight || new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()).slice(0, limit);
    }
}