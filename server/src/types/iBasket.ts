import { IBasketBoardGame } from "./iBasketBoardGame";

export interface IBasket {
    id: string;
    userId: string;
    count: number;
    sum: number;
    boardGames: IBasketBoardGame[]
}