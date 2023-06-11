import {mathConfig} from "./config/mathConfig";
import {WaysAmountLevel} from "./config/WaysAmountLevel";

export function getWaysAmountLevel(waysAmount: number): WaysAmountLevel {

    const currentMaths =  mathConfig()

    /*for (const waysLevel in mathConfig.waysAmountLevelThresholds) {
        if (waysAmount < mathConfig.waysAmountLevelThresholds[waysLevel]) {
            return waysLevel as unknown as WaysAmountLevel;
        }

        throw new Error("Incorrect ways amount");
    }*/

    let waysLevel = WaysAmountLevel.MinWays;
    if (waysAmount > currentMaths.waysAmountLevelThresholds[WaysAmountLevel.MinWays])
        waysLevel = WaysAmountLevel.LowWays;
    if (waysAmount > currentMaths.waysAmountLevelThresholds[WaysAmountLevel.LowWays])
        waysLevel = WaysAmountLevel.MedWays;
    if (waysAmount > currentMaths.waysAmountLevelThresholds[WaysAmountLevel.MedWays])
        waysLevel = WaysAmountLevel.HighWays;

    return waysLevel;
}
