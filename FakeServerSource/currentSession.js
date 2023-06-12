/*
    CurrentSession.js

    Code to handle current session 
*/

let fs = require('fs');

function CurrentSession() {

    //Public functions and data go into public object

    let public = {};

    //Private functions and data  

    public.sessionStartTime = Date.now();

    let sessionID = 'Session_' + public.sessionStartTime;
    let sessionFile = './FakeServerSource/LocalSessions/' + sessionID + '.log';
    const maxRecentResults = 10;

    WriteLogFile = function (logEntry) {
        let fileHandle;

        try {
            fileHandle = fs.openSync(sessionFile, 'a');
            fs.appendFileSync(fileHandle, logEntry + '\n', 'utf8');
        } catch (err) {
            // Handle the error
            console.log('error writing to log file');
        } finally {
            if (fileHandle !== undefined)
                fs.closeSync(fileHandle);
        }
    }

    //Public data

    public.balance = 1000;
    public.nextRoundIndex = 1;

    public.roundsPlayedCount = 0;
    public.roundsWon = 0;
    public.roundsLost = 0;
    public.totalBet = 0;
    public.totalWon = 0;
    public.recentRoundData = [];

    //Public functions

    public.ReportCachedResults = function (_maxResults) {
        let report = '<H1>Recent Games</H1><br>'
        public.recentRoundData.forEach((round) => {
            report += '<div><hr>'
            report += '<div align="center"><b>RoundId: ' + round.roundId + '</b></div>';
            report += '<div align="center">' + JSON.stringify(round.result) + '</div>'
            report += '<hr></div>'
        });
        return report;
    }

    // Not the round played and report the round ID assigned
    public.NoteRoundPlayed = function (_bet, _win, _result) {
        //Note a round played
        const roundId = 'fakeround_' + public.sessionStartTime + '_' + (public.nextRoundIndex++);
        public.roundsPlayedCount++;
        public.totalBet += _bet;
        public.totalWon += _win;
        public.balance -= _bet;
        public.balance += _win;
        if (public.recentRoundData.unshift({ roundId: roundId, result: _result }) > maxRecentResults) {
            public.recentRoundData.splice(maxRecentResults);
        }

        //Hold a record of the round in the log

        WriteLogFile('Play Round' + roundId + JSON.stringify(_result));
       
        return roundId;
    }

    //Return public instance

    return public;
}

module.exports = CurrentSession;