const fs = require("fs");
const now = new Date(Date.now());

let tracker = {
};

let priorTracker = fs.readFileSync('./FakeServerSource/buildtracker.json');
if((priorTracker !== null) && (priorTracker !== undefined)) {
    tracker = JSON.parse(priorTracker);
}

tracker.time = now.toUTCString(),

fs.writeFileSync('./FakeServerSource/buildtracker.json',JSON.stringify(tracker));