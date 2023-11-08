/**
 * GenerateWildResults_AccountGenerated.ts
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
} from "./GenerateWildResults_Defines";

export const RunAccountGenerated = function (
	_gameInterface: any,
	parameters: any
) {
	//Adjust parameters?

	// const adjustedParameters: any = parameters;

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

	//Run through all results, isolate unique instances of wild layouts (including scatters)

	fs.readdir(".//GeneratedWildTables//", (err, files) => {
		files.forEach((file) => {
			//console.log(file);

			if (file.substring(file.length - 4) === "json") {
				console.log("Processing file: " + file);

				const thisFile: any = fs.readFileSync(
					".//GeneratedWildTables//" + file
				);

				const thisSet: any = JSON.parse(thisFile);
				thisSet.forEach((saved) => {
					const newLayout = new LayoutInstance(saved);

					const typeToCheck =
						0 +
						saved.scatterGridIndices.length * 5 +
						(saved.wilds.length - 1);

					if (typeToCheck < 0 || typeToCheck >= LayoutType.COUNT) {
						console.log(typeToCheck);
						console.log(JSON.stringify(saved));
					}

					const typeLayoutArray = uniqueLayoutsByType[typeToCheck];

					//Check for uniqueness

					if (
						typeLayoutArray.findIndex((existing) => {
							if (existing.checksum !== newLayout.checksum) {
								return false;
							}
							if (existing.wilds[0] !== newLayout.wilds[0]) {
								return false;
							}
							if (existing.wilds[1] !== newLayout.wilds[1]) {
								return false;
							}
							if (existing.wilds[2] !== newLayout.wilds[2]) {
								return false;
							}
							if (existing.wilds[3] !== newLayout.wilds[3]) {
								return false;
							}
							if (existing.wilds[4] !== newLayout.wilds[4]) {
								return false;
							}
							if (existing.scatters !== newLayout.scatters) {
								return false;
							}
							return true;
						}) === -1
					) {
						typeLayoutArray.push(newLayout);
					}
				});
			}

			for (let i: LayoutType = 0; i < LayoutType.COUNT; i++) {
				console.log(
					"Currently have " +
						uniqueLayoutsByType[i].length +
						" unique positions for " +
						LayoutTypeName[i]
				);
			}
		});

		for (let i: LayoutType = 0; i < LayoutType.COUNT; i++) {
			fs.writeFileSync(
				".//GeneratedWildTablesCombined//combined_" +
					LayoutTypeName[i] +
					".json",
				JSON.stringify(uniqueLayoutsByType[i]),
				{ encoding: "utf8", flag: "w" }
			);
		}
	});

	//Save the instances
};
