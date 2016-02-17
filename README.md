# Neuro-Node, A Library for interacting with Neurosky Headsets.

Neuro-Node is yet another javascript client library that interacts with the Neurosky Mindwave Mobile Headsets via the ThinkGearSerialStream protocol.

The library allows for reading of all EEG data from the headsets as well as sending command bytes for changing output format.

# To Install
    $ npm install neuro-node

# Usage
```javascript
    const Neuro-Node = require('neuro-node');
    let mindwave = new Neuro-Node('/dev/tty.MindWaveMobile-DevA');
    mindwave.open();
```
# Receiving Data
```javascript
    mindwave.events.on('data', function (data) {
        console.log(data);
    });
```

# Error Handling
```javascript
    mindwave.events.on('error', function (error) {
        console.log(error);
    });
```

# Change Data Format
```javascript
    const NORMAL_FFT_57600 = 0x03;
    mindwave.sendCommand(NORMAL_FFT_57600);
```
