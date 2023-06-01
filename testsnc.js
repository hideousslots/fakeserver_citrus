//Import the lib version of the server

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const gameInterface = __importDefault(require("./lib/games/space-hive-7/index.js")).index;

//Utitility functions

const delay = ms => new Promise(res => setTimeout(res, ms));

//Set up maintained data for the fake server

let fakeServerData = {
    balance: 10.0,
    nextRoundIndex: 1,
};

//Set up the express server

const express = require('express');
const cors = require("cors");

const bodyParser = require('body-parser');
const app = express();
const port = 3002;

app.use(cors({ maxAge: 10 * 60 /*10 minutes*/ }));
app.use(bodyParser.urlencoded({ extended: false }));

//Some of the server needs faking (authenticate and so on...)
app.get('/', (req, res) => {
    res.send('Yeah, a root page is not very useful here');
});

app.post('/authenticate', (req, res) => {
    const response = {
        balance: fakeServerData.balance,
        currency: "eur"
    };
    res.send(JSON.stringify(response));
});

app.get('/game/recover', (req, res) => {
    res.send('{"rounds":[]}');
});

app.get('/game/info', (req, res) => {
    res.send('{"state":{},"bets":{"main":{"available":[0.1,0.2,0.5,1,2,5,8,10,20,30,40,50,100],"default":1,"coin":10}},"config":{"payTable":{"0":[1,3,10,15],"1":[1,3,10,15],"2":[1,3,10,15],"3":[1,5,20,30],"4":[1,5,20,30],"5":[3,6,30,40],"6":[3,6,30,40],"7":[6,8,40,60],"8":[6,8,60,80],"9":[8,20,80,100]},"bookPayTable":{"0":[1,3],"1":[1,3],"2":[1,3],"3":[1,5],"4":[1,5],"5":[2,3,6],"6":[2,3,6],"7":[4,6,8],"8":[4,6,8],"9":[5,8,20]}},"settings":{}}');
});

