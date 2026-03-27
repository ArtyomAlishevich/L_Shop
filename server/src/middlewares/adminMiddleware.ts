import { Request, Response, NextFunction } from "express";
import { UsersDatabase } from "../../db/usersDatabase";

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const user = UsersDatabase.getById(req.session.userId as string);
    if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Доступ запрещён: требуется роль администратора' });
    }
    next();
};