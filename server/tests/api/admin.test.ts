import request from 'supertest';
import express, { Application } from 'express';
import session from 'express-session';
import { API_ENDPOINTS } from './apiEndpoints';
import adminRouter from '../../src/routers/adminRouter';
import authRouter from '../../src/routers/authRouter';
import { BoardGamesService } from '../../src/services/boardGamesService';
import { AuthService } from '../../src/services/authService';
import { UsersDatabase } from '../../db/usersDatabase';
import { NotFoundError } from '../../src/types/notFoundError';

jest.mock('../../src/services/boardGamesService');
jest.mock('../../src/services/authService');
jest.mock('../../db/usersDatabase');

const app: Application = express();
app.use(express.json());
app.use(session({
    secret: 'test',
    saveUninitialized: false,
    resave: false,
    cookie: { secure: false }
}));
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);

describe('Admin API', () => {
    let adminAgent: request.Agent;
    let userAgent: request.Agent;
    
    const adminUser = { id: '1', login: 'admin', name: 'Admin', role: 'admin', createdAt: '01.01.2026' };
    const regularUser = { id: '2', login: 'user', name: 'User', role: 'user', createdAt: '01.01.2026' };
    
    const newGameData = {
        name: { ru: 'Новая игра', en: 'New Game' },
        description: { ru: 'Описание', en: 'Description' },
        categories: { ru: ['Стратегия'], en: ['Strategy'] },
        minPlayers: 2,
        maxPlayers: 4,
        isAvailable: true,
        price: 1500,
        amount: 10,
        images: { preview: 'image.jpg', gallery: [] }
    };
    
    const createdGame = {
        id: 'game123',
        ...newGameData,
        averageRating: 0
    };
    
    const updatedGame = {
        ...createdGame,
        price: 2000
    };

    beforeEach(async () => {
        jest.clearAllMocks();
        
        adminAgent = request.agent(app);
        userAgent = request.agent(app);
        
        (AuthService.login as jest.Mock).mockResolvedValue(adminUser);
        await adminAgent.post(API_ENDPOINTS.AUTH.LOGIN).send({ login: 'admin', password: '123' });
        
        (AuthService.login as jest.Mock).mockResolvedValue(regularUser);
        await userAgent.post(API_ENDPOINTS.AUTH.LOGIN).send({ login: 'user', password: '123' });
    });

    describe(`POST ${API_ENDPOINTS.ADMIN.CREATE_GAME}`, () => {
        it('Должен создать игру для админа и вернуть 201', async () => {
            (UsersDatabase.getById as jest.Mock).mockReturnValue(adminUser);
            (BoardGamesService.create as jest.Mock).mockResolvedValue(createdGame);

            const res = await adminAgent.post(API_ENDPOINTS.ADMIN.CREATE_GAME).send(newGameData);

            expect(res.status).toBe(201);
            expect(res.body.data).toEqual(createdGame);
            expect(BoardGamesService.create).toHaveBeenCalledWith(newGameData);
        });

        it('Должен вернуть 400 если не хватает обязательных полей', async () => {
            (UsersDatabase.getById as jest.Mock).mockReturnValue(adminUser);
            
            const res = await adminAgent.post(API_ENDPOINTS.ADMIN.CREATE_GAME).send({ name: { ru: 'test' } });

            expect(res.status).toBe(400);
        });

        it('Должен вернуть 403 для обычного пользователя', async () => {
            (UsersDatabase.getById as jest.Mock).mockReturnValue(regularUser);
            
            const res = await userAgent.post(API_ENDPOINTS.ADMIN.CREATE_GAME).send(newGameData);

            expect(res.status).toBe(403);
        });

        it('Должен вернуть 401 для неавторизованного пользователя', async () => {
            const res = await request(app).post(API_ENDPOINTS.ADMIN.CREATE_GAME).send(newGameData);
            expect(res.status).toBe(401);
        });
    });

    describe(`PUT ${API_ENDPOINTS.ADMIN.UPDATE_GAME(':id')}`, () => {
        const gameId = 'game123';
        const updateData = { price: 2000 };

        it('Должен обновить игру для админа и вернуть 200', async () => {
            (UsersDatabase.getById as jest.Mock).mockReturnValue(adminUser);
            (BoardGamesService.update as jest.Mock).mockResolvedValue(updatedGame);

            const res = await adminAgent.put(API_ENDPOINTS.ADMIN.UPDATE_GAME(gameId)).send(updateData);

            expect(res.status).toBe(200);
            expect(res.body).toEqual(updatedGame);
            expect(BoardGamesService.update).toHaveBeenCalledWith(gameId, updateData);
        });

        it('Должен вернуть 404 если игра не найдена', async () => {
            (UsersDatabase.getById as jest.Mock).mockReturnValue(adminUser);
            (BoardGamesService.update as jest.Mock).mockRejectedValue(new NotFoundError('Не найдена игра'));

            const res = await adminAgent.put(API_ENDPOINTS.ADMIN.UPDATE_GAME('nonexistent')).send(updateData);

            expect(res.status).toBe(404);
        });

        it('Должен вернуть 403 для обычного пользователя', async () => {
            (UsersDatabase.getById as jest.Mock).mockReturnValue(regularUser);
            
            const res = await userAgent.put(API_ENDPOINTS.ADMIN.UPDATE_GAME(gameId)).send(updateData);

            expect(res.status).toBe(403);
        });

        it('Должен вернуть 401 для неавторизованного пользователя', async () => {
            const res = await request(app).put(API_ENDPOINTS.ADMIN.UPDATE_GAME(gameId)).send(updateData);
            expect(res.status).toBe(401);
        });
    });

    describe(`DELETE ${API_ENDPOINTS.ADMIN.DELETE_GAME(':id')}`, () => {
        const gameId = 'game123';

        it('Должен удалить игру для админа и вернуть 204', async () => {
            (UsersDatabase.getById as jest.Mock).mockReturnValue(adminUser);
            (BoardGamesService.delete as jest.Mock).mockResolvedValue(undefined);

            const res = await adminAgent.delete(API_ENDPOINTS.ADMIN.DELETE_GAME(gameId));

            expect(res.status).toBe(204);
            expect(BoardGamesService.delete).toHaveBeenCalledWith(gameId);
        });

        it('Должен вернуть 404 если игра не найдена', async () => {
            (UsersDatabase.getById as jest.Mock).mockReturnValue(adminUser);
            (BoardGamesService.delete as jest.Mock).mockRejectedValue(new NotFoundError('Не найдена игра'));

            const res = await adminAgent.delete(API_ENDPOINTS.ADMIN.DELETE_GAME('nonexistent'));

            expect(res.status).toBe(404);
        });

        it('Должен вернуть 403 для обычного пользователя', async () => {
            (UsersDatabase.getById as jest.Mock).mockReturnValue(regularUser);
            
            const res = await userAgent.delete(API_ENDPOINTS.ADMIN.DELETE_GAME(gameId));

            expect(res.status).toBe(403);
        });

        it('Должен вернуть 401 для неавторизованного пользователя', async () => {
            const res = await request(app).delete(API_ENDPOINTS.ADMIN.DELETE_GAME(gameId));
            expect(res.status).toBe(401);
        });
    });
});