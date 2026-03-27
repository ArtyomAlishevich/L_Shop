import { IBoardGame } from "./iBoardGame";

export interface IBoardGameUpdateDTO extends Partial<Omit<IBoardGame, 'id'>> {}
