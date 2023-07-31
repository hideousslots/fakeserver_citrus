"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });

//Import the correct game

const gameInterface = __importDefault(require("../lib/games/space-hive-7/index.js")).index;
const mathsConfig_Standard = __importDefault(require("../lib/games/space-hive-7/math/config/mathConfig")).standardConfig;
const mathsConfig_Ante = __importDefault(require("../lib/games/space-hive-7/math/config/mathConfig")).anteConfig;
const fs = require('fs');
const { standardConfig, anteConfig } = require("../lib/games/space-hive-7/math/config/mathConfig");
//Simple extraction system to create CSV and other data

const SimpleCSVFile = require('./SimpleCSVFile');
const { table } = require("console");
const { resolvePtr } = require("dns");

let g_FilenamePrefix = '';

const MakeFilename = function (name) {
    return './MathsExtraction/Output/' + g_FilenamePrefix + name;
};

function ReportConstants(filename, readList_Numbers, readList_NumberArrays, config) {
    let file = '';
    readList_Numbers.forEach((item) => {
        file += item + ',' + config[item] + '\n';
    });

    readList_NumberArrays.forEach((item) => {
        file += item + ',';
        config[item].forEach((entry) => {
            file += entry + ',';
        });
        file += '\n';
    });

    fs.writeFileSync(filename, file);
}

function WeightedTableToCSV_NumbersOrString(filename, title, table) {

    let CSVFile = new SimpleCSVFile();

    CSVFile.title = title;

    CSVFile.headings = ['weight, values'];
    for (let i = 0; i < table.values.length; i++) {
        let thisRow = [];
        thisRow.push(table.weights[i]);
        if (typeof (table.values[i]) === 'string') {
            thisRow.push(table.values[i]);
        } else {
            for (let j = 0; j < table.values[i].length; j++) {
                thisRow.push(table.values[i][j]);
            }
        }
        CSVFile.rows.push(thisRow);
    }

    CSVFile.WriteFile(filename);
}

function WeightedTableToCSV_FeatureTypePayload(filename, title, table) {

    let CSVFile = new SimpleCSVFile();

    CSVFile.title = title;

    CSVFile.headings = ['weight, featureType, payload'];
    for (let i = 0; i < table.values.length; i++) {
        let thisRow = [table.weights[i],
        table.values[i].featureType,
        table.values[i].payload];
        CSVFile.rows.push(thisRow);
    }

    CSVFile.WriteFile(filename);
}

function PayTableToCSV(filename, title, table) {

    let CSVFile = new SimpleCSVFile();

    CSVFile.title = title;

    CSVFile.headings = ['rank, values'];
    for (let i = 0; i < 10; i++) {
        let thisRow = [];
        thisRow.push(i);
        for (let j = 0; j < table['' + i].length; j++) {
            thisRow.push(table['' + i][j]);
        }
        CSVFile.rows.push(thisRow);
    }

    CSVFile.WriteFile(filename);
}

function FallbackTableToCSV(filename, title, table) {

    let CSVFile = new SimpleCSVFile();

    CSVFile.title = title;

    CSVFile.headings = ['type, threshold, fallback'];

    Object.getOwnPropertyNames(table).forEach((property) => {
        let thisRow = [property,
            table[property].threshold,
            table[property].fallback];
        CSVFile.rows.push(thisRow);
    });

    CSVFile.WriteFile(filename);
}

function ThresholdTableToCSV(filename, title, table) {

    let CSVFile = new SimpleCSVFile();

    CSVFile.title = title;

    CSVFile.headings = ['amountLevel, threshold'];

    Object.getOwnPropertyNames(table).forEach((property) => {
        let thisRow = [property,
            table[property]];
        CSVFile.rows.push(thisRow);
    });

    CSVFile.WriteFile(filename);
}

function ReelSetsToCSV(filename, title, table) {
    let CSVFile = new SimpleCSVFile();

    CSVFile.title = title;

    CSVFile.headings = ['reelset, reel, reelSymbols'];

    table.forEach((set, setIndex) => {
        set.forEach((reel, reelIndex) => {
            let thisRow = [setIndex, reelIndex];
            reel.forEach((symbol) => {
                thisRow.push(symbol);
            });
            CSVFile.rows.push(thisRow);
        });
    });

    CSVFile.WriteFile(filename);
}

