/**
 * GenerateWildTables.ts
 *
 * Stats file for citrus tests
 */

import { CitrusGotReelSymbolValue } from "../../games/citrus-got-reel/math/config/CitrusGotReelSymbol";

import * as fs from "fs";

export const RunGenerator = function (_gameInterface: any, parameters: any) {
	//Adjust parameters?

	const adjustedParameters: any = parameters;

	if (process.argv.length > 2) {
		for (let i = 2; i < process.argv.length; i++) {
			const arg = process.argv[i];
			if (arg.substring(0, 11) === "iterations=") {
				adjustedParameters.iterations = Number(arg.substring(11));
			}
		}
	}

	const statsClass: Stats = new Stats(_gameInterface, adjustedParameters);

	statsClass.Run();

	//Save the data

	statsClass.Save();

	//Report

	console.log(
		"session ran for " +
			statsClass.iterations +
			" with " +
			statsClass.savedResults.length +
			" results stored\n" +
			"total win " +
			statsClass.GetTotalWin() +
			"\n" +
			"average win " +
			statsClass.GetAverageWin()
	);
};

class WildInfo {
	public reelIndex: number;
	public cellIndex: number;
	public symbol: number;
	public multiplier: number;
	public sticky: boolean;
	public direction: number; //0: 'up' 1: 'down' 2: 'left' 3: 'right
	public steps: number;

	constructor(reelIndex: number, cellIndex: number, cell: any) {
		this.reelIndex = reelIndex;
		this.cellIndex = cellIndex;
		this.symbol = cell.symbol;
		if (cell.multiplier !== undefined) {
			this.multiplier = cell.multiplier;
		}
		if (cell.sticky !== undefined) {
			this.sticky = cell.sticky;
		}
		if (cell.direction !== undefined) {
			if (cell.direction === "up") {
				this.direction = 0;
			}
			if (cell.direction === "down") {
				this.direction = 1;
			}
			if (cell.direction === "left") {
				this.direction = 2;
			}
			if (cell.direction === "right") {
				this.direction = 3;
			}
		}
		if (cell.steps !== undefined) {
			this.steps = cell.steps;
		}
	}
}

class SavedResult {
	constructor(
		public wilds: WildInfo[],
		public scatterGridIndices: number[][],
		public win: number
	) {}
}
export class Stats {
	protected gameInterface: any;
	public iterations: number = 1;
	public startTimeUTC: number = Date.now();
	public savedResults: SavedResult[] = [];

	constructor(_gameInterface: any, parameters: any) {
		this.gameInterface = _gameInterface;

		if (parameters.iterations !== undefined) {
			this.iterations = parameters.iterations;
		}
	}

	//Run through multiple games and process the results

	public Run() {
		console.log("Running " + this.iterations + " loops");

		let remaining = this.iterations;
		while (remaining-- > 0) {
			const gameResponse = this.gameInterface.play({
				bet: 1,
				action: "main",
				state: null,
				variant: "95rtp",
				promo: null,
			});

			//Check for wilds allocated in the landing grid

			const wilds: WildInfo[] = [];
			const scatterGridIndices: number[][] = [];
			gameResponse.data.baseGameSpin.reelsBefore.forEach(
				(reel, reelIndex) => {
					reel.forEach((cell, cellIndex) => {
						//Look for scatters or wilds
						if (cell.symbol === CitrusGotReelSymbolValue.Scatter) {
							scatterGridIndices.push([reelIndex, cellIndex]);
						} else if (
							cell.symbol === CitrusGotReelSymbolValue.Wild ||
							cell.symbol ===
								CitrusGotReelSymbolValue.CollectorWild ||
							cell.symbol ===
								CitrusGotReelSymbolValue.PayerWild ||
							cell.symbol ===
								CitrusGotReelSymbolValue.DirectionalWild
						) {
							wilds.push(
								new WildInfo(reelIndex, cellIndex, cell)
							);
						}
					});
				}
			);

			if (wilds.length !== 0) {
				this.savedResults.push(
					new SavedResult(wilds, scatterGridIndices, gameResponse.win)
				);
			}
		}
	}

	public GetTotalWin() {
		let totalWin = 0;
		this.savedResults.forEach((result) => {
			totalWin += result.win;
		});
		return totalWin;
	}

	public GetAverageWin() {
		if (this.savedResults.length === 0) {
			return 0;
		}
		return this.GetTotalWin() / this.savedResults.length;
	}
	public Save() {
		fs.writeFileSync(
			".//GeneratedWildTables//results_" +
				this.startTimeUTC.toString(16) +
				".json",
			JSON.stringify(this.savedResults),
			{ encoding: "utf8", flag: "w" }
		);
	}
}
