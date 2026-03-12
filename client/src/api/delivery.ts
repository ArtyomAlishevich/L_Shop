import apiClient from './client';
import { IDelivery, IDeliveryRequestDTO, ApiResponse } from '../types';

export const deliveryApi = {
    create: async (data: IDeliveryRequestDTO) => {
        const response = await apiClient.post<ApiResponse<IDelivery>>('/delivery', data);
        return response.data.data;
    },
};