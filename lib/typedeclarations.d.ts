/// <reference types="node" />
declare module "helper" {
    export function deprecationLog(className: any, methodName: any): void;
}
declare module "zookeeperDeprecatedPromise" {
    export = ZkPromise;
    /**
     * @extends Promise
     * @deprecated
     */
    class ZkPromise extends Promise<any> {
        constructor(executor: (resolve: (value?: any) => void, reject: (reason?: any) => void) => void);
        /**
         * @deprecated
         */
        get(propertyName: any): Promise<any>;
        /**
         * @deprecated
         */
        put(propertyName: any, value: any): Promise<any>;
        /**
         * @deprecated
         */
        call(functionName: any, ...args: any[]): Promise<any>;
        /**
         * @deprecated
         */
        addCallback(callback: any): Promise<any>;
        /**
         * @deprecated
         */
        addErrback(callback: any): Promise<any>;
        /**
         * @deprecated
         */
        addBoth(callback: any): Promise<any>;
        /**
         * @deprecated
         */
        addCallbacks(callback: any, errback: any): Promise<any>;
    }
}
declare module "zookeeperWithCallbacks" {
    export = ZooKeeper;
    const ZooKeeper_base: typeof import("events").EventEmitter;
    /**
     * @class
     * @extends {EventEmitter}
     */
    class ZooKeeper extends ZooKeeper_base {
        /** @deprecated @returns {number} 1 */
        static get ZOO_PERM_READ(): number;
        /** @deprecated @returns {number} 2 */
        static get ZOO_PERM_WRITE(): number;
        /** @deprecated @returns {number} 4 */
        static get ZOO_PERM_CREATE(): number;
        /** @deprecated @returns {number} 8 */
        static get ZOO_PERM_DELETE(): number;
        /** @deprecated @returns {number} 16 */
        static get ZOO_PERM_ADMIN(): number;
        /** @deprecated @returns {number} 31 */
        static get ZOO_PERM_ALL(): number;
        /** @deprecated @returns {number} -112 */
        static get ZOO_EXPIRED_SESSION_STATE(): number;
        /** @deprecated @returns {number} -113 */
        static get ZOO_AUTH_FAILED_STATE(): number;
        /** @deprecated @returns {number} 1 */
        static get ZOO_CONNECTING_STATE(): number;
        /** @deprecated @returns {number} 2 */
        static get ZOO_ASSOCIATING_STATE(): number;
        /** @deprecated @returns {number} 3 */
        static get ZOO_CONNECTED_STATE(): number;
        /** @deprecated @returns {number} 1 */
        static get ZOO_LOG_LEVEL_ERROR(): number;
        /** @deprecated @returns {number} 2 */
        static get ZOO_LOG_LEVEL_WARN(): number;
        /** @deprecated @returns {number} 3 */
        static get ZOO_LOG_LEVEL_INFO(): number;
        /** @deprecated @returns {number} 4 */
        static get ZOO_LOG_LEVEL_DEBUG(): number;
        /** @deprecated @returns {number} 1 */
        static get ZOO_EPHEMERAL(): number;
        /** @deprecated @returns {number} 2 */
        static get ZOO_SEQUENCE(): number;
        /** @deprecated @returns {number} 0 */
        static get ZOK(): number;
        /** @deprecated @returns {number} -1 */
        static get ZSYSTEMERROR(): number;
        /** @deprecated @returns {number} -2 */
        static get ZRUNTIMEINCONSISTENCY(): number;
        /** @deprecated @returns {number} -3 */
        static get ZDATAINCONSISTENCY(): number;
        /** @deprecated @returns {number} -4 */
        static get ZCONNECTIONLOSS(): number;
        /** @deprecated @returns {number} -5 */
        static get ZMARSHALLINGERROR(): number;
        /** @deprecated @returns {number} -6 */
        static get ZUNIMPLEMENTED(): number;
        /** @deprecated @returns {number} -7 */
        static get ZOPERATIONTIMEOUT(): number;
        /** @deprecated @returns {number} -8 */
        static get ZBADARGUMENTS(): number;
        /** @deprecated @returns {number} -9 */
        static get ZINVALIDSTATE(): number;
        /** @deprecated @returns {number} -100 */
        static get ZAPIERROR(): number;
        /** @deprecated @returns {number} -101 */
        static get ZNONODE(): number;
        /** @deprecated @returns {number} -102 */
        static get ZNOAUTH(): number;
        /** @deprecated @returns {number} -103 */
        static get ZBADVERSION(): number;
        /** @deprecated @returns {number} -108 */
        static get ZNOCHILDRENFOREPHEMERALS(): number;
        /** @deprecated @returns {number} -110 */
        static get ZNODEEXISTS(): number;
        /** @deprecated @returns {number} -111 */
        static get ZNOTEMPTY(): number;
        /** @deprecated @returns {number} -112 */
        static get ZSESSIONEXPIRED(): number;
        /** @deprecated @returns {number} -113 */
        static get ZINVALIDCALLBACK(): number;
        /** @deprecated @returns {number} -114 */
        static get ZINVALIDACL(): number;
        /** @deprecated @returns {number} -115 */
        static get ZAUTHFAILED(): number;
        /** @deprecated @returns {number} -116 */
        static get ZCLOSING(): number;
        /** @deprecated @returns {number} -117 */
        static get ZNOTHING(): number;
        /** @deprecated @returns {number} -118 */
        static get ZSESSIONMOVED(): number;
        /** @deprecated @returns {{perms:number, scheme:string, auth:string}} */
        static get ZOO_OPEN_ACL_UNSAFE(): {
            perms: number;
            scheme: string;
            auth: string;
        };
        /** @deprecated @returns {{perms:number, scheme:string, auth:string}} */
        static get ZOO_READ_ACL_UNSAFE(): {
            perms: number;
            scheme: string;
            auth: string;
        };
        /** @deprecated @returns {{perms:number, scheme:string, auth:string}} */
        static get ZOO_CREATOR_ALL_ACL(): {
            perms: number;
            scheme: string;
            auth: string;
        };
        /** @deprecated @returns {number} 1 */
        static get ZOO_CREATED_EVENT(): number;
        /** @deprecated @returns {number} 2 */
        static get ZOO_DELETED_EVENT(): number;
        /** @deprecated @returns {number} 3 */
        static get ZOO_CHANGED_EVENT(): number;
        /** @deprecated @returns {number} 4 */
        static get ZOO_CHILD_EVENT(): number;
        /** @deprecated @returns {number} -1 */
        static get ZOO_SESSION_EVENT(): number;
        /** @deprecated @returns {number} -2 */
        static get ZOO_NOTWATCHING_EVENT(): number;
        /** @deprecated @returns {number} 1 */
        static get ZOOKEEPER_WRITE(): number;
        /** @deprecated @returns {number} 2 */
        static get ZOOKEEPER_READ(): number;
        /** @deprecated @returns {string} "/zookeeper/config" */
        static get ZOO_CONFIG_NODE(): string;
        /** @deprecated use strings directly */
        static get on_closed(): string;
        /** @deprecated use strings directly */
        static get on_connected(): string;
        /** @deprecated use strings directly */
        static get on_connecting(): string;
        /** @deprecated use strings directly */
        static get on_event_created(): string;
        /** @deprecated use strings directly */
        static get on_event_deleted(): string;
        /** @deprecated use strings directly */
        static get on_event_changed(): string;
        /** @deprecated use strings directly */
        static get on_event_child(): string;
        /** @deprecated use strings directly */
        static get on_event_notwatching(): string;
        /** @param {object|string} config */
        constructor(config: object | string);
        config: any;
        native: any;
        encoding: string;
        /** @param {object|boolean} logger */
        setLogger(logger: object | boolean): void;
        logger: any;
        /** @param {...*} args */
        log(...args: any[]): void;
        /**
         * @param {object|string} config
         * @returns {ZooKeeper}
         */
        init(config: object | string): ZooKeeper;
        /** @param {boolean} data_as_buffer */
        set data_as_buffer(arg: boolean);
        /**
         * @deprecated Use setEncoding()
         * @returns {boolean}
         */
        get data_as_buffer(): boolean;
        /**
         * @param {object|function} options
         * @param {connectCb} cb
         */
        connect(options: object | Function, cb: connectCb): void;
        errorHandler: any;
        connectHandler: any;
        /** @returns {*} */
        close(): any;
        /**
         * @param {string} path
         * @param {string|Buffer} data
         * @param {number} flags - an int32 value
         * @param {pathCb} pathCb
         * @returns {*}
         */
        a_create(path: string, data: string | Buffer, flags: number, pathCb: pathCb): any;
        /**
         * @param {string} path
         * @param {string|Buffer} data
         * @param {number} flags - an int32 value
         * @param {number} ttl - a positive int32 value
         * @param {pathCb} pathCb
         * @returns {*}
         */
        a_createTtl(path: string, data: string | Buffer, flags: number, ttl: number, pathCb: pathCb): any;
        /**
         * @param {string} path
         * @param {boolean} watch
         * @param {statCb} statCb
         * @returns {*}
         */
        a_exists(path: string, watch: boolean, statCb: statCb): any;
        /**
         * @param {string} path
         * @param {watchCb} watchCb
         * @param {statCb} statCb
         * @returns {*}
         */
        aw_exists(path: string, watchCb: watchCb, statCb: statCb): any;
        /**
         * @param {string} path
         * @param {boolean} watch
         * @param {dataCb} dataCb
         * @returns {*}
         */
        a_get(path: string, watch: boolean, dataCb: dataCb): any;
        /**
         * @param {string} path
         * @param {watchCb} watchCb
         * @param {dataCb} dataCb
         * @returns {*}
         */
        aw_get(path: string, watchCb: watchCb, dataCb: dataCb): any;
        /**
         * @param {string} path
         * @param {boolean} watch
         * @param {childCb} childCb
         * @returns {*}
         */
        a_get_children(path: string, watch: boolean, childCb: childCb): any;
        /**
         * @param {string} path
         * @param {watchCb} watchCb
         * @param {childCb} childCb
         * @returns {*}
         */
        aw_get_children(path: string, watchCb: watchCb, childCb: childCb): any;
        /**
         * @param {string} path
         * @param {boolean} watch
         * @param {child2Cb} childCb
         * @returns {*}
         */
        a_get_children2(path: string, watch: boolean, childCb: child2Cb): any;
        /**
         * @param {string} path
         * @param {watchCb} watchCb
         * @param {child2Cb} childCb
         * @returns {*}
         */
        aw_get_children2(path: string, watchCb: watchCb, childCb: child2Cb): any;
        /**
         * @param {string} path
         * @param {string|Buffer} data
         * @param {number} version - an int32 value
         * @param {statCb} statCb
         * @returns {*}
         */
        a_set(path: string, data: string | Buffer, version: number, statCb: statCb): any;
        /**
         * @param {string} path
         * @param {number} version - an int32 value
         * @param {voidCb} voidCb
         * @returns {*}
         */
        a_delete_(path: string, version: number, voidCb: voidCb): any;
        /**
         * @param {string} path
         * @param {aclCb} aclCb
         * @returns {*}
         */
        a_get_acl(path: string, aclCb: aclCb): any;
        /**
         * @param {string} path
         * @param {number} version - an int32 value
         * @param {acl} acl
         * @param {voidCb} voidCb
         * @returns {*}
         */
        a_set_acl(path: string, version: number, acl: acl, voidCb: voidCb): any;
        /**
         * @param {string} scheme
         * @param {string} auth
         * @param {voidCb} voidCb
         * @returns {*}
         */
        add_auth(scheme: string, auth: string, voidCb: voidCb): any;
        /**
         * @param {string} path
         * @param {mkdirCb} cb
         */
        mkdirp(path: string, cb: mkdirCb): void;
        /**
         * @param {string} path
         * @param {function} cb
         * @returns {*}
         */
        a_sync(path: string, cb: Function): any;
        /**
         * @param {boolean} watch
         * @param {dataCb} dataCb
         * @returns {*}
         */
        a_getconfig(watch: boolean, dataCb: dataCb): any;
        /**
         * @param {watchCb} watchCb
         * @param {dataCb} dataCb
         * @returns {*}
         */
        aw_getconfig(watchCb: watchCb, dataCb: dataCb): any;
        /**
         * @param {string|null} joining
         * @param {string|null} leaving
         * @param {string|null} members
         * @param {number} config_version
         * @param {dataCb} dataCb
         * @returns {*}
         */
        a_reconfig(joining: string | null, leaving: string | null, members: string | null, config_version: number, dataCb: dataCb): any;
        /**
         * @param {string} servers
         * @returns {*}
         */
        set_servers(servers: string): any;
        /** @param {number} value */
        set state(arg: number);
        get state(): number;
        /** @param {number} value */
        set timeout(arg: number);
        get timeout(): number;
        /** @param {number} value */
        set client_id(arg: number);
        get client_id(): number;
        /** @param {string} value */
        set client_password(arg: string);
        get client_password(): string;
        /** @param {number} value */
        set is_unrecoverable(arg: number);
        get is_unrecoverable(): number;
        /** @param {string} value */
        setEncoding(value: string): void;
    }
}
declare module "zookeeperConstants" {
    export var ZOO_PERM_READ: number;
    export var ZOO_PERM_WRITE: number;
    export var ZOO_PERM_CREATE: number;
    export var ZOO_PERM_DELETE: number;
    export var ZOO_PERM_ADMIN: number;
    export var ZOO_PERM_ALL: number;
    export var ZOO_EXPIRED_SESSION_STATE: number;
    export var ZOO_AUTH_FAILED_STATE: number;
    export var ZOO_CONNECTING_STATE: number;
    export var ZOO_ASSOCIATING_STATE: number;
    export var ZOO_CONNECTED_STATE: number;
    export var ZOO_LOG_LEVEL_ERROR: number;
    export var ZOO_LOG_LEVEL_WARN: number;
    export var ZOO_LOG_LEVEL_INFO: number;
    export var ZOO_LOG_LEVEL_DEBUG: number;
    export var ZOO_PERSISTENT: number;
    export var ZOO_EPHEMERAL: number;
    export var ZOO_SEQUENCE: number;
    export var ZOO_PERSISTENT_SEQUENTIAL: number;
    export var ZOO_EPHEMERAL_SEQUENTIAL: number;
    export var ZOO_CONTAINER: number;
    export var ZOO_PERSISTENT_WITH_TTL: number;
    export var ZOO_PERSISTENT_SEQUENTIAL_WITH_TTL: number;
    export var ZOK: number;
    export var ZSYSTEMERROR: number;
    export var ZRUNTIMEINCONSISTENCY: number;
    export var ZDATAINCONSISTENCY: number;
    export var ZCONNECTIONLOSS: number;
    export var ZMARSHALLINGERROR: number;
    export var ZUNIMPLEMENTED: number;
    export var ZOPERATIONTIMEOUT: number;
    export var ZBADARGUMENTS: number;
    export var ZINVALIDSTATE: number;
    export var ZAPIERROR: number;
    export var ZNONODE: number;
    export var ZNOAUTH: number;
    export var ZBADVERSION: number;
    export var ZNOCHILDRENFOREPHEMERALS: number;
    export var ZNODEEXISTS: number;
    export var ZNOTEMPTY: number;
    export var ZSESSIONEXPIRED: number;
    export var ZINVALIDCALLBACK: number;
    export var ZINVALIDACL: number;
    export var ZAUTHFAILED: number;
    export var ZCLOSING: number;
    export var ZNOTHING: number;
    export var ZSESSIONMOVED: number;
    export var ZOO_OPEN_ACL_UNSAFE: {
        perms: number;
        scheme: string;
        auth: string;
    };
    export var ZOO_READ_ACL_UNSAFE: {
        perms: number;
        scheme: string;
        auth: string;
    };
    export var ZOO_CREATOR_ALL_ACL: {
        perms: number;
        scheme: string;
        auth: string;
    };
    export var ZOO_CREATED_EVENT: number;
    export var ZOO_DELETED_EVENT: number;
    export var ZOO_CHANGED_EVENT: number;
    export var ZOO_CHILD_EVENT: number;
    export var ZOO_SESSION_EVENT: number;
    export var ZOO_NOTWATCHING_EVENT: number;
    export var ZOOKEEPER_WRITE: number;
    export var ZOOKEEPER_READ: number;
    export var on_closed: string;
    export var on_connected: string;
    export var on_connecting: string;
    export var on_event_created: string;
    export var on_event_deleted: string;
    export var on_event_changed: string;
    export var on_event_child: string;
    export var on_event_notwatching: string;
}
declare module "zookeeper" {
    export = ZooKeeperPromise;
    const ZooKeeperPromise_base: typeof import("zookeeperWithCallbacks");
    /**
     * A promisified version of the ZooKeeper class
     * @class
     * @extends {ZooKeeper}
     */
    class ZooKeeperPromise extends ZooKeeperPromise_base {
        /** @deprecated */
        static get ZK(): typeof ZooKeeperPromise;
        static get constants(): typeof import("zookeeperConstants");
        /** @deprecated */
        static get ZooKeeper(): typeof import("zookeeperWithCallbacks");
        static get Promise(): typeof ZooKeeperPromise;
        constructor(config: any);
        /**
         * @deprecated
         * returns {ZkPromise}
         */
        on_connected(): import("zookeeperDeprecatedPromise");
        /**
         * @param {string} path
         * @param {(string|Buffer)} data
         * @param {number} flags
         * @param {number|undefined} [ttl=undefined] ttl - positive integer, use only with a TTL flag
         * @fulfill {string}
         * @returns {Promise.<string>}
         */
        create(path: string, data: (string | Buffer), flags: number, ttl?: number | undefined): Promise<string>;
        /**
         * @param {string} path
         * @param {boolean} watch
         * @fulfill {stat}
         * @returns {Promise.<stat>}
         */
        exists(path: string, watch: boolean): Promise<stat>;
        /**
         * @param {string} path
         * @param {boolean} watch
         * @fulfill {boolean}
         * @returns {Promise.<boolean>}
         */
        pathExists(path: string, watch: boolean): Promise<boolean>;
        /**
         * @param {string} path
         * @param {function} watchCb
         * @fulfill {stat}
         * @returns {Promise.<stat>}
         */
        w_exists(path: string, watchCb: Function): Promise<stat>;
        /**
         * @param {string} path
         * @param {function} watchCb
         * @fulfill {boolean}
         * @returns {Promise.<boolean>}
         */
        w_pathExists(path: string, watchCb: Function): Promise<boolean>;
        /**
         * @param {string} path
         * @param {boolean} watch
         * @fulfill {Array} [stat, data] - stat: object, data: string|Buffer
         * @returns {Promise.<Array>} [stat, data] - stat: object, data: string|Buffer
         */
        get(path: string, watch: boolean): Promise<any[]>;
        /**
         * @param {string} path
         * @param {function} watchCb
         * @fulfill {Array} [stat, data] - stat: object, data: string|Buffer
         * @returns {Promise.<Array>} [stat, data] - stat: object, data: string|Buffer
         */
        w_get(path: string, watchCb: Function): Promise<any[]>;
        /**
         * @param {string} path
         * @param {boolean} watch
         * @fulfill {Array.<string>}
         * @returns {Promise.<Array.<string>>}
         */
        get_children(path: string, watch: boolean): Promise<Array<string>>;
        /**
         * @param {string} path
         * @param {function} watchCb
         * @fulfill {Array.<string>}
         * @returns {Promise.<Array.<string>>}
         */
        w_get_children(path: string, watchCb: Function): Promise<Array<string>>;
        /**
         * @param {string} path
         * @param {boolean} watch
         * @fulfill {Array} [children, stat] - children: an array of strings, stat: object
         * @returns {Promise.<Array>} [children, stat] - children: an array of strings, stat: object
         */
        get_children2(path: string, watch: boolean): Promise<any[]>;
        /**
         * @param {string} path
         * @param {function} watchCb
         * @fulfill {Array} [children, stat] - children: an array of strings, stat: object
         * @returns {Promise.<Array>} [children, stat] - children: an array of strings, stat: object
         */
        w_get_children2(path: string, watchCb: Function): Promise<any[]>;
        /**
         * @param {string} path
         * @param {(string|Buffer)} data
         * @param {number} version - an int32 value
         * @fulfill {stat}
         * @returns {Promise.<stat>}
         */
        set(path: string, data: (string | Buffer), version: number): Promise<stat>;
        /**
         * @param {string} path
         * @param {number} version - an int32 value
         * @returns {Promise}
         */
        delete_(path: string, version: number): Promise<any>;
        /**
         * @param {string} path
         * @fulfill {acl}
         * @returns {Promise.<acl>}
         */
        get_acl(path: string): Promise<acl>;
        /**
         * @param {string} path
         * @param {number} version - an int32 value
         * @param {acl} acl
         * @returns {Promise}
         */
        set_acl(path: string, version: number, acl: acl): Promise<any>;
        /**
         * @param {string} path
         * @returns {Promise}
         */
        sync(path: string): Promise<any>;
        /**
         * @param {boolean} watch
         * @fulfill {string|Buffer}
         * @returns {Promise.<string|Buffer>}
         */
        getconfig(watch: boolean): Promise<string | Buffer>;
        /**
         * @param {function} watchCb
         * @fulfill {string|Buffer}
         * @returns {Promise.<string|Buffer>}
         */
        w_getconfig(watchCb: Function): Promise<string | Buffer>;
        /**
         * @param {string|null} joining
         * @param {string|null} leaving
         * @param {string|null} members
         * @param {number} config_version
         * @returns {*}
         */
        reconfig(joining: string | null, leaving: string | null, members: string | null, config_version: number): any;
        /**
         * @private
         * @param {function} fn
         * @param {Array} args
         * @returns {ZkPromise}
         */
        private promisify;
    }
}
declare module "index" {
    export = ZooKeeper;
    const ZooKeeper: typeof import("zookeeper");
}
/**
 * ACL
 */
