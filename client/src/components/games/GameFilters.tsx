import React, { useState } from 'react';
import { GamesQueryParams } from '../../api/boardGames';
import { useLocale } from '../../context/LocaleContext';
import './GameFilters.css';

interface GameFiltersProps {
    onFilterChange: (params: GamesQueryParams) => void;
}

export const GameFilters: React.FC<GameFiltersProps> = ({ onFilterChange }) => {
    const { t } = useLocale();
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [minPlayers, setMinPlayers] = useState('');
    const [maxPlayers, setMaxPlayers] = useState('');
    const [sort, setSort] = useState<'asc' | 'desc' | ''>('');
    const [isAvailable, setIsAvailable] = useState('');

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

    const handleReset = () => {
        setSearch(''); setCategory(''); setMinPrice(''); setMaxPrice('');
        setMinPlayers(''); setMaxPlayers(''); setSort(''); setIsAvailable('');
        onFilterChange({});
    };

    return (
        <form onSubmit={handleSubmit} className="filters-form">
            <h3>{t.filters.title}</h3>

            <div className="filter-group">
                <label>{t.filters.search}</label>
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.filters.searchPlaceholder} />
            </div>

            <div className="filter-group">
                <label>{t.filters.category}</label>
                <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder={t.filters.categoryPlaceholder} />
            </div>

            <div className="filter-row">
                <div className="filter-group">
                    <label>{t.filters.priceFrom}</label>
                    <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="0" />
                </div>
                <div className="filter-group">
                    <label>{t.filters.priceTo}</label>
                    <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="500" />
                </div>
            </div>

            <div className="filter-row">
                <div className="filter-group">
                    <label>{t.filters.playersFrom}</label>
                    <input type="number" value={minPlayers} onChange={(e) => setMinPlayers(e.target.value)} placeholder="1" />
                </div>
                <div className="filter-group">
                    <label>{t.filters.playersTo}</label>
                    <input type="number" value={maxPlayers} onChange={(e) => setMaxPlayers(e.target.value)} placeholder="10" />
                </div>
            </div>

            <div className="filter-group">
                <label>{t.filters.sort}</label>
                <select value={sort} onChange={(e) => setSort(e.target.value as 'asc' | 'desc' | '')}>
                    <option value="">{t.filters.sortNone}</option>
                    <option value="asc">{t.filters.sortAsc}</option>
                    <option value="desc">{t.filters.sortDesc}</option>
                </select>
            </div>

            <div className="filter-group">
                <label>{t.filters.availability}</label>
                <select value={isAvailable} onChange={(e) => setIsAvailable(e.target.value)}>
                    <option value="">{t.filters.availabilityAll}</option>
                    <option value="true">{t.filters.availabilityIn}</option>
                    <option value="false">{t.filters.availabilityOut}</option>
                </select>
            </div>

            <div className="filter-actions">
                <button type="submit" className="apply-filters">{t.filters.apply}</button>
                <button type="button" onClick={handleReset} className="reset-filters">{t.filters.reset}</button>
            </div>
        </form>
    );
};