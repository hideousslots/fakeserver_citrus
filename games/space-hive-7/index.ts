/* eslint-disable */
import {IGame, IPlayResponse} from "@slotify/gdk/lib/IGame";
import Iterations from "@slotify/gdk/lib/stats/Iterations.js";
import RTP from "@slotify/gdk/lib/stats/RTP.js";
import {mathConfig} from "./math/config/mathConfig";
import HitFrequency from "@slotify/gdk/lib/stats/HitFrequency";
import Variance from "@slotify/gdk/lib/stats/Variance";
import ConfidenceInterval from "@slotify/gdk/lib/stats/ConfidenceInterval";
import Average from "@slotify/gdk/lib/stats/Average";
import play from "./math/play";
import {SpinResult} from "./math/spin";
import {getPlayerConfig} from "./math/config/getPlayerConfig";

interface IData {
    baseGameRespinsSession: SpinResult[];
    bonusGameRespinsSessions: SpinResult[][];
}

export const index: IGame<IData> = {
    name: "space-hive-7",
    bets: {
        "main": {
            available: [0.10, 0.20, 0.50, 1, 2, 5, 8, 10, 20, 30, 40, 50, 100],
            default: 1, maxWin: 10000, coin: mathConfig.coinsPerBet
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
            .filter((wagers) => wagers[0].data.bonusGameRespinsSessions.length > 0)
    },
    cheats: {
        "main": {
            "BASE_GAME_RESPINS_TRIGGERED": wager => wager.data.baseGameRespinsSession.length > 1,
            "BONUS_ROUND_TRIGGERED": wager => wager.data.bonusGameRespinsSessions.length > 1,
            "BASE_GAME_BEE_WILDS_TRIGGERED": wager => wager.data.baseGameRespinsSession[0].beeWildPositions !== null,
            "INSTANT_PRIZE_TRIGGERED": wager => wager.data.baseGameRespinsSession[0].instantPrizeCoins !== null,
        }
    },

    play({bet, action, state, variant, promo}): IPlayResponse<IData> {
        console.log('snc ' + process.env.RNG);
        return play(bet);
    },

    action(strategy): string {
        return null; // game has no actions other than "main"
    },

    evaluate(type, wagers, data): any {
        return {type, wagers, data};
    },
};

export default index;
