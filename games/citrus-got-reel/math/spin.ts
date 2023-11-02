/**
 * reelAdjust.ts
 *
 * Code affect the reel
 */

import { mathConfig } from "./config/mathConfig";
import {
	CitrusGotReelSymbol,
	CitrusGotReelSymbolValue,
	WildSymbols,
	nonWildSymbols,
	LineWinDetails,
} from "./config/CitrusGotReelSymbol";
import { addWilds, addWilds_loseOrTease, expandWilds, stickWilds, returnSticky } from "./wildsCode";
import { addScatters, countScatters } from "./scattersCode";
import { IntegerRng } from "../../../common/rng/IntegerRng";
import { Position } from "../../../common/reels/Position";
import { LineWinCalculator } from "./calculateLineWins";
import { createReels, createReels_loseOrTease } from "./createReels";
import { pickValueFromDistribution } from "../../../common/distributions/pickValueFromDistribution";
import { baseGameProfile, bonusGameProfile } from "./config/profiles";

export interface ScatterInfo {
	collected: number;
	positions: Position[];
}

export interface SpinResult {
	reelsBefore: CitrusGotReelSymbol[][];
	reelsAfter: CitrusGotReelSymbol[][];
	lineWins: LineWinDetails[];
	scatters: ScatterInfo;
	win: number;
	freeSpinIndex: number;
	debug: any;
}

export function spin(
	integerRng: IntegerRng,
	bet: number,
	coin: number,
	precisionMoneyMapper: (a: number) => number
): SpinResult {
	const currentMaths = mathConfig();
	const scatterSymbols = pickValueFromDistribution(
		integerRng,
		currentMaths.baseGameScattersToAdd
	);
	
	const profile = pickValueFromDistribution(
		integerRng,
		currentMaths.baseGameProfiles
	);

	//const profile='losing';
	console.log('spin profile picked ' + profile as string);
	
	return generateSpin(
		bet,
		integerRng,
		scatterSymbols as number,
		precisionMoneyMapper,
		"base",
		profile as baseGameProfile
	);
}

export function bonusSpins(
	integerRng: IntegerRng,
	bet: number,
	coin: number,
	precisionMoneyMapper: (a: number) => number
): SpinResult[] {
	const currentMaths = mathConfig();
	const bonusSpins = [];
	//generate initial round
	const profile = pickValueFromDistribution(
		integerRng,
		currentMaths.baseGameProfiles
	);

	let bonusSpinRound = generateSpin(
		bet,
		integerRng,
		0,
		precisionMoneyMapper,
		"bonus",
		profile as bonusGameProfile
	);
	bonusSpinRound.reelsAfter = stickWilds(
		bonusSpinRound.reelsAfter,
		integerRng
	);
	bonusSpins.push(bonusSpinRound);

	for (let x = 1; x < currentMaths.bonusGameFreeSpinsAmount; x++) {
		bonusSpinRound = generateSpin(
			bet,
			integerRng,
			0,
			precisionMoneyMapper,
			"bonus",
			profile as bonusGameProfile,
			returnSticky(bonusSpinRound.reelsAfter)
		);
		bonusSpinRound.reelsAfter = stickWilds(
			bonusSpinRound.reelsAfter,
			integerRng
		);
		bonusSpins.push(bonusSpinRound);
	}

	return bonusSpins;
}

