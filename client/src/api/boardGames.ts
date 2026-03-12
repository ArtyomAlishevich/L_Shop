import apiClient from './client';
import { IBoardGame, ApiResponse } from '../types';

export interface GamesQueryParams {
    search?: string;
    sort?: 'asc' | 'desc';
    category?: string | string[];
    isAvailable?: string;
    minPrice?: string;
    maxPrice?: string;
    minPlayers?: string;
    maxPlayers?: string;
}

export const boardGamesApi = {
    getAll: async (params?: GamesQueryParams) => {
        const response = await apiClient.get<ApiResponse<IBoardGame[]>>('/boardgames', { params });
        return response.data.data;
    },
};