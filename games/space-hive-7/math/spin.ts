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
import {GameFeature, pickGameFeature, pickGameFeatureFromDistribution} from "./pickGameFeature";
import {InstantPrizeCoin, pickInstantPrizeCoins} from "./pickInstantPrizeCoins";
import {ExpandedInstantPrizeCoin,  pickExpandedInstantPrizeCoins} from "./pickExpandedInstantPrizeCoins";
import {pickBeeWildPositions} from "./pickBeeWildPositions";
import {getWaysAmountLevel} from "./getWaysAmountLevel";
import getSymbolsPositions from "../../../common/reels/getSymbolsPositions";
import {Distribution} from "../../../common/distributions/Distribution";
import {modifyReelsForReplace, expandFeatureReels, calculateBookWins} from "./bookWins";
import {addScatterSymbols} from "./addScatterSymbols";
import { SpecialModeType } from "./config/SpecialModeType";
import { pushWin } from "./pushWin";


export interface ScatterInfo {
    collected: number;
    positions: Position[];
}

export interface SpinResult {
    wildFeature: boolean,
    reels: SpaceHiveSymbol[][],
    reelsExpanded: SpaceHiveSymbol[][],
    waysWins: WaysWin<SpaceHiveSymbol>[],
    reverseWaysWins: WaysWin<SpaceHiveSymbol>[],
    replaceFeature: WaysWin<SpaceHiveSymbol>[],
    beeWildPositions?: Position[]
    instantPrizeCoins?: InstantPrizeCoin[];
    expandedInstantPrizeData?: ExpandedInstantPrizeCoin[];
    fakebee: boolean;
    isRespinTriggered: boolean;
    columnsToExpand: number[];
    newReelLengths: number[];
    scatters: ScatterInfo;
    win: number;
    accumulatedRespinsSessionWin: number;
    accumulatedRoundWin: number;
    freeSpinIndex: number;
    maxWinCapReached: boolean;
    debug: any;
}

