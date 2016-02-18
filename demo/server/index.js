'use strict';
const WAVE_TYPES = ['delta', 'theta', 'lowAlpha','highAlpha', 'lowBeta', 'highBeta', 'lowGamma', 'midGamma'];

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
    WAVE_TYPES.forEach((name) => {
        let dataArray = findDataArray(name);
        dataArray.push(data[name]);
    });
    filterAndRenderData();
}

function findDataArray(waveName){
    return window.eegData.find((eeg) => {
        return eeg.name === waveName;
    }).data;
}

function filterAndRenderData() {
    let chartData = [];
    WAVE_TYPES.forEach((name) => {
        let filterName = Object.keys(window.filters).find((filter) => {
            return name.search(filter) !== -1;
        });
        let dataArray = findDataArray(name);
        if (window.filters[filterName]) {
            chartData.push({
                name: name,
                data: dataArray
            });
        }
    });
    window.chart.setData(chartData).render();
}
function createChart() {
    window.filters = {
        'Alpha': true,
        'Beta': true,
        'delta': true,
        'theta': true,
        'Gamma': true,
    };
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
        },
        chart: {
            height: 600
        }
    })
    .cartesian()
    .line(window.eegData)
    .legend(window.eegData)
    .tooltip()
    .render();
}

function toggleWave(type) {
    window.filters[type] = !window.filters[type];
    filterAndRenderData();
}

function createListeners() {
    document.getElementById('alpha').addEventListener('click', toggleWave.bind(this, 'Alpha'));
    document.getElementById('beta').addEventListener('click', toggleWave.bind(this, 'Beta'));
    document.getElementById('delta').addEventListener('click', toggleWave.bind(this, 'delta'));
    document.getElementById('gamma').addEventListener('click', toggleWave.bind(this, 'Gamma'));
    document.getElementById('theta').addEventListener('click', toggleWave.bind(this, 'theta'));
}
document.addEventListener('DOMContentLoaded', startSocket);
document.addEventListener('DOMContentLoaded', createChart);
document.addEventListener('DOMContentLoaded', createListeners);
