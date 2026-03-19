import React from 'react';
import { Link } from 'react-router-dom';
import { IBoardGame } from '../../types';
import { useBasket } from '../../hooks/useBasket';
import { useAuth } from '../../hooks/useAuth';
import './GameCard.css';

/**
 * Props для компонента GameCard
 */
interface GameCardProps {
    /** Объект игры со всеми данными */
    game: IBoardGame;
}

/**
 * Компонент карточки игры в каталоге.
 * 
 * Отображает превью, название, категории, цену со скидкой (если есть)
 * и кнопку добавления в корзину. Является ссылкой на страницу игры.
 * 
 * @component
 * @param {GameCardProps} props - Свойства компонента
 * @returns {JSX.Element} Карточка игры
 * 
 * @example
 * <GameCard game={game} />
 */
export const GameCard: React.FC<GameCardProps> = ({ game }) => {
    const { addToBasket } = useBasket();
    const { isAuthenticated } = useAuth();

     /**
     * Обработчик добавления игры в корзину.
     * Проверяет авторизацию и добавляет игру.
     * 
     * @param {React.MouseEvent} e - Событие клика
     */
    const handleAddToBasket = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!isAuthenticated) {
            alert('Необходимо войти в систему');
            return;
        }
        try {
            await addToBasket(game.id);
            alert('Игра добавлена в корзину');
        } catch (error) {
            alert('Ошибка при добавлении в корзину');
        }
    };

    const discountedPrice = game.discount
        ? game.price * (1 - game.discount / 100)
        : null;

    return (
        <div className="game-card">
            <Link to={`/game/${game.id}`} className="game-link">
                {game.images?.preview && (
                    <img
                        src={game.images.preview}
                        alt={game.name}
                        className="game-image"
                    />
                )}
                <h3 className="game-title">{game.name}</h3>
                <div className="game-categories">
                    {game.categories.slice(0, 3).map(cat => (
                        <span key={cat} className="category-tag">{cat}</span>
                    ))}
                </div>
                <div className="game-players">
                    👥 {game.minPlayers}-{game.maxPlayers} игроков
                </div>
                <div className="game-price">
                    {discountedPrice ? (
                        <>
                            <span className="old-price">{game.price} Br</span>
                            <span className="discount-price">{discountedPrice.toFixed(0)} Br</span>
                            <span className="discount-badge">-{game.discount}%</span>
                        </>
                    ) : (
                        <span className="regular-price">{game.price} Br</span>
                    )}
                </div>
            </Link>
            <button
                onClick={handleAddToBasket}
                className="add-to-basket-btn"
                disabled={!game.isAvailable}
            >
                {game.isAvailable ? 'В корзину' : 'Нет в наличии'}
            </button>
        </div>
    );
};