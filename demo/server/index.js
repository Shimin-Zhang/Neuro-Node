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
        }
        let data = JSON.parse(message.data);
        Object.keys(data).forEach((key) => {
        });
        if (data.eegValues) {
            updateChartData(data.eegValues);
        }
    };
}
function updateChartData(data) {
    ['delta', 'theta', 'lowAlpha','highAlpha', 'lowBeta', 'highBeta', 'lowGamma', 'midGamma'].forEach((name) => {
        let dataArray = window.eegData.find((eeg) => {
            return eeg.name === name;
        }).data;
        dataArray.push(data[name]);
    });
    window.chart.setData(window.eegData).render();
}
function createChart() {
        window.eegData = [
            {name: 'delta', data: []},
            {name: 'theta', data: []},
            {name: 'lowAlpha', data: []},
            {name: 'highAlpha', data: []},
            {name: 'lowBeta', data: []},
            {name: 'highBeta', data: []},
            {name: 'lowGamma', data: []},
            {name: 'midGamma', data: []},
        ];
        window.chart = new Contour({
                el: '.line-chart',
                xAxis: {
                    type: 'linear'
                },
                yAxis: {
                    title: 'value'
                },
                legend: {
                    vAlign: 'top',
                    hAlign: 'left'
                }
            })
            .cartesian()
            .line(window.eegData)
            .legend(window.eegData)
            .tooltip()
            .render();
}
document.addEventListener('DOMContentLoaded', startSocket);
document.addEventListener('DOMContentLoaded', createChart);
