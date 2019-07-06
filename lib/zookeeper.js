const { EventEmitter } = require('events');
const _ = require('lodash');
const path = require('path');
const util = require('util');
const NativeZk = require(__dirname + '/../build/zookeeper.node').ZooKeeper;

const Async = {};
Async.apply = require('async/apply');
Async.waterfall = require('async/waterfall');

class ZooKeeper extends EventEmitter {
    constructor(config) {
        super();

        if(_.isString(config)) {
            config = { connect: config };
        }
        this.config = config;

        this._native = new NativeZk();
        this._native.emit = (ev, a1, a2, a3) => {
            if (this.logger)
                this.logger("Emitting '" + ev + "' with args: " + a1 + ", " + a2 + ", " + a3);
            if (ev === 'connect' || ev === 'close') {
                // the event is passing the native object. need to mangle to return the wrapper
                a1 = this;
            }
            this.emit(ev, a1, a2, a3);
        };

        this.encoding = null;
    }

    setLogger(logger) {
        if(logger === true) {
            this.logger = (str) => {
                console.log("ZOOKEEPER_LOG: " + str);
            };
        } else if(logger === false) {
            this.logger = undefined;
        } else if(_.isFunction(logger)) {
            this.logger = logger;
        } else {
            throw new Error("InvalidArgument: logger must be a function or true/false to utilize default logger");
        }
    }

    init(config) {
        if(_.isString(config)) {
            config = { connect: config };
        }
        if(this.config) {
            config = config ? _.defaults(config, this.config) : this.config;
        }
        if(this.logger) this.logger("Calling init with " + util.inspect(arguments));
        if(! _.isUndefined(config.data_as_buffer)) {
            this.data_as_buffer = config.data_as_buffer;
            if(this.logger) this.logger("Encoding for data output: %s", this.encoding);
        }
        this._native.init.call(this._native, config);

        return this;
    }

    connect(options, cb) {
        if(_.isFunction(options)) {
            cb = options;
            options = null;
        }
        this.init(options);

        const errorHandler = (err) => {
            this.removeListener('error', errorHandler);
            this.removeListener('connect', connectHandler);
            cb(err);
        };

        const connectHandler = () => {
            this.removeListener('error', errorHandler);
            this.removeListener('connect', connectHandler);
            cb(null, this);
        };

        this.on('error', errorHandler);
        this.on('connect', connectHandler);
    }

    close() {
        if(this.logger) this.logger("Calling close with " + util.inspect(arguments));
        return this._native.close.apply(this._native, arguments);
    }

    a_create() {
        if(this.logger) this.logger("Calling a_create with " + util.inspect(arguments));
        return this._native.a_create.apply(this._native, arguments);
    }

    a_exists() {
        if(this.logger) this.logger("Calling a_exists with " + util.inspect(arguments));
        return this._native.a_exists.apply(this._native, arguments);
    }

    aw_exists() {
        if(this.logger) this.logger("Calling aw_exists with " + util.inspect(arguments));
        return this._native.aw_exists.apply(this._native, arguments);
    }

    a_get(path, watch, data_cb) {
        if(this.logger) this.logger("Calling a_get with " + util.inspect(arguments));
        return this._native.a_get.call(this._native, path, watch, (rc, error, stat, data) => {
            if(data && this.encoding) {
                data = data.toString(this.encoding);
            }
            data_cb(rc, error, stat, data);
        });
    }

    aw_get(path, watch_cb, data_cb) {
        if(this.logger) this.logger("Calling aw_get with " + util.inspect(arguments));
        return this._native.aw_get.call(this._native, path, watch_cb, (rc, error, stat, data) => {
            if(data && this.encoding) {
                data = data.toString(this.encoding);
            }
            data_cb(rc, error, stat, data);
        });
    }

    a_get_children() {
        if(this.logger) this.logger("Calling a_get_children with " + util.inspect(arguments));
        return this._native.a_get_children.apply(this._native, arguments);
    }

    aw_get_children() {
        if(this.logger) this.logger("Calling aw_get_children with " + util.inspect(arguments));
        return this._native.aw_get_children.apply(this._native, arguments);
    }

    a_get_children2() {
        if(this.logger) this.logger("Calling a_get_children2 with " + util.inspect(arguments));
        return this._native.a_get_children2.apply(this._native, arguments);
    }

