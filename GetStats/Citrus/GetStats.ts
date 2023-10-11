/**
 * GetStats.ts
 * 
 * Stats file for citrus tests
 */

import { GeneralAnalysis } from "../Common/GeneralAnalysis";
import { GeneralAnalysisModule } from "../Common/GeneralAnalysisModule";
import { WinAnalysis_Bucket, WinBuckets } from "../Common/WinBuckets";
import { WildAllocation } from "./WildAllocation";
import { RTP } from "./RTP";

export const RunStats = function (_gameInteface:any, parameters: any) {
    const statsClass: Stats = new Stats(_gameInteface, parameters);
    
    statsClass.Run();
};

export class Stats {

    protected analysis: GeneralAnalysis;
    protected gameInterface: any;
    protected iterations: number = 1;

    constructor(_gameInterface: any, parameters: any) {

        let reportRateToUse: number = 1000;

        this.gameInterface = _gameInterface;
        
        if(parameters.iterations !== undefined) {
            this.iterations = parameters.iterations;
        }

        if(parameters.reportRate !== undefined) {
            reportRateToUse = parameters.reportRate;
        }

        this.analysis = new GeneralAnalysis({isActive: true, reportToConsole: true, reportRate: reportRateToUse});
        
        //Set up other modules

        this.analysis.AddModule(new WinBuckets({reportOnlyHitValues:true}));
        this.analysis.AddModule(new WildAllocation({
            numReels: 6,
            numCells: 5,
            wildValues: [11,12,13,14],
            wildInfo: ["Wild", "DirectionalWild", "CollectorWild", "PayerWild"]
        }));
        this.analysis.AddModule(new RTP({}));
    }

    //Run through multiple games and process the results

    public Run() {
        console.log('Running ' + this.iterations + ' loops');

        let remaining = this.iterations;
        while(remaining-- > 0) {
            const gameResponse = this.gameInterface.play({ bet: 1, action: "main", state: null, variant: "95rtp", promo: null });
            //console.log(JSON.stringify(gameResponse));
            this.analysis.processWagers([gameResponse]);
        }
        
    }

}