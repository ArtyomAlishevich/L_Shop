import { useContext } from 'react';
import { BasketContext } from '../context/BasketContext';

/**
 * Хук для доступа к контексту корзины.
 * 
 * Предоставляет доступ к данным корзины и методам управления ею
 * во всех компонентах, обернутых в BasketProvider.
 * 
 * @returns {BasketContextType} Объект с данными и методами управления корзиной
 * @throws {Error} Если хук используется вне BasketProvider
 * 
 * @example
 * const { basket, count, sum, addToBasket } = useBasket();
 * 
 * const handleAdd = () => {
 *   await addToBasket(gameId);
 * };
 */
export const useBasket = () => {
    const context = useContext(BasketContext);
    if (context === undefined) {
        throw new Error('useBasket must be used within a BasketProvider');
    }
    return context;
};