export interface IDeliveryRequestDTO {
    phone: string;
    email: string;
    country: string;
    city: string;
    street: string;
    house: string;
    apartment?: string;
    paymentMethod: string;
}