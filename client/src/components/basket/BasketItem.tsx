import React from 'react';
import { IBasketBoardGame } from '../../types';
import { useBasket } from '../../hooks/useBasket';
import './BasketItem.css';

/**
 * Props для компонента BasketItem
 */
interface BasketItemProps {
    /** Элемент корзины с данными о количестве и сумме */
    item: IBasketBoardGame;
    /** Название игры для отображения */
    gameName: string;
    /** Цена одной единицы игры */
    gamePrice: number;
}

/**
 * Компонент элемента корзины.
 * 
 * Отображает информацию о товаре в корзине и предоставляет
 * элементы управления для изменения количества и удаления.
 * 
 * @component
 * @param {BasketItemProps} props - Свойства компонента
 * @returns {JSX.Element} Элемент корзины
 * 
 * @example
 * <BasketItem 
 *   item={basketItem} 
 *   gameName="Монополия" 
 *   gamePrice={1999} 
 * />
 */
export const BasketItem: React.FC<BasketItemProps> = ({ item, gameName, gamePrice }) => {
    const { removeFromBasket, addToBasket, removeAllSimilar } = useBasket();

    /**
     * Увеличивает количество товара на 1.
     */
    const handleIncrement = async () => {
        try {
            await addToBasket(item.boardGameId);
        } catch (error) {
            alert('Ошибка при добавлении товара');
        }
    };

     /**
     * Уменьшает количество товара на 1.
     * Если количество станет 0, товар удалится из корзины.
     */
    const handleDecrement = async () => {
        try {
            await removeFromBasket(item.boardGameId);
        } catch (error) {
            alert('Ошибка при удалении товара');
        }
    };

    /**
     * Полностью удаляет все экземпляры этого товара из корзины.
     */
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