import { mathConfig } from "./mathConfig";
import { Position } from "../../../../common/reels/Position";
import {IntegerRng} from "../../../../common/rng/IntegerRng";
import {pickValueFromDistribution} from "../../../../common/distributions/pickValueFromDistribution";
import { FeatureType } from "./FeatureType";
import { ScatterInfo } from "../spin";

export enum CitrusGotReelSymbolValue {
    Ten,
    Jack,
    Queen,
    King,
    Ace,
    High1,
    High2,
    High3,
    High4,
    High5,
    Scatter,
    Wild,
    DirectionalWild,
    CollectorWild,
    PayerWild,
    PlaceHolder,
}

export type CitrusGotReelSymbol = 
    | {
        symbol: Exclude<CitrusGotReelSymbolValue, CitrusGotReelSymbolValue.Wild>;
      }
    | {
        symbol: CitrusGotReelSymbolValue.Wild;
        multiplier: number;
        sticky: boolean;
      }
    | {
        symbol: CitrusGotReelSymbolValue.DirectionalWild;
        multiplier: number;
        direction: "up" | "down" | "left" | "right";
        steps: number;
        sticky: boolean;
      }
    | {
        symbol: CitrusGotReelSymbolValue.CollectorWild;
        multiplier: number;
        sticky: boolean;
      }
    | {
        symbol: CitrusGotReelSymbolValue.PayerWild;
        multiplier: number;
        sticky: boolean;
      }

