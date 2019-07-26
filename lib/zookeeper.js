// needed to not break the interface
/* eslint-disable camelcase */
const { apply, waterfall } = require('async');
const { EventEmitter } = require('events');
const _ = require('lodash');
const { normalize } = require('path');
const util = require('util');

const NativeZk = require('./../build/zookeeper.node').ZooKeeper;

const Async = {
    apply,
    waterfall,
};

/**
 * create(zookeeperConnection, '/some-path', cb)
 * if there was a problem:
 *  cb(error)
 * if the dir was created, or already exists:
 *  cb()
 * @param con {ZooKeeper}
 * @param p {string}
 * @param cb {function}
 */
const create = (con, p, cb) => {
    const data = 'created by zk-mkdir-p'; // just want a dir, so store something
    const flags = 0; // none
    con.a_create(p, data, flags, (rc, error) => {
        // already exists.
        if (rc === NativeZk.ZNODEEXISTS) {
            return cb();
        }
        if (rc !== 0) {
            return cb(new Error(`Zookeeper Error: code=${rc}   ${error}`));
        }
        // sucessfully created!
        return cb();
    });
};

/**
 * does not support ./file or /dir/../file
 * @param con {ZooKeeper}
 * @param p {string}
 * @param callback {function}
 */
const mkdirp = (con, p, callback) => {
    const dirs = normalize(p).split('/').slice(1); // remove empty string at the start.

    const tasks = [];
    dirs.forEach((dir, i) => {
        let subpath = `/${dirs.slice(0, i).join('/')}/${dir}`;
        subpath = normalize(subpath); // remove extra `/` in first iteration
        tasks.push(Async.apply(create, con, subpath));
    });
    Async.waterfall(tasks, (err) => {
        if (err) return callback(err);
        // succeeded!
        return callback(null, true);
    });
};

class ZooKeeper extends EventEmitter {
    /** @param config {object|string} */
    constructor(config) {
        super();

        if (_.isString(config)) {
            this.config = { connect: config };
        } else {
            this.config = config;
        }

        this.native = new NativeZk();
        this.native.emit = (ev, a1, a2, a3) => {
            this.log(`Emitting '${ev}' with args: ${a1}, ${a2}, ${a3}`);
            if (ev === 'connect' || ev === 'close') {
                // the event is passing the native object. need to mangle to return the wrapper
                a1 = this; // eslint-disable-line no-param-reassign
            }
            this.emit(ev, a1, a2, a3);
        };

        this.encoding = null;
    }

    /** @param logger {object|boolean} */
    setLogger(logger) {
        if (logger === true) {
            this.logger = (str) => {
                console.info(`ZOOKEEPER_LOG: ${str}`);
            };
        } else if (logger === false) {
            this.logger = undefined;
        } else if (_.isFunction(logger)) {
            this.logger = logger;
        } else {
            throw new Error('InvalidArgument: logger must be a function or true/false to utilize default logger');
        }
    }

    /** @param args {...*} */
    log(...args) {
        if (this.logger) this.logger(...args);
    }

    /**
     * @param config {object|string}
     * @returns {ZooKeeper}
     */
    init(config) {
        if (_.isString(config)) {
            // eslint-disable-next-line no-param-reassign
            config = { connect: config };
        }
        if (this.config) {
            // eslint-disable-next-line no-param-reassign
            config = config ? _.defaults(config, this.config) : this.config;
        }
        this.log(`Calling init with ${util.inspect(config)}`);
        if (!_.isUndefined(config.data_as_buffer)) {
            this.data_as_buffer = config.data_as_buffer;
            this.log('Encoding for data output: %s', this.encoding);
        }
        this.native.init(config);

        return this;
    }

    /**
     * @param options {object|function}
     * @param cb {function}
     */
    connect(options, cb) {
        let callback;
        if (_.isFunction(options)) {
            callback = options;
            this.init({});
        } else {
            callback = cb;
            this.init(options);
        }

        this.errorHandler = (err) => {
            this.removeListener('error', this.errorHandler);
            this.removeListener('connect', this.connectHandler);
            callback(err);
        };

        this.connectHandler = () => {
            this.removeListener('error', this.errorHandler);
            this.removeListener('connect', this.connectHandler);
            callback(null, this);
        };

        this.on('error', this.errorHandler);
        this.on('connect', this.connectHandler);
    }

