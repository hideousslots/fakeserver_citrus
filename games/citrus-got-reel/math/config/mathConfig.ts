import { FeatureType } from "./defines";
import { baseGameProfile, bonusGameProfile } from "./profiles";

let isAnte = false;
const {losing, teasing, baseGameLow, baseGameMed, baseGameHigh,} = baseGameProfile;
const {bonusGameLow, bonusGameMed, bonusGameHigh} = bonusGameProfile;

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
		[0, 1, 1, 1, 1, 0],
		[1, 2, 2, 2, 2, 1],
		[2, 3, 3, 3, 3, 2],
		[3, 4, 4, 4, 4, 3],
		//reverse humpback lines
		[1, 0, 0, 0, 0, 1],
		[2, 1, 1, 1, 1, 2],
		[3, 2, 2, 2, 2, 3],
		[4, 3, 3, 3, 3, 4],
		//squiggle lines
		// [0, 1, 0, 1, 0, 1],
		// [1, 2, 1, 2, 1, 2],
		// [2, 3, 2, 3, 2, 3],
		// [3, 4, 3, 4, 3, 4],
		//reverse squiggle lines
		// [1, 0, 1, 0, 1, 0],
		// [2, 1, 2, 1, 2, 1],
		// [3, 2, 3, 2, 3, 2],
		// [4, 3, 4, 3, 4, 3],
		//Big Diagonals
		[1, 2, 3, 3, 2, 1],
		[3, 2, 1, 1, 2, 3],
	],

	scattersTriggeringBonusAmount: 3,
	bonusGameFreeSpinsAmount: 6,

	payTable: {
		//1, 2, 3, 4, 5, 6
		0: [0, 0, 1, 3, 10, 250],
		1: [0, 0, 1, 3, 10, 250],
		2: [0, 0, 2, 4, 15, 400],
		3: [0, 0, 2, 4, 15, 400],
		4: [0, 0, 2, 4, 15, 400],
		5: [0, 0, 6, 10, 30, 600],
		6: [0, 0, 6, 10, 30, 600],
		7: [0, 0, 8, 30, 50, 80],
		8: [0, 0, 8, 30, 50, 100],
		9: [0, 0, 30, 50, 100, 150],
	},
	
	baseGameScattersToAdd: { values: [0, 1, 2, 3], weights: [271, 15, 7, 1] },

	stepsData: {
		values: [1, 2, 3, 4, 5],
		weights: [350, 500, 100, 50, 30],
	},

	stepsColumn6Data: {
		values: [1, 2, 3, 4, 5],
		weights: [10, 150, 150, 10, 5],
	},

	directionalWildPositions: {
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

	directions: ["up", "down", "left", "right"], // Possible directions

	wildsStick: {
		values: [true, false],
		weights: [100, 0],
	},

	baseGameProfiles:{
		values: [losing, teasing, baseGameLow, baseGameMed, baseGameHigh],
		weights: [10, 0, 0, 0, 0],
	},

	bonusGameProfiles:{
		values: [bonusGameLow, bonusGameMed, bonusGameHigh],
		weights: [1, 1, 1],
	},

	profiles:{
		base:{
			losing:{
				hitRate: 0.1,
				distOffset: 0.5,
				stopOffset: 1,
				wildFeatureActive: {
						values: [true, false],
						weights: [0, 12],
				},
				initialWilds: {
					values: [1, 2, 3, 4, 5],
					weights: [50, 10, 0, 0, 0],
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
							{ row: 0, column: 4 }, 
							{ row: 1, column: 4 }, 
							{ row: 3, column: 4 },
							{ row: 2, column: 4 },
							{ row: 4, column: 4 },

							{ row: 0, column: 5 }, 
							{ row: 1, column: 5 }, 
							{ row: 3, column: 5 },
							{ row: 2, column: 5 },
							{ row: 4, column: 5 },

							{ row: 0, column: 6 }, 
							{ row: 1, column: 6 }, 
							{ row: 3, column: 6 },
							{ row: 2, column: 6 },
							{ row: 4, column: 6 },

						],
						weights: [
							3000, 3000, 3000, 3000, 3000,
							3000, 3000, 3000, 3000, 3000,
							3000, 3000, 3000, 3000, 3000,
						]
					},	
				},
			},
			teasing:{
				hitRate: 0,
				distOffset: 0.5,
				stopOffset: 1,
				wildFeatureActive: {
					values: [true, false],
					weights: [1, 11],
				},
				initialWilds: {
					values: [1, 2, 3, 4, 5],
					weights: [50, 70, 10, 7, 5],
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
					weights: [350, 500, 100, 50, 30],
				},
			
				stepsColumn6Data: {
					values: [1, 2, 3, 4, 5],
					weights: [10, 150, 150, 10, 5],
				},
				wildMaps: {
					Wild: {
						values: [
							{ row: 0, column: 4 }, 
							{ row: 1, column: 4 }, 
							{ row: 3, column: 4 },
							{ row: 2, column: 4 },
							{ row: 4, column: 4 },

							{ row: 0, column: 5 }, 
							{ row: 1, column: 5 }, 
							{ row: 3, column: 5 },
							{ row: 2, column: 5 },
							{ row: 4, column: 5 },

							{ row: 0, column: 6 }, 
							{ row: 1, column: 6 }, 
							{ row: 3, column: 6 },
							{ row: 2, column: 6 },
							{ row: 4, column: 6 },

						],
						weights: [
							3000, 3000, 3000, 3000, 3000,
							3000, 3000, 3000, 3000, 3000,
							3000, 3000, 3000, 3000, 3000,
						]
					},	
				},
			},
			baseGameLow:{
				hitRate: 0.5,
				distOffset: 0.25,
				stopOffset: 3,
				wildFeatureActive: {
					values: [true, false],
					weights: [1, 11],
				},
				initialWilds: {
					values: [1, 2, 3, 4, 5],
					weights: [5, 7, 0, 0, 0],
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
			},
			baseGameMed:{
				hitRate: 0.3,
				distOffset: 0.5,
				stopOffset: 5,
				wildFeatureActive: {
					values: [true, false],
					weights: [1, 11],
				},
				initialWilds: {
					values: [1, 2, 3, 4, 5],
					weights: [50, 70, 10, 7, 5],
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
					weights: [350, 500, 100, 50, 30],
				},
			
				stepsColumn6Data: {
					values: [1, 2, 3, 4, 5],
					weights: [10, 150, 150, 10, 5],
				},
				wildMaps: {
					wild: {
						values: [
							{ row: 0, column: 4 }, 
							{ row: 1, column: 4 }, 
							{ row: 3, column: 4 },
							{ row: 2, column: 4 },
							{ row: 4, column: 4 },

							{ row: 0, column: 5 }, 
							{ row: 1, column: 5 }, 
							{ row: 3, column: 5 },
							{ row: 2, column: 5 },
							{ row: 4, column: 5 },

							{ row: 0, column: 6 }, 
							{ row: 1, column: 6 }, 
							{ row: 3, column: 6 },
							{ row: 2, column: 6 },
							{ row: 4, column: 6 },

						],
						weights: [
							3000, 3000, 3000, 3000, 3000,
							3000, 3000, 3000, 3000, 3000,
							3000, 3000, 3000, 3000, 3000,
						]
					},	
				},
			},
			baseGameHigh:{
				hitRate: 0.7,
				distOffset: 0.7,
				stopOffset: 6,
				wildFeatureActive: {
					values: [true, false],
					weights: [1, 11],
				},
				initialWilds: {
					values: [1, 2, 3, 4, 5],
					weights: [50, 70, 10, 7, 5],
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
					weights: [350, 500, 100, 50, 30],
				},
			
				stepsColumn6Data: {
					values: [1, 2, 3, 4, 5],
					weights: [10, 150, 150, 10, 5],
				},
				wildMaps: {
					wild: {
						values: [
							{ row: 0, column: 4 }, 
							{ row: 1, column: 4 }, 
							{ row: 3, column: 4 },
							{ row: 2, column: 4 },
							{ row: 4, column: 4 },

							{ row: 0, column: 5 }, 
							{ row: 1, column: 5 }, 
							{ row: 3, column: 5 },
							{ row: 2, column: 5 },
							{ row: 4, column: 5 },

							{ row: 0, column: 6 }, 
							{ row: 1, column: 6 }, 
							{ row: 3, column: 6 },
							{ row: 2, column: 6 },
							{ row: 4, column: 6 },

						],
						weights: [
							3000, 3000, 3000, 3000, 3000,
							3000, 3000, 3000, 3000, 3000,
							3000, 3000, 3000, 3000, 3000,
						]
					},	
				},
			},
		},
		bonus: {
			bonusGameLow:{},
			bonusGameMed:{},
			bonusGameHigh:{},
		}
	},
};

const anteConfig = structuredClone(standardConfig);

export function anteMode(ante: boolean): void {
	isAnte = ante;
}

export function mathConfig(): any {
	return isAnte ? anteConfig : standardConfig;
}
