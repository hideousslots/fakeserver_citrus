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
        "coinsbonusbuy": { //this isn't being picked up
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
        biggestWin: new MaxWithLogging(wagers => wagers[0]?.win || 0),
        over_0x: new WinBucket(wagers => wagers.some(wager => wager.win > 0 && wager.win < 1)),
        over_1x: new WinBucket(wagers => wagers.some(wager => wager.win >= 1 && wager.win < 2)),
        over_2x: new WinBucket(wagers => wagers.some(wager => wager.win >= 2 && wager.win < 3)),
        over_3x: new WinBucket(wagers => wagers.some(wager => wager.win >= 3 && wager.win < 4)),
        over_4x: new WinBucket(wagers => wagers.some(wager => wager.win >= 4 && wager.win < 5)),
        over_5x: new WinBucket(wagers => wagers.some(wager => wager.win >= 5 && wager.win < 6)),
        over_6x: new WinBucket(wagers => wagers.some(wager => wager.win >= 6 && wager.win < 7)),
        over_7x: new WinBucket(wagers => wagers.some(wager => wager.win >= 7 && wager.win < 8)),
        over_8x: new WinBucket(wagers => wagers.some(wager => wager.win >= 8 && wager.win < 9)),
        over_9x: new WinBucket(wagers => wagers.some(wager => wager.win >= 9 && wager.win < 10)),
        over_10x: new WinBucket(wagers => wagers.some(wager => wager.win >= 10 && wager.win < 11)),
        over_11x: new WinBucket(wagers => wagers.some(wager => wager.win >= 11 && wager.win < 12)),
        over_12x: new WinBucket(wagers => wagers.some(wager => wager.win >= 12 && wager.win < 13)),
        over_13x: new WinBucket(wagers => wagers.some(wager => wager.win >= 13 && wager.win < 14)),
        over_14x: new WinBucket(wagers => wagers.some(wager => wager.win >= 14 && wager.win < 15)),
        over_15x: new WinBucket(wagers => wagers.some(wager => wager.win >= 15 && wager.win < 16)),
        over_16x: new WinBucket(wagers => wagers.some(wager => wager.win >= 16 && wager.win < 17)),
        over_17x: new WinBucket(wagers => wagers.some(wager => wager.win >= 17 && wager.win < 18)),
        over_18x: new WinBucket(wagers => wagers.some(wager => wager.win >= 18 && wager.win < 19)),
        over_19x: new WinBucket(wagers => wagers.some(wager => wager.win >= 19 && wager.win < 20)),
        over_20x: new WinBucket(wagers => wagers.some(wager => wager.win >= 20 && wager.win < 21)),
        over_21x: new WinBucket(wagers => wagers.some(wager => wager.win >= 21 && wager.win < 22)),
        over_22x: new WinBucket(wagers => wagers.some(wager => wager.win >= 22 && wager.win < 23)),
        over_23x: new WinBucket(wagers => wagers.some(wager => wager.win >= 23 && wager.win < 24)),
        over_24x: new WinBucket(wagers => wagers.some(wager => wager.win >= 24 && wager.win < 25)),
        over_25x: new WinBucket(wagers => wagers.some(wager => wager.win >= 25 && wager.win < 26)),
        over_26x: new WinBucket(wagers => wagers.some(wager => wager.win >= 26 && wager.win < 27)),
        over_27x: new WinBucket(wagers => wagers.some(wager => wager.win >= 27 && wager.win < 28)),
        over_28x: new WinBucket(wagers => wagers.some(wager => wager.win >= 28 && wager.win < 29)),
        over_29x: new WinBucket(wagers => wagers.some(wager => wager.win >= 29 && wager.win < 30)),
        over_30x: new WinBucket(wagers => wagers.some(wager => wager.win >= 30 && wager.win < 31)),
        over_31x: new WinBucket(wagers => wagers.some(wager => wager.win >= 31 && wager.win < 32)),
        over_32x: new WinBucket(wagers => wagers.some(wager => wager.win >= 32 && wager.win < 33)),
        over_33x: new WinBucket(wagers => wagers.some(wager => wager.win >= 33 && wager.win < 34)),
        over_34x: new WinBucket(wagers => wagers.some(wager => wager.win >= 34 && wager.win < 35)),
        over_35x: new WinBucket(wagers => wagers.some(wager => wager.win >= 35 && wager.win < 36)),
        over_36x: new WinBucket(wagers => wagers.some(wager => wager.win >= 36 && wager.win < 37)),
        over_37x: new WinBucket(wagers => wagers.some(wager => wager.win >= 37 && wager.win < 38)),
        over_38x: new WinBucket(wagers => wagers.some(wager => wager.win >= 38 && wager.win < 39)),
        over_39x: new WinBucket(wagers => wagers.some(wager => wager.win >= 39 && wager.win < 40)),
        over_40x: new WinBucket(wagers => wagers.some(wager => wager.win >= 40 && wager.win < 41)),
        over_41x: new WinBucket(wagers => wagers.some(wager => wager.win >= 41 && wager.win < 42)),
        over_42x: new WinBucket(wagers => wagers.some(wager => wager.win >= 42 && wager.win < 43)),
        over_43x: new WinBucket(wagers => wagers.some(wager => wager.win >= 43 && wager.win < 44)),
        over_44x: new WinBucket(wagers => wagers.some(wager => wager.win >= 44 && wager.win < 45)),
        over_45x: new WinBucket(wagers => wagers.some(wager => wager.win >= 45 && wager.win < 46)),
        over_46x: new WinBucket(wagers => wagers.some(wager => wager.win >= 46 && wager.win < 47)),
        over_47x: new WinBucket(wagers => wagers.some(wager => wager.win >= 47 && wager.win < 48)),
        over_48x: new WinBucket(wagers => wagers.some(wager => wager.win >= 48 && wager.win < 49)),
        over_49x: new WinBucket(wagers => wagers.some(wager => wager.win >= 49 && wager.win < 50)),
        between_50_60x: new WinBucket(wagers => wagers.some(wager => wager.win >= 50 && wager.win < 60)),
        between_60_60x: new WinBucket(wagers => wagers.some(wager => wager.win >= 60 && wager.win < 70)),
        between_70_60x: new WinBucket(wagers => wagers.some(wager => wager.win >= 70 && wager.win < 80)),
        between_80_60x: new WinBucket(wagers => wagers.some(wager => wager.win >= 80 && wager.win < 90)),
        between_90_60x: new WinBucket(wagers => wagers.some(wager => wager.win >= 90 && wager.win < 100)),
        over100x: new WinBucket(wagers => wagers.some(wager => wager.win >= 100)),
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
