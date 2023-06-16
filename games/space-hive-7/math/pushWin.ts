import {IntegerRng} from "../../../common/rng/IntegerRng";
import {SpaceHiveSymbol} from "./config/SpaceHiveSymbol";

//Push Individual Wins To Dead Reels
// Intended for 1 or 2 Way Wins
// Higher ways amounts may differ from other implmentations due to algorithm differences

export function pushWin(integerRng: IntegerRng, reels: SpaceHiveSymbol[][], symbol: SpaceHiveSymbol, oak: number, maxWays: number) {

    const excludedSymbols: SpaceHiveSymbol[] = [
        SpaceHiveSymbol.Scatter,
        SpaceHiveSymbol.Wild,
        SpaceHiveSymbol.PlaceHolder,
        symbol
      ];

    const symbols: SpaceHiveSymbol[] = (Object.values(SpaceHiveSymbol) as SpaceHiveSymbol[])
      .filter((s) => typeof s === "number" && !excludedSymbols.includes(s));
    
    // Fisher-Yates shuffle algorithm
    for (let i = symbols.length - 1; i > 0; i--) {
        const j = integerRng.randomInteger(i + 1);
        [symbols[i], symbols[j]] = [symbols[j], symbols[i]];
    }

    const midIndex = Math.floor(symbols.length / 2);
    const firstHalf = symbols.slice(0, midIndex);
    const secondHalf = symbols.slice(midIndex);

    // Blank Reels
    for (let i = 0; i < reels.length; i++) {
        const reel = reels[i];
    
        // Choose the symbol group based on the reel's index
        const symbols = i % 2 === 0 ? firstHalf : secondHalf;
    
        for (let j = 0; j < reel.length; j++) {
          // Replace each symbol with a random one from the chosen group
          const randomIndex = Math.floor(Math.random() * symbols.length);
          reel[j] = symbols[randomIndex];
        }
    }


  // Determine the direction to insert the winning symbols
  const direction = integerRng.randomInteger(9) < 5 ? "left" : "right";

  // Determine the number of symbols to put on each reel
  let remainingWays = maxWays;
  const symbolsPerReel = Array(oak).fill(1); // Start by putting one symbol on each reel

  let canIncrease = true;
  
  if (direction === "left") {
    while (remainingWays > 1 && canIncrease) {
      canIncrease = false; // Reset the flag
      for (let i = 0; i < oak && remainingWays > 1; i++) {
        if (symbolsPerReel[i] < reels[i].length) {
          // Calculate the fraction for adding a new symbol to this reel
          const fraction = symbolsPerReel[i] / (symbolsPerReel[i] + 1);
          if (remainingWays * fraction <= 1) {
            symbolsPerReel[i]++;
            remainingWays *= fraction;
            canIncrease = true; // If we managed to add a symbol, we can do another pass
          }
        }
      }
    }
  } else {
    while (remainingWays > 1 && canIncrease) {
      canIncrease = false; // Reset the flag
      for (let i = 0; i < oak && remainingWays > 1; i++) {
        const reelIndex = reels.length - 1 - i;
        if (symbolsPerReel[i] < reels[reelIndex].length) {
          // Calculate the fraction for adding a new symbol to this reel
          const fraction = symbolsPerReel[i] / (symbolsPerReel[i] + 1);
          if (remainingWays * fraction <= 1) {
            symbolsPerReel[i]++;
            remainingWays *= fraction;
            canIncrease = true; // If we managed to add a symbol, we can do another pass
          }
        }
      }
    }
  }

  // Insert the winning symbols into the reels
  for (let i = 0; i < oak; i++) {
  const reelIndex = direction === "left" ? i : reels.length - 1 - i;
  const reel = reels[reelIndex];

  let positions: number[] = [];
  for (let j = 0; j < symbolsPerReel[i]; j++) {
    let pos: number;
    do {
      pos = integerRng.randomInteger(reel.length);
    } while (positions.includes(pos));
    positions.push(pos);

    reel[pos] = symbol; // Insert the winning symbol at a random position
  }
}

}