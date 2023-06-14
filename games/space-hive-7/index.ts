/* eslint-disable */
import {IGame, IPlayResponse} from "@slotify/gdk/lib/IGame";
import Iterations from "@slotify/gdk/lib/stats/Iterations.js";
import RTP from "@slotify/gdk/lib/stats/RTP.js";
import {mathConfig} from "./math/config/mathConfig";
import HitFrequency from "@slotify/gdk/lib/stats/HitFrequency";
import Variance from "@slotify/gdk/lib/stats/Variance";
import ConfidenceInterval from "@slotify/gdk/lib/stats/ConfidenceInterval";
import Average from "@slotify/gdk/lib/stats/Average";
import Max from "@slotify/gdk/lib/stats/Max";
import play from "./math/play";
import {SpinResult} from "./math/spin";
import {getPlayerConfig} from "./math/config/getPlayerConfig";

interface IData {
    baseGameRespinsSession: SpinResult[];
    bonusGameRespinsSessions: SpinResult[][];
}

const currentMaths = mathConfig() //this is going to pick up the default maths always

export const index: IGame<IData> = {
    name: "space-hive-7",
    bets: {
        "main": {
            available: [0.10, 0.20, 0.50, 1, 2, 5, 8, 10, 20, 30, 40, 50, 100],
            default: 1, maxWin: 13000, coin: currentMaths.coinsPerBet_main
        },
        "ante": {
            available: [0.10, 0.20, 0.50, 1, 2, 5, 8, 10, 20, 30, 40, 50, 100],
            default: 1, maxWin: 13000, coin: currentMaths.coinsPerBet_ante
        },
        "bonusbuy": { //this isn't being picked up
            available: [10, 20, 50, 100, 200, 500, 800, 1000, 2000, 3000, 4000, 5000, 10000],
            default: 100, maxWin: 13000, coin: currentMaths.coinsPerBet_bonusBuy
        },
        "coinbonusbuy": { //this isn't being picked up
            available: [10, 20, 50, 100, 200, 500, 800, 1000, 2000, 3000, 4000, 5000, 10000],
            default: 100, maxWin: 13000, coin: currentMaths.coinsPerBet_coinsBonusBuy
        },
    },

    config(variant) {
        return getPlayerConfig();
    },

    stats: {
        iterations: new Iterations(),
        rtp: new RTP(),
        variance: new Variance(),
        confidenceInterval: new ConfidenceInterval(99.5),
        hitFrequency: new HitFrequency(
            wagers => wagers.some(wager => wager.win > 0)),
        bonusGameTriggeringFrequency: new HitFrequency(
            wagers => wagers.some(wager => wager.data.bonusGameRespinsSessions.length > 0)),
        averageBonusGameLength: new Average((wagers) => wagers[0].data.bonusGameRespinsSessions
            .reduce((totalLength, respinsSession) => totalLength + respinsSession.length, 0))
            .filter((wagers) => wagers[0].data.bonusGameRespinsSessions.length > 0),
        // The value of the Bonus without the Trigger
        averageBonusGameValue: new Average((wagers) => {
            let baseGameWin =  wagers[0].data.baseGameRespinsSession[wagers[0].data.baseGameRespinsSession.length -1 ].accumulatedRoundWin
            return wagers[0].win - baseGameWin
        }).filter((wagers) => wagers[0].data.bonusGameRespinsSessions && wagers[0].data.bonusGameRespinsSessions.length > 0),
        biggestWin: new Max(wagers => wagers[0]?.win || 0),
        over_100x: new HitFrequency(wagers => wagers.some(wager => wager.win > 100)),
        over_500x: new HitFrequency(wagers => wagers.some(wager => wager.win > 500)),
        over_1000x: new HitFrequency(wagers => wagers.some(wager => wager.win > 1000)),
        over_2000x: new HitFrequency(wagers => wagers.some(wager => wager.win > 2000)),
        over_5000x: new HitFrequency(wagers => wagers.some(wager => wager.win > 5000)),
        over_10000x: new HitFrequency(wagers => wagers.some(wager => wager.win > 10000)),
    },
    cheats: {
        "main": {
            "BASE_GAME_RESPINS_TRIGGERED": wager => wager.data.baseGameRespinsSession.length > 1,
            "BONUS_ROUND_TRIGGERED": wager => wager.data.bonusGameRespinsSessions.length > 1,
            "BASE_GAME_BEE_WILDS_TRIGGERED": wager => wager.data.baseGameRespinsSession[0].beeWildPositions !== null,
            "INSTANT_PRIZE_TRIGGERED": wager => wager.data.baseGameRespinsSession[0].instantPrizeCoins !== null,
        },
        "bonusbuy": {

        }
    },

    play({bet, action, state, variant, promo}): IPlayResponse<IData> {
        //SNC - for now for action to bonusBuy
        //action = "coinbonusbuy";
        //action = "bonusbuy";
        //action = "main";
        return play(bet, action);
        //const result = play(bet, action);
        //console.log(JSON.stringify(result));
        //return result;
    },

    action(strategy): string {
        return null; // game has no actions other than "main"
    },

    evaluate(type, wagers, data): any {
        return {type, wagers, data};
    },
};

export default index;
