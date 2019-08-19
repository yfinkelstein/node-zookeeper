var path = require('path');
var net = require('net');

var Worker = require('webworker').Worker;

// N-nodes N-sessions connect
if (process.argv.length < 3)
    throw new Error ("must supply number of nodes to create and number of sessions (optionally)");

var N = parseInt (process.argv[2]);
var sessions = parseInt (process.argv[3] || 1);
var connect = (process.argv[4] || 'localhost:2181');

for (var i = 0; i < sessions; i++) {
    var w = new Worker(path.join(__dirname, 'zk_worker.js'));
    w.onmessage = function(worker) {
    return function (m) {
        console.log('Received mesage from worker #%d: %j', worker.index, m);
        if (m.data.done) workerDone (worker, m.data.done);
    };
    }(w);
    w.onerror = function(worker) {
    return function(e) {
        console.log('Received error from worker #%d: %j', worker.index, e);
        workerDone (worker, 0);
    };
    }(w);
    w.index = i;

    w.postMessage({ numnodes:N, your_index:i, connect:connect });
}

var numWorkersFinished = 0;
var totalNodesCreated = 0;

function workerDone (worker, crearedN)  {
    console.log('worker #%d has finished creating %d nodes', worker.index, crearedN);
    totalNodesCreated += crearedN;
    worker.terminate();
    if (++numWorkersFinished >= sessions) {
        console.log('all workers are finished, created total of %d nodes', totalNodesCreated);
        server.close ();
    }
};


// server is started to prevent master from exiting
var server = net.createServer(function(s) {
    console.log ("server created");
});
server.listen(7070);


console.log ("master is listening ...");
