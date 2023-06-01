import {mathConfig} from "./mathConfig";

export function getPlayerConfig() {
    return {
        payTable: mathConfig.payTable,
        bookPayTable: mathConfig.bookPayTable
    };
}