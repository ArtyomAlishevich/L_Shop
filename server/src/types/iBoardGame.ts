export interface IBoardGame {
    id: string,
    name: string,
    description: string,
    categories: string[],
    playersAmount: string,
    isAvailable: boolean,
    price: number,
    amount: number,
    images: {
        preview?: string,
        gallery?: string[]
    }
    delivery?: {
        startCountry: string,
        startTown: string,
        startStreet: string,
        startHouseNumber: string,
        closestDate: string,
        price: number
    }
    discount?: number
}