
import { CitrusGotReelSymbol, CitrusGotReelSymbolValue, LineWinDetails, WildSymbols } from "./CitrusGotReelSymbol";
import { mathConfig } from "./mathConfig";
import { Position } from "../../../../common/reels/Position";

export class LineWinCalculator {
    private static instance: LineWinCalculator | null = null;
    private readonly payTable: Record<CitrusGotReelSymbolValue, number[]>;
    private readonly lineDefinitions: number[][];
    private currentMathConfig: any; 
    private reels: CitrusGotReelSymbol[][] | null = null;

    private constructor() {
        this.currentMathConfig = mathConfig();
        this.lineDefinitions = this.currentMathConfig.lineDefines;
        this.payTable = this.currentMathConfig.payTable;
    }

    public static getInstance(): LineWinCalculator {
        if (!LineWinCalculator.instance) {
            LineWinCalculator.instance = new LineWinCalculator();
        }
        return LineWinCalculator.instance;
    }

    public calculateLineWins(reels: CitrusGotReelSymbol[][], bet: number): LineWinDetails[] {
        if (!reels || reels.length === 0) {
            throw new Error("Invalid reel data");
        }

        this.reels = reels;
        const wins: LineWinDetails[] = this.lineDefinitions.map((line, index) => this.checkLineWin(line, bet, index)).filter(Boolean);

        this.reels = null;
        return wins;
    }

    private isWildSymbol(symbol: CitrusGotReelSymbolValue): boolean {
      if (WildSymbols.includes(symbol)) {
          return true;
      }
      else {
          return false;
      }
    }
  
    private checkLineWin = (lineDefinition: number[], bet: number, index: number): LineWinDetails | null => {
        if (!this.reels) {
          throw new Error("Invalid state: reels not set");
        }
      
        const positions: Position[] = [];
        let lineSymbol = this.reels[0][lineDefinition[0]];
        let isLineSymbolSet = !this.isWildSymbol(lineSymbol.symbol);
        let consecutiveWildCount = this.isWildSymbol(lineSymbol.symbol) ? 1 : 0;
        let overallMultiplier = "multiplier" in lineSymbol && lineSymbol.multiplier > 1 ? lineSymbol.multiplier : 0;
      
        positions.push({ row: lineDefinition[0], column: 0 });
        let matchCount = 1;
        
        for (let i = 1; i < lineDefinition.length; i++) {
          const currentSymbol = this.reels[i][lineDefinition[i]];
      
          if ("multiplier" in currentSymbol && currentSymbol.multiplier > 1) {
            overallMultiplier += currentSymbol.multiplier;
          }
          
          if (consecutiveWildCount === i) {
            if (this.isWildSymbol(currentSymbol.symbol)) {
              consecutiveWildCount++;
            }
          }
      
          if (isLineSymbolSet) {
            if (currentSymbol.symbol !== lineSymbol.symbol && !this.isWildSymbol(currentSymbol.symbol)) {
              break;
            }
          } else if (!this.isWildSymbol(currentSymbol.symbol)) {
            lineSymbol = currentSymbol;
            isLineSymbolSet = true;
          }
      
          matchCount++;
          positions.push({ row: lineDefinition[i], column: i });
        }
 //Lookup Win In Paytable
 let winAmount = this.lookupPayTable(lineSymbol.symbol, matchCount);
    
 // compare calculating wilds as top symbol
 if (consecutiveWildCount >= 3) {
     const asWilds = this.lookupPayTable(CitrusGotReelSymbolValue.High5, consecutiveWildCount);
     if (asWilds > winAmount) {
         winAmount = asWilds;
         lineSymbol.symbol = CitrusGotReelSymbolValue.High5;
         matchCount = consecutiveWildCount;
         positions.length = consecutiveWildCount;
     }
 }

 winAmount *= overallMultiplier > 0 ? overallMultiplier : 1;

 // Multiply the winAmount by the bet amount.
 winAmount *= bet;

 return winAmount > 0 ? {
   symbol: lineSymbol.symbol,
   lineNumber: index,
   matchCount,
   positions,
   winAmount,
   multiplier: overallMultiplier,
 } : null;      };
      

private lookupPayTable(symbol: CitrusGotReelSymbolValue, matchCount: number): number {
        const payTableEntry = this.payTable[symbol];
        if (!payTableEntry) {
            return 0;
        }

        const index = matchCount - 1;
        return payTableEntry[index] / this.currentMathConfig.coinsPerBet_main || 0;
    }

}
