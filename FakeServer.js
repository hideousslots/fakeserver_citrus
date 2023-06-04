//Import the lib version of the server

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });

//Import the correct game

const gameInterface = __importDefault(require("./lib/games/space-hive-7/index.js")).index;

//Set up the fake server using the above interface

const FakeServer = require('./FakeServerSource/main.js');

FakeServer(gameInterface);

