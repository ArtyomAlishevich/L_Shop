import React from 'react';
import { RegisterForm } from '../components/auth/RegisterForm';

/**
 * Страница регистрации нового пользователя.
 * 
 * Содержит форму регистрации с валидацией пароля и перенаправляет
 * на главную после успешной регистрации.
 * 
 * @component
 * @returns {JSX.Element} Страница регистрации
 * 
 * @example
 * <RegisterPage />
 */
export const RegisterPage: React.FC = () => {
    return (
        <div className="auth-page">
            <RegisterForm />
        </div>
    );
};