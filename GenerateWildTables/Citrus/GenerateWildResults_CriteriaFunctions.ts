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
	UnpackWild,
} from "./GenerateWildResults_Defines";

// eslint-disable-next-line @typescript-eslint/no-unused-vars

export const CriteriaFunction_DirectionalWild = (
	layout: LayoutInstance
): boolean => {
	if (
		LayoutInstance.WildsContainSymbol(
			layout.wilds,
			CitrusGotReelSymbolValue.DirectionalWild
		)
	) {
		return true;
	}

	return false;
};

export const CriteriaFunction_NoMultiplierWild = (
	layout: LayoutInstance
): boolean => {
	if (LayoutInstance.WildsMultiplierGreaterThan(layout.wilds, 1)) {
		return true;
	}

	return false;
};

export const CriteriaFunction_NoDirectionalWild = (
	layout: LayoutInstance
): boolean => {
	if (
		LayoutInstance.WildsContainSymbol(
			layout.wilds,
			CitrusGotReelSymbolValue.DirectionalWild
		)
	) {
		return false;
	}

	return true;
};

export const CriteriaFunction_NoPayerWild = (
	layout: LayoutInstance
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
	layout: LayoutInstance
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

export const CriteriaFunction_PayerInWin = (
	layout: LayoutInstance
): boolean => {
	if (
		LayoutInstance.WildsContainSymbol(
			layout.wilds,
			CitrusGotReelSymbolValue.PayerWild
		)
	) {
		return true;
	}
	return false;
};

export const CriteriaFunction_CollectorInWin = (
	layout: LayoutInstance
): boolean => {
	if (
		LayoutInstance.WildsContainSymbol(
			layout.wilds,
			CitrusGotReelSymbolValue.CollectorWild
		)
	) {
		return true;
	}

	return false;
};

export const CriteriaFunction_ContainsDirectionalLeftFacingInReel5 = (
	layout: LayoutInstance
): boolean => {
	//Go through the wilds, and accept if any is in reel 5 and directional and facing left

	for (let i = 0; i < layout.wilds.length; i++) {
		const thisWild: SavedWildInfo = UnpackWild(layout.wilds[i]);

		if (thisWild.reelIndex === 5) {
			if (thisWild.symbol === CitrusGotReelSymbolValue.DirectionalWild) {
				if (thisWild.direction === 2) {
					//Got match

					return true;
				}
			}
		}
	}

	//None found

	return false;
};
