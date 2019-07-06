const promise = require("./promise");
const ZooKeeper = require ("./zookeeper");

class ZooKeeperPromise extends ZooKeeper {}

exports = module.exports = ZooKeeperPromise;
exports.ZK = ZooKeeperPromise; // backwards compatibility

ZooKeeperPromise.prototype.on_connected = function on_connected() {
  var deferred = promise.defer();
  this.once ('connect', () => {
    deferred.resolve(this);
  });
  return deferred.promise;
};

const convertAsync = (fn) => {
  return () => {
    var deferred = promise.defer();
    arguments.length++;
    arguments[arguments.length-1] = (rc, error, result) => {
      if (rc) {
        deferred.emitError(rc);
      } else {
        if (arguments.length > 3) {
          // if there are multiple success values, we return an array
          Array.prototype.shift.call(arguments, 1);
          Array.prototype.shift.call(arguments, 1);
          deferred.emitSuccess(arguments);
        } else {
          deferred.emitSuccess(result);
        }
      }
    };
    fn.apply(this, arguments);
    return deferred.promise;
  };
};

for (var f in ZooKeeperPromise.prototype) {
    var m = f.match(/^a(w?)_(.*)$/);
    if (m) {
        var new_func = m[1]? m[1] + "_" + m[2] : m[2];
        ZooKeeperPromise.prototype[new_func] = convertAsync (ZooKeeperPromise.prototype[f]);
        //console.log ("function %s is %j", f, util.inspect(ZK.prototype[new_func],true,3));
    }
}

