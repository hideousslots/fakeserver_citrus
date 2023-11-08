/**
 * GenerateWildResults_UseGenerated.ts
 *
 * Stats file for citrus tests
 */

import { CitrusGotReelSymbolValue } from "../../games/citrus-got-reel/math/config/CitrusGotReelSymbol";
import * as fs from "fs";

import {
	SavedWildInfo,
	SavedResult,
	PackScatters,
	UnpackScatters,
	LayoutInstance,
	LayoutType,
	LayoutTypeName,
	MultiRunResult,
	ProfileResult,
} from "./GenerateWildResults_Defines";

export const RunUseGenerated = function (_gameInterface: any, parameters: any) {
	//Adjust parameters?

	const adjustedParameters: any = parameters;

	// if (process.argv.length > 2) {
	// 	for (let i = 2; i < process.argv.length; i++) {
	// 		const arg = process.argv[i];
	// 	}
	// }

	// const uniqueLayouts: LayoutInstance[] = [];
	const uniqueLayoutsByType: LayoutInstance[][] = [];

	for (let i = 0; i < LayoutType.COUNT; i++) {
		uniqueLayoutsByType[i] = [];
	}

	//Load each type, and run all their games

	for (let i: LayoutType = 0; i < LayoutType.COUNT; i++) {
		const recordLayoutsFile: any = fs.readFileSync(
			".//GeneratedWildTablesCombined//combined_" +
				LayoutTypeName[i] +
				".json"
		);

		const layouts: any = JSON.parse(recordLayoutsFile);
		console.log(
			"want to run " +
				layouts.length +
				" records from " +
				LayoutTypeName[i]
		);

		//Test with the required number of spin in each of these profiles:

		const profilesToTest: string[] = [
			"baseGameLow",
			"baseGameMed",
			"baseGameHigh",
		];

		const testCount: number = 100;

		const thisResultSet: MultiRunResult[] = [];

		console.log(
			"Running first 10 results (for testing) of " +
				testCount +
				" games for each of " +
				LayoutTypeName[i] +
				" ( " +
				layouts.length +
				" layouts ) in each of " +
				profilesToTest.length +
				" profiles"
		);

		//Run each layout for each profile testCount times
		layouts.forEach((thisLayout, index) => {
			if (index >= 10) {
				return;
			}
			const thisResult: MultiRunResult = new MultiRunResult(thisLayout);
			profilesToTest.forEach((profileName: string) => {
				//Run for each profile
				const winValues: number[] = [];

				for (let gameIndex = 0; gameIndex < testCount; gameIndex++) {
					//Create the layout here for now

					const testResult = _gameInterface.play({
						bet: 1,
						action: "main",
						state: null,
						variant: "95rtp",
						//Patch control into promo
						promo: {
							control: {
								packData: {
									wilds: layouts[0].wilds,
									scatters: layouts[0].scatters,
								},
								profile: profilesToTest[0],
							},
						},
					});
					winValues.push(testResult.win);
				}

				//Sort the wins

				winValues.sort((a, b) => {
					return a - b;
				});

				const packWinValues: number[][] = [];
				let accessIndex = 0;
				packWinValues[accessIndex] = [winValues[0], 1];
				for (let r = 1; r < winValues.length; r++) {
					if (winValues[r] !== packWinValues[accessIndex][0]) {
						//Different win value

						packWinValues[++accessIndex] = [winValues[r], 1];
					} else {
						packWinValues[accessIndex][1]++;
					}
				}
				thisResult.results.push(
					new ProfileResult(profileName, packWinValues)
				);
			});

			thisResultSet.push(thisResult);
		});

		console.log(
			"Write results of " +
				testCount +
				" games for each of " +
				LayoutTypeName[i]
		);

		//Save them

		fs.writeFileSync(
			".//GeneratedWildTablesCombined//runresults_" +
				LayoutTypeName[i] +
				".json",
			JSON.stringify(thisResultSet),
			{ encoding: "utf8", flag: "w" }
		);
	}
};
