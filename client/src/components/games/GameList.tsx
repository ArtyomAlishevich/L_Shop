import React from 'react';
import { IBoardGame } from '../../types';
import { GameCard } from './GameCard';
import './GameList.css';

/**
 * Props для компонента GameList
 */
interface GameListProps {
    /** Массив игр для отображения */
    games: IBoardGame[];
}

/**
 * Компонент списка игр.
 * 
 * Отображает сетку карточек игр или сообщение, если игры не найдены.
 * 
 * @component
 * @param {GameListProps} props - Свойства компонента
 * @returns {JSX.Element} Список карточек игр
 * 
 * @example
 * <GameList games={games} />
 */
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