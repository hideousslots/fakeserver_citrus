import {WaysWin} from "./WaysWin";
import {Position} from "../../reels/Position";

export function calculateWaysWins<TSymbol extends string | number | symbol>(reels: TSymbol[][],
                                                                            payTable: Record<TSymbol, number[]>,
                                                                            isWildPredicate: (symbol: TSymbol) => boolean,
                                                                            coin: number,
                                                                            precisionMoneyMapper: (a: number) => number)
    : WaysWin<TSymbol>[] {

    const symbolCandidates = filterUniqueSymbols(reels[0])
        .filter(symbol => payTable[symbol] !== undefined);

    return symbolCandidates.map(candidateSymbol => {
        const symbolCountsOnReels = [];
        const positions = [];

        let column = 0;
        while (column < reels.length) {
            const reel = reels[column];
            const newPositions: Position[] = [];
            for (let row = 0; row < reel.length; row++) {
                if (reel[row] === candidateSymbol || isWildPredicate(reel[row])) {
                    newPositions.push({column, row});
                }
            }
            const newSymbols = reel.filter(symbol => symbol === candidateSymbol || isWildPredicate(symbol));
            const newSymbolsCount = newSymbols.length;

            if (newSymbolsCount === 0) break;

            symbolCountsOnReels.push(newSymbolsCount);
            positions.push(...newPositions);
            column++;
        }

        const oakIndex = column;
        const winMultiplierFromPaytable = getWinMultiplierFromPaytable(
            candidateSymbol, oakIndex, payTable, reels.length);

        const symbolCoinsWon = symbolCountsOnReels.reduce(
            (previousValue, currentValue) => previousValue * currentValue, winMultiplierFromPaytable);

        return {
            symbol: candidateSymbol,
            oakIndex: oakIndex,
            win: precisionMoneyMapper(symbolCoinsWon * coin),
            positions: positions,
        };
    })
        .filter(waysWin => waysWin.win > 0);
}

function filterUniqueSymbols<TSymbol>(reel: TSymbol[]) {
    return reel.filter((value, index) => {
        return reel.indexOf(value) === index;
    });
}

function getWinMultiplierFromPaytable<TSymbol extends string | number | symbol>(symbol: TSymbol,
                                                                                oakIndex: number,
                                                                                payTable: Record<TSymbol, number[]>,
                                                                                reelsCount: number): number {
    const payTableEntryIndex = oakIndex - 1 - (reelsCount - payTable[symbol].length);
    return payTableEntryIndex < 0
        ? 0
        : payTable[symbol][payTableEntryIndex];
}
