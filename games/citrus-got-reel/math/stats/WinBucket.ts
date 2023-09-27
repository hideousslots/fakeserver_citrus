import Stats from "@slotify/gdk/lib/stats/Stats";
import {IWager} from "@slotify/gdk/lib/IGame";

export default class WinBucket extends Stats<any>  {
    private hits: number;
    private hitFunction: (wagers: IWager[]) => boolean;
    private productSum: number;
        
    constructor(hitFunction: (wagers: IWager[]) => boolean) {
        super();
        this.hits = 0;
        this.hitFunction = hitFunction;
        this.productSum = 0;
    }

    protected processWagers(wagers: IWager[]) {
        if (this.hitFunction(wagers)) {
            this.hits++;
            const baseGameRespinsSession = wagers[wagers.length - 1].data.baseGameRespinsSession;
            const reels = baseGameRespinsSession[baseGameRespinsSession.length - 1].reels; // get the last wager's reels
            const product = reels.reduce((prod, arr) => prod * arr.length, 1);
            this.productSum += product;
        }
    }
    

    // This function returns the average product of lengths
    averageProduct() {
        const product =  this.hits === 0 ? 0 : this.productSum / this.hits;
        return product.toFixed(2);
    }

    value() {
        return this.hits;
    }

    message() {
        return "Hits: " + this.value() + ", Average Ways: " + this.averageProduct();
    }

    mapResults() {
        return { 
            hits: this.hits, 
            filteredIterations: this.filteredIterations,
            productSum: this.productSum,  // Include the product sum in the result
        };
    }

    reduceResults(result) {
        this.hits += result.hits;
        this.filteredIterations += result.filteredIterations;
        this.productSum += result.productSum;  // Reduce the product sums
    }

    clearResults() {
        this.hits = 0;
        this.filteredIterations = 0;
        this.productSum = 0;  // Clear the product sum
    }
}
