import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import commentsData from './comments.json';
import { IComment } from '../src/types/iComment';
import { ICommentCreateDTO } from '../src/types/iCommentCreateDTO';
import { BoardGamesDatabase } from './boardGamesDatabase';
import { IBoardGame } from '../src/types/iBoardGame';
import data from './boardGames.json';

export class CommentsDatabase {
    static getAllByBoardGameId(boardGameId: string) : IComment[] {
        try {
            return commentsData.comments.filter(c => c.boardGameId === boardGameId);
        } catch (error) {
            throw error;
        }
    }

    static getById(commentId: string) : IComment | undefined {
        try {
            return commentsData.comments.find(c => c.id === commentId);
        } catch (error) {
            throw error;
        }
    }

    static getByUserAndGameId(userId: string, boardGameId: string) : boolean {
        try {
            return commentsData.comments.some(c => c.boardGameId === boardGameId && c.userId === userId);
        } catch (error) {
            throw error;
        }
    }

    static async add(commentData: ICommentCreateDTO, userId: string, userName: string) : Promise<IComment> {
        try {
            const newComment : IComment = {
                id: uuidv4(),
                boardGameId: commentData.boardGameId,
                userId: userId,
                userName: userName,
                text: commentData?.text,
                rating: commentData.rating,
                createdAt : new Date().toLocaleDateString('ru-RU')
            };

            const commentsCount = commentsData.comments.filter(c => c.boardGameId === commentData.boardGameId).length;
            const boardGame: IBoardGame = BoardGamesDatabase.getById(commentData.boardGameId)!;
            const oldRatingSum = boardGame.averageRating! * commentsCount;
            const newBoardGameAvgRating = (oldRatingSum + commentData.rating) / (commentsCount + 1);
            data.boardGames.forEach((g : IBoardGame) => {
                if (g.id === boardGame.id) {
                    g.averageRating = newBoardGameAvgRating;
                }
            });
            (commentsData.comments as IComment[]).push(newComment);
            await fs.writeFile(path.join(__dirname, 'comments.json'), JSON.stringify(commentsData, null, 2));
            await fs.writeFile(path.join(__dirname, 'boardGames.json'), JSON.stringify(data, null, 2));
            return newComment;
        } catch (error) {
            throw error;
        }
    }

    static async delete(commentId: string) : Promise<void> {
        try {
            const comment : IComment = commentsData.comments.find(c => c.id === commentId)!;
            const boardGame: IBoardGame = BoardGamesDatabase.getById(comment.boardGameId)!;
            const commentsCount = commentsData.comments.filter(c => c.boardGameId === boardGame.id).length;
            const oldRatingSum = boardGame.averageRating! * commentsCount;
            const newBoardGameAvgRating = (oldRatingSum - comment.rating) / (commentsCount - 1);
            data.boardGames.forEach((g : IBoardGame) => {
                if (g.id === boardGame.id) {
                    g.averageRating = newBoardGameAvgRating;
                }
            });
            commentsData.comments = commentsData.comments.filter(c => c.id !== commentId);
            await fs.writeFile(path.join(__dirname, 'comments.json'), JSON.stringify(commentsData, null, 2));
            await fs.writeFile(path.join(__dirname, 'boardGames.json'), JSON.stringify(data, null, 2));
        } catch (error) {
            throw error;
        }
    }

    static async deleteAllCommentsOnBoardGame(boardGameId: string) : Promise<void> {
        try {
            commentsData.comments = commentsData.comments.filter(c => c.boardGameId !== boardGameId);
            await fs.writeFile(path.join(__dirname, 'comments.json'), JSON.stringify(commentsData, null, 2));
        } catch (error) {
            throw error;
        }
    }

    static existsAnyCommentOnBoardGame(boardGameId: string) : boolean {
        try {
            return commentsData.comments.some(c => c.boardGameId === boardGameId);
        } catch (error) {
            throw error;
        }
    }
}