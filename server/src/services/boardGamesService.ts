import { IBoardGame } from '../types/iBoardGame';
import { BoardGamesDatabase } from '../../db/boardGamesDatabase';
import { UsersDatabase } from '../../db/usersDatabase';
import { RecommendationService } from './recommendationService';
import { NotFoundError } from '../types/notFoundError';
import { BasketsDatabase } from '../../db/basketsDatabase';
import { CommentsDatabase } from '../../db/commentsDatabase';

export class BoardGamesService {
    static getAll(): IBoardGame[] {
        return BoardGamesDatabase.getAll();
    }

    static getById(id: string): IBoardGame {
        const game = BoardGamesDatabase.getById(id);
        if (!game) {
            throw new NotFoundError(`Не удалось найти игру с id ${id}`);
        }
        return game;
    }

    static async create(boardGame: Omit<IBoardGame, 'id' | 'averageRating'>): Promise<IBoardGame> {
        return await BoardGamesDatabase.create(boardGame);
    }

    static async update(boardGameId: string, updatedData: Partial<IBoardGame>): Promise<IBoardGame> {
        if (!BoardGamesDatabase.getById(boardGameId)) {
            throw new NotFoundError(`Не найдена игра с id ${boardGameId}`);
        }

        if (updatedData.price && BasketsDatabase.existsGameInAnyBaskets(boardGameId)) {
            await BasketsDatabase.updateSumAfterGamePriceChanging(boardGameId, updatedData.price);
            console.log(`Общая сумма корзины всех пользователей изменена в соответствии с измененной ценой настольной игры с id ${boardGameId}`);
        }
        return await BoardGamesDatabase.update(boardGameId, updatedData);
    }

    static async delete(boardGameId: string): Promise<void> {
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
    }

    static applyFilters(games: IBoardGame[], filters: any, locale: 'ru' | 'en'): IBoardGame[] {
        let result = [...games];
        if (filters.search) {
            const searchText = filters.search.toLowerCase().replace(/\s+/g, '');
            result = result.filter(g => g.name[locale].toLowerCase().replace(/\s+/g, '').includes(searchText));
        }
        if (filters.category) {
            const categoryList = Array.isArray(filters.category) ? filters.category : [filters.category];
            result = result.filter(g => g.categories[locale].some(cat => categoryList.includes(cat)));
        }
        if (filters.isAvailable !== undefined) {
            const isAvail = filters.isAvailable === 'true';
            result = result.filter(g => g.isAvailable === isAvail);
        }
        if (filters.minPrice) {
            const min = parseFloat(filters.minPrice);
            if (!isNaN(min)) result = result.filter(g => g.price >= min);
        }
        if (filters.maxPrice) {
            const max = parseFloat(filters.maxPrice);
            if (!isNaN(max)) result = result.filter(g => g.price <= max);
        }
        if (filters.minPlayers) {
            const min = parseInt(filters.minPlayers);
            if (!isNaN(min)) result = result.filter(g => g.minPlayers >= min);
        }
        if (filters.maxPlayers) {
            const max = parseInt(filters.maxPlayers);
            if (!isNaN(max)) result = result.filter(g => g.maxPlayers <= max);
        }
        return result;
    }

    static getMixedList(userId: string | undefined, filters: any, locale: 'ru' | 'en'): IBoardGame[] {
        let allGames = BoardGamesDatabase.getAll();
        let filtered = this.applyFilters(allGames, filters, locale);
        let recommendedGames: IBoardGame[] = [];
        if (userId) {
            const user = UsersDatabase.getById(userId);
            const lastVisit = user?.lastVisit ? new Date(user.lastVisit) : null;
            const now = new Date();
            const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
            const isActive = lastVisit && lastVisit > threeDaysAgo;
            if (isActive) {
                const topCats = RecommendationService.getTopCategories(userId);
                if (topCats.length > 0) {
                    const recGames = filtered.filter(game =>
                        game.categories.ru.some(cat => topCats.some(tc => tc.category === cat))
                    );
                    const scored = recGames.map(game => {
                        const score = game.categories.ru.reduce((sum, cat) => {
                            const userCat = topCats.find(tc => tc.category === cat);
                            return sum + (userCat ? userCat.weight : 0);
                        }, 0);
                        return { game, score };
                    }).sort((a, b) => b.score - a.score);
                    recommendedGames = scored.map(s => s.game);
                }
            }
        }
        const mixed: IBoardGame[] = [];
        let recIndex = 0;
        for (let i = 0; i < filtered.length; i++) {
            mixed.push(filtered[i]);
            if ((i + 1) % 3 === 0 && recIndex < recommendedGames.length) {
                mixed.push(recommendedGames[recIndex]);
                recIndex++;
            }
        }
        while (recIndex < recommendedGames.length) {
            mixed.push(recommendedGames[recIndex]);
            recIndex++;
        }
        if (filters.sort === 'asc') {
            mixed.sort((a, b) => a.price - b.price);
        } else if (filters.sort === 'desc') {
            mixed.sort((a, b) => b.price - a.price);
        }
        return mixed;
    }
}