import { useState, useEffect } from 'react';
import { IBoardGame } from '../types';
import { boardGamesApi, GamesQueryParams } from '../api/boardGames';

export const useBoardGames = (initialParams?: GamesQueryParams) => {
    const [games, setGames] = useState<IBoardGame[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [params, setParams] = useState<GamesQueryParams>(initialParams || {});

    useEffect(() => {
        fetchGames();
    }, [params]);

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