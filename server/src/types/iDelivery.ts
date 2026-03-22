export interface IDeliveryItem {
    boardGameId: string;
    count: number;
    price: number;
    delivery: {
        startCountry: string;
        startTown: string;
        startStreet: string;
        startHouseNumber: string;
        closestDate: string;
        price: number;
    };
}

export interface IDelivery {
    id: string;
    userId: string;
    contact: {
        phone: string;
        email: string;
    };
    address: {
        country: string;
        city: string;
        street: string;
        house: string;
        apartment?: string;
    };
    paymentMethod: string;
    items: IDeliveryItem[];
    totalCount: number;
    totalSum: number;
    totalDeliverySum: number;
    totalOrderSum: number;
    createdAt: string;
    status: string;
}