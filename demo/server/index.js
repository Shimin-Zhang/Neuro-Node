'use strict';
function startSocket() {
    const websocketEndpoint = 'ws://localhost:8080';
    const protocal = 'echo-protocol';
    let connection = new WebSocket(websocketEndpoint, protocal);
    connection.onmessage = function (message) {
        let mapping = {
            'signalQuality': 'signal',
            'heartRate': 'heart-rate',
            'attention': 'attention',
            'meditation': 'meditation',
            'raw8': '',
            'asicEEG': 'asic-eeg'
        }
        let data = JSON.parse(message.data);
        console.log(message);
        Object.keys(data).forEach((key) => {
            if (mapping[key]) {
                const id = mapping[key];
                document.querySelector('#' + id).innerHTML = data[key];
            }
        });
    };
}

document.addEventListener('DOMContentLoaded', startSocket);
