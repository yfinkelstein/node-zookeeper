try {
  // as of node 0.6.x, node-waf seems to build to a different directory. grr.
  var NativeZk = require(__dirname + '/../build/Release/zookeeper_native').ZooKeeper;
} catch(e) {
  var NativeZk = require(__dirname + '/../build/default/zookeeper_native').ZooKeeper;
}
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var _ = require('underscore');

// with Node 0.5.x and greater, EventEmitter is pure-js, so we have to make a simple wrapper...
// Partly inspired by https://github.com/bnoordhuis/node-event-emitter

////////////////////////////////////////////////////////////////////////////////
// Constructor
////////////////////////////////////////////////////////////////////////////////

module.exports = ZooKeeper;
function ZooKeeper() {
  var self = this;
  self._native = new NativeZk();
  self._native.emit = function(ev, a1, a2, a3) {
    if(this.logger) this.logger("Emitting '" + ev + "' with args: " + a1 + ", " + a2 + ", " + a3);
    if(typeof a1 === 'ZooKeeper') {
      // callback returns the object.  need to mangle this to return the wrapper instead
      a1 = this;
    }
    self.emit(ev, a1, a2, a3);
  }
}

util.inherits(ZooKeeper, EventEmitter);

exports = module.exports = ZooKeeper;
module.exports.ZooKeeper = ZooKeeper; // for compatibility

////////////////////////////////////////////////////////////////////////////////
// Constants
////////////////////////////////////////////////////////////////////////////////

// Other Stuff
exports.ZOK             = NativeZk.ZOK;
exports.ZOO_EPHEMERAL   = NativeZk.ZOO_EPHEMERAL;
exports.ZOO_SEQUENCE    = NativeZk.ZOO_SEQUENCE;

// Permissions
exports.ZOO_PERM_ADMIN  = NativeZk.ZOO_PERM_ADMIN;
exports.ZOO_PERM_ALL    = NativeZk.ZOO_PERM_ALL;
exports.ZOO_PERM_CREATE = NativeZk.ZOO_PERM_CREATE;
exports.ZOO_PERM_DELETE = NativeZk.ZOO_PERM_DELETE;
exports.ZOO_PERM_READ   = NativeZk.ZOO_PERM_READ;
exports.ZOO_PERM_WRITE  = NativeZk.ZOO_PERM_WRITE;

// Log Levels
exports.ZOO_LOG_LEVEL_ERROR  = NativeZk.ZOO_LOG_LEVEL_ERROR;
exports.ZOO_LOG_LEVEL_WARN   = NativeZk.ZOO_LOG_LEVEL_WARN;
exports.ZOO_LOG_LEVEL_INFO   = NativeZk.ZOO_LOG_LEVEL_INFO;
exports.ZOO_LOG_LEVEL_DEBUG  = NativeZk.ZOO_LOG_LEVEL_DEBUG;
exports.ZOO_LOG_LEVEL_ERROR  = NativeZk.ZOO_LOG_LEVEL_ERROR;

////////////////////////////////////////////////////////////////////////////////
// Methods
////////////////////////////////////////////////////////////////////////////////

ZooKeeper.prototype.setLogger = function(logger) {
  if(logger === true) {
    this.logger = function logger(str) {
      console.log("ZOOKEEPER_LOG: " + str);
    }
  } else if(logger === false) {
    this.logger = undefined;
  } else if(_.isFunction(logger)) {
    this.logger = logger;
  } else {
    throw new Error("InvalidArgument: logger must be a function or true/false to utilize default logger");
  }
}

ZooKeeper.prototype.init = function init() {
  if(this.logger) this.logger("Calling init with " + util.inspect(arguments));
  return this._native.init.apply(this._native, arguments);
}

ZooKeeper.prototype.close = function close() {
  if(this.logger) this.logger("Calling close with " + util.inspect(arguments));
  return this._native.close.apply(this._native, arguments);
}

ZooKeeper.prototype.a_create = function a_create() {
  if(this.logger) this.logger("Calling a_create with " + util.inspect(arguments));
  return this._native.a_create.apply(this._native, arguments);
}

ZooKeeper.prototype.a_exists = function a_exists() {
  if(this.logger) this.logger("Calling a_exists with " + util.inspect(arguments));
  return this._native.a_exists.apply(this._native, arguments);
}

ZooKeeper.prototype.aw_exists = function aw_exists() {
  if(this.logger) this.logger("Calling aw_exists with " + util.inspect(arguments));
  return this._native.aw_exists.apply(this._native, arguments);
}

ZooKeeper.prototype.a_get = function a_get() {
  if(this.logger) this.logger("Calling a_get with " + util.inspect(arguments));
  return this._native.a_get.apply(this._native, arguments);
}

ZooKeeper.prototype.aw_get = function aw_get() {
  if(this.logger) this.logger("Calling aw_get with " + util.inspect(arguments));
  return this._native.aw_get.apply(this._native, arguments);
}

ZooKeeper.prototype.a_get_children = function a_get_children() {
  if(this.logger) this.logger("Calling a_get_children with " + util.inspect(arguments));
  return this._native.a_get_children.apply(this._native, arguments);
}

ZooKeeper.prototype.aw_get_children = function aw_get_children() {
  if(this.logger) this.logger("Calling aw_get_children with " + util.inspect(arguments));
  return this._native.aw_get_children.apply(this._native, arguments);
}

ZooKeeper.prototype.a_get_children2 = function a_get_children2() {
  if(this.logger) this.logger("Calling a_get_children with " + util.inspect(arguments));
  return this._native.a_get_children2.apply(this._native, arguments);
}

ZooKeeper.prototype.aw_get_children2 = function aw_get_children2() {
  if(this.logger) this.logger("Calling aw_get_children with " + util.inspect(arguments));
  return this._native.aw_get_children2.apply(this._native, arguments);
}

ZooKeeper.prototype.a_set = function a_set() {
  if(this.logger) this.logger("Calling a_set with " + util.inspect(arguments));
  return this._native.a_set.apply(this._native, arguments);
}

ZooKeeper.prototype.a_delete_ = function a_delete_() {
  if(this.logger) this.logger("Calling a_delete_ with " + util.inspect(arguments));
  return this._native.a_delete_.apply(this._native, arguments);
}

