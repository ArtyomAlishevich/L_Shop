import { BoardGamesDatabase } from "../../db/boardGamesDatabase";
import { CommentsDatabase } from "../../db/commentsDatabase";
import { UsersDatabase } from "../../db/usersDatabase";
import { DuplicateError } from "../types/duplicateError";
import { IComment } from "../types/iComment";
import { ICommentCreateDTO } from "../types/iCommentCreateDTO";
import { NotFoundError } from "../types/notFoundError";
import { UnauthorizedError } from "../types/unauthorizedError";

export class CommentsService {
    static getByBoardGameId(boardGameId: string) : IComment[] {
        try {
            if (!BoardGamesDatabase.getById(boardGameId)) {
                throw new NotFoundError(`Не найдена настольная игра с id ${boardGameId}`);
            }

            return CommentsDatabase.getAllByBoardGameId(boardGameId);
        } catch (error) {
            throw error;
        }
    }

    static async add(commentData: ICommentCreateDTO, userId: string) : Promise<IComment> {
        try {
            if (!BoardGamesDatabase.getById(commentData.boardGameId)) {
                throw new NotFoundError(`Не найдена настольная игра с id ${commentData.boardGameId}`);
            }

            if (CommentsDatabase.getByUserAndGameId(userId, commentData.boardGameId)) {
                throw new DuplicateError(`Пользователь с id ${userId} уже написал отзыв для настольной игры с id ${commentData.boardGameId}`);
            }

            const userName = UsersDatabase.getById(userId)?.name;
            const createdComment : IComment = await CommentsDatabase.add(commentData, userId, userName!);
            return createdComment;
        } catch (error) {
            throw error;
        }
    }

    static async delete(userId: string, commentId: string) : Promise<void> {
        try {
            const comment : IComment | undefined = CommentsDatabase.getById(commentId);
            
            if (!comment) {
                throw new NotFoundError(`Не найден отзыв с id ${commentId}`);
            }

            if (comment.userId !== userId) {
                throw new UnauthorizedError(`Пользователь с id ${userId} не является автором отзыва с id ${commentId}`);
            }
            await CommentsDatabase.delete(commentId);
        } catch (error) {
            throw error;
        }
    }
}
