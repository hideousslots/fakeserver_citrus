import {mathConfig} from "./config/mathConfig";
import {spin, SpinResult} from "./spin";
import {IntegerRng} from "../../../common/rng/IntegerRng";
import GameProfilesRegistry from "./GameProfilesRegistry";
import {Distribution} from "../../../common/distributions/Distribution";
import {GameFeature} from "./pickGameFeature";

//NB This is a copy and rewrite of runRespinsSessions to allow a cleanish way to ask spin to use 'bonusBuy' mode
export function runCoinBonusBuySpinSession(integerRng: IntegerRng,
                                  bet: number,
                                  precisionMoneyMapper: (a: number) => number,
                                  initialAccumulatedRoundWin: number,
                                  reelSetsDistributions: { [profileId: string]: { [waysLevel: string]: Distribution<number> } },
                                  featuresDistributions: { [profileId: string]: { [waysLevel: string]: Distribution<GameFeature> } },
                                  gameProfilesRegistry: GameProfilesRegistry,
                                  freeSpinIndex: number,
                                  reelLengthsForSpins: number[][],
                                  specialModeId: string): SpinResult[] {

    const coin = precisionMoneyMapper(bet / mathConfig.coinsPerBet);

    const spinResults = [];

    let accumulatedRespinsSessionWin = 0;
    let accumulatedRoundWin = initialAccumulatedRoundWin;
    let accumulatedScattersCollected = 0;

    const accumulatedRoundWinBetMultiple = precisionMoneyMapper(accumulatedRoundWin / bet);
    const currentGameProfile = gameProfilesRegistry.getUpdatedGameProfile(accumulatedRoundWinBetMultiple);

    const spinsRequired = reelLengthsForSpins.length;

    for(let spinIndex: number = 0; spinIndex < spinsRequired; spinIndex++) {
        let reelLengths = reelLengthsForSpins[spinIndex];
        const spinResult = spin(integerRng, coin, precisionMoneyMapper, reelLengths, reelSetsDistributions, featuresDistributions,
            currentGameProfile, specialModeId, accumulatedRespinsSessionWin, accumulatedRoundWin, accumulatedScattersCollected);

        spinResult.freeSpinIndex = freeSpinIndex;

        if(spinIndex < (spinsRequired + 1)) {
            spinResult.newReelLengths = reelLengthsForSpins[spinIndex + 1];
        } else {
            spinResult.newReelLengths = mathConfig.baseGameInitialReelLengths;
        }

        accumulatedRespinsSessionWin = precisionMoneyMapper(accumulatedRespinsSessionWin + spinResult.win);
        accumulatedRoundWin = precisionMoneyMapper(accumulatedRoundWin + spinResult.win);
        accumulatedScattersCollected = accumulatedScattersCollected + spinResult.scatters.collected;
        if(spinIndex < (spinsRequired - 1)) {
            spinResult.isRespinTriggered = true;
        }
        spinResults.push(spinResult);
    }

    return spinResults;
}
