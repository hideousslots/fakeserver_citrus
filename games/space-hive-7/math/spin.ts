import {generateReels} from "../../../common/reels/generateReels";
import {mathConfig} from "./config/mathConfig";
import {SpaceHiveSymbol} from "./config/SpaceHiveSymbol";
import {calculateWaysWins} from "../../../common/wins/ways/calculateWaysWins";
import {calculateReverseWins} from "./claculateReverseWins";
import {IntegerRng} from "../../../common/rng/IntegerRng";
import {WaysWin} from "../../../common/wins/ways/WaysWin";
import {filterDistinctElements} from "../../../common/arrays/filterDistinctElements";
import {pickReelSetIndex} from "./pickReelSetIndex";
import {FeatureType} from "./config/FeatureType";
import {Position} from "../../../common/reels/Position";
import {GameFeature, pickGameFeature} from "./pickGameFeature";
import {InstantPrizeCoin, pickInstantPrizeCoins} from "./pickInstantPrizeCoins";
import {ExpandedInstantPrizeCoin, ExpandedInstantPrizeCoinData, pickExpandedInstantPrizeCoins} from './pickExpandedInstantPrizeCoins';
import {pickBeeWildPositions} from "./pickBeeWildPositions";
import {getWaysAmountLevel} from "./getWaysAmountLevel";
import getSymbolsPositions from "../../../common/reels/getSymbolsPositions";
import {Distribution} from "../../../common/distributions/Distribution";
import {modifyReelsForReplace, expandFeatureReels, calculateBookWins} from "./bookWins";

export interface ScatterInfo {
    collected: number;
    positions: Position[];
}

export interface SpinResult {
    reels: SpaceHiveSymbol[][],
    reelsExpanded: SpaceHiveSymbol[][],
    waysWins: WaysWin<SpaceHiveSymbol>[],
    reverseWaysWins: WaysWin<SpaceHiveSymbol>[],
    replaceFeature: WaysWin<SpaceHiveSymbol>[],
    beeWildPositions?: Position[]
    instantPrizeCoins?: InstantPrizeCoin[];
    expandedInstantPrizeData?: ExpandedInstantPrizeCoin[];
    isRespinTriggered: boolean;
    columnsToExpand: number[];
    newReelLengths: number[];
    scatters: ScatterInfo;
    win: number;
    accumulatedRespinsSessionWin: number;
    accumulatedRoundWin: number;
    freeSpinIndex: number;
}

