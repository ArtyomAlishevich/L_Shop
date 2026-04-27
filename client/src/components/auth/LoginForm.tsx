import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLocale } from '../../context/LocaleContext';
import './AuthForms.css';

export const LoginForm: React.FC = () => {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login: loginUser } = useAuth();
    const { t } = useLocale();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await loginUser(login, password);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.error || t.auth.loginError);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="auth-form">
            <h2>{t.auth.loginTitle}</h2>

            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
                <label htmlFor="login">{t.auth.loginLabel}</label>
                <input type="text" id="login" value={login} onChange={(e) => setLogin(e.target.value)} required disabled={isLoading} />
            </div>

            <div className="form-group">
                <label htmlFor="password">{t.auth.passwordLabel}</label>
                <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} />
            </div>

            <button type="submit" disabled={isLoading} className="auth-button">
                {isLoading ? t.auth.loggingIn : t.auth.loginButton}
            </button>
        </form>
    );
};