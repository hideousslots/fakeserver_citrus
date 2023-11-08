import rng from "@slotify/gdk/lib/rng/rng";
import FloatSourcedIntegerRng from "../../../common/rng/FloatSourcedIntegerRng";
import { mathConfig, anteMode } from "./config/mathConfig";
import { ActionType } from "./config/defines";
import { wildanalysisspin, bonusSpins } from "./wildanalysisspin";

export default function wildanalysisplay(
	stake: number,
	action: string,
	control: any
) {
	anteMode(false);
	const currentMaths = mathConfig();
	let coin: number = 0;
	const bet: number = stake; //For main variation, stake is bet. However, stake is the full amount of the wager, including (if needed) ante or bonus scalers

	const precisionMoneyMapper = (money) => Number(money.toFixed(8));
	const integerRng = new FloatSourcedIntegerRng(() => rng());
	let bonusGameSpins = [];
	let baseGameSpin = null;
	let accumulatedRoundWin = 0;

	if (action === ActionType.Main) {
		//Normal play
		coin = precisionMoneyMapper(bet / currentMaths.coinsPerBet_main);
		baseGameSpin = wildanalysisspin(
			integerRng,
			bet,
			coin,
			precisionMoneyMapper,
			control
		);
	} else if (action === ActionType.Ante) {
		throw "invalid Action";
	} else if (action === ActionType.BonusBuy) {
		throw "invalid Action";
	} else {
		throw "invalid Action";
	}

	accumulatedRoundWin = baseGameSpin.win;

	// if (
	// 	baseGameSpin.scatters.collected ===
	// 	currentMaths.scattersTriggeringBonusAmount
	// ) {
	// 	bonusGameSpins = bonusSpins(
	// 		integerRng,
	// 		bet,
	// 		coin,
	// 		precisionMoneyMapper
	// 	);
	// 	const bonusGameWinnings = bonusGameSpins.reduce(
	// 		(acc, obj) => acc + obj.win,
	// 		0
	// 	);
	// 	accumulatedRoundWin = baseGameSpin.win + bonusGameWinnings;
	// }

	return {
		win: precisionMoneyMapper(accumulatedRoundWin),
		data: { action, stake, bet, coin, baseGameSpin, bonusGameSpins },
	};
}
