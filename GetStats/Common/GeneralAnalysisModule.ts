import { IWager } from "@slotify/gdk/lib/IGame";

export interface GeneralAnalysisModule {
    
    GetID(): string;

    ProcessWager(wager: IWager);

    Report():string[];

    Save(): string;

    Load(data: string);
}