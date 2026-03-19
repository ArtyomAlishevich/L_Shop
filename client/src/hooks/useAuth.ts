import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Хук для доступа к контексту аутентификации.
 * 
 * Предоставляет доступ к данным пользователя и методам аутентификации
 * во всех компонентах, обернутых в AuthProvider.
 * 
 * @returns {AuthContextType} Объект с данными и методами аутентификации
 * @throws {Error} Если хук используется вне AuthProvider
 * 
 * @example
 * const { user, login, logout, isAuthenticated } = useAuth();
 * 
 * if (isAuthenticated) {
 *   console.log(`Привет, ${user?.name}`);
 * }
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};