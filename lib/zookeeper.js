var EventEmitter = require('events').EventEmitter;
var util = require('util');
var _ = require('underscore');

try {
  // as of node 0.6.x, node-waf seems to build to a different directory. grr.
  var NativeZk = require(__dirname + '/../build/Release/zookeeper_native').ZooKeeper;
} catch(e) {
  var NativeZk = require(__dirname + '/../build/default/zookeeper_native').ZooKeeper;
}

// with Node 0.5.x and greater, EventEmitter is pure-js, so we have to make a simple wrapper...
// Partly inspired by https://github.com/bnoordhuis/node-event-emitter

////////////////////////////////////////////////////////////////////////////////
// Constructor
////////////////////////////////////////////////////////////////////////////////

exports = module.exports = ZooKeeper;
function ZooKeeper(config) {
  var self = this;
  if(_.isString(config)) {
    config = { connect: config };
  }
  self.config = config;
  self._native = new NativeZk();
  self._native.emit = function(ev, a1, a2, a3) {
    if(self.logger) self.logger("Emitting '" + ev + "' with args: " + a1 + ", " + a2 + ", " + a3);
    if(ev === 'connect') {
      // the event is passing the native object.  need to mangle this to return the wrapper instead
      a1 = self;
    }
    self.emit(ev, a1, a2, a3);
  }

  ////////////////////////////////////////////////////////////////////////////////
  // Public Properties
  ////////////////////////////////////////////////////////////////////////////////

  function proxyProperty(name) {
    self.__defineGetter__(name, function(){
      return self._native[name];
    });
    self.__defineSetter__(name, function(val){
      self._native[name] = val;
    });
  }

  proxyProperty('state');
  proxyProperty('timeout');
  proxyProperty('client_id');
  proxyProperty('is_unrecoverable');

  self.encoding = null;  // Return 'Buffer' objects by default
  
  self.setEncoding = function setEncoding(val) {
    self.encoding = val;
  };

  // Backwards Compat for 'data_as_buffer' property.  deprecated.  just use setEncoding()
  self.__defineGetter__('data_as_buffer', function(){
    // if there's an encoding, then data isn't a buffer.  If there's no encoding, then data will be a buffer
    return self.encoding ? false : true;
  });
  self.__defineSetter__('data_as_buffer', function(data_as_buffer){
    // if the data is a buffer, then there's no encoding. If the data is NOT a buffer, then the default encoding is 'utf8'
    self.encoding = ((data_as_buffer == true) ? null : 'utf8');
  });

}

util.inherits(ZooKeeper, EventEmitter);



////////////////////////////////////////////////////////////////////////////////
// Constants
////////////////////////////////////////////////////////////////////////////////

// Events (for backwards compatibility.  deprecated.  use the strings directly)
exports.on_closed             = 'close';
exports.on_connected          = 'connect';
exports.on_connecting         = 'connecting';
exports.on_event_created      = 'created';
exports.on_event_deleted      = 'deleted';
exports.on_event_changed      = 'changed';
exports.on_event_child        = 'child';
exports.on_event_notwatching  = 'notwatching';

// Other Constants
for(key in NativeZk) {
  exports[key] = NativeZk[key];
  // console.log(key + " = " + exports[key]);
}

/* Notable Constants:
Permissions:
 * ZOO_PERM_READ              =  1
 * ZOO_PERM_WRITE             =  2
 * ZOO_PERM_CREATE            =  4
 * ZOO_PERM_DELETE            =  8
 * ZOO_PERM_ADMIN             =  16
 * ZOO_PERM_ALL               =  31

States:
 * ZOO_EXPIRED_SESSION_STATE  =  -112
 * ZOO_AUTH_FAILED_STATE      =  -113
 * ZOO_CONNECTING_STATE       =  1
 * ZOO_ASSOCIATING_STATE      =  2
 * ZOO_CONNECTED_STATE        =  3

Log Levels:
 * ZOO_LOG_LEVEL_ERROR        =  1
 * ZOO_LOG_LEVEL_WARN         =  2
 * ZOO_LOG_LEVEL_INFO         =  3
 * ZOO_LOG_LEVEL_DEBUG        =  4

API Responses:
 * ZOK                        =  0
 * ZSYSTEMERROR               =  -1
 * ZRUNTIMEINCONSISTENCY      =  -2
 * ZDATAINCONSISTENCY         =  -3
 * ZCONNECTIONLOSS            =  -4
 * ZMARSHALLINGERROR          =  -5
 * ZUNIMPLEMENTED             =  -6
 * ZOPERATIONTIMEOUT          =  -7
 * ZBADARGUMENTS              =  -8
 * ZINVALIDSTATE              =  -9
 * ZAPIERROR                  =  -100
 * ZNONODE                    =  -101
 * ZNOAUTH                    =  -102
 * ZBADVERSION                =  -103
 * ZNOCHILDRENFOREPHEMERALS   =  -108
 * ZNODEEXISTS                =  -110
 * ZNOTEMPTY                  =  -111
 * ZSESSIONEXPIRED            =  -112
 * ZINVALIDCALLBACK           =  -113
 * ZINVALIDACL                =  -114
 * ZAUTHFAILED                =  -115
 * ZCLOSING                   =  -116
 * ZNOTHING                   =  -117
 * ZSESSIONMOVED              =  -118

Dunno:
 * ZOO_EPHEMERAL              =  1
 * ZOO_SEQUENCE               =  2

*/

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

ZooKeeper.prototype.init = function init(config) {
  var self = this;
  if(_.isString(config)) {
    config = { connect: config };
  }
  if(self.config) {
    config = config ? _.defaults(config, self.config) : self.config;
  }
  if(this.logger) this.logger("Calling init with " + util.inspect(arguments));
  if(! _.isUndefined(config.data_as_buffer)) {
    self.data_as_buffer = config.data_as_buffer;
    if(this.logger) this.logger("Encoding for data output: %s", self.encoding);
  }
  this._native.init.call(this._native, config);
  
  // The native code returns a ref to itself.  So we should return a ref to the wrapper object
  return self;  
}

ZooKeeper.prototype.connect = function connect(options, cb) {
  var self = this;
  if(_.isFunction(options)) {
    cb = options;
    options = null;
  }
  self.init(options);
  
  function errorHandler(err) {
    self.removeListener('error', errorHandler);
    self.removeListener('connect', connectHandler);
    cb(err);
  }
  
  function connectHandler() {
    self.removeListener('error', errorHandler);
    self.removeListener('connect', connectHandler);
    cb(null, self);
  }

  self.on('error', errorHandler);
  self.on('connect', connectHandler);
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

ZooKeeper.prototype.a_get = function a_get(path, watch, data_cb) {
  var self = this;
  if(this.logger) this.logger("Calling a_get with " + util.inspect(arguments));
  return this._native.a_get.call(this._native, path, watch, function(rc, error, stat, data) {
    if(data && self.encoding) {
      data = data.toString(self.encoding);
    }
    data_cb(rc, error, stat, data);
  });
}

ZooKeeper.prototype.aw_get = function aw_get(path, watch_cb, data_cb) {
  var self = this;
  if(this.logger) this.logger("Calling aw_get with " + util.inspect(arguments));
  return this._native.aw_get.call(this._native, path, watch_cb, function(rc, error, stat, data) {
    if(data && self.encoding) {
      data = data.toString(self.encoding);
    }
    data_cb(rc, error, stat, data);
  });
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

