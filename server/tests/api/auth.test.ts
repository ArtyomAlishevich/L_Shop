import request from 'supertest';
import express, { Application } from 'express';
import session from 'express-session';
import authRouter from '../../src/routers/authRouter';
import { AuthService } from '../../src/services/authService';
import { DuplicateError } from '../../src/types/duplicateError';
import { UnauthorizedError } from '../../src/types/unauthorizedError';
import { API_ENDPOINTS } from './apiEndpoints';
import basketsRouter from '../../src/routers/basketsRouter';

jest.mock('../../src/services/authService');

const app : Application = express();
app.use(express.json());
app.use(session ({
    secret: 'test',
    saveUninitialized: false,
    resave: false,
    cookie: {
        secure: false
    }
}));
app.use('/api/auth', authRouter);
app.use('/api/baskets', basketsRouter);
describe('Auth API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe(`POST ${API_ENDPOINTS.AUTH.REGISTER}`, () => {
        it('Должен зарегистрировать пользователя и вернуть 201', async () => {
            const mockUser = { id: '1', login: 'test', name: 'Test', createdAt: '01.01.2026' };
            const sendingData = { login: 'test', password: '123', name: 'Test' };
            (AuthService.register as jest.Mock).mockResolvedValue(mockUser);

            const res = await request(app).post(API_ENDPOINTS.AUTH.REGISTER).send(sendingData);

            expect(res.status).toBe(201);
            expect(res.body.newUser).toEqual(mockUser);
            expect(AuthService.register).toHaveBeenCalledWith(sendingData);
        });

        it('Должен вернуть 400 при отсутствии логина, или пароля, или имени', async () => {
            const res = await request(app).post(API_ENDPOINTS.AUTH.REGISTER).send({ name: 'test' });
            expect(res.status).toBe(400);
        });

        it('Должен вернуть 409 при дубликате логина', async () => {
            const sendingData = { login: 'dup', password: '123', name: 'dup' };
            (AuthService.register as jest.Mock).mockRejectedValue(new DuplicateError('логин уже занят'));

            const res = await request(app).post(API_ENDPOINTS.AUTH.REGISTER).send(sendingData);

            expect(AuthService.register).toHaveBeenCalledWith(sendingData);
            expect(res.status).toBe(409);
        })
    });

    describe(`POST ${API_ENDPOINTS.AUTH.LOGIN}`, () => {
        it('Должен авторизовать и вернуть 200', async () => {
            const mockUser = { id: '1', login: 'test', password: '123', name: 'Test', role: 'user', createdAt: '01.01.2026' };
            const sendingData = { login: 'test', password: '123' };
            (AuthService.login as jest.Mock).mockResolvedValue(mockUser);

            const res = await request(app).post(API_ENDPOINTS.AUTH.LOGIN).send(sendingData);

            expect(res.status).toBe(200);
            expect(AuthService.login).toHaveBeenCalledWith(sendingData);
            expect(res.body.user).toMatchObject({ id: mockUser.id, login: mockUser.login, name: mockUser.name, createdAt: mockUser.createdAt });
        });

        it('Должен вернуть 401 при неверных данных', async () => {
            (AuthService.login as jest.Mock).mockRejectedValue(new UnauthorizedError('Неверный логин или пароль'));

            const res = await request(app).post(API_ENDPOINTS.AUTH.LOGIN).send({ login: 'incorrect', password: 'incorrect' });

            expect(res.status).toBe(401);
        });
    });

    describe(`POST ${API_ENDPOINTS.AUTH.LOGOUT}`, () => {
        it('Должен уничтожить сессию и вернуть 200', async () => {
            const mockUser = { id: '1', login: 'test', password: '123', name: 'Test', role: 'user', createdAt: '01.01.2026' };
            const agent = request.agent(app);
            (AuthService.login as jest.Mock).mockResolvedValue(mockUser);

            const loginResponse = await agent.post(API_ENDPOINTS.AUTH.LOGIN).send({ login: 'test', password: '123' });
            expect(loginResponse.status).toBe(200);

            const basketSuccessResponse = await agent.get(API_ENDPOINTS.BASKETS.GET);
            expect(basketSuccessResponse.status).toBe(200);

            const logoutResponse = await agent.post(API_ENDPOINTS.AUTH.LOGOUT);
            expect(logoutResponse.status).toBe(200);

            const basketFailResponse = await agent.get(API_ENDPOINTS.BASKETS.GET);
            expect(basketFailResponse.status).toBe(401);
        });
    });
});