app.post('/game/play', async (req, res) => {
    
    const gameResponse = JSON.parse('{"win":3.5,"state":{},"data":{"baseGameRespinsSession":[{"reels":[[1,3],[2,10,0],[2,4,2,1],[1,0,1,3],[3,7,2],[2,2]],"waysWins":[],"reverseWaysWins":[],"beeWildPositions":null,"instantPrizeCoins":null,"isRespinTriggered":false,"columnsToExpand":[],"newReelLengths":[2,3,4,4,3,2],"collectedScattersPositions":[{"column":1,"row":1}],"win":0,"accumulatedRespinsSessionWin":0,"accumulatedRoundWin":0}],"bonusGameRespinsSessions":[[{"reels":[[2,5],[3,1,4],[3,3,9,1],[1,4,3,3],[8,5,2],[6,0]],"waysWins":[],"reverseWaysWins":[],"beeWildPositions":null,"instantPrizeCoins":null,"isRespinTriggered":false,"columnsToExpand":[],"newReelLengths":[2,3,4,4,3,2],"collectedScattersPositions":[],"win":0,"accumulatedRespinsSessionWin":0,"accumulatedRoundWin":0}],[{"reels":[[4,1],[4,6,4],[7,0,0,4],[4,6,7,0],[3,0,2],[7,3]],"waysWins":[{"symbol":4,"oakIndex":4,"win":0.5,"positions":[{"column":0,"row":0},{"column":1,"row":0},{"column":1,"row":2},{"column":2,"row":3},{"column":3,"row":0}]}],"reverseWaysWins":[],"beeWildPositions":null,"instantPrizeCoins":null,"isRespinTriggered":true,"columnsToExpand":[0,1,2,3],"newReelLengths":[3,4,5,5,3,2],"collectedScattersPositions":[],"win":0.5,"accumulatedRespinsSessionWin":0.5,"accumulatedRoundWin":0.5},{"reels":[[0,8,4],[0,0,0,0],[0,5,2,2,0],[3,6,6,8,8],[3,9,4],[0,4]],"waysWins":[{"symbol":0,"oakIndex":3,"win":0.4,"positions":[{"column":0,"row":0},{"column":1,"row":0},{"column":1,"row":1},{"column":1,"row":2},{"column":1,"row":3},{"column":2,"row":0},{"column":2,"row":4}]}],"reverseWaysWins":[],"beeWildPositions":null,"instantPrizeCoins":null,"isRespinTriggered":true,"columnsToExpand":[0,1,2],"newReelLengths":[4,5,6,5,3,2],"collectedScattersPositions":[],"win":0.4,"accumulatedRespinsSessionWin":0.9,"accumulatedRoundWin":0.9},{"reels":[[7,5,1,3],[8,2,4,0,2],[9,9,3,7,3,1],[8,4,2,0,2],[7,3,5],[2,6]],"waysWins":[],"reverseWaysWins":[],"beeWildPositions":null,"instantPrizeCoins":null,"isRespinTriggered":false,"columnsToExpand":[],"newReelLengths":[4,5,6,5,3,2],"collectedScattersPositions":[],"win":0,"accumulatedRespinsSessionWin":0.9,"accumulatedRoundWin":0.9}],[{"reels":[[4,9,5,3],[3,1,4,5,9],[1,1,7,5,9,5],[2,4,5,4,6],[1,9,3],[1,2]],"waysWins":[{"symbol":9,"oakIndex":3,"win":0.4,"positions":[{"column":0,"row":1},{"column":1,"row":4},{"column":2,"row":4}]},{"symbol":5,"oakIndex":4,"win":0.6,"positions":[{"column":0,"row":2},{"column":1,"row":3},{"column":2,"row":3},{"column":2,"row":5},{"column":3,"row":2}]}],"reverseWaysWins":[],"beeWildPositions":null,"instantPrizeCoins":null,"isRespinTriggered":true,"columnsToExpand":[0,1,2,3],"newReelLengths":[5,6,6,6,3,2],"collectedScattersPositions":[],"win":1,"accumulatedRespinsSessionWin":1,"accumulatedRoundWin":1.9},{"reels":[[1,3,5,5,9],[2,0,4,4,8,6],[5,7,5,7,1,1],[2,4,4,8,8,0],[1,3,5],[0,8]],"waysWins":[],"reverseWaysWins":[],"beeWildPositions":null,"instantPrizeCoins":null,"isRespinTriggered":false,"columnsToExpand":[],"newReelLengths":[5,6,6,6,3,2],"collectedScattersPositions":[],"win":0,"accumulatedRespinsSessionWin":1,"accumulatedRoundWin":1.9}],[{"reels":[[7,7,3,3,5],[4,4,4,4,0,0],[7,4,4,1,1,2],[2,2,2,2,9,9],[1,1,6],[8,8]],"waysWins":[],"reverseWaysWins":[],"beeWildPositions":null,"instantPrizeCoins":null,"isRespinTriggered":false,"columnsToExpand":[],"newReelLengths":[5,6,6,6,3,2],"collectedScattersPositions":[],"win":0,"accumulatedRespinsSessionWin":0,"accumulatedRoundWin":1.9}],[{"reels":[[5,0,0,0,9],[7,5,5,4,4,4],[6,6,8,1,0,7],[1,1,1,1,4,4],[9,0,1],[3,3]],"waysWins":[],"reverseWaysWins":[],"beeWildPositions":null,"instantPrizeCoins":null,"isRespinTriggered":false,"columnsToExpand":[],"newReelLengths":[5,6,6,6,3,2],"collectedScattersPositions":[],"win":0,"accumulatedRespinsSessionWin":0,"accumulatedRoundWin":1.9}],[{"reels":[[4,4,5,5,0],[5,9,8,6,6,2],[3,2,2,0,0,5],[0,0,8,0,0,3],[0,1,1],[5,0]],"waysWins":[{"symbol":5,"oakIndex":3,"win":0.3,"positions":[{"column":0,"row":2},{"column":0,"row":3},{"column":1,"row":0},{"column":2,"row":5}]}],"reverseWaysWins":[{"symbol":0,"oakIndex":4,"win":1.2,"positions":[{"column":5,"row":1},{"column":4,"row":0},{"column":3,"row":0},{"column":3,"row":1},{"column":3,"row":3},{"column":3,"row":4},{"column":2,"row":3},{"column":2,"row":4}]}],"beeWildPositions":null,"instantPrizeCoins":null,"isRespinTriggered":true,"columnsToExpand":[0,1,2,3,4,5],"newReelLengths":[6,6,6,6,4,3],"collectedScattersPositions":[],"win":1.5,"accumulatedRespinsSessionWin":1.5,"accumulatedRoundWin":3.4},{"reels":[[5,3,5,1,5,7],[2,4,0,2,4,8],[5,3,5,3,7,3],[2,4,2,8,6,8],[7,3,5,3],[2,2,4]],"waysWins":[],"reverseWaysWins":[],"beeWildPositions":null,"instantPrizeCoins":null,"isRespinTriggered":false,"columnsToExpand":[],"newReelLengths":[6,6,6,6,4,3],"collectedScattersPositions":[],"win":0,"accumulatedRespinsSessionWin":1.5,"accumulatedRoundWin":3.4}],[{"reels":[[7,7,3,5,5,7],[4,6,8,0,2,2],[3,1,5,1,3,5],[6,4,2,2,8,4],[5,3,7,1],[2,4,2]],"waysWins":[],"reverseWaysWins":[],"beeWildPositions":null,"instantPrizeCoins":null,"isRespinTriggered":false,"columnsToExpand":[],"newReelLengths":[6,6,6,6,4,3],"collectedScattersPositions":[],"win":0,"accumulatedRespinsSessionWin":0,"accumulatedRoundWin":3.4}],[{"reels":[[7,3,9,7,9,1],[2,8,2,4,8,4],[7,5,7,7,3,5],[2,0,8,8,4,2],[5,5,7,7],[8,4,2]],"waysWins":[],"reverseWaysWins":[],"beeWildPositions":null,"instantPrizeCoins":null,"isRespinTriggered":false,"columnsToExpand":[],"newReelLengths":[6,6,6,6,4,3],"collectedScattersPositions":[],"win":0,"accumulatedRespinsSessionWin":0,"accumulatedRoundWin":3.4}],[{"reels":[[7,5,3,5,1,5],[2,2,4,6,2,4],[3,5,1,1,9,7],[4,0,2,8,8,2],[9,3,9,7],[0,2,4]],"waysWins":[],"reverseWaysWins":[],"beeWildPositions":null,"instantPrizeCoins":null,"isRespinTriggered":false,"columnsToExpand":[],"newReelLengths":[6,6,6,6,4,3],"collectedScattersPositions":[],"win":0,"accumulatedRespinsSessionWin":0,"accumulatedRoundWin":3.4}],[{"reels":[[6,4,6,0,4,1],[1,0,4,6,4,7],[3,1,3,3,9,1],[8,9,0,2,4,5],[0,0,5,2],[1,9,1]],"waysWins":[{"symbol":1,"oakIndex":3,"win":0.1,"positions":[{"column":0,"row":5},{"column":1,"row":0},{"column":2,"row":1},{"column":2,"row":5}]}],"reverseWaysWins":[],"beeWildPositions":null,"instantPrizeCoins":null,"isRespinTriggered":true,"columnsToExpand":[0,1,2],"newReelLengths":[6,6,6,6,4,3],"collectedScattersPositions":[],"win":0.1,"accumulatedRespinsSessionWin":0.1,"accumulatedRoundWin":3.5},{"reels":[[7,7,5,1,7,7],[4,6,8,0,2,2],[3,7,3,1,7,5],[8,2,8,4,4,2],[5,1,3,5],[4,4,0]],"waysWins":[],"reverseWaysWins":[],"beeWildPositions":null,"instantPrizeCoins":null,"isRespinTriggered":false,"columnsToExpand":[],"newReelLengths":[6,6,6,6,4,3],"collectedScattersPositions":[],"win":0,"accumulatedRespinsSessionWin":0.1,"accumulatedRoundWin":3.5}]]}}');
    
    //const gameResponse = await gameInterface.play(0.5);
    //gameResponse.state = {};
    //Possibly missing data...
    //gameResponse.data.collectedScattersPositions = [];

    fakeServerData.balance += gameResponse.win;
    const response = {
        roundId: 'fakeroundindex_' + (fakeServerData.nextRoundIndex++),
        wager: gameResponse,
        balance: fakeServerData.balance
    };

    console.log('response to play is ' + JSON.stringify(response));
    res.send(JSON.stringify(response));
    
});

app.post('/game/complete', (req, res) => {
    const response = {
        balance: fakeServerData.balance
    };
    res.send(JSON.stringify(response));//'{"balance":199.5}');
});

//Report the game being run

const startup = async () => {
    console.log('Fake server ready for game: ' + gameInterface.name);
    await delay(1000);
    console.log('Should have waited long enough for the RNG to initialse now...');
    console.log('Test result...' + JSON.stringify(gameInterface.play(0)));
    console.log('and we are off...\n\n');

    app.listen(port, () => {
        console.log(`FAKE server running on port ${port}.`);
    });

}

startup();




