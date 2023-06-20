/* eslint-disable */
import {IGame, IPlayResponse} from "@slotify/gdk/lib/IGame";
import Iterations from "@slotify/gdk/lib/stats/Iterations.js";
import RTP from "@slotify/gdk/lib/stats/RTP.js";
import {mathConfig} from "./math/config/mathConfig";
import HitFrequency from "@slotify/gdk/lib/stats/HitFrequency";
import Variance from "@slotify/gdk/lib/stats/Variance";
import ConfidenceInterval from "@slotify/gdk/lib/stats/ConfidenceInterval";
import Average from "@slotify/gdk/lib/stats/Average";
import MaxWithLogging from "./math/stats/MyMax";
import play from "./math/play";
import {SpinResult} from "./math/spin";
import {getPlayerConfig} from "./math/config/getPlayerConfig";
import WildsFrequency from "./math/stats/WildsFrequency";
import WinBucket from "./math/stats/WinBucket";

const currentMaths =  mathConfig()

interface IData {
    baseGameRespinsSession: SpinResult[];
    bonusGameRespinsSessions: SpinResult[][];
}

export const index: IGame<IData> = {
    name: "space-hive-7",
    bets: {
        "main": {
            available: [0.2, 0.3, 0.4, 0.6, 0.8, 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 15, 20],
            default: 1, maxWin: 13000, coin: currentMaths.coinsPerBet_main
        },
        "ante": {
            available: [0.3, 0.45, 0.6, 0.9, 1.2, 1.5, 2.25, 3, 4.5, 6, 7.5, 9, 12, 15, 22.5, 30],
            default: 1.5, maxWin: 13000, coin: currentMaths.coinsPerBet_ante
        },
        "bonusbuy": { //this isn't being picked up
            available: [20, 30, 40, 60, 80, 100, 150, 200, 300, 400, 500, 600, 800, 1000, 1500, 2000],
            default: 100, maxWin: 130, coin: currentMaths.coinsPerBet_bonusBuy
        },
        "coinbonusbuy": { //this isn't being picked up
            available: [19, 28.5, 38, 57, 76, 95, 142.5, 190, 285, 380, 475, 570, 760, 950, 1425, 1900],
            default: 95, maxWin: 130, coin: currentMaths.coinsPerBet_coinBonusBuy
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
        biggestWin: new MaxWithLogging(wagers => wagers[0]?.win || 0),
        zero_bonus: new WinBucket(wagers => wagers.some(wager => wager.win === 0)),
        over_0x: new WinBucket(wagers => wagers.some(wager => wager.win > 0 && wager.win < 4000)),
        over_40x: new WinBucket(wagers => wagers.some(wager => wager.win >= 4000 && wager.win < 8000)),
        over_80x: new WinBucket(wagers => wagers.some(wager => wager.win >= 8000 && wager.win < 12000)),
        over_120x: new WinBucket(wagers => wagers.some(wager => wager.win >= 12000 && wager.win < 16000)),
        over_160x: new WinBucket(wagers => wagers.some(wager => wager.win >= 16000)),
        
        
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
        return play(bet, action);
    },

    action(strategy): string {
        return null; // game has no actions other than "main"
    },

    evaluate(type, wagers, data): any {
        return {type, wagers, data};
    },
};

export default index;
