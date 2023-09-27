import {mathConfig} from "./config/mathConfig";
import {CitrusGotReelSymbol, CitrusGotReelSymbolValue, addWilds, expandWilds, stickWilds, LineWinDetails, addScatters, countScatters, returnSticky} from "./config/CitrusGotReelSymbol";
import {IntegerRng} from "../../../common/rng/IntegerRng";
import {Position} from "../../../common/reels/Position";
import { LineWinCalculator } from "./config/calculateLineWins";
import { createReels } from "./config/createReels";
import {pickValueFromDistribution} from "../../../common/distributions/pickValueFromDistribution";

export interface ScatterInfo {
    collected: number;
    positions: Position[];
}

export interface SpinResult {
    reelsBefore: CitrusGotReelSymbol[][],
    reelsAfter: CitrusGotReelSymbol[][],
    lineWins: LineWinDetails[],
    scatters: ScatterInfo;
    win: number;
    freeSpinIndex: number;
    debug: any;
}

export function spin(integerRng: IntegerRng,
    bet: number,
    coin: number,
    precisionMoneyMapper: (a: number) => number): SpinResult {

const currentMaths = mathConfig();
const scatterSymbols = pickValueFromDistribution(integerRng, currentMaths.baseGameScattersToAdd);

return generateSpin(bet, integerRng, currentMaths.baseGameHitRate, currentMaths.baseGameDistOffset, currentMaths.baseGameStopOffset, scatterSymbols as number, precisionMoneyMapper, "base");
}

export function bonusSpins(integerRng: IntegerRng,
    bet: number,
    coin: number,
    precisionMoneyMapper: (a: number) => number): SpinResult[] {

    const currentMaths = mathConfig();
    const bonusSpins = [];
    //generate initial round
    let bonusSpinRound = generateSpin(bet, integerRng, currentMaths.bonusGameHitRate, currentMaths.bonusGameDistOffset, currentMaths.bonusGameStopOffset, 0, precisionMoneyMapper, "bonus");
    bonusSpinRound.reelsAfter = stickWilds(bonusSpinRound.reelsAfter, integerRng);
    bonusSpins.push(bonusSpinRound);

    for(let x = 1; x < currentMaths.bonusGameFreeSpinsAmount; x++){
        bonusSpinRound = generateSpin(
            bet, 
            integerRng, 
            currentMaths.bonusGameHitRate, 
            currentMaths.bonusGameDistOffset, 
            currentMaths.bonusGameStopOffset, 
            0, 
            precisionMoneyMapper,
            "bonus",
            returnSticky(bonusSpinRound.reelsAfter));
        bonusSpinRound.reelsAfter = stickWilds(bonusSpinRound.reelsAfter, integerRng);
        bonusSpins.push(bonusSpinRound);
    }

    return bonusSpins;
}

function generateSpin(
        bet: number,
        integerRng: IntegerRng,
        hitrate: any,
        distOffset: any,
        stopOffset: any,
        scatterSymbols: number = 0,
        precisionMoneyMapper: (a: number) => number,
        context: "base" | "bonus",
        reelGrid?: CitrusGotReelSymbol[][],
        ): SpinResult {

    const currentMaths =  mathConfig();
    
    let rows: number, cols: number, initialReels: CitrusGotReelSymbol[][];

    if (reelGrid) {
        cols = reelGrid.length;
        rows = reelGrid[0].length;
        initialReels = [...reelGrid]; // Make a shallow copy of reelGrid
    } else {
        rows = 5; 
        cols = 6; 
        initialReels = Array.from({ length: cols }, () => Array.from({ length: rows }, () => undefined));
    }

    const addedWilds = addWilds(integerRng, initialReels, context);
    let expandedWilds = expandWilds(addedWilds);

    if(scatterSymbols > 0) {
    expandedWilds = addScatters(expandedWilds, scatterSymbols);
    }

    const hitrateControl: number = pickValueFromDistribution(integerRng, hitrate);
    const symbolDistributionOffset: number  = pickValueFromDistribution(integerRng, distOffset);
    const stop: number = pickValueFromDistribution(integerRng, stopOffset);
    const indexReels = createReels(6, 5, symbolDistributionOffset, 0.5, hitrateControl, currentMaths.lineDefines, stop, expandedWilds) as CitrusGotReelSymbol[][];
    const initialGrid = generateInitialReelGrid(indexReels, addedWilds);

    const scatters = scatterSymbols > 0 ? countScatters(indexReels) : {collected: 0, positions: []};

    const CalcLineWins = LineWinCalculator.getInstance();
    const lineWins = CalcLineWins.calculateLineWins(indexReels, bet); 
    const win = lineWins.reduce((previousTotalWin, waysWin) => previousTotalWin + waysWin.winAmount, 0);

    return {
        reelsBefore: initialGrid,
        reelsAfter: indexReels,
        lineWins: lineWins,
        scatters: scatters,
        win: precisionMoneyMapper(win),
        freeSpinIndex: 0,
        debug: false,
    };
}