export interface LineWinDetails {
    symbol: CitrusGotReelSymbolValue;
    lineNumber: number;
    matchCount: number;
    positions: Position[];
    winAmount: number;
    multiplier: number;
}

  function hasMultiplier(obj: any): obj is { multiplier: number } {
    return obj && typeof obj.multiplier === "number";
  }

  
  function deepCloneArray(arr: any[][]): any[][] {
    return arr.map(row => row.map(cell => (cell !== undefined ? { ...cell } : undefined)));
  }
  

  export function addWilds(integerRng: IntegerRng, input: CitrusGotReelSymbol[][], context: "base" | "bonus"): CitrusGotReelSymbol[][] {

    const currentMaths = mathConfig();
  
    if (!pickValueFromDistribution(integerRng, currentMaths.wildFeatureActive[context])) {
      return input;
    }
  
    // Determine the number of wilds to place
    const numWilds: number = pickValueFromDistribution(integerRng, currentMaths.initialWilds[context]);
  
    /// Create an array of available positions for placing wilds
    const availablePositions: Position[] = [];
    for (let row = 0; row < input.length; row++) {
      for (let column = 0; column < input[row].length; column++) {
        if (typeof input[row][column] === "undefined") {
          availablePositions.push({ row, column });
        }
      }
    }
  
    // Mapping between FeatureType and CitrusGotReelSymbolValue
    const featureToSymbolMap: Record<FeatureType, (multiplier: number) => CitrusGotReelSymbol> = {
      [FeatureType.Wild]: (multiplier) => ({
        symbol: CitrusGotReelSymbolValue.Wild,
        multiplier,
        sticky: false,
      }),
      [FeatureType.DirectionalWild]: (multiplier) => ({
        symbol: CitrusGotReelSymbolValue.DirectionalWild,
        multiplier,
        direction: currentMaths.directions[integerRng.randomInteger(currentMaths.directions.length - 1)] as (typeof currentMaths.directions)[number],
        steps: pickValueFromDistribution(integerRng, currentMaths.stepsData),
        sticky: false,
      }),
      [FeatureType.CollectorWild]: (multiplier) => ({
        symbol: CitrusGotReelSymbolValue.CollectorWild,
        multiplier,
        sticky: false,
      }),
      [FeatureType.PayerWild]: (multiplier) => ({
        symbol: CitrusGotReelSymbolValue.PayerWild,
        multiplier,
        sticky: false,
      }),
    };
    
  
   // Place the wilds
  for (let i = 0; i < numWilds; i++) {
    // No more available positions
    if (availablePositions.length === 0) {
      break;
    }

    const multiplier = pickValueFromDistribution(integerRng, currentMaths.initialMultiplier[context]);
    const wildType = pickValueFromDistribution(integerRng, currentMaths.wildLookUp);
    const randomIndex = integerRng.randomInteger(availablePositions.length - 1);
    const { row, column } = availablePositions[randomIndex];

    // Remove this position from the list of available positions
    availablePositions.splice(randomIndex, 1);

    // Use the mapping to generate the new symbol
    const newSymbol = featureToSymbolMap[wildType as FeatureType](multiplier as number);

    input[row][column] = newSymbol;
  }

  return input;
  }

  export function expandWilds(input: CitrusGotReelSymbol[][]): CitrusGotReelSymbol[][] {
    const rows = input.length;
    const columns = input[0].length;
  
    // Copy original grid
    const newInput = deepCloneArray(input);

    //payer wilds
    for (let row = 0; row < newInput.length; row++) {
      for (let col = 0; col < newInput[row].length; col++) {
        const currentSymbol = newInput[row][col];
        if (currentSymbol?.symbol === CitrusGotReelSymbolValue.PayerWild) {
          const currentMultiplier = currentSymbol.multiplier;
  
          // Found a payer wild, update all other wilds in the grid
          for (let i = 0; i < newInput.length; i++) {
            for (let j = 0; j < newInput[i].length; j++) {
              // Skip the current payer wild so it doesn't add to itself
              if (i === row && j === col) {
                continue;
              }
  
              const targetSymbol = newInput[i][j];
              if (
                targetSymbol?.symbol === CitrusGotReelSymbolValue.Wild || 
                targetSymbol?.symbol === CitrusGotReelSymbolValue.DirectionalWild || 
                targetSymbol?.symbol === CitrusGotReelSymbolValue.CollectorWild || 
                targetSymbol?.symbol === CitrusGotReelSymbolValue.PayerWild
                ) {
                targetSymbol.multiplier += currentMultiplier;
              }
            }
          }
        }
      }
    }
  
    //directional wilds
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        const currentSymbol = input[row][column];
        
        if (currentSymbol?.symbol === CitrusGotReelSymbolValue.DirectionalWild) {
          const directionalSymbol = currentSymbol as {
            symbol: CitrusGotReelSymbolValue.DirectionalWild;
            multiplier: number;
            direction: "up" | "down" | "left" | "right";
            steps: number;
            sticky: boolean;
          };
          const { direction, steps, multiplier } = directionalSymbol;
          
          let newRow = row;
          let newColumn = column;
  
          for (let step = 0; step < steps; step++) {
            switch (direction) {
              case "up":
                newColumn -= 1;
                break;
              case "down":
                newColumn += 1;
                break;
              case "left":
                newRow -= 1;
                break;
              case "right":
                newRow += 1;
                break;
            }
  
            // Check if the new position is out of bounds
            if (newRow < 0 || newRow >= rows || newColumn < 0 || newColumn >= columns) {
              break;
            }
  
            const targetSymbol = newInput[newRow][newColumn];
  
            if (hasMultiplier(targetSymbol)) {
              // targetSymbol has a multiplier property
              targetSymbol.multiplier += multiplier;
            } else {
              newInput[newRow][newColumn] = {
                symbol: CitrusGotReelSymbolValue.Wild,
                multiplier: multiplier,
                sticky: false, 
              };
            }
          }
        }
      }
    }

    //collector wilds
  for (let row = 0; row < newInput.length; row++) {
    for (let col = 0; col < newInput[row].length; col++) {
      const currentSymbol = newInput[row][col];
      if (currentSymbol?.symbol === CitrusGotReelSymbolValue.CollectorWild) {
        let totalMultiplier = 0;

        // Found a collector wild, collect multipliers from all wilds in the grid
        for (let i = 0; i < newInput.length; i++) {
          for (let j = 0; j < newInput[i].length; j++) {
            // Skip the current collector wild so it doesn't add to itself
            if (i === row && j === col) {
              continue;
            }

            const targetSymbol = newInput[i][j];
            if (targetSymbol && (
              targetSymbol.symbol === CitrusGotReelSymbolValue.Wild || 
              targetSymbol.symbol === CitrusGotReelSymbolValue.PayerWild ||
              targetSymbol.symbol === CitrusGotReelSymbolValue.DirectionalWild ||
              targetSymbol.symbol === CitrusGotReelSymbolValue.CollectorWild
            )) {
              totalMultiplier += targetSymbol.multiplier;
            }
          }
        }

        // Add the total multiplier to the current collector wild
        currentSymbol.multiplier += totalMultiplier;
      }
    }
  }

  for (let row = 0; row < newInput.length; row++) {
    for (let col = 0; col < newInput[row].length; col++) {
      const currentSymbol = newInput[row][col];
      
      // Check if it's any type of wild
      if (currentSymbol && [
        CitrusGotReelSymbolValue.PayerWild,
        CitrusGotReelSymbolValue.DirectionalWild,
        CitrusGotReelSymbolValue.CollectorWild,
      ].includes(currentSymbol.symbol)) {
        
        newInput[row][col] = {
          symbol: currentSymbol.symbol,
          multiplier: currentSymbol.multiplier,
          sticky: false,  // Assuming we want to reset sticky to false; adjust as needed
        };

      }
    }
  }

    return newInput;
  }

  export function stickWilds(input: CitrusGotReelSymbol[][], integerRng): CitrusGotReelSymbol[][] {
    const currentMaths = mathConfig();
  
    const isWildSymbol = (symbol: CitrusGotReelSymbolValue): boolean => {
      return [
        CitrusGotReelSymbolValue.Wild,
        CitrusGotReelSymbolValue.DirectionalWild,
        CitrusGotReelSymbolValue.CollectorWild,
        CitrusGotReelSymbolValue.PayerWild,
      ].includes(symbol);
    };
  
    // Create a deep copy of the input to avoid mutating the original
    const result = deepCloneArray(input);
  
    for (let row = 0; row < result.length; row++) {
      for (let column = 0; column < result[row].length; column++) {
        if (isWildSymbol(result[row][column].symbol)) {
          if (pickValueFromDistribution(integerRng, currentMaths.wildsStick)) {
            result[row][column].sticky = true;
          }
        }
      }
    }
  
    return result;
  }
  

  export function addScatters(input: CitrusGotReelSymbol[][], numScatters: number): CitrusGotReelSymbol[][] {
    if (numScatters === 0) {
      return input;
    }
    const newInput: CitrusGotReelSymbol[][] = deepCloneArray(input);
    // Create an array of available positions for placing scatters
    const availablePositions: Position[] = [];
    for (let row = 0; row < newInput.length; row++) {
      for (let column = 0; column < newInput[row].length; column++) {
        if (newInput[row][column] === undefined) {  // Only consider empty positions
          availablePositions.push({ row, column });
        }
      }
    }
  
    // Check if there are enough available positions for scatters
    if (availablePositions.length < numScatters) {
      console.warn("Not enough positions to place scatters");
      return newInput; // Return the input as is
    }
  
    // Randomly place the scatters
    for (let i = 0; i < numScatters; i++) {
      const randomIndex = Math.floor(Math.random() * availablePositions.length);
      const { row, column } = availablePositions[randomIndex];
  
      // Remove this position from the list of available positions
      availablePositions.splice(randomIndex, 1);
  
      // Add the scatter symbol
      newInput[row][column] = { symbol: CitrusGotReelSymbolValue.Scatter };
    }

    return newInput;
  }
  
  export function countScatters(matrix: CitrusGotReelSymbol[][]): ScatterInfo {
    let count = 0;
    const positions: { column: number, row: number }[] = [];

    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < matrix[i].length; j++) {
        if (matrix[i][j].symbol === CitrusGotReelSymbolValue.Scatter) {
          count++;
          positions.push({ column: i, row: j });  // Adding position of scatter symbols
        }
      }
    }

    return {
        collected: count,
        positions: positions,
    };
}


export function returnSticky(matrix: CitrusGotReelSymbol[][]): (CitrusGotReelSymbol | undefined)[][] {
  return matrix.map(row => 
      row.map(symbol => 
          ("sticky" in symbol && symbol.sticky) ? symbol : undefined
      )
  );
}
