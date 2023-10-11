import { Position } from "../reels/Position";

export type LineWin<TSymbol> = {
    symbol: TSymbol;
    lineWinNumber: number | null;
    oakIndex: number;
    positions?: Position[];
    win: number;
};

export function calculateLineWins<TSymbol extends string | number | symbol>(
    reels: TSymbol[][],
    payTable: Record<TSymbol, number[]>,
    linedefines: number[][]
): LineWin<TSymbol>[] {
    const wins: LineWin<TSymbol>[] = [];
    for (let i = 0; i < linedefines.length; i++) {
        const lineWin = checkLineWin(reels, payTable, linedefines[i], i);
        lineWin !== null && wins.push(lineWin);
    }
    return wins;
}


function checkLineWin<TSymbol extends string | number | symbol>(reels: TSymbol[][], payTable: Record<TSymbol, number[]>, linedefines: number[], lineNumber: number) {

    const symbol: TSymbol = reels[0][linedefines[0]];
    const lineWinNumber = lineNumber;
    const positions: Position[] = [{row: linedefines[0], column: 0}];
    
    let oakIndex: number = 1;
    for (let i = 1; i < linedefines.length; i++) {
        if (reels[i][linedefines[i]] !== symbol) {
            break
        }
        oakIndex++;
        positions.push({row: linedefines[i], column: i});
    }

    const win = getWinMultiplierFromPaytable(symbol, oakIndex, payTable, reels.length);

    if (win > 0) {
        return {
            symbol,
            lineWinNumber,
            oakIndex,
            positions,
            win
        }
    } else {
        return null;
    }

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