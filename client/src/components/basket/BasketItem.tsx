import React from 'react';
import { IBasketBoardGame } from '../../types';
import { useBasket } from '../../hooks/useBasket';
import { useLocale } from '../../context/LocaleContext';
import './BasketItem.css';

interface BasketItemProps {
    item: IBasketBoardGame;
    gameName: string;
    gamePrice: number;
}

export const BasketItem: React.FC<BasketItemProps> = ({ item, gameName, gamePrice }) => {
    const { removeFromBasket, addToBasket, removeAllSimilar } = useBasket();
    const { t } = useLocale();

    const handleIncrement = async () => {
        try {
            await addToBasket(item.boardGameId);
        } catch (error) {
            alert(t.basketItem.incrementError);
        }
    };

    const handleDecrement = async () => {
        try {
            await removeFromBasket(item.boardGameId);
        } catch (error) {
            alert(t.basketItem.decrementError);
        }
    };

    const handleRemoveAll = async () => {
        if (window.confirm(t.basketItem.removeConfirm)) {
            try {
                await removeAllSimilar(item.boardGameId);
            } catch (error) {
                alert(t.basketItem.removeError);
            }
        }
    };

    return (
        <div className="basket-item">
            <div className="item-info">
                <h4 className="item-name">{gameName}</h4>
                <div className="item-price">{gamePrice} {t.basketItem.perItem}</div>
            </div>

            <div className="item-controls">
                <div className="quantity-control">
                    <button onClick={handleDecrement} className="quantity-btn">-</button>
                    <span className="quantity">{item.count}</span>
                    <button onClick={handleIncrement} className="quantity-btn">+</button>
                </div>

                <div className="item-sum">
                    {t.basketItem.itemSum} {item.sum} ₽
                </div>

                <button onClick={handleRemoveAll} className="remove-btn">
                    {t.basketItem.removeAll}
                </button>
            </div>
        </div>
    );
};