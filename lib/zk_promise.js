var assert = require ('assert');
var promise = require("./promise");
var ZooKeeper = require ("./zookeeper");
var util = require('util');

exports = module.exports = ZooKeeperPromise;
exports.ZK = ZooKeeperPromise; // backwards compatibility

function ZooKeeperPromise() {
  var self = this;

  ZooKeeper.apply(this, arguments);

  return self;
}
util.inherits(ZooKeeperPromise, ZooKeeper);

ZooKeeperPromise.prototype.on_connected = function on_connected() {
  var self = this;
  var deferred = promise.defer();
  self.on ('connect', function () {
    deferred.resolve (self);
  });
  return deferred.promise;
};



function convertAsync(fn){
  return function() {
    var self = this;
    var deferred = promise.defer();
    arguments.length ++;
    arguments[arguments.length-1] = function(rc, error, result){
      if(rc) {
        deferred.emitError(rc);
      } else {
        if(arguments.length > 3){
          // if there are multiple success values, we return an array
          Array.prototype.shift.call(arguments, 1);
          Array.prototype.shift.call(arguments, 1);
          deferred.emitSuccess(arguments);
        } else {
          deferred.emitSuccess(result);
        }
      }
    };
    fn.apply (self, arguments);
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

