export interface IUser {
    id: string,
    name: string,
    login: string,
    password: string,
    createdAt: string,
    role: 'user' | 'admin'
}