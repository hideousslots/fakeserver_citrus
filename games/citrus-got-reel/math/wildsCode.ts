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
	profile: baseGameProfile | bonusGameProfile
): CitrusGotReelSymbol[][] {
	const currentMaths = mathConfig();

	if (
		!pickValueFromDistribution(
			integerRng,
			currentMaths.profiles.base[profile].wildFeatureActive
		)
	) {
		return input;
	}

	// Determine the number of wilds to place

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
			direction:
				direction ||
				(currentMaths.directions[
					integerRng.randomInteger(currentMaths.directions.length)
				] as (typeof currentMaths.directions)[number]),
			steps:
				steps ||
				pickValueFromDistribution(integerRng, currentMaths.stepsData),
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
						currentWildPositions_CollectorWild.push({
							row,
							column,
						});
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

		let multiplier = pickValueFromDistribution(
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
		const profileWildInfluences =
			currentMaths.profiles.base[profile].wildInfluences[
			wildType as string
			];
		if (profileWildInfluences) {
			//Form the influences from the profile

			if (profileWildInfluences.default) {
				influences.push(profileWildInfluences.default);
			}

			const wildInfluence =
				profileWildInfluences[FeatureType.Wild as string];
			const directionalWildInfluence =
				profileWildInfluences[FeatureType.DirectionalWild as string];
			const collectorWildInfluence =
				profileWildInfluences[FeatureType.CollectorWild as string];
			const payerWildInfluence =
				profileWildInfluences[FeatureType.PayerWild as string];

			if (wildInfluence && currentWildPositions_Wild.length > 0) {
				influences.push({
					positions: currentWildPositions_Wild,
					rowInfluence: wildInfluence.rowInfluence,
					columnInfluence: wildInfluence.columnInfluence,
				});
			}
			if (
				directionalWildInfluence &&
				currentWildPositions_DirectionalWild.length > 0
			) {
				influences.push({
					positions: currentWildPositions_DirectionalWild,
					rowInfluence: directionalWildInfluence.rowInfluence,
					columnInfluence: directionalWildInfluence.columnInfluence,
				});
			}
			if (
				collectorWildInfluence &&
				currentWildPositions_CollectorWild.length > 0
			) {
				influences.push({
					positions: currentWildPositions_CollectorWild,
					rowInfluence: collectorWildInfluence.rowInfluence,
					columnInfluence: collectorWildInfluence.columnInfluence,
				});
			}
			if (
				payerWildInfluence &&
				currentWildPositions_PayerWild.length > 0
			) {
				influences.push({
					positions: currentWildPositions_PayerWild,
					rowInfluence: payerWildInfluence.rowInfluence,
					columnInfluence: payerWildInfluence.columnInfluence,
				});
			}
		}
		// console.log('influences: ' + JSON.stringify(influences));

		//If no influences applied, set defaults
		//@Will, we should try to ensure this default isn't needed
		if (influences.length === 0) {
			// console.log('APPLYING DEFAULT WILD INFLUENCES ON PROFILE ' + profile + ' for wildtype ' + wildType as string);
			//Set default influences

			influences = [
				//Centre of board (for now)
				{
					positions: [
						{
							row: (numRows - 1) / 2, // These positions set in profile
							column: (numColumns - 1) / 2, // These positions set in profile
						},
					],
					rowInfluence: 0.5, // These weights set in profile
					columnInfluence: 0.5, // These weights set in profile
				},
				// Other wild proximity
				{
					positions: [
						...currentWildPositions_CollectorWild,
						...currentWildPositions_DirectionalWild,
						...currentWildPositions_PayerWild,
						...currentWildPositions_Wild,
					],
					rowInfluence: 0.1, // These weights set in profile
					columnInfluence: 0.1, // These weights set in profile
				},
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
		let wildData: {
			row: number;
			column: number;
			steps?: number;
			direction?: string;
		};
		const profileWildMaps: any =
			currentMaths.profiles.base[profile].wildMaps[wildType as string];
		if (profileWildMaps) {
			const definedWildPositions = filterByIntersection(
				profileWildMaps,
				weightedDistributionPositions,
				false
			);
			const index = pickIndexFromDistribution(
				integerRng,
				definedWildPositions
			);
			const { row, column } = definedWildPositions.values[index];
			wildData = { row, column };
		} else {
			const index = pickIndexFromDistribution(
				integerRng,
				weightedDistributionPositions
			);
			const { row, column } = weightedDistributionPositions.values[index];
			wildData = { row, column };
		}

		//Force any collector's multiplier to 1

		if (wildType === FeatureType.CollectorWild) {
			multiplier = 1;
		}

		if (wildType === FeatureType.DirectionalWild) {
			multiplier = 1;
		}

		if (wildType === "DirectionalWild") {
			const numRows = 5; // Grid rows
			const numColumns = 6; // Grid columns

			// Determine initial steps
			if (wildData.column === numColumns - 1) { // Column 6 (index 5)
				wildData.steps = pickValueFromDistribution(
					integerRng,
					currentMaths.profiles.base[profile].stepsColumn6Data
				);
			} else {
				wildData.steps = pickValueFromDistribution(
					integerRng,
					currentMaths.profiles.base[profile].stepsData
				);
			}

			// Determine the direction based on the wild's position
			if (wildData.column === 0) {
				wildData.direction = "right";
				wildData.steps = Math.min(wildData.steps, numColumns - 1 - wildData.column);
			} else if (wildData.column === numColumns - 1) {
				wildData.direction = "left";
				wildData.steps = Math.min(wildData.steps, wildData.column);
			} else if (wildData.row === 0) {
				wildData.direction = "down";
				wildData.steps = Math.min(wildData.steps, numRows - 1 - wildData.row);
			} else if (wildData.row === numRows - 1) {
				wildData.direction = "up";
				wildData.steps = Math.min(wildData.steps, wildData.row);
			} else {
				// In the middle, pick a random direction
				wildData.direction = pickValueFromDistribution(integerRng, {
					values: ["up", "down", "left", "right"],
					weights: [1, 1, 1, 1],
				});

				// Adjust steps based on direction to stay within bounds
				switch (wildData.direction) {
					case "up":
						wildData.steps = Math.min(wildData.steps, wildData.row);
						break;
					case "down":
						wildData.steps = Math.min(wildData.steps, numRows - 1 - wildData.row);
						break;
					case "left":
						wildData.steps = Math.min(wildData.steps, wildData.column);
						break;
					case "right":
						wildData.steps = Math.min(wildData.steps, numColumns - 1 - wildData.column);
						break;
				}
			}
		}


		// Remove this position from the list of available positions
		// Changing to looking up the position before removing it,
		// May have pulled position from intersection with another distribution
		const indexToRemove = weightedDistributionPositions.values.findIndex(
			(pos) => pos.row === wildData.row && pos.column === wildData.column
		);

		weightedDistributionPositions.values.splice(indexToRemove, 1);
		weightedDistributionPositions.weights.splice(indexToRemove, 1);

		// Use the mapping to generate the new symbol
		const newSymbol = featureToSymbolMap[wildType as FeatureType](
			multiplier as number,
			wildData.direction, // passing direction
			wildData.steps // passing steps
		);

		input[wildData.column][wildData.row] = newSymbol;

		//Add the position to the list of current wilds

		switch (newSymbol.symbol) {
			case CitrusGotReelSymbolValue.Wild:
				currentWildPositions_Wild.push({
					row: wildData.row,
					column: wildData.column,
				});
				break;
			case CitrusGotReelSymbolValue.DirectionalWild:
				currentWildPositions_DirectionalWild.push({
					row: wildData.row,
					column: wildData.column,
				});
				break;
			case CitrusGotReelSymbolValue.CollectorWild:
				currentWildPositions_CollectorWild.push({
					row: wildData.row,
					column: wildData.column,
				});
				break;
			case CitrusGotReelSymbolValue.PayerWild:
				currentWildPositions_PayerWild.push({
					row: wildData.row,
					column: wildData.column,
				});
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

//SNC - 20231101 - Code to handle wild placement for losing and teasing
// We can presume an empty gird on entry otherwise cannot guarantee to make a losing grid

export function addWilds_loseOrTease(
	integerRng: IntegerRng,
	input: CitrusGotReelSymbol[][],
	profile: baseGameProfile | bonusGameProfile,
	rows: number,
	cols: number
): CitrusGotReelSymbol[][] {
	const currentMaths = mathConfig();

	if (
		!pickValueFromDistribution(
			integerRng,
			currentMaths.profiles.base[profile].wildFeatureActive
		)
	) {
		return input;
	}

	// Determine the number of wilds to place

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
			direction: direction,
			steps: steps,
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

	//Add the wilds as needed, but ensure they cannot create a win
	//That means no two wilds in rows 0 to 2
	//And keep expanding wilds away from reels 2 or lower

	//Create the wilds to use:

	const wildsToUse: { wildType: FeatureType; multiplier: number }[] = [];

	for (let i = 0; i < numWilds; i++) {
		wildsToUse.push({
			wildType: pickValueFromDistribution(
				integerRng,
				currentMaths.profiles.base[profile].wildLookUp
			),
			multiplier: pickValueFromDistribution(
				integerRng,
				currentMaths.profiles.base[profile].initialMultiplier
			),
		});
	}

	//If there is more than one, make sure directional wilds go last to allow a good placement of standard wilds

	wildsToUse.sort((a, b) => {
		if (
			a.wildType === FeatureType.DirectionalWild &&
			b.wildType !== FeatureType.DirectionalWild
		) {
			return 1;
		} else if (
			a.wildType !== FeatureType.DirectionalWild &&
			b.wildType === FeatureType.DirectionalWild
		) {
			return -1;
		}
		return 0;
	});

	//If only one wild, non directional can go anywhere. Directional anywhere from reel 2 onwards

	for (let i = 0; i < wildsToUse.length; i++) {
		const thisWild = wildsToUse[i];
		//Choose minimum reel logic:
		//If a non-directional wild, minimum position is reel 0
		//If a directional wild, minimum position is reel 2
		//If not the first wild, minimum position is reel 3

		let minReel = 0;
		if (thisWild.wildType === FeatureType.DirectionalWild) {
			minReel = 2;
		}
		if (i !== 0) {
			minReel = 3;
		}

		//Pick a place to add the wild

		const reel = integerRng.randomInteger(cols - minReel) + minReel;
		const row = integerRng.randomInteger(rows);

		//If something already in the grid, skip this

		if (input[reel][row] !== undefined) {
			continue;
		}

		//If it's a directional wild, set its direction and steps (clamping as needed)

		let direction = integerRng.randomInteger(2) === 0 ? "right" : "left";
		let steps = 0;

		if (thisWild.wildType === FeatureType.DirectionalWild) {
			steps = pickValueFromDistribution(
				integerRng,
				currentMaths.profiles.base[profile].stepsData
			);
			if (reel === minReel) {
				direction = "right";
			} else if (reel === cols - 1) {
				direction = "left";
				steps = pickValueFromDistribution(
					integerRng,
					currentMaths.profiles.base[profile].stepsColumn6Data
				);
			} else if (row === 0) {
				direction = "down";
			} else if (row === rows - 1) {
				direction = "up";
			}

			//Finally ensure a direction left won't breach minimum reel

			if (direction === "left") {
				if (reel - steps < minReel) {
					steps = reel - minReel;
				}
			}
		}

		// Use the mapping to generate the new symbol
		const newSymbol = featureToSymbolMap[thisWild.wildType as FeatureType](
			thisWild.multiplier,
			direction,
			steps
		);

		input[reel][row] = newSymbol;
	}

	return input;
}
