/* eslint-disable */
import {IGame, IPlayResponse} from "@slotify/gdk/lib/IGame";
import Iterations from "@slotify/gdk/lib/stats/Iterations.js";
import RTP from "@slotify/gdk/lib/stats/RTP.js";
import {mathConfig} from "./math/config/mathConfig";
import HitFrequency from "@slotify/gdk/lib/stats/HitFrequency";
import Variance from "@slotify/gdk/lib/stats/Variance";
import ConfidenceInterval from "@slotify/gdk/lib/stats/ConfidenceInterval";
import Average from "@slotify/gdk/lib/stats/Average";
import MaxWithLogging from "./math/stats/MyMax";
import play from "./math/play";
import {SpinResult} from "./math/spin";
import {getPlayerConfig} from "./math/config/getPlayerConfig";
import WildsFrequency from "./math/stats/WildsFrequency";
import WinBucket from "./math/stats/WinBucket";

const currentMaths =  mathConfig()

interface IData {
    baseGameRespinsSession: SpinResult[];
    bonusGameRespinsSessions: SpinResult[][];
}

export const index: IGame<IData> = {
    name: "space-hive-7",
    bets: {
        "main": {
            available: [0.2, 0.3, 0.4, 0.6, 0.8, 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 15, 20],
            default: 1, maxWin: 13000, coin: currentMaths.coinsPerBet_main
        },
        "ante": {
            available: [0.3, 0.45, 0.6, 0.9, 1.2, 1.5, 2.25, 3, 4.5, 6, 7.5, 9, 12, 15, 22.5, 30],
            default: 1.5, maxWin: 13000, coin: currentMaths.coinsPerBet_ante
        },
        "bonusbuy": { //this isn't being picked up
            available: [20, 30, 40, 60, 80, 100, 150, 200, 300, 400, 500, 600, 800, 1000, 1500, 2000],
            default: 100, maxWin: 130, coin: currentMaths.coinsPerBet_bonusBuy
        },
        "coinbonusbuy": { //this isn't being picked up
            available: [19, 28.5, 38, 57, 76, 95, 142.5, 190, 285, 380, 475, 570, 760, 950, 1425, 1900],
            default: 95, maxWin: 130, coin: currentMaths.coinsPerBet_coinBonusBuy
        },
    },

    config(variant) {
        return getPlayerConfig();
    },

    stats: {
        iterations: new Iterations(),
        rtp: new RTP(),
        variance: new Variance(),
        confidenceInterval: new ConfidenceInterval(99.5),
        hitFrequency: new HitFrequency(
            wagers => wagers.some(wager => wager.win > 0)),
        
        bonusGameTriggeringFrequency: new HitFrequency(
            wagers => wagers.some(wager => wager.data.bonusGameRespinsSessions.length > 0)),
        averageBonusGameLength: new Average((wagers) => wagers[0].data.bonusGameRespinsSessions
            .reduce((totalLength, respinsSession) => totalLength + respinsSession.length, 0))
            .filter((wagers) => wagers[0].data.bonusGameRespinsSessions.length > 0),
        WildsFrequency: new HitFrequency(
            wagers => wagers.some(wager => 
                wager.data.baseGameRespinsSession.some(session => session.beeWildPositions !== null)
              )),
        InstantFrequency: new HitFrequency(
            wagers => wagers.some(wager => 
                wager.data.baseGameRespinsSession.some(session => session.instantPrizeCoins !== null)
                )),
        // The value of the Bonus without the Trigger
        averageBonusGameValue: new Average((wagers) => {
            let baseGameWin =  wagers[0].data.baseGameRespinsSession[wagers[0].data.baseGameRespinsSession.length -1 ].accumulatedRoundWin
            return wagers[0].win - baseGameWin
        }).filter((wagers) => wagers[0].data.bonusGameRespinsSessions && wagers[0].data.bonusGameRespinsSessions.length > 0),
        coinsInBonus: new HitFrequency(
            wagers => wagers.some(wager => 
                wager.data.bonusGameRespinsSessions.some(sessionsArray => 
                    sessionsArray.some(session => session.expandedInstantPrizeData !== null)
                )
            )
        ),
        coinsInBonusx2: new HitFrequency(
            wagers => {
                let count = 0;
        
                for (let wager of wagers) {
                    for (let sessionsArray of wager.data.bonusGameRespinsSessions) {
                        for (let session of sessionsArray) {
                            if (session.expandedInstantPrizeData !== null) {
                                count++;
                            }
                            if (count >= 2) {
                                return true;
                            }
                        }
                    }
                }
        
                return false;
            }
        ),
        coinsInBonusx3: new HitFrequency(
            wagers => {
                let count = 0;
        
                for (let wager of wagers) {
                    for (let sessionsArray of wager.data.bonusGameRespinsSessions) {
                        for (let session of sessionsArray) {
                            if (session.expandedInstantPrizeData !== null) {
                                count++;
                            }
                            if (count >= 3) {
                                return true;
                            }
                        }
                    }
                }
        
                return false;
            }
        ),      
        coinsInBonusx4: new HitFrequency(
            wagers => {
                let count = 0;
        
                for (let wager of wagers) {
                    for (let sessionsArray of wager.data.bonusGameRespinsSessions) {
                        for (let session of sessionsArray) {
                            if (session.expandedInstantPrizeData !== null) {
                                count++;
                            }
                            if (count >= 4) {
                                return true;
                            }
                        }
                    }
                }
        
                return false;
            }
        ),
        coinsInBonusx5: new HitFrequency(
            wagers => {
                let count = 0;
        
                for (let wager of wagers) {
                    for (let sessionsArray of wager.data.bonusGameRespinsSessions) {
                        for (let session of sessionsArray) {
                            if (session.expandedInstantPrizeData !== null) {
                                count++;
                            }
                            if (count >= 5) {
                                return true;
                            }
                        }
                    }
                }
        
                return false;
            }
        ),
        replaceInBonus: new HitFrequency(
            wagers => wagers.some(wager => 
                wager.data.bonusGameRespinsSessions.some(sessionsArray => 
                    sessionsArray.some(session => session.replaceFeature !== null)
                )
            )
        ),
        replaceInBonusx2: new HitFrequency(
            wagers => {
                let count = 0;
        
                for (let wager of wagers) {
                    for (let sessionsArray of wager.data.bonusGameRespinsSessions) {
                        for (let session of sessionsArray) {
                            if (session.replaceFeature !== null) {
                                count++;
                            }
                            if (count >= 2) {
                                return true;
                            }
                        }
                    }
                }
        
                return false;
            }
        ),
        replaceInBonusx3: new HitFrequency(
            wagers => {
                let count = 0;
        
                for (let wager of wagers) {
                    for (let sessionsArray of wager.data.bonusGameRespinsSessions) {
                        for (let session of sessionsArray) {
                            if (session.replaceFeature !== null) {
                                count++;
                            }
                            if (count >= 3) {
                                return true;
                            }
                        }
                    }
                }
        
                return false;
            }
        ),
        replaceInBonusx4: new HitFrequency(
            wagers => {
                let count = 0;
        
                for (let wager of wagers) {
                    for (let sessionsArray of wager.data.bonusGameRespinsSessions) {
                        for (let session of sessionsArray) {
                            if (session.replaceFeature !== null) {
                                count++;
                            }
                            if (count >= 4) {
                                return true;
                            }
                        }
                    }
                }
        
                return false;
            }
        ),
        replaceInBonusx5: new HitFrequency(
            wagers => {
                let count = 0;
        
                for (let wager of wagers) {
                    for (let sessionsArray of wager.data.bonusGameRespinsSessions) {
                        for (let session of sessionsArray) {
                            if (session.replaceFeature !== null) {
                                count++;
                            }
                            if (count >= 5) {
                                return true;
                            }
                        }
                    }
                }
        
                return false;
            }
        ),
        fakeBee: new HitFrequency(
            wagers => wagers.some(wager => 
                wager.data.bonusGameRespinsSessions.some(sessionsArray => 
                    sessionsArray.some(session => session.fakebee === true)
                )
            )
        )

        ,
        wildsInBonus: new HitFrequency(
            wagers => wagers.some(wager => 
                wager.data.bonusGameRespinsSessions.some(sessionsArray => 
                    sessionsArray.some(session => session.wildFeature === true)
                )
            )
        ),
        wildsInBonusx2: new HitFrequency(
            wagers => {
                let count = 0;
        
                for (let wager of wagers) {
                    for (let sessionsArray of wager.data.bonusGameRespinsSessions) {
                        for (let session of sessionsArray) {
                            if (session.wildFeature === true) {
                                count++;
                            }
                            if (count >= 2) {
                                return true;
                            }
                        }
                    }
                }
        
                return false;
            }
        ),
        wildsInBonusx3: new HitFrequency(
            wagers => {
                let count = 0;
        
                for (let wager of wagers) {
                    for (let sessionsArray of wager.data.bonusGameRespinsSessions) {
                        for (let session of sessionsArray) {
                            if (session.wildFeature === true) {
                                count++;
                            }
                            if (count >= 3) {
                                return true;
                            }
                        }
                    }
                }
        
                return false;
            }
        ),
        wildsInBonusx4: new HitFrequency(
            wagers => {
                let count = 0;
        
                for (let wager of wagers) {
                    for (let sessionsArray of wager.data.bonusGameRespinsSessions) {
                        for (let session of sessionsArray) {
                            if (session.wildFeature === true) {
                                count++;
                            }
                            if (count >= 4) {
                                return true;
                            }
                        }
                    }
                }
        
                return false;
            }
        ),
        wildsInBonusx5: new HitFrequency(
            wagers => {
                let count = 0;
        
                for (let wager of wagers) {
                    for (let sessionsArray of wager.data.bonusGameRespinsSessions) {
                        for (let session of sessionsArray) {
                            if (session.wildFeature === true) {
                                count++;
                            }
                            if (count >= 5) {
                                return true;
                            }
                        }
                    }
                }
        
                return false;
            }
        ),
        biggestWin: new MaxWithLogging(wagers => wagers[0]?.win || 0),
        ReachesMaxWays: new HitFrequency(
            wagers => {
                let found = false;
                for (let wager of wagers) {
                    for (let sessionsArray of wager.data.bonusGameRespinsSessions) {
                        if (sessionsArray.length > 1) {
                            let penultimateSession = sessionsArray[sessionsArray.length - 2];
                            let product = penultimateSession.newReelLengths.reduce((a, b) => a * b, 1);
                            if (product === 46656) {
                                found = true;
                            }
                        }
                    }
                    if (found) break; // exit the loop as soon as a matching session is found
                }
                return found;
            }
        ),

        // averageFinishingWays: new Average((wagers) => {
        //     let endingWays = wagers[0].data.bonusGameRespinsSessions[wagers[0].data.bonusGameRespinsSessions.length - 2][0].newReelLengths.reduce((a, b) => a * b, 1);
        //     return endingWays
        // }),
        
        averageWildFeatures: new Average(
            (wagers) => {
              // Track the total count of 'wildFeature' and the total number of objects
              let wildFeatureCount = 0;
          
              // Iterate over each bonusGameRespinsSession
              wagers[0].data.bonusGameRespinsSessions.forEach((respinSession) => {
                // Iterate over each object in the session
                respinSession.forEach((sessionObject) => {
                  // If 'wildFeature' is true, increment the counter
                  if (sessionObject.wildFeature) {
                    wildFeatureCount += 1;
                  }
                });
              });
          
              // Calculate and return the average
              // Be sure to handle the case when totalObjects is 0 to avoid division by zero
              return wildFeatureCount;
            }
          ),
          
          averageCoinFeatures: new Average(
            (wagers) => {
              // Track the total count of 'wildFeature' and the total number of objects
              let coinFeatureCount = 0;
          
              // Iterate over each bonusGameRespinsSession
              wagers[0].data.bonusGameRespinsSessions.forEach((respinSession) => {
                // Iterate over each object in the session
                respinSession.forEach((sessionObject) => {
                  // If 'wildFeature' is true, increment the counter
                  if (sessionObject.expandedInstantPrizeData !== null) {
                    coinFeatureCount += 1;
                  }
                });
              });
          
              // Calculate and return the average
              // Be sure to handle the case when totalObjects is 0 to avoid division by zero
              return coinFeatureCount;
            }
          ),
          averageReplaceFeatures: new Average(
            (wagers) => {
              // Track the total count of 'wildFeature' and the total number of objects
              let replaceFeatureCount = 0;
          
              // Iterate over each bonusGameRespinsSession
              wagers[0].data.bonusGameRespinsSessions.forEach((respinSession) => {
                // Iterate over each object in the session
                respinSession.forEach((sessionObject) => {
                  // If 'wildFeature' is true, increment the counter
                  if (sessionObject.replaceFeature !== null) {
                    replaceFeatureCount += 1;
                  }
                });
              });
          
              // Calculate and return the average
              // Be sure to handle the case when totalObjects is 0 to avoid division by zero
              return replaceFeatureCount;
            }
          ),
          allFeaturesAverage: new Average(
            (wagers) => {
              // Track the total count of 'wildFeature' and the total number of objects
              let featureCount = 0;
          
              // Iterate over each bonusGameRespinsSession
              wagers[0].data.bonusGameRespinsSessions.forEach((respinSession) => {
                // Iterate over each object in the session
                respinSession.forEach((sessionObject) => {
                  // If 'wildFeature' is true, increment the counter
                  if (sessionObject.wildFeature || sessionObject.expandedInstantPrizeData !== null || sessionObject.replaceFeature !== null ) {
                    featureCount += 1;
                  }
                });
              });
          
              // Calculate and return the average
              // Be sure to handle the case when totalObjects is 0 to avoid division by zero
              return featureCount;
            }
          ),

        zero_bonus: new WinBucket(wagers => wagers.some(wager => wager.win === 0)),
        _0x_20x: new WinBucket(wagers => wagers.some(wager => wager.win > 0 && wager.win < 20)),
        _20x_40x: new WinBucket(wagers => wagers.some(wager => wager.win >= 20 && wager.win < 40)),
        _40x_60x: new WinBucket(wagers => wagers.some(wager => wager.win >= 40 && wager.win < 60)),
        _60x_80x: new WinBucket(wagers => wagers.some(wager => wager.win >= 60 && wager.win < 80)),
        _80x_100x: new WinBucket(wagers => wagers.some(wager => wager.win >= 80 && wager.win < 100)),
        over_100x: new WinBucket(wagers => wagers.some(wager => wager.win >= 100)),
        over_200x: new WinBucket(wagers => wagers.some(wager => wager.win >= 200)),
        over_300x: new WinBucket(wagers => wagers.some(wager => wager.win >= 300)),
        over_400x: new WinBucket(wagers => wagers.some(wager => wager.win >= 400)),
        over_500x: new WinBucket(wagers => wagers.some(wager => wager.win >= 500)),
        over_1000x: new WinBucket(wagers => wagers.some(wager => wager.win >= 1000)),
        over_2000x: new WinBucket(wagers => wagers.some(wager => wager.win >= 2000)),
        over_4000x: new WinBucket(wagers => wagers.some(wager => wager.win >= 4000)),
        over_8000x: new WinBucket(wagers => wagers.some(wager => wager.win >= 8000)),
        over_11500x: new WinBucket(wagers => wagers.some(wager => wager.win >= 11500)),
        
        
    },
    cheats: {
        "main": {
            "BASE_GAME_RESPINS_TRIGGERED": wager => wager.data.baseGameRespinsSession.length > 1,
            "BONUS_ROUND_TRIGGERED": wager => wager.data.bonusGameRespinsSessions.length > 1,
            "BASE_GAME_BEE_WILDS_TRIGGERED": wager => wager.data.baseGameRespinsSession[0].beeWildPositions !== null,
            "INSTANT_PRIZE_TRIGGERED": wager => wager.data.baseGameRespinsSession[0].instantPrizeCoins !== null,
        },
        "bonusbuy": {

        }
    },

    play({bet, action, state, variant, promo}): IPlayResponse<IData> {
        return play(bet, action);
    },

    action(strategy): string {
        return null; // game has no actions other than "main"
    },

    evaluate(type, wagers, data): any {
        return {type, wagers, data};
    },
};

export default index;
