var ZK = require ('../lib/zookeeper');
var assert = require('assert');
var log4js = require('log4js');

// 
// based on node-leader
// https://github.com/mcavage/node-leader
// callback(error, zookeeperConnection)
// 
function startZK(options, callback) {
  if(typeof(options) !== 'object')
    throw new TypeError('options (Object) required');
  if(typeof(options.zookeeper) !== 'string')
    throw new TypeError('options.zookeeper (String) required');
  if(typeof(options.log4js) !== 'object')
    throw new TypeError('options.log4js (Object) required');
  if(options.timeout && typeof(options.timeout) !== 'number')
    throw new TypeError('options.timeout (Number) required');
  if(typeof(callback) !== 'function')
    throw new TypeError('callback (Function) required');

  var log = options.log4js.getLogger('Election');
  var zkLogLevel = ZK.ZOO_LOG_LEVEL_WARNING;

  if(log.isTraceEnabled())
    zkLogLevel = ZK.ZOO_LOG_LEVEL_DEBUG;

  var zk = new ZK({
    connect: options.zookeeper,
    timeout: options.timeout || 1000,
    debug_level: zkLogLevel,
    host_order_deterministic: false
  });

  log.debug('connecting to zookeeper');
  return zk.connect(function(err) {
    if(err)
      return callback(err);

    log.debug('connected to zookeeper.');
    return callback && callback(null, zk);
  });
}

if (require.main === module) {
  var options = {
    zookeeper: 'localhost:2181',
    log4js: log4js
  };

  var PATH = '/mkdirp/test/path/of/death/n/destruction';
  var con = null;
  startZK(options, function(err, connection) {
    if(err) return console.log(err);
    con = connection;
    return con.mkdirp(PATH, onMkdir);
  });
  function onMkdir(err, win) {
    assert.ifError(err);

    // make sure the path now exists :)
    con.a_exists(PATH, null, function(rc, error, stat) {
      if(rc != 0) {
        throw new Error('Zookeeper Error: code='+rc+'   '+error);
      }
      // path already exists, do nothing :)
      assert.ok(stat);
      console.log('TEST PASSED!', __filename);
      process.exit(0);
      // can't delete the path we just made, b/c haven't written rm -rf :)
    });
  }
}
