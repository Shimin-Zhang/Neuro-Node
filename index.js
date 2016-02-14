'use strict';
let SerialPort = require('serialPort').SerialPort;
let spawn = require('child_process').spawn;

let serialPort = new SerialPort('/dev/tty.MindWaveMobile-DevA', {
  baudrate: 57600
});

/* constants */
const PARSER_SYNC_BYTE = 0xAA  /* Syncronization byte */
const PARSER_EXCODE_BYTE = 0x55  /* EXtended CODE level byte */

/* Extend Codes */
const POOR_SIGNAL_QUALITY = 0x02 /* Poor signal quality 1 byte */
const HEART_RATE = 0x03 /* Heart Rate 1 byte */
const ATTENTION= 0x04 /* Attention 1 byte */
const MEDITATION = 0x05 /* Meditation 1 byte */
const EIGHT_BIT_RAW = 0x06 /* 8 bite raw value 1 byte */

function parsePayload(payload) {
    let data = {};
    let pos = 0;
    while (pos < payload.length - 1) {
        let cursor = payload[pos];
        switch(cursor) {
            case(POOR_SIGNAL_QUALITY):
                data.signalQuality = payload[pos + 1];
                pos+=2;
                break;
            case(HEART_RATE):
                console.log('found heart rate', payload[pos + 1])
                data.heartRate = payload[pos + 1];
                pos+=2;
                break;
            case(ATTENTION):
                console.log('found attention', payload[pos + 1])
                data.heartRate = payload[pos + 1];
                pos+=2;
                break;
            case(MEDITATION):
                console.log('found meditation', payload[pos + 1])
                data.heartRate = payload[pos + 1];
                pos+=2;
                break;
            case(EIGHT_BIT_RAW):
                console.log('found raw data', payload[pos + 1])
                data.heartRate = payload[pos + 1];
                pos+=2;
                break;
            default:
                pos+=1;
                break;
        }
    }
}
function parsePacket(buffer) {
    if (buffer.length === 0) {
        return;
    }
    let payLoadLength = buffer[2];
    let sum = 0x00;
    for (let i = 3; i < buffer.length - 1; i++) {
        sum = sum + buffer[i];
    }
    const lastDigit = sum & 0xFF;
    if ((0xFF - lastDigit) === buffer[buffer.length - 1]) {
        let payLoad = buffer.slice(4, buffer.length - 1);
        parsePayload(payLoad);
    }
};

serialPort.open(function(error){
    if (error) { console.log(error); }
    console.log('opened!')
});


serialPort.on('open', function(){
    let totalBuff = new Buffer(0);
    let lastSync = 0;

    function processBuff() {
        syncCheck:
        for (let i = 1; i < totalBuff.length; i++) {
            if (totalBuff[i] === PARSER_SYNC_BYTE && totalBuff[i + 1] && totalBuff[i + 1] === PARSER_SYNC_BYTE) {
                // once we found 2 sync bytes, we cut the rest off and process
                let processBuff = totalBuff.slice(0, i);
                totalBuff = totalBuff.slice(i);
                parsePacket(processBuff);
                break syncCheck;
            }
        }
    }

    serialPort.on('data', function(buffer) {
        totalBuff = Buffer.concat([totalBuff, buffer]);
        processBuff();
    });
})
