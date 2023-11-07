/**
 * GenerateWildResults_UseGenerated.ts
 *
 * Stats file for citrus tests
 */

import { CitrusGotReelSymbolValue } from "../../games/citrus-got-reel/math/config/CitrusGotReelSymbol";

import * as fs from "fs";

//	{"wilds":[{"reelIndex":1,"cellIndex":0,"symbol":11,"multiplier":1,"sticky":false}],"scatterGridIndices":[],"win":0}

class SavedWildInfo {
	public reelIndex: number;
	public cellIndex: number;
	public symbol: number;
	public multiplier: number;
	public sticky: boolean;
	public direction: number; // 0: 'up' 1: 'down' 2: 'left' 3: 'right
	public steps: number;
}

class SavedResult {
	constructor(
		public wilds: SavedWildInfo[],
		public scatterGridIndices: number[][],
		public win: number
	) {}
}

function PackWild(savedWild: SavedWildInfo): number {
	/*
	Pack as follows:

	32 bits for wild

	bits 0-3 reel - 1 nybble = 0-5
	bits 4-7 cell - 1 nybble = 0-4
	bits 8-15 symbol - 1 byte
	bits 16-24 multiplier - 1 byte
	bit 25 sticky - 1 bit
	bits 26-27 direction - 2 bits
	bits 28 - 31 steps - 4 bits
	*/

	let value = 0;

	value |= savedWild.reelIndex;

	value |= savedWild.cellIndex << 4;

	value |= savedWild.symbol << 8;

	value |= savedWild.multiplier << 16;

	if (savedWild.sticky) {
		value |= 0x1 << 25;
	}

	if (savedWild.direction !== undefined) {
		value |= savedWild.direction << 26;
	}

	if (savedWild.steps !== undefined) {
		value |= savedWild.steps << 28;
	}

	return value;
}

function PackScatters(scatterGrid: number[][]): number {
	/*
	Pack as follows:

	3 bytes

	scatter 0
	bits 0-3 reel - 1 nybble = 0-5
	bits 4-7 cell - 1 nybble = 0-4
	
	scatter 1
	bits 8-11 reel - 1 nybble = 0-5
	bits 12-15 cell - 1 nybble = 0-4 
	
	scatter 2
	bits 16-19 reel - 1 nybble = 0-5
	bits 20-23 cell - 1 nybble = 0-4
	*/

	let value = 0;

	for (let i = 0; i < scatterGrid.length; i++) {
		value |= scatterGrid[i][0] << (i << 3);
		value |= scatterGrid[i][1] << ((i << 3) + 4);
	}

	return value;
}

class LayoutInstance {
	public wilds: number[] = [0, 0, 0, 0, 0];
	public scatters: number = 0;

	public checksum: number = 0;

	constructor(savedInfo: SavedResult) {
		//Create this instance.
		//Sort wilds by symbol type

		savedInfo.wilds.sort((a, b) => {
			return a.symbol - b.symbol;
		});

		//Set them

		savedInfo.wilds.forEach((wild, index) => {
			this.wilds[index] = PackWild(wild);
		});

		//Pack scatters

		this.scatters = PackScatters(savedInfo.scatterGridIndices);

		//Checksum

		this.MakeChecksum();
	}

	protected MakeChecksum() {
		this.checksum = 0;

		for (let i = 0; i < 5; i++) {
			this.checksum *= 33;
			this.checksum ^= this.wilds[i] & 0xff;
			this.checksum &= 0x7fffffff;
			this.checksum *= 33;
			this.checksum ^= (this.wilds[i] >> 8) & 0xff;
			this.checksum &= 0x7fffffff;
			this.checksum *= 33;
			this.checksum ^= (this.wilds[i] >> 16) & 0xff;
			this.checksum &= 0x7fffffff;
			this.checksum *= 33;
			this.checksum ^= (this.wilds[i] >> 24) & 0xff;
			this.checksum &= 0x7fffffff;
		}

		this.checksum *= 33;
		this.checksum ^= this.scatters & 0xff;
		this.checksum &= 0x7fffffff;
		this.checksum *= 33;
		this.checksum ^= (this.scatters >> 8) & 0xff;
		this.checksum &= 0x7fffffff;
		this.checksum *= 33;
		this.checksum ^= (this.scatters >> 16) & 0xff;
		this.checksum &= 0x7fffffff;
	}
}

