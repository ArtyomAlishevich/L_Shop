import React, { useState } from 'react';
import { GamesQueryParams } from '../../api/boardGames';
import './GameFilters.css';

/**
 * Props для компонента GameFilters
 */
interface GameFiltersProps {
     /** Функция, вызываемая при изменении фильтров */
    onFilterChange: (params: GamesQueryParams) => void;
}

/**
 * Компонент формы фильтрации игр.
 * 
 * Позволяет пользователю фильтровать игры по различным критериям:
 * поиск, категория, цена, количество игроков, наличие.
 * 
 * @component
 * @param {GameFiltersProps} props - Свойства компонента
 * @returns {JSX.Element} Форма фильтрации
 * 
 * @example
 * <GameFilters onFilterChange={(params) => setParams(params)} />
 */
export const GameFilters: React.FC<GameFiltersProps> = ({ onFilterChange }) => {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [minPlayers, setMinPlayers] = useState('');
    const [maxPlayers, setMaxPlayers] = useState('');
    const [sort, setSort] = useState<'asc' | 'desc' | ''>('');
    const [isAvailable, setIsAvailable] = useState('');

    /**
     * Обработчик отправки формы.
     * Собирает все непустые поля в объект параметров и передает родителю.
     * 
     * @param {React.FormEvent} e - Событие отправки формы
     */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const params: GamesQueryParams = {};

        if (search) params.search = search;
        if (category) params.category = category;
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        if (minPlayers) params.minPlayers = minPlayers;
        if (maxPlayers) params.maxPlayers = maxPlayers;
        if (sort) params.sort = sort;
        if (isAvailable) params.isAvailable = isAvailable;

        onFilterChange(params);
    };

    /**
     * Сбрасывает все фильтры к значениям по умолчанию.
     */
    const handleReset = () => {
        setSearch('');
        setCategory('');
        setMinPrice('');
        setMaxPrice('');
        setMinPlayers('');
        setMaxPlayers('');
        setSort('');
        setIsAvailable('');
        onFilterChange({});
    };

    return (
        <form onSubmit={handleSubmit} className="filters-form">
            <h3>Фильтры</h3>

            <div className="filter-group">
                <label>Поиск</label>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Название игры"
                />
            </div>

            <div className="filter-group">
                <label>Категория</label>
                <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Например: стратегия"
                />
            </div>

            <div className="filter-row">
                <div className="filter-group">
                    <label>Цена от</label>
                    <input
                        type="number"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        placeholder="0"
                    />
                </div>
                <div className="filter-group">
                    <label>до</label>
                    <input
                        type="number"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        placeholder="500"
                    />
                </div>
            </div>

            <div className="filter-row">
                <div className="filter-group">
                    <label>Игроков от</label>
                    <input
                        type="number"
                        value={minPlayers}
                        onChange={(e) => setMinPlayers(e.target.value)}
                        placeholder="1"
                    />
                </div>
                <div className="filter-group">
                    <label>до</label>
                    <input
                        type="number"
                        value={maxPlayers}
                        onChange={(e) => setMaxPlayers(e.target.value)}
                        placeholder="10"
                    />
                </div>
            </div>

            <div className="filter-group">
                <label>Сортировка</label>
                <select value={sort} onChange={(e) => setSort(e.target.value as 'asc' | 'desc' | '')}>
                    <option value="">Без сортировки</option>
                    <option value="asc">По возрастанию цены</option>
                    <option value="desc">По убыванию цены</option>
                </select>
            </div>

            <div className="filter-group">
                <label>Наличие</label>
                <select value={isAvailable} onChange={(e) => setIsAvailable(e.target.value)}>
                    <option value="">Все</option>
                    <option value="true">В наличии</option>
                    <option value="false">Нет в наличии</option>
                </select>
            </div>

            <div className="filter-actions">
                <button type="submit" className="apply-filters">Применить</button>
                <button type="button" onClick={handleReset} className="reset-filters">Сбросить</button>
            </div>
        </form>
    );
};