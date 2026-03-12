import { useContext } from 'react';
import { BasketContext } from '../context/BasketContext';

export const useBasket = () => {
    const context = useContext(BasketContext);
    if (context === undefined) {
        throw new Error('useBasket must be used within a BasketProvider');
    }
    return context;
};