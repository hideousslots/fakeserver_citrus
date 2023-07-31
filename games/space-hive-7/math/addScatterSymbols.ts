import {IntegerRng} from "../../../common/rng/IntegerRng";
import {mathConfig} from "./config/mathConfig";
import {SpaceHiveSymbol} from "./config/SpaceHiveSymbol";

export function addScatterSymbols(integerRng: IntegerRng, reels: SpaceHiveSymbol[][], initialScatters: number, payload: number): void {
    const currentMaths = mathConfig();

    // Adjust payload if the sum of initialScatters and payload exceeds scattersTriggeringBonusAmount
    if (initialScatters + payload > currentMaths.scattersTriggeringBonusAmount) {
        payload = currentMaths.scattersTriggeringBonusAmount - initialScatters;
    }

    // Create a Set to track used reels
    const usedReels = new Set<number>();

    // Loop for each payload
    for (let i = 0; i < payload; i++) {
        let row: number;

        // Generate unique positions and ensure it's on a different reel
        do {
            row = integerRng.randomInteger(reels.length - 1);
        } while (usedReels.has(row));

        const column = integerRng.randomInteger(reels[row].length - 1); // Get the random column

        // Add the reel to the usedReels Set
        usedReels.add(row);

        // Replace position with Scatter
        reels[row][column] = SpaceHiveSymbol.Scatter;
    }
}
