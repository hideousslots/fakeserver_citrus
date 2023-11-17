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
import wildanalysisplay from "../../games/citrus-got-reel/math/wildanalysisplay";
import { WildAllocation } from "../../GetStats/Citrus/WildAllocation";

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

	//Track layouts that have various wilds

	const WILDTYPEFLAG_NONE = 0x00;
	const WILDTYPEFLAG_WILD = 0x01;
	const WILDTYPEFLAG_DIRECTIONAL = 0x02;
	const WILDTYPEFLAG_COLLECTOR = 0x04;
	const WILDTYPEFLAG_PAYER = 0x08;

	const wildGroupTypeCounters: number[] = [
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	];
	let totalLayoutsPushed: number = 0;

	//Run through all results, isolate unique instances of wild layouts (including scatters)

	const files: string[] = fs.readdirSync(".//GeneratedWildTables//");
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
					let wildTypesInLayout = WILDTYPEFLAG_NONE;
					newLayout.wilds.forEach((wild) => {
						if (wild !== 0) {
							switch ((wild >> 8) & 0xff) {
								case CitrusGotReelSymbolValue.Wild:
									wildTypesInLayout |= WILDTYPEFLAG_WILD;
									break;
								case CitrusGotReelSymbolValue.DirectionalWild:
									wildTypesInLayout |=
										WILDTYPEFLAG_DIRECTIONAL;
									break;
								case CitrusGotReelSymbolValue.CollectorWild:
									wildTypesInLayout |= WILDTYPEFLAG_COLLECTOR;
									break;
								case CitrusGotReelSymbolValue.PayerWild:
									wildTypesInLayout |= WILDTYPEFLAG_PAYER;
									break;
							}
						}
					});
					wildGroupTypeCounters[wildTypesInLayout]++;
					typeLayoutArray.push(newLayout);
					totalLayoutsPushed++;
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

	//Report wild type groups

	console.log("Wilds types layout count: ");

	let layoutsReported = 0;
	for (let i = 0; i < wildGroupTypeCounters.length; i++) {
		let name: string = "NONE";
		if (i !== 0) {
			name = "";
			if (i & WILDTYPEFLAG_WILD) {
				name += " + WILD";
			}
			if (i & WILDTYPEFLAG_DIRECTIONAL) {
				name += " + DIRECTIONAL";
			}
			if (i & WILDTYPEFLAG_COLLECTOR) {
				name += " + COLLECTOR";
			}
			if (i & WILDTYPEFLAG_PAYER) {
				name += " + PAYER";
			}
		}
		console.log(name + " : " + wildGroupTypeCounters[i]);
		layoutsReported += wildGroupTypeCounters[i];
	}

	console.log(
		"Final check - above tables have " +
			layoutsReported +
			" and system thinks a total of " +
			totalLayoutsPushed +
			" have been used. Should match"
	);
};
