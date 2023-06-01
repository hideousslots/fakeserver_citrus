import {Position} from "../../reels/Position";

export class WaysWin<TSymbol> {
    symbol: TSymbol;
    oakIndex?: number;
    win: number;
    positions?: Position[];
}
