import request from 'supertest';
import express, { Application } from 'express';
import session from 'express-session';
import { API_ENDPOINTS } from './apiEndpoints';
import basketsRouter from '../../src/routers/basketsRouter';
import authRouter from '../../src/routers/authRouter';
import { BasketsService } from '../../src/services/basketsService';
import { NotFoundError } from '../../src/types/notFoundError';
import { AuthService } from '../../src/services/authService';

jest.mock('../../src/services/basketsService');
jest.mock('../../src/services/authService');

const app : Application = express();
app.use(express.json());
app.use(session({
    secret: 'test',
    saveUninitialized: false,
    resave: false,
    cookie: {
        secure: false
    }
}));
app.use('/api/auth', authRouter);
app.use('/api/baskets', basketsRouter);

describe('Baskets API', () => {
    let agent: request.Agent;
    const mockUser = { id: '1', login: 'test', password: '123', name: 'Test', role: 'user', createdAt: '01.01.2026' };
    const mockBasket = { id: '1', userId: '1', count: 0, sum: 0, boardGames: [] };
    const boardGameId = '123';

    beforeEach(async () => {
        jest.clearAllMocks();

        agent = request.agent(app);
        (AuthService.login as jest.Mock).mockResolvedValue(mockUser);
        await agent.post(API_ENDPOINTS.AUTH.LOGIN).send({ login: 'test', password: '123' });
    });

    describe(`GET ${API_ENDPOINTS.BASKETS.GET}`, () => {
        it('Должен вернуть корзину для авторизованного пользователя', async () => {
            (BasketsService.get as jest.Mock).mockReturnValue(mockBasket);

            const res = await agent.get(API_ENDPOINTS.BASKETS.GET);

            expect(res.status).toBe(200);
            expect(res.body.data).toEqual(mockBasket);
            expect(BasketsService.get).toHaveBeenCalledWith(mockUser.id);
        });

        it('Должен вернуть 401 для неавторизованного пользователя', async () => {
            const res = await request(app).get(API_ENDPOINTS.BASKETS.GET);

            expect(res.status).toBe(401);
        });
    });

    describe(`GET ${API_ENDPOINTS.BASKETS.GET_COUNT}`, () => {
        it('Должен вернуть количество товаров в корзине', async () => {
            (BasketsService.getCount as jest.Mock).mockReturnValue(5);

            const res = await agent.get(API_ENDPOINTS.BASKETS.GET_COUNT);

            expect(res.status).toBe(200);
            expect(res.body.data).toBe(5);
            expect(BasketsService.getCount).toHaveBeenCalledWith(mockUser.id);
        });

        it('Должен вернуть 404 если корзина или пользователь не найдены', async () => {
            (BasketsService.getCount as jest.Mock).mockImplementation(() => { throw new NotFoundError('Не найдена корзина или пользователь!') });

            const res = await agent.get(API_ENDPOINTS.BASKETS.GET_COUNT);

            expect(res.status).toBe(404);
            expect(BasketsService.getCount).toHaveBeenCalledWith(mockUser.id);
        });

        it('Должен вернуть 401 для неавторизованного пользователя', async () => {
            const res = await request(app).get(API_ENDPOINTS.BASKETS.GET_COUNT);

            expect(res.status).toBe(401);
        });
    });

    describe(`GET ${API_ENDPOINTS.BASKETS.GET_SUM}`, () => {
        it('Должен вернуть сумму корзины для пользователя', async () => {
            (BasketsService.getSum as jest.Mock).mockReturnValue(500);

            const res = await agent.get(API_ENDPOINTS.BASKETS.GET_SUM);

            expect(res.status).toBe(200);
            expect(res.body.data).toBe(500);
            expect(BasketsService.getSum).toHaveBeenCalledWith(mockUser.id);
        });

        it('Должен вернуть 404 если корзина или пользователь не найдены', async () => {
            (BasketsService.getSum as jest.Mock).mockImplementation(() => { throw new NotFoundError('Не найдена корзина или пользователь!') });

            const res = await agent.get(API_ENDPOINTS.BASKETS.GET_SUM);

            expect(res.status).toBe(404);
            expect(BasketsService.getSum).toHaveBeenCalledWith(mockUser.id);
        });

        it('Должен вернуть 401 для неавторизованного пользователя', async () => {
            const res = await request(app).get(API_ENDPOINTS.BASKETS.GET_SUM);

            expect(res.status).toBe(401);
        });
    });

    describe(`POST ${API_ENDPOINTS.BASKETS.ADD}`, () => {

        it('Должен добавить товар в корзину и вернуть 200', async () => {
            (BasketsService.add as jest.Mock).mockResolvedValue(mockBasket);

            const res = await agent.post(API_ENDPOINTS.BASKETS.ADD).send({ boardGameId });

            expect(res.status).toBe(201);
            expect(res.body.data).toEqual(mockBasket);
            expect(BasketsService.add).toHaveBeenCalledWith(boardGameId, mockUser.id);
        });

        it('Должен вернуть 404 если корзина, пользователь или игра не найдены', async () => {
            (BasketsService.add as jest.Mock).mockImplementation(() => { throw new NotFoundError('Не найдена корзина или пользователь!') });

            const res = await agent.post(API_ENDPOINTS.BASKETS.ADD).send({ boardGameId });

            expect(res.status).toBe(404);
            expect(BasketsService.add).toHaveBeenCalledWith(boardGameId, mockUser.id);
        });

        it('Должен вернуть 400 если в теле запроса нет id настольной игры', async () => {
            const res = await agent.post(API_ENDPOINTS.BASKETS.ADD).send({});

            expect(res.status).toBe(400);
        });

        it('Должен вернуть 401 для неавторизованного пользователя', async () => {
            const res = await request(app).post(API_ENDPOINTS.BASKETS.ADD).send({ boardGameId });

            expect(res.status).toBe(401);
        });
    });

    describe(`POST ${API_ENDPOINTS.BASKETS.REMOVE}`, () => {
        it('Должен удалить элемент из корзины и вернуть 200', async () => {
            (BasketsService.remove as jest.Mock).mockResolvedValue(mockBasket);

            const res = await agent.post(API_ENDPOINTS.BASKETS.REMOVE).send({ boardGameId });

            expect(res.status).toBe(200);
            expect(res.body.data).toEqual(mockBasket);
            expect(BasketsService.remove).toHaveBeenCalledWith(boardGameId, mockUser.id)
        });

        it('Должен вернуть 404 если корзина, пользователь или игра не найдены', async () => {
            (BasketsService.remove as jest.Mock).mockImplementation(() => { throw new NotFoundError('Не найден пользователь или корзина') });

            const res = await agent.post(API_ENDPOINTS.BASKETS.REMOVE).send({ boardGameId });

            expect(res.status).toBe(404);
            expect(BasketsService.remove).toHaveBeenCalledWith(boardGameId, mockUser.id);
        });

        it('Должен вернуть 400 если в теле запроса нет id настольной игры', async () => {
            const res = await agent.post(API_ENDPOINTS.BASKETS.REMOVE).send({});

            expect(res.status).toBe(400);
        });

        it('Должен вернуть 401 для неавторизованного пользователя', async () => {
            const res = await request(app).post(API_ENDPOINTS.BASKETS.REMOVE).send({ boardGameId });

            expect(res.status).toBe(401);
        });
    });

    describe(`POST ${API_ENDPOINTS.BASKETS.REMOVE_ALL_SIMILLAR}`, () => {
        it('Должен удалить элементы из корзины и вернуть 200', async () => {
            (BasketsService.removeAllSimilar as jest.Mock).mockResolvedValue(mockBasket);

            const res = await agent.post(API_ENDPOINTS.BASKETS.REMOVE_ALL_SIMILLAR).send({ boardGameId });

            expect(res.status).toBe(200);
            expect(res.body.data).toEqual(mockBasket);
            expect(BasketsService.removeAllSimilar).toHaveBeenCalledWith(mockUser.id, boardGameId)
        });

        it('Должен вернуть 404 если корзина, пользователь или игра не найдены', async () => {
            (BasketsService.removeAllSimilar as jest.Mock).mockImplementation(() => { throw new NotFoundError('Не найден пользователь или корзина') });

            const res = await agent.post(API_ENDPOINTS.BASKETS.REMOVE_ALL_SIMILLAR).send({ boardGameId });

            expect(res.status).toBe(404);
            expect(BasketsService.removeAllSimilar).toHaveBeenCalledWith(mockUser.id, boardGameId);
        });

        it('Должен вернуть 400 если в теле запроса нет id настольной игры', async () => {
            const res = await agent.post(API_ENDPOINTS.BASKETS.REMOVE_ALL_SIMILLAR).send({});

            expect(res.status).toBe(400);
        });

        it('Должен вернуть 401 для неавторизованного пользователя', async () => {
            const res = await request(app).post(API_ENDPOINTS.BASKETS.REMOVE_ALL_SIMILLAR).send({ boardGameId });

            expect(res.status).toBe(401);
        });
    });

    describe(`POST ${API_ENDPOINTS.BASKETS.CLEAR}`, () => {
        it('Должен очистить элементы корзины и вернуть 200', async () => {
            (BasketsService.clear as jest.Mock).mockResolvedValue(mockBasket);

            const res = await agent.post(API_ENDPOINTS.BASKETS.CLEAR);

            expect(res.status).toBe(200);
            expect(res.body.data).toEqual(mockBasket);
            expect(BasketsService.clear).toHaveBeenCalledWith(mockUser.id)
        });

        it('Должен вернуть 404 если корзина или пользователь не найдены', async () => {
            (BasketsService.clear as jest.Mock).mockImplementation(() => { throw new NotFoundError('Не найден пользователь или корзина') });

            const res = await agent.post(API_ENDPOINTS.BASKETS.CLEAR);

            expect(res.status).toBe(404);
            expect(BasketsService.clear).toHaveBeenCalledWith(mockUser.id);
        });

        it('Должен вернуть 401 для неавторизованного пользователя', async () => {
            const res = await request(app).post(API_ENDPOINTS.BASKETS.CLEAR);

            expect(res.status).toBe(401);
        });
    });
});