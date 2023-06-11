import {IntegerRng} from "../../../common/rng/IntegerRng";
import {pickValueFromDistribution} from "../../../common/distributions/pickValueFromDistribution";
import {mathConfig} from "./config/mathConfig";
import {SpaceHiveSymbol} from "./config/SpaceHiveSymbol";
import {Position} from "../../../common/reels/Position";
import {getPositionsOnReels} from "./getPositionsOnReels";

export function pickBeeWildPositions(integerRng: IntegerRng,
                                     symbolReels: SpaceHiveSymbol[][],
                                     wildsAmount: number): Position[] {

    const currentMaths =  mathConfig()
    const wildPositions = [];

    let availablePositions = getPositionsOnReels(symbolReels, currentMaths.beeWildsFeatureConfig.remainingWildsColumns);

    const columnsToApplyFirst =
        pickValueFromDistribution(integerRng, currentMaths.beeWildsFeatureConfig.initialWildColumnsDistribution) as Array<any>;

    columnsToApplyFirst.forEach(column => {
        const row = integerRng.randomInteger(symbolReels[column].length);

        wildPositions.push({column, row});

        availablePositions = availablePositions.filter(availablePosition =>
            availablePosition.column !== column || availablePosition.row !== row);
    });

    const remainingWilds = wildsAmount - columnsToApplyFirst.length;

    for (let i = 0; i < remainingWilds; i++) {
        const positionIndex = integerRng.randomInteger(availablePositions.length);
        wildPositions.push(availablePositions[positionIndex]);
        availablePositions.splice(positionIndex, 1);
    }

    return wildPositions;
}
