/**
 * scattersCode.ts
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

export function addScatters(
	input: CitrusGotReelSymbol[][],
	packedData: number
): CitrusGotReelSymbol[][] {
	if (packedData === 0) {
		return input;
	}
	const newInput: CitrusGotReelSymbol[][] = deepCloneArray(input);
	// Create an array of available positions for placing scatters

	// Add the scatter symbols
	for (let i = 0; i < ((packedData >> 24) & 0xff); i++) {
		const reel: number = (packedData >> (i * 8)) & 0xf;
		const row: number = (packedData >> (i * 8 + 4)) & 0xf;
		newInput[reel][row] = { symbol: CitrusGotReelSymbolValue.Scatter };
	}

	return newInput;
}

export function applyScattersBetweenGrids(
	sourceGrid: CitrusGotReelSymbol[][],
	destGrid: CitrusGotReelSymbol[][]
): CitrusGotReelSymbol[][] {
	const newDestGrid: CitrusGotReelSymbol[][] = deepCloneArray(destGrid);

	for (let row = 0; row < newDestGrid.length; row++) {
		for (let column = 0; column < newDestGrid[row].length; column++) {
			if (
				sourceGrid[row][column].symbol ===
				CitrusGotReelSymbolValue.Scatter
			) {
				//Copy it
				newDestGrid[row][column] = sourceGrid[row][column];
			}
		}
	}
	return newDestGrid;
}

export function countScatters(matrix: CitrusGotReelSymbol[][]): ScatterInfo {
	//SNC - 20231006 - TODO - Why use count? position.length?

	let count = 0;
	const positions: { column: number; row: number }[] = [];

	for (let i = 0; i < matrix.length; i++) {
		for (let j = 0; j < matrix[i].length; j++) {
			if (matrix[i][j].symbol === CitrusGotReelSymbolValue.Scatter) {
				count++;
				positions.push({ column: i, row: j }); // Adding position of scatter symbols
			}
		}
	}

	return {
		collected: count,
		positions: positions,
	};
}
