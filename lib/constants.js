const { join } = require('path');
const NativeZk = require('node-gyp-build')(join(__dirname, '..')).ZooKeeper;

/** @type {number} 1 */
module.exports.ZOO_PERM_READ = NativeZk.ZOO_PERM_READ;

/** @type {number} 2 */
module.exports.ZOO_PERM_WRITE = NativeZk.ZOO_PERM_WRITE;

/** @type {number} 4 */
module.exports.ZOO_PERM_CREATE = NativeZk.ZOO_PERM_CREATE;

/** @type {number} 8 */
module.exports.ZOO_PERM_DELETE = NativeZk.ZOO_PERM_DELETE;

/** @type {number} 16 */
module.exports.ZOO_PERM_ADMIN = NativeZk.ZOO_PERM_ADMIN;

/** @type {number} 31 */
module.exports.ZOO_PERM_ALL = NativeZk.ZOO_PERM_ALL;

/** @type {number} -112 */
module.exports.ZOO_EXPIRED_SESSION_STATE = NativeZk.ZOO_EXPIRED_SESSION_STATE;

/** @type {number} -113 */
module.exports.ZOO_AUTH_FAILED_STATE = NativeZk.ZOO_AUTH_FAILED_STATE;

/** @type {number} 1 */
module.exports.ZOO_CONNECTING_STATE = NativeZk.ZOO_CONNECTING_STATE;

/** @type {number} 2 */
module.exports.ZOO_ASSOCIATING_STATE = NativeZk.ZOO_ASSOCIATING_STATE;

/** @type {number} 3 */
module.exports.ZOO_CONNECTED_STATE = NativeZk.ZOO_CONNECTED_STATE;

/** @type {number} 1 */
module.exports.ZOO_LOG_LEVEL_ERROR = NativeZk.ZOO_LOG_LEVEL_ERROR;

/** @type {number} 2 */
module.exports.ZOO_LOG_LEVEL_WARN = NativeZk.ZOO_LOG_LEVEL_WARN;

/** @type {number} 3 */
module.exports.ZOO_LOG_LEVEL_INFO = NativeZk.ZOO_LOG_LEVEL_INFO;

/** @type {number} 4 */
module.exports.ZOO_LOG_LEVEL_DEBUG = NativeZk.ZOO_LOG_LEVEL_DEBUG;

/** @type {number} 0 */
module.exports.ZOO_PERSISTENT = NativeZk.ZOO_PERSISTENT;

/** @type {number} 1 */
module.exports.ZOO_EPHEMERAL = NativeZk.ZOO_EPHEMERAL;

/** @type {number} 2 */
module.exports.ZOO_SEQUENCE = NativeZk.ZOO_SEQUENCE;

/** @type {number} 2 */
module.exports.ZOO_PERSISTENT_SEQUENTIAL = NativeZk.ZOO_PERSISTENT_SEQUENTIAL;

/** @type {number} 3 */
module.exports.ZOO_EPHEMERAL_SEQUENTIAL = NativeZk.ZOO_EPHEMERAL_SEQUENTIAL;

/** @type {number} 4 */
module.exports.ZOO_CONTAINER = NativeZk.ZOO_CONTAINER;

/** @type {number} 5 */
module.exports.ZOO_PERSISTENT_WITH_TTL = NativeZk.ZOO_PERSISTENT_WITH_TTL;

/** @type {number} 6 */
module.exports.ZOO_PERSISTENT_SEQUENTIAL_WITH_TTL = NativeZk.ZOO_PERSISTENT_SEQUENTIAL_WITH_TTL;

/** @type {number} 0 */
module.exports.ZOK = NativeZk.ZOK;

/** @type {number} -1 */
module.exports.ZSYSTEMERROR = NativeZk.ZSYSTEMERROR;

/** @type {number} -2 */
module.exports.ZRUNTIMEINCONSISTENCY = NativeZk.ZRUNTIMEINCONSISTENCY;

/** @type {number} -3 */
module.exports.ZDATAINCONSISTENCY = NativeZk.ZDATAINCONSISTENCY;

/** @type {number} -4 */
module.exports.ZCONNECTIONLOSS = NativeZk.ZCONNECTIONLOSS;

/** @type {number} -5 */
module.exports.ZMARSHALLINGERROR = NativeZk.ZMARSHALLINGERROR;

/** @type {number} -6 */
module.exports.ZUNIMPLEMENTED = NativeZk.ZUNIMPLEMENTED;

