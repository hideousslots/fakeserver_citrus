import { FeatureType } from "./defines";

let isAnte = false;

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
		0: [0, 0, 1, 3, 10, 15],
		1: [0, 0, 1, 3, 10, 15],
		2: [0, 0, 1, 3, 10, 15],
		3: [0, 0, 1, 5, 20, 30],
		4: [0, 0, 1, 5, 20, 30],
		5: [0, 0, 3, 6, 30, 40],
		6: [0, 0, 3, 6, 30, 40],
		7: [0, 0, 6, 8, 40, 60],
		8: [0, 0, 6, 8, 60, 80],
		9: [0, 0, 8, 20, 80, 100],
	},

	baseGameHitRate: { values: [0.15, 0.25, 0.4], weights: [5, 15, 5] },
	baseGameDistOffset: { values: [0.25, 0.5, 0.8], weights: [5, 15, 5] },
	baseGameStopOffset: { values: [3, 4, 5, 6], weights: [0, 0, 0, 100] },
	baseGameScattersToAdd: { values: [0, 1, 2, 3], weights: [271, 15, 7, 1] },

	bonusGameHitRate: { values: [0.3, 0.55, 0.7], weights: [5, 15, 5] },
	bonusGameDistOffset: { values: [0.25, 0.5, 0.8], weights: [5, 15, 5] },
	bonusGameStopOffset: { values: [3, 4, 5, 6], weights: [0, 0, 0, 100] },

	wildFeatureActive: {
		base: {
			values: [true, false],
			weights: [1, 7],
		},
		bonus: {
			values: [true, false],
			weights: [13, 10],
		},
	},

	initialWilds: {
		base: {
			values: [1, 2, 3, 4, 5],
			weights: [50, 70, 10, 7, 5],
		},
		bonus: {
			values: [1, 2, 3],
			weights: [5, 7, 1],
		},
	},

	initialMultiplier: {
		base: {
			values: [1, 2, 3, 4, 5],
			weights: [40, 10, 5, 3, 1],
		},
		bonus: {
			values: [1, 2, 3, 4, 5],
			weights: [40, 10, 5, 3, 1],
		},
	},

	wildLookUp: {
		values: [
			FeatureType.Wild,
			FeatureType.DirectionalWild,
			FeatureType.CollectorWild,
			FeatureType.PayerWild,
		],
		weights: [70, 10, 3, 10],
	},

	stepsData: {
		values: [2, 3, 4, 5],
		weights: [15, 5, 3, 1],
	},

	directions: ["up", "down", "left", "right"], // Possible directions

	wildsStick: {
		values: [true, false],
		weights: [10, 15],
	},
};

const anteConfig = structuredClone(standardConfig);

export function anteMode(ante: boolean): void {
	isAnte = ante;
}

export function mathConfig(): any {
	return isAnte ? anteConfig : standardConfig;
}
