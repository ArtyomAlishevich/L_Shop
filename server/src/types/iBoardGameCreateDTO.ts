import { IBoardGame } from "./iBoardGame";

export interface IBoardGameCreateDTO extends Omit<IBoardGame, 'id' | 'averageRating'> {}
