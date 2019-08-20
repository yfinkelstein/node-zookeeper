// test session expiration as described in zk FAQ
var { constants, ZooKeeper: ZK } = require('../../lib/index');
var assert = require('assert');
var connect  = (process.argv[2] || 'localhost:2181');
var timeout = 5000;

var zk = new ZK({connect: connect, timeout: timeout, debug_level: constants.ZOO_LOG_LEVEL_INFO, host_order_deterministic: false});

var zkClosed = false;
zk.on('close', function() { zkClosed = true;} );

zk.connect(function (err) {
  if(err) throw err;
  assert.equal(zk.client_password.length, 32);

  var zk2 = new ZK({connect: connect, timeout: timeout, debug_level: constants.ZOO_LOG_LEVEL_INFO, host_order_deterministic: false,
             client_id: zk.client_id,client_password: zk.client_password});
  zk2.connect(function (err) {
    if(err) throw err;
    zk2.close();
    zk.a_create ('/test_end_session', 'x', constants.ZOO_SEQUENCE | constants.ZOO_EPHEMERAL, function (rc, error, path)  {
      console.log ("zk node create result: %d, error: '%s', path=%s", rc, error, path);
      assert(rc != 0);
      assert(zkClosed);
    });
  });
});
