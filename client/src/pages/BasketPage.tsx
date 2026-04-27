import React from 'react';
import { Link } from 'react-router-dom';
import { useBasket } from '../hooks/useBasket';
import { useBoardGames } from '../hooks/useBoardGames';
import { BasketItem } from '../components/basket/BasketItem';
import { useLocale } from '../context/LocaleContext';
import './BasketPage.css';

export const BasketPage: React.FC = () => {
    const { basket, isLoading, count, sum, clearBasket } = useBasket();
    const { games } = useBoardGames();
    const { t } = useLocale();

    if (isLoading) {
        return <div className="loading">{t.basket.loading}</div>;
    }

    if (!basket || count === 0) {
        return (
            <div className="empty-basket">
                <h2>{t.basket.empty}</h2>
                <p>{t.basket.emptyText}</p>
                <Link to="/games" className="continue-shopping">
                    {t.basket.continueShopping}
                </Link>
            </div>
        );
    }

    const getGameName = (gameId: string) => {
        const game = games.find(g => g.id === gameId);
        return game?.name || t.basket.unknownGame;
    };

    const getGamePrice = (gameId: string) => {
        const game = games.find(g => g.id === gameId);
        return game?.price || 0;
    };

    return (
        <div className="basket-page">
            <h1>{t.basket.title}</h1>

            <div className="basket-content">
                <div className="basket-items">
                    {basket.boardGames.map((item) => (
                        <BasketItem
                            key={item.boardGameId}
                            item={item}
                            gameName={getGameName(item.boardGameId)}
                            gamePrice={getGamePrice(item.boardGameId)}
                        />
                    ))}
                </div>

                <div className="basket-summary">
                    <h3>{t.basket.total}</h3>
                    <div className="summary-row">
                        <span>{t.basket.items}</span>
                        <span>{count} {t.basket.pcs}</span>
                    </div>
                    <div className="summary-row">
                        <span>{t.basket.sum}</span>
                        <span>{sum} ₽</span>
                    </div>
                    <div className="summary-actions">
                        <button onClick={clearBasket} className="clear-basket">
                            {t.basket.clear}
                        </button>
                        <Link to="/delivery" className="checkout-button">
                            {t.basket.checkout}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};