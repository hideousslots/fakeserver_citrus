import {Position} from "../../../common/reels/Position";

export function getPositionsOnReels(reels: any[][],
                                    columns: number[]): Position[] {

    return columns.flatMap(column => {
        const reelPositions = [];
        for (let row = 0; row < reels[column].length; row++) {
            reelPositions.push({column, row});
        }
        return reelPositions;
    });
}
