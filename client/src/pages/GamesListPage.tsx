import React from 'react';
import { GameList } from '../components/games/GameList';
import { GameFilters } from '../components/games/GameFilters';
import { useBoardGames } from '../hooks/useBoardGames';
import { useLocale } from '../context/LocaleContext';

export const GamesListPage: React.FC = () => {
    const { games, isLoading, error, setParams } = useBoardGames();
    const { t } = useLocale();

    if (isLoading) return <div className="loading">{t.games.loading}</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="games-page">
            <h1>{t.games.title}</h1>
            <GameFilters onFilterChange={setParams} />
            <GameList games={games} />
        </div>
    );
};