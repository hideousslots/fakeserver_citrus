/* eslint-disable */
import { IGame, IPlayResponse } from "@slotify/gdk/lib/IGame";
import Iterations from "@slotify/gdk/lib/stats/Iterations.js";
import RTP from "@slotify/gdk/lib/stats/RTP.js";
import { mathConfig } from "./math/config/mathConfig";
import Variance from "@slotify/gdk/lib/stats/Variance";
import ConfidenceInterval from "@slotify/gdk/lib/stats/ConfidenceInterval";
import play from "./math/play";
import { SpinResult } from "./math/spin";
import { getPlayerConfig } from "./math/config/getPlayerConfig";
import HitFrequency from "@slotify/gdk/lib/stats/HitFrequency";
import Average from "@slotify/gdk/lib/stats/Average";
import WinAnalysis from "./math/stats/WinAnalysis";

const currentMaths = mathConfig();

interface IData {
	baseGameSpin: SpinResult;
	bonusGameSpins: SpinResult[]; //single array of results
}

export const index: IGame<IData> = {
	name: "citrus-got-reel",
	bets: {
		main: {
			available: [
				0.2, 0.3, 0.4, 0.6, 0.8, 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 15, 20,
			],
			default: 1,
			maxWin: 13000,
			coin: currentMaths.coinsPerBet_main,
		},
		ante: {
			available: [
				0.3, 0.45, 0.6, 0.9, 1.2, 1.5, 2.25, 3, 4.5, 6, 7.5, 9, 12, 15,
				22.5, 30,
			],
			default: 1.5,
			maxWin: 13000,
			coin: currentMaths.coinsPerBet_ante,
		},
		bonusbuy: {
			available: [
				20, 30, 40, 60, 80, 100, 150, 200, 300, 400, 500, 600, 800,
				1000, 1500, 2000,
			],
			default: 100,
			maxWin: 130,
			coin: currentMaths.coinsPerBet_bonusBuy,
		},
	},

	config(variant) {
		return getPlayerConfig();
	},

	stats: {
		//winAnalysis: new WinAnalysis({active:true,reportOnlyHitValues:true, reportRate:100000}),
		iterations: new Iterations(),
		rtp: new RTP(),
		variance: new Variance(),
		confidenceInterval: new ConfidenceInterval(99.5),
		bonusGameTriggeringFrequency: new HitFrequency((wagers) =>
			wagers.some((wager) => wager.data.bonusGameSpins.length > 0)
		),
		averageBonusGameValue: new Average((wagers) => {
            return wagers[0].data.bonusGameSpins.reduce(
                (acc, obj) => acc + obj.win,
                0
            );
        }).filter((wagers) => wagers[0].data.bonusGameSpins && wagers[0].data.bonusGameSpins.length > 0),
		hitFrequency: new HitFrequency((wagers) =>
			wagers.some((wager) => wager.win > 0)
		),
		_0x: new HitFrequency((wagers) =>
			wagers.some((wager) => wager.win === 0)
		),
		_0x_1x: new HitFrequency((wagers) =>
			wagers.some((wager) => wager.win > 0)
		),
		_1x: new HitFrequency((wagers) =>
			wagers.some((wager) => wager.win > 1)
		),
		_2x: new HitFrequency((wagers) =>
			wagers.some((wager) => wager.win > 2)
		),
		_3x: new HitFrequency((wagers) =>
			wagers.some((wager) => wager.win > 3)
		),
		_4x: new HitFrequency((wagers) =>
			wagers.some((wager) => wager.win > 4)
		),
		_5x: new HitFrequency((wagers) =>
			wagers.some((wager) => wager.win > 5)
		),
		_6x: new HitFrequency((wagers) =>
			wagers.some((wager) => wager.win > 6)
		),
		_7x: new HitFrequency((wagers) =>
			wagers.some((wager) => wager.win > 7)
		),
		_8x: new HitFrequency((wagers) =>
			wagers.some((wager) => wager.win > 8)
		),
		_20x: new HitFrequency((wagers) =>
			wagers.some((wager) => wager.win > 20)
		),
		_30x: new HitFrequency((wagers) =>
			wagers.some((wager) => wager.win > 30)
		),
		_50x: new HitFrequency((wagers) =>
			wagers.some((wager) => wager.win > 50)
		),
		_300x: new HitFrequency((wagers) =>
			wagers.some((wager) => wager.win > 300)
		),
		_350x: new HitFrequency((wagers) =>
			wagers.some((wager) => wager.win > 350)
		),
		_400x: new HitFrequency((wagers) =>
			wagers.some((wager) => wager.win > 400)
		),
		_450x: new HitFrequency((wagers) =>
			wagers.some((wager) => wager.win > 450)
		),
		_500x: new HitFrequency((wagers) =>
			wagers.some((wager) => wager.win > 500)
		),
		_550x: new HitFrequency((wagers) =>
			wagers.some((wager) => wager.win > 550)
		),
		_600x: new HitFrequency((wagers) =>
			wagers.some((wager) => wager.win > 600)
		),
		_650x: new HitFrequency((wagers) =>
			wagers.some((wager) => wager.win > 650)
		),
		_700x: new HitFrequency((wagers) =>
			wagers.some((wager) => wager.win > 700)
		),
		_750x: new HitFrequency((wagers) =>
			wagers.some((wager) => wager.win > 750)
		),
		_800x: new HitFrequency((wagers) =>
			wagers.some((wager) => wager.win > 800)
		),
		_850x: new HitFrequency((wagers) =>
			wagers.some((wager) => wager.win > 850)
		),
		_900x: new HitFrequency((wagers) =>
			wagers.some((wager) => wager.win > 900)
		),
		_950x: new HitFrequency((wagers) =>
			wagers.some((wager) => wager.win > 950)
		),
		_1000x: new HitFrequency((wagers) =>
			wagers.some((wager) => wager.win > 1000)
		),
		_2000x: new HitFrequency((wagers) =>
			wagers.some((wager) => wager.win > 2000)
		),
		_3000x: new HitFrequency((wagers) =>
			wagers.some((wager) => wager.win > 3000)
		),
		_4000x: new HitFrequency((wagers) =>
			wagers.some((wager) => wager.win > 4000)
		),
		_5000x: new HitFrequency((wagers) =>
			wagers.some((wager) => wager.win > 5000)
		),
		// zero_bonus: new WinBucket(wagers => wagers.some(wager => wager.win === 0)),
		// _0x_20x: new WinBucket(wagers => wagers.some(wager => wager.win > 0 && wager.win < 20)),
		// _20x_40x: new WinBucket(wagers => wagers.some(wager => wager.win >= 20 && wager.win < 40)),
		// _40x_60x: new WinBucket(wagers => wagers.some(wager => wager.win >= 40 && wager.win < 60)),
		// _60x_80x: new WinBucket(wagers => wagers.some(wager => wager.win >= 60 && wager.win < 80)),
		// _80x_100x: new WinBucket(wagers => wagers.some(wager => wager.win >= 80 && wager.win < 100)),
		// over_100x: new WinBucket(wagers => wagers.some(wager => wager.win >= 100)),
		// over_200x: new WinBucket(wagers => wagers.some(wager => wager.win >= 200)),
		// over_300x: new WinBucket(wagers => wagers.some(wager => wager.win >= 300)),
		// over_400x: new WinBucket(wagers => wagers.some(wager => wager.win >= 400)),
		// over_500x: new WinBucket(wagers => wagers.some(wager => wager.win >= 500)),
		// over_1000x: new WinBucket(wagers => wagers.some(wager => wager.win >= 1000)),
		// over_2000x: new WinBucket(wagers => wagers.some(wager => wager.win >= 2000)),
		// over_4000x: new WinBucket(wagers => wagers.some(wager => wager.win >= 4000)),
		// over_8000x: new WinBucket(wagers => wagers.some(wager => wager.win >= 8000)),
		// over_11500x: new WinBucket(wagers => wagers.some(wager => wager.win >= 11500)),
	},
	cheats: {
		main: {},
		bonusbuy: {},
	},

	play({ bet, action, state, variant, promo }): IPlayResponse<IData> {
		return play(bet, action);
	},

	action(strategy): string {
		return null;
	},

	evaluate(type, wagers, data): any {
		return { type, wagers, data };
	},
};

export default index;
