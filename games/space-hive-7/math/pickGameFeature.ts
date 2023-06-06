import {WaysAmountLevel} from "./config/WaysAmountLevel";
import {IntegerRng} from "../../../common/rng/IntegerRng";
import {pickValueFromDistribution} from "../../../common/distributions/pickValueFromDistribution";
import {FeatureType} from "./config/FeatureType";
import {Distribution} from "../../../common/distributions/Distribution";

export interface GameFeature {
    featureType: FeatureType,
    payload?: any,
}

export function pickGameFeature(integerRng: IntegerRng,
                                featuresDistributions: { [profileId: string]: { [waysLevel: string]: Distribution<GameFeature> } },
                                gameProfile: string,
                                waysAmountLevel: WaysAmountLevel): GameFeature {

    const distribution = featuresDistributions[gameProfile][waysAmountLevel];

    return pickValueFromDistribution(integerRng, distribution);
}

export function pickGameFeatureFromDistribution(integerRng: IntegerRng, distribution: Distribution<GameFeature>): GameFeature {

    return pickValueFromDistribution(integerRng, distribution);
}
