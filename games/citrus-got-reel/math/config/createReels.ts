import { IntegerRng } from "../../../../common/rng/IntegerRng";
import { CitrusGotReelSymbol, CitrusGotReelSymbolValue, WildSymbols } from "./CitrusGotReelSymbol";

export function createReels(
  columns: number,
  rows: number,
  integerRng: IntegerRng,
  distributionOffset: number = 0.5,
  stackingOffset: number = 0.5,
  hitRateOffset: number = 0.5,
  lineDefines: number[][],
  stopReel: number = -1,
  existingReels?: CitrusGotReelSymbol[][]
): CitrusGotReelSymbol[][] {

  const reels = existingReels || Array.from({ length: columns }, () => []);
  const multiplier = 100000;
  const generateSymbol = (distOffset: number): CitrusGotReelSymbol => {
    let symbol: number;
    do {
      const weights: number[] = Array.from({ length: 10 }, (_, i) => {
        return Math.pow(i + 1, distOffset * 4 - 2);
      });
      const totalWeight = weights.reduce((acc, w) => acc + w, 0);
      let randomNum = integerRng.randomInteger(totalWeight);
      symbol = 0;
      for (let i = 0; i < weights.length; i++) {
        if (randomNum < weights[i]) {
          symbol = i;
          break;
        }
        randomNum -= weights[i];
      }
    } while (symbol === CitrusGotReelSymbolValue.Scatter);

    return { symbol: symbol as Exclude<CitrusGotReelSymbolValue, 
      CitrusGotReelSymbolValue.Wild | 
      CitrusGotReelSymbolValue.DirectionalWild | 
      CitrusGotReelSymbolValue.CollectorWild | 
      CitrusGotReelSymbolValue.PayerWild> };
  };

  const applyWinLineLogic = (col: number, row: number): CitrusGotReelSymbol => {
    let selectedSymbol: CitrusGotReelSymbolValue | null = null;
    const influencingSymbols: CitrusGotReelSymbol[] = [];
    
    for (const line of lineDefines) {
      if (line[col] !== row) continue;
      
      for (let i = 0; i < col; i++) {
        const symbol = reels[i][line[i]];
        if (!symbol) continue;
        influencingSymbols.push(symbol);
      }
      
      if (influencingSymbols.length === 0) continue;
      
      for (let i = influencingSymbols.length - 1; i >= 0; i--) {
        const isWild = WildSymbols.includes(influencingSymbols[i].symbol);
      
        if (!isWild) continue;
      
        if (i === 0) {
          influencingSymbols[i] = generateSymbol(distributionOffset);
          break;
        }
      
        influencingSymbols.splice(i, 1);
      }
    }
  
    
 
    const randomInteger = integerRng.randomInteger(multiplier);
    const shouldMatch = randomInteger < hitRateOffset * multiplier;

    const allSymbols = new Set(Array.from({ length: 10 }, (_, i) => i));
    const availableSymbols = [...allSymbols].filter(
      s => !influencingSymbols.some(is => is.symbol === s)
    );
  
    if (col === stopReel || !shouldMatch) {    
      if (availableSymbols.length > 0) {
        selectedSymbol = availableSymbols[integerRng.randomInteger(availableSymbols.length)];
      }
    }

    if (selectedSymbol === null) {
      if (influencingSymbols.length === 0) {
          selectedSymbol = generateSymbol(distributionOffset).symbol;
      } else if (shouldMatch) {
          selectedSymbol = influencingSymbols[integerRng.randomInteger(influencingSymbols.length)].symbol;
      } else { // shouldMatch is negative
          if (availableSymbols.length > 0) {
              selectedSymbol = availableSymbols[integerRng.randomInteger(availableSymbols.length)];
          } else {
              selectedSymbol = generateSymbol(distributionOffset).symbol; // default
          }
      }
    }
  
    return { 
      symbol: selectedSymbol as Exclude<CitrusGotReelSymbolValue, 
        CitrusGotReelSymbolValue.Wild | 
        CitrusGotReelSymbolValue.DirectionalWild | 
        CitrusGotReelSymbolValue.CollectorWild | 
        CitrusGotReelSymbolValue.PayerWild>,
    };
  };

for (let row = 0; row < rows; row++) {
    if (reels[0][row] === undefined) {
      reels[0][row] = generateSymbol(distributionOffset);
    }
}

for (let col = 1; col < columns; col++) {
    reels[col] = reels[col] || [];
    for (let row = 0; row < rows; row++) {
        if (reels[col][row] !== undefined) continue;
        let newSymbol: CitrusGotReelSymbol;
        
        const randomInteger = integerRng.randomInteger(multiplier);
        if (row > 0 && randomInteger < stackingOffset * multiplier && !WildSymbols.includes(reels[col][row - 1].symbol)) {
            newSymbol = reels[col][row - 1];
        } else {
            newSymbol = applyWinLineLogic(col, row);
        }
        
        // Ensure the symbol isn't a scatter
        while (newSymbol.symbol === CitrusGotReelSymbolValue.Scatter) {
            newSymbol = generateSymbol(distributionOffset);
        }
        
        reels[col][row] = newSymbol;
    }
}

  return reels;
}
