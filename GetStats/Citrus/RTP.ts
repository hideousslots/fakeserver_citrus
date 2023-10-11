/**
 * RTP.ts
 *
 * Code to track RTP
 */

import { IWager } from "@slotify/gdk/lib/IGame";
import { GeneralAnalysisModule } from "../Common/GeneralAnalysisModule";

class TrackingData {
	public spent: number;
	public won: number;
	public baseGameWon: number;
	public bonusGameWon: number;
}
export class RTP implements GeneralAnalysisModule{
	
	protected trackingData:TrackingData;


	constructor(params: any) {
		this.trackingData = new TrackingData();
        this.trackingData.spent = 0;
		this.trackingData.won = 0;
		this.trackingData.baseGameWon = 0;
		this.trackingData.bonusGameWon = 0;
	}

	public GetID(): string {
		return 'RTP';
	}

	public Save(): string {
		return JSON.stringify(this.trackingData);
	}

	public Load(data: string) {
		this.trackingData = JSON.parse(data);
	}

	public ProcessWager(wager: IWager) {

		this.trackingData.spent += wager.data.stake;
		this.trackingData.won += wager.win;
		this.trackingData.baseGameWon += wager.data.baseGameSpin.win;
		wager.data.bonusGameSpins.forEach((spin) => {
			this.trackingData.bonusGameWon += spin.win;
		});
		
	}

	public Report(): string[] {
        const result: string[] = [];

        result.push("RTP report:");

		result.push("Wagered: " + this.trackingData.spent);
		result.push("Whole game Won: " + this.trackingData.won);
		result.push("Whole game RTP: " + (Math.floor((this.trackingData.won / this.trackingData.spent) * 10000) / 100) + "%");
		result.push("Base game Won : " + this.trackingData.won);
		result.push("Base game RTP : " + (Math.floor((this.trackingData.baseGameWon / this.trackingData.spent) * 10000) / 100) + "%");
		result.push("Bonus game Won: " + this.trackingData.won);
		result.push("Bonus game RTP: " + (Math.floor((this.trackingData.bonusGameWon / this.trackingData.spent) * 10000) / 100) + "%");
        return result;
	}
}
