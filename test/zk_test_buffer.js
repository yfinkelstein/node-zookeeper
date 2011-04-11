require.paths.unshift('./build/default', '../build/default');
var ZK     = require('zookeeper').ZooKeeper,
    Buffer = require('buffer').Buffer,
    exec   = require('child_process').exec;

var zk = new ZK();
var connect  = (process.argv[2] || 'localhost:2181');
var err = false;

zk.init({connect:connect, timeout:200000, debug_level:ZK.ZOO_LOG_LEVEL_WARN, host_order_deterministic:false, data_as_buffer:false});
zk.on(ZK.on_connected, function (zkk) {
    console.log('zk session established, id=%s', zkk.client_id);
    var b = new Buffer('\u00bd + \u00bc = \u00be');
    var b2 = new Buffer('\u00bd + \u00bc = \u00be :: \u00bd + \u00bc = \u00be');

    function phase2() {
        zk.data_as_buffer = true;
        zkk.a_create('/node.js1', b, ZK.ZOO_SEQUENCE | ZK.ZOO_EPHEMERAL, function(rc, error, path) {
            // console.log(require('sys').inspect(zkk));
            if (rc != 0) {
                console.log("zk node create result: %d, error: '%s', path=%s", rc, error, path);
            } else {
                // now get it
                zkk.a_get(path, false, function(rc, error, stat, value) { // response
                    zkk.a_set(path, b2, 0, function(rc2, error2, stat2) { // response
                        zkk.a_get(path, false, function(rc3, error3, stat3, value3) { // response
                            if( Buffer.isBuffer(value3) === false ) {
                                console.log('ERROR (p2) value3 is not a Buffer, is: ' + (typeof(value3)));
                                console.log(require('sys').inspect(value3));
                                err = true;
                            }
                            if( err == false ) {
                                console.log('passed');
                            }
                            process.exit(0);
                        });
                    })
                });
            }
        });
    }

    zkk.a_create('/node.js1', b, ZK.ZOO_SEQUENCE | ZK.ZOO_EPHEMERAL, function(rc, error, path) {
        console.log(require('sys').inspect(zkk));
        if (rc != 0) {
            console.log("zk node create result: %d, error: '%s', path=%s", rc, error, path);
        } else {
            // now get it
            zkk.a_get(path, false, function(rc, error, stat, value) { // response
                zkk.a_set(path, b2, 0, function(rc2, error2, stat2) { // response
                    zkk.a_get(path, false, function(rc3, error3, stat3, value3) { // response
                        if( Buffer.isBuffer(value3) ) {
                            console.log('ERROR (p1) value3 should be a Buffer, is: ' + (typeof(value3)));
                            console.log(require('sys').inspect(value3));
                            err = true;
                        }
                        setTimeout(phase2, 1);
                    });
                })
            });
        }
    });
});
