var { constants, ZooKeeper: ZK } = require('../../lib/index'),
    Buffer = require('buffer').Buffer,
    exec = require('child_process').exec,
    util = require('util');

var zk = new ZK();
var connect = (process.argv[2] || 'localhost:2181');
var err = false;

zk.connect({
    connect: connect,
    timeout: 5000,
    debug_level: constants.ZOO_LOG_LEVEL_WARN,
    host_order_deterministic: false,
    data_as_buffer: false
}, function (err) {
    if (err) throw err;
    console.log('zk session established, id=%s', zk.client_id);
    var b = Buffer.from('\u00bd + \u00bc = \u00be');
    var b2 = Buffer.from('\u00bd + \u00bc = \u00be :: \u00bd + \u00bc = \u00be');

    function phase2() {
        zk.data_as_buffer = true;
        zk.a_create('/node.js1', b, constants.ZOO_SEQUENCE | constants.ZOO_EPHEMERAL, function (rc, error, path) {
            // console.log(util.inspect(zk));
            if (rc != 0 && rc != -110) {
                console.log("zk node create result: %d, error: '%s', path=%s", rc, error, path);
            } else {
                // now get it
                zk.a_get(path, false, function (rc, error, stat, value) { // response
                    zk.a_set(path, b2, 0, function (rc2, error2, stat2) { // response
                        zk.a_get(path, false, function (rc3, error3, stat3, value3) { // response
                            if (Buffer.isBuffer(value3) === false) {
                                console.log('ERROR (p2) value3 is not a Buffer, is: ' + (typeof (value3)));
                                console.log(util.inspect(value3));
                                err = true;
                            }
                            if (err == false) {
                                console.log('passed');
                            }
                            process.exit(0);
                        });
                    })
                });
            }
        });
    }

    zk.a_create('/node.js1', b, constants.ZOO_SEQUENCE | constants.ZOO_EPHEMERAL, function (rc, error, path) {
        console.log(util.inspect(zk));
        if (rc != 0 && rc != -110) { // -110 means "already created"
            console.log("zk node create result: %d, error: '%s', path=%s", rc, error, path);
        } else {
            console.log("now getting the thing");
            // now get it
            zk.a_get(path, false, function (rc, error, stat, value) { // response
                console.log("get returned, now setting the thing");
                zk.a_set(path, b2, 0, function (rc2, error2, stat2) { // response
                    console.log("set returned, now getting the thing");
                    zk.a_get(path, false, function (rc3, error3, stat3, value3) { // response
                        if (Buffer.isBuffer(value3)) {
                            console.log('ERROR (p1) value3 should be a Buffer, is: ' + (typeof (value3)));
                            console.log(util.inspect(value3));
                            err = true;
                        }
                        setTimeout(phase2, 1);
                    });
                })
            });
        }
    });
});
