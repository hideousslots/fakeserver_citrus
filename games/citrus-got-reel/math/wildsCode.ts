/**
 * wildsCode.ts
 *
 * code which handles wilds functionality
 *
 */

import {
	CitrusGotReelSymbol,
	CitrusGotReelSymbolValue,
	WildSymbols,
} from "./config/CitrusGotReelSymbol";

import { mathConfig } from "./config/mathConfig";
import { Position } from "../../../common/reels/Position";
import { IntegerRng } from "../../../common/rng/IntegerRng";
import { pickValueFromDistribution } from "../../../common/distributions/pickValueFromDistribution";
import { Distribution } from "../../../common/distributions/Distribution";
import { pickIndexFromDistribution } from "../../../common/distributions/pickIndexFromDistribution";
import { FeatureType } from "./config/defines";

function deepCloneArray(arr: any[][]): any[][] {
	return arr.map((row) =>
		row.map((cell) => (cell !== undefined ? { ...cell } : undefined))
	);
}

function gridPositionToWildWeight(row: number, column: number, idealRow: number, idealColumn: number, distanceScale: number): number {
	
	//NB Treat weight in 1000s to allow more subtlety than just 1,2,3 etc
	//Use average linear distance from ideal to weight the choice.
	//Dist = (dist in rows + dist in columns /2)
	//Simple bias towards the middle of the ideal target

	const distRow = Math.abs(idealRow - row);
	const distColumn = Math.abs(idealColumn - column);
 	const distanceValue = (distRow + distColumn) * 1000 / 2;

	return Math.max(1, 1000 - (distanceValue * distanceScale * 1000));
}

export function addWilds(
	integerRng: IntegerRng,
	input: CitrusGotReelSymbol[][],
	context: "base" | "bonus"
): CitrusGotReelSymbol[][] {
	const currentMaths = mathConfig();

  //SNC 20231007 - 
  //This is the part which needs most tweaking
  //Primarily, the positions of wilds should be weighted towards an ideal placement (probably based on the type of wins wanted)
  //It may also be worth biasing by type in each location or based on other wilds nearby

	if (
		!pickValueFromDistribution(
			integerRng,
			currentMaths.wildFeatureActive[context]
		)
	) {
		return input;
	}

	// Determine the number of wilds to place
	const numWilds: number = pickValueFromDistribution(
		integerRng,
		currentMaths.initialWilds[context]
	);

	/// Create an array of available positions for placing wilds
	const availablePositions: Position[] = [];
	const availablePositionWeights: number[] = [];
	const numRows: number = input.length;
	const numColumns: number = input[0].length;
	for (let row = 0; row < numRows; row++) {
		for (let column = 0; column < numColumns; column++) {
			if (typeof input[row][column] === "undefined") {
				availablePositions.push({ row, column });
				//Make weight based on the 'ideal position' - for now, the centre of the grid
				availablePositionWeights.push(gridPositionToWildWeight(row,column,numRows / 2,numColumns / 2,0.25));
			}
		}
	}

	//Combine positions and weights into search distribution

	const distributionPositions: Distribution<Position> = {values: availablePositions, weights: availablePositionWeights};

	// Mapping between FeatureType and CitrusGotReelSymbolValue
	const featureToSymbolMap: Record<
		FeatureType,
		(multiplier: number) => CitrusGotReelSymbol
	> = {
		[FeatureType.Wild]: (multiplier) => ({
			symbol: CitrusGotReelSymbolValue.Wild,
			multiplier,
			sticky: false,
		}),
		[FeatureType.DirectionalWild]: (multiplier) => ({
			symbol: CitrusGotReelSymbolValue.DirectionalWild,
			multiplier,
			direction: currentMaths.directions[
				integerRng.randomInteger(currentMaths.directions.length)
			] as (typeof currentMaths.directions)[number],
			steps: pickValueFromDistribution(
				integerRng,
				currentMaths.stepsData
			),
			sticky: false,
		}),
		[FeatureType.CollectorWild]: (multiplier) => ({
			symbol: CitrusGotReelSymbolValue.CollectorWild,
			multiplier,
			sticky: false,
		}),
		[FeatureType.PayerWild]: (multiplier) => ({
			symbol: CitrusGotReelSymbolValue.PayerWild,
			multiplier,
			sticky: false,
		}),
	};

	// Place the wilds
	for (let i = 0; i < numWilds; i++) {
		// No more available positions
		if (availablePositions.length === 0) {
			break;
		}

		//snc 

		const multiplier = pickValueFromDistribution(
			integerRng,
			currentMaths.initialMultiplier[context]
		);
		const wildType = pickValueFromDistribution(
			integerRng,
			currentMaths.wildLookUp
		);
		const randomIndex = pickIndexFromDistribution(integerRng, distributionPositions);
		const { row, column } = distributionPositions.values[randomIndex];

		// Remove this position from the list of available positions
		distributionPositions.values.splice(randomIndex, 1);
		distributionPositions.weights.splice(randomIndex, 1);

		// Use the mapping to generate the new symbol
		const newSymbol = featureToSymbolMap[wildType as FeatureType](
			multiplier as number
		);

		input[row][column] = newSymbol;
	}

	return input;
}

