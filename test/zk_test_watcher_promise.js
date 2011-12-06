var promise = require("../lib/promise");
var ZK = require("../lib/zk_promise").ZK;
var assert = require ('assert');
var util = require('util');
var connect  = (process.argv[2] || 'localhost:2181');


var deferred_watcher_ready = promise.defer();
var deferred_watcher_triggered = promise.defer();

var zk_config = {connect:connect, debug_level:ZK.ZOO_LOG_LEVEL_WARN, timeout:20000, host_order_deterministic:false};

//reader
var zk_r = new ZK ().init (zk_config);
zk_r.on_connected().
    then (
        function (zkk){
            console.log ("reader on_connected: zk=%j", zkk);
            return zkk.create ("/node.js2", "some value", ZK.ZOO_SEQUENCE | ZK.ZOO_EPHEMERAL);
        }
    ).then (
        function (path) {
            zk_r.context.path = path;
            console.log ("node created path=%s", path);
            return zk_r.w_get (path, 
                function (type, state, path_w) { // this is a watcher
                    console.log ("watcher for path %s triggered", path_w);
                    deferred_watcher_triggered.resolve (path_w);
                }
            );
        }
    ).then (
        function (stat_and_value) { // this is the response from w_get above
            console.log ("get node: stat=%j, value=%j", stat_and_value[0], stat_and_value[1]);
            deferred_watcher_ready.resolve (zk_r.context.path);
            return deferred_watcher_triggered;
        }
    ).then (
        function () {
            console.log ("zk_reader is finished");
            process.nextTick( function () {
                zk_r.close ();
            });
        }
    );

//writer
var zk_w = new ZK().init (zk_config);
zk_w.on_connected().
    then (
        function (zkk) {
            console.log ("writer on_connected: zk=%j", zkk);
            return deferred_watcher_ready;
        }
    ).then(
        function (watched_path){
            console.log ("writer is invoking set on path %s", watched_path);
            return zk_w.set (watched_path, "some other value", -1);
        }
    ).then (
        function (stat) {
            console.log ("set node result: stat=%j", stat);
            console.log ("zk_writer is finished");
            process.nextTick ( 
                function () {
                    zk_w.close ();
                }
            );
        }
    );

