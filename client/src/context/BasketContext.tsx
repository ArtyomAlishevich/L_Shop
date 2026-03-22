import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { IBasket } from '../types';
import { basketsApi } from '../api/baskets';
import { useAuth } from '../hooks/useAuth';

interface BasketContextType {
    basket: IBasket | null;
    isLoading: boolean;
    count: number;
    sum: number;
    addToBasket: (boardGameId: string) => Promise<void>;
    removeFromBasket: (boardGameId: string) => Promise<void>;
    removeAllSimilar: (boardGameId: string) => Promise<void>;
    clearBasket: () => Promise<void>;
    refreshBasket: () => Promise<void>;
}

export const BasketContext = createContext<BasketContextType | undefined>(undefined);

export const BasketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [basket, setBasket] = useState<IBasket | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { isAuthenticated } = useAuth();

    const refreshBasket = async () => {
        if (!isAuthenticated) {
            setBasket(null);
            return;
        }

        setIsLoading(true);
        try {
            const data = await basketsApi.get();
            setBasket(data);
        } catch (error) {
            console.error('Ошибка при загрузке корзины:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refreshBasket();
    }, [isAuthenticated]);

    const addToBasket = async (boardGameId: string) => {
        try {
            const updatedBasket = await basketsApi.add(boardGameId);
            setBasket(updatedBasket);
        } catch (error) {
            throw error;
        }
    };

    const removeFromBasket = async (boardGameId: string) => {
        try {
            const updatedBasket = await basketsApi.remove(boardGameId);
            setBasket(updatedBasket);
        } catch (error) {
            throw error;
        }
    };

    const removeAllSimilar = async (boardGameId: string) => {
        try {
            const updatedBasket = await basketsApi.removeAllSimilar(boardGameId);
            setBasket(updatedBasket);
        } catch (error) {
            throw error;
        }
    };

    const clearBasket = async () => {
        try {
            const updatedBasket = await basketsApi.clear();
            setBasket(updatedBasket);
        } catch (error) {
            throw error;
        }
    };

    const count = basket?.count || 0;
    const sum = basket?.sum || 0;

    return (
        <BasketContext.Provider
            value={{
                basket,
                isLoading,
                count,
                sum,
                addToBasket,
                removeFromBasket,
                removeAllSimilar,
                clearBasket,
                refreshBasket,
            }}
        >
            {children}
        </BasketContext.Provider>
    );
};