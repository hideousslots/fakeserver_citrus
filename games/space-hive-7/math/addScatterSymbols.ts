import {IntegerRng} from "../../../common/rng/IntegerRng";
import {WaysWin} from "../../../common/wins/ways/WaysWin";
import {Position} from "../../../common/reels/Position";
import {mathConfig} from "./config/mathConfig";
import {SpaceHiveSymbol} from "./config/SpaceHiveSymbol";

export function addScatterSymbols(integerRng: IntegerRng, reels: SpaceHiveSymbol[][], initialScatters: number, payload: number): void {
    const currentMaths =  mathConfig();

    // Adjust payload if the sum of initialScatters and payload exceeds scattersTriggeringBonusAmount
    if (initialScatters + payload > currentMaths.scattersTriggeringBonusAmount) {
        payload = currentMaths.scattersTriggeringBonusAmount - initialScatters;
    }

    // Create a map to track used positions
    let usedPositions = new Map<string, boolean>();

    // Loop for each payload
    for (let i = 0; i < payload; i++) {
        let row: number;
        let column: number;

        // Generate unique positions
        do {
            row = integerRng.randomInteger(reels.length - 1);
            column = integerRng.randomInteger(reels[row].length - 1);
        } while (usedPositions.has(`${row},${column}`));

        // Add position to the used map
        usedPositions.set(`${row},${column}`, true);

        // Replace position with Scatter
        reels[row][column] = SpaceHiveSymbol.Scatter;
    }
    
}
