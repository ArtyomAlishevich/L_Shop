import { BoardGamesService } from '../../src/services/boardGamesService';
import { IBoardGame } from '../../src/types/iBoardGame';

describe('BoardGamesService.applyFilters', () => {
    const mockGames: IBoardGame[] = [
        {
            id: '1',
            name: { ru: 'Монополия', en: 'Monopoly' },
            description: { ru: 'Экономическая игра', en: 'Economic game' },
            categories: { ru: ['Экономическая', 'Семейная'], en: ['Economic', 'Family'] },
            minPlayers: 2,
            maxPlayers: 6,
            isAvailable: true,
            price: 1000,
            amount: 10,
            images: {},
            averageRating: 4.5
        },
        {
            id: '2',
            name: { ru: 'Колонизаторы', en: 'Catan' },
            description: { ru: 'Стратегическая игра', en: 'Strategy game' },
            categories: { ru: ['Стратегия', 'Экономическая'], en: ['Strategy', 'Economic'] },
            minPlayers: 3,
            maxPlayers: 4,
            isAvailable: true,
            price: 2500,
            amount: 5,
            images: {},
            averageRating: 4.8
        },
        {
            id: '3',
            name: { ru: 'Дженга', en: 'Jenga' },
            description: { ru: 'Аркадная игра', en: 'Arcade game' },
            categories: { ru: ['Аркада'], en: ['Arcade'] },
            minPlayers: 1,
            maxPlayers: 10,
            isAvailable: false,
            price: 500,
            amount: 0,
            images: {},
            averageRating: 4.2
        },
        {
            id: '4',
            name: { ru: 'Каркассон', en: 'Carcassonne' },
            description: { ru: 'Стратегическая игра', en: 'Strategy game' },
            categories: { ru: ['Стратегия'], en: ['Strategy'] },
            minPlayers: 2,
            maxPlayers: 5,
            isAvailable: true,
            price: 3000,
            amount: 3,
            images: {},
            averageRating: 4.9
        }
    ];

    describe('Фильтрация по поиску (search)', () => {
        it('должен найти игры по русскому названию', () => {
            const filters = { search: 'Монополия' };
            const result = BoardGamesService.applyFilters(mockGames, filters, 'ru');
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('1');
        });

        it('должен найти игры по английскому названию', () => {
            const filters = { search: 'Catan' };
            const result = BoardGamesService.applyFilters(mockGames, filters, 'en');
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('2');
        });

        it('должен найти игры по части названия', () => {
            const filters = { search: 'моноп' };
            const result = BoardGamesService.applyFilters(mockGames, filters, 'ru');
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('1');
        });

        it('должен найти игры без учёта регистра', () => {
            const filters = { search: 'МОНОПОЛИЯ' };
            const result = BoardGamesService.applyFilters(mockGames, filters, 'ru');
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('1');
        });

        it('должен вернуть пустой массив если ничего не найдено', () => {
            const filters = { search: 'несуществующая игра' };
            const result = BoardGamesService.applyFilters(mockGames, filters, 'ru');
            expect(result).toHaveLength(0);
        });
    });

    describe('Фильтрация по категории (category)', () => {
        it('должен найти игры по одной категории', () => {
            const filters = { category: 'Стратегия' };
            const result = BoardGamesService.applyFilters(mockGames, filters, 'ru');
            expect(result).toHaveLength(2);
            expect(result.map(g => g.id)).toEqual(['2', '4']);
        });

        it('должен найти игры по нескольким категориям (массив)', () => {
            const filters = { category: ['Экономическая', 'Аркада'] };
            const result = BoardGamesService.applyFilters(mockGames, filters, 'ru');
            expect(result).toHaveLength(3);
            expect(result.map(g => g.id)).toEqual(['1', '2', '3']);
        });

        it('должен вернуть пустой массив если категория не найдена', () => {
            const filters = { category: 'Фэнтези' };
            const result = BoardGamesService.applyFilters(mockGames, filters, 'ru');
            expect(result).toHaveLength(0);
        });
    });

    describe('Фильтрация по доступности (isAvailable)', () => {
        it('должен найти только доступные игры', () => {
            const filters = { isAvailable: 'true' };
            const result = BoardGamesService.applyFilters(mockGames, filters, 'ru');
            expect(result).toHaveLength(3);
            expect(result.every(g => g.isAvailable)).toBe(true);
        });

        it('должен найти только недоступные игры', () => {
            const filters = { isAvailable: 'false' };
            const result = BoardGamesService.applyFilters(mockGames, filters, 'ru');
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('3');
            expect(result[0].isAvailable).toBe(false);
        });
    });

    describe('Фильтрация по цене (minPrice, maxPrice)', () => {
        it('должен найти игры с ценой от minPrice', () => {
            const filters = { minPrice: '1000' };
            const result = BoardGamesService.applyFilters(mockGames, filters, 'ru');
            expect(result).toHaveLength(3);
            expect(result.every(g => g.price >= 1000)).toBe(true);
        });

        it('должен найти игры с ценой до maxPrice', () => {
            const filters = { maxPrice: '1000' };
            const result = BoardGamesService.applyFilters(mockGames, filters, 'ru');
            expect(result).toHaveLength(2);
            expect(result.every(g => g.price <= 1000)).toBe(true);
        });

        it('должен найти игры в диапазоне цен', () => {
            const filters = { minPrice: '1000', maxPrice: '2500' };
            const result = BoardGamesService.applyFilters(mockGames, filters, 'ru');
            expect(result).toHaveLength(2);
            expect(result.map(g => g.id)).toEqual(['1', '2']);
        });
    });

    describe('Фильтрация по количеству игроков (minPlayers, maxPlayers)', () => {
        it('должен найти игры с minPlayers >= заданного', () => {
            const filters = { minPlayers: '3' };
            const result = BoardGamesService.applyFilters(mockGames, filters, 'ru');
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('2');
        });

        it('должен найти игры с maxPlayers <= заданного', () => {
            const filters = { maxPlayers: '4' };
            const result = BoardGamesService.applyFilters(mockGames, filters, 'ru');
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('2');
        });

        it('должен найти игры в диапазоне количества игроков', () => {
            const filters = { minPlayers: '2', maxPlayers: '5' };
            const result = BoardGamesService.applyFilters(mockGames, filters, 'ru');
            expect(result).toHaveLength(2);
            expect(result.map(g => g.id)).toEqual(['2', '4']);
        });
    });

    describe('Комбинированная фильтрация', () => {
        it('должен применить несколько фильтров одновременно', () => {
            const filters = {
                search: 'Колонизаторы', 
                category: 'Экономическая',
                minPrice: '2000',
                maxPrice: '4000',
                isAvailable: 'true'
            };
            const result = BoardGamesService.applyFilters(mockGames, filters, 'ru');
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('2');
        });

        it('должен вернуть пустой массив если фильтры несовместимы', () => {
            const filters = {
                search: 'Монополия',
                category: 'Аркада'
            };
            const result = BoardGamesService.applyFilters(mockGames, filters, 'ru');
            expect(result).toHaveLength(0);
        });
    });

    describe('Пустые фильтры', () => {
        it('должен вернуть все игры если фильтры пустые', () => {
            const result = BoardGamesService.applyFilters(mockGames, {}, 'ru');
            expect(result).toHaveLength(4);
        });
    });
});