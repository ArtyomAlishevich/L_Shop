import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { deliveryApi } from '../api/delivery';
import { IDelivery } from '../types';
import { useLocale } from '../context/LocaleContext';
import './TrackingPage.css';

export const TrackingPage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const { t } = useLocale();
    const [order, setOrder] = useState<IDelivery | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isAuthenticated) { navigate('/login'); return; }
        if (orderId) loadOrder();
    }, [orderId, isAuthenticated]);

    const loadOrder = async () => {
        try {
            setIsLoading(true);
            const data = await deliveryApi.getById(orderId!);
            setOrder(data);
        } catch (err: any) {
            setError(err.response?.data?.error || t.tracking.notFound);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!orderId) return;
        const interval = setInterval(() => { loadOrder(); }, 30000);
        return () => clearInterval(interval);
    }, [orderId]);

    if (isLoading) {
        return (
            <div className="tracking-loading">
                <div className="spinner"></div>
                <p>{t.tracking.loading}</p>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="tracking-error">
                <h2>{t.tracking.error}</h2>
                <p>{error || t.tracking.notFound}</p>
                <button onClick={() => navigate('/profile/orders')}>{t.tracking.toOrders}</button>
            </div>
        );
    }

    const statuses = t.tracking.statuses as Record<string, { label: string; description: string }>;
    const steps = t.tracking.steps;

    const statusProgressMap: Record<string, { progress: number; color: string }> = {
        created:    { progress: 10, color: '#ff9800' },
        paid:       { progress: 30, color: '#4caf50' },
        processing: { progress: 50, color: '#2196f3' },
        shipped:    { progress: 70, color: '#9c27b0' },
        in_transit: { progress: 85, color: '#ff5722' },
        delivered:  { progress: 100, color: '#4caf50' },
        cancelled:  { progress: 0,   color: '#f44336' },
    };

    const statusMeta = statusProgressMap[order.status] || statusProgressMap['created'];
    const statusInfo = statuses[order.status] || statuses['created'];
    const isDelivered = order.status === 'delivered';
    const isCancelled = order.status === 'cancelled';

    return (
        <div className="tracking-page">
            <div className="tracking-header">
                <h1>{t.tracking.title}</h1>
                <div className="order-number">{t.tracking.orderNumber}{order.id.slice(0, 8).toUpperCase()}</div>
            </div>

            <div className="tracking-card">
                <div className="tracking-status-header" style={{ backgroundColor: statusMeta.color }}>
                    <div className="status-icon">{statusInfo.label.split(' ')[0]}</div>
                    <div className="status-text">
                        <h2>{statusInfo.label}</h2>
                        <p>{statusInfo.description}</p>
                    </div>
                </div>

                <div className="tracking-progress">
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${statusMeta.progress}%`, backgroundColor: statusMeta.color }}></div>
                    </div>
                    <div className="progress-percent">{statusMeta.progress}%</div>
                </div>

                <div className="tracking-timeline">
                    <h3>{t.tracking.progress}</h3>
                    <div className="timeline-steps">
                        {steps.map((step: any, index: number) => {
                            const currentIndex = steps.findIndex((s: any) => s.status === order.status);
                            const isActive = currentIndex >= index;
                            const isCompleted = currentIndex > index;
                            return (
                                <div key={step.status} className={`timeline-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                                    <div className="step-marker">{isCompleted ? '✓' : index + 1}</div>
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
                    <h3>{t.tracking.orderDetails}</h3>
                    <div className="details-grid">
                        <div className="detail-item">
                            <span className="detail-label">{t.tracking.orderDate}</span>
                            <span className="detail-value">
                                {new Date(order.createdAt).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">{t.tracking.paymentMethod}</span>
                            <span className="detail-value">
                                {order.paymentMethod === 'card' ? t.tracking.paymentCard : t.tracking.paymentCash}
                            </span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">{t.tracking.deliveryAddress}</span>
                            <span className="detail-value">
                                {order.address.country}, {order.address.city}, {t.tracking.street} {order.address.street}, {t.tracking.house} {order.address.house}
                                {order.address.apartment && `, ${t.tracking.apartment} ${order.address.apartment}`}
                            </span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">{t.tracking.contact}</span>
                            <span className="detail-value">{order.contact.phone} | {order.contact.email}</span>
                        </div>
                    </div>
                </div>

                <div className="order-items">
                    <h3>{t.tracking.orderItems}</h3>
                    <table className="items-table">
                        <thead>
                        <tr>
                            <th>{t.tracking.product}</th>
                            <th>{t.tracking.quantity}</th>
                            <th>{t.tracking.price}</th>
                            <th>{t.tracking.itemSum}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {order.items.map((item, index) => (
                            <tr key={index}>
                                <td>{t.tracking.itemId} {item.boardGameId}</td>
                                <td>{item.count}</td>
                                <td>{item.price} {t.tracking.currency}</td>
                                <td>{item.price * item.count} {t.tracking.currency}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                <div className="order-summary">
                    <div className="summary-row">
                        <span>{t.tracking.goodsTotal}</span>
                        <span>{order.totalCount} {t.tracking.pcs} / {order.totalSum} {t.tracking.currency}</span>
                    </div>
                    <div className="summary-row">
                        <span>{t.tracking.deliveryTotal}</span>
                        <span>{order.totalDeliverySum} {t.tracking.currency}</span>
                    </div>
                    <div className="summary-row total">
                        <span>{t.tracking.grandTotal}</span>
                        <span>{order.totalOrderSum} {t.tracking.currency}</span>
                    </div>
                </div>

                {!isDelivered && !isCancelled && (
                    <div className="tracking-note">
                        <p>{t.tracking.autoUpdate}</p>
                        <button onClick={loadOrder} className="refresh-button">{t.tracking.refreshNow}</button>
                    </div>
                )}
            </div>
        </div>
    );
};