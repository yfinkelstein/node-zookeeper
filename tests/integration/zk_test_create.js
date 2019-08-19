var { constants, ZooKeeper: ZK } = require ("../../lib/index");

if (process.argv.length < 3)
    throw new Error ("must supply number of nodes to create and number of sessions (optionally)");

var N = parseInt (process.argv[2]);
var sessions = parseInt (process.argv[3] || 1);
var connect  = (process.argv[4] || 'localhost:2181');

function zkTest (seq_, callback) {
    this.zk = new ZK();
    this.zk.init ({connect:connect, timeout:200000, debug_level:constants.ZOO_LOG_LEVEL_INFO, host_order_deterministic:false});
    this.zk.on ('connect', function (zkk, clientid) {
        console.log ("session #%d connected ok", seq_);
        var counter = 0;
        for (var i = 0; i < N; i ++) {
//          process.nextTick(function () {
                zkk.a_create ("/node.js1", "some value", constants.ZOO_SEQUENCE | constants.ZOO_EPHEMERAL, function (rc, error, path)  {
                    if (rc != 0) console.log ("node create result: %d, error: '%s', path=%s", rc, error, path);
                    //console.log ("self=%j",self);
                    if (++counter >= N) {
                        callback (seq_, counter);
                        process.nextTick(function () {
                            zkk.close ();
                        });
                    }
                });
//          });
        }
    });
};

console.log ("starting %s sessions ...", sessions);
var masterCounter = 0;
var sessionsFinished = 0;
sa = [];
for (var s = 0; s < sessions; s++) {
    sa[s] = new zkTest (s, function (seq, counter) {
        console.log ("session #%d reporting %d events", seq, counter);
        masterCounter += counter;   
        if (++sessionsFinished >= sessions) {
            console.log ("done with total of %d nodes inserted", masterCounter);
        }
    });
}



