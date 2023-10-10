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

export class WinBuckets implements GeneralAnalysisModule{
	protected minWin: number = 2 ^ 52;
	protected maxWin: number = 0;
	protected winBuckets: WinAnalysis_Bucket[];
	protected onlyReportHitBuckets: boolean = false;
	protected maxIndividualCheck = 10000;

	constructor(params: any) {
        //Handle parameters

		this.onlyReportHitBuckets = params.reportOnlyHitValues;

		//Create the buckets

		this.winBuckets = [];

		for (let bucketVal = 0; bucketVal <= 10000; bucketVal += 1) {
			const newBucket = {
				value: "" + bucketVal / 100,
				hitCount: 0,
			};
			this.winBuckets.push(newBucket);
		}
	}

	public ProcessWager(wager: IWager) {
		//Find the win to 2 DP

		const winBucketIndex = Math.floor(wager.win * 100);
		const expectedValueString = "" + wager.win.toFixed(2);
        if(wager.win < this.minWin) {
            this.minWin = wager.win;
        }
        if(wager.win > this.maxWin) {
            this.maxWin = wager.win;
        }

		if (winBucketIndex > this.maxIndividualCheck) {
			//Create excess bucket

			const matchedIndex = this.winBuckets.findIndex((bucket) => {
				return bucket.value === expectedValueString;
			});
			if (matchedIndex !== -1) {
				this.winBuckets[matchedIndex].hitCount++;
			} else {
				const newBucket = {
					value: expectedValueString,
					hitCount: 1,
				};
				this.winBuckets.push(newBucket);
			}
		} else {
			this.winBuckets[winBucketIndex].hitCount++;
		}
	}

	public Report(): string[] {
        const result: string[] = [];

        result.push("WinAnalysis report:");

		if (this.onlyReportHitBuckets) {
			const bucketsToReport: WinAnalysis_Bucket[] = [];
			this.winBuckets.forEach((bucket) => {
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
            result.push(JSON.stringify(this.winBuckets));
		}

        return result;
	}
}
