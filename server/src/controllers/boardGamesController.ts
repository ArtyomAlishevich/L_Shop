import { Request, Response } from 'express';
import { BoardGamesService } from '../services/boardGamesService';

export class BoardGamesController {
    static getAll(req: Request, res: Response): void {
        try {
            const locale = (req.session.locale as 'ru' | 'en') || 'ru';
            const userId = req.session.userId;

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
}