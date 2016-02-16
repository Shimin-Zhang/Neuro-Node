'use strict';
let SerialPort = require('serialPort').SerialPort;
let spawn = require('child_process').spawn;
let EventEmitter = require('events');

/* constants */
const PARSER_SYNC_BYTE = 0xAA  /* Syncronization byte */

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

/* Command Bytes */
const NORMAL_9600 = 0x00 /* 9600 and normal */
const NORMAL_1200 = 0x01 /* 1200 and normal */
const NORMAL_RAW_57600= 0x02 /* 57600 and raw */
const NORMAL_FFT_57600= 0x03 /* 57600 and FFT */

const DEFAULT_MINDWAVE_PORT = '/dev/tty.MindWaveMobile-DevA';

let MindwaveMobile = module.exports =  function (port) {
    this.port = port || DEFAULT_MINDWAVE_PORT
    this.events = new EventEmitter();
    this.packetReceived = false;
    this.totalBuffer = new Buffer(0);
    this.serialPort = new SerialPort(this.port,
    {
      baudrate: 57600
    });
};

MindwaveMobile.prototype.open = function() {
    this.serialPort.open((error) => {
        const portError = 'cannot open port ' + this.port + ', please make sure your mindwave mobile is turned on and the port name is correct';
        if (error) { throw new Error(portError); }
        else {
            this.serialPort.on('open', () => {
                this.events.emit('opened');
            });
            this.serialPort.on('data', this.handleBuffer.bind(this));
        }
    });
};

MindwaveMobile.prototype.handleBuffer = function(buffer) {
    this.packetReceived = true;
    this.totalBuffer = Buffer.concat([this.totalBuffer, buffer]);
    for (let i = 1; i < this.totalBuffer.length; i++) {
        if (this.totalBuffer[i] === PARSER_SYNC_BYTE && this.totalBuffer[i + 1] && this.totalBuffer[i + 1] === PARSER_SYNC_BYTE) {
            // once we found 2 sync bytes, we cut the rest off and process
            let processBuff = this.totalBuffer.slice(0, i);
            this.totalBuffer = this.totalBuffer.slice(i);
            this.parsePacket(processBuff);
            // we try and parse the rest of the buffers;
            this.handleBuffer(new Buffer(0));
        }
    }
};

MindwaveMobile.prototype.sendCommand = function(command) {
    var commandBuffer = new Buffer([command]);
    if (!this.packetReceived) {
        const packetError = 'cannot send command until first packet of data is received';
        this.events.emit('error', packetError);
        throw new error(packetError);
    } else {
        this.serialPort.write(commandBuffer, (error) => {
            if (error) {
                const commandError = 'cannot send command ' + command + ' to port';
                this.events.emit('error', commandError);
                throw new error(commandError);
            } else {
                this.events.emit('command', command);
            }
        });
    }
};

MindwaveMobile.prototype.parsePacket = function(buffer) {
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
        this.parsePayload(payLoad);
    }
};

MindwaveMobile.prototype.parsePayload = function(payload) {
    let data = {};
    let pos = 0;
    while (pos < payload.length - 1) {
        let cursor = payload[pos];
        switch(cursor) {
            case(BATTER_LEVEL):
                data.batteryLevel = payload[pos + 1];
                pos+=2;
                break;
            case(POOR_SIGNAL_QUALITY):
                data.signalQuality = payload[pos + 1];
                pos+=2;
                break;
            case(HEART_RATE):
                data.heartRate = payload[pos + 1];
                pos+=2;
                break;
            case(ATTENTION):
                data.attention = payload[pos + 1];
                pos+=2;
                break;
            case(MEDITATION):
                data.meditation = payload[pos + 1];
                pos+=2;
                break;
            case(EIGHT_BIT_RAW):
                data.raw8 = payload[pos + 1];
                pos+=2;
                break;
            case(RAW_16_BIT_VALUE):
                const raw16 = payload.slice(pos + 1, pos + 3);
                data.raw16 = raw16;
                pos+=3;
                break;
            case(EEG_POWER):
                const eegPower = payload.slice(pos + 1, pos + 33);
                data.eeg = eegPower;
                pos+=33;
                break;
            case(ASIC_EEG_POWER):
                const asicEEG = payload.slice(pos + 1, pos + 25);
                data.asicEEG = asicEEG;
                pos+=25;
                break;
            case(PRINTERVAL):
                const prInterval = payload.slice(pos + 1, pos + 3);
                data.rinterval = prInterval;
                pos+=3;
                break;
            default:
                pos+=1;
                break;
        }
    }
    this.events.emit('data', data);
};
