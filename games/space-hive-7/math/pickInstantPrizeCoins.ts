import {IntegerRng} from "../../../common/rng/IntegerRng";
import {Position} from "../../../common/reels/Position";
import {mathConfig} from "./config/mathConfig";
import {getPositionsOnReels} from "./getPositionsOnReels";
import {SpaceHiveSymbol} from "./config/SpaceHiveSymbol";
import {pickValueFromDistribution} from "../../../common/distributions/pickValueFromDistribution";

export interface InstantPrizeCoin {
    betMultiplier: number,
    win: number,
    position: Position,
}

export function pickInstantPrizeCoins(integerRng: IntegerRng,
                                      bet: number,
                                      precisionMoneyMapper: (a: number) => number,
                                      gameType: ("base" | "bonus"),
                                      gameProfileIndex: number,
                                      reels: SpaceHiveSymbol[][]): InstantPrizeCoin[] {

    const currentMaths =  mathConfig();

    const availablePositions = getPositionsOnReels(reels, currentMaths.instantPrizeCoinsConfig.availableColumns);

    const instantPrizeCoins = [];

    const profile = currentMaths.instantPrizeCoinsConfig[`${gameType}GameProfiles`][gameProfileIndex];

    let totalBetMultiplier = 0;

    profile.fixedBetMultipliers.forEach(
        betMultiplier => {
            totalBetMultiplier += betMultiplier;
            appendCoinPosition(integerRng, availablePositions, instantPrizeCoins, betMultiplier, precisionMoneyMapper, bet);
        });

    profile.randomBetMultiplierDistributionsIndices.forEach(distributionIndex => {

        const distribution = totalBetMultiplier < profile.threshold
            ? currentMaths.instantPrizeCoinsConfig.betMultipliersDistributions[distributionIndex]
            : currentMaths.instantPrizeCoinsConfig.betMultipliersDistributions[profile.fallbackDistributionIndex];

        const betMultiplier: number = pickValueFromDistribution(integerRng, distribution);

        if (betMultiplier) { //is this appending 0 value coins? maybe if (betMultiplier != 0)
            totalBetMultiplier += betMultiplier;
            appendCoinPosition(integerRng, availablePositions, instantPrizeCoins, betMultiplier, precisionMoneyMapper, bet);
        }
    });

    return instantPrizeCoins;
}

function appendCoinPosition(integerRng: IntegerRng,
                            availablePositions: Position[],
                            instantPrizeCoins: InstantPrizeCoin[],
                            betMultiplier: number,
                            precisionMoneyMapper: (a: number) => number,
                            bet: number) {

    const positionIndex = integerRng.randomInteger(availablePositions.length);

    instantPrizeCoins.push(
        {
            betMultiplier: betMultiplier,
            win: precisionMoneyMapper(betMultiplier * bet),
            position: availablePositions[positionIndex],
        });

    availablePositions.splice(positionIndex, 1);
}