export function spin(integerRng: IntegerRng,
                     coin: number,
                     precisionMoneyMapper: (a: number) => number,
                     reelLengths: number[],
                     reelSetsDistributions: { [profileId: string]: { [waysLevel: string]: Distribution<number> } },
                     featuresDistributions: { [profileId: string]: { [waysLevel: string]: Distribution<GameFeature> } },
                     gameProfile: string,
                     initialAccumulatedRespinsSessionWin: number,
                     initialAccumulatedRoundWin: number,
                     initialScatters: number): SpinResult {

    const waysAmount = reelLengths.reduce((previousWaysAmount, currentReelLength) => previousWaysAmount * currentReelLength, 1);
    const waysAmountLevel = getWaysAmountLevel(waysAmount);

    const reelSetIndex = pickReelSetIndex(integerRng, reelSetsDistributions, gameProfile, waysAmountLevel);

    const indexReels = generateReels(integerRng, mathConfig.reelSets[reelSetIndex], reelLengths);

    const featureReels = indexReels.map(reel => reel.slice());
    const {featureType, payload} = pickGameFeature(integerRng, featuresDistributions, gameProfile, waysAmountLevel);
    
    let featureReelsExpanded = null;
    let beeWildPositions = null;
    let instantPrizeCoins = null;
    let expandedInstantPrizeData = null;
    let replaceWins = null;           
  
    switch (featureType) {
        case FeatureType.BeeWilds: {
            beeWildPositions = pickBeeWildPositions(integerRng, indexReels, payload);
            beeWildPositions.forEach(
                position => featureReels[position.column][position.row] = SpaceHiveSymbol.Wild);
            break;
        }
        case FeatureType.InstantPrize: {
            instantPrizeCoins = pickInstantPrizeCoins(integerRng, coin, precisionMoneyMapper, "base", payload, indexReels);
            instantPrizeCoins.forEach(
                coinsPrize => featureReels[coinsPrize.position.column][coinsPrize.position.row] = SpaceHiveSymbol.PlaceHolder);
            break;
        }
        case FeatureType.ExpandedInstantPrize: {

            expandedInstantPrizeData = {
                 coinData: [],
                 reelsBefore: [],
                 reelsAfter: []
            };

            let expandedInstantPrizeCoins = pickExpandedInstantPrizeCoins(integerRng, coin, precisionMoneyMapper, "bonus", payload, indexReels);
            expandedInstantPrizeCoins.forEach(coinsPrize => {
                featureReels[coinsPrize.position.column][coinsPrize.position.row] = SpaceHiveSymbol.PlaceHolder;
            });
            
            //Array Of Column Totals
            const columnWinTotal = Array(reelLengths.length).fill(0);
            expandedInstantPrizeCoins.forEach(coinsPrize => {
                const { position, win } = coinsPrize;
                const { column } = position;
                columnWinTotal[column] += win;
            });
            
            // Create Matrix after feature
            featureReelsExpanded = featureReels.map(row => [...row]);
            expandedInstantPrizeData.reelsBefore = featureReels.map(row => [...row]);
            featureReelsExpanded.forEach((column, columnIndex) => {
                if (column.includes(SpaceHiveSymbol.PlaceHolder)) {
                    featureReelsExpanded[columnIndex] = Array(column.length).fill(SpaceHiveSymbol.PlaceHolder);
                }
            });
            expandedInstantPrizeData.reelsAfter = featureReelsExpanded.map(row => [...row]);
            
            // Recreate Instant Prize Array

            featureReelsExpanded.forEach((column, columnIndex) => {
                column.forEach((symbol, rowIndex) => {
                    if (symbol === SpaceHiveSymbol.PlaceHolder) {
                        const win = columnWinTotal[columnIndex];
                        const position = { column: columnIndex, row: rowIndex };
                        const instantPrize = { betMultiplier: win, win, position };
                        expandedInstantPrizeData.coinData.push(instantPrize);
                    }
                });
            });
            break;
        }

        case FeatureType.BookReplacement: {
            modifyReelsForReplace(integerRng, payload, featureReels);
            featureReelsExpanded = expandFeatureReels(featureReels, payload);
            replaceWins = calculateBookWins(
                featureReelsExpanded,
                mathConfig.bookPayTable as unknown as Record<SpaceHiveSymbol, number[]>,
                coin,
                precisionMoneyMapper
                )
            break;
        }
        
    }    

    const waysWins = calculateWaysWins(
        featureReels,
        mathConfig.payTable as unknown as Record<SpaceHiveSymbol, number[]>,
        symbol => symbol === SpaceHiveSymbol.Wild,
        coin,
        precisionMoneyMapper);

    const reverseWaysWins = calculateReverseWins(waysWins, featureReels, coin, precisionMoneyMapper);

    const columnsToExpand = filterDistinctElements([...waysWins, ...reverseWaysWins]
        .flatMap(win => {
            return win.positions;
        })
        .map(position => position.column))
        .sort();

    const newReelLengths = [...reelLengths];
    columnsToExpand.forEach(column =>
        newReelLengths[column] = Math.min(reelLengths[column] + 1, mathConfig.maxExpandedReelLengths[column]));

    const collectedScattersPositions = getSymbolsPositions(featureReels, SpaceHiveSymbol.Scatter);

    const win =
        waysWins.reduce(
            (previousTotalWin, waysWin) => previousTotalWin + waysWin.win, 0)
        + reverseWaysWins.reduce(
            (previousTotalWin, waysWin) => previousTotalWin + waysWin.win, 0)
        + (instantPrizeCoins === null
            ? 0
            : instantPrizeCoins.reduce((previousTotalWin, coinPrize) => previousTotalWin + coinPrize.win, 0))
        + (expandedInstantPrizeData === null
            ? 0
            : expandedInstantPrizeData.coinData.reduce((previousTotalWin, coinPrize) => previousTotalWin + coinPrize.win, 0))
        + (replaceWins === null ? 0 : replaceWins.win);
       
    return {
        reels: featureReels,
        reelsExpanded: featureReelsExpanded,
        waysWins: waysWins,
        reverseWaysWins: reverseWaysWins,
        beeWildPositions: beeWildPositions,
        instantPrizeCoins: instantPrizeCoins,
        expandedInstantPrizeData: expandedInstantPrizeData,
        replaceFeature: replaceWins,
        isRespinTriggered: columnsToExpand.length > 0,
        columnsToExpand: columnsToExpand,
        newReelLengths: newReelLengths,
        scatters: {collected: initialScatters + collectedScattersPositions.length, positions: collectedScattersPositions},
        win: precisionMoneyMapper(win),
        accumulatedRespinsSessionWin: precisionMoneyMapper(initialAccumulatedRespinsSessionWin + win),
        accumulatedRoundWin: precisionMoneyMapper(initialAccumulatedRoundWin + win),
        freeSpinIndex: 0
    };
}

// If I'm supply IntegerRNG as an argument and using it several times in a function, is it being redrawn every time?
// Instant Prize is calculated correctly, but we don't have the before and after data sent to client
// 