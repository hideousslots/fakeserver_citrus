const fs = require("fs");
const now = new Date(Date.now());

const tracker = {
    time: now.toUTCString(),
};

fs.writeFileSync('./FakeServerSource/buildtracker.json',JSON.stringify(tracker));