import rng from "@slotify/gdk/lib/rng/rng";
import {getLastElement} from "../../../common/arrays/getLast";
import {pickValueFromDistribution} from "../../../common/distributions/pickValueFromDistribution";
import FloatSourcedIntegerRng from "../../../common/rng/FloatSourcedIntegerRng";
import {mathConfig} from "./config/mathConfig";
import GameProfilesRegistry from "./GameProfilesRegistry";
import {runRespinsSession} from "./runRespinsSession";

export default function play(bet: number) {

    const precisionMoneyMapper = money => Number(money.toFixed(8));

    const integerRng = new FloatSourcedIntegerRng(() => rng());

    const initialBaseGameProfile = pickValueFromDistribution(integerRng, mathConfig.baseGameProfilesDistribution);
    const baseGameProfilesRegistry = new GameProfilesRegistry(mathConfig.baseGameProfileFallbacks, initialBaseGameProfile);

    const baseGameRespinsSession = runRespinsSession(integerRng, bet, precisionMoneyMapper, 0, mathConfig.baseGameInitialReelLengths,
        mathConfig.baseGameReelSetsDistributions, mathConfig.baseGameFeaturesDistributions, baseGameProfilesRegistry, 0);
    let accumulatedRoundWin = getLastElement(baseGameRespinsSession).accumulatedRoundWin;

    const collectedScattersAmount = baseGameRespinsSession
        .reduce((scattersAmount, result) => scattersAmount + result.scatters.positions.length, 0);

    const bonusGameRespinsSessions = [];
    if (collectedScattersAmount >= mathConfig.scattersTriggeringBonusAmount) {

        const initialBonusGameProfile = pickValueFromDistribution(integerRng, mathConfig.bonusGameProfilesDistribution);
        let bonusGameProfilesRegistry = new GameProfilesRegistry(mathConfig.bonusGameProfileFallbacks, initialBonusGameProfile);
        let currentBonusGameReelLengths = mathConfig.bonusGameInitialReelLengths;

        for (let freeSpinIndex = 0; freeSpinIndex < mathConfig.bonusGameFreeSpinsAmount; freeSpinIndex++) {

            const bonusGameRespinsSession = runRespinsSession(integerRng, bet, precisionMoneyMapper, accumulatedRoundWin,
                currentBonusGameReelLengths, mathConfig.bonusGameReelSetsDistributions, mathConfig.bonusGameFeaturesDistributions, bonusGameProfilesRegistry, freeSpinIndex);

            bonusGameRespinsSessions.push(bonusGameRespinsSession);
            accumulatedRoundWin = getLastElement(bonusGameRespinsSession).accumulatedRoundWin;
            currentBonusGameReelLengths = getLastElement(bonusGameRespinsSession).newReelLengths;
        }
    }

    return {
        win: precisionMoneyMapper(accumulatedRoundWin),
        data: {baseGameRespinsSession, bonusGameRespinsSessions}
    };
}
