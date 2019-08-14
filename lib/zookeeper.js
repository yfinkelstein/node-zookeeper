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
 * @param callback {mkdirCb}
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

/**
 * @extends EventEmitter
 * @see {@link ./typedefs.js}
 */
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
     * @param cb {connectCb}
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
     * @param pathCb {pathCb}
     * @returns {*}
     */
    a_create(path, data, flags, pathCb) {
        this.log(`Calling a_create with ${util.inspect([path, data, flags, pathCb])}`);
        return this.native.a_create(path, data, flags, pathCb);
    }

    /**
     * @param path {string}
     * @param watch {boolean}
     * @param statCb {statCb}
     * @returns {*}
     */
    a_exists(path, watch, statCb) {
        this.log(`Calling a_exists with ${util.inspect([path, watch, statCb])}`);
        return this.native.a_exists(path, watch, statCb);
    }

    /**
     * @param path {string}
     * @param watchCb {watchCb}
     * @param statCb {statCb}
     * @returns {*}
     */
    aw_exists(path, watchCb, statCb) {
        this.log(`Calling aw_exists with ${util.inspect([path, watchCb, statCb])}`);
        return this.native.aw_exists(path, watchCb, statCb);
    }

    /**
     * @param path {string}
     * @param watch {bool}
     * @param dataCb {dataCb}
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
     * @param watchCb {watchCb}
     * @param dataCb {dataCb}
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
     * @param childCb {childCb}
     * @returns {*}
     */
    a_get_children(path, watch, childCb) {
        this.log(`Calling a_get_children with ${util.inspect([path, watch, childCb])}`);
        return this.native.a_get_children(path, watch, childCb);
    }

    /**
     * @param path {string}
     * @param watchCb {watchCb}
     * @param childCb {childCb}
     * @returns {*}
     */
    aw_get_children(path, watchCb, childCb) {
        this.log(`Calling aw_get_children with ${util.inspect([path, watchCb, childCb])}`);
        return this.native.aw_get_children(path, watchCb, childCb);
    }

    /**
     * @param path {string}
     * @param watch {boolean}
     * @param childCb {child2Cb}
     * @returns {*}
     */
    a_get_children2(path, watch, childCb) {
        this.log(`Calling a_get_children2 with ${util.inspect([path, watch, childCb])}`);
        return this.native.a_get_children2(path, watch, childCb);
    }

    /**
     * @param path {string}
     * @param watchCb {watchCb}
     * @param childCb {child2Cb}
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
     * @param statCb {statCb}
     * @returns {*}
     */
    a_set(path, data, version, statCb) {
        this.log(`Calling a_set with ${util.inspect([path, data, version, statCb])}`);
        return this.native.a_set(path, data, version, statCb);
    }

    /**
     * @param path {string}
     * @param version {number} an int32 value
     * @param voidCb {voidCb}
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
     * @param aclCb {aclCb}
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
     * @param voidCb {voidCb}
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
     * @param cb {mkdirCb}
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

    /** @param value {number} */
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

    /** @deprecated @returns {number} 1 */
    static get ZOO_PERM_READ() {
        return NativeZk.ZOO_PERM_READ;
    }

    /** @deprecated @returns {number} 2 */
    static get ZOO_PERM_WRITE() {
        return NativeZk.ZOO_PERM_WRITE;
    }

    /** @deprecated @returns {number} 4 */
    static get ZOO_PERM_CREATE() {
        return NativeZk.ZOO_PERM_CREATE;
    }

    /** @deprecated @returns {number} 8 */
    static get ZOO_PERM_DELETE() {
        return NativeZk.ZOO_PERM_DELETE;
    }

    /** @deprecated @returns {number} 16 */
    static get ZOO_PERM_ADMIN() {
        return NativeZk.ZOO_PERM_ADMIN;
    }

    /** @deprecated @returns {number} 31 */
    static get ZOO_PERM_ALL() {
        return NativeZk.ZOO_PERM_ALL;
    }

    /** @deprecated @returns {number} -112 */
    static get ZOO_EXPIRED_SESSION_STATE() {
        return NativeZk.ZOO_EXPIRED_SESSION_STATE;
    }

    /** @deprecated @returns {number} -113 */
    static get ZOO_AUTH_FAILED_STATE() {
        return NativeZk.ZOO_AUTH_FAILED_STATE;
    }

    /** @deprecated @returns {number} 1 */
    static get ZOO_CONNECTING_STATE() {
        return NativeZk.ZOO_CONNECTING_STATE;
    }

    /** @deprecated @returns {number} 2 */
    static get ZOO_ASSOCIATING_STATE() {
        return NativeZk.ZOO_ASSOCIATING_STATE;
    }

    /** @deprecated @returns {number} 3 */
    static get ZOO_CONNECTED_STATE() {
        return NativeZk.ZOO_CONNECTED_STATE;
    }

    /** @deprecated @returns {number} 1 */
    static get ZOO_LOG_LEVEL_ERROR() {
        return NativeZk.ZOO_LOG_LEVEL_ERROR;
    }

    /** @deprecated @returns {number} 2 */
    static get ZOO_LOG_LEVEL_WARN() {
        return NativeZk.ZOO_LOG_LEVEL_WARN;
    }

    /** @deprecated @returns {number} 3 */
    static get ZOO_LOG_LEVEL_INFO() {
        return NativeZk.ZOO_LOG_LEVEL_INFO;
    }

    /** @deprecated @returns {number} 4 */
    static get ZOO_LOG_LEVEL_DEBUG() {
        return NativeZk.ZOO_LOG_LEVEL_DEBUG;
    }

    /** @deprecated @returns {number} 1 */
    static get ZOO_EPHEMERAL() {
        return NativeZk.ZOO_EPHEMERAL;
    }

    /** @deprecated @returns {number} 2 */
    static get ZOO_SEQUENCE() {
        return NativeZk.ZOO_SEQUENCE;
    }

    /** @deprecated @returns {number} 0 */
    static get ZOK() {
        return NativeZk.ZOK;
    }

    /** @deprecated @returns {number} -1 */
    static get ZSYSTEMERROR() {
        return NativeZk.ZSYSTEMERROR;
    }

    /** @deprecated @returns {number} -2 */
    static get ZRUNTIMEINCONSISTENCY() {
        return NativeZk.ZRUNTIMEINCONSISTENCY;
    }

    /** @deprecated @returns {number} -3 */
    static get ZDATAINCONSISTENCY() {
        return NativeZk.ZDATAINCONSISTENCY;
    }

    /** @deprecated @returns {number} -4 */
    static get ZCONNECTIONLOSS() {
        return NativeZk.ZCONNECTIONLOSS;
    }

    /** @deprecated @returns {number} -5 */
    static get ZMARSHALLINGERROR() {
        return NativeZk.ZMARSHALLINGERROR;
    }

    /** @deprecated @returns {number} -6 */
    static get ZUNIMPLEMENTED() {
        return NativeZk.ZUNIMPLEMENTED;
    }

    /** @deprecated @returns {number} -7 */
    static get ZOPERATIONTIMEOUT() {
        return NativeZk.ZOPERATIONTIMEOUT;
    }

    /** @deprecated @returns {number} -8 */
    static get ZBADARGUMENTS() {
        return NativeZk.ZBADARGUMENTS;
    }

    /** @deprecated @returns {number} -9 */
    static get ZINVALIDSTATE() {
        return NativeZk.ZINVALIDSTATE;
    }

    /** @deprecated @returns {number} -100 */
    static get ZAPIERROR() {
        return NativeZk.ZAPIERROR;
    }

    /** @deprecated @returns {number} -101 */
    static get ZNONODE() {
        return NativeZk.ZNONODE;
    }

    /** @deprecated @returns {number} -102 */
    static get ZNOAUTH() {
        return NativeZk.ZNOAUTH;
    }

    /** @deprecated @returns {number} -103 */
    static get ZBADVERSION() {
        return NativeZk.ZBADVERSION;
    }

    /** @deprecated @returns {number} -108 */
    static get ZNOCHILDRENFOREPHEMERALS() {
        return NativeZk.ZNOCHILDRENFOREPHEMERALS;
    }

    /** @deprecated @returns {number} -110 */
    static get ZNODEEXISTS() {
        return NativeZk.ZNODEEXISTS;
    }

    /** @deprecated @returns {number} -111 */
    static get ZNOTEMPTY() {
        return NativeZk.ZNOTEMPTY;
    }

    /** @deprecated @returns {number} -112 */
    static get ZSESSIONEXPIRED() {
        return NativeZk.ZSESSIONEXPIRED;
    }

    /** @deprecated @returns {number} -113 */
    static get ZINVALIDCALLBACK() {
        return NativeZk.ZINVALIDCALLBACK;
    }

    /** @deprecated @returns {number} -114 */
    static get ZINVALIDACL() {
        return NativeZk.ZINVALIDACL;
    }

    /** @deprecated @returns {number} -115 */
    static get ZAUTHFAILED() {
        return NativeZk.ZAUTHFAILED;
    }

    /** @deprecated @returns {number} -116 */
    static get ZCLOSING() {
        return NativeZk.ZCLOSING;
    }

    /** @deprecated @returns {number} -117 */
    static get ZNOTHING() {
        return NativeZk.ZNOTHING;
    }

    /** @deprecated @returns {number} -118 */
    static get ZSESSIONMOVED() {
        return NativeZk.ZSESSIONMOVED;
    }

    /** @deprecated @returns {{perms:number, scheme:string, auth:string}} */
    static get ZOO_OPEN_ACL_UNSAFE() {
        return NativeZk.ZOO_OPEN_ACL_UNSAFE;
    }

    /** @deprecated @returns {{perms:number, scheme:string, auth:string}} */
    static get ZOO_READ_ACL_UNSAFE() {
        return NativeZk.ZOO_READ_ACL_UNSAFE;
    }

    /** @deprecated @returns {{perms:number, scheme:string, auth:string}} */
    static get ZOO_CREATOR_ALL_ACL() {
        return NativeZk.ZOO_CREATOR_ALL_ACL;
    }

    /** @deprecated @returns {number} 1 */
    static get ZOO_CREATED_EVENT() {
        return NativeZk.ZOO_CREATED_EVENT;
    }

    /** @deprecated @returns {number} 2 */
    static get ZOO_DELETED_EVENT() {
        return NativeZk.ZOO_DELETED_EVENT;
    }

    /** @deprecated @returns {number} 3 */
    static get ZOO_CHANGED_EVENT() {
        return NativeZk.ZOO_CHANGED_EVENT;
    }

    /** @deprecated @returns {number} 4 */
    static get ZOO_CHILD_EVENT() {
        return NativeZk.ZOO_CHILD_EVENT;
    }

    /** @deprecated @returns {number} -1 */
    static get ZOO_SESSION_EVENT() {
        return NativeZk.ZOO_SESSION_EVENT;
    }

    /** @deprecated @returns {number} -2 */
    static get ZOO_NOTWATCHING_EVENT() {
        return NativeZk.ZOO_NOTWATCHING_EVENT;
    }

    /** @deprecated @returns {number} 1 */
    static get ZOOKEEPER_WRITE() {
        return NativeZk.ZOOKEEPER_WRITE;
    }

    /** @deprecated @returns {number} 2 */
    static get ZOOKEEPER_READ() {
        return NativeZk.ZOOKEEPER_READ;
    }
}

exports = module.exports = ZooKeeper;

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
