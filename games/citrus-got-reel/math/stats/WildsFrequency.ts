import Stats from "@slotify/gdk/lib/stats/Stats";
import {IWager} from "@slotify/gdk/lib/IGame";
import {mathConfig} from "../config/mathConfig";


interface IMapReduceData {
    wildsFrequencyOnReels: number[][],
}

export default class WildsFrequency extends Stats<any> {
    private wildsFrequencyOnReels: number[][] = this.clearResults();
    private currentMaths =  mathConfig()

    value() {
        return null;
    }

    message() {
        return this.wildsFrequencyOnReels.map(reel =>
            " \n[" + reel.join(", ") + "]")
            .toString();
    }

    mapResults() {
        return {wildsFrequencyOnReels: this.wildsFrequencyOnReels};
    }

    reduceResults(result: IMapReduceData) {
        for (let column = 0; column < this.wildsFrequencyOnReels.length; column++) {
            for (let row = 0; row < this.wildsFrequencyOnReels[column].length; row++) {
                this.wildsFrequencyOnReels[column][row] +=
                    result.wildsFrequencyOnReels[column][row];
            }
        }
    }

    clearResults() {
        return this.wildsFrequencyOnReels = this.currentMaths.baseGameInitialReelLengths.map(reelLength =>
            new Array<number>(reelLength).fill(0)
        );
    }

    protected processWagers(wagers: IWager[]) {
        wagers.forEach(wager => wager.data.beeWildPositions.forEach(position =>
            this.wildsFrequencyOnReels[position.column][position.row]++
        ));
    }
}
