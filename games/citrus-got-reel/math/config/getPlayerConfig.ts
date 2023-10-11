import { mathConfig } from "./mathConfig";

export function getPlayerConfig() {
	const currentMaths = mathConfig();

	return {
		payTable: currentMaths.payTable,
		bookPayTable: currentMaths.bookPayTable,
	};
}
