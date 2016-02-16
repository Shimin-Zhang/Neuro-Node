'use strict';
const MindwaveMobile = require('../../lib/mindwave-mobile');

let mind = new MindwaveMobile();
mind.open();
mind.events.on('data', function (data) {
    console.log(data);
});
mind.events.on('error', function (error) {
    console.log(error);
});
