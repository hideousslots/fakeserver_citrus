import { Position } from "../../../../common/reels/Position";

export enum CitrusGotReelSymbolValue {
	Ten,
	Jack,
	Queen,
	King,
	Ace,
	High1,
	High2,
	High3,
	High4,
	High5,
	Scatter,
	Wild,
	DirectionalWild,
	CollectorWild,
	PayerWild,
	PlaceHolder,
}

export type CitrusGotReelSymbol =
	| {
			symbol: Exclude<
				CitrusGotReelSymbolValue,
				CitrusGotReelSymbolValue.Wild
			>;
	  }
	| {
			symbol: CitrusGotReelSymbolValue.Wild;
			multiplier: number;
			sticky: boolean;
	  }
	| {
			symbol: CitrusGotReelSymbolValue.DirectionalWild;
			multiplier: number;
			direction: "up" | "down" | "left" | "right";
			steps: number;
			sticky: boolean;
	  }
	| {
			symbol: CitrusGotReelSymbolValue.CollectorWild;
			multiplier: number;
			sticky: boolean;
	  }
	| {
			symbol: CitrusGotReelSymbolValue.PayerWild;
			multiplier: number;
			sticky: boolean;
	  };

export interface LineWinDetails {
	symbol: CitrusGotReelSymbolValue;
	lineNumber: number;
	matchCount: number;
	positions: Position[];
	winAmount: number;
	multiplier: number;
}

export const nonWildSymbols: CitrusGotReelSymbolValue[] = [
	CitrusGotReelSymbolValue.Ten,
	CitrusGotReelSymbolValue.Jack,
	CitrusGotReelSymbolValue.Queen,
	CitrusGotReelSymbolValue.King,
	CitrusGotReelSymbolValue.Ace,
	CitrusGotReelSymbolValue.High1,
	CitrusGotReelSymbolValue.High2,
	CitrusGotReelSymbolValue.High3,
	CitrusGotReelSymbolValue.High4,
	CitrusGotReelSymbolValue.High5,
];

export const WildSymbols: CitrusGotReelSymbolValue[] = [
	CitrusGotReelSymbolValue.Wild,
	CitrusGotReelSymbolValue.DirectionalWild,
	CitrusGotReelSymbolValue.CollectorWild,
	CitrusGotReelSymbolValue.PayerWild,
];
