import React from 'react';
import { Link } from 'react-router-dom';
import { IBoardGame } from '../../types';
import { useBasket } from '../../hooks/useBasket';
import { useAuth } from '../../hooks/useAuth';
import { useLocale } from '../../context/LocaleContext';
import './GameCard.css';

interface GameCardProps {
    game: IBoardGame;
}

export const GameCard: React.FC<GameCardProps> = ({ game }) => {
    const { addToBasket } = useBasket();
    const { isAuthenticated } = useAuth();
    const { t } = useLocale();

    const handleAddToBasket = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!isAuthenticated) {
            alert(t.card.loginRequired);
            return;
        }
        try {
            await addToBasket(game.id);
            alert(t.card.addedToBasket);
        } catch (error) {
            alert(t.card.addError);
        }
    };

    const discountedPrice = game.discount
        ? game.price * (1 - game.discount / 100)
        : null;

    return (
        <div className="game-card">
            <Link to={`/game/${game.id}`} className="game-link">
                {game.images?.preview && (
                    <img src={game.images.preview} alt={game.name} className="game-image" />
                )}
                <h3 className="game-title">{game.name}</h3>
                <div className="game-categories">
                    {game.categories.slice(0, 3).map(cat => (
                        <span key={cat} className="category-tag">{cat}</span>
                    ))}
                </div>
                <div className="game-players">
                    👥 {game.minPlayers}-{game.maxPlayers} {t.card.players}
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
                {game.isAvailable ? t.card.addToBasket : t.card.outOfStock}
            </button>
        </div>
    );
};