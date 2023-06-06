/*
    Repeater.js

    Code to handle playback files
*/

let fs = require('fs');

function Repeater(_repeatFile) {

    //Public functions and data go into public object

    let public = {};

    //Private functions and data  

    let repeatDataFile = _repeatFile;
    let repeatData = [];
    {
        let fileData = fs.readFileSync(repeatDataFile);
        if((repeatData !== null) && (repeatData !== undefined)) {
            repeatData = JSON.parse(fileData);
        }
    }

    
    //Public data

    
    //Public functions

    public.GetRepeatOptions = function () {
        let IDs = [];
        repeatData.forEach((repeatable) => {
            IDs.push(repeatable.id);
        });
        return IDs;
    }

    public.GetRepeatByID = function (ID) {
        let index = repeatData.findIndex((existing) => {return existing.id === ID});
        if(index === -1) {
            return undefined;
        }
        return repeatData[index].data.result;
    }

    public.Add = function (ID, data) {
        repeatData.push({id:ID, data: data});
        fs.writeFileSync(repeatDataFile,JSON.stringify(repeatData));
    }
    
    //Return public instance

    return public;
}

module.exports = Repeater;