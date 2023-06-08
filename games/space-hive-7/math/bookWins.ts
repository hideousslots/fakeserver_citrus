import {IntegerRng} from "../../../common/rng/IntegerRng";
import {WaysWin} from "../../../common/wins/ways/WaysWin";
import {Position} from "../../../common/reels/Position";
import {mathConfig} from "./config/mathConfig";
import {SpaceHiveSymbol} from "./config/SpaceHiveSymbol";

export function modifyReelsForReplace(integerRng: IntegerRng, payload: number, reels: SpaceHiveSymbol[][]): void {
    const symbol = mathConfig.replaceSymbolPayloadLookup[payload].symbol;
    const ways = mathConfig.replaceSymbolPayloadLookup[payload].ways;

    // middle 4 reels
    const startReel = 1;
    const endReel = reels.length - 1;

    // Identify the columns that contain at least one symbol that matches
    const columnsWithSymbol = [];
    for(let column = startReel; column < endReel; column++) {
        if(reels[column].includes(symbol)) {
            columnsWithSymbol.push(column);
        }
    }

    // If the number of such columns is greater than "ways", 
    // remove all matching symbols from enough columns until the number of columns with matching symbols equals "ways"
    while(columnsWithSymbol.length > ways) {
        const randomColumnIndex = integerRng.randomInteger(columnsWithSymbol.length);
        const columnToRemove = columnsWithSymbol[randomColumnIndex];
        reels[columnToRemove] = reels[columnToRemove].map(s => s === symbol ? integerRng.randomInteger(10) : s);
        columnsWithSymbol.splice(randomColumnIndex, 1);
    }

    // If the number of such columns is less than "ways", 
    // add the matching symbol to enough columns without it until the number of columns with matching symbols equals "ways"
    const columnsWithoutSymbol = [];
    for(let column = startReel; column < endReel; column++) {
        if(!reels[column].includes(symbol)) {
            columnsWithoutSymbol.push(column);
        }
    }
    while(columnsWithSymbol.length < ways && columnsWithoutSymbol.length > 0) {
        const randomColumnIndex = integerRng.randomInteger(columnsWithoutSymbol.length);
        const columnToAdd = columnsWithoutSymbol[randomColumnIndex];
        const rowToAdd = integerRng.randomInteger(reels[columnToAdd].length);
        reels[columnToAdd][rowToAdd] = symbol;
        columnsWithSymbol.push(columnToAdd);
        columnsWithoutSymbol.splice(randomColumnIndex, 1);
    }
}

export function expandFeatureReels(featureReels, payload) {
    const bookSymbol = mathConfig.replaceSymbolPayloadLookup[payload].symbol;
    const featureReelsExpanded = featureReels.map((column) => [...column]);
  
    // Fill the first and last reels with the placeholder
    featureReelsExpanded[0] = Array(featureReelsExpanded[0].length).fill(SpaceHiveSymbol.PlaceHolder);
    featureReelsExpanded[featureReelsExpanded.length - 1] = Array(featureReelsExpanded[featureReelsExpanded.length - 1].length).fill(SpaceHiveSymbol.PlaceHolder);
  
    // Find columns that contain bookSymbol and replace them with bookSymbol
    for (let i = 1; i < featureReelsExpanded.length - 1; i++) {
      if (featureReelsExpanded[i].includes(bookSymbol)) {
        featureReelsExpanded[i] = Array(featureReelsExpanded[i].length).fill(bookSymbol);
      } else {
        featureReelsExpanded[i] = Array(featureReelsExpanded[i].length).fill(SpaceHiveSymbol.PlaceHolder);
      }
    }
  
    return featureReelsExpanded;
  }

export function calculateBookWins<TSymbol extends string | number | symbol>(
    reels: TSymbol[][],
    payTable: Record<TSymbol, number[]>,
    coin: number,
    precisionMoneyMapper: (a: number) => number
): WaysWin<TSymbol> {

    const allSymbols = reels.flatMap(reel => reel);
    const symbolCandidates = filterUniqueSymbols(allSymbols)
        .filter(symbol => payTable[symbol] !== undefined && symbol !== SpaceHiveSymbol.PlaceHolder);

    if (symbolCandidates.length > 1) {
        throw new Error('Multiple winning symbols detected.');
    }
    
    const candidateSymbol = symbolCandidates[0]; // We expect only one symbol to be present
    const symbolCountsOnReels = [];
    const positions = [];

    let column = 0;
    while (column < reels.length) {
        const reel = reels[column];
        const newPositions: Position[] = [];
        for (let row = 0; row < reel.length; row++) {
            if (reel[row] === candidateSymbol) {
                newPositions.push({
                    column,
                    row
                });
            }
        }
        const newSymbols = reel.filter(symbol => symbol === candidateSymbol);
        const newSymbolsCount = newSymbols.length;

        if (newSymbolsCount === 0) {
            column++;
            continue;
        }

        symbolCountsOnReels.push(newSymbolsCount);
        positions.push(...newPositions);
        column++;
    }

    const oakIndex = symbolCountsOnReels.length;
    const winMultiplierFromPaytable = getBookWinMultiplierFromPaytable(
        candidateSymbol, oakIndex, payTable, reels.length
    );

    const symbolCoinsWon = symbolCountsOnReels.reduce(
        (previousValue, currentValue) => previousValue * currentValue, winMultiplierFromPaytable
    );

    const win = precisionMoneyMapper(symbolCoinsWon * coin);

    return {
        symbol: candidateSymbol,
        win: win,
    };
}

function filterUniqueSymbols < TSymbol > (reel: TSymbol[]) {
    return reel.filter((value, index) => {
        return reel.indexOf(value) === index;
    });
}

function getBookWinMultiplierFromPaytable<TSymbol extends string | number | symbol>(symbol: TSymbol,
    oakIndex: number,
    payTable: Record<TSymbol, number[]>,
    reelsCount: number): number {
const payTableEntryIndex = oakIndex - 1;
return payTableEntryIndex < 0 || payTable[symbol][payTableEntryIndex] === undefined
    ? 1
    : payTable[symbol][payTableEntryIndex];
}
