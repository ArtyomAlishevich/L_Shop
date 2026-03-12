import React from 'react';
import { IBasketBoardGame } from '../../types';
import { useBasket } from '../../hooks/useBasket';
import './BasketItem.css';

interface BasketItemProps {
    item: IBasketBoardGame;
    gameName: string;
    gamePrice: number;
}

export const BasketItem: React.FC<BasketItemProps> = ({ item, gameName, gamePrice }) => {
    const { removeFromBasket, addToBasket, removeAllSimilar } = useBasket();

    const handleIncrement = async () => {
        try {
            await addToBasket(item.boardGameId);
        } catch (error) {
            alert('Ошибка при добавлении товара');
        }
    };

    const handleDecrement = async () => {
        try {
            await removeFromBasket(item.boardGameId);
        } catch (error) {
            alert('Ошибка при удалении товара');
        }
    };

    const handleRemoveAll = async () => {
        if (window.confirm('Удалить все экземпляры этой игры из корзины?')) {
            try {
                await removeAllSimilar(item.boardGameId);
            } catch (error) {
                alert('Ошибка при удалении товаров');
            }
        }
    };

    return (
        <div className="basket-item">
            <div className="item-info">
                <h4 className="item-name">{gameName}</h4>
                <div className="item-price">{gamePrice} ₽ за шт.</div>
            </div>

            <div className="item-controls">
                <div className="quantity-control">
                    <button onClick={handleDecrement} className="quantity-btn">-</button>
                    <span className="quantity">{item.count}</span>
                    <button onClick={handleIncrement} className="quantity-btn">+</button>
                </div>

                <div className="item-sum">
                    Сумма: {item.sum} ₽
                </div>

                <button onClick={handleRemoveAll} className="remove-btn">
                    Удалить все
                </button>
            </div>
        </div>
    );
};