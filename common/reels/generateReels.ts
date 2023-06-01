import {IntegerRng} from "../rng/IntegerRng";

export function generateReels<TSymbol>(integerRng: IntegerRng,
                                       reelStrips: TSymbol[][],
                                       reelHeights: number[])
    : TSymbol[][] {

    const reels = [];
    for (let column = 0; column < reelHeights.length; column++) {
        const reelStrip = reelStrips[column];
        const stopPosition = integerRng.randomInteger(reelStrip.length);

        const reel = [];
        for (let row = 0; row < reelHeights[column]; row++) {
            reel.push(reelStrip[(stopPosition + row) % reelStrip.length]);
        }

        reels.push(reel);
    }

    return reels;
}
