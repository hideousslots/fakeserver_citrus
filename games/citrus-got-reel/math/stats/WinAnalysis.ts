import Stats from "@slotify/gdk/lib/stats/Stats";
import {IWager} from "@slotify/gdk/lib/IGame";

type WinAnalysis_Bucket = {
    value: string;
    hitCount: number;
}
export default class WinAnalysis extends Stats<any>  {
    
    protected minWin: number = 2^52;
    protected maxWin: number = 0;
    protected winBuckets: WinAnalysis_Bucket[];
    protected wagersProcessed: number = 0;
    protected reportToConsole:boolean = false;
    protected onlyReportHitBuckets : boolean = false;
    protected reportRate: number = 0;

    protected maxIndividualCheck = 10000;
    constructor(params: any) {
        super();

        this.reportToConsole = params.active;
        this.onlyReportHitBuckets = params.reportOnlyHitValues;
        this.reportRate = params.reportRate;
        
        //Create the buckets

        this.winBuckets=[];

        for(let bucketVal = 0; bucketVal <= 10000; bucketVal+=1) {
            const newBucket = {
                value: "" + (bucketVal/100),
                hitCount: 0,
            };
            this.winBuckets.push(newBucket);
        }        
    }

    protected processWagers(wagers: IWager[]) {
        //Find the win to 2 DP

        for(let i = 0; i < wagers.length; i++) {
            const winBucketIndex = Math.floor(wagers[i].win * 100);
            const expectedValueString = "" + wagers[i].win.toFixed(2)
            if(winBucketIndex >this.maxIndividualCheck) {
                //Create excess bucket

                const matchedIndex = this.winBuckets.findIndex((bucket) => {return bucket.value === expectedValueString;});
                if(matchedIndex !== -1) {
                    this.winBuckets[matchedIndex].hitCount++;
                } else {
                    const newBucket = {value: expectedValueString, hitCount:1};
                    this.winBuckets.push(newBucket);
                }

            } else {
                this.winBuckets[winBucketIndex].hitCount++;
            }

            //Every X wagers, report to the

            this.wagersProcessed++;
            if((this.wagersProcessed % this.reportRate)===0) {
                console.log("Win analysis report after " + this.wagersProcessed + ": \n" + this.internalMessage());
            }
        }
    }
    

    // This function returns the average product of lengths
    averageProduct() {
        return 0;
    }

    value() {
        return 0;
    }

    message() {
        //This doesn't seem to be reporting, so winanalysis will instead report as wagers processed
        return this.internalMessage();
    }

    internalMessage() {
        if(this.reportToConsole) {
            if(this.onlyReportHitBuckets) {
                const bucketsToReport: WinAnalysis_Bucket[] = [];
                this.winBuckets.forEach((bucket) => {if(bucket.hitCount !== 0){bucketsToReport.push(bucket);}});
                bucketsToReport.sort((a,b) => {return Number(a.value) - Number(b.value);});
                return "WinAnalysis report (buckets with hitcounts):" + JSON.stringify(bucketsToReport);    
            } else {
                return "WinAnalysis report:" + JSON.stringify(this.winBuckets);
            }
        } else {
            return "WinAnalysis not reporting to console. Correct this if you want to see the winanalysis";
        }
    }

    mapResults() {
        return { 
        };
    }

    reduceResults(result) {        
    }

    clearResults() {
        
    }    
}
