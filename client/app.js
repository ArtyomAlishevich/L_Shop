const BASE_URL = 'http://localhost:3000';

const API_ROUTES = {
    games: `${BASE_URL}/api/boardgames`,
    login: `${BASE_URL}/api/auth/login`,
    register: `${BASE_URL}/api/auth/register`,
    logout: `${BASE_URL}/api/auth/logout`,
    cart: `${BASE_URL}/api/baskets`,
    cartAdd: `${BASE_URL}/api/baskets/add`,
    cartRemove: `${BASE_URL}/api/baskets/remove`,
    cartClear: `${BASE_URL}/api/baskets/clear`,
    delivery: `${BASE_URL}/api/delivery`
};

const ui = {
    gamesGrid: document.getElementById('gamesGrid'),
    cartCount: document.getElementById('cartCount'),
    cartSum: document.getElementById('cartSum'),
    searchInput: document.getElementById('searchInput'),
    searchBtn: document.getElementById('searchBtn'),
    cartInfo: document.getElementById('cartInfo'),
    cartModal: document.getElementById('cartModal'),
    closeCart: document.getElementById('closeCart'),
    cartItemsList: document.getElementById('cartItemsList'),
    cartTotalSum: document.getElementById('cartTotalSum'),
    clearCartBtn: document.getElementById('clearCartBtn'),
    deliveryForm: document.getElementById('deliveryForm')
};

document.addEventListener('DOMContentLoaded', () => {
    loadGames();
    updateCartHeader();
    setupEventListeners();
});

function setupEventListeners() {
    if (ui.searchBtn) {
        ui.searchBtn.addEventListener('click', () => {
            const query = ui.searchInput?.value.trim();
            loadGames(query ? `?search=${encodeURIComponent(query)}` : '');
        });
    }

    if (ui.cartInfo) {
        ui.cartInfo.addEventListener('click', async () => {
            ui.cartModal?.classList.remove('hidden');
            await loadCartDetails();
        });
    }

    if (ui.closeCart) {
        ui.closeCart.addEventListener('click', () => {
            ui.cartModal?.classList.add('hidden');
        });
    }

    if (ui.clearCartBtn) {
        ui.clearCartBtn.addEventListener('click', async () => {
            try {
                const response = await fetch(API_ROUTES.cartClear, { method: 'POST' });
                if (response.ok) await loadCartDetails();
            } catch (e) { console.error("Ошибка очистки:", e); }
        });
    }

    if (ui.deliveryForm) {
        ui.deliveryForm.addEventListener('submit', handleDeliverySubmit);
    }
}

async function loadGames(params = '') {
    try {
        const response = await fetch(API_ROUTES.games + params);
        if (!response.ok) throw new Error('Ошибка сети');
        const data = await response.json();

        const games = data.boardGames || [];
        renderGames(games);
    } catch (error) {
        console.error('Не удалось загрузить игры:', error);
        if (ui.gamesGrid) ui.gamesGrid.innerHTML = '<p>Сервер недоступен или игра не найдена.</p>';
    }
}

async function updateCartHeader() {
    try {
        const response = await fetch(API_ROUTES.cart);
        if (response.ok) {
            const res = await response.json();
            updateCartDisplay(res.data?.count || 0, res.data?.sum || 0);
        }
    } catch (e) { console.warn('Сессия не найдена'); }
}

async function addToCart(boardGameId) {
    try {
        const response = await fetch(API_ROUTES.cartAdd, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ boardGameId })
        });

        if (response.status === 401) return alert('Войдите в систему!');

        if (response.ok) {
            alert('Добавлено в корзину');
            updateCartHeader();
        }
    } catch (e) { console.error('Ошибка добавления:', e); }
}

function renderGames(games) {
    if (!ui.gamesGrid) return;
    ui.gamesGrid.innerHTML = games.map(game => `
        <div class="game-card">
            <img src="${game.images?.preview || ''}" alt="${game.name}">
            <h3>${game.name}</h3>
            <p>${game.price} ₽</p>
            <button class="btn-buy" onclick="addToCart('${game.id}')">В корзину</button>
        </div>
    `).join('');
}

async function loadCartDetails() {
    if (!ui.cartItemsList) return;
    try {
        const response = await fetch(API_ROUTES.cart);
        const res = await response.json();
        const basket = res.data;

        if (!basket || basket.boardGames.length === 0) {
            ui.cartItemsList.innerHTML = '<p>Корзина пуста</p>';
            if (ui.cartTotalSum) ui.cartTotalSum.textContent = '0';
            return;
        }

        ui.cartItemsList.innerHTML = basket.boardGames.map(item => `
            <div class="cart-item">
                <span>Игра ID: ${item.boardGameId}</span>
                <span>${item.count} шт. | ${item.sum} ₽</span>
            </div>
        `).join('');

        if (ui.cartTotalSum) ui.cartTotalSum.textContent = basket.sum;
        updateCartDisplay(basket.count, basket.sum);
    } catch (e) { console.error("Ошибка загрузки корзины:", e); }
}

function updateCartDisplay(count, sum) {
    if (ui.cartCount) ui.cartCount.textContent = count;
    if (ui.cartSum) ui.cartSum.textContent = sum;
}

async function handleDeliverySubmit(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));

    try {
        const response = await fetch(API_ROUTES.delivery, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (response.ok) {
            alert('Заказ оформлен!');
            ui.cartModal?.classList.add('hidden');
            updateCartHeader();
        } else {
            alert(result.error || 'Ошибка');
        }
    } catch (e) { alert('Ошибка связи с сервером'); }
}