/** @type {number} -7 */
module.exports.ZOPERATIONTIMEOUT = NativeZk.ZOPERATIONTIMEOUT;

/** @type {number} -8 */
module.exports.ZBADARGUMENTS = NativeZk.ZBADARGUMENTS;

/** @type {number} -9 */
module.exports.ZINVALIDSTATE = NativeZk.ZINVALIDSTATE;

/** @type {number} -100 */
module.exports.ZAPIERROR = NativeZk.ZAPIERROR;

/** @type {number} -101 */
module.exports.ZNONODE = NativeZk.ZNONODE;

/** @type {number} -102 */
module.exports.ZNOAUTH = NativeZk.ZNOAUTH;

/** @type {number} -103 */
module.exports.ZBADVERSION = NativeZk.ZBADVERSION;

/** @type {number} -108 */
module.exports.ZNOCHILDRENFOREPHEMERALS = NativeZk.ZNOCHILDRENFOREPHEMERALS;

/** @type {number} -110 */
module.exports.ZNODEEXISTS = NativeZk.ZNODEEXISTS;

/** @type {number} -111 */
module.exports.ZNOTEMPTY = NativeZk.ZNOTEMPTY;

/** @type {number} -112 */
module.exports.ZSESSIONEXPIRED = NativeZk.ZSESSIONEXPIRED;

/** @type {number} -113 */
module.exports.ZINVALIDCALLBACK = NativeZk.ZINVALIDCALLBACK;

/** @type {number} -114 */
module.exports.ZINVALIDACL = NativeZk.ZINVALIDACL;

/** @type {number} -115 */
module.exports.ZAUTHFAILED = NativeZk.ZAUTHFAILED;

/** @type {number} -116 */
module.exports.ZCLOSING = NativeZk.ZCLOSING;

/** @type {number} -117 */
module.exports.ZNOTHING = NativeZk.ZNOTHING;

/** @type {number} -118 */
module.exports.ZSESSIONMOVED = NativeZk.ZSESSIONMOVED;

/** @type {{perms:number, scheme:string, auth:string}} */
module.exports.ZOO_OPEN_ACL_UNSAFE = NativeZk.ZOO_OPEN_ACL_UNSAFE;

/** @type {{perms:number, scheme:string, auth:string}} */
module.exports.ZOO_READ_ACL_UNSAFE = NativeZk.ZOO_READ_ACL_UNSAFE;

/** @type {{perms:number, scheme:string, auth:string}} */
module.exports.ZOO_CREATOR_ALL_ACL = NativeZk.ZOO_CREATOR_ALL_ACL;

/** @type {number} 1 */
module.exports.ZOO_CREATED_EVENT = NativeZk.ZOO_CREATED_EVENT;

/** @type {number} 2 */
module.exports.ZOO_DELETED_EVENT = NativeZk.ZOO_DELETED_EVENT;

/** @type {number} 3 */
module.exports.ZOO_CHANGED_EVENT = NativeZk.ZOO_CHANGED_EVENT;

/** @type {number} 4 */
module.exports.ZOO_CHILD_EVENT = NativeZk.ZOO_CHILD_EVENT;

/** @type {number} -1 */
module.exports.ZOO_SESSION_EVENT = NativeZk.ZOO_SESSION_EVENT;

/** @type {number} -2 */
module.exports.ZOO_NOTWATCHING_EVENT = NativeZk.ZOO_NOTWATCHING_EVENT;

/** @type {number} 1 */
module.exports.ZOOKEEPER_WRITE = NativeZk.ZOOKEEPER_WRITE;

/** @type {number} 2 */
module.exports.ZOOKEEPER_READ = NativeZk.ZOOKEEPER_READ;

/** @type {string} */
module.exports.ZOO_CONFIG_NODE = NativeZk.ZOO_CONFIG_NODE;

/** @deprecated use strings directly */
module.exports.on_closed = 'close';
/** @deprecated use strings directly */
module.exports.on_connected = 'connect';
/** @deprecated use strings directly */
module.exports.on_connecting = 'connecting';
/** @deprecated use strings directly */
module.exports.on_event_created = 'created';
/** @deprecated use strings directly */
module.exports.on_event_deleted = 'deleted';
/** @deprecated use strings directly */
module.exports.on_event_changed = 'changed';
/** @deprecated use strings directly */
module.exports.on_event_child = 'child';
/** @deprecated use strings directly */
module.exports.on_event_notwatching = 'notwatching';
