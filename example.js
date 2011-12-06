#!/usr/bin/env node

var ZK = require ("./lib/zookeeper");
var zk = new ZK();

var connect  = (process.argv[2] || 'localhost:2181');

zk.init ({connect:connect, timeout:200000, debug_level:ZK.ZOO_LOG_LEVEL_WARN, host_order_deterministic:false});
zk.on ('connect', function (zkk) {
    console.log ("zk session established, id=%s", zkk.client_id);
    zkk.a_create ("/node.js1", "some value", ZK.ZOO_SEQUENCE | ZK.ZOO_EPHEMERAL, function (rc, error, path)  {
        if (rc != 0) 
            console.log ("zk node create result: %d, error: '%s', path=%s", rc, error, path);
        else {
            console.log ("created zk node %s", path);
            process.nextTick(function () {
                zkk.close ();
            });
        }
    });
});
