import request from 'supertest';
import express, { Application } from 'express';
import session from 'express-session';
import { API_ENDPOINTS } from './apiEndpoints';
import boardGamesRouter from '../../src/routers/boardGamesRouter';
import authRouter from '../../src/routers/authRouter';
import { BoardGamesService } from '../../src/services/boardGamesService';
import { AuthService } from '../../src/services/authService';

jest.mock('../../src/services/boardGamesService');
jest.mock('../../src/services/authService');

const app: Application = express();
app.use(express.json());
app.use(session({
    secret: 'test',
    saveUninitialized: false,
    resave: false,
    cookie: { secure: false }
}));
app.use('/api/auth', authRouter);
app.use('/api/boardgames', boardGamesRouter);

describe('Board Games API', () => {
    const mockGames = [
        {
            id: '1',
            name: { ru: 'Монополия', en: 'Monopoly' },
            description: { ru: 'Описание', en: 'Description' },
            categories: { ru: ['Экономическая'], en: ['Economic'] },
            minPlayers: 2,
            maxPlayers: 4,
            isAvailable: true,
            price: 1000,
            amount: 10,
            images: {},
            averageRating: 4.5
        }
    ];

    const localizedMockGames = [
        {
            id: '1',
            name: 'Монополия',
            description: 'Описание',
            categories: ['Экономическая'],
            minPlayers: 2,
            maxPlayers: 4,
            isAvailable: true,
            price: 1000,
            amount: 10,
            images: {},
            averageRating: 4.5
        }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe(`GET ${API_ENDPOINTS.BOARD_GAMES.GET_ALL}`, () => {
        it('Должен вернуть все игры для гостя (без рекомендаций)', async () => {
            (BoardGamesService.getMixedList as jest.Mock).mockReturnValue(mockGames);

            const res = await request(app).get(API_ENDPOINTS.BOARD_GAMES.GET_ALL);

            expect(res.status).toBe(200);
            expect(res.body.data).toEqual(localizedMockGames);
            expect(BoardGamesService.getMixedList).toHaveBeenCalledWith(
                undefined,
                expect.any(Object),
                'ru'
            );
        });

        it('Должен вернуть игры с рекомендациями для авторизованного пользователя', async () => {
            const agent = request.agent(app);
            const mockUser = { id: '1', login: 'test', name: 'Test', role: 'user', createdAt: '01.01.2026' };
            (AuthService.login as jest.Mock).mockResolvedValue(mockUser);
            await agent.post(API_ENDPOINTS.AUTH.LOGIN).send({ login: 'test', password: '123' });
            
            (BoardGamesService.getMixedList as jest.Mock).mockReturnValue(mockGames);

            const res = await agent.get(API_ENDPOINTS.BOARD_GAMES.GET_ALL);

            expect(res.status).toBe(200);
            expect(BoardGamesService.getMixedList).toHaveBeenCalledWith(
                '1',
                expect.any(Object),
                'ru'
            );
        });

        it('Должен вернуть игры с фильтрацией по поиску', async () => {
            (BoardGamesService.getMixedList as jest.Mock).mockReturnValue(mockGames);

            const res = await request(app).get(`${API_ENDPOINTS.BOARD_GAMES.GET_ALL}?search=моноп`);

            expect(res.status).toBe(200);
            expect(BoardGamesService.getMixedList).toHaveBeenCalledWith(
                undefined,
                expect.objectContaining({ search: 'моноп' }),
                'ru'
            );
        });

        it('Должен вернуть игры с сортировкой по цене', async () => {
            (BoardGamesService.getMixedList as jest.Mock).mockReturnValue(mockGames);

            const res = await request(app).get(`${API_ENDPOINTS.BOARD_GAMES.GET_ALL}?sort=asc`);

            expect(res.status).toBe(200);
            expect(BoardGamesService.getMixedList).toHaveBeenCalledWith(
                undefined,
                expect.objectContaining({ sort: 'asc' }),
                'ru'
            );
        });

        it('Должен вернуть пустой массив если игр нет', async () => {
            (BoardGamesService.getMixedList as jest.Mock).mockReturnValue([]);

            const res = await request(app).get(API_ENDPOINTS.BOARD_GAMES.GET_ALL);

            expect(res.status).toBe(200);
            expect(res.body.data).toEqual([]);
        });
    });
});