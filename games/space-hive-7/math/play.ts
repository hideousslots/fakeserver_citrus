import rng from "@slotify/gdk/lib/rng/rng";
import {getLastElement} from "../../../common/arrays/getLast";
import {pickValueFromDistribution} from "../../../common/distributions/pickValueFromDistribution";
import FloatSourcedIntegerRng from "../../../common/rng/FloatSourcedIntegerRng";
import {mathConfig} from "./config/mathConfig";
import GameProfilesRegistry from "./GameProfilesRegistry";
import {runRespinsSession} from "./runRespinsSession";
import {runBonusBuySpinSession} from "./runBonusBuySpinSession";
import { SpinResult } from "./spin";
import * as fs from 'fs';

export default function play(bet: number, action: string) {

    const precisionMoneyMapper = money => Number(money.toFixed(8));

    const integerRng = new FloatSourcedIntegerRng(() => rng());

    const initialBaseGameProfile = pickValueFromDistribution(integerRng, mathConfig.baseGameProfilesDistribution);
    const baseGameProfilesRegistry = new GameProfilesRegistry(mathConfig.baseGameProfileFallbacks, initialBaseGameProfile);

    //Handle normal and bonus buy modes separately

    let baseGameRespinsSession: SpinResult[];
    const bonusGameRespinsSessions = [];

    let accumulatedRoundWin;
    let bonusProfile;

    if(action == "main") {
        //Normal play
        bonusProfile =  mathConfig.bonusGameProfilesDistribution;
        baseGameRespinsSession = runRespinsSession(integerRng, bet, precisionMoneyMapper, 0, mathConfig.baseGameInitialReelLengths,
            mathConfig.baseGameReelSetsDistributions, mathConfig.baseGameFeaturesDistributions, baseGameProfilesRegistry, 0);
        baseGameRespinsSession[baseGameRespinsSession.length - 1].newReelLengths = [2,3,4,4,3,2];                               
    } else if(action == "bonusbuy") {
        //Bonus buy mode (use dead reels and force scatter)
        bonusProfile = mathConfig.bonusBuyGameProfilesDistribution;
        baseGameRespinsSession = runBonusBuySpinSession(integerRng, bet, precisionMoneyMapper, 0, mathConfig.baseGameInitialReelLengths,
            mathConfig.baseGameReelSetsDistributions, mathConfig.baseGameFeaturesDistributions, baseGameProfilesRegistry, 0, 'bonusbuyspin');    
        baseGameRespinsSession[baseGameRespinsSession.length - 1].newReelLengths = [2,3,4,4,3,2];                                
    } else if(action == "coinbonusbuy") {
        //Coin bonus buy mode (use dead reels and force scatter)

        //Special full path

        bonusProfile = mathConfig.bonusBuyGameProfilesDistribution;        
        baseGameRespinsSession = runBonusBuySpinSession(integerRng, bet, precisionMoneyMapper, 0, mathConfig.baseGameInitialReelLengths,
            mathConfig.baseGameReelSetsDistributions, mathConfig.baseGameFeaturesDistributions, baseGameProfilesRegistry, 0, 'coinbonusbuyspin_first');    
        let specialReelLengths = pickValueFromDistribution(integerRng, mathConfig.bonusBuyCoinInitialReelLengthsDistribution);

        baseGameRespinsSession[baseGameRespinsSession.length - 1].newReelLengths = specialReelLengths;                                

        accumulatedRoundWin = getLastElement(baseGameRespinsSession).accumulatedRoundWin;
        const bonusGameRespinsSession = runBonusBuySpinSession(integerRng, bet, precisionMoneyMapper, accumulatedRoundWin, specialReelLengths,
            mathConfig.baseGameReelSetsDistributions, mathConfig.bonusGameFeaturesDistributions, baseGameProfilesRegistry, 0, 'coinbonusbuyspin_second');

        bonusGameRespinsSession[bonusGameRespinsSession.length - 1].newReelLengths = [2,3,4,4,3,2];                                

        bonusGameRespinsSessions.push(bonusGameRespinsSession);
        accumulatedRoundWin = getLastElement(bonusGameRespinsSession).accumulatedRoundWin;
        return {
            win: precisionMoneyMapper(accumulatedRoundWin),
            data: {action, baseGameRespinsSession, bonusGameRespinsSessions}
        };
    } else {
        //Need to know what a valid file is
        return {
            win: precisionMoneyMapper(0),
            data: {action, baseGameRespinsSession:[], bonusGameRespinsSessions:[]}
        };
    }
    accumulatedRoundWin = getLastElement(baseGameRespinsSession).accumulatedRoundWin;

    const collectedScattersAmount = baseGameRespinsSession
        .reduce((scattersAmount, result) => scattersAmount + result.scatters.positions.length, 0);

    if (collectedScattersAmount >= mathConfig.scattersTriggeringBonusAmount) {

        const initialBonusGameProfile:string  = pickValueFromDistribution(integerRng, bonusProfile);
        let bonusGameProfilesRegistry = new GameProfilesRegistry(mathConfig.bonusGameProfileFallbacks, initialBonusGameProfile);
        let currentBonusGameReelLengths = mathConfig.bonusGameInitialReelLengths;

        for (let freeSpinIndex = 0; freeSpinIndex < mathConfig.bonusGameFreeSpinsAmount; freeSpinIndex++) {

            const bonusGameRespinsSession = runRespinsSession(integerRng, bet, precisionMoneyMapper, accumulatedRoundWin,
                currentBonusGameReelLengths, mathConfig.bonusGameReelSetsDistributions, mathConfig.bonusGameFeaturesDistributions, bonusGameProfilesRegistry, freeSpinIndex);

            bonusGameRespinsSession[bonusGameRespinsSession.length - 1].newReelLengths = [2,3,4,4,3,2];                                

            bonusGameRespinsSessions.push(bonusGameRespinsSession);
            accumulatedRoundWin = getLastElement(bonusGameRespinsSession).accumulatedRoundWin;
            currentBonusGameReelLengths = getLastElement(bonusGameRespinsSession).newReelLengths;
        }

       // fs.appendFileSync('testData.json', JSON.stringify({baseGameRespinsSession, bonusGameRespinsSessions}));
    }

    return {
        win: precisionMoneyMapper(accumulatedRoundWin),
        data: {action, baseGameRespinsSession, bonusGameRespinsSessions}
    };
}
