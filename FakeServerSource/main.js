//Utility functions

const delay = ms => new Promise(res => setTimeout(res, ms));
const CurrentSession = require('./currentSession.js');
const Repeater = require('./repeater.js');
const Tester = require('./tester.js');
const path = require('path');
const https = require('https');
const fs = require("fs");

const variantOptions = [
    'rtp94',
    'rtp95'
];

let currentVariantIndex = 0;
let currentVariant = variantOptions[currentVariantIndex];

function FakeServer(_interface) {

    //Public functions and data go into public object

    let public = {};

    let gameInterface = _interface;

    const buildTracker = JSON.parse(fs.readFileSync(path.join(__dirname, '/buildtracker.json')));

    //Set up maintained data for the fake server

    const sessionData = new CurrentSession();
    const tester = new Tester(_interface);
    const localRepeat = new Repeater(path.join(__dirname, '/PlaybackData/localRepeats.json'));
    const globalRepeat = new Repeater(path.join(__dirname, '/PlaybackData/globalRepeats.json'));
    let fixedResponse = undefined;

    //Set up the express server

    const express = require('express');
    const cors = require("cors");

    const app = express();
    const port = 3002;
    const portssl = 3003;
    let useSSL = false;
    if (process.env.FAKESERVERUSESSL !== undefined) {
        useSSL = true;
    }

    app.use(cors({ maxAge: 10 * 60 /*10 minutes*/ }));
    app.use(express.json());

    //Some of the server needs faking (authenticate and so on...)
    app.post('/authenticate', (req, res) => {
        const response = {
            balance: sessionData.balance,
            currency: "eur"
        };
        res.send(JSON.stringify(response));
    });

    app.get('/game/recover', (req, res) => {
        res.send('{"rounds":[]}');
    });

    app.get('/game/info', (req, res) => {
        res.send('{"config":' + JSON.stringify(gameInterface.config()) + ',"state":{},"bets":' + JSON.stringify(gameInterface.bets) + ',"settings":{}}');
    });

    app.post('/game/complete', (req, res) => {
        const response = {
            balance: sessionData.balance
        };
        res.send(JSON.stringify(response));
    });

    //Game play response

    const SetFixedResponse = function (_response) {
        //Ensure an action is reported (mainly for old data)

        fixedResponse = _response;
        if (fixedResponse !== undefined) {
            if (fixedResponse.data.action === undefined) {
                fixedResponse.data.action = 'main';
            }
        }
    };

    app.post('/game/play', async (req, res) => {

        console.log('request ' + JSON.stringify(req.body) + ' ip ' + req.socket.remoteAddress);
        let requestData = {
            bet: req.body.bet,
            action: req.body.action,
            game: req.body.game,
            provider: req.body.provider
        };

        //Checking the bet

        let betValid = false;
        if (gameInterface.bets[requestData.action] !== undefined) {
            if (gameInterface.bets[requestData.action].available.findIndex((existing) => { return existing === requestData.bet; }) !== -1) {
                betValid = true;
            }
        }

        if (betValid === false) {
            console.log('bet invalid for this bet: ' + JSON.stringify(requestData));
            console.log('sending NULL response');
            const response = {
                roundId: 'ERROR IN BET - SENDING NULL RESPONSE',
                wager: JSON.parse('{ "win": 0, "data": { "action": "main", "stake": 0.0, "bet": 0.0, "coin": 0.00, "baseGameRespinsSession": [{ "reels": [[5, 3], [4, 6, 8], [9, 7, 5, 9], [8, 2, 0, 8], [1, 3, 3], [6, 2]], "reelsExpanded": null, "waysWins": [], "reverseWaysWins": [], "beeWildPositions": null, "instantPrizeCoins": null, "expandedInstantPrizeData": null, "replaceFeature": null, "isRespinTriggered": false, "columnsToExpand": [], "newReelLengths": [2, 3, 4, 4, 3, 2], "scatters": { "collected": 0, "positions": [] }, "win": 0, "accumulatedRespinsSessionWin": 0, "accumulatedRoundWin": 0, "freeSpinIndex": 0, "debug": null }], "bonusGameRespinsSessions": [] }, "state": {} }'),
                balance: sessionData.balance
            };

            res.send(JSON.stringify(response));
            return;
        }

        //Fixed response or not?

        let gameResponse;

        if (fixedResponse !== undefined) {
            gameResponse = fixedResponse;

        } else {
            gameResponse = gameInterface.play({ bet: requestData.bet, action: requestData.action, state: null, variant: currentVariant, promo: null });
            gameResponse.state = {};
        }

        const roundId = sessionData.NoteRoundPlayed(requestData.bet, gameResponse.win, gameResponse);

        const response = {
            roundId: roundId,
            wager: gameResponse,
            balance: sessionData.balance
        };
        console.log('Round played: ' + response.roundId + ' Stake: ' + response.wager.data.stake + ' Bet: ' + response.wager.data.bet + ' Coin: ' + response.wager.data.coin + ' Win: ' + response.wager.win);

        res.send(JSON.stringify(response));
    });

    //Control page handling

    app.get('/', (req, res) => {
        //Handle query based

        //console.log('req ' + JSON.stringify(req.query));

        if (req.query.tester_on !== undefined) {
            tester.StartTester();
            res.send('<html><head><meta http-equiv="refresh" content="0; url=/" /></head><body>refreshing</body></html>');
            return;
        }

        if (req.query.tester_off !== undefined) {
            tester.StopTester();
            res.send('<html><head><meta http-equiv="refresh" content="0; url=/" /></head><body>refreshing</body></html>');
            return;
        }

        if (req.query.repeatrecent !== undefined) {
            //Try to set repeat from recent data

            let repeatData = sessionData.recentRoundData.find((existing) => { return existing.roundId === req.query.repeatrecent; });
            // console.log('found repeat data' + JSON.stringify(repeatData));
            SetFixedResponse(repeatData.result);
            res.send('<html><head><meta http-equiv="refresh" content="0; url=/" /></head><body>refreshing</body></html>');
            return;
        }

        if (req.query.setrepeatlocal !== undefined) {
            let repeatData = localRepeat.GetRepeatByID(req.query.setrepeatlocal);
            // console.log('found repeat data' + JSON.stringify(repeatData));
            SetFixedResponse(repeatData);
            res.send('<html><head><meta http-equiv="refresh" content="0; url=/" /></head><body>refreshing</body></html>');
            return;
        }

        if (req.query.setrepeatglobal !== undefined) {
            let repeatData = globalRepeat.GetRepeatByID(req.query.setrepeatglobal);
            // console.log('found repeat data' + JSON.stringify(repeatData));
            SetFixedResponse(repeatData);
            res.send('<html><head><meta http-equiv="refresh" content="0; url=/" /></head><body>refreshing</body></html>');
            return;
        }

        if (req.query.addrecentlocal !== undefined) {
            let repeatData = sessionData.recentRoundData.find((existing) => { return existing.roundId === req.query.addrecentlocal; });
            // console.log('found repeat data' + JSON.stringify(repeatData));
            if (repeatData !== undefined) {
                localRepeat.Add(req.query.addrecentlocal, repeatData);
            }
            res.send('<html><head><meta http-equiv="refresh" content="0; url=/" /></head><body>refreshing</body></html>');
            return;
        }

        if (req.query.addrecentglobal !== undefined) {
            let repeatData = sessionData.recentRoundData.find((existing) => { return existing.roundId === req.query.addrecentglobal; });
            // console.log('found repeat data' + JSON.stringify(repeatData));
            if (repeatData !== undefined) {
                globalRepeat.Add(req.query.addrecentglobal, repeatData);
            }
            res.send('<html><head><meta http-equiv="refresh" content="0; url=/" /></head><body>refreshing</body></html>');
            return;
        }

        if (req.query.repeatrecent !== undefined) {
            //Try to set repeat from recent data

            // console.log(JSON.stringify(sessionData.recentRoundData));
            let repeatData = sessionData.recentRoundData.find((existing) => { return existing.roundId === req.query.repeatrecent; });
            // console.log('found repeat data' + JSON.stringify(repeatData));
            SetFixedResponse(repeatData.result);
            res.send('<html><head><meta http-equiv="refresh" content="0; url=/" /></head><body>refreshing</body></html>');
            return;
        }

        if (req.query.clearfixedresponse !== undefined) {
            SetFixedResponse(undefined);
            res.send('<html><head><meta http-equiv="refresh" content="0; url=/" /></head><body>refreshing</body></html>');
            return;
        }

        
        if (req.query.nextvariant !== undefined) {
            currentVariantIndex = (currentVariantIndex+1) % variantOptions.length;
            currentVariant=variantOptions[currentVariantIndex];
            res.send('<html><head><meta http-equiv="refresh" content="0; url=/" /></head><body>refreshing</body></html>');
            return;
        }

        //Create a full response of the current sessions, cheats, stats, etc

        let response = '<HTML><HEAD><TITLE>FAKE SERVER INTERFACE</TITLE></HEAD><BODY>';
        response += '<div align = "center">Fake server build date:<br>' + buildTracker.time + '</div>';
        response += '<div align = "center">Fake server build info:<br>' + buildTracker.versionInfo + '</div>';

        response += '<div align = "center"><h1>Current variant:<br>' + currentVariant + '</h1></div>';
        response += '<div align="center"><A href="?nextvariant">ADJUST VARIANT</A></div>';

        //Test data (temporary space)

        // response += '<hr><div align="center">TEST DATA SIMPLE RESULTS</div>';
        // response += '<div align="center">' + tester.GetSimpleResults() + '</div>';
        // if(tester.IsTesterOn()) {
        //     response += '<div align="center"><A href="?tester_off=1">TURN TESTER OFF</A></div>';
        // } else {
        //     response += '<div align="center"><A href="?tester_on=1">TURN TESTER ON</A></div>';            
        // }

        //Any current fixed response?

        response += '<hr><div><div align="center"><h1>Current fixed response</h1></div>';

        if (fixedResponse === undefined) {
            response += '<div align="center">NO FIXED RESPONSE - Random Game Will Play</div>';
        } else {
            response += '<div align="center">' + JSON.stringify(fixedResponse) + '</div>';
            response += '<div align="center"><A href="?clearfixedresponse=true">CLEAR FIXED RESPONSE</A></div>';
        }
        response += '</div>';

        //List options for repeats

        let repeatOptions = globalRepeat.GetRepeatOptions();
        response += '<hr><div><div align="center"><h1>Global fixed response options</h1></div>';
        repeatOptions.forEach((option) => {
            response += '<div align="center"><A href="?setrepeatglobal=' + option + '">ID: ' + option + '</A></div>';
        });
        response += '</div>';

        repeatOptions = localRepeat.GetRepeatOptions();
        response += '<hr><div><div align="center"><h1>Local fixed response options</h1></div>';
        repeatOptions.forEach((option) => {
            response += '<div align="center"><A href="?setrepeatlocal=' + option + '">ID: ' + option + '</A></div>';
        });
        response += '</div>';

        response += '<hr><div><div align="center"><h1>Recent Games</h1></div>';
        sessionData.recentRoundData.forEach((round) => {
            response += '<hr><div>';
            response += '<div align="center"><b>RoundId: ' + round.roundId + '</b></div>';
            response += '<div align="center">' + JSON.stringify(round.result) + '</div>';
            response += '<div align="center"><A href="?repeatrecent=' + round.roundId + '"> REPEAT THIS </A></div>';
            response += '<div align="center"><A href="?addrecentlocal=' + round.roundId + '"> ADD TO LOCAL REPEATS </A></div>';
            response += '<div align="center"><A href="?addrecentglobal=' + round.roundId + '"> ADD TO GLOBAL REPEATS </A></div>';
            response += '<hr></div>';
        });
        response += '</div>';

        response += '</div>';
        response += '</BODY></HTML>';
        res.send(response);
    });

    //Control page handling

    app.get('/getconnector', (req, res) => {
        req;
        console.log('connector request by ' + JSON.stringify(req.body) + ' ip ' + req.socket.remoteAddress);
        const connectorjs = fs.readFileSync(path.join(__dirname, '/Connector/connector.js'));
        res.send(connectorjs);
    });

    //Startup the fake server

    const startup = async () => {
        console.log('Fake server ready\nGame: ' + gameInterface.name + '\n... waiting for RNG initialisation\n');
        await delay(1000);
        console.log('Should have waited long enough for the RNG to initialise now... Time to try...\n');
        let testResult = gameInterface.play({ bet: 1, action: "main", state: null, variant: currentVariant, promo: null });
        console.log('\nTest result...' + ((testResult.win !== undefined) ? 'OK' : 'Error'));

        //Insert simple calculation and display code for bet levels etc if useful to save calculating

        // {
        //     const betLevels = [0.2, 0.3, 0.4, 0.6, 0.8, 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 15, 20];
        //     const multipliers = [1, 1.5, 100, 95];

        //     for (let i = 0; i < 4; i++) {
        //         let output = '[';
        //         for (let j = 0; j < betLevels.length; j++) {
        //             output += Number((betLevels[j] * multipliers[i]).toFixed(2));
        //             if (j === (betLevels.length - 1)) {
        //                 output += '],';
        //             } else {
        //                 output += ', ';
        //             }
        //         }
        //         console.log(output);
        //     }
        // }

        console.log('\nand we are off...\n');

        if (!useSSL) {
            app.listen(port, () => {
                console.log('FAKE SERVER running on port ' + port);
                console.log('Web interface will depend on usage. For a local build localhost:' + port + ' should suffice');
            });
        } else {

            https.createServer(
                // Provide the private and public key to the server by reading each
                // file's content with the readFileSync() method.
                {
                    key: fs.readFileSync("./FakeServerSource/Keys/dstestkey.pem"),
                    cert: fs.readFileSync("./FakeServerSource/Keys/dstestcert.pem"),
                },
                app
            ).
                listen(portssl, () => {
                    console.log('FAKE SERVER running on SSL port ' + portssl);
                    console.log('Web interface will depend on usage. For a local build localhost:' + portssl + ' should suffice');
                });
        }

        //tester.StartTester();
    };

    startup();

    //Return public instance

    return public;
}

module.exports = FakeServer;