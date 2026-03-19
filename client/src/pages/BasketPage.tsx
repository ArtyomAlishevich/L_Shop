import React from 'react';
import { Link } from 'react-router-dom';
import { useBasket } from '../hooks/useBasket';
import { useBoardGames } from '../hooks/useBoardGames';
import { BasketItem } from '../components/basket/BasketItem';
import './BasketPage.css';

/**
 * Страница корзины.
 * 
 * Отображает список товаров в корзине, итоговую сумму и
 * предоставляет возможность очистки корзины и перехода к оформлению.
 * 
 * @component
 * @returns {JSX.Element} Страница корзины
 * 
 * @example
 * <BasketPage />
 */
export const BasketPage: React.FC = () => {
    const { basket, isLoading, count, sum, clearBasket } = useBasket();
    const { games } = useBoardGames();

    if (isLoading) {
        return <div className="loading">Загрузка корзины...</div>;
    }

    if (!basket || count === 0) {
        return (
            <div className="empty-basket">
                <h2>Корзина пуста</h2>
                <p>Добавьте товары в корзину, чтобы оформить заказ</p>
                <Link to="/games" className="continue-shopping">
                    Перейти к покупкам
                </Link>
            </div>
        );
    }

    /**
     * Получает название игры по её ID.
     * @param {string} gameId - ID игры
     * @returns {string} Название игры или "Неизвестная игра"
     */
    const getGameName = (gameId: string) => {
        const game = games.find(g => g.id === gameId);
        return game?.name || 'Неизвестная игра';
    };

     /**
     * Получает цену игры по её ID.
     * @param {string} gameId - ID игры
     * @returns {number} Цена игры или 0
     */
    const getGamePrice = (gameId: string) => {
        const game = games.find(g => g.id === gameId);
        return game?.price || 0;
    };

    return (
        <div className="basket-page">
            <h1>Корзина</h1>

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
                    <h3>Итого</h3>
                    <div className="summary-row">
                        <span>Товаров:</span>
                        <span>{count} шт.</span>
                    </div>
                    <div className="summary-row">
                        <span>Сумма:</span>
                        <span>{sum} ₽</span>
                    </div>
                    <div className="summary-actions">
                        <button onClick={clearBasket} className="clear-basket">
                            Очистить корзину
                        </button>
                        <Link to="/delivery" className="checkout-button">
                            Оформить заказ
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};