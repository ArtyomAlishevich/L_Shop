import { Request, Response } from 'express';
import { BoardGamesService } from '../services/boardGamesService';
import { RecommendationService } from '../services/recommendationService';
import { NotFoundError } from '../types/notFoundError';

export class BoardGamesController {
    static getAll(req: Request, res: Response): void {
        try {
            const locale = ((req.session as any).locale as 'ru' | 'en') || 'ru';
            const userId = (req.session as any).userId;

            const filters = {
                search: req.query.search as string,
                sort: req.query.sort as string,
                category: req.query.category,
                isAvailable: req.query.isAvailable as string,
                minPrice: req.query.minPrice as string,
                maxPrice: req.query.maxPrice as string,
                minPlayers: req.query.minPlayers as string,
                maxPlayers: req.query.maxPlayers as string
            };

            const games = BoardGamesService.getMixedList(userId, filters, locale);

            const localizedData = games.map(game => ({
                id: game.id,
                name: game.name[locale],
                description: game.description[locale],
                categories: game.categories[locale],
                minPlayers: game.minPlayers,
                maxPlayers: game.maxPlayers,
                isAvailable: game.isAvailable,
                price: game.price,
                amount: game.amount,
                images: game.images,
                delivery: game.delivery ? {
                    startCountry: game.delivery.startCountry,
                    startTown: game.delivery.startTown,
                    startStreet: game.delivery.startStreet,
                    startHouseNumber: game.delivery.startHouseNumber,
                    closestDate: game.delivery.closestDate,
                    price: game.delivery.price
                } : undefined,
                discount: game.discount,
                averageRating: game.averageRating
            }));

            res.status(200).json({ data: localizedData });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: `Ошибка при получении всех настольных игр: ${(error as Error).message}` });
        }
    }

    static getById(req: Request, res: Response): void {
        try {
            const locale = ((req.session as any).locale as 'ru' | 'en') || 'ru';
            const id = req.params.id;
            const game = BoardGamesService.getById(id);

            const localizedGame = {
                id: game.id,
                name: game.name[locale],
                description: game.description[locale],
                categories: game.categories[locale],
                minPlayers: game.minPlayers,
                maxPlayers: game.maxPlayers,
                isAvailable: game.isAvailable,
                price: game.price,
                amount: game.amount,
                images: game.images,
                delivery: game.delivery ? {
                    startCountry: game.delivery.startCountry,
                    startTown: game.delivery.startTown,
                    startStreet: game.delivery.startStreet,
                    startHouseNumber: game.delivery.startHouseNumber,
                    closestDate: game.delivery.closestDate,
                    price: game.delivery.price
                } : undefined,
                discount: game.discount,
                averageRating: game.averageRating
            };

            res.status(200).json({ data: localizedGame });
        } catch (error) {
            if (error instanceof NotFoundError) {
                res.status(404).json({ error: (error as Error).message });
                return;
            }
            res.status(500).json({ error: `Ошибка при получении игры: ${(error as Error).message}` });
        }
    }

    static async like(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req.session as any).userId;
            if (!userId) {
                res.status(401).json({ error: 'Необходима авторизация' });
                return;
            }
            const boardGameId = req.params.id;
            await RecommendationService.likeBoardGame(userId, boardGameId);
            res.status(200).json({ message: 'Лайк добавлен' });
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }

    static async unlike(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req.session as any).userId;
            if (!userId) {
                res.status(401).json({ error: 'Необходима авторизация' });
                return;
            }
            const boardGameId = req.params.id;
            await RecommendationService.unlikeBoardGame(userId, boardGameId);
            res.status(200).json({ message: 'Лайк убран' });
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }

    static getLikedGames(req: Request, res: Response): void {
        try {
            const userId = (req.session as any).userId;
            if (!userId) {
                res.status(200).json({ data: [] });
                return;
            }
            const { RecommendationsDatabase } = require('../../db/recommendationsDatabase');
            const liked = RecommendationsDatabase.getUserLikedGames(userId) || [];
            res.status(200).json({ data: liked });
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }
}