import { RecommendationService } from '../../src/services/recommendationService';
import { RecommendationsDatabase } from '../../db/recommendationsDatabase';
import { BoardGamesDatabase } from '../../db/boardGamesDatabase';
import { IUserCategory } from '../../src/types/iUserCategory';
import { IBoardGame } from '../../src/types/iBoardGame';

jest.mock('../../db/recommendationsDatabase');
jest.mock('../../db/boardGamesDatabase');

describe('RecommendationService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getTopCategories', () => {
        it('должен вернуть топ категорий по весу', () => {
            const mockCategories: IUserCategory[] = [
                { category: 'Стратегия', weight: 5, lastUpdated: new Date().toISOString() },
                { category: 'Экономика', weight: 10, lastUpdated: new Date().toISOString() },
                { category: 'Детектив', weight: 3, lastUpdated: new Date().toISOString() },
                { category: 'Аркада', weight: 7, lastUpdated: new Date().toISOString() }
            ];
            (RecommendationsDatabase.getUserCategories as jest.Mock).mockReturnValue(mockCategories);

            const top = RecommendationService.getTopCategories('user1', 3);
            expect(top).toHaveLength(3);
            expect(top[0].category).toBe('Экономика');
            expect(top[1].category).toBe('Аркада');
            expect(top[2].category).toBe('Стратегия');
        });

        it('должен вернуть все категории если limit больше количества', () => {
            const mockCategories: IUserCategory[] = [
                { category: 'Стратегия', weight: 5, lastUpdated: new Date().toISOString() },
                { category: 'Экономика', weight: 10, lastUpdated: new Date().toISOString() }
            ];
            (RecommendationsDatabase.getUserCategories as jest.Mock).mockReturnValue(mockCategories);

            const top = RecommendationService.getTopCategories('user1', 10);
            expect(top).toHaveLength(2);
        });

        it('должен вернуть пустой массив если у пользователя нет категорий', () => {
            (RecommendationsDatabase.getUserCategories as jest.Mock).mockReturnValue(undefined);

            const top = RecommendationService.getTopCategories('user1');
            expect(top).toEqual([]);
        });

        it('должен вернуть пустой массив если массив категорий пуст', () => {
            (RecommendationsDatabase.getUserCategories as jest.Mock).mockReturnValue([]);

            const top = RecommendationService.getTopCategories('user1');
            expect(top).toEqual([]);
        });

        it('должен сортировать по весу, а при равном весе - по дате', () => {
            const now = new Date();
            const earlier = new Date(now.getTime() - 10000).toISOString();
            const later = now.toISOString();
            
            const mockCategories: IUserCategory[] = [
                { category: 'A', weight: 5, lastUpdated: earlier },
                { category: 'B', weight: 5, lastUpdated: later },
                { category: 'C', weight: 10, lastUpdated: earlier }
            ];
            (RecommendationsDatabase.getUserCategories as jest.Mock).mockReturnValue(mockCategories);

            const top = RecommendationService.getTopCategories('user1', 3);
            expect(top[0].category).toBe('C'); 
            expect(top[1].category).toBe('B'); 
            expect(top[2].category).toBe('A');
        });
    });

    describe('likeBoardGame', () => {
        const userId = 'user1';
        const boardGameId = 'game1';
        const mockGame: IBoardGame = {
            id: 'game1',
            name: { ru: 'Тест', en: 'Test' },
            description: { ru: 'Описание', en: 'Desc' },
            categories: { ru: ['Стратегия', 'Экономика'], en: ['Strategy', 'Economic'] },
            minPlayers: 2,
            maxPlayers: 4,
            isAvailable: true,
            price: 1000,
            amount: 10,
            images: {},
            averageRating: 4.5
        };

        beforeEach(() => {
            (BoardGamesDatabase.getById as jest.Mock).mockReturnValue(mockGame);
        });

        it('должен добавить лайк и обновить веса категорий', async () => {
            (RecommendationsDatabase.getUserLikedGames as jest.Mock).mockReturnValue([]);
            (RecommendationsDatabase.getUserCategories as jest.Mock).mockReturnValue([]);

            await RecommendationService.likeBoardGame(userId, boardGameId);

            expect(RecommendationsDatabase.updateUserData).toHaveBeenCalledWith(
                userId,
                [boardGameId],
                expect.arrayContaining([
                    expect.objectContaining({ category: 'Стратегия', weight: 1 }),
                    expect.objectContaining({ category: 'Экономика', weight: 1 })
                ])
            );
        });

        it('должен увеличить вес существующих категорий', async () => {
            const existingCategories: IUserCategory[] = [
                { category: 'Стратегия', weight: 3, lastUpdated: new Date().toISOString() }
            ];
            (RecommendationsDatabase.getUserLikedGames as jest.Mock).mockReturnValue([]);
            (RecommendationsDatabase.getUserCategories as jest.Mock).mockReturnValue(existingCategories);

            await RecommendationService.likeBoardGame(userId, boardGameId);

            expect(RecommendationsDatabase.updateUserData).toHaveBeenCalledWith(
                userId,
                [boardGameId],
                expect.arrayContaining([
                    expect.objectContaining({ category: 'Стратегия', weight: 4 })
                ])
            );
        });

        it('должен игнорировать повторный лайк', async () => {
            (RecommendationsDatabase.getUserLikedGames as jest.Mock).mockReturnValue([boardGameId]);

            await RecommendationService.likeBoardGame(userId, boardGameId);

            expect(RecommendationsDatabase.updateUserData).not.toHaveBeenCalled();
        });

        it('должен игнорировать если игра не найдена', async () => {
            (BoardGamesDatabase.getById as jest.Mock).mockReturnValue(undefined);

            await RecommendationService.likeBoardGame(userId, 'nonexistent');

            expect(RecommendationsDatabase.updateUserData).not.toHaveBeenCalled();
        });

        it('должен ограничить максимальный вес 10', async () => {
            const existingCategories: IUserCategory[] = [
                { category: 'Стратегия', weight: 10, lastUpdated: new Date().toISOString() }
            ];
            (RecommendationsDatabase.getUserLikedGames as jest.Mock).mockReturnValue([]);
            (RecommendationsDatabase.getUserCategories as jest.Mock).mockReturnValue(existingCategories);

            await RecommendationService.likeBoardGame(userId, boardGameId);

            const updateCall = (RecommendationsDatabase.updateUserData as jest.Mock).mock.calls[0];
            const updatedCategories = updateCall[2];
            const strategyCategory = updatedCategories.find((c: IUserCategory) => c.category === 'Стратегия');
            expect(strategyCategory.weight).toBeLessThanOrEqual(10);
        });
    });

    describe('unlikeBoardGame', () => {
        const userId = 'user1';
        const boardGameId = 'game1';
        const mockGame: IBoardGame = {
            id: 'game1',
            name: { ru: 'Тест', en: 'Test' },
            description: { ru: 'Описание', en: 'Desc' },
            categories: { ru: ['Стратегия', 'Экономика'], en: ['Strategy', 'Economic'] },
            minPlayers: 2,
            maxPlayers: 4,
            isAvailable: true,
            price: 1000,
            amount: 10,
            images: {},
            averageRating: 4.5
        };

        beforeEach(() => {
            (BoardGamesDatabase.getById as jest.Mock).mockReturnValue(mockGame);
        });

        it('должен убрать лайк и уменьшить веса категорий', async () => {
            const existingCategories: IUserCategory[] = [
                { category: 'Стратегия', weight: 5, lastUpdated: new Date().toISOString() },
                { category: 'Экономика', weight: 3, lastUpdated: new Date().toISOString() }
            ];
            (RecommendationsDatabase.getUserLikedGames as jest.Mock).mockReturnValue([boardGameId]);
            (RecommendationsDatabase.getUserCategories as jest.Mock).mockReturnValue(existingCategories);

            await RecommendationService.unlikeBoardGame(userId, boardGameId);

            expect(RecommendationsDatabase.updateUserData).toHaveBeenCalledWith(
                userId,
                [],
                expect.arrayContaining([
                    expect.objectContaining({ category: 'Стратегия', weight: 4 }),
                    expect.objectContaining({ category: 'Экономика', weight: 2 })
                ])
            );
        });

        it('должен удалить категорию если вес стал 0', async () => {
            const existingCategories: IUserCategory[] = [
                { category: 'Стратегия', weight: 1, lastUpdated: new Date().toISOString() }
            ];
            (RecommendationsDatabase.getUserLikedGames as jest.Mock).mockReturnValue([boardGameId]);
            (RecommendationsDatabase.getUserCategories as jest.Mock).mockReturnValue(existingCategories);

            await RecommendationService.unlikeBoardGame(userId, boardGameId);

            const updateCall = (RecommendationsDatabase.updateUserData as jest.Mock).mock.calls[0];
            const updatedCategories = updateCall[2];
            expect(updatedCategories.find((c: IUserCategory) => c.category === 'Стратегия')).toBeUndefined();
        });

        it('должен игнорировать если игра не была лайкнута', async () => {
            (RecommendationsDatabase.getUserLikedGames as jest.Mock).mockReturnValue([]);

            await RecommendationService.unlikeBoardGame(userId, boardGameId);

            expect(RecommendationsDatabase.updateUserData).not.toHaveBeenCalled();
        });

        it('должен игнорировать если игра не найдена', async () => {
            (BoardGamesDatabase.getById as jest.Mock).mockReturnValue(undefined);

            await RecommendationService.unlikeBoardGame(userId, boardGameId);

            expect(RecommendationsDatabase.updateUserData).not.toHaveBeenCalled();
        });
    });
});