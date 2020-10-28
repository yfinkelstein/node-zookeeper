declare module "constants" {
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
    export var ZOO_EPHEMERAL: number;
    export var ZOO_SEQUENCE: number;
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
declare module "helper" {
    export function deprecationLog(className: any, methodName: any): void;
}
declare module "promise" {
    export = ZkPromise;
    /**
     * @extends Promise
     */
    class ZkPromise {
        /**
         * @deprecated
         */
        get(propertyName: any): any;
        /**
         * @deprecated
         */
        put(propertyName: any, value: any): any;
        /**
         * @deprecated
         */
        call(functionName: any, ...args: any[]): any;
        /**
         * @deprecated
         */
        addCallback(callback: any): any;
        /**
         * @deprecated
         */
        addErrback(callback: any): any;
        /**
         * @deprecated
         */
        addBoth(callback: any): any;
        /**
         * @deprecated
         */
        addCallbacks(callback: any, errback: any): any;
    }
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
type dataCb = (rc: number, error: number, stat: stat, data: string | any) => any;
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
declare module "zookeeper" {
    export = ZooKeeper;
    const ZooKeeper_base: any;
    /**
     * @extends EventEmitter
     */
    class ZooKeeper extends ZooKeeper_base {
        [x: string]: any;
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
        /** @param config {object|string} */
        constructor(config: object | string);
        config: any;
        native: any;
        encoding: string;
        /** @param logger {object|boolean} */
        setLogger(logger: object | boolean): void;
        logger: any;
        /** @param args {...*} */
        log(...args: any[]): void;
        /**
         * @param config {object|string}
         * @returns {ZooKeeper}
         */
        init(config: object | string): ZooKeeper;
        /** @param data_as_buffer {boolean} */
        set data_as_buffer(arg: boolean);
        /**
         * @deprecated Use setEncoding()
         * @returns {boolean}
         */
        get data_as_buffer(): boolean;
        /**
         * @param options {object|function}
         * @param cb {connectCb}
         */
        connect(options: object | Function, cb: connectCb): void;
        errorHandler: any;
        connectHandler: any;
        /** @returns {*} */
        close(): any;
        /**
         * @param path {string}
         * @param data {string|Buffer}
         * @param flags {number} an int32 value
         * @param pathCb {pathCb}
         * @returns {*}
         */
        a_create(path: string, data: string | any, flags: number, pathCb: pathCb): any;
        /**
         * @param path {string}
         * @param watch {boolean}
         * @param statCb {statCb}
         * @returns {*}
         */
        a_exists(path: string, watch: boolean, statCb: statCb): any;
        /**
         * @param path {string}
         * @param watchCb {watchCb}
         * @param statCb {statCb}
         * @returns {*}
         */
        aw_exists(path: string, watchCb: watchCb, statCb: statCb): any;
        /**
         * @param path {string}
         * @param watch {bool}
         * @param dataCb {dataCb}
         * @returns {*}
         */
        a_get(path: string, watch: any, dataCb: dataCb): any;
        /**
         * @param path {string}
         * @param watchCb {watchCb}
         * @param dataCb {dataCb}
         * @returns {*}
         */
        aw_get(path: string, watchCb: watchCb, dataCb: dataCb): any;
        /**
         * @param path {string}
         * @param watch {boolean}
         * @param childCb {childCb}
         * @returns {*}
         */
        a_get_children(path: string, watch: boolean, childCb: childCb): any;
        /**
         * @param path {string}
         * @param watchCb {watchCb}
         * @param childCb {childCb}
         * @returns {*}
         */
        aw_get_children(path: string, watchCb: watchCb, childCb: childCb): any;
        /**
         * @param path {string}
         * @param watch {boolean}
         * @param childCb {child2Cb}
         * @returns {*}
         */
        a_get_children2(path: string, watch: boolean, childCb: child2Cb): any;
        /**
         * @param path {string}
         * @param watchCb {watchCb}
         * @param childCb {child2Cb}
         * @returns {*}
         */
        aw_get_children2(path: string, watchCb: watchCb, childCb: child2Cb): any;
        /**
         * @param path {string}
         * @param data {string|Buffer}
         * @param version {number} an int32 value
         * @param statCb {statCb}
         * @returns {*}
         */
        a_set(path: string, data: string | any, version: number, statCb: statCb): any;
        /**
         * @param path {string}
         * @param version {number} an int32 value
         * @param voidCb {voidCb}
         * @returns {*}
         */
        a_delete_(path: string, version: number, voidCb: voidCb): any;
        /**
         * @param path {string}
         * @param aclCb {aclCb}
         * @returns {*}
         */
        a_get_acl(path: string, aclCb: aclCb): any;
        /**
         * @param path {string}
         * @param version {number} an int32 value
         * @param acl {acl}
         * @param voidCb {voidCb}
         * @returns {*}
         */
        a_set_acl(path: string, version: number, acl: acl, voidCb: voidCb): any;
        /**
         * @param scheme {string}
         * @param auth {string}
         * @param voidCb {voidCb}
         * @returns {*}
         */
        add_auth(scheme: string, auth: string, voidCb: voidCb): any;
        /**
         * @param path {string}
         * @param cb {mkdirCb}
         */
        mkdirp(path: string, cb: mkdirCb): void;
        /**
         * @param path {string}
         * @param cb {function}
         * @returns {*}
         */
        a_sync(path: string, cb: Function): any;
        /** @param value {number} */
        set state(arg: number);
        get state(): number;
        /** @param value {number} */
        set timeout(arg: number);
        get timeout(): number;
        /** @param value {number} */
        set client_id(arg: number);
        get client_id(): number;
        /** @param value {string} */
        set client_password(arg: string);
        get client_password(): string;
        /** @param value {number} */
        set is_unrecoverable(arg: number);
        get is_unrecoverable(): number;
        /** @param value {string} */
        setEncoding(value: string): void;
    }
    namespace ZooKeeper {
        export { on_closed, on_connected, on_connecting, on_event_created, on_event_deleted, on_event_changed, on_event_child, on_event_notwatching };
    }
    var on_closed: string;
    var on_connected: string;
    var on_connecting: string;
    var on_event_created: string;
    var on_event_deleted: string;
    var on_event_changed: string;
    var on_event_child: string;
    var on_event_notwatching: string;
}
declare module "zk_promise" {
    export = ZooKeeperPromise;
    const ZooKeeperPromise_base: typeof import("zookeeper");
    /**
     * A promisified version of the ZooKeeper class
     * @extends ZooKeeper
     */
    class ZooKeeperPromise extends ZooKeeperPromise_base {
        constructor(config: any);
        /**
         * @deprecated
         * returns {ZkPromise}
         */
        on_connected(): import("promise");
        /**
         * @param path {string}
         * @param data {(string|Buffer)}
         * @param flags {number}
         * @fulfill {string}
         * @returns {Promise.<string>}
         */
        create(path: string, data: (string | any), flags: number): Promise<string>;
        /**
         * @param path {string}
         * @param watch {function}
         * @fulfill {stat}
         * @returns {Promise.<stat>}
         */
        exists(path: string, watch: Function): Promise<stat>;
        /**
         * @param path {string}
         * @param watchCb {function}
         * @fulfill {stat}
         * @returns {Promise.<stat>}
         */
        w_exists(path: string, watchCb: Function): Promise<stat>;
        /**
         * @param path {string}
         * @param watch {boolean}
         * @fulfill {string|Buffer}
         * @returns {Promise.<string|Buffer>}
         */
        get(path: string, watch: boolean): Promise<string | any>;
        /**
         * @param path {string}
         * @param watchCb {function}
         * @fulfill {string|Buffer}
         * @returns {Promise.<string|Buffer>}
         */
        w_get(path: string, watchCb: Function): Promise<string | any>;
        /**
         * @param path {string}
         * @param watch {boolean}
         * @fulfill {Array.<string>}
         * @returns {Promise.<Array.<string>>}
         */
        get_children(path: string, watch: boolean): Promise<Array<string>>;
        /**
         * @param path {string}
         * @param watchCb {function}
         * @fulfill {Array.<string>}
         * @returns {Promise.<Array.<string>>}
         */
        w_get_children(path: string, watchCb: Function): Promise<Array<string>>;
        /**
         * @param path {string}
         * @param watch {boolean}
         * @fulfill {Array} [children, stat] - children: an array of strings, stat: object
         * @returns {Promise.<Array>} [children, stat] - children: an array of strings, stat: object
         */
        get_children2(path: string, watch: boolean): Promise<any[]>;
        /**
         * @param path {string}
         * @param watchCb {function}
         * @fulfill {Array} [children, stat] - children: an array of strings, stat: object
         * @returns {Promise.<Array>} [children, stat] - children: an array of strings, stat: object
         */
        w_get_children2(path: string, watchCb: Function): Promise<any[]>;
        /**
         * @param path {string}
         * @param data {(string|Buffer)}
         * @param version {number} an int32 value
         * @fulfill {stat}
         * @returns {Promise.<stat>}
         */
        set(path: string, data: (string | any), version: number): Promise<stat>;
        /**
         * @param path {string}
         * @param version {number} an int32 value
         * @returns {Promise}
         */
        delete_(path: string, version: number): Promise<any>;
        /**
         * @param path {string}
         * @fulfill {acl}
         * @returns {Promise.<acl>}
         */
        get_acl(path: string): Promise<acl>;
        /**
         * @param path {string}
         * @param version {number} an int32 value
         * @param acl {acl}
         * @returns {Promise}
         */
        set_acl(path: string, version: number, acl: acl): Promise<any>;
        /**
         * @param path {string}
         * @returns {Promise}
         */
        sync(path: string): Promise<any>;
        /**
         * @private
         * @param fn {function}
         * @param args {Array}
         * @returns {ZkPromise}
         */
        private promisify;
    }
    namespace ZooKeeperPromise {
        export { ZooKeeperPromise as ZK };
    }
}
