import React from 'react';
import { Link } from 'react-router-dom';
import { useLocale } from '../context/LocaleContext';
import './HomePage.css';

export const HomePage: React.FC = () => {
    const { t } = useLocale();

    return (
        <div className="home-page">
            <section className="hero">
                <h1>{t.home.heroTitle}</h1>
                <p>{t.home.heroSubtitle}</p>
                <Link to="/games" className="cta-button">
                    {t.home.heroButton}
                </Link>
            </section>

            <section className="features">
                <h2>{t.home.featuresTitle}</h2>
                <div className="features-grid">
                    <div className="feature">
                        <h3>{t.home.feature1Title}</h3>
                        <p>{t.home.feature1Text}</p>
                    </div>
                    <div className="feature">
                        <h3>{t.home.feature2Title}</h3>
                        <p>{t.home.feature2Text}</p>
                    </div>
                    <div className="feature">
                        <h3>{t.home.feature3Title}</h3>
                        <p>{t.home.feature3Text}</p>
                    </div>
                    <div className="feature">
                        <h3>{t.home.feature4Title}</h3>
                        <p>{t.home.feature4Text}</p>
                    </div>
                </div>
            </section>
        </div>
    );
};