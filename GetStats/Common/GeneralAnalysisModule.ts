import { IWager } from "@slotify/gdk/lib/IGame";

export interface GeneralAnalysisModule {
    ProcessWager(wager: IWager);

    Report():string[];
}