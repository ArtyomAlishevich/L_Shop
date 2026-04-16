import apiClient from './client';

export interface IBoardGameCreateDTO {
    name: { ru: string; en: string };
    description: { ru: string; en: string };
    categories: { ru: string[]; en: string[] };
    minPlayers: number;
    maxPlayers: number;
    isAvailable: boolean;
    price: number;
    amount: number;
    images: { preview?: string; gallery?: string[] };
    delivery?: {
        startCountry: string;
        startTown: string;
        startStreet: string;
        startHouseNumber: string;
        closestDate: string;
        price: number;
    };
    discount?: number;
}

export interface IBoardGameUpdateDTO extends Partial<IBoardGameCreateDTO> {}

export const adminApi = {
    createBoardGame: async (data: IBoardGameCreateDTO) => {
        const response = await apiClient.post('/admin/boardGame', data);
        return response.data.data;
    },

    updateBoardGame: async (id: string, data: IBoardGameUpdateDTO) => {
        const response = await apiClient.put(`/admin/boardGame/${id}`, data);
        return response.data;
    },

    deleteBoardGame: async (id: string) => {
        await apiClient.delete(`/admin/boardGame/${id}`);
    },
};