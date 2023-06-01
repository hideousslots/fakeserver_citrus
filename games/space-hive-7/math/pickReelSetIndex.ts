import {WaysAmountLevel} from "./config/WaysAmountLevel";
import {IntegerRng} from "../../../common/rng/IntegerRng";
import {pickValueFromDistribution} from "../../../common/distributions/pickValueFromDistribution";
import {Distribution} from "../../../common/distributions/Distribution";

export function pickReelSetIndex(integerRng: IntegerRng,
                                 reelSetsDistributions: { [profileId: string]: { [waysLevel: string]: Distribution<number> } },
                                 baseGameProfile: string,
                                 waysAmountLevel: WaysAmountLevel): number {

    const distribution = reelSetsDistributions[baseGameProfile][waysAmountLevel];

    return pickValueFromDistribution(integerRng, distribution);
}
