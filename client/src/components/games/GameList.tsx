import React from 'react';
import { IBoardGame } from '../../types';
import { GameCard } from './GameCard';
import './GameList.css';

interface GameListProps {
    games: IBoardGame[];
}

export const GameList: React.FC<GameListProps> = ({ games }) => {
    if (games.length === 0) {
        return <div className="no-games">Игры не найдены</div>;
    }

    return (
        <div className="game-list">
            {games.map(game => (
                <GameCard key={game.id} game={game} />
            ))}
        </div>
    );
};