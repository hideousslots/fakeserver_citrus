//Utility functions

const delay = ms => new Promise(res => setTimeout(res, ms));
const CurrentSession = require('./currentSession.js');
const Repeater = require('./repeater.js');

function FakeServer(_interface) {

    //Public functions and data go into public object

    let public = {};

    let gameInterface = _interface;

    //Set up maintained data for the fake server

    const sessionData = new CurrentSession();
    const localRepeat = new Repeater('./FakeServerSource/PlaybackData/localRepeats.json');
    const globalRepeat = new Repeater('./FakeServerSource/PlaybackData/globalRepeats.json');
    let fixedResponse = undefined;

    //Set up the express server

    const express = require('express');
    const cors = require("cors");

    const bodyParser = require('body-parser');
    const app = express();
    const port = 3002;

    app.use(cors({ maxAge: 10 * 60 /*10 minutes*/ }));
    app.use(bodyParser.urlencoded({ extended: false }));

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
        res.send('{"state":{},"bets":{"main":{"available":[0.1,0.2,0.5,1,2,5,8,10,20,30,40,50,100],"default":1,"coin":10}},"config":{"payTable":{"0":[1,3,10,15],"1":[1,3,10,15],"2":[1,3,10,15],"3":[1,5,20,30],"4":[1,5,20,30],"5":[3,6,30,40],"6":[3,6,30,40],"7":[6,8,40,60],"8":[6,8,60,80],"9":[8,20,80,100]},"bookPayTable":{"0":[1,3],"1":[1,3],"2":[1,3],"3":[1,5],"4":[1,5],"5":[2,3,6],"6":[2,3,6],"7":[4,6,8],"8":[4,6,8],"9":[5,8,20]}},"settings":{}}');
    });

    app.post('/game/complete', (req, res) => {
        const response = {
            balance: sessionData.balance
        };
        res.send(JSON.stringify(response));
    });

    //Game play response

    app.post('/game/play', async (req, res) => {

        //Fixed response or not?

        let gameResponse;

        if(fixedResponse !== undefined) {
            gameResponse = fixedResponse;
        } else {
            gameResponse = gameInterface.play({ bet: 1, action: "main", state: null, variant: null, promo: null });
            gameResponse.state = {};
        }

        //For now (until the frontend accepts the scatters data being prebuilt) add in collectedScattersPositions

        gameResponse.data.baseGameRespinsSession.forEach((session) => {
            session.collectedScattersPositions = session.scatters.positions;
        });

        const roundId = sessionData.NoteRoundPlayed(1, gameResponse.win, gameResponse);

        response = {
            roundId: roundId,
            wager: gameResponse,
            balance: sessionData.balance
        };
        console.log('Round played: ' + response.roundId + ' Win: ' + response.wager.win);

        res.send(JSON.stringify(response));
    });

    //Control page handling

    app.get('/', (req, res) => {
        //Handle query based

        console.log('req ' + JSON.stringify(req.query));

        if(req.query.repeatrecent !== undefined) {
            //Try to set repeat from recent data

            fixedResponse = undefined;
            let repeatData = sessionData.recentRoundData.find((existing) => {return existing.roundId === req.query.repeatrecent});
            console.log('found repeat data' + JSON.stringify(repeatData));
            if(repeatData !== undefined) {
                fixedResponse = repeatData.result;
            }
        }

        if(req.query.setrepeatlocal !== undefined) {
            fixedResponse = undefined;
            let repeatData = localRepeat.GetRepeatByID(req.query.setrepeatlocal);
            console.log('found repeat data' + JSON.stringify(repeatData));
            if(repeatData !== undefined) {
                fixedResponse = repeatData;
            }
        }

        if(req.query.setrepeatglobal !== undefined) {
            fixedResponse = undefined;
            let repeatData = globalRepeat.GetRepeatByID(req.query.setrepeatglobal);
            console.log('found repeat data' + JSON.stringify(repeatData));
            if(repeatData !== undefined) {
                fixedResponse = repeatData;
            }
        }

        if(req.query.addrecentlocal !== undefined) {
            fixedResponse = undefined;
            let repeatData = sessionData.recentRoundData.find((existing) => {return existing.roundId === req.query.addrecentlocal});
            console.log('found repeat data' + JSON.stringify(repeatData));
            if(repeatData !== undefined) {
                localRepeat.Add(req.query.addrecentlocal, repeatData)
            }
        }

        if(req.query.addrecentglobal !== undefined) {
            fixedResponse = undefined;
            let repeatData = sessionData.recentRoundData.find((existing) => {return existing.roundId === req.query.addrecentglobal});
            console.log('found repeat data' + JSON.stringify(repeatData));
            if(repeatData !== undefined) {
                globalRepeat.Add(req.query.addrecentglobal, repeatData)
            }
        }

        if(req.query.repeatrecent !== undefined) {
            //Try to set repeat from recent data

            console.log(JSON.stringify(sessionData.recentRoundData));
            let repeatData = sessionData.recentRoundData.find((existing) => {return existing.roundId === req.query.repeatrecent});
            console.log('found repeat data' + JSON.stringify(repeatData));
            if(repeatData !== undefined) {
                fixedResponse = repeatData;
            }
        }

        if(req.query.clearfixedresponse !== undefined) {
            fixedResponse = undefined;
        }
        
        //Create a full response of the current sessions, cheats, stats, etc

        let response = '<HTML><HEAD><TITLE>FAKE SERVER INTERFACE</TITLE></HEAD><BODY>';

        //Any current fixed response?

        response += '<hr><div><div align="center"><h1>Current fixed response</h1></div>';
        
        if(fixedResponse === undefined) {
            response += '<div align="center">NO FIXED RESPONSE - Random Game Will Play</div>'
        } else {
            response += '<div align="center">' + JSON.stringify(fixedResponse) + '</div>';
            response += '<div align="center"><A href="?clearfixedresponse=true">CLEAR FIXED RESPONSE</A></div>';
        }
        response += '</div>';

        //List options for repeats

        let repeatOptions = localRepeat.GetRepeatOptions();
        response += '<hr><div><div align="center"><h1>Local fixed response options</h1></div>';
        repeatOptions.forEach((option) => {
            response += '<div align="center"><A href="?setrepeatlocal=' + option + '">ID: ' + option + '</A></div>';
        });
        response += '</div>';

        repeatOptions = globalRepeat.GetRepeatOptions();
        response += '<hr><div><div align="center"><h1>Global fixed response options</h1></div>';
        repeatOptions.forEach((option) => {
            response += '<div align="center"><A href="?setrepeatglobal=' + option + '">ID: ' + option + '</A></div>';
        });
        response += '</div>';

        response += '<hr><div><div align="center"><h1>Recent Games</h1></div>';
        sessionData.recentRoundData.forEach((round) => {
            response += '<hr><div>'
            response += '<div align="center"><b>RoundId: ' + round.roundId + '</b></div>';
            response += '<div align="center">' + JSON.stringify(round.result) + '</div>'
            response += '<div align="center"><A href="?repeatrecent=' + round.roundId + '"> REPEAT THIS </A></div>';
            response += '<div align="center"><A href="?addrecentlocal=' + round.roundId + '"> ADD TO LOCAL REPEATS </A></div>';
            response += '<div align="center"><A href="?addrecentglobal=' + round.roundId + '"> ADD TO GLOBAL REPEATS </A></div>';
            response += '<hr></div>'
        });
        response += '</div>';
        
        response += '</div>';
        response += '</BODY></HTML>';
        res.send(response);
    });

    //Startup the fake server

    const startup = async () => {
        console.log('Fake server ready\nGame: ' + gameInterface.name + '\n... waiting for RNG initialisation\n');
        await delay(1000);
        console.log('Should have waited long enough for the RNG to initialse now... Time to try...\n');
        let testResult = gameInterface.play({ bet: 1, action: "main", state: null, variant: null, promo: null });
        console.log('\nTest result...' + ((testResult.win !== undefined) ? 'OK' : 'Error'));
        console.log('\nand we are off...\n');

        app.listen(port, () => {
            console.log('FAKE SERVER running on port ' + port);
            console.log('Web interface at http://127.0.0.1:' + port);
        });

    }

    startup();

    //Return public instance

    return public;
}

module.exports = FakeServer;