export function expandWilds(
	input: CitrusGotReelSymbol[][]
): CitrusGotReelSymbol[][] {
	const rows = input.length;
	const columns = input[0].length;

	// Copy original grid
	const newInput = deepCloneArray(input);

	//payer wilds
	for (let row = 0; row < newInput.length; row++) {
		for (let col = 0; col < newInput[row].length; col++) {
			const currentSymbol = newInput[row][col];
			if (currentSymbol?.symbol === CitrusGotReelSymbolValue.PayerWild) {
				const currentMultiplier = currentSymbol.multiplier;

				// Found a payer wild, update all other wilds in the grid
				for (let i = 0; i < newInput.length; i++) {
					for (let j = 0; j < newInput[i].length; j++) {
						// Skip the current payer wild so it doesn't add to itself
						if (i === row && j === col) {
							continue;
						}

						const targetSymbol = newInput[i][j];
						if (WildSymbols.includes(targetSymbol?.symbol)) {
							targetSymbol.multiplier += currentMultiplier;
						}
					}
				}
			}
		}
	}

	//directional wilds
	for (let row = 0; row < rows; row++) {
		for (let column = 0; column < columns; column++) {
			const currentSymbol = input[row][column];

			if (
				currentSymbol?.symbol ===
				CitrusGotReelSymbolValue.DirectionalWild
			) {
				const directionalSymbol = currentSymbol as {
					symbol: CitrusGotReelSymbolValue.DirectionalWild;
					multiplier: number;
					direction: "up" | "down" | "left" | "right";
					steps: number;
					sticky: boolean;
				};
				const { direction, steps, multiplier } = directionalSymbol;

				let newRow = row;
				let newColumn = column;

				for (let step = 0; step < steps; step++) {
					switch (direction) {
						case "up":
							newColumn -= 1;
							break;
						case "down":
							newColumn += 1;
							break;
						case "left":
							newRow -= 1;
							break;
						case "right":
							newRow += 1;
							break;
					}

					// Check if the new position is out of bounds
					if (
						newRow < 0 ||
						newRow >= rows ||
						newColumn < 0 ||
						newColumn >= columns
					) {
						break;
					}

					const targetSymbol = newInput[newRow][newColumn];

					if (WildSymbols.includes(targetSymbol?.symbol)) {
						// targetSymbol has a multiplier property
						targetSymbol.multiplier += multiplier;
					} else {
						newInput[newRow][newColumn] = {
							symbol: CitrusGotReelSymbolValue.Wild,
							multiplier: multiplier,
							sticky: false,
						};
					}
				}
			}
		}
	}

    //SNC - 20231006 - TODO - Step through, build list of positions of wilds, then go through and collect as needed
	//NB Having confirmed, it is the idea the collectors will process top to bottom, left to right. This means that
	//with 2 collectors on the board the rightmost-lowermost will have accumulated more each prior collector will have added
	//its multiplier in before being itself added to the rightmost-lowermost

	//collector wilds
	for (let row = 0; row < newInput.length; row++) {
		for (let col = 0; col < newInput[row].length; col++) {
			const currentSymbol = newInput[row][col];
			if (
				currentSymbol?.symbol === CitrusGotReelSymbolValue.CollectorWild
			) {
				let totalMultiplier = 0;

				// Found a collector wild, collect multipliers from all wilds in the grid
				for (let i = 0; i < newInput.length; i++) {
					for (let j = 0; j < newInput[i].length; j++) {
						// Skip the current collector wild so it doesn't add to itself
						if (i === row && j === col) {
							continue;
						}

						const targetSymbol = newInput[i][j];
						if (WildSymbols.includes(targetSymbol?.symbol)) {
							totalMultiplier += targetSymbol.multiplier;
						}
					}
				}

				// Add the total multiplier to the current collector wild
				currentSymbol.multiplier += totalMultiplier;
			}
		}
	}

	return newInput;
}

export function stickWilds(
	input: CitrusGotReelSymbol[][],
	integerRng
): CitrusGotReelSymbol[][] {
	const currentMaths = mathConfig();


  	//SNC - 20231006 - TODO - Step through, count how many need a response from RNG, get all responses in batch, then apply as needed

	// Create a deep copy of the input to avoid mutating the original
	const result = deepCloneArray(input);

	for (let row = 0; row < result.length; row++) {
		for (let column = 0; column < result[row].length; column++) {
			if (WildSymbols.includes(result[row][column].symbol)) {
				if (
					pickValueFromDistribution(
						integerRng,
						currentMaths.wildsStick
					)
				) {
					result[row][column].sticky = true;
				}
			}
		}
	}

	return result;
}

export function returnSticky(
	matrix: CitrusGotReelSymbol[][]
): (CitrusGotReelSymbol | undefined)[][] {
	return matrix.map((row) =>
		row.map((symbol) =>
			"sticky" in symbol && symbol.sticky ? symbol : undefined
		)
	);
}
