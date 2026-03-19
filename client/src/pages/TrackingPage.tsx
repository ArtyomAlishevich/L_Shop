import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { deliveryApi } from '../api/delivery';
import { IDelivery } from '../types';
import './TrackingPage.css';

/**
 * Массив статусов доставки с их описаниями и прогрессом.
 * @constant
 */
const deliverySteps = [
    { status: 'created', label: 'Заказ создан', description: 'Заказ принят и обрабатывается', progress: 20 },
    { status: 'paid', label: 'Оплачен', description: 'Оплата получена', progress: 40 },
    { status: 'processing', label: 'Собирается', description: 'Заказ комплектуется на складе', progress: 60 },
    { status: 'shipped', label: 'Передан курьеру', description: 'Заказ передан в службу доставки', progress: 70 },
    { status: 'in_transit', label: 'В пути', description: 'Заказ доставляется', progress: 80 },
    { status: 'delivered', label: 'Доставлен', description: 'Заказ получен', progress: 100 },
    { status: 'cancelled', label: 'Отменён', description: 'Заказ отменён', progress: 0 }
];

/**
 * Получает информацию о статусе заказа.
 * 
 * @param {string} status - Код статуса из объекта заказа
 * @returns {Object} Объект с данными статуса (иконка, описание, прогресс, цвет)
 * 
 * @example
 * const statusInfo = getStatusInfo('shipped');
 * console.log(statusInfo.label); // "📦 Передан курьеру"
 */
const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { label: string, description: string, progress: number, color: string }> = {
        'created': {
            label: '🆕 Заказ создан',
            description: 'Заказ принят и ожидает обработки',
            progress: 10,
            color: '#ff9800'
        },
        'paid': {
            label: '💳 Оплачен',
            description: 'Оплата прошла успешно',
            progress: 30,
            color: '#4caf50'
        },
        'processing': {
            label: '⚙️ В обработке',
            description: 'Заказ комплектуется на складе',
            progress: 50,
            color: '#2196f3'
        },
        'shipped': {
            label: '📦 Передан курьеру',
            description: 'Заказ передан в службу доставки',
            progress: 70,
            color: '#9c27b0'
        },
        'in_transit': {
            label: '🚚 В пути',
            description: 'Заказ доставляется',
            progress: 85,
            color: '#ff5722'
        },
        'delivered': {
            label: '✅ Доставлен',
            description: 'Заказ получен. Спасибо за покупку!',
            progress: 100,
            color: '#4caf50'
        },
        'cancelled': {
            label: '❌ Отменён',
            description: 'Заказ был отменён',
            progress: 0,
            color: '#f44336'
        }
    };
    return statusMap[status] || statusMap['created'];
};

/**
 * Страница отслеживания заказа.
 * 
 * Отображает детальную информацию о заказе и его статус в реальном времени.
 * Автоматически обновляет статус каждые 30 секунд.
 * 
 * @component
 * @returns {JSX.Element} Страница отслеживания заказа
 * 
 * @example
 * <TrackingPage />
 */
