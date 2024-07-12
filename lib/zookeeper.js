// needed to not break the interface
/* eslint-disable camelcase */
const util = require('util');
const { EventEmitter } = require('events');
const { join, posix } = require('path');
const { apply, waterfall } = require('async');
const NativeZk = require('node-gyp-build')(join(__dirname, '..')).ZooKeeper;
const { isString, isFunction, toCompatibleAcl } = require('./helper');

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
 * @param {ZooKeeper} con
 * @param {string} p
 * @param {function} cb
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
 * @param {ZooKeeper} con
 * @param {string} p
 * @param {mkdirCb} callback
 */
const mkdirp = (con, p, callback) => {
    const dirs = posix.normalize(p).split(posix.sep).slice(1); // remove empty string at the start.

    const tasks = [];
    dirs.forEach((dir, i) => {
        let subpath = `/${dirs.slice(0, i).join('/')}/${dir}`;
        subpath = posix.normalize(subpath); // remove extra `/` in first iteration
        tasks.push(Async.apply(create, con, subpath));
    });
    Async.waterfall(tasks, (err) => {
        if (err) return callback(err);
        // succeeded!
        return callback(null, true);
    });
};

/**
 * @class
 * @extends {EventEmitter}
 */
class ZooKeeper extends EventEmitter {
    /** @param {object|string} config */
    constructor(config) {
        super();

        if (isString(config)) {
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

    /** @param {object|boolean} logger */
    setLogger(logger) {
        if (logger === true) {
            this.logger = (str) => {
                console.info(`ZOOKEEPER_LOG: ${str}`);
            };
        } else if (logger === false) {
            this.logger = undefined;
        } else if (isFunction(logger)) {
            this.logger = logger;
        } else {
            throw new Error('InvalidArgument: logger must be a function or true/false to utilize default logger');
        }
    }

    /** @param {...*} args */
    log(...args) {
        if (this.logger) this.logger(...args);
    }

    /**
     * @param {object|string} config
     * @returns {ZooKeeper}
     */
    init(config) {
        if (isString(config)) {
            // eslint-disable-next-line no-param-reassign
            config = { connect: config };
        }
        if (this.config) {
            // eslint-disable-next-line no-param-reassign
            config = config ? Object.assign(config, this.config) : this.config;
        }
        this.log(`Calling init with ${util.inspect(config)}`);
        if (config.data_as_buffer !== undefined) {
            this.data_as_buffer = config.data_as_buffer;
            this.log('Encoding for data output: %s', this.encoding);
        }
        this.native.init(config);

        return this;
    }

    /**
     * @param {object|function} options
     * @param {connectCb} cb
     */
    connect(options, cb) {
        let callback;
        if (isFunction(options)) {
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
     * @param {string} path
     * @param {string|Buffer} data
     * @param {number} flags - an int32 value
     * @param {pathCb} pathCb
     * @returns {*}
     */
    a_create(path, data, flags, pathCb) {
        this.log(`Calling a_create with ${util.inspect([path, data, flags, pathCb])}`);
        return this.native.a_create(path, data, flags, pathCb);
    }

    /**
     * @param {string} path
     * @param {string|Buffer} data
     * @param {number} flags - an int32 value
     * @param {number} ttl - a positive int32 value
     * @param {pathCb} pathCb
     * @returns {*}
     */
    a_createTtl(path, data, flags, ttl, pathCb) {
        this.log(`Calling a_create_ttl with ${util.inspect([path, data, flags, ttl, pathCb])}`);
        return this.native.a_create_ttl(path, data, flags, ttl, pathCb);
    }

    /**
     * @param {string} path
     * @param {boolean} watch
     * @param {statCb} statCb
     * @returns {*}
     */
    a_exists(path, watch, statCb) {
        this.log(`Calling a_exists with ${util.inspect([path, watch, statCb])}`);
        return this.native.a_exists(path, watch, statCb);
    }

    /**
     * @param {string} path
     * @param {watchCb} watchCb
     * @param {statCb} statCb
     * @returns {*}
     */
    aw_exists(path, watchCb, statCb) {
        this.log(`Calling aw_exists with ${util.inspect([path, watchCb, statCb])}`);
        return this.native.aw_exists(path, watchCb, statCb);
    }

    /**
     * @param {string} path
     * @param {boolean} watch
     * @param {dataCb} dataCb
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
     * @param {string} path
     * @param {watchCb} watchCb
     * @param {dataCb} dataCb
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
     * @param {string} path
     * @param {boolean} watch
     * @param {childCb} childCb
     * @returns {*}
     */
    a_get_children(path, watch, childCb) {
        this.log(`Calling a_get_children with ${util.inspect([path, watch, childCb])}`);
        return this.native.a_get_children(path, watch, childCb);
    }

    /**
     * @param {string} path
     * @param {watchCb} watchCb
     * @param {childCb} childCb
     * @returns {*}
     */
    aw_get_children(path, watchCb, childCb) {
        this.log(`Calling aw_get_children with ${util.inspect([path, watchCb, childCb])}`);
        return this.native.aw_get_children(path, watchCb, childCb);
    }

    /**
     * @param {string} path
     * @param {boolean} watch
     * @param {child2Cb} childCb
     * @returns {*}
     */
    a_get_children2(path, watch, childCb) {
        this.log(`Calling a_get_children2 with ${util.inspect([path, watch, childCb])}`);
        return this.native.a_get_children2(path, watch, childCb);
    }

    /**
     * @param {string} path
     * @param {watchCb} watchCb
     * @param {child2Cb} childCb
     * @returns {*}
     */
    aw_get_children2(path, watchCb, childCb) {
        this.log(`Calling aw_get_children2 with ${util.inspect([path, watchCb, childCb])}`);
        return this.native.aw_get_children2(path, watchCb, childCb);
    }

    /**
     * @param {string} path
     * @param {string|Buffer} data
     * @param {number} version - an int32 value
     * @param {statCb} statCb
     * @returns {*}
     */
    a_set(path, data, version, statCb) {
        this.log(`Calling a_set with ${util.inspect([path, data, version, statCb])}`);
        return this.native.a_set(path, data, version, statCb);
    }

    /**
     * @param {string} path
     * @param {number} version - an int32 value
     * @param {voidCb} voidCb
     * @returns {*}
     */
    // eslint-disable-next-line no-underscore-dangle
    a_delete_(path, version, voidCb) {
        this.log(`Calling a_delete_ with ${util.inspect([path, version, voidCb])}`);
        // eslint-disable-next-line no-underscore-dangle
        return this.native.a_delete_(path, version, voidCb);
    }

    /**
     * @param {string} path
     * @param {aclCb} aclCb
     * @returns {*}
     */
    a_get_acl(path, aclCb) {
        this.log(`Calling a_get_acl with ${util.inspect([path, aclCb])}`);
        return this.native.a_get_acl(path, aclCb);
    }

    /**
     * @param {string} path
     * @param {number} version - an int32 value
     * @param {acl} acl
     * @param {voidCb} voidCb
     * @returns {*}
     */
    a_set_acl(path, version, acl, voidCb) {
        const compatibleAcl = toCompatibleAcl(acl);
        this.log(`Calling a_set_acl with ${util.inspect([path, version, compatibleAcl, voidCb])}`);
        return this.native.a_set_acl(path, version, compatibleAcl, voidCb);
    }

    /**
     * @param {string} scheme
     * @param {string} auth
     * @param {voidCb} voidCb
     * @returns {*}
     */
    add_auth(scheme, auth, voidCb) {
        this.log(`Calling add_auth with ${util.inspect([scheme, auth, voidCb])}`);
        return this.native.add_auth(scheme, auth, voidCb);
    }

    /**
     * @param {string} path
     * @param {mkdirCb} cb
     */
    mkdirp(path, cb) {
        this.log(`Calling mkdirp with ${util.inspect([path, cb])}`);
        return mkdirp(this, path, cb);
    }

    /**
     * @param {string} path
     * @param {function} cb
     * @returns {*}
     */
    a_sync(path, cb) {
        this.log(`Calling a_sync ${util.inspect([path, cb])}`);
        return this.native.a_sync(path, cb);
    }

    /**
     * @param {boolean} watch
     * @param {dataCb} dataCb
     * @returns {*}
     */
    a_getconfig(watch, dataCb) {
        this.log(`Calling a_getconfig with ${util.inspect([watch, dataCb])}`);
        return this.native.a_getconfig(watch, (rc, error, stat, data) => {
            if (data && this.encoding) {
                return dataCb(rc, error, stat, data.toString(this.encoding));
            }
            return dataCb(rc, error, stat, data);
        });
    }

    /**
     * @param {watchCb} watchCb
     * @param {dataCb} dataCb
     * @returns {*}
     */
    aw_getconfig(watchCb, dataCb) {
        this.log(`Calling aw_getconfig with ${util.inspect([watchCb, dataCb])}`);
        return this.native.aw_getconfig(watchCb, (rc, error, stat, data) => {
            if (data && this.encoding) {
                return dataCb(rc, error, stat, data.toString(this.encoding));
            }
            return dataCb(rc, error, stat, data);
        });
    }

    /**
     * @param {string|null} joining
     * @param {string|null} leaving
     * @param {string|null} members
     * @param {number} config_version
     * @param {dataCb} dataCb
     * @returns {*}
     */
    a_reconfig(joining, leaving, members, config_version, dataCb) {
        this.log('Calling a_reconfig with '
            + `${util.inspect([joining, leaving, members, config_version, dataCb])}`);
        return this.native.a_reconfig(
            joining,
            leaving,
            members,
            config_version,
            (rc, error, stat, data) => {
                if (data && this.encoding) {
                    return dataCb(rc, error, stat, data.toString(this.encoding));
                }
                return dataCb(rc, error, stat, data);
            },
        );
    }

    /**
     * @param {string} servers
     * @returns {*}
     */
    set_servers(servers) {
        this.log(`Calling set_servers with ${util.inspect([servers])}`);
        return this.native.set_servers(servers);
    }

    get state() {
        return this.native.state;
    }

    /** @param {number} value */
    set state(value) {
        this.native.state = value;
    }

    get timeout() {
        return this.native.timeout;
    }

    /** @param {number} value */
    set timeout(value) {
        this.native.timeout = value;
    }

    get client_id() {
        return this.native.client_id;
    }

    /** @param {number} value */
    set client_id(value) {
        this.native.client_id = value;
    }

    get client_password() {
        return this.native.client_password;
    }

    /** @param {string} value */
    set client_password(value) {
        this.native.client_password = value;
    }

    get is_unrecoverable() {
        return this.native.is_unrecoverable;
    }

    /** @param {number} value */
    set is_unrecoverable(value) {
        this.native.is_unrecoverable = value;
    }

    /** @param {string} value */
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

    /** @param {boolean} data_as_buffer */
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

    /** @deprecated @returns {string} "/zookeeper/config" */
    static get ZOO_CONFIG_NODE() {
        return NativeZk.ZOO_CONFIG_NODE;
    }

    /** @deprecated use strings directly */
    static get on_closed() {
        return 'close';
    }

    /** @deprecated use strings directly */
    static get on_connected() {
        return 'connect';
    }

    /** @deprecated use strings directly */
    static get on_connecting() {
        return 'connecting';
    }

    /** @deprecated use strings directly */
    static get on_event_created() {
        return 'created';
    }

    /** @deprecated use strings directly */
    static get on_event_deleted() {
        return 'deleted';
    }

    /** @deprecated use strings directly */
    static get on_event_changed() {
        return 'changed';
    }

    /** @deprecated use strings directly */
    static get on_event_child() {
        return 'child';
    }

    /** @deprecated use strings directly */
    static get on_event_notwatching() {
        return 'notwatching';
    }
}

/** @type {ZooKeeper} */
module.exports = ZooKeeper;
