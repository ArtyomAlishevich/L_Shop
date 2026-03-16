import apiClient from './client';
import { IDelivery, IDeliveryRequestDTO, ApiResponse } from '../types';

export const deliveryApi = {
    create: async (data: IDeliveryRequestDTO) => {
        const response = await apiClient.post<ApiResponse<IDelivery>>('/delivery', data);
        return response.data.data;
    },

    // ✅ ДОБАВЬТЕ ЭТОТ МЕТОД
    getById: async (id: string) => {
        const response = await apiClient.get<ApiResponse<IDelivery>>(`/delivery/${id}`);
        return response.data.data;
    },

    getMyDeliveries: async () => {
        const response = await apiClient.get<ApiResponse<IDelivery[]>>('/delivery/my');
        return response.data.data;
    }
};