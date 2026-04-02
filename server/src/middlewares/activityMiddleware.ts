import { Request, Response, NextFunction } from 'express';
import { UsersDatabase } from '../../db/usersDatabase';

export const activityMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    if (req.session.userId) {
        await UsersDatabase.updateLastVisit(req.session.userId);
    }
    next();
};