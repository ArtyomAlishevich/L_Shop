import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useBoardGames } from '../hooks/useBoardGames';
import { adminApi, IBoardGameCreateDTO } from '../api/admin';
import { IBoardGame } from '../types';
import { useLocale } from '../context/LocaleContext';
import './AdminPage.css';

const emptyForm: IBoardGameCreateDTO = {
    name: { ru: '', en: '' },
    description: { ru: '', en: '' },
    categories: { ru: [], en: [] },
    minPlayers: 2,
    maxPlayers: 4,
    isAvailable: true,
    price: 0,
    amount: 0,
    images: { preview: '', gallery: [] },
    delivery: {
        startCountry: '',
        startTown: '',
        startStreet: '',
        startHouseNumber: '',
        closestDate: '',
        price: 0,
    },
    discount: undefined,
};

type FormMode = 'hidden' | 'create' | 'edit';

export const AdminPage: React.FC = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const { games, refetch } = useBoardGames();
    const { t } = useLocale();
    const ta = t.admin;

    const [mode, setMode] = useState<FormMode>('hidden');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<IBoardGameCreateDTO>(emptyForm);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (!isAuthenticated) { navigate('/login'); return; }
        // @ts-ignore
        if (user?.role !== 'admin') { navigate('/'); }
    }, [isAuthenticated, user]);

    const handleEdit = (game: IBoardGame) => {
        setMode('edit');
        setEditingId(game.id);
        setError('');
        setSuccess('');
        setForm({
            name: { ru: game.name, en: game.name },
            description: { ru: game.description, en: game.description },
            categories: { ru: game.categories, en: game.categories },
            minPlayers: game.minPlayers,
            maxPlayers: game.maxPlayers,
            isAvailable: game.isAvailable,
            price: game.price,
            amount: game.amount,
            images: { preview: game.images?.preview || '', gallery: game.images?.gallery || [] },
            delivery: game.delivery ? { ...game.delivery } : emptyForm.delivery,
            discount: game.discount,
        });
    };

    const handleCreate = () => {
        setMode('create');
        setEditingId(null);
        setForm(emptyForm);
        setError('');
        setSuccess('');
    };

    const handleCancel = () => {
        setMode('hidden');
        setEditingId(null);
        setError('');
        setSuccess('');
    };

    const handleDelete = async (id: string, name: string) => {
        if (!window.confirm(`${ta.deleteConfirm} "${name}"?`)) return;
        try {
            await adminApi.deleteBoardGame(id);
            setSuccess(`"${name}" ${ta.deleted}`);
            refetch();
        } catch (err: any) {
            setError(err.response?.data?.error || ta.deleteError);
        }
    };

    const setField = (path: string, value: any) => {
        setForm(prev => {
            const next = { ...prev };
            const keys = path.split('.');
            let obj: any = next;
            for (let i = 0; i < keys.length - 1; i++) {
                obj[keys[i]] = { ...obj[keys[i]] };
                obj = obj[keys[i]];
            }
            obj[keys[keys.length - 1]] = value;
            return next;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        const payload: IBoardGameCreateDTO = {
            ...form,
            categories: {
                ru: typeof form.categories.ru === 'string'
                    ? (form.categories.ru as any).split(',').map((s: string) => s.trim()).filter(Boolean)
                    : form.categories.ru,
                en: typeof form.categories.en === 'string'
                    ? (form.categories.en as any).split(',').map((s: string) => s.trim()).filter(Boolean)
                    : form.categories.en,
            },
            discount: form.discount !== undefined && String(form.discount) !== '' ? Number(form.discount) : undefined,
        };

        try {
            if (mode === 'create') {
                await adminApi.createBoardGame(payload);
                setSuccess(ta.successCreated);
                setMode('hidden');
            } else if (mode === 'edit' && editingId) {
                await adminApi.updateBoardGame(editingId, payload);
                setSuccess(ta.successUpdated);
                setMode('hidden');
            }
            refetch();
        } catch (err: any) {
            setError(err.response?.data?.error || ta.saveError);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="admin-page">
            <h1>{ta.title}</h1>

            {error && <div className="admin-error">{error}</div>}
            {success && <div className="admin-success">{success}</div>}

            <button className="add-new-btn" onClick={handleCreate}>{ta.addNew}</button>

            <div className="admin-layout">
                <div className="admin-games-list">
                    <h2>{ta.listTitle} ({games.length})</h2>
                    {games.length === 0 ? (
                        <div className="no-games">{ta.noGames}</div>
                    ) : (
                        games.map(game => (
                            <div key={game.id} className="admin-game-item">
                                <div className="admin-game-info">
                                    <div className="admin-game-name">{game.name}</div>
                                    <div className="admin-game-meta">
                                        {game.price} ₽ · {game.amount} {ta.pcs} · {game.isAvailable ? ta.inStock : ta.outOfStock}
                                        {game.discount ? ` · ${ta.discount} ${game.discount}%` : ''}
                                    </div>
                                </div>
                                <div className="admin-game-actions">
                                    <button className="edit-btn" onClick={() => handleEdit(game)}>{ta.edit}</button>
                                    <button className="delete-btn" onClick={() => handleDelete(game.id, game.name)}>{ta.delete}</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {mode !== 'hidden' && (
                    <div className="admin-form-panel">
                        <h2>{mode === 'create' ? ta.formCreate : ta.formEdit}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-section">
                                <div className="form-section-title">{ta.sectionName}</div>
                                <label>{ta.nameRu}</label>
                                <input value={form.name.ru} onChange={e => setField('name.ru', e.target.value)} required />
                                <label>{ta.nameEn}</label>
                                <input value={form.name.en} onChange={e => setField('name.en', e.target.value)} required />
                            </div>

                            <div className="form-section">
                                <div className="form-section-title">{ta.sectionDesc}</div>
                                <label>{ta.descRu}</label>
                                <textarea value={form.description.ru} onChange={e => setField('description.ru', e.target.value)} required />
                                <label>{ta.descEn}</label>
                                <textarea value={form.description.en} onChange={e => setField('description.en', e.target.value)} required />
                            </div>

                            <div className="form-section">
                                <div className="form-section-title">{ta.sectionCategories}</div>
                                <label>{ta.categoriesRu}</label>
                                <input
                                    value={Array.isArray(form.categories.ru) ? form.categories.ru.join(', ') : form.categories.ru}
                                    onChange={e => setField('categories.ru', e.target.value)}
                                    placeholder={ta.categoriesPlaceholderRu}
                                />
                                <label>{ta.categoriesEn}</label>
                                <input
                                    value={Array.isArray(form.categories.en) ? form.categories.en.join(', ') : form.categories.en}
                                    onChange={e => setField('categories.en', e.target.value)}
                                    placeholder={ta.categoriesPlaceholderEn}
                                />
                            </div>

                            <div className="form-section">
                                <div className="form-section-title">{ta.sectionParams}</div>
                                <div className="form-row-2">
                                    <div>
                                        <label>{ta.minPlayers}</label>
                                        <input type="number" min="1" value={form.minPlayers} onChange={e => setField('minPlayers', Number(e.target.value))} required />
                                    </div>
                                    <div>
                                        <label>{ta.maxPlayers}</label>
                                        <input type="number" min="1" value={form.maxPlayers} onChange={e => setField('maxPlayers', Number(e.target.value))} required />
                                    </div>
                                </div>
                                <div className="form-row-2">
                                    <div>
                                        <label>{ta.price}</label>
                                        <input type="number" min="0" value={form.price} onChange={e => setField('price', Number(e.target.value))} required />
                                    </div>
                                    <div>
                                        <label>{ta.amount}</label>
                                        <input type="number" min="0" value={form.amount} onChange={e => setField('amount', Number(e.target.value))} required />
                                    </div>
                                </div>
                                <div className="form-row-2">
                                    <div>
                                        <label>{ta.discountLabel}</label>
                                        <input type="number" min="0" max="100" value={form.discount ?? ''} onChange={e => setField('discount', e.target.value === '' ? undefined : Number(e.target.value))} placeholder={ta.discountPlaceholder} />
                                    </div>
                                </div>
                                <div className="availability-row">
                                    <input type="checkbox" id="isAvailable" checked={form.isAvailable} onChange={e => setField('isAvailable', e.target.checked)} />
                                    <label htmlFor="isAvailable">{ta.isAvailable}</label>
                                </div>
                            </div>

                            <div className="form-section">
                                <div className="form-section-title">{ta.sectionImages}</div>
                                <label>{ta.preview}</label>
                                <input value={form.images.preview || ''} onChange={e => setField('images.preview', e.target.value)} placeholder={ta.previewPlaceholder} />
                                <label>{ta.gallery}</label>
                                <input
                                    value={(form.images.gallery || []).join(', ')}
                                    onChange={e => setField('images.gallery', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                                    placeholder={ta.galleryPlaceholder}
                                />
                            </div>

                            <div className="form-section">
                                <div className="form-section-title">{ta.sectionDelivery}</div>
                                <div className="form-row-2">
                                    <div>
                                        <label>{ta.deliveryCountry}</label>
                                        <input value={form.delivery?.startCountry || ''} onChange={e => setField('delivery.startCountry', e.target.value)} />
                                    </div>
                                    <div>
                                        <label>{ta.deliveryCity}</label>
                                        <input value={form.delivery?.startTown || ''} onChange={e => setField('delivery.startTown', e.target.value)} />
                                    </div>
                                </div>
                                <div className="form-row-2">
                                    <div>
                                        <label>{ta.deliveryStreet}</label>
                                        <input value={form.delivery?.startStreet || ''} onChange={e => setField('delivery.startStreet', e.target.value)} />
                                    </div>
                                    <div>
                                        <label>{ta.deliveryHouse}</label>
                                        <input value={form.delivery?.startHouseNumber || ''} onChange={e => setField('delivery.startHouseNumber', e.target.value)} />
                                    </div>
                                </div>
                                <div className="form-row-2">
                                    <div>
                                        <label>{ta.deliveryDate}</label>
                                        <input type="datetime-local" value={form.delivery?.closestDate ? form.delivery.closestDate.slice(0, 16) : ''} onChange={e => setField('delivery.closestDate', e.target.value)} />
                                    </div>
                                    <div>
                                        <label>{ta.deliveryPrice}</label>
                                        <input type="number" min="0" value={form.delivery?.price || 0} onChange={e => setField('delivery.price', Number(e.target.value))} />
                                    </div>
                                </div>
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="save-btn" disabled={isLoading}>
                                    {isLoading ? ta.saving : (mode === 'create' ? ta.create : ta.save)}
                                </button>
                                <button type="button" className="cancel-btn" onClick={handleCancel}>{ta.cancel}</button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};