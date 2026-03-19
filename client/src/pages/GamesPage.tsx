import React from 'react';
import { GameList } from '../components/games/GameList';
import { GameFilters } from '../components/games/GameFilters';
import { useBoardGames } from '../hooks/useBoardGames';
import './GamesPage.css';

/**
 * Страница каталога игр.
 * 
 * Отображает фильтры и список игр. Управляет загрузкой данных
 * и отображением состояний загрузки/ошибки.
 * 
 * @component
 * @returns {JSX.Element} Страница каталога
 * 
 * @example
 * <GamesPage />
 */
export const GamesPage: React.FC = () => {
    const { games, isLoading, error, setParams } = useBoardGames();

    return (
        <div className="games-page">
            <h1>Каталог настольных игр</h1>

            <GameFilters onFilterChange={setParams} />

            {error && <div className="error">{error}</div>}

            {isLoading ? (
                <div className="loading">Загрузка...</div>
            ) : (
                <GameList games={games} />
            )}
        </div>
    );
};