    aw_get_children2() {
        if(this.logger) this.logger("Calling aw_get_children2 with " + util.inspect(arguments));
        return this._native.aw_get_children2.apply(this._native, arguments);
    }

    a_set() {
        if(this.logger) this.logger("Calling a_set with " + util.inspect(arguments));
        return this._native.a_set.apply(this._native, arguments);
    }

    a_delete_() {
        if(this.logger) this.logger("Calling a_delete_ with " + util.inspect(arguments));
        return this._native.a_delete_.apply(this._native, arguments);
    }

    a_get_acl () {
        if(this.logger) this.logger("Calling a_get_acl with " + util.inspect(arguments));
        return this._native.a_get_acl.apply(this._native, arguments);
    }

    a_set_acl () {
        if(this.logger) this.logger("Calling a_set_acl with " + util.inspect(arguments));
        return this._native.a_set_acl.apply(this._native, arguments);
    }

    add_auth() {
        if(this.logger) this.logger("Calling add_auth with " + util.inspect(arguments));
        return this._native.add_auth.apply(this._native, arguments);
    }

    mkdirp(p, cb) {
        if(this.logger) this.logger("Calling mkdirp with " + util.inspect(arguments));
        return mkdirp(this, p, cb);
    }

    a_sync() {
        if(this.logger) this.logger("Calling a_sync " + util.inspect(arguments));
        return this._native.a_sync.apply(this._native, arguments);
    }

    /////////////////////////////////////////////////////////////
    // Getters/Setters
    /////////////////////////////////////////////////////////////
    get state() {
        return this._native.state;
    }

    set state(value) {
        this._native.state = value;
    }

    get timeout() {
        return this._native.timeout;
    }

    set timeout(value) {
        this._native.timeout = value;
    }

    get client_id() {
        return this._native.client_id;
    }

    set client_id(value) {
        this._native.client_id = value;
    }

    get client_password() {
        return this._native.client_password;
    }

    set client_password(value) {
        this._native.client_password = value;
    }

    get is_unrecoverable() {
        return this._native.is_unrecoverable;
    }

    set is_unrecoverable(value) {
        this._native.is_unrecoverable = value;
    }

    setEncoding(value) {
        this.encoding = value;
    }

    // Backwards Compat for 'data_as_buffer' property. Deprecated. Just use setEncoding()
    get data_as_buffer() {
        // If there's an encoding, then data isn't a buffer.
        // If there's no encoding, then data will be a buffer.
        return this.encoding ? false : true;
    }

    set data_as_buffer(data_as_buffer) {
        // If the data is a buffer, then there's no encoding.
        // If the data is NOT a buffer, then the default encoding is 'utf8'.
        this.encoding = ((data_as_buffer == true) ? null : 'utf8');
    }
}

exports = module.exports = ZooKeeper;

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
for(var key in NativeZk) {
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

//
// ZK does not support ./file or /dir/../file
// mkdirp(zookeeperConnection, '/a/deep/path/to/a/file', cb)
//
const mkdirp = (con, p, callback) => {
  p = path.normalize(p);
  var dirs = p.split('/').slice(1); // remove empty string at the start.

  // console.log('dirs', dirs);

  var tasks = [];
  dirs.forEach((dir, i) => {
    var subpath = '/' + dirs.slice(0, i).join('/') + '/' + dir;
    subpath = path.normalize(subpath); // remove extra `/` in first iteration
    tasks.push(Async.apply(create, con, subpath));
  });
  Async.waterfall(tasks, (err, results) => {
    if(err) return callback(err);
    // succeeded!
    return callback(null, true);
  });
};

//
// create(zookeeperConnection, '/some-path', cb)
// if there is a problem:
//    cb(error)
// if the dir was created, or already exists:
//    cb()
//
const create = (con, p, cb) => {
  var data = 'created by zk-mkdir-p'; // just want a dir, so store something
  var flags = 0; // none
  con.a_create(p, data, flags, function(rc, error, zkPath) {
    // already exists, cool.
    if(rc == ZooKeeper.ZNODEEXISTS) {
      return cb();
    }
    if(rc != 0) {
      return cb(new Error('Zookeeper Error: code='+rc+'   '+error));
    }
    // sucessfully created!
    return cb();
  });
};

