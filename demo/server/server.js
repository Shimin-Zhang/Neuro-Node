'use strict';
const WebSocketServer = require('websocket').server;
const http = require('http');
const fs = require('fs');
const MindwaveMobile = require('../../lib/mindwave-mobile');

(function startServers() {
    let server = http.createServer(function(request, response) {
       console.log((new Date()) + ' Received request for ' + request.url);
       if (request.url.search('.js') !== -1) {
           response.writeHead(200, { 'Content-Type': 'application/javascript' });
           fs.readFile('./index.js', (err, data) =>{
              const body = data;
              response.write(body)
              response.end();
           });
       } else {
           response.writeHead(200, { 'Content-Type': 'text/HTML' });
           fs.readFile('./index.html', (err, data) =>{
              const body = data;
              response.write(body)
              response.end();
           });
       }
    });
    server.listen(8080, function() {
       console.log((new Date()) + ' Server is listening on port 8080');
    });

    let wsServer = new WebSocketServer({
        httpServer: server,
        autoAcceptConnections: false
    });
    let mindwave;
    wsServer.on('request', function(request) {
        let connection = request.accept('echo-protocol', request.origin);

        if (!mindwave) {
            mindwave = new MindwaveMobile();
            mindwave.open();
        }
        mindwave.events.on('open', () => {
            console.log('mindwave connected on ' + new Date());
        });
        mindwave.events.on('data', function (data) {
            connection.send(JSON.stringify(data));
        });
        connection.on('close', function(reasonCode, description) {
            console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
        });
    });

})();