export function spin(integerRng: IntegerRng,
                     bet: number,
                     coin: number,
                     precisionMoneyMapper: (a: number) => number,
                     reelLengths: number[],
                     reelSetsDistributions: { [profileId: string]: { [waysLevel: string]: Distribution<number> } },
                     featuresDistributions: { [profileId: string]: { [waysLevel: string]: Distribution<GameFeature> } },
                     gameProfile: string,
                     specialModeType: SpecialModeType,
                     initialAccumulatedRespinsSessionWin: number,
                     initialAccumulatedRoundWin: number,
                     initialScatters: number): SpinResult {

    const currentMaths =  mathConfig();
    const waysAmount = reelLengths.reduce((previousWaysAmount, currentReelLength) => previousWaysAmount * currentReelLength, 1);
    const waysAmountLevel = getWaysAmountLevel(waysAmount);
    let fakeBee = false;

    //debug info
    let debug = null;

    //Special mode spins enforce some changes
    let reelSetIndex: number;
    
    if((specialModeType === SpecialModeType.BonusBuySpin) || (specialModeType === SpecialModeType.CoinBonusBuyFirstSpin) || (specialModeType === SpecialModeType.CoinBonusBuySubsequentSpin)) {
        //Force non win reel set
        reelSetIndex = 6;
    } else {
        reelSetIndex = pickReelSetIndex(integerRng, reelSetsDistributions, gameProfile, waysAmountLevel);
    }

    const indexReels = generateReels(integerRng, currentMaths.reelSets[reelSetIndex], reelLengths) as SpaceHiveSymbol[][];

    //Special mode spins enforce some other changes

    if((specialModeType === SpecialModeType.BonusBuySpin) || (specialModeType === SpecialModeType.CoinBonusBuyFirstSpin)) {
        //Pick three reels to apply a scatter on

        const possibleReels: number[] = [];
        for(let i = 0 ; i < indexReels.length; i++) {
            possibleReels.push(i);
        }

        for(let r=0;r < 3; r++) {
            
            const thisReelIndex = possibleReels.splice(integerRng.randomInteger(possibleReels.length), 1)[0];
            const thisRowIndex = integerRng.randomInteger(indexReels[thisReelIndex].length);
            indexReels[thisReelIndex][thisRowIndex] = SpaceHiveSymbol.Scatter;
        }
    }
    
    const featureReels = indexReels.map(reel => reel.slice());
    let featureType;
    let payload;
    if((specialModeType === SpecialModeType.BonusBuySpin) || (specialModeType === SpecialModeType.CoinBonusBuyFirstSpin)) {
        featureType = FeatureType.None;
        payload = 0;
    } else if (specialModeType === SpecialModeType.CoinBonusBuySubsequentSpin) {
        const feature: GameFeature = pickGameFeatureFromDistribution(integerRng, currentMaths.bonusBuyCoinGameProfileDistribution);

        featureType = feature.featureType;
        payload = feature.payload;    
    } else {
        const feature: GameFeature = pickGameFeature(integerRng, featuresDistributions, gameProfile, waysAmountLevel);

        featureType = feature.featureType;
        payload = feature.payload;
    }

    let featureReelsExpanded = null;
    let wilds = false;
    let beeWildPositions = null;
    let instantPrizeCoins = null;
    let expandedInstantPrizeData = null;
    let replaceWins = null;           
  
    switch (featureType) {
        case FeatureType.GuaranteedWin: {
            
            pushWin(integerRng, featureReels, payload.symbol, payload.oak, payload.waysAmount);
            debug = payload;
            break;
        }
        case FeatureType.BeeWilds: {
            
            wilds = true;
            beeWildPositions = pickBeeWildPositions(integerRng, indexReels, payload);
            beeWildPositions.forEach(
                position => featureReels[position.column][position.row] = SpaceHiveSymbol.Wild);
            break;
        }
        case FeatureType.InstantPrize: {
            
            instantPrizeCoins = pickInstantPrizeCoins(integerRng, bet, precisionMoneyMapper, "base", payload, indexReels);
            instantPrizeCoins.forEach(
                coinsPrize => featureReels[coinsPrize.position.column][coinsPrize.position.row] = SpaceHiveSymbol.PlaceHolder);
            break;
        }
        case FeatureType.ExpandedInstantPrize: {
            
            expandedInstantPrizeData = {
                 coinDataBefore: [],
                 coinDataAfter: [],
                 reelsBefore: [],
                 reelsAfter: [],
            };

            const expandedInstantPrizeCoins = pickExpandedInstantPrizeCoins(integerRng, bet, precisionMoneyMapper, "bonus", payload, indexReels);
            expandedInstantPrizeCoins.forEach(coinsPrize => {
                featureReels[coinsPrize.position.column][coinsPrize.position.row] = SpaceHiveSymbol.PlaceHolder;
                expandedInstantPrizeData.coinDataBefore.push(coinsPrize);
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
                        expandedInstantPrizeData.coinDataAfter.push(instantPrize);
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
                currentMaths.bookPayTable as unknown as Record<SpaceHiveSymbol, number[]>,
                coin,
                precisionMoneyMapper
                );
            break;
        }
        
        case FeatureType.FakeBee: {
            
            fakeBee = true;
            break;
        }

        case FeatureType.Scatter: {
            
            addScatterSymbols(integerRng, featureReels, initialScatters, payload);
            break;
        }
    }    

    const waysWins = calculateWaysWins(
        featureReels,
        currentMaths.payTable as unknown as Record<SpaceHiveSymbol, number[]>,
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
        newReelLengths[column] = Math.min(reelLengths[column] + 1, currentMaths.maxExpandedReelLengths[column]));

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
            : expandedInstantPrizeData.coinDataAfter.reduce((previousTotalWin, coinPrize) => previousTotalWin + coinPrize.win, 0))
        + (replaceWins === null ? 0 : replaceWins.win);
    
    //This is the best point at which to cap any winnings over and above the win cap.

    //1) Build up the full spin result

    const thisResult: SpinResult = {
        wildFeature: wilds,
        reels: featureReels,
        reelsExpanded: featureReelsExpanded,
        waysWins: waysWins,
        reverseWaysWins: reverseWaysWins,
        beeWildPositions: beeWildPositions,
        instantPrizeCoins: instantPrizeCoins,
        expandedInstantPrizeData: expandedInstantPrizeData,
        replaceFeature: replaceWins,
        fakebee: fakeBee,
        isRespinTriggered: columnsToExpand.length > 0,
        columnsToExpand: columnsToExpand,
        newReelLengths: newReelLengths,
        scatters: {collected: initialScatters + collectedScattersPositions.length, positions: collectedScattersPositions},
        win: precisionMoneyMapper(win),
        accumulatedRespinsSessionWin: precisionMoneyMapper(initialAccumulatedRespinsSessionWin + win),
        accumulatedRoundWin: precisionMoneyMapper(initialAccumulatedRoundWin + win),
        freeSpinIndex: 0,
        maxWinCapReached: false,
        debug: debug,
    };

    //If the max winning breach the wincap, we need to flag that, lock the wins, and prevent respin retriggering
    //NB Need to determine if max win is a multiplier of the bet or a value
    
    const maxCapValue: number = bet * currentMaths.maxWinMultiplier;

    if(thisResult.accumulatedRoundWin >= maxCapValue) {
        //Reached cap, flag it and limit win

        thisResult.maxWinCapReached = true;

        //Find how much of this win was required to reach cap and use this as the achieved win

        const requiredWin: number = maxCapValue - initialAccumulatedRoundWin;

        //Recalculate spin win values

        thisResult.win = precisionMoneyMapper(requiredWin);
        thisResult.accumulatedRespinsSessionWin = precisionMoneyMapper(initialAccumulatedRespinsSessionWin + requiredWin);
        thisResult.accumulatedRoundWin = precisionMoneyMapper(maxCapValue);
    
        //Ensure no further respins

        thisResult.isRespinTriggered = false;

        //reel lengths will be reset in calling code
    }



    return thisResult;
}

// Instant Prize is calculated correctly, but we don't have the before and after data sent to client
// 