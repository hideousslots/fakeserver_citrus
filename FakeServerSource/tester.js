/*
    Tester.js

    Code to handle testing
*/

let fs = require('fs');

function Tester(_interface) {

    //Public functions and data go into public object

    let public = {};

    //Private functions and data  

    let gameInterface = _interface;

    //Basic RTP and analysis

    let testData = {
        testActive: false,
        gamesPlayed: 0,
        totalBet: 0,
        totalWin: 0        
    }

    let reportableData = JSON.parse(JSON.stringify(testData));

    //Public data
    
    //Public functions

    public.GetSimpleResults = function () {

        //Return simple report for now

        let result = 'Games Played : ' + reportableData.gamesPlayed + '<br>';
        result += 'Total bet : ' + reportableData.totalBet + '<br>';
        result += 'Total win : ' + reportableData.totalWin + '<br>';
        result += 'RTP : ' + (Math.floor((reportableData.totalWin / reportableData.totalBet) * 10000) / 100) + '%<br>';
        return result;
    }

    public.StartTester = function () {
        testData.testActive = true;
        setTimeout(runTestGroup,10);
    }
    
    public.StopTester = function () {
        testData.testActive = false;        
    }

    runTestGroup = async() => {
        //Run a batch of games

        for(let i = 0; i < 1000; i++) {
            let result = await gameInterface.play({ bet: 1, action: "main", state: null, variant: null, promo: null });
            testData.gamesPlayed++;
            testData.totalBet +=1;
            testData.totalWin += result.win;
            testData.totalWin = Math.floor(testData.totalWin * 100) / 100;
        }
        reportableData = JSON.parse(JSON.stringify(testData));
        if(testData.testActive) {
            setTimeout(runTestGroup,10);
        }
    }

    //Return public instance

    return public;
}

module.exports = Tester;