function ReelsetDistributionTableToCSV(filename, title, table) {

    let CSVFile = new SimpleCSVFile();

    CSVFile.title = title;

    CSVFile.headings = ['profile, ways, weight, reelset'];

    Object.getOwnPropertyNames(table).forEach((profile) => {
        CSVFile.rows.push([profile]);
        Object.getOwnPropertyNames(table[profile]).forEach((ways) => {
            CSVFile.rows.push(['', ways]);
            const values = table[profile][ways].values;
            const weights = table[profile][ways].weights;
            for (let i = 0; i < values.length; i++) {
                CSVFile.rows.push(['', '', weights[i], values[i]]);
            }
        });
    });

    CSVFile.WriteFile(filename);
}

function SymbolPayloadLookupToCSV(filename, title, table) {
    let CSVFile = new SimpleCSVFile();

    CSVFile.title = title;

    CSVFile.headings = ['symbol, ways'];

    table.forEach((item) => {
        CSVFile.rows.push([item.symbol, item.ways]);
    });

    CSVFile.WriteFile(filename);
}

function BeeWildsFeatureToCSV(filename, title, table) {
    let CSVFile = new SimpleCSVFile();

    CSVFile.title = title;

    CSVFile.headings = ['item', 'weights', 'values'];

    CSVFile.rows.push(['initialWildColumnsDistribution']);

    for (let i = 0; i < table.initialWildColumnsDistribution.values.length; i++) {
        let thisRow = ['', table.initialWildColumnsDistribution.weights[i]];
        table.initialWildColumnsDistribution.values[i].forEach((value) => {
            thisRow.push(value);
        });
        CSVFile.rows.push(thisRow);
    }

    CSVFile.rows.push(['remainingWildsColumns']);
    let thisRow = ['', ''];
    table.remainingWildsColumns.forEach((value) => {
        thisRow.push(value);
    });
    CSVFile.rows.push(thisRow);
    CSVFile.WriteFile(filename);
}


function InstantPrizeCoinsConfigToCSV(filename, title, table) {
    let CSVFile = new SimpleCSVFile();

    CSVFile.title = title;

    //Variant row heading here...

    //availableColumns
    let thisRow = ['availableColumns'];
    table.availableColumns.forEach((value) => {
        thisRow.push(value);
    });
    CSVFile.rows.push(thisRow);
    CSVFile.rows.push([]);
    CSVFile.rows.push(['betMultipliersDistributions', 'weight', 'value']);
    table.betMultipliersDistributions.forEach((distribution) => {
        CSVFile.rows.push([]);
        for (let i = 0; i < distribution.values.length; i++) {
            CSVFile.rows.push(['', distribution.weights[i], distribution.values[i]]);
        }
    });

    const profileIDs=['baseGameProfiles', 'bonusGameProfiles'];
    CSVFile.rows.push(['profile', 'item', 'values']);
    profileIDs.forEach((profile) => {
        CSVFile.rows.push([]);
        CSVFile.rows.push([profile]);
        table[profile].forEach((data) => {
            CSVFile.rows.push([]);
            let thisRow = ['','fixedBetMultipliers'];
            data.fixedBetMultipliers.forEach((value) => {
                thisRow.push(value);
            });
            CSVFile.rows.push(thisRow);
            thisRow = ['','randomBetMultiplierDistributionsIndices', 'values'];
            data.randomBetMultiplierDistributionsIndices.forEach((value) => {
                thisRow.push(value);
            });            
            CSVFile.rows.push(thisRow);
            CSVFile.rows.push(['','threshhold',data.threshold]);
            CSVFile.rows.push(['','fallbackDistributionIndex',data.fallbackDistributionIndex]);            
        });
    });

    CSVFile.WriteFile(filename);
}

function FeaturesDistributionToCSV(filename, title, table) {
    let CSVFile = new SimpleCSVFile();

    CSVFile.title = title;

    CSVFile.headings = ['profile', 'ways', 'weight', 'featuretype', 'payload_value', 'payload_symbol', 'payload_oak', 'payload_waysAmount'];

    //Go through profiles

    Object.getOwnPropertyNames(table).forEach((profile) => {
        CSVFile.rows.push([profile]);

        //Go through ways

        Object.getOwnPropertyNames(table[profile]).forEach((ways) => {
            CSVFile.rows.push(['', ways]);

            //Go through values

            const data = table[profile][ways];
            for(let i = 0; i < data.values.length; i++) {
                let thisRow = ['','',data.weights[i], data.values[i].featureType];
                const payload = data.values[i].payload;
                if(payload !== undefined) {
                    if(typeof(payload) === 'number') {
                        thisRow.push(payload);
                    } else {
                        thisRow.push('');
                        thisRow.push(payload.symbol);
                        thisRow.push(payload.oak);
                        thisRow.push(payload.waysAmount);
                    }
                }
                CSVFile.rows.push(thisRow);
            }
        });
    });

    CSVFile.WriteFile(filename);
}


