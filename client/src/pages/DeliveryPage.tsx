import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useBasket } from '../hooks/useBasket';
import { deliveryApi } from '../api/delivery';
import './DeliveryPage.css';

export const DeliveryPage: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const { basket, clearBasket } = useBasket();
    const navigate = useNavigate();
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
        if (!isAuthenticated) {
            navigate('/login');
        }
        if (!basket || basket.count === 0) {
            navigate('/basket');
        }
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
            setError(err.response?.data?.error || 'Ошибка при оформлении заказа');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="delivery-page">
            <h1>Оформление заказа</h1>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Телефон *</label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Email *</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Страна *</label>
                    <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Город *</label>
                    <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Улица *</label>
                        <input
                            type="text"
                            name="street"
                            value={formData.street}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Дом *</label>
                        <input
                            type="text"
                            name="house"
                            value={formData.house}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Кв.</label>
                        <input
                            type="text"
                            name="apartment"
                            value={formData.apartment}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Способ оплаты *</label>
                    <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} required>
                        <option value="card">Картой онлайн</option>
                        <option value="cash">Наличными при получении</option>
                    </select>
                </div>

                <div className="summary">
                    <h3>Ваш заказ</h3>
                    <p>Товаров: {basket?.count} шт.</p>
                    <p>Сумма: {basket?.sum} ₽</p>
                    <p>Доставка: рассчитывается</p>
                    <p className="total">Итого: {basket?.sum} ₽ + доставка</p>
                </div>

                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Оформление...' : 'Подтвердить заказ'}
                </button>
            </form>
        </div>
    );
};