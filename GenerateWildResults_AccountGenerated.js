//Import the lib version of the server
//Code to generate wild tables data for citrus

"use strict";
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod };
	};
Object.defineProperty(exports, "__esModule", { value: true });

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

//Import the correct game

const gameInterface = __importDefault(
	require("./lib/games/citrus-got-reel/index.js")
).index;

const startUp = async () => {
	console.log(
		"Game: " + gameInterface.name + "\n... waiting for RNG initialisation\n"
	);
	await delay(1000);

	console.log("Running citrus_generatewildtables");

	__importDefault(
		require("./lib/GenerateWildTables/Citrus/GenerateWildResults_AccountGenerated.js")
	).RunAccountGenerated(gameInterface, {
		iterations: 1000000,
	});
};

startUp();