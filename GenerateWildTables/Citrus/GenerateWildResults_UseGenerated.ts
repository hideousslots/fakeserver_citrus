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

	let arg_layoutTypeIndex: number = 0;
	let arg_gamecount: number = 5000;
	let arg_startTestIndex: number = 0;
	let arg_endTestIndex: number = 99;
	let arg_additionalNaming: string = "";

	if (process.argv.length > 2) {
		for (let i = 2; i < process.argv.length; i++) {
			const arg = process.argv[i];
			console.log("arg " + i + " is " + arg);
			if (arg.substring(0, 7) === "layout=") {
				arg_layoutTypeIndex = Number(arg.substring(7));
			}
			if (arg.substring(0, 10) === "gamecount=") {
				arg_gamecount = Number(arg.substring(10));
			}
			if (arg.substring(0, 6) === "start=") {
				arg_startTestIndex = Number(arg.substring(6));
			}
			if (arg.substring(0, 4) === "end=") {
				arg_endTestIndex = Number(arg.substring(4));
			}
			if (arg.substring(0, 8) === "addname=") {
				arg_additionalNaming = arg.substring(8);
			}
		}
	}

	// const uniqueLayouts: LayoutInstance[] = [];
	const uniqueLayoutsByType: LayoutInstance[][] = [];

	for (let i = 0; i < LayoutType.COUNT; i++) {
		uniqueLayoutsByType[i] = [];
	}

	//Load each type, and run all their games

	const recordLayoutsFile: any = fs.readFileSync(
		".//GeneratedWildTablesCombined//combined_" +
		LayoutTypeName[arg_layoutTypeIndex] +
		".json"
	);

	const layouts: any = JSON.parse(recordLayoutsFile);
	console.log(
		"want to run " +
		layouts.length +
		" records from " +
		LayoutTypeName[arg_layoutTypeIndex]
	);

	//Test with the required number of spin in each of these profiles:

	const profilesToTest: string[] = [
		"baseGameLow",
		"baseGameMed",
		"baseGameHigh",
	];

	let thisResultSet: MultiRunResult[] = [];

	console.log(
		"Running results of " +
		arg_gamecount +
		" games for each of " +
		LayoutTypeName[arg_layoutTypeIndex] +
		" in each of " +
		profilesToTest.length +
		" profiles"
	);

	//Run each layout for each profile testCount times

	console.log(
		"running layout " + arg_startTestIndex + " to " + arg_endTestIndex
	);
	thisResultSet = [];

	let max = layouts.length - 1;
	if (max > arg_endTestIndex) {
		max = arg_endTestIndex;
	}
	for (let index = arg_startTestIndex; index <= max; index++) {
		const thisLayout = layouts[index];
		const thisResult: MultiRunResult = new MultiRunResult(thisLayout);
		profilesToTest.forEach((profileName: string) => {
			//Run for each profile
			const winValues: number[] = [];

			for (let gameIndex = 0; gameIndex < arg_gamecount; gameIndex++) {
				//Create the layout here for now

				const testResult = _gameInterface.play({
					bet: 1,
					action: "wildanalyse",
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
	}

	//Save them

	fs.writeFileSync(
		".//GeneratedWildTablesCombined//runresults_" +
		LayoutTypeName[arg_layoutTypeIndex] +
		"_" +
		arg_additionalNaming +
		"_index " +
		arg_startTestIndex +
		"_to_" +
		arg_endTestIndex +
		".json",
		JSON.stringify(thisResultSet),
		{ encoding: "utf8", flag: "w" }
	);
};
