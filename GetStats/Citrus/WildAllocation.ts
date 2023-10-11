/**
 * WinBuckets.ts
 *
 * Code to track win buckets
 */

import { IWager } from "@slotify/gdk/lib/IGame";
import { GeneralAnalysisModule } from "../Common/GeneralAnalysisModule";

//To be extended later to track types of wild and multipliers

class TrackingData {
    public allocationByReelAndCell: number[][];
}
export class WildAllocation implements GeneralAnalysisModule {
	protected numReels: number;
	protected numCells: number;
    protected wildValues: number[];
    protected wildValuesBinaryMask: number;
    protected wildInfo: any[];
    protected trackingData:TrackingData;

	constructor(params: any) {
		//Handle parameters

        this.trackingData = new TrackingData();
		
		this.numReels = params.numReels;
		this.numCells = params.numCells;
        this.wildValues = params.wildValues;
        this.wildInfo = params.wildInfo;
        this.wildValuesBinaryMask = 0;
        this.wildValues.forEach((info) => {
            this.wildValuesBinaryMask |= 1<< info;
        }); 

        //Create the tracking

        this.trackingData.allocationByReelAndCell = [];
        for(let reel = 0; reel < this.numReels; reel++) {
            this.trackingData.allocationByReelAndCell[reel] = [];
            for(let cell = 0; cell < this.numCells; cell++) {
                this.trackingData.allocationByReelAndCell[reel][cell] = 0;
            }
        }

	}

    public GetID(): string {
		return 'WildAllocation';
	}

	public Save(): string {
		return JSON.stringify(this.trackingData);
	}

	public Load(data: string) {
		this.trackingData = JSON.parse(data);
	}

	public ProcessWager(wager: IWager) {
		//Find all wilds and track them

        const toProcess = [];
        toProcess.push(wager.data.baseGameSpin.reelsBefore);
        wager.data.bonusGameSpins.forEach((bonus) => {
            toProcess.push(bonus.reelsBefore);
        });

        toProcess.forEach((reels) => {
            for(let reel = 0; reel < this.numReels; reel++) {
                for(let cell = 0; cell < this.numCells; cell++) {
                    if(this.wildValuesBinaryMask & (1<<reels[reel][cell].symbol)) {
                        this.trackingData.allocationByReelAndCell[reel][cell]++; 
                    }
                }
            }
        });
	}

	public Report(): string[] {
        const report: string[] = [];

        report.push("Wild Allocation Report:");

        for(let cell = 0; cell < this.numCells; cell++) {
            let line: string = "Cell " + cell + " :> | ";
            for(let reel = 0; reel < this.numReels; reel++) {
                const count = "        " + this.trackingData.allocationByReelAndCell[reel][cell];
                line+= " " + count.substring(count.length - 7) + " |";
            }
            report.push(line);
        }
        return report;
	}
}