type acl = {
    perms: number;
    scheme: string;
    auth: string;
};
/**
 * stat
 */
type stat = {
    czxid: number;
    mzxid: number;
    ctime: number;
    mtime: number;
    version: number;
    cversion: number;
    aversion: number;
    ephemeralOwner: string;
    dataLength: number;
    numChildren: number;
    pzxid: number;
};
/**
 * Mkdir callback
 */
type mkdirCb = (error: Error, success?: boolean) => any;
/**
 * Connect callback
 */
type connectCb = (error: Error, client: any) => any;
/**
 * Path callback
 */
type pathCb = (rc: number, error: number, path: string) => any;
/**
 * Stat callback
 */
type statCb = (rc: number, error: number, stat: stat) => any;
/**
 * Data callback
 */
type dataCb = (rc: number, error: number, stat: stat, data: string | Buffer) => any;
/**
 * Child callback
 */
type childCb = (rc: number, error: number, children: Array<string>) => any;
/**
 * Child2 callback
 */
type child2Cb = (rc: number, error: number, children: Array<string>, stat: stat) => any;
/**
 * Value callback
 */
type valueCb = (rc: number, error: number, value: any) => any;
/**
 * Void callback
 */
type voidCb = (rc: number, error: number) => any;
/**
 * Watch callback
 */
type watchCb = (type: number, state: number, path: string) => any;
/**
 * ACL callback
 */
type aclCb = (rc: number, error: number, acl: acl, stat: stat) => any;
