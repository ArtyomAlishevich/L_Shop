import express, { Application } from 'express';
import authRouter from './routers/authRouter';
import boardGamesRouter from './routers/boardGamesRouter';
import basketsRouter from './routers/basketsRouter';
import session from 'express-session';
import dotenv from 'dotenv';
import deliveryRouter from './routers/deliveryRouter';
import localeRouter from './routers/localeRouter';
import path from 'path';
import cors from 'cors';
import adminRouter from './routers/adminRouter';
import commentRouter from './routers/commentRouter';
import { CommentsController } from './controllers/commentsController';

dotenv.config();
const app: Application = express();
const PORT = 3000;

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        maxAge: 10 * 60 * 1000
    }
}));
app.use(express.json());

app.use('/api/boardgames', boardGamesRouter);
app.use('/images', express.static(path.join(__dirname, '../db/images')));
app.use('/api/boardGames', boardGamesRouter);
app.use('/api/auth', authRouter);
app.use('/api/baskets', basketsRouter);
app.use('/api/delivery', deliveryRouter);
app.use('/api/locale', localeRouter);
app.use('/api/admin', adminRouter);
app.get('/api/comments/:id', CommentsController.getByBoardGameId);
app.use('/api/comments', commentRouter);

app.listen(PORT, () => {
    console.log('Сервер запущен');
});
