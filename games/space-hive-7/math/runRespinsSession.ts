import {mathConfig} from "./config/mathConfig";
import {spin, SpinResult} from "./spin";
import {IntegerRng} from "../../../common/rng/IntegerRng";
import GameProfilesRegistry from "./GameProfilesRegistry";
import {Distribution} from "../../../common/distributions/Distribution";
import {GameFeature} from "./pickGameFeature";

export function runRespinsSession(integerRng: IntegerRng,
                                  bet: number,
                                  precisionMoneyMapper: (a: number) => number,
                                  initialAccumulatedRoundWin: number,
                                  initialReelLengths: number[],
                                  reelSetsDistributions: { [profileId: string]: { [waysLevel: string]: Distribution<number> } },
                                  featuresDistributions: { [profileId: string]: { [waysLevel: string]: Distribution<GameFeature> } },
                                  gameProfilesRegistry: GameProfilesRegistry,
                                  freeSpinIndex: number): SpinResult[] {

    const coin = precisionMoneyMapper(bet / mathConfig.coinsPerBet);

    const spinResults = [];

    let accumulatedRespinsSessionWin = 0;
    let accumulatedRoundWin = initialAccumulatedRoundWin;
    let accumulatedScattersCollected = 0;

    let reelLengths = initialReelLengths;
    let spinResult;
    do {

        const accumulatedRoundWinBetMultiple = precisionMoneyMapper(accumulatedRoundWin / bet);
        const currentGameProfile = gameProfilesRegistry.getUpdatedGameProfile(accumulatedRoundWinBetMultiple);

        spinResult = spin(integerRng, coin, precisionMoneyMapper, reelLengths, reelSetsDistributions, featuresDistributions,
            currentGameProfile, accumulatedRespinsSessionWin, accumulatedRoundWin, accumulatedScattersCollected);

        spinResult.freeSpinIndex = freeSpinIndex;

        reelLengths = spinResult.newReelLengths;
        accumulatedRespinsSessionWin = precisionMoneyMapper(accumulatedRespinsSessionWin + spinResult.win);
        accumulatedRoundWin = precisionMoneyMapper(accumulatedRoundWin + spinResult.win);
        accumulatedScattersCollected = accumulatedScattersCollected + spinResult.scatters.collected;
        
        spinResults.push(spinResult);

    } while (spinResult.isRespinTriggered);

    return spinResults;
}
