/**
 * GetStats.ts
 * 
 * Stats file for citrus tests
 */

import { GeneralAnalysis } from "../Common/GeneralAnalysis";
import {  WinBuckets } from "../Common/WinBuckets";
import { WildAllocation } from "./WildAllocation";
import { RTP } from "./RTP";
import * as fs from 'fs';

export const RunStats = function (_gameInteface:any, parameters: any) {

    //Adjust parameters?

    let resetStats: boolean = false;
    let finalReport: boolean = false;
    const adjustedParameters: any = parameters;

    if(process.argv.length >2) {
        for(let i = 2; i < process.argv.length; i++) {
            const arg = process.argv[i];
            if(arg === 'resetstats') {
                resetStats = true;
            }
            if(arg === 'finalreport') {
                finalReport = true;
            }
            if(arg.substring(0,11) === 'iterations=') {
                adjustedParameters.iterations = Number(arg.substring(11));
            }
            if(arg.substring(0,11) === 'reportrate=') {
                adjustedParameters.reportRate = Number(arg.substring(11));
            }            
        }
    }

    const statsClass: Stats = new Stats(_gameInteface, adjustedParameters);
    
    //Attempt to retreive prior results

    if(!resetStats) {
        console.log('Restoring current tracking data');
        try {
            const data = fs.readFileSync('./statstrackingtransfer.json',{ encoding: 'utf8', flag: 'r' });
            statsClass.Load(data);
        } 
        catch{
            console.log('No prior tracking data for this loop');
        }
    } else {
        console.log('No restore of current tracking');
    }

    statsClass.Run();

    //Save the data

    statsClass.Save();

    //Report

    if(finalReport) {
        console.log('FINAL REPORT');
        statsClass.Report();
    }
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

    public Save() {
        fs.writeFileSync('.//statstrackingtransfer.json', this.analysis.Save(),{ encoding: 'utf8', flag: 'w' });
    }

    public Load(data: string) {
        this.analysis.Load(data);
    }

    public Report() {
        this.analysis.Report();
    }

}