//Export the maths (both standard and ante)

const toRead_Values = [
    'coinsPerBet_main',
    'coinsPerBet_ante',
    'coinsPerBet_bonusBuy',
    'coinsPerBet_coinBonusBuy',
    'maxWinMultiplier',
    'scattersTriggeringBonusAmount',
    'bonusGameFreeSpinsAmount',
];

const toRead_ValuesNumberArrays = [
    'baseGameInitialReelLengths',
    'bonusGameInitialReelLengths',
    'maxExpandedReelLengths',
];

const toRead_Paytables = [
    'payTable',
    'bookPayTable'
];

const toRead_WeightedTablesNumbersOrString = [
    'bonusBuyCoinInitialReelLengthsDistribution',
    'baseGameProfilesDistribution',
    'bonusGameProfilesDistribution',
    'bonusBuyGameProfilesDistribution',
];


const toRead_WeightedTablesFeatureTypePayload = [
    'bonusBuyCoinGameProfileDistribution'
];

const toRead_Fallbacks = [
    'baseGameProfileFallbacks',
    'bonusGameProfileFallbacks',
];

const toRead_Thresholds = [
    'waysAmountLevelThresholds'
];

const toRead_ReelSetDistribution = [
    'baseGameReelSetsDistributions',
    'bonusGameReelSetsDistributions'
];

const toRead_SymbolPayloadLookup = [
    'replaceSymbolPayloadLookup'
];

const toRead_beeWildsFeatureConfig = [
    'beeWildsFeatureConfig'
];

const toRead_instantPrizeCoinsConfig = [
    'instantPrizeCoinsConfig'
];

const toRead_FeaturesDistribution = [
    'baseGameFeaturesDistributions',
    'bonusGameFeaturesDistributions',
];

let configs = [{ config: standardConfig, prefix: 'standard_' }, { config: anteConfig, prefix: 'ante_' }];

configs.forEach((thisConfig) => {

    g_FilenamePrefix = thisConfig.prefix;
    const maths = thisConfig.config;

    //Make CSVs of some tables

    ReportConstants(MakeFilename('constants.csv'), toRead_Values, toRead_ValuesNumberArrays, maths);
    ReelSetsToCSV(MakeFilename('reels.csv'), 'reels', maths.reelSets);

    toRead_WeightedTablesFeatureTypePayload.forEach((table) => {
        WeightedTableToCSV_FeatureTypePayload(MakeFilename(table + '.csv'), table, maths[table]);
    });

    toRead_WeightedTablesNumbersOrString.forEach((table) => {
        WeightedTableToCSV_NumbersOrString(MakeFilename(table + '.csv'), table, maths[table]);
    });

    toRead_Thresholds.forEach((table) => {
        ThresholdTableToCSV(MakeFilename(table + '.csv'), table, maths[table]);
    });

    toRead_Paytables.forEach((table) => {
        PayTableToCSV(MakeFilename(table + '.csv'), table, maths[table]);
    });

    toRead_Fallbacks.forEach((table) => {
        FallbackTableToCSV(MakeFilename(table + '.csv'), table, maths[table]);
    });

    toRead_ReelSetDistribution.forEach((table) => {
        ReelsetDistributionTableToCSV(MakeFilename(table + '.csv'), table, maths[table]);
    });

    toRead_SymbolPayloadLookup.forEach((table) => {
        SymbolPayloadLookupToCSV(MakeFilename(table + '.csv'), table, maths[table]);
    });

    toRead_beeWildsFeatureConfig.forEach((table) => {
        BeeWildsFeatureToCSV(MakeFilename(table + '.csv'), table, maths[table]);
    });

    toRead_instantPrizeCoinsConfig.forEach((table) => {
        InstantPrizeCoinsConfigToCSV(MakeFilename(table + '.csv'), table, maths[table]);
    });

    toRead_FeaturesDistribution.forEach((table) => {
        FeaturesDistributionToCSV(MakeFilename(table + '.csv'), table, maths[table]);
    });

});






