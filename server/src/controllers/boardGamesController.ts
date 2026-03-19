import { Request, Response } from "express";
import { BoardGamesService } from "../services/boardGamesService";

export class BoardGamesController {
    /**
     * @openapi
     * /boardGames:
     *   get:
     *     summary: Получить список всех настольных игр
     *     description: Возвращает список игр с возможностью фильтрации и сортировки
     *     tags: [BoardGames]
     *     security: []
     *     parameters:
     *       - in: query
     *         name: search
     *         schema:
     *           type: string
     *         description: Поиск по названию (регистронезависимый, игнорирует пробелы)
     *         example: "монополия"
     *       - in: query
     *         name: category
     *         schema:
     *           type: array
     *           items:
     *             type: string
     *         style: form
     *         explode: true
     *         description: Фильтр по категориям (можно указать несколько, например ?category=стратегия&category=экономическая)
     *       - in: query
     *         name: isAvailable
     *         schema:
     *           type: string
     *           enum: [true, false]
     *         description: Фильтр по наличию (true - в наличии, false - нет в наличии)
     *       - in: query
     *         name: minPrice
     *         schema:
     *           type: integer
     *           minimum: 0
     *         description: Минимальная цена (целое положительное число)
     *         example: 1000
     *       - in: query
     *         name: maxPrice
     *         schema:
     *           type: integer
     *           minimum: 0
     *         description: Максимальная цена (целое положительное число)
     *         example: 5000
     *       - in: query
     *         name: minPlayers
     *         schema:
     *           type: integer
     *           minimum: 1
     *         description: Минимальное количество игроков
     *         example: 2
     *       - in: query
     *         name: maxPlayers
     *         schema:
     *           type: integer
     *           minimum: 1
     *         description: Максимальное количество игроков
     *         example: 6
     *       - in: query
     *         name: sort
     *         schema:
     *           type: string
     *           enum: [asc, desc]
     *         description: Сортировка по цене (asc - по возрастанию, desc - по убыванию)
     *     responses:
     *       200:
     *         description: Список игр
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 data:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/BoardGame'
     *       400:
     *         description: Ошибка в параметрах запроса
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       500:
     *         description: Ошибка сервера
     */
    static getAll(req: Request, res: Response) : void {
        try {
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
                    data = data.filter(game => game.name.toLowerCase().replace(/\s+/g, '').includes(searchText));
                }
                else {
                    console.log('Параметр поиска должен быть непустой строкой');
                    warnings.push('параметр поиска должен быть непустой строкой');
                }
            }

            if (category) {
                if (typeof category === 'string') {
                    data = data.filter(game => game.categories.includes(category));
                }
                else if (Array.isArray(category)) {
                    let categoryList = category.map(c => String(c).toLowerCase().trim()).filter(c => c.length > 0);
                    if (categoryList.length > 0) {
                        data = data.filter(game => {
                            const gameCategories = game.categories.map(c => c.toLowerCase());
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

            res.status(200).json({ data: data });
        } catch(error) {
            console.log((error as Error).message);
            res.status(500).json(`Ошибка при получении всех настольных игр: ${(error as Error).message}`);
        }
    }
}