import { Request, Response } from "express";
import { NotFoundError } from "../types/notFoundError";
import { IComment } from "../types/iComment";
import { CommentsService } from "../services/commentsService";
import { ICommentCreateDTO } from "../types/iCommentCreateDTO";
import { UnauthorizedError } from "../types/unauthorizedError";
import { DuplicateError } from "../types/duplicateError";

export class CommentsController {
    static getByBoardGameId(req: Request, res: Response) : void {
        try {
            const boardGameid = req.params.id as string;
            const comments : IComment[] = CommentsService.getByBoardGameId(boardGameid);
            res.status(200).json({ data: comments });
        } catch (error) {
            console.log(`Ошибка при получении отзывов игры: ${(error as Error).message}`);

            if (error instanceof NotFoundError) {
                res.status(404).json({ error: `Ошибка при получении отзывов игры: ${error.message}` });
                return;
            }

            res.status(500).json({ error: `Ошибка при получении отзывов игры: ${(error as Error).message}` });
        }
    }

    static async add(req: Request, res: Response) {
        try {
            const userId = req.session.userId as string;
            const { boardGameId, rating, text } = req.body;
            
            if (!boardGameId || rating === undefined || rating <= 0 || rating > 5) {
                return res.status(400).json({ error: 'Обязательные поля: boardGameId, rating (1-5)' });
            }
            
            if (typeof boardGameId !== 'string' || typeof rating !== 'number' || (text && typeof text !== 'string')) {
                return res.status(400).json({ error: 'Требуемые типы: boardGameId - string, rating - number, text - string' });
            }

            const commentCreateData : ICommentCreateDTO = {
                boardGameId: boardGameId,
                rating: rating,
                text: text
            };

            const createdComment: IComment = await CommentsService.add(commentCreateData, userId);
            res.status(201).json({ data: createdComment });
        } catch (error) {
            console.log(`Ошибка при добавлении отзыва по настольной игре: ${(error as Error).message}`);

            if (error instanceof NotFoundError) {
                res.status(404).json({ error: `Ошибка при добавлении отзыва по настольной игре: ${error.message}` });
                return;
            }

            if (error instanceof DuplicateError) {
                res.status(409).json({ error: `Ошибка при добавлении отзыва по настольной игре: ${error.message}` });
                return;
            }

            res.status(500).json({ error: `Ошибка при добавлении отзыва по настольной игре: ${(error as Error).message}` });
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            const userId = req.session.userId as string;
            const commentId = req.params.id as string;
            await CommentsService.delete(userId, commentId);
            res.status(204).send();
        } catch (error) {
            console.log(`Ошибка при удалении отзыва по настольной игре: ${(error as Error).message}`);

            if (error instanceof NotFoundError) {
                res.status(404).json({ error: `Ошибка при удалении отзыва по настольной игре: ${error.message}` });
                return;
            }

            if (error instanceof UnauthorizedError) {
                res.status(401).json({ error: `Ошибка при удалении отзыва по настольной игре: ${error.message}` });
                return;
            }

            res.status(500).json({ error: `Ошибка при удалении отзыва по настольной игре: ${(error as Error).message}` });
        }
    }
}