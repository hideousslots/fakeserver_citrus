/**
 * presetWildsCode.ts
 *
 * Code to place wilds based on scatter desire and prestored values
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

// eslint-disable-next-line @typescript-eslint/no-var-requires
import { presetWildDataSource } from "./presetWildsData";
const presetWildData = JSON.parse(presetWildDataSource);

type UnpackedWild = {
	featureType: FeatureType;
	symbol: number;
	reelIndex: number;
	rowIndex: number;
	multiplier: number;
	sticky: boolean;
	direction: string;
	steps: number;
};

function DecodePackedWild(packData: number): UnpackedWild {
	const dirToString: string[] = ["up", "down", "left", "right"];
	const data: UnpackedWild = {
		featureType: FeatureType.Wild,
		reelIndex: packData & 0xf,
		rowIndex: (packData >> 4) & 0xf,
		symbol: (packData >> 8) & 0xff,
		multiplier: (packData >> 16) & 0xff,
		sticky: (packData & (0x1 << 25)) !== 0,
		direction: dirToString[(packData >> 26) & 0x3],
		steps: (packData >> 28) & 0xf,
	};

	switch (data.symbol) {
		case CitrusGotReelSymbolValue.Wild:
			data.featureType = FeatureType.Wild;
			break;
		case CitrusGotReelSymbolValue.DirectionalWild:
			data.featureType = FeatureType.DirectionalWild;
			break;
		case CitrusGotReelSymbolValue.CollectorWild:
			data.featureType = FeatureType.CollectorWild;
			break;
		case CitrusGotReelSymbolValue.PayerWild:
			data.featureType = FeatureType.PayerWild;
			break;
	}

	return data;
}

export type WildPresetResponse = {
	grid: CitrusGotReelSymbol[][];
	scatterData: number;
};

export function addWildsFromPreset(
	integerRng: IntegerRng,
	scatterCount: number,
	input: CitrusGotReelSymbol[][],
	profile: baseGameProfile | bonusGameProfile
): WildPresetResponse {
	const currentMaths = mathConfig();

	if (
		!pickValueFromDistribution(
			integerRng,
			currentMaths.profiles.base[profile].wildFeatureActive
		)
	) {
		return { grid: input, scatterData: -1 };
	}

	//Use set 0 for now - random pick can come later

	const setToUse: any = presetWildData[profile].sets[0];


	//Check in the available data for the profile if there are choices for the scatter

	console.log("check profile : " + profile);
	if (setToUse.countPerScatterCount[scatterCount] === 0) {
		//Cannot handle the request

		return { grid: input, scatterData: -1 };
	}

	//Pick a random layout to apply

	const layoutIndex = integerRng.randomInteger(
		setToUse.countPerScatterCount[scatterCount]
	);
	const layoutToUse =
		setToUse.dataPerScatterCount[scatterCount][layoutIndex];
	const scatterDataToUse = layoutToUse[0];

	//Apply to the field

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

	for (
		let wildIndex: number = 1;
		wildIndex < layoutToUse.length;
		wildIndex++
	) {
		const unpacked: UnpackedWild = DecodePackedWild(layoutToUse[wildIndex]);

		input[unpacked.reelIndex][unpacked.rowIndex] = featureToSymbolMap[
			unpacked.featureType
		](unpacked.multiplier, unpacked.direction, unpacked.steps);
	}

	//Return the grid and scatter data

	return { grid: input, scatterData: scatterDataToUse };
}
