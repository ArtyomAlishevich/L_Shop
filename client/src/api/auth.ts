import apiClient from './client';
import { IUserRequestDTO, IUserResponseDTO } from '../types';

export const authApi = {
    login: async (data: IUserRequestDTO) => {
        const response = await apiClient.post('/auth/login', data);
        return response.data;
    },

    register: async (data: IUserRequestDTO) => {
        const response = await apiClient.post('/auth/register', data);
        return response.data as { newUser: IUserResponseDTO };
    },

    logout: async () => {
        const response = await apiClient.post('/auth/logout');
        return response.data;
    },
};