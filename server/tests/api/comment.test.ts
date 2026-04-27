import request from 'supertest';
import express, { Application } from 'express';
import session from 'express-session';
import { API_ENDPOINTS } from './apiEndpoints';
import commentRouter from '../../src/routers/commentRouter';
import authRouter from '../../src/routers/authRouter';
import { CommentsService } from '../../src/services/commentsService';
import { NotFoundError } from '../../src/types/notFoundError';
import { DuplicateError } from '../../src/types/duplicateError';
import { UnauthorizedError } from '../../src/types/unauthorizedError';
import { AuthService } from '../../src/services/authService';
import { CommentsController } from '../../src/controllers/commentsController';

jest.mock('../../src/services/commentsService');
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
app.use('/api/comments', commentRouter);
app.get('/api/comments/:id', CommentsController.getByBoardGameId);

describe('Comments API', () => {
    let agent: request.Agent;
    const mockUser = { id: '1', login: 'test', name: 'Test', role: 'user', createdAt: '01.01.2026' };
    const mockComment = {
        id: 'c1',
        boardGameId: 'game123',
        userId: '1',
        userName: 'Test',
        text: 'Great game!',
        rating: 5,
        createdAt: '01.01.2026'
    };
    const newCommentData = { boardGameId: 'game123', rating: 5, text: 'Great game!' };

    beforeEach(async () => {
        jest.clearAllMocks();

        agent = request.agent(app);
        (AuthService.login as jest.Mock).mockResolvedValue(mockUser);
        await agent.post(API_ENDPOINTS.AUTH.LOGIN).send({ login: 'test', password: '123' });
    });

    describe(`GET ${API_ENDPOINTS.COMMENTS.GET_BY_GAME_ID}`, () => {
        const gameId = 'game123';

        it('Должен вернуть комментарии для игры', async () => {
            (CommentsService.getByBoardGameId as jest.Mock).mockReturnValue([mockComment]);

            const res = await agent.get(API_ENDPOINTS.COMMENTS.GET_BY_GAME_ID(gameId));

            expect(res.status).toBe(200);
            expect(res.body.data).toEqual([mockComment]);
            expect(CommentsService.getByBoardGameId).toHaveBeenCalledWith(gameId);
        });

        it('Должен вернуть 404 если игра не найдена', async () => {
            (CommentsService.getByBoardGameId as jest.Mock).mockImplementation(() => {
                throw new NotFoundError('Игра не найдена');
            });

            const res = await agent.get(API_ENDPOINTS.COMMENTS.GET_BY_GAME_ID(gameId));

            expect(res.status).toBe(404);
        });

        it('Должен вернуть пустой массив если комментариев нет', async () => {
            (CommentsService.getByBoardGameId as jest.Mock).mockReturnValue([]);

            const res = await agent.get(API_ENDPOINTS.COMMENTS.GET_BY_GAME_ID(gameId));

            expect(res.status).toBe(200);
            expect(res.body.data).toEqual([]);
        });
    });

    describe(`POST ${API_ENDPOINTS.COMMENTS.ADD}`, () => {
        it('Должен добавить комментарий и вернуть 201', async () => {
            (CommentsService.add as jest.Mock).mockResolvedValue(mockComment);

            const res = await agent.post(API_ENDPOINTS.COMMENTS.ADD).send(newCommentData);

            expect(res.status).toBe(201);
            expect(res.body.data).toEqual(mockComment);
            expect(CommentsService.add).toHaveBeenCalledWith(newCommentData, '1');
        });

        it('Должен вернуть 400 если нет boardGameId', async () => {
            const res = await agent.post(API_ENDPOINTS.COMMENTS.ADD).send({ rating: 5, text: 'text' });
            expect(res.status).toBe(400);
        });

        it('Должен вернуть 400 если рейтинг меньше 1 или больше 5', async () => {
            const res = await agent.post(API_ENDPOINTS.COMMENTS.ADD).send({ boardGameId: 'game123', rating: 10 });
            expect(res.status).toBe(400);
        });

        it('Должен вернуть 404 если игра не найдена', async () => {
            (CommentsService.add as jest.Mock).mockRejectedValue(new NotFoundError('Игра не найдена'));

            const res = await agent.post(API_ENDPOINTS.COMMENTS.ADD).send(newCommentData);

            expect(res.status).toBe(404);
        });

        it('Должен вернуть 409 если пользователь уже оставлял комментарий', async () => {
            (CommentsService.add as jest.Mock).mockRejectedValue(new DuplicateError('Уже оставляли отзыв'));

            const res = await agent.post(API_ENDPOINTS.COMMENTS.ADD).send(newCommentData);

            expect(res.status).toBe(409);
        });

        it('Должен вернуть 401 для неавторизованного пользователя', async () => {
            const res = await request(app).post(API_ENDPOINTS.COMMENTS.ADD).send(newCommentData);
            expect(res.status).toBe(401);
        });
    });

    describe(`DELETE ${API_ENDPOINTS.COMMENTS.DELETE}`, () => {
        const commentId = 'c1';

        it('Должен удалить комментарий и вернуть 204', async () => {
            (CommentsService.delete as jest.Mock).mockResolvedValue(undefined);

            const res = await agent.delete(API_ENDPOINTS.COMMENTS.DELETE(commentId));

            expect(res.status).toBe(204);
            expect(CommentsService.delete).toHaveBeenCalledWith('1', commentId);
        });

        it('Должен вернуть 404 если комментарий не найден', async () => {
            (CommentsService.delete as jest.Mock).mockRejectedValue(new NotFoundError('Комментарий не найден'));

            const res = await agent.delete(API_ENDPOINTS.COMMENTS.DELETE(commentId));

            expect(res.status).toBe(404);
        });

        it('Должен вернуть 401 если пользователь не автор комментария', async () => {
            (CommentsService.delete as jest.Mock).mockRejectedValue(new UnauthorizedError('Не автор'));

            const res = await agent.delete(API_ENDPOINTS.COMMENTS.DELETE(commentId));

            expect(res.status).toBe(401);
        });

        it('Должен вернуть 401 для неавторизованного пользователя', async () => {
            const res = await request(app).delete(API_ENDPOINTS.COMMENTS.DELETE(commentId));
            expect(res.status).toBe(401);
        });
    });
});