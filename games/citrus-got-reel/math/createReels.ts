import { getRNG } from "@slotify/gdk/lib/rng/rng";
import { IntegerRng } from "../../../common/rng/IntegerRng";
import {
	CitrusGotReelSymbol,
	CitrusGotReelSymbolValue,
	WildSymbols,
} from "./config/CitrusGotReelSymbol";

export function createReels(
	columns: number,
	rows: number,
	integerRng: IntegerRng,
	distributionOffset: number = 0.5,
	stackingOffset: number = 0.5,
	hitRateOffset: number = 0.5,
	lineDefines: number[][],
	stopReel: number = -1,
	existingReels?: CitrusGotReelSymbol[][]
): CitrusGotReelSymbol[][] {
	const reels = existingReels || Array.from({ length: columns }, () => []);
	const multiplier = 100000;
	const generateSymbol = (distOffset: number): CitrusGotReelSymbol => {
		let symbol: number;
		do {
			const weights: number[] = Array.from({ length: 10 }, (_, i) => {
				return Math.pow(i + 1, distOffset * 4 - 2);
			});
			const totalWeight = weights.reduce((acc, w) => acc + w, 0);
			let randomNum = integerRng.randomInteger(totalWeight);
			symbol = 0;
			for (let i = 0; i < weights.length; i++) {
				if (randomNum < weights[i]) {
					symbol = i;
					break;
				}
				randomNum -= weights[i];
			}
		} while (symbol === CitrusGotReelSymbolValue.Scatter);

		return {
			symbol: symbol as Exclude<
				CitrusGotReelSymbolValue,
				| CitrusGotReelSymbolValue.Wild
				| CitrusGotReelSymbolValue.DirectionalWild
				| CitrusGotReelSymbolValue.CollectorWild
				| CitrusGotReelSymbolValue.PayerWild
			>,
		};
	};

	const applyWinLineLogic = (
		col: number,
		row: number
	): CitrusGotReelSymbol => {
		let selectedSymbol: CitrusGotReelSymbolValue | null = null;
		const influencingSymbols: CitrusGotReelSymbol[] = [];

		for (const line of lineDefines) {
			if (line[col] !== row) continue;

			for (let i = 0; i < col; i++) {
				const symbol = reels[i][line[i]];
				if (!symbol) continue;
				influencingSymbols.push(symbol);
			}

			if (influencingSymbols.length === 0) continue;

			for (let i = influencingSymbols.length - 1; i >= 0; i--) {
				const isWild = WildSymbols.includes(
					influencingSymbols[i].symbol
				);

				if (!isWild) continue;

				if (i === 0) {
					influencingSymbols[i] = generateSymbol(distributionOffset);
					break;
				}

				influencingSymbols.splice(i, 1);
			}
		}

		const randomInteger = integerRng.randomInteger(multiplier);
		const shouldMatch = randomInteger < hitRateOffset * multiplier;

		const allSymbols = new Set(Array.from({ length: 10 }, (_, i) => i));
		const availableSymbols = [...allSymbols].filter(
			(s) => !influencingSymbols.some((is) => is.symbol === s)
		);

		if (col === stopReel || !shouldMatch) {
			if (availableSymbols.length > 0) {
				selectedSymbol =
					availableSymbols[
						integerRng.randomInteger(availableSymbols.length)
					];
			}
		}

		if (selectedSymbol === null) {
			if (influencingSymbols.length === 0) {
				selectedSymbol = generateSymbol(distributionOffset).symbol;
			} else if (shouldMatch) {
				selectedSymbol =
					influencingSymbols[
						integerRng.randomInteger(influencingSymbols.length)
					].symbol;
			} else {
				// shouldMatch is negative
				if (availableSymbols.length > 0) {
					selectedSymbol =
						availableSymbols[
							integerRng.randomInteger(availableSymbols.length)
						];
				} else {
					selectedSymbol = generateSymbol(distributionOffset).symbol; // default
				}
			}
		}

		return {
			symbol: selectedSymbol as Exclude<
				CitrusGotReelSymbolValue,
				| CitrusGotReelSymbolValue.Wild
				| CitrusGotReelSymbolValue.DirectionalWild
				| CitrusGotReelSymbolValue.CollectorWild
				| CitrusGotReelSymbolValue.PayerWild
			>,
		};
	};

	for (let row = 0; row < rows; row++) {
		if (reels[0][row] === undefined) {
			reels[0][row] = generateSymbol(distributionOffset);
		}
	}

	for (let col = 1; col < columns; col++) {
		reels[col] = reels[col] || [];
		for (let row = 0; row < rows; row++) {
			if (reels[col][row] !== undefined) continue;
			let newSymbol: CitrusGotReelSymbol;

			const randomInteger = integerRng.randomInteger(multiplier);
			if (
				row > 0 &&
				randomInteger < stackingOffset * multiplier &&
				!WildSymbols.includes(reels[col][row - 1].symbol)
			) {
				newSymbol = reels[col][row - 1];
			} else {
				newSymbol = applyWinLineLogic(col, row);
			}

			// Ensure the symbol isn't a scatter
			while (newSymbol.symbol === CitrusGotReelSymbolValue.Scatter) {
				newSymbol = generateSymbol(distributionOffset);
			}

			reels[col][row] = newSymbol;
		}
	}

	return reels;
}

