export * from './iUser';
export * from './iUserRequestDTO';
export * from './iUserResponse';
export * from './iBoardGame';
export * from './iBasket';
export * from './iBasketBoardGame';
export * from './iDelivery';
export * from './iDeliveryRequestDTO';

export interface ApiResponse<T> {
    data: T;
}

export interface ApiError {
    error: string;
}