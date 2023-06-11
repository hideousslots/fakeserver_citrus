import rng from "@slotify/gdk/lib/rng/rng";
import {getLastElement} from "../../../common/arrays/getLast";
import {pickValueFromDistribution} from "../../../common/distributions/pickValueFromDistribution";
import FloatSourcedIntegerRng from "../../../common/rng/FloatSourcedIntegerRng";
import {mathConfig} from "./config/mathConfig";
import {ActionType} from "./config/ActionType";
import GameProfilesRegistry from "./GameProfilesRegistry";
import {runRespinsSession} from "./runRespinsSession";
import {runBonusBuySpinSession} from "./runBonusBuySpinSession";
import {runCoinBonusBuySpinSession} from "./runCoinBonusBuySpinSession";
import { SpinResult } from "./spin";
import { SpecialModeType } from "./config/SpecialModeType";

export default function play(bet: number, action: string) {

    const precisionMoneyMapper = money => Number(money.toFixed(2));

    const integerRng = new FloatSourcedIntegerRng(() => rng());

    const initialBaseGameProfile = pickValueFromDistribution(integerRng, mathConfig.baseGameProfilesDistribution);
    const baseGameProfilesRegistry = new GameProfilesRegistry(mathConfig.baseGameProfileFallbacks, initialBaseGameProfile);

    //Handle normal and bonus buy modes separately

    let baseGameRespinsSession: SpinResult[];
    const bonusGameRespinsSessions = [];

    let accumulatedRoundWin;
    let bonusProfile;

    let coin: number = 0;

    if(action === ActionType.CoinsBonusBuy) {
        //Coin bonus buy mode (use dead reels and force scatter)
        //NB Uses special full path

        coin = precisionMoneyMapper(bet/mathConfig.coinsPerBet_coinsBonusBuy);

        bonusProfile = mathConfig.bonusBuyGameProfilesDistribution;        
        baseGameRespinsSession = runBonusBuySpinSession(integerRng, bet, coin, precisionMoneyMapper, 0, mathConfig.baseGameInitialReelLengths,
            mathConfig.baseGameReelSetsDistributions, mathConfig.baseGameFeaturesDistributions, baseGameProfilesRegistry, 0, SpecialModeType.CoinBonusBuyFirstSpin);    
       
        const specialReelLengths: number[][] = [   
            pickValueFromDistribution(integerRng, mathConfig.bonusBuyCoinInitialReelLengthsDistribution),
            pickValueFromDistribution(integerRng, mathConfig.bonusBuyCoinInitialReelLengthsDistribution),
            pickValueFromDistribution(integerRng, mathConfig.bonusBuyCoinInitialReelLengthsDistribution)
        ];

        baseGameRespinsSession[baseGameRespinsSession.length - 1].newReelLengths = specialReelLengths[0];
        baseGameRespinsSession[baseGameRespinsSession.length - 1].isRespinTriggered = true; 

        accumulatedRoundWin = getLastElement(baseGameRespinsSession).accumulatedRoundWin;
        const bonusGameRespinsSession = runCoinBonusBuySpinSession(integerRng, bet, coin, precisionMoneyMapper, accumulatedRoundWin, 
            mathConfig.baseGameReelSetsDistributions, mathConfig.bonusGameFeaturesDistributions, baseGameProfilesRegistry, 0, specialReelLengths, SpecialModeType.CoinBonusBuySubsequentSpin);

        bonusGameRespinsSession[bonusGameRespinsSession.length - 1].newReelLengths = mathConfig.baseGameInitialReelLengths;                                

        bonusGameRespinsSessions.push(bonusGameRespinsSession);
        accumulatedRoundWin = getLastElement(bonusGameRespinsSession).accumulatedRoundWin;
        return {
            win: precisionMoneyMapper(accumulatedRoundWin),
            data: {action, baseGameRespinsSession, bonusGameRespinsSessions}
        };
    }

    if(action === ActionType.Main) {
        //Normal play

        coin = precisionMoneyMapper(bet/mathConfig.coinsPerBet_main);
    
        bonusProfile =  mathConfig.bonusGameProfilesDistribution;
        baseGameRespinsSession = runRespinsSession(integerRng, bet, coin, precisionMoneyMapper, 0, mathConfig.baseGameInitialReelLengths,
            mathConfig.baseGameReelSetsDistributions, mathConfig.baseGameFeaturesDistributions, baseGameProfilesRegistry, 0);
        baseGameRespinsSession[baseGameRespinsSession.length - 1].newReelLengths = mathConfig.baseGameInitialReelLengths;                               
    } else if(action === ActionType.Ante) {
        //Ante play
        //Bet comes in as (currently) 15 coins. Get the true coin size, and set the bet as if it were normal
        //For example an ante bet of 15 is a coin value of 1 and a true bet of 10
        coin = precisionMoneyMapper(bet / mathConfig.coinsPerBet_ante);
        bet = precisionMoneyMapper(coin * mathConfig.coinsPerBet_main);
        
        bonusProfile =  mathConfig.bonusGameProfilesDistribution;
        baseGameRespinsSession = runRespinsSession(integerRng, bet, coin, precisionMoneyMapper, 0, mathConfig.baseGameInitialReelLengths,
            mathConfig.baseGameReelSetsDistributions, mathConfig.baseGameFeaturesDistributions, baseGameProfilesRegistry, 0);
        baseGameRespinsSession[baseGameRespinsSession.length - 1].newReelLengths = mathConfig.baseGameInitialReelLengths;                               
    } else if(action === ActionType.BonusBuy) {
        //Bonus buy mode (use dead reels and force scatter)

        coin = precisionMoneyMapper(bet / mathConfig.coinsPerBet_main);

        bonusProfile = mathConfig.bonusBuyGameProfilesDistribution;
        baseGameRespinsSession = runBonusBuySpinSession(integerRng, bet, coin, precisionMoneyMapper, 0, mathConfig.baseGameInitialReelLengths,
            mathConfig.baseGameReelSetsDistributions, mathConfig.baseGameFeaturesDistributions, baseGameProfilesRegistry, 0, SpecialModeType.BonusBuySpin);    
        baseGameRespinsSession[baseGameRespinsSession.length - 1].newReelLengths = mathConfig.baseGameInitialReelLengths;                                
    } else {
        //Need to know what a valid fail is
        throw "invalid Action"
    }

    accumulatedRoundWin = getLastElement(baseGameRespinsSession).accumulatedRoundWin;

    const collectedScattersAmount = baseGameRespinsSession
        .reduce((scattersAmount, result) => scattersAmount + result.scatters.positions.length, 0);

    if (collectedScattersAmount >= mathConfig.scattersTriggeringBonusAmount) {

        const initialBonusGameProfile:string  = pickValueFromDistribution(integerRng, bonusProfile);
        const bonusGameProfilesRegistry = new GameProfilesRegistry(mathConfig.bonusGameProfileFallbacks, initialBonusGameProfile);
        let currentBonusGameReelLengths = mathConfig.bonusGameInitialReelLengths;

        for (let freeSpinIndex = mathConfig.bonusGameFreeSpinsAmount; freeSpinIndex > 0; freeSpinIndex--) {

            const bonusGameRespinsSession = runRespinsSession(integerRng, bet, coin, precisionMoneyMapper, accumulatedRoundWin,
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
        //SNC 20230609 - I think win needs to be 2DP not 8
        //win: precisionMoneyMapper(accumulatedRoundWin),
        win: Number(accumulatedRoundWin.toFixed(2)),
        data: {action, baseGameRespinsSession, bonusGameRespinsSessions}
    };
}
