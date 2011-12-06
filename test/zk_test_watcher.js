
var assert = require ('assert');
var util = require('util');
var ZK = require ("../lib/zookeeper").ZooKeeper;

if (process.argv.length < 2)
    throw new Error ("must supply number of  sessions (optionally)");

var sessions = parseInt (process.argv[2] || 1);
var connect  = (process.argv[3] || 'localhost:2181');
var sessionsFinished = 0;
//-------------------------------------------------------------------- operations begin ---------------------------------------

function createNode (context, step) {
    context.zk.a_create ("/node.js2", "some value", ZK.ZOO_SEQUENCE | ZK.ZOO_EPHEMERAL, function (rc, error, path) {
        console.log ("node create result: %d, path=%s, error:'%s'", rc, path, error);
        if (rc != 0) {
            throw error;
        }
        context.created_path = path;
        completedStep (context, step);
    });
};
var EVENT_WATCHER_READY = "watch_ready";

function watchNode (context, step) {
    context.zk.aw_get (context.created_path, 
        function (type, state, path) { // this is watcher
            console.log ("get watcher is triggered: type=%d, state=%d, path=%s", type, state, path);
            completedStep (context, step);
        }, 
        function (rc, error, stat, value) {// this is response from aw_get
            console.log ("get node result: %d, error: '%s', stat=%j, value=%s", rc, error, stat, value);
            if (rc != 0) {
                throw error;
            }
            context.zk.emit (EVENT_WATCHER_READY, context.created_path);
        }
    );
};

function setNode (context, step) {
    context.zk.a_set (context.created_path, "some other value", -1, function (rc, error, stat) {
        console.log ("set node result: %d, error: '%s', stat=%j", rc, error, stat);
        if (rc != 0) {
            throw error;
        }
        completedStep (context, step);
    });
};


//====================================

var reader_chain = [createNode, watchNode];
var writer_chain = [setNode];

function startChain (context) {
    context.callChain[0](context, 0);
};
function completedStep (context, step) {
 if (context.callChain.length == step +1) {
        console.log ("session #%d is finished", context.session);
        process.nextTick(function () {
            context.zk.close ();
        });

        if (++sessionsFinished >= sessions) {
            console.log ("all sessions are finished");
        }
 } else
     context.callChain[step+1](context, step+1);
}

var zk_config = {connect:connect, debug_level:ZK.ZOO_LOG_LEVEL_WARN, timeout:20000, host_order_deterministic:false};


var zk_r = new ZK ();
zk_r.init (zk_config);
zk_r.on (ZK.on_connected, function (zkk) {
    console.log ("reader on_connected: zk=%j", zkk);
    startChain ({zk:zkk, session:0, callChain:reader_chain});
});

var zk_w = new ZK();
zk_r.on (EVENT_WATCHER_READY, function (watched_path) {
    zk_w.init (zk_config);
    zk_w.on (ZK.on_connected, function (zkk) {
        console.log ("writer on_connected: zk=%j", zkk);
        startChain ({zk:zkk, session:1, callChain:writer_chain, created_path:watched_path});
    });
});
