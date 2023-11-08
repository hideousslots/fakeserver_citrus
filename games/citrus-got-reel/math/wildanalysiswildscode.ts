/**
 * wildanalysiswildsCode.ts
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

function deepCloneArray(arr: any[][]): any[][] {
	return arr.map((row) =>
		row.map((cell) => (cell !== undefined ? { ...cell } : undefined))
	);
}

export function addWilds(
	packedData: { wilds: number[]; scatters: number },
	input: CitrusGotReelSymbol[][]
): CitrusGotReelSymbol[][] {
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

	//Unpack the data

	packedData.wilds.forEach((packData) => {
		if (packData === 0) {
			return;
		}
		//Unpack the data

		const reelIndex = packData & 0xf;
		const rowIndex = (packData >> 4) & 0xf;
		const symbol = (packData >> 8) & 0xff;
		const multiplier = (packData >> 16) & 0xff;
		const sticky = (packData & (0x1 << 25)) !== 0;
		const direction = (packData >> 26) & 0x3;
		const steps = (packData >> 28) & 0xf;

		let wildType: FeatureType;
		switch (symbol) {
			case CitrusGotReelSymbolValue.Wild:
				wildType = FeatureType.Wild;
				break;
			case CitrusGotReelSymbolValue.DirectionalWild:
				wildType = FeatureType.DirectionalWild;
				break;
			case CitrusGotReelSymbolValue.PayerWild:
				wildType = FeatureType.PayerWild;
				break;
			case CitrusGotReelSymbolValue.CollectorWild:
				wildType = FeatureType.CollectorWild;
				break;
		}
		const newSymbol = featureToSymbolMap[wildType as FeatureType](
			multiplier,
			direction,
			steps
		);

		input[reelIndex][rowIndex] = newSymbol;
	});

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
