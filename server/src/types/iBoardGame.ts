export interface IBoardGame {
    id: string;
    name: {
        ru: string;
        en: string;
    };
    categories: {
        ru: string[];
        en: string[];
    };
    description: {
        ru: string;
        en: string;
    };
    minPlayers: number;
    maxPlayers: number;
    isAvailable: boolean;
    price: number;
    amount: number;
    images: {
        preview?: string;
        gallery?: string[];
    };
    delivery?: {
        startCountry: string;
        startTown: string;
        startStreet: string;
        startHouseNumber: string;
        closestDate: string;
        price: number;
    };
    discount?: number;
}