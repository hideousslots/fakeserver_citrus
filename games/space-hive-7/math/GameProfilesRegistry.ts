export default class GameProfilesRegistry {
    private gameProfilesFallbacks: { [profileId: string]: { threshold: number; fallback: string; } };
    private currentGameProfile: string;

    constructor(gameProfilesFallbacks: { [profileId: string]: { threshold: number; fallback: string; } },
                initialGameProfile: string) {
        this.gameProfilesFallbacks = gameProfilesFallbacks;
        this.currentGameProfile = initialGameProfile;
    }

    public getUpdatedGameProfile(accumulatedRoundWinBetMultiple: number): string {

        if (accumulatedRoundWinBetMultiple >= this.gameProfilesFallbacks[this.currentGameProfile].threshold) {
            this.currentGameProfile = this.gameProfilesFallbacks[this.currentGameProfile].fallback;
        }

        return this.currentGameProfile;
    }
}
