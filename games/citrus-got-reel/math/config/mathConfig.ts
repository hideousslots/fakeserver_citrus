import { FeatureType } from "./defines";
import { baseGameProfile, bonusGameProfile } from "./profiles";

let isAnte = false;
const { losing, teasing, baseGameLow, baseGameMed, baseGameHigh, } = baseGameProfile;
const { bonusGameLow, bonusGameMed, bonusGameHigh } = bonusGameProfile;

const standardConfig = {
	coinsPerBet_main: 10,
	coinsPerBet_ante: 15,
	coinsPerBet_bonusBuy: 1000,

	reelMatrix: [5, 5, 5, 5, 5, 5],

	lineDefines: [
		//straight line combos
		[0, 0, 0, 0, 0, 0],
		[1, 1, 1, 1, 1, 1],
		[2, 2, 2, 2, 2, 2],
		[3, 3, 3, 3, 3, 3],
		[4, 4, 4, 4, 4, 4],
		//humpback lines
		// [0, 1, 1, 1, 1, 0],
		// [1, 2, 2, 2, 2, 1],
		// [2, 3, 3, 3, 3, 2],
		// [3, 4, 4, 4, 4, 3],
		//reverse humpback lines
		// [1, 0, 0, 0, 0, 1],
		// [2, 1, 1, 1, 1, 2],
		// [3, 2, 2, 2, 2, 3],
		// [4, 3, 3, 3, 3, 4],
		//squiggle lines
		[0, 1, 0, 1, 0, 1],
		[1, 2, 1, 2, 1, 2],
		[2, 3, 2, 3, 2, 3],
		[3, 4, 3, 4, 3, 4],
		//reverse squiggle lines
		[1, 0, 1, 0, 1, 0],
		[2, 1, 2, 1, 2, 1],
		[3, 2, 3, 2, 3, 2],
		[4, 3, 4, 3, 4, 3],
		//Big Diagonals
		[1, 2, 3, 3, 2, 1],
		[3, 2, 1, 1, 2, 3],
	],

	scattersTriggeringBonusAmount: 3,
	bonusGameFreeSpinsAmount: 6,

	payTable: {
		//1, 2, 3, 4, 5, 6
		0: [0, 0, 2, 6, 10, 40],
		1: [0, 0, 2, 6, 10, 40],
		2: [0, 0, 2, 6, 10, 40],
		3: [0, 0, 2, 6, 10, 40],
		4: [0, 0, 2, 6, 10, 40],
		5: [0, 0, 8, 12, 30, 60],
		6: [0, 0, 8, 12, 30, 60],
		7: [0, 0, 8, 12, 50, 100],
		8: [0, 0, 8, 12, 50, 100],
		9: [0, 0, 40, 80, 150, 300],

	},

	baseGameScattersToAdd: { values: [0, 1, 2, 3], weights: [271, 15, 7, 1] },

	directions: ["up", "down", "left", "right"], // Possible directions

	wildsStick: {
		values: [true, false],
		weights: [100, 0],
	},

	baseGameProfiles: {
		values: [losing, teasing, baseGameLow, baseGameMed, baseGameHigh],
		weights: [110, 0, 0, 115, 0],
	},

	bonusGameProfiles: {
		values: [bonusGameLow, bonusGameMed, bonusGameHigh],
		weights: [1, 1, 1],
	},

	profiles: {
		base: {
			losing: {
				hitRate: 0,
				distOffset: 0.5,
				stopOffset: 1,
				wildFeatureActive: {
					values: [true, false],
					weights: [1, 10],
				},
				initialWilds: {
					values: [1, 2, 3, 4, 5],
					weights: [50, 0, 0, 0, 0],
				},
				initialMultiplier: {
					values: [1, 2, 3, 4, 5],
					weights: [84, 0, 0, 0, 0],
				},
				wildLookUp: {
					values: [
						FeatureType.Wild,
						FeatureType.DirectionalWild,
						FeatureType.CollectorWild,
						FeatureType.PayerWild,
					],
					weights: [90, 0, 0, 0],
				},
				stepsData: {
					values: [1, 2, 3, 4, 5],
					weights: [350, 0, 0, 0, 0],
				},

				stepsColumn6Data: {
					values: [1, 2, 3, 4, 5],
					weights: [10, 0, 0, 0, 0],
				},
				wildMaps: {
					Wild: {
						values: [
							{ row: 0, column: 0 },
							{ row: 1, column: 0 },
							{ row: 3, column: 0 },
							{ row: 2, column: 0 },
							{ row: 4, column: 0 },

							{ row: 0, column: 2 },
							{ row: 1, column: 2 },
							{ row: 3, column: 2 },
							{ row: 2, column: 2 },
							{ row: 4, column: 2 },

							{ row: 0, column: 4 },
							{ row: 1, column: 4 },
							{ row: 3, column: 4 },
							{ row: 2, column: 4 },
							{ row: 4, column: 4 },

						],
						weights: [
							3000, 3000, 3000, 3000, 3000,
							3000, 3000, 3000, 3000, 3000,
							3000, 3000, 3000, 3000, 3000,
						]
					},
				},
				wildInfluences: {
					Wild: {
						default:
						{
							positions: [
								{
									row: (5 - 1) / 2,
									column: (6 - 1) / 2,
								},
							],
							rowInfluence: 0.5,
							columnInfluence: 0.5,
						},
						Wild: {
							rowInfluence: 0.1,
							columnInfluence: 0.1,
						},
						DirectionalWild: {
							rowInfluence: 0.1,
							columnInfluence: 0.1,
						},
						CollectorWild: {
							rowInfluence: 0.1,
							columnInfluence: 0.1,
						},
						PayerWild: {
							rowInfluence: 0.1,
							columnInfluence: 0.1,
						}
					}
				}
			},
			teasing: {
				hitRate: 0,
				distOffset: 0.5,
				stopOffset: 1,
				wildFeatureActive: {
					values: [true, false],
					weights: [0, 10],
				},
				initialWilds: {
					values: [1, 2, 3, 4, 5],
					weights: [50, 5, 0, 0, 0],
				},
				initialMultiplier: {
					values: [1, 2, 3, 4, 5],
					weights: [84, 10, 3, 2, 1],
				},
				wildLookUp: {
					values: [
						FeatureType.Wild,
						FeatureType.DirectionalWild,
						FeatureType.CollectorWild,
						FeatureType.PayerWild,
					],
					weights: [0, 10, 0, 0],
				},
				stepsData: {
					values: [1, 2, 3, 4, 5],
					weights: [350, 500, 100, 50, 30],
				},

				stepsColumn6Data: {
					values: [1, 2, 3, 4, 5],
					weights: [10, 150, 150, 0, 0],
				},
				wildMaps: {
					DirectionalWild: {
						values: [
							{ row: 0, column: 5 },
							{ row: 1, column: 5 },
							{ row: 3, column: 5 },
							{ row: 2, column: 5 },
							{ row: 4, column: 5 },
						],
						weights: [
							3000, 3000, 3000, 3000, 3000,
						]
					},
				},
				wildInfluences: {

				}

			},
			baseGameLow: {
				hitRate: 0.31,
				distOffset: 0.5,
				stopOffset: 3,
				wildFeatureActive: {
					values: [true, false],
					weights: [2, 7],
				},
				initialWilds: {
					values: [1, 2, 3, 4, 5],
					weights: [15, 7, 5, 3, 1],
				},
				initialMultiplier: {
					values: [1, 2, 3, 4, 5],
					weights: [1, 0, 0, 0, 0],
				},
				wildLookUp: {
					values: [
						FeatureType.Wild,
						FeatureType.DirectionalWild,
						FeatureType.CollectorWild,
						FeatureType.PayerWild,
					],
					weights: [90, 10, 0, 0],
				},
				stepsData: {
					values: [1, 2, 3, 4, 5],
					weights: [350, 500, 100, 50, 30],
				},

				stepsColumn6Data: {
					values: [1, 2, 3, 4, 5],
					weights: [10, 150, 150, 10, 5],
				},
				wildMaps: {
					DirectionalWild: {
						values: [
							{ row: 0, column: 0 }, { row: 0, column: 1 },
							{ row: 0, column: 2 }, { row: 0, column: 3 },
							{ row: 0, column: 4 }, { row: 0, column: 5 },

							{ row: 1, column: 0 }, { row: 1, column: 5 },
							{ row: 2, column: 0 }, { row: 2, column: 5 },
							{ row: 3, column: 0 }, { row: 3, column: 5 },

							{ row: 4, column: 0 }, { row: 4, column: 1 },
							{ row: 4, column: 2 }, { row: 4, column: 3 },
							{ row: 4, column: 4 }, { row: 4, column: 5 }],
						weights: [
							3000, 3000, 3000, 3000, 3000, 3000,
							5000, 5000,
							7500, 7500,
							1000, 1000,
							1000, 1000,
							7500, 7500, 7500, 7500, 7500, 7500]
					},
				},
				wildInfluences: {
					Wild: {
						default:
						{
							positions: [
								{
									row: (5 - 1) / 2,
									column: (6 - 1) / 2,
								},
							],
							rowInfluence: 0.5,
							columnInfluence: 0.5,
						},
						Wild: {
							rowInfluence: 0.1,
							columnInfluence: 0.1,
						},
						DirectionalWild: {
							rowInfluence: 0.1,
							columnInfluence: 0.1,
						},
						CollectorWild: {
							rowInfluence: 0.1,
							columnInfluence: 0.1,
						},
						PayerWild: {
							rowInfluence: 0.1,
							columnInfluence: 0.1,
						}
					}
				}

			},
			baseGameMed: {
				hitRate: 0.35,
				distOffset: 0.5,
				stopOffset: 6,
				wildFeatureActive: {
					values: [true, false],
					weights: [1, 5],
				},
				initialWilds: {
					values: [1, 2, 3, 4, 5],
					weights: [50, 70, 70, 30, 15],
				},
				initialMultiplier: {
					values: [1, 2, 3, 4, 5],
					weights: [84, 10, 3, 2, 1],
				},
				wildLookUp: {
					values: [
						FeatureType.Wild,
						FeatureType.DirectionalWild,
						FeatureType.CollectorWild,
						FeatureType.PayerWild,
					],
					weights: [90, 10, 0, 0],
				},
				stepsData: {
					values: [1, 2, 3, 4, 5],
					weights: [350, 500, 100, 100, 100],
				},

				stepsColumn6Data: {
					values: [1, 2, 3, 4, 5],
					weights: [75, 150, 150, 150, 50],
				},
				wildMaps: {
					DirectionalWild: {
						values: [
							{ row: 0, column: 0 }, { row: 0, column: 1 },
							{ row: 0, column: 2 }, { row: 0, column: 3 },
							{ row: 0, column: 4 }, { row: 0, column: 5 },

							{ row: 1, column: 0 }, { row: 1, column: 5 },
							{ row: 2, column: 0 }, { row: 2, column: 5 },
							{ row: 3, column: 0 }, { row: 3, column: 5 },

							{ row: 4, column: 0 }, { row: 4, column: 1 },
							{ row: 4, column: 2 }, { row: 4, column: 3 },
							{ row: 4, column: 4 }, { row: 4, column: 5 }],
						weights: [
							3000, 3000, 3000, 3000, 3000, 3000,
							3000, 3000,
							3000, 3000,
							3000, 3000,
							3000, 3000,
							3000, 3000, 3000, 3000, 3000, 3000]
					},
				},
				wildInfluences: {
					Wild: {
						default:
						{
							positions: [
								{
									row: (5 - 1) / 2,
									column: 1,
								},
							],
							rowInfluence: 0.7,
							columnInfluence: 0.7,
						},
						Wild: {
							rowInfluence: 0.1,
							columnInfluence: 0.1,
						},
						DirectionalWild: {
							rowInfluence: 0.1,
							columnInfluence: 0.1,
						},
						CollectorWild: {
							rowInfluence: 0.1,
							columnInfluence: 0.1,
						},
						PayerWild: {
							rowInfluence: 0.1,
							columnInfluence: 0.1,
						}
					}
				}

			},
			baseGameHigh: {
				hitRate: 0.5,
				distOffset: 0.5,
				stopOffset: 6,
				wildFeatureActive: {
					values: [true, false],
					weights: [0, 11],
				},
				initialWilds: {
					values: [1, 2, 3, 4, 5],
					weights: [0, 0, 0, 7, 5],
				},
				initialMultiplier: {
					values: [1, 2, 3, 4, 5],
					weights: [5, 10, 10, 2, 1],
				},
				wildLookUp: {
					values: [
						FeatureType.Wild,
						FeatureType.DirectionalWild,
						FeatureType.CollectorWild,
						FeatureType.PayerWild,
					],
					weights: [40, 10, 10, 10],
				},
				stepsData: {
					values: [1, 2, 3, 4, 5],
					weights: [50, 100, 100, 100, 100],
				},

				stepsColumn6Data: {
					values: [1, 2, 3, 4, 5],
					weights: [10, 10, 50, 40, 40],
				},
				wildMaps: {
					DirectionalWild: {
						values: [
							{ row: 0, column: 0 }, { row: 0, column: 1 },
							{ row: 0, column: 2 }, { row: 0, column: 3 },
							{ row: 0, column: 4 }, { row: 0, column: 5 },

							{ row: 1, column: 0 }, { row: 1, column: 5 },
							{ row: 2, column: 0 }, { row: 2, column: 5 },
							{ row: 3, column: 0 }, { row: 3, column: 5 },

							{ row: 4, column: 0 }, { row: 4, column: 1 },
							{ row: 4, column: 2 }, { row: 4, column: 3 },
							{ row: 4, column: 4 }, { row: 4, column: 5 }],
						weights: [
							3000, 3000, 3000, 3000, 3000, 3000,
							3000, 3000,
							3000, 3000,
							3000, 3000,
							3000, 3000,
							3000, 3000, 3000, 3000, 3000, 3000]
					},
				},
				wildInfluences: {
					Wild: {
						default:
						{
							positions: [
								{
									row: (5 - 1) / 2,
									column: 1,
								},
							],
							rowInfluence: 0.7,
							columnInfluence: 0.7,
						},
						Wild: {
							rowInfluence: 0.1,
							columnInfluence: 0.1,
						},
						DirectionalWild: {
							rowInfluence: 0.1,
							columnInfluence: 0.1,
						},
						CollectorWild: {
							rowInfluence: 0.1,
							columnInfluence: 0.1,
						},
						PayerWild: {
							rowInfluence: 0.1,
							columnInfluence: 0.1,
						}
					},
					CollectorWild: {
						default:
						{
							positions: [
								{
									row: (5 - 1) / 2,
									column: 1,
								},
							],
							rowInfluence: 0.7,
							columnInfluence: 0.7,
						},
						Wild: {
							rowInfluence: 0.1,
							columnInfluence: 0.1,
						},
						DirectionalWild: {
							rowInfluence: 0.1,
							columnInfluence: 0.1,
						},
						CollectorWild: {
							rowInfluence: 0.1,
							columnInfluence: 0.1,
						},
						PayerWild: {
							rowInfluence: 0.1,
							columnInfluence: 0.1,
						}
					},
					PayerWild: {
						default:
						{
							positions: [
								{
									row: (5 - 1) / 2,
									column: 1,
								},
							],
							rowInfluence: 0.7,
							columnInfluence: 0.7,
						},
						Wild: {
							rowInfluence: 0.1,
							columnInfluence: 0.1,
						},
						DirectionalWild: {
							rowInfluence: 0.1,
							columnInfluence: 0.1,
						},
						CollectorWild: {
							rowInfluence: 0.1,
							columnInfluence: 0.1,
						},
						PayerWild: {
							rowInfluence: 0.1,
							columnInfluence: 0.1,
						}
					}
				},

			}

		},
	},
	bonus: {
		bonusGameLow: {},
		bonusGameMed: {},
		bonusGameHigh: {},
	}
}
	;

const anteConfig = structuredClone(standardConfig);

export function anteMode(ante: boolean): void {
	isAnte = ante;
}

export function mathConfig(): any {
	return isAnte ? anteConfig : standardConfig;
}
