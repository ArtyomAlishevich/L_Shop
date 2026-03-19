import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

/**
 * Главная страница приложения.
 * 
 * Отображает приветственный баннер (hero section) с призывом к действию
 * и список преимуществ магазина в виде сетки карточек.
 * 
 * @component
 * @returns {JSX.Element} Главная страница
 * 
 * @example
 * <HomePage />
 */
export const HomePage: React.FC = () => {
    return (
        <div className="home-page">
            <section className="hero">
                <h1>Добро пожаловать в магазин настольных игр!</h1>
                <p>Откройте для себя мир увлекательных настольных игр</p>
                <Link to="/games" className="cta-button">
                    Перейти к играм
                </Link>
            </section>

            <section className="features">
                <h2>Почему выбирают нас?</h2>
                <div className="features-grid">
                    <div className="feature">
                        <h3>🃏 Большой выбор</h3>
                        <p>Более 1000 настольных игр разных жанров</p>
                    </div>
                    <div className="feature">
                        <h3>🚀 Быстрая доставка</h3>
                        <p>Доставка по всей Беларуси за 3-7 дней</p>
                    </div>
                    <div className="feature">
                        <h3>💰 Лучшие цены</h3>
                        <p>Регулярные скидки и акции</p>
                    </div>
                    <div className="feature">
                        <h3>⭐ Гарантия качества</h3>
                        <p>Только оригинальные игры</p>
                    </div>
                </div>
            </section>
        </div>
    );
};