export function createReels_loseOrTease(
	columns: number,
	rows: number,
	integerRng: IntegerRng,
	existingReels: CitrusGotReelSymbol[][]
): CitrusGotReelSymbol[][] {
	const reels = existingReels;
	const availableSymbols: CitrusGotReelSymbolValue[] = [
		CitrusGotReelSymbolValue.Ten,
		CitrusGotReelSymbolValue.Jack,
		CitrusGotReelSymbolValue.Queen,
		CitrusGotReelSymbolValue.King,
		CitrusGotReelSymbolValue.Ace,
		CitrusGotReelSymbolValue.High1,
		CitrusGotReelSymbolValue.High2,
		CitrusGotReelSymbolValue.High3,
		CitrusGotReelSymbolValue.High4,
		CitrusGotReelSymbolValue.High5,
	];

	//Create stripe symbols L+R randomly!

	const stripeSymbolsL: CitrusGotReelSymbolValue[] = [
		CitrusGotReelSymbolValue.Ten,
		CitrusGotReelSymbolValue.Jack,
		CitrusGotReelSymbolValue.Queen,
		CitrusGotReelSymbolValue.King,
		CitrusGotReelSymbolValue.Ace,
		CitrusGotReelSymbolValue.High1,
		CitrusGotReelSymbolValue.High2,
		CitrusGotReelSymbolValue.High3,
		CitrusGotReelSymbolValue.High4,
		CitrusGotReelSymbolValue.High5,
	];

	const stripeSymbolsR: CitrusGotReelSymbolValue[] = [];

	for (let i = 0; i < 5; i++) {
		const moveIndex: number = integerRng.randomInteger(
			stripeSymbolsL.length
		);
		stripeSymbolsR.push(stripeSymbolsL.splice(moveIndex, 1)[0]);
	}

	const generateReel = (reel, symbolsToPickFrom) => {
		for (let cell = 0; cell < rows; cell++) {
			if (reels[reel][cell] === undefined) {
				reels[reel][cell] = {
					symbol: symbolsToPickFrom[
						integerRng.randomInteger(symbolsToPickFrom.length)
					],
				} as CitrusGotReelSymbol;
			}
		}
	};

	//Build reels randomly for reels 3-5

	for (let reel = 3; reel < columns; reel++) {
		generateReel(reel, availableSymbols);
	}

	let chosenStripeType: number = -1; //0 - stripe 1+2, 1 is stripe 0+2, 2 is stripe 0+1

	for (let reel = 0; reel <= 2 && chosenStripeType === -1; reel++) {
		for (let cell = 0; cell < rows; cell++) {
			if (reels[reel][cell] !== undefined) {
				//Presuming a wild if not a scatter

				if (
					reels[reel][cell].symbol !==
					CitrusGotReelSymbolValue.Scatter
				) {
					//Chosen this reel as stripe type
					chosenStripeType = reel;
					break;
				}
			}
		}
	}

	//If no stripetype chosen, pick randomly

	if (chosenStripeType === -1) {
		chosenStripeType = integerRng.randomInteger(3);
	}

	//Stripe reels
	//Quick note: Could just use the random allocation of stripes direct to reel - would remove stacking!

	//console.log("stripe type " + chosenStripeType);
	switch (chosenStripeType) {
		case 0:
			generateReel(0, availableSymbols);
			generateReel(1, stripeSymbolsL);
			generateReel(2, stripeSymbolsR);
			break;
		case 1:
			generateReel(0, stripeSymbolsL);
			generateReel(1, availableSymbols);
			generateReel(2, stripeSymbolsR);
			break;
		case 2:
			generateReel(0, stripeSymbolsL);
			generateReel(1, stripeSymbolsR);
			generateReel(2, availableSymbols);
			break;
	}

	return reels;
}
