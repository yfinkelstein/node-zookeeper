var { constants, ZooKeeper: ZK} = require ("../../lib/index"),
    exec = require('child_process').exec;

var zk = new ZK();
var connect  = (process.argv[2] || 'localhost:2181');

zk.init({connect:connect, timeout:200000, debug_level:constants.ZOO_LOG_LEVEL_WARN, host_order_deterministic:false});
zk.on('connect', function (zkk) {
    console.log("zk session established, id=%s", zkk.client_id);
    var str = '\u00bd + \u00bc = \u00be';
    var data = new String(str);
    zkk.a_create("/node.js1", data, constants.ZOO_SEQUENCE | constants.ZOO_EPHEMERAL, function(rc, error, path) {
        // console.log(util.inspect(zkk));
        if (rc != 0) {
            console.log("zk node create result: %d, error: '%s', path=%s", rc, error, path);
        } else {
            // now get it
            zkk.a_get(path, false, function(rc, error, stat, value) { // response
                var vstr = value.toString();
                if( vstr != str ) {
                    console.log('ERROR strings are different: "' + str + '" vs "' + vstr + '"');
                } else {
                    console.log('strings match');
                }
                process.nextTick(function () {
                    zkk.close ();
                });
            });
        }
    });
});
