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
import { filterByIntersection } from "../../../common/distributions/intersectDistributions";
import { pickIndexFromDistribution } from "../../../common/distributions/pickIndexFromDistribution";
import { FeatureType } from "./config/defines";
//import { DEBUG_DrawPickWeight } from "./debugsupport/Debug_DrawPickWeight";
import { baseGameProfile, bonusGameProfile } from "./config/profiles";

interface WildInfluences {
	positions: Position[];
	rowInfluence: number;
	columnInfluence: number;
}

function deepCloneArray(arr: any[][]): any[][] {
	return arr.map((row) =>
		row.map((cell) => (cell !== undefined ? { ...cell } : undefined))
	);
}

function gridPositionToWildWeight(
	numRows: number,
	numColumns: number,
	row: number,
	column: number,
	influences: WildInfluences[]
): number {
	//NB Treat weight in 10000s to allow more subtlety than just 1,2,3 etc
	//Bias to cell using the

	//Go through all influences

	let totalEffect = 0;

	influences.forEach((influenceSet) => {
		influenceSet.positions.forEach((position) => {
			const distRow = Math.abs(position.row - row) / numRows;
			const distColumn = Math.abs(position.column - column) / numColumns;
			totalEffect +=
				distRow * influenceSet.rowInfluence +
				distColumn * influenceSet.columnInfluence;
		});
	});

	return Math.max(1, Math.floor(10000 - totalEffect * 10000));
}

