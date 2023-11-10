/**
 * GenerateWildResults_FinalAnalysis.ts
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

const ConvertReelsToImage = function (reels: any[][]): string[] {
	const image: string[] = [];

	for (let row = 0; row < reels[0].length; row++) {
		image[row] = "";
	}

	for (let reel = 0; reel < reels.length; reel++) {
		for (let row = 0; row < reels[reel].length; row++) {
			let symbol: string = " ";
			let multiplier: string = "";
			switch (reels[reel][row].symbol) {
				case CitrusGotReelSymbolValue.Wild:
					symbol = "W";
					multiplier = " " + reels[reel][row].multiplier;
					break;
				case CitrusGotReelSymbolValue.DirectionalWild:
					symbol = "D";
					multiplier = " " + reels[reel][row].multiplier;
					break;
				case CitrusGotReelSymbolValue.PayerWild:
					symbol = "P";
					multiplier = " " + reels[reel][row].multiplier;
					break;
				case CitrusGotReelSymbolValue.CollectorWild:
					symbol = "C";
					multiplier = " " + reels[reel][row].multiplier;
					break;
				case CitrusGotReelSymbolValue.Scatter:
					symbol = "S";
					break;
			}
			image[row] +=
				"[" +
				symbol +
				(multiplier !== ""
					? "X" + multiplier.substring(multiplier.length - 2)
					: "   ") +
				"]";
			// image[row] += "[" + reels[reel][row].symbol.toFixed(16) + "]";
		}
	}

	return image;
};

export const RunFinalAnalysis = function (
	_gameInterface: any,
	parameters: any
) {
	//Adjust parameters?

	const adjustedParameters: any = parameters;

	if (process.argv.length > 2) {
		for (let i = 2; i < process.argv.length; i++) {
			const arg = process.argv[i];
		}
	}

	//Go through all result files, and build a report of the data sets

	console.log("final");

	//Run through all results, isolate unique instances of wild layouts (including scatters)

	fs.readdir(".//GeneratedWildTablesCombined//", (err, files) => {
		//Go through each set

		for (let layoutType = 0; layoutType < LayoutType.COUNT; layoutType++) {
			const thisSetData: any[] = [];

			console.log("\nProcess layout " + LayoutTypeName[layoutType]);
			files.forEach((file) => {
				//console.log(file);

				if (
					file.substring(0, 11) === "runresults_" &&
					file.substring(
						11,
						11 + LayoutTypeName[layoutType].length
					) === LayoutTypeName[layoutType] &&
					file.substring(file.length - 4) === "json"
				) {
					console.log("Processing file: " + file);

					const thisFile: any = fs.readFileSync(
						".//GeneratedWildTablesCombined//" + file
					);

					const thisSet: any = JSON.parse(thisFile);

					//Process the set

					thisSet.forEach((set) => {
						const newEntry: any = {
							layout: set.layout,
							results: [],
						};

						set.results.forEach((data) => {
							const newResult: any = {
								profile: data.profileName,
								averagePayout: 0,
								averagePayoutExcluding0Win: 0,
								chanceOfPaying: 0,
								maxPayout: 0,
							};
							let total: number = 0;
							let countNon0Win: number = 0;
							let countOverall: number = 0;
							data.playWins.forEach((win) => {
								total += win[0];
								if (win[0] !== 0) {
									countNon0Win += win[1];
								}
								countOverall += win[1];
								if (win[0] > newResult.maxPayout) {
									newResult.maxPayout = win[0].toFixed(4);
								}
							});

							newResult.averagePayout =
								countOverall !== 0
									? (total / countOverall).toFixed(4)
									: 0;
							newResult.averagePayoutExcluding0Win =
								countNon0Win !== 0
									? (total / countNon0Win).toFixed(4)
									: 0;
							newResult.chanceOfPaying =
								countOverall !== 0
									? (countNon0Win / countOverall).toFixed(4)
									: 0;

							newEntry.results.push(newResult);
						});
						thisSetData.push(JSON.parse(JSON.stringify(newEntry)));
					});
				}
			});

			//Write out

			fs.writeFileSync(
				".//GeneratedWildTablesCombined//final_" +
					LayoutTypeName[layoutType] +
					".json",
				JSON.stringify(thisSetData),
				{ encoding: "utf8", flag: "w" }
			);

			//Attempt a drawing of each board

			thisSetData.forEach((data) => {
				const testResult = _gameInterface.play({
					bet: 1,
					action: "wildanalyse",
					state: null,
					variant: "95rtp",
					//Patch control into promo
					promo: {
						control: {
							packData: {
								wilds: data.layout.wilds,
								scatters: data.layout.scatters,
							},
							profile: data.results[0].profile,
						},
					},
				});

				data.beforeGrid = ConvertReelsToImage(
					testResult.data.baseGameSpin.reelsBefore
				);
				data.afterGrid = ConvertReelsToImage(
					testResult.data.baseGameSpin.reelsAfter
				);
			});

			fs.writeFileSync(
				".//GeneratedWildTablesCombined//final_imaged_" +
					LayoutTypeName[layoutType] +
					".json",
				JSON.stringify(thisSetData),
				{ encoding: "utf8", flag: "w" }
			);
		}
	});
};