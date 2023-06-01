import {WaysWin} from "../../../common/wins/ways/WaysWin";
import {SpaceHiveSymbol} from "./config/SpaceHiveSymbol";
import {mathConfig} from "./config/mathConfig";
import {calculateWaysWins} from "../../../common/wins/ways/calculateWaysWins";

export function calculateReverseWins(waysWins: WaysWin<SpaceHiveSymbol>[],
                                     symbolReels: SpaceHiveSymbol[][],
                                     coin: number,
                                     precisionMoneyMapper: (money: number) => number)
    : WaysWin<SpaceHiveSymbol>[] {

    const oak6FilteredPaytable = Object.fromEntries(
        Object.entries(mathConfig.payTable).filter(([symbol]) =>
            waysWins.every(waysWin => waysWin.oakIndex < symbolReels.length || waysWin.symbol.toString() !== symbol))
    );

    const reverseWaysWins = calculateWaysWins(
        [...symbolReels].reverse(),
        oak6FilteredPaytable as unknown as Record<SpaceHiveSymbol, number[]>,
        symbol => symbol === SpaceHiveSymbol.Wild,
        coin,
        precisionMoneyMapper);

    reverseWaysWins.forEach(reverseWaysWin => {
        reverseWaysWin.positions.forEach(position => position.column = symbolReels.length - 1 - position.column);
    });

    return reverseWaysWins;
}
