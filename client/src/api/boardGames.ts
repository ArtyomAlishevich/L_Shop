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

    getById: async (id: string) => {
        const response = await apiClient.get<ApiResponse<IBoardGame>>(`/boardgames/${id}`);
        return response.data.data;
    },

    getLikedGames: async (): Promise<string[]> => {
        const response = await apiClient.get<ApiResponse<string[]>>('/boardgames/liked');
        return response.data.data;
    },

    like: async (id: string): Promise<void> => {
        await apiClient.post(`/boardgames/${id}/like`);
    },

    unlike: async (id: string): Promise<void> => {
        await apiClient.post(`/boardgames/${id}/unlike`);
    },
};