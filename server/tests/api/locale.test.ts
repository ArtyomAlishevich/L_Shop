import request from 'supertest';
import express, { Application } from 'express';
import session from 'express-session';
import { API_ENDPOINTS } from './apiEndpoints';
import localeRouter from '../../src/routers/localeRouter';

const app: Application = express();
app.use(express.json());
app.use(session({
    secret: 'test',
    saveUninitialized: false,
    resave: false,
    cookie: { secure: false }
}));
app.use('/api/locale', localeRouter);

describe('Locale API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe(`GET ${API_ENDPOINTS.LOCALE.GET}`, () => {
        it('Должен вернуть текущую локаль (по умолчанию ru)', async () => {
            const res = await request(app).get(API_ENDPOINTS.LOCALE.GET);

            expect(res.status).toBe(200);
            expect(res.body.data).toBe('ru');
        });

        it('Должен вернуть локаль из сессии если она установлена', async () => {
            const agent = request.agent(app);
            await agent.post(API_ENDPOINTS.LOCALE.SET).send({ locale: 'en' });

            const res = await agent.get(API_ENDPOINTS.LOCALE.GET);

            expect(res.status).toBe(200);
            expect(res.body.data).toBe('en');
        });
    });

    describe(`POST ${API_ENDPOINTS.LOCALE.SET}`, () => {
        it('Должен установить локаль en', async () => {
            const agent = request.agent(app);
            const res = await agent.post(API_ENDPOINTS.LOCALE.SET).send({ locale: 'en' });

            expect(res.status).toBe(200);
            expect(res.body.data).toBe('en');
        });

        it('Должен установить локаль ru', async () => {
            const agent = request.agent(app);
            const res = await agent.post(API_ENDPOINTS.LOCALE.SET).send({ locale: 'ru' });

            expect(res.status).toBe(200);
            expect(res.body.data).toBe('ru');
        });

        it('Должен игнорировать неверную локаль и не менять значение', async () => {
            const agent = request.agent(app);
            
            await agent.post(API_ENDPOINTS.LOCALE.SET).send({ locale: 'ru' });
            
            const res = await agent.post(API_ENDPOINTS.LOCALE.SET).send({ locale: 'de' });
            
            const getRes = await agent.get(API_ENDPOINTS.LOCALE.GET);
            expect(getRes.body.data).toBe('ru');
        });

        it('Должен игнорировать запрос без locale', async () => {
            const agent = request.agent(app);
            const res = await agent.post(API_ENDPOINTS.LOCALE.SET).send({});

            expect(res.status).toBe(200);
            
            const getRes = await agent.get(API_ENDPOINTS.LOCALE.GET);
            expect(getRes.body.data).toBe('ru');
        });
    });
});