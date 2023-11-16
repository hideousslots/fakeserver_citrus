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

type ReelRowPosition = {
	reel: number;
	row: number;
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

	//Check all reels and check the space available in each

	const availableReels: ReelRowPosition[][] = [];

	for(let reel =0; reel < newInput.length; reel++) {	
		const thisReel: ReelRowPosition[] = [];
		for(let row = 0; row < newInput[reel].length; row++) {
			if(newInput[reel][row] === undefined) {
				thisReel.push({reel, row});
			}
		}
		if(thisReel.length > 0) {
			availableReels.push(thisReel);
		}
	}

	//Make sure the available reels is suitable for the required scatters

	if(availableReels.length < numScatters) {
		console.warn("Not enough positions to place scatters");
		return newInput; // Return the input as is
	}

	// Randomly place the scatters
	for (let i = 0; i < numScatters; i++) {
		let randomIndex = integerRng.randomInteger(availableReels.length);
		const thisReel: ReelRowPosition[] = availableReels[randomIndex];
		availableReels.splice(randomIndex, 1);
		//Pick a position
		randomIndex = integerRng.randomInteger(thisReel.length);

		// Add the scatter symbol
		newInput[thisReel[randomIndex].reel][thisReel[randomIndex].row] = { symbol: CitrusGotReelSymbolValue.Scatter };
	}

	return newInput;
}

export function applyScattersBetweenGrids(sourceGrid:CitrusGotReelSymbol[][], destGrid:CitrusGotReelSymbol[][]) :CitrusGotReelSymbol[][] {
	const newDestGrid: CitrusGotReelSymbol[][] = deepCloneArray(destGrid);

	for (let row = 0; row < newDestGrid.length; row++) {
		for (let column = 0; column < newDestGrid[row].length; column++) {
			if (sourceGrid[row][column].symbol === CitrusGotReelSymbolValue.Scatter) {
				//Copy it
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

