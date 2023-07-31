import rng from "@slotify/gdk/lib/rng/rng";
import {getLastElement} from "../../../common/arrays/getLast";
import {pickValueFromDistribution} from "../../../common/distributions/pickValueFromDistribution";
import FloatSourcedIntegerRng from "../../../common/rng/FloatSourcedIntegerRng";
import {mathConfig, anteMode} from "./config/mathConfig";
import {ActionType} from "./config/ActionType";
import GameProfilesRegistry from "./GameProfilesRegistry";
import {runRespinsSession} from "./runRespinsSession";
import {runBonusBuySpinSession} from "./runBonusBuySpinSession";
import {runCoinBonusBuySpinSession} from "./runCoinBonusBuySpinSession";
import { SpinResult } from "./spin";
import { SpecialModeType } from "./config/SpecialModeType";
//import fs from 'fs';

export default function play(stake: number, action: string) {

    const precisionMoneyMapper = money => Number(money.toFixed(8));
    anteMode(false);
    let currentMaths =  mathConfig();
    const integerRng = new FloatSourcedIntegerRng(() => rng());

    const initialBaseGameProfile = pickValueFromDistribution(integerRng, currentMaths.baseGameProfilesDistribution);
    const baseGameProfilesRegistry = new GameProfilesRegistry(currentMaths.baseGameProfileFallbacks, initialBaseGameProfile as string);

    //Handle normal and bonus buy modes separately

    let baseGameRespinsSession: SpinResult[];
    const bonusGameRespinsSessions = [];

    let accumulatedRoundWin;
    let bonusProfile;

    let coin: number = 0;
    let bet: number = stake; //For main variation, stake is bet. However, stake is the full amount of the wager, including (if needed) ante or bonus scalers

    if(action === ActionType.CoinBonusBuy) {
        //Coin bonus buy mode (use dead reels and force scatter)
        //NB Uses special full path
        //Question - should we be checking here that the coin and/or stake and/or bet are valid?

        coin = precisionMoneyMapper(bet/currentMaths.coinsPerBet_coinBonusBuy);
        bet = precisionMoneyMapper(coin * currentMaths.coinsPerBet_main);

        bonusProfile = currentMaths.bonusBuyGameProfilesDistribution;        
        baseGameRespinsSession = runBonusBuySpinSession(integerRng, bet, coin, precisionMoneyMapper, 0, currentMaths.baseGameInitialReelLengths,
            currentMaths.baseGameReelSetsDistributions, currentMaths.baseGameFeaturesDistributions, baseGameProfilesRegistry, 0, SpecialModeType.CoinBonusBuyFirstSpin);    
       
        const specialReelLengths: number[][] = [   
            pickValueFromDistribution(integerRng, currentMaths.bonusBuyCoinInitialReelLengthsDistribution),
        ];

        baseGameRespinsSession[baseGameRespinsSession.length - 1].newReelLengths = specialReelLengths[0];
        baseGameRespinsSession[baseGameRespinsSession.length - 1].isRespinTriggered = true; 

        accumulatedRoundWin = getLastElement(baseGameRespinsSession).accumulatedRoundWin;
        const bonusGameRespinsSession = runCoinBonusBuySpinSession(integerRng, bet, coin, precisionMoneyMapper, accumulatedRoundWin, 
            currentMaths.baseGameReelSetsDistributions, currentMaths.bonusGameFeaturesDistributions, baseGameProfilesRegistry, 0, specialReelLengths, SpecialModeType.CoinBonusBuySubsequentSpin);

        bonusGameRespinsSession[bonusGameRespinsSession.length - 1].newReelLengths = currentMaths.baseGameInitialReelLengths;                                

        bonusGameRespinsSessions.push(bonusGameRespinsSession);
        accumulatedRoundWin = getLastElement(bonusGameRespinsSession).accumulatedRoundWin;
        return {
            win: precisionMoneyMapper(accumulatedRoundWin),
            data: {action, stake, bet, coin, baseGameRespinsSession, bonusGameRespinsSessions},
        };
    }

    if(action === ActionType.Main) {
        //Normal play
        //Question - should we be checking here that the coin and/or stake and/or bet are valid?

        coin = precisionMoneyMapper(bet/currentMaths.coinsPerBet_main);
    
        bonusProfile =  currentMaths.bonusGameProfilesDistribution;
        baseGameRespinsSession = runRespinsSession(integerRng, bet, coin, precisionMoneyMapper, 0, currentMaths.baseGameInitialReelLengths,
            currentMaths.baseGameReelSetsDistributions, currentMaths.baseGameFeaturesDistributions, baseGameProfilesRegistry, 0);
        baseGameRespinsSession[baseGameRespinsSession.length - 1].newReelLengths = currentMaths.baseGameInitialReelLengths;                               
    } else if(action === ActionType.Ante) {
        //Ante play
        //Bet comes in as (currently) 15 coins. Get the true coin size, and set the bet as if it were normal
        //For example an ante bet of 15 is a coin value of 1 and a true bet of 10
        anteMode(true);
        currentMaths = mathConfig();

        //Question - should we be checking here that the coin and/or stake and/or bet are valid?

        //NB Coin *and* bet recalculated from stake here!
        coin = precisionMoneyMapper(stake / currentMaths.coinsPerBet_ante);
        bet = precisionMoneyMapper(coin * currentMaths.coinsPerBet_main);
        
        bonusProfile =  currentMaths.bonusGameProfilesDistribution;
        baseGameRespinsSession = runRespinsSession(integerRng, bet, coin, precisionMoneyMapper, 0, currentMaths.baseGameInitialReelLengths,
            currentMaths.baseGameReelSetsDistributions, currentMaths.baseGameFeaturesDistributions, baseGameProfilesRegistry, 0);
        baseGameRespinsSession[baseGameRespinsSession.length - 1].newReelLengths = currentMaths.baseGameInitialReelLengths;                               
    } else if(action === ActionType.BonusBuy) {
        //Bonus buy mode (use dead reels and force scatter)
        
        //Question - should we be checking here that the coin and/or stake and/or bet are valid?
        
        //NB Coin *and* bet recalculated from stake here!
        coin = precisionMoneyMapper(bet / currentMaths.coinsPerBet_bonusBuy);
        bet = precisionMoneyMapper(coin * currentMaths.coinsPerBet_main);

        bonusProfile = currentMaths.bonusBuyGameProfilesDistribution;
        baseGameRespinsSession = runBonusBuySpinSession(integerRng, bet, coin, precisionMoneyMapper, 0, currentMaths.baseGameInitialReelLengths,
            currentMaths.baseGameReelSetsDistributions, currentMaths.baseGameFeaturesDistributions, baseGameProfilesRegistry, 0, SpecialModeType.BonusBuySpin);    
        baseGameRespinsSession[baseGameRespinsSession.length - 1].newReelLengths = currentMaths.baseGameInitialReelLengths;                                
    } else {
        //Need to know what a valid fail is
        throw "invalid Action";
    }

    accumulatedRoundWin = getLastElement(baseGameRespinsSession).accumulatedRoundWin;

    const collectedScattersAmount = baseGameRespinsSession
        .reduce((scattersAmount, result) => scattersAmount + result.scatters.positions.length, 0);

    if (collectedScattersAmount >= currentMaths.scattersTriggeringBonusAmount) {
        
        const initialBonusGameProfile:string  = pickValueFromDistribution(integerRng, bonusProfile);
        const bonusGameProfilesRegistry = new GameProfilesRegistry(currentMaths.bonusGameProfileFallbacks, initialBonusGameProfile);
        let currentBonusGameReelLengths = currentMaths.bonusGameInitialReelLengths;

        for (let freeSpinIndex = currentMaths.bonusGameFreeSpinsAmount; freeSpinIndex > 0; freeSpinIndex--) {

            const bonusGameRespinsSession = runRespinsSession(integerRng, bet, coin, precisionMoneyMapper, accumulatedRoundWin,
                currentBonusGameReelLengths, currentMaths.bonusGameReelSetsDistributions, currentMaths.bonusGameFeaturesDistributions, bonusGameProfilesRegistry, freeSpinIndex);

            bonusGameRespinsSessions.push(bonusGameRespinsSession);
            accumulatedRoundWin = getLastElement(bonusGameRespinsSession).accumulatedRoundWin;
            currentBonusGameReelLengths = getLastElement(bonusGameRespinsSession).newReelLengths;
        }

        const sessionLength: number = bonusGameRespinsSessions[bonusGameRespinsSessions.length - 1].length;

        const finalways = bonusGameRespinsSessions[bonusGameRespinsSessions.length - 1][sessionLength - 1].newReelLengths.reduce((accumulator, currentValue) => accumulator * currentValue);

        // fs.appendFileSync('waysInfo.log',  finalways + ',' + accumulatedRoundWin + '\n'); //final ways info
        // bonusGameRespinsSessions[bonusGameRespinsSessions.length - 1][sessionLength -1].newReelLengths = currentMaths.baseGameInitialReelLengths;                                

        // fs.appendFileSync('results.log', accumulatedRoundWin + '\n');
        
    }

    return {
        win: precisionMoneyMapper(accumulatedRoundWin),
        data: {action, stake, bet, coin, baseGameRespinsSession, bonusGameRespinsSessions},
    };
}
