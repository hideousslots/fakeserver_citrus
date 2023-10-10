/**
 * GeneralAnalysis.ts
 *
 * Code to hook into the tequity stats system and handle any additional analysis we need
 */

import { IWager } from "@slotify/gdk/lib/IGame";

import { GeneralAnalysisModule } from "./GeneralAnalysisModule";

export class GeneralAnalysis{
	

	protected _modules: GeneralAnalysisModule[] = [];
	protected isActive: boolean = false;
	protected reportToConsole = false;
	protected wagersProcessed: number = 0;
	protected reportRate: number = 1000;

	constructor(params) {
		if (params.isActive !== undefined) {
			this.isActive = params.isActive;
		}

		if (params.reportToConsole !== undefined) {
			this.reportToConsole = params.reportToConsole;
		}

		if(params.reportRate !== undefined) {
			this.reportRate = params.reportRate;
		}

	}

	public AddModule(module: GeneralAnalysisModule) {
		this._modules.push(module);
	}

	public processWagers(wagers: IWager[]) {
		if (!this.isActive) {
			return;
		}

		//Pass to each submodule

		for (let i = 0; i < wagers.length; i++) {
			const thisWager = wagers[i];

			this._modules.forEach((module) => {
				module.ProcessWager(thisWager);
			});

			//Every X wagers, report to the

			this.wagersProcessed++;

			if (this.wagersProcessed % this.reportRate === 0) {
				this.Report();
			}
		}
	}

	protected Report() {
		const report: string[][] = [];

		report.push([
			"General analysis report after " + this.wagersProcessed + ": \n",
		]);

		this._modules.forEach((module) => {
			report.push(module.Report());
		});

		report.forEach((lines) => {
            console.log("\n---\n\n");
			lines.forEach((line) => {
				console.log(line);
			});
		});
	}
}
