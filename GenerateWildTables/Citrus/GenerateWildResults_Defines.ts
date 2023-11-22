/**
 * GenerateWildResults_Defines.ts
 *
 * Defines for pack and recording classes and types
 */

export class SavedWildInfo {
	public reelIndex: number;
	public cellIndex: number;
	public symbol: number;
	public multiplier: number;
	public sticky: boolean;
	public direction: number; // 0: 'up' 1: 'down' 2: 'left' 3: 'right
	public steps: number;
}

export function PackWild(wild: SavedWildInfo): number {
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

	value |= wild.reelIndex;

	value |= wild.cellIndex << 4;

	value |= wild.symbol << 8;

	value |= wild.multiplier << 16;

	if (wild.sticky) {
		value |= 0x1 << 25;
	}

	if (wild.direction !== undefined) {
		value |= wild.direction << 26;
	}

	if (wild.steps !== undefined) {
		value |= wild.steps << 28;
	}

	return value;
}

export function UnpackWild(packData: number): SavedWildInfo {
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

	const newWildInfo: SavedWildInfo = new SavedWildInfo();
	newWildInfo.reelIndex = packData & 0xf;
	newWildInfo.cellIndex = (packData >> 4) & 0xf;
	newWildInfo.symbol = (packData >> 8) & 0xff;
	newWildInfo.multiplier = (packData >> 16) & 0xff;
	newWildInfo.sticky = (packData & (0x1 << 25)) !== 0;
	newWildInfo.direction = (packData >> 26) & 0x3;
	newWildInfo.steps = (packData >> 28) & 0xf;

	return newWildInfo;
}

export class SavedResult {
	constructor(
		public wilds: SavedWildInfo[],
		public scatterGridIndices: number[][],
		public win: number
	) { }
}

export function PackScatters(scatterGrid: number[][]): number {
	/*
	Pack as follows:

	4 bytes

	scatter 0
	bits 0-3 reel - 1 nybble = 0-5
	bits 4-7 cell - 1 nybble = 0-4

	scatter 1
	bits 8-11 reel - 1 nybble = 0-5
	bits 12-15 cell - 1 nybble = 0-4 

	scatter 2
	bits 16-19 reel - 1 nybble = 0-5
	bits 20-23 cell - 1 nybble = 0-4

	scatter count

	bits 24-31 - 1 byte = scatter count (0-3)
	*/

	let value = scatterGrid.length << 24;

	for (let i = 0; i < scatterGrid.length; i++) {
		value |= scatterGrid[i][0] << (i << 3);
		value |= scatterGrid[i][1] << ((i << 3) + 4);
	}

	return value;
}

export function UnpackScatters(packData: number): number[][] {
	const scatters: number[][] = [];

	return scatters;
}

export class LayoutInstance {
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

	public static CountWilds(wilds: number[]): number {
		for (let i = 0; i < wilds.length; i++) {
			if (wilds[i] === 0) {
				return i;
			}
		}

		return wilds.length;
	}

	public static WildsContainSymbol(wilds: number[], symbol: number): boolean {
		for (let i = 0; i < wilds.length; i++) {
			if (((wilds[i] >> 8) & 0xff) === symbol) {
				return true;
			}
		}

		return false;
	}

	public static WildsMultiplierGreaterThan(wilds: number[], multiplier: number): boolean {
		for (let i = 0; i < wilds.length; i++) {
			let wildInfo = UnpackWild(wilds[i]);

			if (wildInfo.multiplier > multiplier) {
				return false;
			}
		}

		return true;
	}

	public static WildExceedsMaximumSteps(wilds: number[], maxSteps: number): boolean {
		for (let i = 0; i < wilds.length; i++) {
			let wildInfo = UnpackWild(wilds[i]);

			if (wildInfo.steps > maxSteps) {
				return true;
			}
		}

		return false;
	}

	public static WildsOnThisReel(wilds: number[], reel: number): boolean {
		for (let i = 0; i < wilds.length; i++) {
			let wildInfo = UnpackWild(wilds[i]);

			if (wildInfo.reelIndex == reel) {
				return true;
			}
		}

		return false;
	}


	public static CountScatters(scatters: number): number {
		return (scatters >> 24) & 0xff;
	}
}

export enum LayoutType {
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

	//Specialist types

	PERCELL1WILD,
	PERCELLDIRECTIONALS,
	COUNT,
}

export const LayoutTypeName: string[] = [
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

	//Specialist types

	"PERCELL1WILD",
	"PERCELLDIRECTIONALS",
];

export class ProfileResult {
	constructor(public profileName: string, public playWins: number[][]) { }
}
export class MultiRunResult {
	constructor(public layout: LayoutInstance) { }
	public results: ProfileResult[] = [];
}
