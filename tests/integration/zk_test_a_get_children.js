var { constants, ZooKeeper: ZK } = require("../../lib/index"),
    Buffer = require('buffer').Buffer,
    exec = require('child_process').exec;

var zk = new ZK();
var connect = (process.argv[2] || 'localhost:2181');
var err = false;

var tests = 0;
var sum = 0;
function done(v) {
    sum += v;
    if (--tests == 0) {
        process.exit(sum);
    }
}

zk.init({ connect: connect, timeout: 5000, debug_level: constants.ZOO_LOG_LEVEL_WARN, host_order_deterministic: false, data_as_buffer: false });
zk.on(constants.on_connected, function (zkk) {
    console.log('zk session established, id=%s', zkk.client_id);
    var b = Buffer.from('\u00bd + \u00bc = \u00be');

    (function testExisting() {
        ++tests;
        zk.data_as_buffer = true;
        zkk.a_create('/zk_test_a_get_children.js1', b, constants.ZOO_SEQUENCE, function (rc, error, path) {
            // console.log(util.inspect(zkk));
            if (rc != 0) {
                console.log("ERROR zk node1 create result: %d, error: '%s', path=%s", rc, error, path);
                zkk.a_delete_(path, 0, function (rcd, errord) { done(rc); });
                return;
            }
            zkk.a_create(path + '/child', b, constants.ZOO_SEQUENCE | constants.ZOO_EPHEMERAL, function (rc2, error2, path2) {
                if (rc2 != 0) {
                    console.log("ERROR zk node1c create result: %d, error: '%s', path=%s", rc2, error2, path2);
                    zkk.a_delete_(path, 0, function (rcd, errord) { done(r2); });
                    return;
                }
                // list children
                zkk.a_get_children(path, false, function (rc3, error3, children) {
                    if (rc3 != 0) {
                        console.log("ERROR zk node1.a_get_children: %d, error: '%s'", rc3, error3);
                    } else if (children == null || children.length != 1) {
                        console.log("ERROR zk node1.a_get_children: unexpected child state %s", JSON.stringify(children));
                    } else {
                        console.log("zk node1.a_get_children SUCCESS");
                    }
                    zkk.a_delete_(path2, 0, function (rcd, errord) {
                        zkk.a_delete_(path, 0, function (rcd, errord) { done(rc3); });
                    });
                });
            });
        });
    })();

    (function testEmpty() {
        ++tests;
        zk.data_as_buffer = true;
        zkk.a_create('/zk_test_a_get_children.js2', b, constants.ZOO_SEQUENCE, function (rc, error, path) {
            if (rc != 0) {
                console.log("ERROR zk node2 create result: %d, error: '%s', path=%s", rc, error, path);
                zkk.a_delete_(path, 0, function (rcd, errord) { done(rc); });
                return;
            }
            // list children
            zkk.a_get_children(path, false, function (rc3, error3, children) {
                if (rc3 != 0) {
                    console.log("ERROR zk node2.a_get_children: %d, error: '%s'", rc3, error3);
                } else if (children == null || children.length != 0) {
                    console.log("ERROR zk node2.a_get_children: unexpected child state %s", JSON.stringify(children));
                } else {
                    console.log("zk node2.a_get_children SUCCESS");
                }
                zkk.a_delete_(path, 0, function (rcd, errord) { done(rc3); });
            });
        });
    })();

    (function testNotExisting() {
        ++tests;
        zk.data_as_buffer = true;
        zkk.a_get_children("/total_bogus_path_that_should_not_exist", false, function (rc3, error3, children) {
            if (rc3 != 0) {
                console.log("zk node3.a_get_children SUCCESS (got expected error=%d '%s')", rc3, error3);
                if (children != null) {
                    console.log("WARN zk node3.a_get_children: expect null for children array");
                }
            } else {
                console.log("ERROR zk node3.a_get_children should not succeed");
            }
            done(rc3);
        });
    })();
});
