var assert = require ('assert');
var sys = require ('sys');
var promise = require("zookeeper/promise");
var ZK = require ("zookeeper").ZooKeeper;
exports.ZK = ZK; 

ZK.prototype.context = {};

ZK.prototype.on_connected = function () {
	var deferred = promise.defer();
	this.on (ZK.on_connected, function (zkk) {
		deferred.resolve (zkk);
	});
	return deferred.promise;
};


convertZKAsyncFunction = function(asyncFunction){
	return function(){
	    var deferred = promise.defer();
	    arguments.length ++;
	    arguments[arguments.length-1]= 
	    	function(rc, error, result){
				if(rc) {
					deferred.emitError(rc);
				} else {
					if(arguments.length > 3){
					  // if there are multiple success values, we return an array
					  Array.prototype.shift.call(arguments, 1);
					  Array.prototype.shift.call(arguments, 1);
					  deferred.emitSuccess(arguments);
					}
					else{
					  deferred.emitSuccess(result);
					}
				}
	    	};
	    asyncFunction.apply (this, arguments);
	    return deferred.promise;
	};
};

for (var f in ZK.prototype) {
	  var m = f.match(/^a(w?)_(.*)$/);
	  if (m) {
		  var new_func = m[1]? m[1] + "_" + m[2] : m[2];
		  ZK.prototype[new_func] = convertZKAsyncFunction (ZK.prototype[f]);
		  //console.log ("function %s is %j", f, sys.inspect(ZK.prototype[new_func],true,3));
	  }
}
