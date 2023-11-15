/**
 * presetScattersCode.ts
 *
 * code which handles scatters functionality
 *
 */

import {
	CitrusGotReelSymbol,
	CitrusGotReelSymbolValue,
} from "./config/CitrusGotReelSymbol";

import { Position } from "../../../common/reels/Position";
import { IntegerRng } from "../../../common/rng/IntegerRng";
import { ScatterInfo } from "./spin";

function deepCloneArray(arr: any[][]): any[][] {
	return arr.map((row) =>
		row.map((cell) => (cell !== undefined ? { ...cell } : undefined))
	);
}

export function addScattersFromPreset(
	input: CitrusGotReelSymbol[][],
	scatterData: number
): CitrusGotReelSymbol[][] {
	if (scatterData <= 0) {
		return input;
	}
	const newInput: CitrusGotReelSymbol[][] = deepCloneArray(input);

	//Apply the scatters as needed

	for (let i = 0; i < ((scatterData >> 24) & 0xff); i++) {
		const reel:number = (scatterData>>(i<<3))&0xf;
		const row:number = (scatterData>>((i<<3)+4))&0xf;

		newInput[reel][row] = { symbol: CitrusGotReelSymbolValue.Scatter };
	}

	return newInput;
}
