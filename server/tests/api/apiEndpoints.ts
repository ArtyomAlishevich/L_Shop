export const API_ENDPOINTS = {
    AUTH: {
        REGISTER: '/api/auth/register',
        LOGIN: '/api/auth/login',
        LOGOUT: '/api/auth/logout'
    },
    BASKETS: {
        GET: '/api/baskets',
        GET_COUNT: '/api/baskets/count',
        GET_SUM: '/api/baskets/sum',
        ADD: '/api/baskets/add',
        REMOVE: '/api/baskets/remove',
        CLEAR: '/api/baskets/clear',
        REMOVE_ALL_SIMILLAR: '/api/baskets/remove/allSimillar'
    },
    BOARD_GAMES: {
        GET_ALL: '/api/boardgames'
    },
    COMMENTS: {
        GET_BY_GAME_ID: (id: string) => `/api/comments/${id}`,
        ADD: '/api/comments',
        DELETE: (id: string) => `/api/comments/${id}`
    },
    RECOMMENDATIONS: {
        LIKE: (id: string) => `/api/recommendations/like/${id}`,
        UNLIKE: (id: string) => `/api/recommendations/like/${id}`
    },
    DELIVERY: {
        CREATE: '/api/delivery',
        GET_BY_ID: (id: string) => `/api/delivery/${id}`
    },
    LOCALE: {
        GET: '/api/locale',
        SET: '/api/locale'
    },
    ADMIN: {
        CREATE_GAME: '/api/admin/boardGame',
        UPDATE_GAME: (id: string) => `/api/admin/boardGame/${id}`,
        DELETE_GAME: (id: string) => `/api/admin/boardGame/${id}`
    }
};