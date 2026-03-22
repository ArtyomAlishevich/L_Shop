export class UnauthorizedError extends Error {
    constructor(message?: string) {
        super(message || 'Неверный логин или пароль');
        this.name = 'UnauthorizedError';
    }
}