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

import {
	CriteriaFunction_NoMultiplierWild,
	CriteriaFunction_DirectionalWild,
	CriteriaFunction_NoDirectionalWild,
	CriteriaFunction_NoPayerWild,
	CriteriaFunction_NoCollectorWild,
	CriteriaFunction_PayerInWin,
	CriteriaFunction_CollectorInWin,
} from "./GenerateWildResults_CriteriaFunctions";

/**
 * Code for actually pulling
 */

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
					referenceID: "simplelow1",
					setChance: 1,
					matches: [],
					matchesPerScatterCount: [],
					criteria: [
						CriteriaFunction_NoCollectorWild,
						CriteriaFunction_NoPayerWild,
						CriteriaFunction_NoMultiplierWild,
						CriteriaFunction_NoDirectionalWild,
						(layout: LayoutInstance, results: any) => {
							if (LayoutInstance.CountWilds(layout.wilds) != 1) {
								return false;
							}

							if (results.averagePayout > 0.2) {
								return false;
							}

							return true;
						},
					],
				},
				{
					referenceID: "simplelow2",
					setChance: 1,
					matches: [],
					matchesPerScatterCount: [],
					criteria: [
						CriteriaFunction_NoCollectorWild,
						CriteriaFunction_NoPayerWild,
						CriteriaFunction_NoMultiplierWild,
						CriteriaFunction_NoDirectionalWild,
						(layout: LayoutInstance, results: any) => {
							if (LayoutInstance.CountWilds(layout.wilds) != 2) {
								return false;
							}

							if (results.averagePayout > 0.2) {
								return false;
							}

							return true;
						},
					],
				},
				{
					referenceID: "simplelow3",
					setChance: 1,
					matches: [],
					matchesPerScatterCount: [],
					criteria: [
						CriteriaFunction_NoCollectorWild,
						CriteriaFunction_PayerInWin,
						CriteriaFunction_NoMultiplierWild,
						CriteriaFunction_NoDirectionalWild,
						(layout: LayoutInstance, results: any) => {
							if (LayoutInstance.CountWilds(layout.wilds) < 2) {
								return false;
							}

							if (results.averagePayout > 1) {
								return false;
							}

							return true;
						},
					],
				},
			],
		},
		baseGameMed: {
			sets: [
				{
					referenceID: "simplemed",
					setChance: 1,
					matches: [],
					matchesPerScatterCount: [],
					criteria: [
						CriteriaFunction_NoCollectorWild,
						CriteriaFunction_NoPayerWild,
						CriteriaFunction_DirectionalWild,
						CriteriaFunction_NoMultiplierWild,
						(layout: LayoutInstance, results: any) => {
							if (LayoutInstance.CountWilds(layout.wilds) != 1) {
								return false;
							}

							if (results.averagePayout > 0.2) {
								return false;
							}

							if (
								LayoutInstance.WildExceedsMaximumSteps(
									layout.wilds,
									2
								)
							) {
								return false;
							}

							return true;
						},
					],
				},
				{
					referenceID: "payer",
					setChance: 1,
					matches: [],
					matchesPerScatterCount: [],
					criteria: [
						CriteriaFunction_PayerInWin,
						CriteriaFunction_NoCollectorWild,
						(layout: LayoutInstance, results: any) => {
							if (LayoutInstance.CountWilds(layout.wilds) != 2) {
								return false;
							}

							if (results.averagePayout < 0.2) {
								return false;
							}

							return true;
						},
					],
				},
				{
					referenceID: "collector",
					setChance: 1,
					matches: [],
					matchesPerScatterCount: [],
					criteria: [
						CriteriaFunction_CollectorInWin,
						CriteriaFunction_NoPayerWild,
						(layout: LayoutInstance, results: any) => {
							if (LayoutInstance.CountWilds(layout.wilds) < 2) {
								return false;
							}

							if (results.averagePayout > 0.15) {
								return false;
							}

							return true;
						},
					],
				},
			],
		},
		baseGameHigh: {
			sets: [
				{
					referenceID: "simplehigh",
					setChance: 1,
					matches: [],
					matchesPerScatterCount: [],
					criteria: [
						(layout: LayoutInstance, results: any) => {
							if (LayoutInstance.CountWilds(layout.wilds) < 2) {
								return false;
							}
							if (results.averagePayout < 0.5) {
								return false;
							}
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
					" results - "
			);

			allTables.forEach((layoutData) => {
				let useThisOne = true;
				const theseResults = layoutData.results.find(
					(existing: any) => {
						return existing.profile === profile;
					}
				);
				set.criteria.forEach((test) => {
					if (!test(layoutData.layout, theseResults)) {
						useThisOne = false;
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
			//Break them down in per scatter count arrays

			set.matchesPerScatterCount = [[], [], [], []];

			set.matches.forEach((match) => {
				set.matchesPerScatterCount[
					LayoutInstance.CountScatters(match.layout.scatters)
				].push(match);
			});

			//Sort all

			for (
				let scatterCount: number = 0;
				scatterCount <= 3;
				scatterCount++
			) {
				//In this set, sort by best average win
				set.matchesPerScatterCount[scatterCount].sort((a, b) => {
					return a.results.averagePayout - b.results.averagePayout;
				});

				//Limit to 256 best

				if (set.matchesPerScatterCount[scatterCount].length > 256) {
					set.matchesPerScatterCount[scatterCount].splice(256);
				}

				//Correct the set data

				const newMatches: { data: number[]; images: any[] }[] = [];

				set.matchesPerScatterCount[scatterCount].forEach((match) => {
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
				set.matchesPerScatterCount[scatterCount] = newMatches;
			}
			set.matches = undefined;

			const totalResults =
				set.matchesPerScatterCount[0].length +
				set.matchesPerScatterCount[1].length +
				set.matchesPerScatterCount[2].length +
				set.matchesPerScatterCount[3].length;
			console.log(
				"post process profile " +
					profile +
					" set index " +
					setindex +
					" currently holding " +
					totalResults +
					" results - per scatter = " +
					" (" +
					set.matchesPerScatterCount[0].length +
					" , " +
					set.matchesPerScatterCount[1].length +
					" , " +
					set.matchesPerScatterCount[2].length +
					" , " +
					set.matchesPerScatterCount[3].length +
					" )"
			);
		});

		outputData[profile] = {
			sets: [],
			chance: [],
		};

		gameData[profile].sets.forEach((thisSet) => {
			outputData[profile].sets.push({
				referenceID: thisSet.referenceID,
				countPerScatterCount: [
					thisSet.matchesPerScatterCount[0].length,
					thisSet.matchesPerScatterCount[1].length,
					thisSet.matchesPerScatterCount[2].length,
					thisSet.matchesPerScatterCount[3].length,
				],
				dataPerScatterCount: [
					thisSet.matchesPerScatterCount[0],
					thisSet.matchesPerScatterCount[1],
					thisSet.matchesPerScatterCount[2],
					thisSet.matchesPerScatterCount[3],
				],
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
			for (
				let scatterCount: number = 0;
				scatterCount <= 3;
				scatterCount++
			) {
				const cleanData: number[][] = [];

				set.dataPerScatterCount[scatterCount].forEach((dataObject) => {
					cleanData.push(dataObject.data);
				});

				set.dataPerScatterCount[scatterCount] = cleanData;
			}
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
