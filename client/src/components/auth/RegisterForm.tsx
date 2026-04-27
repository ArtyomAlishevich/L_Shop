import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLocale } from '../../context/LocaleContext';
import './AuthForms.css';

export const RegisterForm: React.FC = () => {
    const [name, setName] = useState('');
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const { t } = useLocale();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            setError(t.auth.passwordMismatch);
            return;
        }
        setIsLoading(true);
        try {
            await register(name, login, password);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.error || t.auth.registerError);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="auth-form">
            <h2>{t.auth.registerTitle}</h2>

            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
                <label htmlFor="name">{t.auth.nameLabel}</label>
                <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required disabled={isLoading} />
            </div>

            <div className="form-group">
                <label htmlFor="login">{t.auth.loginLabel}</label>
                <input type="text" id="login" value={login} onChange={(e) => setLogin(e.target.value)} required disabled={isLoading} />
            </div>

            <div className="form-group">
                <label htmlFor="password">{t.auth.passwordLabel}</label>
                <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} />
            </div>

            <div className="form-group">
                <label htmlFor="confirmPassword">{t.auth.confirmPasswordLabel}</label>
                <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={isLoading} />
            </div>

            <button type="submit" disabled={isLoading} className="auth-button">
                {isLoading ? t.auth.registering : t.auth.registerButton}
            </button>
        </form>
    );
};