//reconstruct an initial reel grid
function generateInitialReelGrid(
    generatedSymbols: CitrusGotReelSymbol[][],
    initialWilds: CitrusGotReelSymbol[][]
  ): CitrusGotReelSymbol[][] {
    // clone the generatedSymbols array
    const resultGrid: CitrusGotReelSymbol[][] = JSON.parse(JSON.stringify(generatedSymbols));
  
    // Replace wild symbols in resultGrid with placeholders
    for (let i = 0; i < resultGrid.length; i++) {
      for (let j = 0; j < resultGrid[i].length; j++) {
        if (resultGrid[i][j].symbol === CitrusGotReelSymbolValue.Wild ||
            resultGrid[i][j].symbol === CitrusGotReelSymbolValue.DirectionalWild ||
            resultGrid[i][j].symbol === CitrusGotReelSymbolValue.CollectorWild ||
            resultGrid[i][j].symbol === CitrusGotReelSymbolValue.PayerWild) {
          resultGrid[i][j] = { symbol: CitrusGotReelSymbolValue.PlaceHolder };
        }
      }
    }
  
    // Overlay initialWilds onto resultGrid
    for (let i = 0; i < initialWilds.length; i++) {
      for (let j = 0; j < initialWilds[i].length; j++) {
        if (!initialWilds[i][j])
            break;

        if (initialWilds[i][j].symbol === CitrusGotReelSymbolValue.Wild ||
            initialWilds[i][j].symbol === CitrusGotReelSymbolValue.DirectionalWild ||
            initialWilds[i][j].symbol === CitrusGotReelSymbolValue.CollectorWild ||
            initialWilds[i][j].symbol === CitrusGotReelSymbolValue.PayerWild) {
          resultGrid[i][j] = initialWilds[i][j];
        }
      }
    }

    const nonWildSymbols: CitrusGotReelSymbolValue[] = [
        CitrusGotReelSymbolValue.Ten,
        CitrusGotReelSymbolValue.Jack,
        CitrusGotReelSymbolValue.Queen,
        CitrusGotReelSymbolValue.King,
        CitrusGotReelSymbolValue.Ace,
        CitrusGotReelSymbolValue.High1,
        CitrusGotReelSymbolValue.High2,
        CitrusGotReelSymbolValue.High3,
        CitrusGotReelSymbolValue.High4,
        CitrusGotReelSymbolValue.High5,
        ];

    // Replace any remaining Placeholders with random symbols
    for (let i = 0; i < resultGrid.length; i++) {
        for (let j = 0; j < resultGrid[i].length; j++) {
          if (resultGrid[i][j].symbol === CitrusGotReelSymbolValue.PlaceHolder) {
            const randomSymbol = nonWildSymbols[Math.floor(Math.random() * nonWildSymbols.length)];
            resultGrid[i][j] = { symbol: randomSymbol } as CitrusGotReelSymbol;
        }
      }

    return resultGrid;
  }
}