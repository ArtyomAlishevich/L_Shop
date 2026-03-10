import express, { Application } from 'express';
import authRouter from './routers/authRouter';
import boardGamesRouter from './routers/boardGamesRouter';
import basketsRouter from './routers/basketsRouter';
import session from 'express-session';
import dotenv from 'dotenv';
import deliveryRouter from './routers/deliveryRouter';
import path from 'path'; 

dotenv.config();
const app: Application = express();
const PORT = 3000;
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
app.use('/images', express.static(path.join(__dirname, '../db/images')));
app.use('/api/boardGames', boardGamesRouter);
app.use('/api/auth', authRouter);
app.use('/api/basket', basketsRouter);
app.use('/api/delivery', deliveryRouter);
app.listen(PORT, () => {
    console.log('Сервер запущен');
});