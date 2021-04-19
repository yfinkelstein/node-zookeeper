/* eslint-disable no-console */
const net = require('net');

const HOST = '127.0.0.1';
const PORT = 2181;

net.createServer((sock) => {
    console.log(`CONNECTED: ${sock.remoteAddress}:${sock.remotePort}`);

    sock.on('data', (data) => {
        console.log(`DATA ${sock.remoteAddress}: ${data}`);
        setInterval(() => {
            sock.write(`You said "${data}"`);
        }, 3000);
    });

    sock.on('close', (data) => {
        console.log(`CLOSED: ${sock.remoteAddress} ${sock.remotePort}. Data: ${data}`);
    });
}).listen(PORT, HOST);

console.log(`Server listening on ${HOST}:${PORT}`);
