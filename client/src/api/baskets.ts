import apiClient from './client';
import { IBasket, ApiResponse } from '../types';

export const basketsApi = {
    get: async () => {
        const response = await apiClient.get<ApiResponse<IBasket>>('/baskets');
        return response.data.data;
    },

    getCount: async () => {
        const response = await apiClient.get<ApiResponse<number>>('/baskets/count');
        return response.data.data;
    },

    getSum: async () => {
        const response = await apiClient.get<ApiResponse<number>>('/baskets/sum');
        return response.data.data;
    },

    add: async (boardGameId: string) => {
        const response = await apiClient.post<ApiResponse<IBasket>>('/baskets/add', { boardGameId });
        return response.data.data;
    },

    remove: async (boardGameId: string) => {
        const response = await apiClient.post<ApiResponse<IBasket>>('/baskets/remove', { boardGameId });
        return response.data.data;
    },

    removeAllSimilar: async (boardGameId: string) => {
        const response = await apiClient.post<ApiResponse<IBasket>>('/baskets/remove/allSimillar', { boardGameId });
        return response.data.data;
    },

    clear: async () => {
        const response = await apiClient.post<ApiResponse<IBasket>>('/baskets/clear');
        return response.data.data;
    },
};