enum LayoutType {
	SCATTER0WILD1 = 0,
	SCATTER0WILD2,
	SCATTER0WILD3,
	SCATTER0WILD4,
	SCATTER0WILD5,
	SCATTER1WILD1,
	SCATTER1WILD2,
	SCATTER1WILD3,
	SCATTER1WILD4,
	SCATTER1WILD5,
	SCATTER2WILD1,
	SCATTER2WILD2,
	SCATTER2WILD3,
	SCATTER2WILD4,
	SCATTER2WILD5,
	SCATTER3WILD1,
	SCATTER3WILD2,
	SCATTER3WILD3,
	SCATTER3WILD4,
	SCATTER3WILD5,

	COUNT,
}

const LayoutTypeName: string[] = [
	"SCATTER0WILD1",
	"SCATTER0WILD2",
	"SCATTER0WILD3",
	"SCATTER0WILD4",
	"SCATTER0WILD5",
	"SCATTER1WILD1",
	"SCATTER1WILD2",
	"SCATTER1WILD3",
	"SCATTER1WILD4",
	"SCATTER1WILD5",
	"SCATTER2WILD1",
	"SCATTER2WILD2",
	"SCATTER2WILD3",
	"SCATTER2WILD4",
	"SCATTER2WILD5",
	"SCATTER3WILD1",
	"SCATTER3WILD2",
	"SCATTER3WILD3",
	"SCATTER3WILD4",
	"SCATTER3WILD5",
];

export const RunUseGenerated = function (_gameInterface: any, parameters: any) {
	//Adjust parameters?

	// const adjustedParameters: any = parameters;

	// if (process.argv.length > 2) {
	// 	for (let i = 2; i < process.argv.length; i++) {
	// 		const arg = process.argv[i];
	// 	}
	// }

	// const uniqueLayouts: LayoutInstance[] = [];
	const uniqueLayoutsByType: LayoutInstance[][] = [];

	for (let i = 0; i < LayoutType.COUNT; i++) {
		uniqueLayoutsByType[i] = [];
	}

	//Run through all results, isolate unique instances of wild layouts (including scatters)

	fs.readdir(".//GeneratedWildTables//", (err, files) => {
		files.forEach((file) => {
			//console.log(file);

			if (file.substring(file.length - 4) === "json") {
				console.log("Processing file: " + file);

				const thisFile: any = fs.readFileSync(
					".//GeneratedWildTables//" + file
				);

				const thisSet: any = JSON.parse(thisFile);
				thisSet.forEach((saved) => {
					const newLayout = new LayoutInstance(saved);

					const typeToCheck =
						0 +
						saved.scatterGridIndices.length * 5 +
						(saved.wilds.length - 1);

					if (typeToCheck < 0 || typeToCheck >= LayoutType.COUNT) {
						console.log(typeToCheck);
						console.log(JSON.stringify(saved));
					}

					const typeLayoutArray = uniqueLayoutsByType[typeToCheck];

					//Check for uniqueness

					if (
						typeLayoutArray.findIndex((existing) => {
							if (existing.checksum !== newLayout.checksum) {
								return false;
							}
							if (existing.wilds[0] !== newLayout.wilds[0]) {
								return false;
							}
							if (existing.wilds[1] !== newLayout.wilds[1]) {
								return false;
							}
							if (existing.wilds[2] !== newLayout.wilds[2]) {
								return false;
							}
							if (existing.wilds[3] !== newLayout.wilds[3]) {
								return false;
							}
							if (existing.wilds[4] !== newLayout.wilds[4]) {
								return false;
							}
							if (existing.scatters !== newLayout.scatters) {
								return false;
							}
							return true;
						}) === -1
					) {
						typeLayoutArray.push(newLayout);
					}
				});
			}

			for (let i: LayoutType = 0; i < LayoutType.COUNT; i++) {
				console.log(
					"Currently have " +
						uniqueLayoutsByType[i].length +
						" unique positions for " +
						LayoutTypeName[i]
				);
			}
		});

		for (let i: LayoutType = 0; i < LayoutType.COUNT; i++) {
			fs.writeFileSync(
				".//GeneratedWildTablesCombined//combined_" +
					LayoutTypeName[i] +
					".json",
				JSON.stringify(uniqueLayoutsByType[i]),
				{ encoding: "utf8", flag: "w" }
			);
		}
	});

	//Save the instances
};
