/**
 * RTP.ts
 *
 * Code to track RTP
 */

import { IWager } from "@slotify/gdk/lib/IGame";
import { GeneralAnalysisModule } from "../Common/GeneralAnalysisModule";

export class RTP implements GeneralAnalysisModule{
	
	protected spent: number;
	protected won: number;
	protected baseGameWon: number;
	protected bonusGameWon: number;

	constructor(params: any) {
        this.spent = 0;
		this.won = 0;
		this.baseGameWon = 0;
		this.bonusGameWon = 0;
	}

	public ProcessWager(wager: IWager) {

		this.spent += wager.data.stake;
		this.won += wager.win;
		this.baseGameWon += wager.data.baseGameSpin.win;
		wager.data.bonusGameSpins.forEach((spin) => {
			this.bonusGameWon += spin.win;
		});
		
	}

	public Report(): string[] {
        const result: string[] = [];

        result.push("RTP report:");

		result.push("Wagered: " + this.spent);
		result.push("Whole game Won: " + this.won);
		result.push("Whole game RTP: " + (Math.floor((this.won / this.spent) * 10000) / 100) + "%");
		result.push("Base game Won : " + this.won);
		result.push("Base game RTP : " + (Math.floor((this.baseGameWon / this.spent) * 10000) / 100) + "%");
		result.push("Bonus game Won: " + this.won);
		result.push("Bonus game RTP: " + (Math.floor((this.bonusGameWon / this.spent) * 10000) / 100) + "%");
        return result;
	}
}
