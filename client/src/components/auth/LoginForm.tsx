import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './AuthForms.css';

/**
 * Компонент формы входа.
 * 
 * Предоставляет поля для ввода логина и пароля,
 * обрабатывает отправку и отображает ошибки.
 * 
 * @component
 * @returns {JSX.Element} Форма входа
 * 
 * @example
 * <LoginForm />
 */
export const LoginForm: React.FC = () => {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login: loginUser } = useAuth();
    const navigate = useNavigate();

    /**
     * Обработчик отправки формы.
     * @param {React.FormEvent} e - Событие отправки
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await loginUser(login, password);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Ошибка при входе');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="auth-form">
            <h2>Вход в систему</h2>

            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
                <label htmlFor="login">Логин</label>
                <input
                    type="text"
                    id="login"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    required
                    disabled={isLoading}
                />
            </div>

            <div className="form-group">
                <label htmlFor="password">Пароль</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                />
            </div>

            <button type="submit" disabled={isLoading} className="auth-button">
                {isLoading ? 'Вход...' : 'Войти'}
            </button>
        </form>
    );
};