function generateSpin(
	bet: number,
	integerRng: IntegerRng,
	// hitrate: any,
	// distOffset: any,
	// stopOffset: any,
	scatterSymbols: number = 0,
	precisionMoneyMapper: (a: number) => number,
	context: "base" | "bonus",
	profile: baseGameProfile | bonusGameProfile,
	reelGrid?: CitrusGotReelSymbol[][]
): SpinResult {
	
	let rows: number, cols: number, initialReels: CitrusGotReelSymbol[][];

	if (reelGrid) {
		cols = reelGrid.length;
		rows = reelGrid[0].length;
		initialReels = [...reelGrid]; // Make a shallow copy of reelGrid
	} else {
		rows = 5;
		cols = 6;
		initialReels = Array.from({ length: cols }, () =>
			Array.from({ length: rows }, () => undefined)
		);
	}

	//If this is a losing or teasing profile, control much more tightly the result

	if((context === 'base') && ((profile === baseGameProfile.losing)||(profile === baseGameProfile.teasing))) {
		return generateSpin_LoseOrTease(integerRng, scatterSymbols, precisionMoneyMapper, profile, initialReels, rows, cols);
	}
		
	const currentMaths = mathConfig();

	const addedWilds = addWilds(integerRng, initialReels, context, profile);
	let expandedWilds = expandWilds(addedWilds);

	if (scatterSymbols > 0) {
		expandedWilds = addScatters(expandedWilds, scatterSymbols, integerRng);
	}	
	
	const hitrateControl = currentMaths.profiles.base[profile].hitRate;
	const symbolDistributionOffset = currentMaths.profiles.base[profile].distOffset;
	const stop = currentMaths.profiles.base[profile].stopOffset;

	const indexReels = createReels(
		6,
		5,
		integerRng,
		symbolDistributionOffset,
		0,
		hitrateControl,
		currentMaths.lineDefines,
		stop,
		expandedWilds
	) as CitrusGotReelSymbol[][];
	const initialGrid = generateInitialReelGrid(
		indexReels,
		addedWilds,
		integerRng
	);

	const scatters =
		scatterSymbols > 0
			? countScatters(indexReels)
			: { collected: 0, positions: [] };

	const CalcLineWins = LineWinCalculator.getInstance();
	const lineWins = CalcLineWins.calculateLineWins(indexReels, bet);
	const win = lineWins.reduce(
		(previousTotalWin, waysWin) => previousTotalWin + waysWin.winAmount,
		0
	);

	return {
		reelsBefore: initialGrid,
		reelsAfter: indexReels,
		lineWins: lineWins,
		scatters: scatters,
		win: precisionMoneyMapper(win),
		freeSpinIndex: 0,
		debug: false,
	};
}

function generateSpin_LoseOrTease(
	integerRng: IntegerRng,
	scatterSymbols: number = 0,
	precisionMoneyMapper: (a: number) => number,
	profile: baseGameProfile | bonusGameProfile,
	initialReels: CitrusGotReelSymbol[][],
	rows: number,
	cols: number
): SpinResult {
		
	console.log('lose or tease generation');
	const addedWilds = addWilds_loseOrTease(integerRng, initialReels, profile,rows, cols);
	let expandedWilds = expandWilds(addedWilds);

	if (scatterSymbols > 0) {
		expandedWilds = addScatters(expandedWilds, scatterSymbols, integerRng);
	}	
	
	const indexReels = createReels_loseOrTease(
		cols,
		rows,
		integerRng,
		expandedWilds
	) as CitrusGotReelSymbol[][];
	
	const initialGrid = generateInitialReelGrid(
		indexReels,
		addedWilds,
		integerRng
	);

	const scatters =
		scatterSymbols > 0
			? countScatters(indexReels)
			: { collected: 0, positions: [] };

	return {
		reelsBefore: initialGrid,
		reelsAfter: indexReels,
		lineWins: [],
		scatters: scatters,
		win: precisionMoneyMapper(0),
		freeSpinIndex: 0,
		debug: false,
	};
}

//reconstruct an initial reel grid
function generateInitialReelGrid(
	generatedSymbols: CitrusGotReelSymbol[][],
	initialWilds: CitrusGotReelSymbol[][],
	integerRng: IntegerRng
): CitrusGotReelSymbol[][] {
	// clone the generatedSymbols array
	const resultGrid: CitrusGotReelSymbol[][] = JSON.parse(
		JSON.stringify(generatedSymbols)
	);

	// Replace wild symbols in resultGrid with placeholders
	for (let i = 0; i < resultGrid.length; i++) {
		for (let j = 0; j < resultGrid[i].length; j++) {
			if (WildSymbols.includes(resultGrid[i][j]?.symbol)) {
				resultGrid[i][j] = {
					symbol: CitrusGotReelSymbolValue.PlaceHolder,
				};
			}
		}
	}

	// Overlay initialWilds onto resultGrid
	for (let i = 0; i < initialWilds.length; i++) {
		for (let j = 0; j < initialWilds[i].length; j++) {
			if (WildSymbols.includes(initialWilds[i][j]?.symbol)) {
				resultGrid[i][j] = initialWilds[i][j];
			}
		}
	}

	// Replace any remaining Placeholders with random symbols
	for (let i = 0; i < resultGrid.length; i++) {
		for (let j = 0; j < resultGrid[i].length; j++) {
			if (
				resultGrid[i][j].symbol === CitrusGotReelSymbolValue.PlaceHolder
			) {
				const randomSymbol =
					nonWildSymbols[
						integerRng.randomInteger(nonWildSymbols.length)
					];
				resultGrid[i][j] = {
					symbol: randomSymbol,
				} as CitrusGotReelSymbol;
			}
		}
	}

	return resultGrid;
}
