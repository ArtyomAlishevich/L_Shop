import { Request, Response } from 'express';
import { RecommendationService } from '../services/recommendationService';

export class RecommendationController {
    static async like(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.session.userId;
            const boardGameId = req.params.id as string;
            if (!userId) {
                res.status(401).json({ error: 'Не авторизован' });
                return;
            }
            if (!boardGameId) {
                res.status(400).json({ error: 'Не указан идентификатор игры' });
                return;
            }
            await RecommendationService.likeBoardGame(userId, boardGameId);
            res.status(200).json({ message: 'Лайк добавлен' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Ошибка при добавлении лайка' });
        }
    }

    static async unlike(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.session.userId;
            const boardGameId = req.params.id as string;
            if (!userId) {
                res.status(401).json({ error: 'Не авторизован' });
                return;
            }
            if (!boardGameId) {
                res.status(400).json({ error: 'Не указан идентификатор игры' });
                return;
            }
            await RecommendationService.unlikeBoardGame(userId, boardGameId);
            res.status(200).json({ message: 'Лайк убран' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Ошибка при удалении лайка' });
        }
    }
}