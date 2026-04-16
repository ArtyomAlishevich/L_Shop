import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useBasket } from '../../hooks/useBasket';
import { useLocale } from '../../context/LocaleContext';
import './Header.css';

export const Header: React.FC = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const { count } = useBasket();
    const { t, locale, setLocale } = useLocale();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Ошибка при выходе:', error);
        }
    };

    const toggleLocale = () => {
        setLocale(locale === 'ru' ? 'en' : 'ru');
    };

    // @ts-ignore
    const isAdmin = user?.role === 'admin';

    return (
        <header className="header">
            <div className="header-container">
                <Link to="/" className="logo">{t.header.logo}</Link>
                <nav className="nav">
                    <Link to="/games" className="nav-link">{t.header.games}</Link>
                    {isAuthenticated ? (
                        <>
                            {isAdmin && (
                                <Link to="/admin" className="nav-link admin-link">
                                    {t.header.admin}
                                </Link>
                            )}
                            <Link to="/profile" className="nav-link">
                                {user?.name || t.header.profile}
                            </Link>
                            <Link to="/basket" className="nav-link basket-link">
                                {t.header.basket}
                                {count > 0 && <span className="basket-count">{count}</span>}
                            </Link>
                            <button onClick={handleLogout} className="nav-link logout-btn">
                                {t.header.logout}
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-link">{t.header.login}</Link>
                            <Link to="/register" className="nav-link">{t.header.register}</Link>
                        </>
                    )}
                    <button onClick={toggleLocale} className="locale-btn">
                        {locale === 'ru' ? '🇬🇧 EN' : '🇷🇺 RU'}
                    </button>
                </nav>
            </div>
        </header>
    );
};