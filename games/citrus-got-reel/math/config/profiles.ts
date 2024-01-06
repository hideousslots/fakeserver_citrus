export enum baseGameProfile {
    losing = "losing",
    teasing = "teasing",
    baseGameLow = "baseGameLow",
    baseGameMed = "baseGameMed",
    baseGameHigh = "baseGameHigh",
    special = "special",
}

export enum bonusGameProfile {
    bonusGameLow = "bonusGameLow",
    bonusGameMed = "bonusGameMed",
    bonusGameHigh = "bonusGameHigh"
}

export function determineProfileType(profile: baseGameProfile | bonusGameProfile): 'base' | 'bonus' {
    if (Object.values(baseGameProfile).includes(profile as baseGameProfile)) {
        return 'base';
    } else if (Object.values(bonusGameProfile).includes(profile as bonusGameProfile)) {
        return 'bonus';
    }
    throw new Error('Invalid profile type');
}