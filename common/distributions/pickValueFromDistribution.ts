import {IntegerRng} from "../rng/IntegerRng";
import {Distribution} from "./Distribution";

export function pickValueFromDistribution<TValue>(integerRng: IntegerRng,
                                                  distribution: Distribution<TValue>)
    : TValue {
    if (distribution.values.length !== distribution.weights.length) {
        throw new Error("Values and weights arrays must have the same length.");
    }

    const totalWeight = distribution.weights.reduce((acc, weight) => acc + weight, 0);
    const randomNumber = integerRng.randomInteger(totalWeight);

    let weightSum = 0;
    for (let i = 0; i < distribution.values.length; i++) {
        weightSum += distribution.weights[i];
        if (randomNumber < weightSum - 0.00001) {
            return distribution.values[i];
        }
    }

    throw new Error("Unreachable malfunction");
}
