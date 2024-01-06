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
		//Non-Premium
		0: [0, 0, 2, 6, 10, 20],
		1: [0, 0, 2, 6, 10, 20],
		2: [0, 0, 2, 6, 10, 20],
		3: [0, 0, 2, 6, 10, 20],

		//Premium
		4: [0, 0, 8, 20, 30, 40],
		5: [0, 0, 8, 30, 40, 60],
		6: [0, 0, 10, 40, 60, 80],
		7: [0, 0, 10, 60, 80, 100],
		8: [0, 0, 20, 80, 100, 150],
		9: [0, 0, 80, 100, 150, 200],

	},

	baseGameScattersToAdd: { values: [0, 1, 2, 3], weights: [271, 15, 7, 1] },

	directions: ["up", "down", "left", "right"], // Possible directions

	wildsStick: {
		values: [true, false],
		weights: [79, 21],
	},

	baseGameProfiles: {
		values: [losing, teasing, baseGameLow, baseGameMed, baseGameHigh],
		// weights: [100, 100, 100, 100, 0],
		weights: [100, 100, 170, 100, 0],
	},

	bonusGameProfiles: {
		values: [bonusGameLow, bonusGameMed, bonusGameHigh],
		weights: [0, 1, 0],
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
					weights: [10, 0],
				},
				initialWilds: {
					values: [1, 2, 3, 4, 5],
					weights: [5, 5, 5, 0, 0],
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
					weights: [1, 0, 0, 0],
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
				distOffset: 0.4,
				stopOffset: 3,
				wildFeatureActive: {
					values: [true, false],
					weights: [4, 17],
				},
				initialWilds: {
					values: [1, 2, 3, 4, 5],
					weights: [7, 10, 15, 15, 3],
				},
				initialMultiplier: {
					values: [1, 2, 3, 4, 5],
					weights: [90, 8, 4, 0, 0],
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
					weights: [350, 500, 70, 30, 15],
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
				hitRate: 0.23,
				distOffset: 0.425,
				stopOffset: 4,
				wildFeatureActive: {
					values: [true, false],
					weights: [4, 17],
				},
				initialWilds: {
					values: [1, 2, 3, 4, 5],
					weights: [10, 150, 150, 50, 20],
				},
				initialMultiplier: {
					values: [1, 2, 3, 4, 5],
					weights: [100, 20, 3, 2, 1],
				},
				wildLookUp: {
					values: [
						FeatureType.Wild,
						FeatureType.DirectionalWild,
						FeatureType.CollectorWild,
						FeatureType.PayerWild,
					],
					weights: [7, 3, 0, 0],
				},
				stepsData: {
					values: [1, 2, 3, 4, 5],
					weights: [100, 40, 30, 20, 10],
				},

				stepsColumn6Data: {
					values: [1, 2, 3, 4, 5],
					weights: [75, 150, 150, 150, 30],
				},
				wildMaps: {
					DirectionalWild: {
						values: [
							{ row: 0, column: 0 }, { row: 0, column: 1 },
							{ row: 0, column: 2 }, { row: 0, column: 3 },
							{ row: 0, column: 4 }, { row: 0, column: 5 },

							{ row: 1, column: 0 }, { row: 1, column: 1 },
							{ row: 1, column: 2 }, { row: 1, column: 3 },
							{ row: 1, column: 4 }, { row: 1, column: 5 },

							{ row: 2, column: 0 }, { row: 2, column: 1 },
							{ row: 2, column: 2 }, { row: 2, column: 3 },
							{ row: 2, column: 4 }, { row: 2, column: 5 },

							{ row: 3, column: 0 }, { row: 3, column: 1 },
							{ row: 3, column: 2 }, { row: 3, column: 3 },
							{ row: 3, column: 4 }, { row: 3, column: 5 },

							{ row: 4, column: 0 }, { row: 4, column: 1 },
							{ row: 4, column: 2 }, { row: 4, column: 3 },
							{ row: 4, column: 4 }, { row: 4, column: 5 },

							{ row: 5, column: 0 }, { row: 5, column: 1 },
							{ row: 5, column: 2 }, { row: 5, column: 3 },
							{ row: 5, column: 4 }, { row: 5, column: 5 }],
						weights: [
							3000, 3000, 3000, 3000, 3000, 3000,
							3000, 3000, 3000, 3000, 3000, 3000,
							3000, 3000, 3000, 3000, 3000, 3000,
							3000, 3000, 3000, 3000, 3000, 3000,
							3000, 3000, 3000, 3000, 3000, 3000,
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
		bonus: {
			bonusGameLow: {},
			bonusGameMed: {
				hitRate: 0.23,
				distOffset: 0.425,
				stopOffset: 4,
				wildFeatureActive: {
					values: [true, false],
					weights: [4, 17],
				},
				initialWilds: {
					values: [1, 2, 3, 4, 5],
					weights: [10, 150, 150, 50, 20],
				},
				initialMultiplier: {
					values: [1, 2, 3, 4, 5],
					weights: [100, 20, 3, 2, 1],
				},
				wildLookUp: {
					values: [
						FeatureType.Wild,
						FeatureType.DirectionalWild,
						FeatureType.CollectorWild,
						FeatureType.PayerWild,
					],
					weights: [7, 3, 0, 0],
				},
				stepsData: {
					values: [1, 2, 3, 4, 5],
					weights: [100, 40, 30, 20, 10],
				},

				stepsColumn6Data: {
					values: [1, 2, 3, 4, 5],
					weights: [75, 150, 150, 150, 30],
				},
				wildMaps: {
					DirectionalWild: {
						values: [
							{ row: 0, column: 0 }, { row: 0, column: 1 },
							{ row: 0, column: 2 }, { row: 0, column: 3 },
							{ row: 0, column: 4 }, { row: 0, column: 5 },

							{ row: 1, column: 0 }, { row: 1, column: 1 },
							{ row: 1, column: 2 }, { row: 1, column: 3 },
							{ row: 1, column: 4 }, { row: 1, column: 5 },

							{ row: 2, column: 0 }, { row: 2, column: 1 },
							{ row: 2, column: 2 }, { row: 2, column: 3 },
							{ row: 2, column: 4 }, { row: 2, column: 5 },

							{ row: 3, column: 0 }, { row: 3, column: 1 },
							{ row: 3, column: 2 }, { row: 3, column: 3 },
							{ row: 3, column: 4 }, { row: 3, column: 5 },

							{ row: 4, column: 0 }, { row: 4, column: 1 },
							{ row: 4, column: 2 }, { row: 4, column: 3 },
							{ row: 4, column: 4 }, { row: 4, column: 5 },

							{ row: 5, column: 0 }, { row: 5, column: 1 },
							{ row: 5, column: 2 }, { row: 5, column: 3 },
							{ row: 5, column: 4 }, { row: 5, column: 5 }],
						weights: [
							3000, 3000, 3000, 3000, 3000, 3000,
							3000, 3000, 3000, 3000, 3000, 3000,
							3000, 3000, 3000, 3000, 3000, 3000,
							3000, 3000, 3000, 3000, 3000, 3000,
							3000, 3000, 3000, 3000, 3000, 3000,
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
			bonusGameHigh: {},
		}
	},
}
	;

const anteConfig = structuredClone(standardConfig);

export function anteMode(ante: boolean): void {
	isAnte = ante;
}

export function mathConfig(): any {
	return isAnte ? anteConfig : standardConfig;
}
