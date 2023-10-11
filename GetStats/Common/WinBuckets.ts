/**
 * WinBuckets.ts
 *
 * Code to track win buckets
 */

import { IWager } from "@slotify/gdk/lib/IGame";
import { GeneralAnalysisModule } from "./GeneralAnalysisModule";

export type WinAnalysis_Bucket = {
	value: string;
	hitCount: number;
};

class TrackingData {
	public minWin: number = 2 ^ 52;
	public maxWin: number = 0;
	public winBuckets: WinAnalysis_Bucket[];
}
export class WinBuckets implements GeneralAnalysisModule{
	
	protected onlyReportHitBuckets: boolean = false;
	protected maxIndividualCheck = 10000;
	protected trackingData: TrackingData;

	constructor(params: any) {
    
		this.trackingData = new TrackingData();
		
		//Handle parameters

		this.onlyReportHitBuckets = params.reportOnlyHitValues;

		//Create the buckets

		this.trackingData.winBuckets = [];

		for (let bucketVal = 0; bucketVal <= 10000; bucketVal += 1) {
			const newBucket = {
				value: "" + bucketVal / 100,
				hitCount: 0,
			};
			this.trackingData.winBuckets.push(newBucket);
		}
	}

	public GetID(): string {
		return 'WinBucket';
	}

	public Save(): string {
		return JSON.stringify(this.trackingData);
	}

	public Load(data: string) {
		this.trackingData = JSON.parse(data);
	}

	public ProcessWager(wager: IWager) {
		//Find the win to 2 DP

		const winBucketIndex = Math.floor(wager.win * 100);
		const expectedValueString = "" + wager.win.toFixed(2);
        if(wager.win < this.trackingData.minWin) {
            this.trackingData.minWin = wager.win;
        }
        if(wager.win > this.trackingData.maxWin) {
            this.trackingData.maxWin = wager.win;
        }

		if (winBucketIndex > this.maxIndividualCheck) {
			//Create excess bucket

			const matchedIndex = this.trackingData.winBuckets.findIndex((bucket) => {
				return bucket.value === expectedValueString;
			});
			if (matchedIndex !== -1) {
				this.trackingData.winBuckets[matchedIndex].hitCount++;
			} else {
				const newBucket = {
					value: expectedValueString,
					hitCount: 1,
				};
				this.trackingData.winBuckets.push(newBucket);
			}
		} else {
			this.trackingData.winBuckets[winBucketIndex].hitCount++;
		}
	}

	public Report(): string[] {
        const result: string[] = [];

        result.push("WinAnalysis report:");

		if (this.onlyReportHitBuckets) {
			const bucketsToReport: WinAnalysis_Bucket[] = [];
			this.trackingData.winBuckets.forEach((bucket) => {
				if (bucket.hitCount !== 0) {
					bucketsToReport.push(bucket);
				}
			});
			bucketsToReport.sort((a, b) => {
				return Number(a.value) - Number(b.value);
			});
			result.push("Bucket JSON: >");
            result.push(JSON.stringify(bucketsToReport));        
		} else {
            result.push(JSON.stringify(this.trackingData.winBuckets));
		}

        return result;
	}
}
