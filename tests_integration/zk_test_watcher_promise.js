var promise = require("../lib/promise");
var ZK = require("../lib/zk_promise");
var assert = require ('assert');
var util = require('util');
var connect  = (process.argv[2] || 'localhost:2181');


var deferred_watcher_ready = promise.defer();
var deferred_watcher_triggered = promise.defer();

var zk_config = {
  connect:connect, 
  debug_level:ZK.ZOO_LOG_LEVEL_WARN, 
  timeout:20000, 
  host_order_deterministic:false
};

//reader
var zk_r = new ZK ();
zk_r.setLogger(true);
zk_r.init (zk_config);
var context = {};
zk_r.on_connected()
  .then (function (zkk){
    console.log ("reader on_connected: zk=%j", zkk);
    return zkk.create ("/node.js2", "some value", ZK.ZOO_SEQUENCE | ZK.ZOO_EPHEMERAL);
  })
  .addBoth (function (pathOrErrNo) {
    var path;
    if (pathOrErrNo === -110) {
      console.log ("path already exists, so create failed with -110 (this is ok)");
      path = '/node.js2'; 
    } else if (typeof pathOrErrNo === 'string') {
      path = pathOrErrNo;
      console.log ("node created path=%s", path);
    } else {
      throw new Error("ZooKeeper.create returned: " + pathOrErrNo);
    }
    context.path = path;
    return zk_r.w_get (path, function (type, state, path_w) {
      // Note: this is a watcher, and may be called multiple times
      console.log ("watcher for path %s triggered", path_w);
      deferred_watcher_triggered.resolve (path_w);
    });
  })
  .then (function (stat_and_value) { // this is the response from w_get above
    console.log ("get node: stat=%j, value=%j", stat_and_value[0], stat_and_value[1]);
    deferred_watcher_ready.resolve (context.path);
    return deferred_watcher_triggered;
  })
  .then (function () {
    console.log ("zk_reader is finished");
    process.nextTick( function () {
      zk_r.close ();
    });
  });

//writer
var zk_w = new ZK();
zk_w.setLogger(true);
zk_w.init (zk_config);
zk_w.on_connected()
  .then (function (zkk) {
    console.log ("writer on_connected: zk=%j", zkk);
    return deferred_watcher_ready;
  })
  .then(function (watched_path) {
    console.log ("writer is invoking set on path %s", watched_path);
    return zk_w.set (watched_path, "some other value", -1);
  })
  .then (function (stat) {
    console.log ("set node result: stat=%j", stat);
    console.log ("zk_writer is finished");
    process.nextTick (function () {
      zk_w.close ();
    });
  });

