var { constants, ZooKeeper: ZK } = require ('../../lib/index');
var assert = require('assert');
var log4js = require('log4js');
var async = require('async');

var connect  = (process.argv[2] || 'localhost:2181');

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

  var log = options.log4js.getLogger('mkdirp-test');
  var zkLogLevel = constants.ZOO_LOG_LEVEL_WARNING;

  if(log.isTraceEnabled())
    zkLogLevel = constants.ZOO_LOG_LEVEL_DEBUG;

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
    zookeeper: connect,
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
      return mkDirpAgain();
    });
  }
  // tests that no errors are thrown if you mkdirp a bunch of dirs that exist
  function mkDirpAgain(err, win) {
    con.mkdirp(PATH, finish);
  }
  function finish(err) {
    assert.ifError(err);
    console.log('TEST PASSED!', __filename);

    var dirs = [
      '/mkdirp/test/path/of/death/n/destruction'
    , '/mkdirp/test/path/of/death/n'
    , '/mkdirp/test/path/of/death'
    , '/mkdirp/test/path/of'
    , '/mkdirp/test/path'
    , '/mkdirp/test'
    , '/mkdirp'
    ];

    // can't easily delete the path, b/c haven't written rm -rf :)
    async.series([
        function (cb) { con.a_delete_(dirs[0], 0, normalizeCb(cb)); }
      , function (cb) { con.a_delete_(dirs[1], 0, normalizeCb(cb)); }
      , function (cb) { con.a_delete_(dirs[2], 0, normalizeCb(cb)); }
      , function (cb) { con.a_delete_(dirs[3], 0, normalizeCb(cb)); }
      , function (cb) { con.a_delete_(dirs[4], 0, normalizeCb(cb)); }
      , function (cb) { con.a_delete_(dirs[5], 0, normalizeCb(cb)); }
      , function (cb) { con.a_delete_(dirs[6], 0, normalizeCb(cb)); }
    ], function(err, results) {
      console.log('Deleted mkdirp`ed dirs: '+results.length+' of '+dirs.length);
      process.exit(0);
    });
  }

  // allows a callback that expects to be called like this:
  //    cb()
  // to instead be called like this:
  //    cb(rc, error)
  // and then have the original callback only be called with an Error, or
  // nothing at all if there was no Error.
  function normalizeCb(callback) {
    return function(rc, error) {
      if(!callback) return;
      if(rc != 0) {
        return callback(new Error('Zookeeper Error: code='+rc+'   '+error));
      }
      return callback(null, true);
    };
  }

}