    /** @returns {*} */
    close() {
        this.log(`Calling close with ${util.inspect([])}`);
        return this.native.close();
    }

    /**
     * @param path {string}
     * @param data {string|Buffer}
     * @param flags {number} an int32 value
     * @param pathCb {function}
     * @returns {*}
     */
    a_create(path, data, flags, pathCb) {
        this.log(`Calling a_create with ${util.inspect([path, data, flags, pathCb])}`);
        return this.native.a_create(path, data, flags, pathCb);
    }

    /**
     * @param path {string}
     * @param watch {boolean}
     * @param statCb {function}
     * @returns {*}
     */
    a_exists(path, watch, statCb) {
        this.log(`Calling a_exists with ${util.inspect([path, watch, statCb])}`);
        return this.native.a_exists(path, watch, statCb);
    }

    /**
     * @param path {string}
     * @param watchCb {function}
     * @param statCb {function}
     * @returns {*}
     */
    aw_exists(path, watchCb, statCb) {
        this.log(`Calling aw_exists with ${util.inspect([path, watchCb, statCb])}`);
        return this.native.aw_exists(path, watchCb, statCb);
    }

    /**
     * @param path {string}
     * @param watch {bool}
     * @param dataCb {function}
     * @returns {*}
     */
    a_get(path, watch, dataCb) {
        this.log(`Calling a_get with ${util.inspect([path, watch, dataCb])}`);
        return this.native.a_get(path, watch, (rc, error, stat, data) => {
            if (data && this.encoding) {
                return dataCb(rc, error, stat, data.toString(this.encoding));
            }
            return dataCb(rc, error, stat, data);
        });
    }

    /**
     * @param path {string}
     * @param watchCb {function}
     * @param dataCb {function}
     * @returns {*}
     */
    aw_get(path, watchCb, dataCb) {
        this.log(`Calling aw_get with ${util.inspect([path, watchCb, dataCb])}`);
        return this.native.aw_get(path, watchCb, (rc, error, stat, data) => {
            if (data && this.encoding) {
                return dataCb(rc, error, stat, data.toString(this.encoding));
            }
            return dataCb(rc, error, stat, data);
        });
    }

    /**
     * @param path {string}
     * @param watch {boolean}
     * @param childCb {function}
     * @returns {*}
     */
    a_get_children(path, watch, childCb) {
        this.log(`Calling a_get_children with ${util.inspect([path, watch, childCb])}`);
        return this.native.a_get_children(path, watch, childCb);
    }

    /**
     * @param path {string}
     * @param watchCb {function}
     * @param childCb {function}
     * @returns {*}
     */
    aw_get_children(path, watchCb, childCb) {
        this.log(`Calling aw_get_children with ${util.inspect([path, watchCb, childCb])}`);
        return this.native.aw_get_children(path, watchCb, childCb);
    }

    /**
     * @param path {string}
     * @param watch {boolean}
     * @param childCb {function}
     * @returns {*}
     */
    a_get_children2(path, watch, childCb) {
        this.log(`Calling a_get_children2 with ${util.inspect([path, watch, childCb])}`);
        return this.native.a_get_children2(path, watch, childCb);
    }

    /**
     * @param path {string}
     * @param watchCb {function}
     * @param childCb {function}
     * @returns {*}
     */
    aw_get_children2(path, watchCb, childCb) {
        this.log(`Calling aw_get_children2 with ${util.inspect([path, watchCb, childCb])}`);
        return this.native.aw_get_children2(path, watchCb, childCb);
    }

    /**
     * @param path {string}
     * @param data {string|Buffer}
     * @param version {number} an int32 value
     * @param statCb {function}
     * @returns {*}
     */
    a_set(path, data, version, statCb) {
        this.log(`Calling a_set with ${util.inspect([path, data, version, statCb])}`);
        return this.native.a_set(path, data, version, statCb);
    }

