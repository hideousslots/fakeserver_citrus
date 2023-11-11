/**
 * GenerateWildResults_PullForGame.ts
 *
 * Pull by criteria sets for the game
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

type GameSet = {
	setChance: number;
	criteria: ((layout: any) => void)[];
};

export const RunPullForGame = function (_gameInterface: any, parameters: any) {
	//Adjust parameters?

	const adjustedParameters: any = parameters;

	if (process.argv.length > 2) {
		for (let i = 2; i < process.argv.length; i++) {
			const arg = process.argv[i];
		}
	}

	//Go through all result files, and build a report of the data sets

	console.log("pulling for game");

	//Build up for each profile a set of sets of wild layouts to use, picked by criteria

	const gameData: any = {
		baseGameLow: {
			sets: [
				{
					setChance: 1,
					matches: [],
					criteria: [
						(layout: LayoutInstance, results: any) => {
							if (LayoutInstance.CountWilds(layout.wilds) > 1) {
								return false;
							}
							if (
								LayoutInstance.WildsContainSymbol(
									layout.wilds,
									CitrusGotReelSymbolValue.PayerWild
								) ||
								LayoutInstance.WildsContainSymbol(
									layout.wilds,
									CitrusGotReelSymbolValue.CollectorWild
								)
							) {
								return false;
							}
							if (results.averagePayout > 0.1) {
								//console.log("noavep!");
								return false;
							}
							if (results.maxPayout > 7) {
								//console.log("nomaxp!");
								return false;
							}
							console.log("using... " + JSON.stringify(results));
							return true;
						},
					],
				},
			],
		},
		baseGameMed: {
			sets: [],
		},
		baseGameHigh: {
			sets: [],
		},
	};

	//Load all info tables

	const allTables: any[] = [];

	fs.readdir(".//GeneratedWildTablesCombined//", (err, files) => {
		//Go through each set

		for (let layoutType = 0; layoutType < LayoutType.COUNT; layoutType++) {
			files.forEach((file) => {
				//console.log(file);

				if (
					file.substring(0, 6) === "final_" &&
					file.substring(6, 6 + LayoutTypeName[layoutType].length) ===
						LayoutTypeName[layoutType] &&
					file.substring(file.length - 4) === "json"
				) {
					console.log("Processing file: " + file);

					const thisFile: any = fs.readFileSync(
						".//GeneratedWildTablesCombined//" + file
					);

					const thisSet: any = JSON.parse(thisFile);
					thisSet.forEach((item) => {
						allTables.push(item);
					});
				}
			});

			//Find matches as required

			const profiles: string[] = [
				"baseGameLow",
				"baseGameMed",
				"baseGameHigh",
			];

			//console.log(JSON.stringify(gameData));

			profiles.forEach((profile) => {
				//console.log(JSON.stringify(gameData[profile]));
				gameData[profile].sets.forEach((set) => {
					allTables.forEach((layoutData) => {
						let useThisOne = false;

						set.criteria.forEach((test) => {
							if (
								test(
									layoutData.layout,
									layoutData.results.find((existing: any) => {
										return existing.profile === profile;
									})
								)
							) {
								useThisOne = true;
							}
						});

						if (useThisOne) {
							set.matches.push([
								layoutData.layout.wilds[0],
								layoutData.layout.wilds[1],
								layoutData.layout.wilds[2],
								layoutData.layout.wilds[3],
								layoutData.layout.wilds[4],
								layoutData.layout.scatters,
							]);
							//console.log(JSON.stringify(gameData));
						}
					});

					fs.writeFileSync(
						".//GeneratedWildPulled//pulled_" + profile + "_.json",
						JSON.stringify(gameData[profile].sets),
						{ encoding: "utf8", flag: "w" }
					);
				});
			});
		}
	});
};
