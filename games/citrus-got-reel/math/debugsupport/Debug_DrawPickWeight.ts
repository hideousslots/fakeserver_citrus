import { Position } from "../../../../common/reels/Position";
import { Distribution } from "../../../../common/distributions/Distribution";

export function DEBUG_DrawPickWeight(table: Distribution<Position>, numRows: number, numColumns: number) {
	const grid: number[][] = [];
	for(let row = 0; row < numRows; row++) {
		grid[row] =[];
		for(let column = 0; column <numColumns; column++) {
			grid[row][column] = 0;
		}
	}
	for(let i = 0; i < table.values.length; i++) {
		grid[table.values[i].row][table.values[i].column] = table.weights[i];
	}
	for(let row = 0; row < numRows; row++) {
		let line:string ="ROW " + row + " | ";
		for(let column = 0; column < numColumns; column++) {
			const value = "      " + grid[row][column].toString();
			line += value.substring(value.length - 6) + " | ";
		}
		console.log(line);
	}
}