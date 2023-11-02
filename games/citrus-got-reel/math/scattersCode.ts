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
	numScatters: number,
	integerRng: IntegerRng
): CitrusGotReelSymbol[][] {
	if (numScatters === 0) {
		return input;
	}
	const newInput: CitrusGotReelSymbol[][] = deepCloneArray(input);
	// Create an array of available positions for placing scatters
	const availablePositions: Position[] = [];
	for (let row = 0; row < newInput.length; row++) {
		for (let column = 0; column < newInput[row].length; column++) {
			if (newInput[row][column] === undefined) {
				// Only consider empty positions
				availablePositions.push({ row, column });
			}
		}
	}

	// Check if there are enough available positions for scatters
	if (availablePositions.length < numScatters) {
		console.warn("Not enough positions to place scatters");
		return newInput; // Return the input as is
	}

    //SNC - 20231006 - TODO - get all RNG responses in batch, then apply as needed

	// Randomly place the scatters
	for (let i = 0; i < numScatters; i++) {
		const randomIndex = integerRng.randomInteger(availablePositions.length);
		const { row, column } = availablePositions[randomIndex];

		// Remove this position from the list of available positions
		availablePositions.splice(randomIndex, 1);

		// Add the scatter symbol
		newInput[row][column] = { symbol: CitrusGotReelSymbolValue.Scatter };
	}

	return newInput;
}

export function applyScattersBetweenGrids(sourceGrid:CitrusGotReelSymbol[][], destGrid:CitrusGotReelSymbol[][]) :CitrusGotReelSymbol[][] {
	const newDestGrid: CitrusGotReelSymbol[][] = deepCloneArray(destGrid);

	for (let row = 0; row < newDestGrid.length; row++) {
		for (let column = 0; column < newDestGrid[row].length; column++) {
			if (sourceGrid[row][column].symbol === CitrusGotReelSymbolValue.Scatter) {
				//Copy it
				console.log('copy grid...' + row + ',' + column)
				newDestGrid[row][column]=sourceGrid[row][column];
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