    /**
     * @param path {string}
     * @param version {number} an int32 value
     * @param voidCb {function}
     * @returns {*}
     */
    // eslint-disable-next-line no-underscore-dangle
    a_delete_(path, version, voidCb) {
        this.log(`Calling a_delete_ with ${util.inspect([path, version, voidCb])}`);
        // eslint-disable-next-line no-underscore-dangle
        return this.native.a_delete_(path, version, voidCb);
    }

    /**
     * @param path {string}
     * @param aclCb {function}
     * @returns {*}
     */
    a_get_acl(path, aclCb) {
        this.log(`Calling a_get_acl with ${util.inspect([path, aclCb])}`);
        return this.native.a_get_acl(path, aclCb);
    }

    /**
     * @param path {string}
     * @param version {number} an int32 value
     * @param acl {acl}
     * @param voidCb {function}
     * @returns {*}
     */
    a_set_acl(path, version, acl, voidCb) {
        this.log(`Calling a_set_acl with ${util.inspect([path, version, acl, voidCb])}`);
        return this.native.a_set_acl(path, version, acl, voidCb);
    }

    /**
     * @param scheme {string}
     * @param auth {string}
     * @returns {*}
     */
    add_auth(scheme, auth) {
        this.log(`Calling add_auth with ${util.inspect([scheme, auth])}`);
        return this.native.add_auth(scheme, auth);
    }

    /**
     * @param path {string}
     * @param cb {function}
     */
    mkdirp(path, cb) {
        this.log(`Calling mkdirp with ${util.inspect([path, cb])}`);
        return mkdirp(this, path, cb);
    }

    /**
     * @param path {string}
     * @param cb {function}
     * @returns {*}
     */
    a_sync(path, cb) {
        this.log(`Calling a_sync ${util.inspect([path, cb])}`);
        return this.native.a_sync(path, cb);
    }

    get state() {
        return this.native.state;
    }

    /**
     * @param value {number}
     */
    set state(value) {
        this.native.state = value;
    }

    get timeout() {
        return this.native.timeout;
    }

    /** @param value {number} */
    set timeout(value) {
        this.native.timeout = value;
    }

    get client_id() {
        return this.native.client_id;
    }

    /** @param value {number} */
    set client_id(value) {
        this.native.client_id = value;
    }

    get client_password() {
        return this.native.client_password;
    }

    /** @param value {string} */
    set client_password(value) {
        this.native.client_password = value;
    }

    get is_unrecoverable() {
        return this.native.is_unrecoverable;
    }

    /** @param value {number} */
    set is_unrecoverable(value) {
        this.native.is_unrecoverable = value;
    }

    /** @param value {string} */
    setEncoding(value) {
        this.encoding = value;
    }

    /**
     * @deprecated Use setEncoding()
     * @returns {boolean}
     */
    get data_as_buffer() {
        // If there's an encoding, then data isn't a buffer.
        // If there's no encoding, then data will be a buffer.
        return !this.encoding;
    }

    /** @param data_as_buffer {boolean} */
    set data_as_buffer(data_as_buffer) {
        // If the data is a buffer, then there's no encoding.
        // If the data is NOT a buffer, then the default encoding is 'utf8'.
        this.encoding = ((data_as_buffer === true) ? null : 'utf8');
    }
}

exports = module.exports = ZooKeeper;

Object.keys(NativeZk).forEach((key) => {
    exports[key] = key;
});

/** @deprecated use strings directly */
exports.on_closed = 'close';
/** @deprecated use strings directly */
exports.on_connected = 'connect';
/** @deprecated use strings directly */
exports.on_connecting = 'connecting';
/** @deprecated use strings directly */
exports.on_event_created = 'created';
/** @deprecated use strings directly */
exports.on_event_deleted = 'deleted';
/** @deprecated use strings directly */
exports.on_event_changed = 'changed';
/** @deprecated use strings directly */
exports.on_event_child = 'child';
/** @deprecated use strings directly */
exports.on_event_notwatching = 'notwatching';

// Other Constants
Object.keys(NativeZk).forEach((key) => {
    exports[key] = NativeZk[key];
});

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
