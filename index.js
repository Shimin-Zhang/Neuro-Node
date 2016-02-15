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
const BATTER_LEVEL = 0x01 /* Batter Level */
const POOR_SIGNAL_QUALITY = 0x02 /* Poor signal quality 1 byte */
const HEART_RATE = 0x03 /* Heart Rate 1 byte */
const ATTENTION= 0x04 /* Attention 1 byte */
const MEDITATION = 0x05 /* Meditation 1 byte */
const EIGHT_BIT_RAW = 0x06 /* 8 bit raw value 1 byte */
const RAW_16_BIT_VALUE= 0x80 /* 16 bit raw value signed */
const EEG_POWER = 0x81 /* 32 byte for 8 wave types */
const ASIC_EEG_POWER = 0x83 /* 24 byte for 8 wave types */
const PRINTERVAL = 0x86 /* 2 byte representing miliseonds betwee r peaks */


function parsePayload(payload) {
    let data = {};
    let pos = 0;
    while (pos < payload.length - 1) {
        let cursor = payload[pos];
        switch(cursor) {
            case(BATTER_LEVEL):
                console.log('found battery level', payload[pos + 1])
                data.batteryLevel = payload[pos + 1];
                pos+=2;
                break;
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
                data.attention = payload[pos + 1];
                pos+=2;
                break;
            case(MEDITATION):
                console.log('found meditation', payload[pos + 1])
                data.meditation = payload[pos + 1];
                pos+=2;
                break;
            case(EIGHT_BIT_RAW):
                console.log('found raw data', payload[pos + 1])
                data.raw8 = payload[pos + 1];
                pos+=2;
                break;
            case(RAW_16_BIT_VALUE):
                const raw16 = payload.slice(pos + 1, pos + 3);
                console.log('found signed 8 bit data', raw16)
                data.raw16 = raw16;
                pos+=3;
                break;
            case(EEG_POWER):
                const eegPower = payload.slice(pos + 1, pos + 33);
                console.log('found eeg power', eegPower)
                data.eeg = eegPower;
                pos+=33;
                break;
            case(ASIC_EEG_POWER):
                const asicEEG = payload.slice(pos + 1, pos + 25);
                console.log('found ASIC EEG', asicEEG)
                data.asicEEG = asicEEG;
                pos+=25;
                break;
            case(PRINTERVAL):
                const prInterval = payload.slice(pos + 1, pos + 3);
                console.log('found ASIC EEG', prInterval)
                data.rinterval = prInterval;
                pos+=3;
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
