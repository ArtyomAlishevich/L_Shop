import request from 'supertest';
import express, { Application } from 'express';
import session from 'express-session';
import { API_ENDPOINTS } from './apiEndpoints';
import deliveryRouter from '../../src/routers/deliveryRouter';
import authRouter from '../../src/routers/authRouter';
import { DeliveryService } from '../../src/services/deliveryService';
import { NotFoundError } from '../../src/types/notFoundError';
import { AuthService } from '../../src/services/authService';

jest.mock('../../src/services/deliveryService');
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
app.use('/api/delivery', deliveryRouter);

describe('Delivery API', () => {
    let agent: request.Agent;
    const mockUser = { id: '1', login: 'test', name: 'Test', role: 'user', createdAt: '01.01.2026' };
    const deliveryData = {
        phone: '+79991234567',
        email: 'test@example.com',
        country: 'Russia',
        city: 'Moscow',
        street: 'Tverskaya',
        house: '1',
        apartment: '10',
        paymentMethod: 'card'
    };
    const mockDelivery = {
        id: 'delivery1',
        userId: '1',
        contact: { phone: '+79991234567', email: 'test@example.com' },
        address: { country: 'Russia', city: 'Moscow', street: 'Tverskaya', house: '1', apartment: '10' },
        paymentMethod: 'card',
        items: [],
        totalCount: 2,
        totalSum: 500,
        totalDeliverySum: 100,
        totalOrderSum: 600,
        createdAt: new Date().toISOString(),
        status: 'created'
    };

    beforeEach(async () => {
        jest.clearAllMocks();

        agent = request.agent(app);
        (AuthService.login as jest.Mock).mockResolvedValue(mockUser);
        await agent.post(API_ENDPOINTS.AUTH.LOGIN).send({ login: 'test', password: '123' });
    });

    describe(`POST ${API_ENDPOINTS.DELIVERY.CREATE}`, () => {
        it('Должен создать доставку и вернуть 201', async () => {
            (DeliveryService.create as jest.Mock).mockResolvedValue(mockDelivery);

            const res = await agent.post(API_ENDPOINTS.DELIVERY.CREATE).send(deliveryData);

            expect(res.status).toBe(201);
            expect(res.body.data).toEqual(mockDelivery);
            expect(DeliveryService.create).toHaveBeenCalledWith('1', deliveryData);
        });

        it('Должен вернуть 400 если нет обязательных полей', async () => {
            const res = await agent.post(API_ENDPOINTS.DELIVERY.CREATE).send({ phone: '123' });
            expect(res.status).toBe(400);
        });

        it('Должен вернуть 400 если корзина пуста', async () => {
            (DeliveryService.create as jest.Mock).mockRejectedValue(new Error('Нельзя оформить доставку с пустой корзиной'));

            const res = await agent.post(API_ENDPOINTS.DELIVERY.CREATE).send(deliveryData);

            expect(res.status).toBe(400);
        });

        it('Должен вернуть 404 если пользователь не найден', async () => {
            (DeliveryService.create as jest.Mock).mockRejectedValue(new NotFoundError('Пользователь не найден'));

            const res = await agent.post(API_ENDPOINTS.DELIVERY.CREATE).send(deliveryData);

            expect(res.status).toBe(404);
        });

        it('Должен вернуть 401 для неавторизованного пользователя', async () => {
            const res = await request(app).post(API_ENDPOINTS.DELIVERY.CREATE).send(deliveryData);
            expect(res.status).toBe(401);
        });
    });

    describe(`GET ${API_ENDPOINTS.DELIVERY.GET_BY_ID}`, () => {
        const deliveryId = 'delivery1';

        it('Должен вернуть доставку по id', async () => {
            (DeliveryService.getById as jest.Mock).mockResolvedValue(mockDelivery);

            const res = await agent.get(API_ENDPOINTS.DELIVERY.GET_BY_ID(deliveryId));

            expect(res.status).toBe(200);
            expect(res.body.data).toEqual(mockDelivery);
            expect(DeliveryService.getById).toHaveBeenCalledWith(deliveryId);
        });

        it('Должен вернуть 404 если доставка не найдена', async () => {
            (DeliveryService.getById as jest.Mock).mockResolvedValue(undefined);

            const res = await agent.get(API_ENDPOINTS.DELIVERY.GET_BY_ID(deliveryId));

            expect(res.status).toBe(404);
        });

        it('Должен вернуть 403 если заказ принадлежит другому пользователю', async () => {
            const otherUserDelivery = { ...mockDelivery, userId: '999' };
            (DeliveryService.getById as jest.Mock).mockResolvedValue(otherUserDelivery);

            const res = await agent.get(API_ENDPOINTS.DELIVERY.GET_BY_ID(deliveryId));

            expect(res.status).toBe(403);
        });

        it('Должен вернуть 401 для неавторизованного пользователя', async () => {
            const res = await request(app).get(API_ENDPOINTS.DELIVERY.GET_BY_ID(deliveryId));
            expect(res.status).toBe(401);
        });
    });
});