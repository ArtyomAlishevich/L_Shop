import React from 'react';
import { LoginForm } from '../components/auth/LoginForm';

/**
 * Страница входа в систему.
 * 
 * Содержит форму аутентификации и перенаправляет на главную
 * после успешного входа. Доступна только для неавторизованных пользователей.
 * 
 * @component
 * @returns {JSX.Element} Страница входа
 * 
 * @example
 * <LoginPage />
 */
export const LoginPage: React.FC = () => {
    return (
        <div className="auth-page">
            <LoginForm />
        </div>
    );
};