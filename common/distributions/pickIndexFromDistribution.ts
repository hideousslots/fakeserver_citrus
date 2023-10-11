import {IntegerRng} from "../rng/IntegerRng";
import {Distribution} from "./Distribution";

export function pickIndexFromDistribution<TValue>(integerRng: IntegerRng,
                                                  distribution: Distribution<TValue>)
    : number {
    if (distribution.values.length !== distribution.weights.length) {
        throw new Error("Values and weights arrays must have the same length.");
    }

    const totalWeight = distribution.weights.reduce((acc, weight) => acc + weight, 0);
    let chosenWeight = integerRng.randomInteger(totalWeight);

    //NB Different way to check - snc 2023106
    //Should not require small value adjuster

    for (let i = 0; i < distribution.values.length; i++) {
        if (chosenWeight < distribution.weights[i]) {
            return i;            
        }
        chosenWeight -=distribution.weights[i];
    }

    throw new Error("Unreachable malfunction");
}