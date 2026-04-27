import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useBasket } from '../hooks/useBasket';
import { deliveryApi } from '../api/delivery';
import { useLocale } from '../context/LocaleContext';
import './DeliveryPage.css';

export const DeliveryPage: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const { basket, clearBasket } = useBasket();
    const navigate = useNavigate();
    const { t } = useLocale();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        phone: '',
        email: '',
        country: 'Беларусь',
        city: '',
        street: '',
        house: '',
        apartment: '',
        paymentMethod: 'card'
    });

    React.useEffect(() => {
        if (!isAuthenticated) navigate('/login');
        if (!basket || basket.count === 0) navigate('/basket');
    }, [isAuthenticated, basket, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const delivery = await deliveryApi.create(formData);
            await clearBasket();
            navigate(`/tracking/${delivery.id}`);
        } catch (err: any) {
            setError(err.response?.data?.error || t.delivery.orderError);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="delivery-page">
            <h1>{t.delivery.title}</h1>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>{t.delivery.phone}</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
                </div>

                <div className="form-group">
                    <label>{t.delivery.email}</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                </div>

                <div className="form-group">
                    <label>{t.delivery.country}</label>
                    <input type="text" name="country" value={formData.country} onChange={handleChange} required />
                </div>

                <div className="form-group">
                    <label>{t.delivery.city}</label>
                    <input type="text" name="city" value={formData.city} onChange={handleChange} required />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>{t.delivery.street}</label>
                        <input type="text" name="street" value={formData.street} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>{t.delivery.house}</label>
                        <input type="text" name="house" value={formData.house} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>{t.delivery.apartment}</label>
                        <input type="text" name="apartment" value={formData.apartment} onChange={handleChange} />
                    </div>
                </div>

                <div className="form-group">
                    <label>{t.delivery.paymentMethod}</label>
                    <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} required>
                        <option value="card">{t.delivery.paymentCard}</option>
                        <option value="cash">{t.delivery.paymentCash}</option>
                    </select>
                </div>

                <div className="summary">
                    <h3>{t.delivery.orderSummary}</h3>
                    <p>{t.delivery.itemsCount} {basket?.count} {t.delivery.pcs}</p>
                    <p>{t.delivery.itemsSum} {basket?.sum} ₽</p>
                    <p>{t.delivery.deliveryCost}</p>
                    <p className="total">{t.delivery.totalLabel} {basket?.sum} ₽ {t.delivery.totalDelivery}</p>
                </div>

                <button type="submit" disabled={isLoading}>
                    {isLoading ? t.delivery.submitting : t.delivery.submit}
                </button>
            </form>
        </div>
    );
};