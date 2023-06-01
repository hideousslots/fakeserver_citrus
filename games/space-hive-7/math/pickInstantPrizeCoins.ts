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
                                      coin: number,
                                      precisionMoneyMapper: (a: number) => number,
                                      gameType: ("base" | "bonus"),
                                      gameProfileIndex: number,
                                      reels: SpaceHiveSymbol[][]): InstantPrizeCoin[] {

    const bet = precisionMoneyMapper(coin * mathConfig.coinsPerBet);

    const availablePositions = getPositionsOnReels(reels, mathConfig.instantPrizeCoinsConfig.availableColumns);

    const instantPrizeCoins = [];

    const profile = mathConfig.instantPrizeCoinsConfig[`${gameType}GameProfiles`][gameProfileIndex];

    let totalBetMultiplier = 0;

    profile.fixedBetMultipliers.forEach(
        betMultiplier => {
            totalBetMultiplier += betMultiplier;
            appendCoinPosition(integerRng, availablePositions, instantPrizeCoins, betMultiplier, precisionMoneyMapper, bet);
        });

    profile.randomBetMultiplierDistributionsIndices.forEach(distributionIndex => {

        const distribution = totalBetMultiplier < profile.threshold
            ? mathConfig.instantPrizeCoinsConfig.betMultipliersDistributions[distributionIndex]
            : mathConfig.instantPrizeCoinsConfig.betMultipliersDistributions[profile.fallbackDistributionIndex];

        const betMultiplier = pickValueFromDistribution(integerRng, distribution);

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
