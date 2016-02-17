'use strict';
const MindwaveMobile = require('../../lib/mindwave-mobile');

let mind = new MindwaveMobile();
mind.open();
mind.events.on('data', function (data) {
    if (Object.keys(data)[0] !== 'signalQuality') {
        console.log(data);
    }
});
mind.events.on('error', function (error) {
    console.log(error);
});
