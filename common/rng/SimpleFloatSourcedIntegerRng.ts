import {IntegerRng} from "./IntegerRng";

export default class SimpleFloatSourcedIntegerRng implements IntegerRng {
    private readonly floatRng: () => number;

    constructor(floatRng: () => number) {
        this.floatRng = floatRng;
    }

    public randomInteger(limit: number) {
        return Math.trunc(this.floatRng() * limit);
    }
}
