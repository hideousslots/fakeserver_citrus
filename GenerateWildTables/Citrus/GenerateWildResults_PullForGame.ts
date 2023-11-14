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
import { FeatureType } from "../../games/citrus-got-reel/math/config/defines";

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
							//console.log("using... " + JSON.stringify(results));
							return true;
						},
					],
				},
				{
					setChance: 1,
					matches: [],
					criteria: [
						(layout: LayoutInstance, results: any) => {
							if (LayoutInstance.CountWilds(layout.wilds) > 1) {
								return false;
							}
							if (layout.scatters !== 0) {
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
							if (results.maxPayout > 7) {
								//console.log("nomaxp!");
								return false;
							}
							//console.log("using... " + JSON.stringify(results));
							return true;
						},
					],
				},
			],
		},
		baseGameMed: {
			sets: [
				{
					setChance: 1,
					matches: [],
					criteria: [
						(layout: LayoutInstance, results: any) => {
							if (LayoutInstance.CountWilds(layout.wilds) > 2) {
								return false;
							}

							if (results.averagePayout > 0.5) {
								//console.log("noavep!");
								return false;
							}
							if (results.maxPayout > 15) {
								//console.log("nomaxp!");
								return false;
							}
							//console.log("using... " + JSON.stringify(results));
							return true;
						},
					],
				},
			],
		},
		baseGameHigh: {
			sets: [
				{
					setChance: 1,
					matches: [],
					criteria: [
						(layout: LayoutInstance, results: any) => {
							if (LayoutInstance.CountWilds(layout.wilds) < 2) {
								return false;
							}
							if (results.averagePayout < 0.5) {
								return false;
							}
							//console.log("using... " + JSON.stringify(results));
							return true;
						},
					],
				},
			],
		},
	};

	//Load all info tables

	const allTables: any[] = [];

	//Find matches as required

	const profiles: string[] = ["baseGameLow", "baseGameMed", "baseGameHigh"];

	const files: string[] = fs.readdirSync(".//GeneratedWildTablesCombined//");
	//Go through each set

	for (let layoutType = 0; layoutType < LayoutType.COUNT; layoutType++) {
		files.forEach((file) => {
			//console.log(file);

			if (
				file.substring(0, 13) === "final_imaged_" &&
				file.substring(13, 13 + LayoutTypeName[layoutType].length) ===
					LayoutTypeName[layoutType] &&
				file.substring(file.length - 4) === "json"
			) {
				console.log("Processing file: " + file);

				const thisFile: any = fs.readFileSync(
					".//GeneratedWildTablesCombined//" + file
				);

				const thisSet: any = JSON.parse(thisFile);
				console.log(
					"File has " + thisSet.length + "records to play with"
				);
				thisSet.forEach((item) => {
					allTables.push(item);
				});
			}
		});
	}
	//console.log(JSON.stringify(gameData));

	console.log("all tables shows " + allTables.length + " results");
	profiles.forEach((profile) => {
		//console.log(JSON.stringify(gameData[profile]));
		gameData[profile].sets.forEach((set, setindex) => {
			console.log(
				"process profile " +
					profile +
					" set index " +
					setindex +
					" currently holding " +
					set.matches.length +
					" results"
			);

			allTables.forEach((layoutData) => {
				let useThisOne = false;
				const theseResults = layoutData.results.find(
					(existing: any) => {
						return existing.profile === profile;
					}
				);
				set.criteria.forEach((test) => {
					if (test(layoutData.layout, theseResults)) {
						useThisOne = true;
					}
				});

				if (useThisOne) {
					set.matches.push({
						layout: layoutData.layout,
						results: theseResults,
						images: [layoutData.beforeGrid, layoutData.afterGrid],
					});
				}
			});
		});
	});

	const outputData = {};

	profiles.forEach((profile) => {
		//console.log(JSON.stringify(gameData[profile]));
		gameData[profile].sets.forEach((set, setindex) => {
			console.log(
				"post process profile " +
					profile +
					" set index " +
					setindex +
					" currently holding " +
					set.matches.length +
					" results"
			);
			//In this set, sort by best average win
			set.matches.sort((a, b) => {
				return a.results.averagePayout - b.results.averagePayout;
			});

			//Limit to 256 best

			if (set.matches.length > 256) {
				set.matches.splice(256);
			}

			//Correct the set data

			const newMatches: { data: number[]; images: any[] }[] = [];

			set.matches.forEach((match) => {
				const data: number[] = [
					match.layout.scatters,
					match.layout.wilds[0],
				];
				for (let w = 1; w < match.layout.wilds.length; w++) {
					if (match.layout.wilds[w] !== 0) {
						data.push(match.layout.wilds[w]);
					}
				}
				newMatches.push({ data: data, images: match.images });
			});
			set.matches = newMatches;
		});

		outputData[profile] = {
			sets: [],
			chance: [],
		};

		gameData[profile].sets.forEach((thisSet) => {
			outputData[profile].sets.push({
				count: thisSet.matches.length,
				data: thisSet.matches,
			});
			outputData[profile].chance.push(thisSet.setChance);
		});
	});

	fs.writeFileSync(
		".//GeneratedWildPulled//pulled_full_.json",
		JSON.stringify(outputData),
		{ encoding: "utf8", flag: "w" }
	);

	//Write data neatly

	let output: string = "";
	output += "{\n";
	profiles.forEach((profile) => {
		outputData[profile].sets.forEach((set) => {
			const cleanData: number[][] = [];

			set.data.forEach((data) => {
				cleanData.push(data.data);
			});
			set.data = cleanData;
		});
	});

	fs.writeFileSync(
		".//GeneratedWildPulled//pulled_formatted_.json",
		JSON.stringify(outputData),
		{
			encoding: "utf8",
			flag: "w",
		}
	);
};
