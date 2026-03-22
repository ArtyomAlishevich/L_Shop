import { Request, Response, NextFunction } from "express";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Невозможно получить доступ к корзине: пользователь неавторизован' });
    }
    next();
};