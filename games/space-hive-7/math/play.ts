import rng from "@slotify/gdk/lib/rng/rng";
import {getLastElement} from "../../../common/arrays/getLast";
import {pickValueFromDistribution} from "../../../common/distributions/pickValueFromDistribution";
import FloatSourcedIntegerRng from "../../../common/rng/FloatSourcedIntegerRng";
import {mathConfig} from "./config/mathConfig";
import GameProfilesRegistry from "./GameProfilesRegistry";
import {runRespinsSession} from "./runRespinsSession";
import {runBonusBuySpinSession} from "./runBonusBuySpinSession";
import {runCoinBonusBuySpinSession} from "./runCoinBonusBuySpinSession";
import { SpinResult } from "./spin";

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

    if(action === "main") {
        //Normal play
        bonusProfile =  mathConfig.bonusGameProfilesDistribution;
        baseGameRespinsSession = runRespinsSession(integerRng, bet, precisionMoneyMapper, 0, mathConfig.baseGameInitialReelLengths,
            mathConfig.baseGameReelSetsDistributions, mathConfig.baseGameFeaturesDistributions, baseGameProfilesRegistry, 0);
        baseGameRespinsSession[baseGameRespinsSession.length - 1].newReelLengths = mathConfig.baseGameInitialReelLengths;                               
    } else if(action === "bonusbuy") {
        //Bonus buy mode (use dead reels and force scatter)
        bonusProfile = mathConfig.bonusBuyGameProfilesDistribution;
        baseGameRespinsSession = runBonusBuySpinSession(integerRng, bet, precisionMoneyMapper, 0, mathConfig.baseGameInitialReelLengths,
            mathConfig.baseGameReelSetsDistributions, mathConfig.baseGameFeaturesDistributions, baseGameProfilesRegistry, 0, 'bonusbuyspin');    
        baseGameRespinsSession[baseGameRespinsSession.length - 1].newReelLengths = mathConfig.baseGameInitialReelLengths;                                
    } else if(action === "coinbonusbuy") {
        //Coin bonus buy mode (use dead reels and force scatter)

        //Special full path

        bonusProfile = mathConfig.bonusBuyGameProfilesDistribution;        
        baseGameRespinsSession = runBonusBuySpinSession(integerRng, bet, precisionMoneyMapper, 0, mathConfig.baseGameInitialReelLengths,
            mathConfig.baseGameReelSetsDistributions, mathConfig.baseGameFeaturesDistributions, baseGameProfilesRegistry, 0, 'coinbonusbuyspin_first');    
       
        const specialReelLengths: number[][] = [   
            pickValueFromDistribution(integerRng, mathConfig.bonusBuyCoinInitialReelLengthsDistribution),
            pickValueFromDistribution(integerRng, mathConfig.bonusBuyCoinInitialReelLengthsDistribution),
            pickValueFromDistribution(integerRng, mathConfig.bonusBuyCoinInitialReelLengthsDistribution)
        ];

        baseGameRespinsSession[baseGameRespinsSession.length - 1].newReelLengths = specialReelLengths[0];
        baseGameRespinsSession[baseGameRespinsSession.length - 1].isRespinTriggered = true; 

        accumulatedRoundWin = getLastElement(baseGameRespinsSession).accumulatedRoundWin;
        const bonusGameRespinsSession = runCoinBonusBuySpinSession(integerRng, bet, precisionMoneyMapper, accumulatedRoundWin, 
            mathConfig.baseGameReelSetsDistributions, mathConfig.bonusGameFeaturesDistributions, baseGameProfilesRegistry, 0, specialReelLengths, 'coinbonusbuyspin_second');

        bonusGameRespinsSession[bonusGameRespinsSession.length - 1].newReelLengths = mathConfig.baseGameInitialReelLengths;                                

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
        const bonusGameProfilesRegistry = new GameProfilesRegistry(mathConfig.bonusGameProfileFallbacks, initialBonusGameProfile);
        let currentBonusGameReelLengths = mathConfig.bonusGameInitialReelLengths;

        for (let freeSpinIndex = 0; freeSpinIndex < mathConfig.bonusGameFreeSpinsAmount; freeSpinIndex++) {

            const bonusGameRespinsSession = runRespinsSession(integerRng, bet, precisionMoneyMapper, accumulatedRoundWin,
                currentBonusGameReelLengths, mathConfig.bonusGameReelSetsDistributions, mathConfig.bonusGameFeaturesDistributions, bonusGameProfilesRegistry, freeSpinIndex);

            bonusGameRespinsSessions.push(bonusGameRespinsSession);
            accumulatedRoundWin = getLastElement(bonusGameRespinsSession).accumulatedRoundWin;
            currentBonusGameReelLengths = getLastElement(bonusGameRespinsSession).newReelLengths;
        }

        let sessionLength: number = bonusGameRespinsSessions[bonusGameRespinsSessions.length - 1].length;
        bonusGameRespinsSessions[bonusGameRespinsSessions.length - 1][sessionLength -1].newReelLengths = mathConfig.baseGameInitialReelLengths;                                

       // fs.appendFileSync('testData.json', JSON.stringify({baseGameRespinsSession, bonusGameRespinsSessions}));
    }

    return {
        win: precisionMoneyMapper(accumulatedRoundWin),
        data: {action, baseGameRespinsSession, bonusGameRespinsSessions}
    };
}
