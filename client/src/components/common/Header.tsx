import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useBasket } from '../../hooks/useBasket';
import './Header.css';

export const Header: React.FC = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const { count } = useBasket();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Ошибка при выходе:', error);
        }
    };

    return (
        <header className="header">
            <div className="header-container">
                <Link to="/" className="logo">
                    BoardGames Shop
                </Link>

                <nav className="nav">
                    <Link to="/games" className="nav-link">
                        Игры
                    </Link>
                    {isAuthenticated ? (
                        <>
                            <Link to="/profile" className="nav-link">
                                {user?.name || 'Профиль'}
                            </Link>
                            <Link to="/basket" className="nav-link basket-link">
                                Корзина
                                {count > 0 && <span className="basket-count">{count}</span>}
                            </Link>
                            <button onClick={handleLogout} className="nav-link logout-btn">
                                Выйти
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-link">
                                Вход
                            </Link>
                            <Link to="/register" className="nav-link">
                                Регистрация
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
};