import apiClient from './client';

export interface IComment {
    id: string;
    boardGameId: string;
    userId: string;
    userName: string;
    text?: string;
    rating: number;
    createdAt: string;
}

export interface ICommentCreateDTO {
    boardGameId: string;
    rating: number;
    text?: string;
}

export const commentsApi = {
    getByBoardGameId: async (boardGameId: string): Promise<IComment[]> => {
        const response = await apiClient.get(`/comments/${boardGameId}`);
        return response.data.data;
    },

    add: async (data: ICommentCreateDTO): Promise<IComment> => {
        const response = await apiClient.post('/comments', data);
        return response.data.data;
    },

    delete: async (commentId: string): Promise<void> => {
        await apiClient.delete(`/comments/${commentId}`);
    },
};