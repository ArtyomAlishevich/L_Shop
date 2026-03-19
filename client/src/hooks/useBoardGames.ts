import { useState, useEffect } from 'react';
import { IBoardGame } from '../types';
import { boardGamesApi, GamesQueryParams } from '../api/boardGames';

/**
 * Хук для загрузки и фильтрации списка настольных игр.
 * 
 * Управляет состоянием загрузки, ошибками и параметрами фильтрации.
 * Автоматически перезагружает данные при изменении параметров.
 * 
 * @param initialParams - Начальные параметры фильтрации (опционально)
 * @returns {Object} Объект с данными и методами управления
 * @returns {IBoardGame[]} returns.games - Массив игр
 * @returns {boolean} returns.isLoading - Флаг загрузки
 * @returns {string | null} returns.error - Сообщение об ошибке
 * @returns {GamesQueryParams} returns.params - Текущие параметры
 * @returns {Function} returns.setParams - Функция обновления параметров
 * @returns {Function} returns.refetch - Функция принудительной перезагрузки
 * 
 * @example
 * const { games, isLoading, setParams } = useBoardGames({ category: 'strategies' });
 * 
 * // Применить фильтр
 * setParams({ ...params, search: 'монополия' });
 */
export const useBoardGames = (initialParams?: GamesQueryParams) => {
    const [games, setGames] = useState<IBoardGame[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [params, setParams] = useState<GamesQueryParams>(initialParams || {});

    useEffect(() => {
        fetchGames();
    }, [params]);

    /**
     * Загружает игры с текущими параметрами фильтрации.
     * @async
     * @private
     */
    const fetchGames = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await boardGamesApi.getAll(params);
            setGames(data);
        } catch (err) {
            setError('Ошибка при загрузке игр');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        games,
        isLoading,
        error,
        params,
        setParams,
        refetch: fetchGames,
    };
};