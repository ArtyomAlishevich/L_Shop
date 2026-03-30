import { Request, Response } from "express";
import { BoardGamesService } from "../services/boardGamesService";

export class BoardGamesController {
    static getAll(req: Request, res: Response) : void {
        try {
            const locale = (req.session.locale as 'ru' | 'en') || 'ru';

            const {
                search,
                sort,
                category,
                isAvailable,
                minPrice,
                maxPrice,
                minPlayers,
                maxPlayers
            } = req.query;

            let data = BoardGamesService.getAll();
            const warnings : string[] = [];
            if (search) {
                if (typeof search === 'string') {
                    const searchText = search.toLowerCase().replace(/\s+/g, '');
                    data = data.filter(game => game.name[locale].toLowerCase().replace(/\s+/g, '').includes(searchText));
                }
                else {
                    console.log('Параметр поиска должен быть непустой строкой');
                    warnings.push('параметр поиска должен быть непустой строкой');
                }
            }

            if (category) {
                if (typeof category === 'string') {
                    data = data.filter(game => game.categories[locale].includes(category));
                }
                else if (Array.isArray(category)) {
                    let categoryList = category.map(c => String(c).toLowerCase().trim()).filter(c => c.length > 0);
                    if (categoryList.length > 0) {
                        data = data.filter(game => {
                            const gameCategories = game.categories[locale].map(c => c.toLowerCase());
                            return categoryList.some(c => gameCategories.includes(c));
                        });
                    }
                }
                else {
                    console.log('Категории должны быть строкой или массивом строк');
                    warnings.push('категории должны быть строкой или массивом строк');
                }
            }

            if (isAvailable) {
                if (typeof isAvailable === 'string') {
                    if (isAvailable === 'true') {
                        data = data.filter(game => game.isAvailable === true);
                    }
                    else if (isAvailable === 'false') {
                        data = data.filter(game => game.isAvailable === false);
                    }
                    else {
                        console.log('Параметр доступности игры при фильтрации должен быть true или false');
                        warnings.push('параметр доступности игры при фильтрации должен быть true или false');
                    }
                }
                else {
                    console.log('Параметр доступности игры при фильтрации должен быть строкой');
                    warnings.push('параметр доступности игры при фильтрации должен быть строкой');
                }
            }

            if (maxPrice) {
                if (typeof maxPrice === 'string') {
                    const maxBoardGamePrice = parseFloat(maxPrice);
                    if (!isNaN(maxBoardGamePrice) && maxBoardGamePrice > 0) {
                        data = data.filter(game => game.price <= maxBoardGamePrice);
                    }
                    else {
                        console.log('Не удалось преобразовать в положительное число максимальную цену при фильтрации');
                        warnings.push('не удалось преобразовать в положительное число максимальную цену при фильтрации');
                    }
                }
                else {
                    console.log('Параметр максимальной цены должен быть строкой');
                    warnings.push('параметр максимальной цены должен быть строкой');
                }
            }

            if (minPrice) {
                if (typeof minPrice === 'string') {
                    const minBoardGamePrice = parseFloat(minPrice);
                    if (!isNaN(minBoardGamePrice) && minBoardGamePrice > 0) {
                        data = data.filter(game => game.price >= minBoardGamePrice);
                    }
                    else {
                        console.log('Не удалось преобразовать в положительное число минимальную цену при фильтрации');
                        warnings.push('не удалось преобразовать в положительное число минимальную цену при фильтрации');
                    }
                }
                else {
                    console.log('Параметр минимальной цены должен быть строкой');
                    warnings.push('параметр минимальной цены должен быть строкой');
                }
            }

            if (maxPlayers) {
                if (typeof maxPlayers === 'string') {
                    const maxPlayersAmount = parseInt(maxPlayers);
                    if (!isNaN(maxPlayersAmount) && maxPlayersAmount > 0) {
                        data = data.filter(game => game.maxPlayers <= maxPlayersAmount);
                    }
                    else {
                        console.log('Не удалось преобразовать в положительное число максимальное количество игроков при фильтрации');
                        warnings.push('не удалось преобразовать в положительное число максимальное количество игроков при фильтрации');
                    }
                }
                else {
                    console.log('Параметр максимального количества игроков должен быть строкой');
                    warnings.push('параметр максимального количества игроков должен быть строкой');
                }
            }

            if (minPlayers) {
                if (typeof minPlayers === 'string') {
                    const minPlayersAmount = parseInt(minPlayers);
                    if (!isNaN(minPlayersAmount) && minPlayersAmount > 0) {
                        data = data.filter(game => game.minPlayers >= minPlayersAmount);
                    }
                    else {
                        console.log('Не удалось преобразовать в положительное число минимальное количество игроков при фильтрации');
                        warnings.push('не удалось преобразовать в положительное число минимальное количество игроков при фильтрации');
                    }
                }
                else {
                    console.log('Параметр минимального количества игроков должен быть строкой');
                    warnings.push('параметр минимального количества игроков должен быть строкой');
                }
            }

            if (sort) {
                if (typeof sort === 'string') {
                    if (sort === 'asc') {
                        data.sort((a, b) => a.price - b.price);
                    }
                    else if (sort === 'desc') {
                        data.sort((a, b) => b.price - a.price);
                    }
                    else {
                        console.log('Параметрами сортировки могут являться только строки "asc" или "desc"');
                        warnings.push('параметрами сортировки могут являться только строки "asc" или "desc"');
                    }
                }
                else {
                    console.log('Параметр сортировки должен быть строкой');
                    warnings.push('параметр сортировки должен быть строкой');
                }
            }

            if (warnings.length > 0) {
                res.status(400).json({ error: warnings.join(', ') });
                return;
            }

            const localizedData = data.map(game => ({
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
        } catch(error) {
            console.log((error as Error).message);
            res.status(500).json(`Ошибка при получении всех настольных игр: ${(error as Error).message}`);
        }
    }
}