export function addWilds(
	integerRng: IntegerRng,
	input: CitrusGotReelSymbol[][],
	context: "base" | "bonus",
	profile: baseGameProfile | bonusGameProfile,
): CitrusGotReelSymbol[][] {
	const currentMaths = mathConfig();

	//profile = baseGameProfile.losing;
	//SNC 20231007 -
	//This is the part which needs most tweaking
	//Primarily, the positions of wilds should be weighted towards an ideal placement (probably based on the type of wins wanted)
	//It may also be worth biasing by type in each location or based on other wilds nearby

	if (
		!pickValueFromDistribution(
			integerRng,
			currentMaths.profiles.base[profile].wildFeatureActive
		)
	) {
		return input;
	}

	// Determine the number of wilds to place
	// NOTE - What if there are insufficient positions left on the matrix?
	const numWilds: number = pickValueFromDistribution(
		integerRng,
		currentMaths.profiles.base[profile].initialWilds
	);

	//Although currently the wilds options above do not allow 0, handle the possibility in case the table
	//changes

	if (numWilds === 0) {
		return input;
	}

	// Mapping between FeatureType and CitrusGotReelSymbolValue
	const featureToSymbolMap: Record<
		FeatureType,
		(multiplier: number, direction?, steps?: number) => CitrusGotReelSymbol
	> = {
		[FeatureType.Wild]: (multiplier) => ({
			symbol: CitrusGotReelSymbolValue.Wild,
			multiplier,
			sticky: false,
		}),
		[FeatureType.DirectionalWild]: (multiplier, direction, steps) => ({
			symbol: CitrusGotReelSymbolValue.DirectionalWild,
			multiplier,
			direction: direction || currentMaths.directions[
				integerRng.randomInteger(currentMaths.directions.length)
			] as (typeof currentMaths.directions)[number],
			steps: steps || pickValueFromDistribution(
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

	//Find all possible positions for wilds, sort the weighting afterwards

	const weightedDistributionPositions: Distribution<Position> = {
		values: [],
		weights: [],
	};

	const currentWildPositions_Wild: Position[] = [];
	const currentWildPositions_DirectionalWild: Position[] = [];
	const currentWildPositions_CollectorWild: Position[] = [];
	const currentWildPositions_PayerWild: Position[] = [];

	const numColumns: number = input.length;
	const numRows: number = input[0].length;
	for (let row = 0; row < numRows; row++) {
		for (let column = 0; column < numColumns; column++) {
			if (typeof input[column][row] === "undefined") {
				weightedDistributionPositions.values.push({ row, column });
				weightedDistributionPositions.weights.push(1);
			} else {
				//If it's a wild, note its position and type

				const symbol = input[column][row].symbol;
				switch (symbol) {
					case CitrusGotReelSymbolValue.Wild:
						currentWildPositions_Wild.push({ row, column });
						break;
					case CitrusGotReelSymbolValue.DirectionalWild:
						currentWildPositions_DirectionalWild.push({
							row,
							column,
						});
						break;
					case CitrusGotReelSymbolValue.CollectorWild:
						currentWildPositions_CollectorWild.push({ row, column });
						break;
					case CitrusGotReelSymbolValue.PayerWild:
						currentWildPositions_PayerWild.push({ row, column });
						break;
				}
			}
		}
	}

	//Now, for each wild, weight the choice by the required factors

	for (let i = 0; i < numWilds; i++) {
		//If no more possible positions, abort

		if (weightedDistributionPositions.values.length === 0) {
			break;
		}

		//NB the multiplier and types need better control

		const multiplier = pickValueFromDistribution(
			integerRng,
			currentMaths.profiles.base[profile].initialMultiplier
		);
		const wildType = pickValueFromDistribution(
			integerRng,
			currentMaths.profiles.base[profile].wildLookUp
		);
		
		//Calculate the proper weighting for all choices
		//Bias to or from preferred usefulness position
		//and bias to or from proximity to other wilds


		//Determine what influences to use

		let influences: WildInfluences[] = [];
		const profileWildInfluences = currentMaths.profiles.base[profile].wildInfluences[wildType as string];
		if(profileWildInfluences) {
			//Form the influences from the profile

			if(profileWildInfluences.default) {
				influences.push(profileWildInfluences.default);
			}

			const wildInfluence =profileWildInfluences[FeatureType.Wild as string];
			const directionalWildInfluence = profileWildInfluences[FeatureType.DirectionalWild as string];
			const collectorWildInfluence = profileWildInfluences[FeatureType.CollectorWild as string];
			const payerWildInfluence = profileWildInfluences[FeatureType.PayerWild as string];
			
			if(wildInfluence && (currentWildPositions_Wild.length > 0)) {
				influences.push({positions: currentWildPositions_Wild, rowInfluence: wildInfluence.rowInfluence, columnInfluence: wildInfluence.columnInfluence});
			}
			if(directionalWildInfluence && (currentWildPositions_DirectionalWild.length > 0)) {
				influences.push({positions: currentWildPositions_DirectionalWild, rowInfluence: directionalWildInfluence.rowInfluence, columnInfluence: directionalWildInfluence.columnInfluence});
			}
			if(collectorWildInfluence && (currentWildPositions_CollectorWild.length > 0)) {
				influences.push({positions: currentWildPositions_CollectorWild, rowInfluence: collectorWildInfluence.rowInfluence, columnInfluence: collectorWildInfluence.columnInfluence});
			}
			if(payerWildInfluence && (currentWildPositions_PayerWild.length > 0)) {
				influences.push({positions: currentWildPositions_PayerWild, rowInfluence: payerWildInfluence.rowInfluence, columnInfluence: payerWildInfluence.columnInfluence});
			}
		}
		console.log('influences: ' + JSON.stringify(influences));

		//If no influences applied, set defaults
		//@Will, we should try to ensure this default isn't needed
		if(influences.length === 0)
		{
			console.log('APPLYING DEFAULT WILD INFLUENCES ON PROFILE ' + profile + ' for wildtype ' + wildType as string);
			//Set default influences

			influences=[
				//Centre of board (for now)
				{
					positions: [
						{
							row: (numRows - 1) / 2, 		// These positions set in profile
							column: (numColumns - 1) / 2, 	// These positions set in profile
						},
					],
					rowInfluence: 0.5, 						// These weights set in profile
					columnInfluence: 0.5, 					// These weights set in profile
				},
				// Other wild proximity
				{
					positions: [
						...currentWildPositions_CollectorWild,
						...currentWildPositions_DirectionalWild,
						...currentWildPositions_PayerWild,
						...currentWildPositions_Wild,
					],
					rowInfluence: 0.1, 						// These weights set in profile
					columnInfluence: 0.1,					// These weights set in profile
					
				}
			];
		}

		for (
			let possibleIndex = 0;
			possibleIndex < weightedDistributionPositions.values.length;
			possibleIndex++
		) {
			//Make weight based on the 'ideal position' - for now, the centre of the grid
			const thisPosition =
				weightedDistributionPositions.values[possibleIndex];
			weightedDistributionPositions.weights[possibleIndex] =
				gridPositionToWildWeight(
					numRows,
					numColumns,
					thisPosition.row,
					thisPosition.column,
					influences
				);
		}

		//Debug - draw pick weight
		// DEBUG_DrawPickWeight(
		// 	weightedDistributionPositions,
		// 	numRows,
		// 	numColumns
		// );


		//Choose the available position to use
		let wildData: {row: number, column: number, steps?: number, direction?: string};
		const profileWildMaps: any = currentMaths.profiles.base[profile].wildMaps[wildType as string];
		if(profileWildMaps) {
			const definedWildPositions = filterByIntersection(profileWildMaps, weightedDistributionPositions, false);
			const index = pickIndexFromDistribution(
				integerRng,
				definedWildPositions
			);
			const { row, column } = definedWildPositions.values[index];
			wildData = { row, column };
		}
		else {
			const index = pickIndexFromDistribution(
				integerRng,
				weightedDistributionPositions
			);
			const { row, column } = weightedDistributionPositions.values[index];
			wildData = { row, column };
		}

		if (wildType === "DirectionalWild") {
			wildData.steps = pickValueFromDistribution(integerRng,currentMaths.stepsData);
			if (wildData.column === 0) {
				wildData.direction = "right";
			}
			else if (wildData.column === 5) {
				wildData.direction = "left";
				wildData.steps = pickValueFromDistribution(
					integerRng,
					currentMaths.stepsColumn6Data
				);
			}
			else if (wildData.row === 0) {
				wildData.direction = "down";
			}
			else if (wildData.row === 4) {
				wildData.direction = "up";
			}
			else throw new Error;
		}

		// Remove this position from the list of available positions
		// Changing to looking up the position before removing it,
		// May have pulled position from intersection with another distribution
		const indexToRemove = weightedDistributionPositions.values.findIndex(pos => pos.row === wildData.row && pos.column === wildData.column);

		weightedDistributionPositions.values.splice(indexToRemove, 1);
		weightedDistributionPositions.weights.splice(indexToRemove, 1);

		// Use the mapping to generate the new symbol
		const newSymbol = featureToSymbolMap[wildType as FeatureType](
			multiplier as number,
			wildData.direction,  // passing direction
			wildData.steps       // passing steps
		);

		input[wildData.column][wildData.row] = newSymbol;

		//Add the position to the list of current wilds

		switch (newSymbol.symbol) {
			case CitrusGotReelSymbolValue.Wild:
				currentWildPositions_Wild.push({ row: wildData.row, column: wildData.column });
				break;
			case CitrusGotReelSymbolValue.DirectionalWild:
				currentWildPositions_DirectionalWild.push({
					row: wildData.row,
					column: wildData.column,
				});
				break;
			case CitrusGotReelSymbolValue.CollectorWild:
				currentWildPositions_CollectorWild.push({ row: wildData.row, column: wildData.column });
				break;
			case CitrusGotReelSymbolValue.PayerWild:
				currentWildPositions_PayerWild.push({row: wildData.row, column: wildData.column });
				break;
		}
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