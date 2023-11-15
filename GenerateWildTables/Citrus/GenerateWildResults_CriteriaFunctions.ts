/**
 * GenerateWildResults_CriteriaFunctions.ts
 *
 * Some criteria functions and checks for pulling tables
 */

import { CitrusGotReelSymbolValue } from "../../games/citrus-got-reel/math/config/CitrusGotReelSymbol";

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const CriteriaFunction_NoPayerWild = (
	layout: LayoutInstance,
	results: any
): boolean => {
	if (
		LayoutInstance.WildsContainSymbol(
			layout.wilds,
			CitrusGotReelSymbolValue.PayerWild
		)
	) {
		return false;
	}

	return true;
};

export const CriteriaFunction_NoCollectorWild = (
	layout: LayoutInstance,
	results: any
): boolean => {
	if (
		LayoutInstance.WildsContainSymbol(
			layout.wilds,
			CitrusGotReelSymbolValue.CollectorWild
		)
	) {
		return false;
	}

	return true;
};
