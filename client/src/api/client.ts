import axios, { AxiosError, AxiosInstance } from 'axios';
import { ApiError } from '../types';

const API_URL = 'http://localhost:3000/api';

const apiClient: AxiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiError>) => {
        if (error.response?.status === 401) {
            console.error('Неавторизован');
        }
        return Promise.reject(error);
    }
);

export default apiClient;