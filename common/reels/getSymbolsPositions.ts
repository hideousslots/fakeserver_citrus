import {Position} from "./Position";

export default function getSymbolsPositions<TSymbol>(reels: TSymbol[][],
                                                     symbol: TSymbol): Position[] {
    const positions = [];
    for (let column = 0; column < reels.length; column++) {
        for (let row = 0; row < reels[column].length; row++) {
            if (reels[column][row] === symbol) {
                positions.push({column, row});
            }
        }
    }

    return positions;
}
