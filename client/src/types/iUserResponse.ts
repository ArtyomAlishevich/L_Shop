export interface IUserResponseDTO {
    id?: string,
    login?: string,
    name?: string,
    createdAt?: string,
    role?: 'user' | 'admin'
}