export const TrackingPage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [order, setOrder] = useState<IDelivery | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        if (orderId) {
            loadOrder();
        }
    }, [orderId, isAuthenticated]);

    /**
     * Загружает данные заказа с сервера.
     * @async
     */
    const loadOrder = async () => {
        try {
            setIsLoading(true);
            const data = await deliveryApi.getById(orderId!);
            setOrder(data);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Ошибка загрузки заказа');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!orderId) return;

        const interval = setInterval(() => {
            loadOrder();
        }, 30000);

        return () => clearInterval(interval);
    }, [orderId]);

    if (isLoading) {
        return (
            <div className="tracking-loading">
                <div className="spinner"></div>
                <p>Загрузка информации о заказе...</p>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="tracking-error">
                <h2>Ошибка</h2>
                <p>{error || 'Заказ не найден'}</p>
                <button onClick={() => navigate('/profile/orders')}>
                    К списку заказов
                </button>
            </div>
        );
    }

    const statusInfo = getStatusInfo(order.status);
    const isDelivered = order.status === 'delivered';
    const isCancelled = order.status === 'cancelled';

    return (
        <div className="tracking-page">
            <div className="tracking-header">
                <h1>Отслеживание заказа</h1>
                <div className="order-number">
                    Заказ #{order.id.slice(0, 8).toUpperCase()}
                </div>
            </div>

            <div className="tracking-card">
                <div className="tracking-status-header" style={{ backgroundColor: statusInfo.color }}>
                    <div className="status-icon">{statusInfo.label.split(' ')[0]}</div>
                    <div className="status-text">
                        <h2>{statusInfo.label}</h2>
                        <p>{statusInfo.description}</p>
                    </div>
                </div>

                <div className="tracking-progress">
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{
                                width: `${statusInfo.progress}%`,
                                backgroundColor: statusInfo.color
                            }}
                        ></div>
                    </div>
                    <div className="progress-percent">{statusInfo.progress}%</div>
                </div>

                <div className="tracking-timeline">
                    <h3>Ход выполнения</h3>
                    <div className="timeline-steps">
                        {deliverySteps.map((step, index) => {
                            const isActive = deliverySteps.findIndex(s => s.status === order.status) >= index;
                            const isCompleted = deliverySteps.findIndex(s => s.status === order.status) > index;

                            return (
                                <div
                                    key={step.status}
                                    className={`timeline-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                                >
                                    <div className="step-marker">
                                        {isCompleted ? '✓' : index + 1}
                                    </div>
                                    <div className="step-content">
                                        <div className="step-title">{step.label}</div>
                                        <div className="step-description">{step.description}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="order-details">
                    <h3>Детали заказа</h3>

                    <div className="details-grid">
                        <div className="detail-item">
                            <span className="detail-label">Дата заказа:</span>
                            <span className="detail-value">
                {new Date(order.createdAt).toLocaleDateString('ru-RU', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}
              </span>
                        </div>

                        <div className="detail-item">
                            <span className="detail-label">Способ оплаты:</span>
                            <span className="detail-value">
                {order.paymentMethod === 'card' ? 'Банковская карта' : 'Наличные'}
              </span>
                        </div>

                        <div className="detail-item">
                            <span className="detail-label">Адрес доставки:</span>
                            <span className="detail-value">
                {order.address.country}, {order.address.city}, ул. {order.address.street}, д. {order.address.house}
                                {order.address.apartment && `, кв. ${order.address.apartment}`}
              </span>
                        </div>

                        <div className="detail-item">
                            <span className="detail-label">Контакт:</span>
                            <span className="detail-value">
                {order.contact.phone} | {order.contact.email}
              </span>
                        </div>
                    </div>
                </div>

                <div className="order-items">
                    <h3>Состав заказа</h3>
                    <table className="items-table">
                        <thead>
                        <tr>
                            <th>Товар</th>
                            <th>Количество</th>
                            <th>Цена</th>
                            <th>Сумма</th>
                        </tr>
                        </thead>
                        <tbody>
                        {order.items.map((item, index) => (
                            <tr key={index}>
                                <td>ID: {item.boardGameId}</td>
                                <td>{item.count}</td>
                                <td>{item.price} ₽</td>
                                <td>{item.price * item.count} ₽</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                <div className="order-summary">
                    <div className="summary-row">
                        <span>Товары:</span>
                        <span>{order.totalCount} шт. / {order.totalSum} ₽</span>
                    </div>
                    <div className="summary-row">
                        <span>Доставка:</span>
                        <span>{order.totalDeliverySum} ₽</span>
                    </div>
                    <div className="summary-row total">
                        <span>Итого:</span>
                        <span>{order.totalOrderSum} ₽</span>
                    </div>
                </div>

                {!isDelivered && !isCancelled && (
                    <div className="tracking-note">
                        <p>🔄 Статус обновляется автоматически каждые 30 секунд</p>
                        <button onClick={loadOrder} className="refresh-button">
                            Обновить сейчас
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};