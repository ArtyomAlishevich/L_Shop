import request from 'supertest';
import express, { Application } from 'express';
import session from 'express-session';
import { API_ENDPOINTS } from './apiEndpoints';
import recommendationRouter from '../../src/routers/recommendationRouter';
import authRouter from '../../src/routers/authRouter';
import { RecommendationService } from '../../src/services/recommendationService';
import { AuthService } from '../../src/services/authService';

jest.mock('../../src/services/recommendationService');
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
app.use('/api/recommendations', recommendationRouter);

describe('Recommendations API (Likes)', () => {
    let agent: request.Agent;
    const mockUser = { id: '1', login: 'test', name: 'Test', role: 'user', createdAt: '01.01.2026' };
    const boardGameId = 'game123';

    beforeEach(async () => {
        jest.clearAllMocks();

        agent = request.agent(app);
        (AuthService.login as jest.Mock).mockResolvedValue(mockUser);
        await agent.post(API_ENDPOINTS.AUTH.LOGIN).send({ login: 'test', password: '123' });
    });

    describe(`POST ${API_ENDPOINTS.RECOMMENDATIONS.LIKE}`, () => {
        it('Должен поставить лайк игре и вернуть 200', async () => {
            (RecommendationService.likeBoardGame as jest.Mock).mockResolvedValue(undefined);

            const res = await agent.post(API_ENDPOINTS.RECOMMENDATIONS.LIKE(boardGameId));

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Лайк добавлен');
            expect(RecommendationService.likeBoardGame).toHaveBeenCalledWith('1', boardGameId);
        });

        it('Должен вернуть 401 для неавторизованного пользователя', async () => {
            const res = await request(app).post(API_ENDPOINTS.RECOMMENDATIONS.LIKE(boardGameId));
            expect(res.status).toBe(401);
        });
    });

    describe(`DELETE ${API_ENDPOINTS.RECOMMENDATIONS.UNLIKE}`, () => {
        it('Должен убрать лайк с игры и вернуть 200', async () => {
            (RecommendationService.unlikeBoardGame as jest.Mock).mockResolvedValue(undefined);

            const res = await agent.delete(API_ENDPOINTS.RECOMMENDATIONS.UNLIKE(boardGameId));

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Лайк убран');
            expect(RecommendationService.unlikeBoardGame).toHaveBeenCalledWith('1', boardGameId);
        });

        it('Должен вернуть 401 для неавторизованного пользователя', async () => {
            const res = await request(app).delete(API_ENDPOINTS.RECOMMENDATIONS.UNLIKE(boardGameId));
            expect(res.status).toBe(401);
        });
    });
});