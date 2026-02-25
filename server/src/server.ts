import express, { Application } from 'express';
import authRouter from './routers/authRouter';
import boardGamesRouter from './routers/boardGamesRouter';
import basketsRouter from './routers/basketsRouter';

const app: Application = express();
const PORT = 3000;
app.use(express.json());
app.use('/api/boardGames', boardGamesRouter);
app.use('/api/auth', authRouter);
app.use('/api/basket', basketsRouter);

app.listen(PORT, () => {
    console.log('Сервер запущен');
});