export interface IComment {
    id: string,
    boardGameId: string,
    userId: string,
    userName: string,
    text?: string,
    rating: number,
    createdAt: string
}