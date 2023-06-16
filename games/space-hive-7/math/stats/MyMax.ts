import fs from 'fs';
import { IWager } from "@slotify/gdk/lib/IGame";
import Stats from "@slotify/gdk/lib/stats/Stats";

interface IMapReduceData {
    max: number;
}

export default class MaxWithLogging<TData = any, TState = any> extends Stats<TData, TState> {
    private max: number;
    private readonly valueFunction: (wagers: IWager<TData, TState>[]) => number;

    constructor(valueFunction: (wagers: IWager<TData, TState>[]) => number) {
        super();
        this.valueFunction = valueFunction;
        this.max = -Infinity; // Assuming all values are positive, or replace with suitable initial value
    }

    protected processWagers(wagers: IWager<TData, TState>[]): void {
    wagers.forEach((wager) => {
        const value = this.valueFunction([wager]);
        if (value > this.max) {
            this.max = value;
            const bigWin = JSON.stringify(wager.win) + " " + JSON.stringify(wager.data);
            fs.writeFileSync('log/MaxWins.log', bigWin);
            }
        });
    }


    // Define the rest of your methods here...
    value(): number {
        return this.max;
    }

    message(): string {
        return `Max value is: ${this.max}`;
    }

    mapResults(): IMapReduceData {
        return { max: this.max };
    }

    reduceResults(result: IMapReduceData): void {
        if (result.max > this.max) {
            this.max = result.max;
        }
    }

    clearResults(): void {
        this.max = -Infinity; // Reset max
    }
}
