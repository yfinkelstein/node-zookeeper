const NativeZk = require('./../build/zookeeper.node').ZooKeeper;

/** @returns {number} 1 */
module.exports.ZOO_PERM_READ = NativeZk.ZOO_PERM_READ;

/** @returns {number} 2 */
module.exports.ZOO_PERM_WRITE = NativeZk.ZOO_PERM_WRITE;

/** @returns {number} 4 */
module.exports.ZOO_PERM_CREATE = NativeZk.ZOO_PERM_CREATE;

/** @returns {number} 8 */
module.exports.ZOO_PERM_DELETE = NativeZk.ZOO_PERM_DELETE;

/** @returns {number} 16 */
module.exports.ZOO_PERM_ADMIN = NativeZk.ZOO_PERM_ADMIN;

/** @returns {number} 31 */
module.exports.ZOO_PERM_ALL = NativeZk.ZOO_PERM_ALL;

/** @returns {number} -112 */
module.exports.ZOO_EXPIRED_SESSION_STATE = NativeZk.ZOO_EXPIRED_SESSION_STATE;

/** @returns {number} -113 */
module.exports.ZOO_AUTH_FAILED_STATE = NativeZk.ZOO_AUTH_FAILED_STATE;

/** @returns {number} 1 */
module.exports.ZOO_CONNECTING_STATE = NativeZk.ZOO_CONNECTING_STATE;

/** @returns {number} 2 */
module.exports.ZOO_ASSOCIATING_STATE = NativeZk.ZOO_ASSOCIATING_STATE;

/** @returns {number} 3 */
module.exports.ZOO_CONNECTED_STATE = NativeZk.ZOO_CONNECTED_STATE;

/** @returns {number} 1 */
module.exports.ZOO_LOG_LEVEL_ERROR = NativeZk.ZOO_LOG_LEVEL_ERROR;

/** @returns {number} 2 */
module.exports.ZOO_LOG_LEVEL_WARN = NativeZk.ZOO_LOG_LEVEL_WARN;

/** @returns {number} 3 */
module.exports.ZOO_LOG_LEVEL_INFO = NativeZk.ZOO_LOG_LEVEL_INFO;

/** @returns {number} 4 */
module.exports.ZOO_LOG_LEVEL_DEBUG = NativeZk.ZOO_LOG_LEVEL_DEBUG;

/** @returns {number} 1 */
module.exports.ZOO_EPHEMERAL = NativeZk.ZOO_EPHEMERAL;

/** @returns {number} 2 */
module.exports.ZOO_SEQUENCE = NativeZk.ZOO_SEQUENCE;

/** @returns {number} 0 */
module.exports.ZOK = NativeZk.ZOK;

/** @returns {number} -1 */
module.exports.ZSYSTEMERROR = NativeZk.ZSYSTEMERROR;

/** @returns {number} -2 */
module.exports.ZRUNTIMEINCONSISTENCY = NativeZk.ZRUNTIMEINCONSISTENCY;

/** @returns {number} -3 */
module.exports.ZDATAINCONSISTENCY = NativeZk.ZDATAINCONSISTENCY;

/** @returns {number} -4 */
module.exports.ZCONNECTIONLOSS = NativeZk.ZCONNECTIONLOSS;

/** @returns {number} -5 */
module.exports.ZMARSHALLINGERROR = NativeZk.ZMARSHALLINGERROR;

/** @returns {number} -6 */
module.exports.ZUNIMPLEMENTED = NativeZk.ZUNIMPLEMENTED;

/** @returns {number} -7 */
module.exports.ZOPERATIONTIMEOUT = NativeZk.ZOPERATIONTIMEOUT;

/** @returns {number} -8 */
module.exports.ZBADARGUMENTS = NativeZk.ZBADARGUMENTS;

/** @returns {number} -9 */
module.exports.ZINVALIDSTATE = NativeZk.ZINVALIDSTATE;

/** @returns {number} -100 */
module.exports.ZAPIERROR = NativeZk.ZAPIERROR;

/** @returns {number} -101 */
module.exports.ZNONODE = NativeZk.ZNONODE;

/** @returns {number} -102 */
module.exports.ZNOAUTH = NativeZk.ZNOAUTH;

/** @returns {number} -103 */
module.exports.ZBADVERSION = NativeZk.ZBADVERSION;

/** @returns {number} -108 */
module.exports.ZNOCHILDRENFOREPHEMERALS = NativeZk.ZNOCHILDRENFOREPHEMERALS;

/** @returns {number} -110 */
module.exports.ZNODEEXISTS = NativeZk.ZNODEEXISTS;

/** @returns {number} -111 */
module.exports.ZNOTEMPTY = NativeZk.ZNOTEMPTY;

/** @returns {number} -112 */
module.exports.ZSESSIONEXPIRED = NativeZk.ZSESSIONEXPIRED;

/** @returns {number} -113 */
module.exports.ZINVALIDCALLBACK = NativeZk.ZINVALIDCALLBACK;

/** @returns {number} -114 */
module.exports.ZINVALIDACL = NativeZk.ZINVALIDACL;

/** @returns {number} -115 */
module.exports.ZAUTHFAILED = NativeZk.ZAUTHFAILED;

/** @returns {number} -116 */
module.exports.ZCLOSING = NativeZk.ZCLOSING;

/** @returns {number} -117 */
module.exports.ZNOTHING = NativeZk.ZNOTHING;

/** @returns {number} -118 */
module.exports.ZSESSIONMOVED = NativeZk.ZSESSIONMOVED;

/** @returns {{perms:number, scheme:string, auth:string}} */
module.exports.ZOO_OPEN_ACL_UNSAFE = NativeZk.ZOO_OPEN_ACL_UNSAFE;

/** @returns {{perms:number, scheme:string, auth:string}} */
module.exports.ZOO_READ_ACL_UNSAFE = NativeZk.ZOO_READ_ACL_UNSAFE;

/** @returns {{perms:number, scheme:string, auth:string}} */
module.exports.ZOO_CREATOR_ALL_ACL = NativeZk.ZOO_CREATOR_ALL_ACL;

/** @returns {number} 1 */
module.exports.ZOO_CREATED_EVENT = NativeZk.ZOO_CREATED_EVENT;

/** @returns {number} 2 */
module.exports.ZOO_DELETED_EVENT = NativeZk.ZOO_DELETED_EVENT;

/** @returns {number} 3 */
module.exports.ZOO_CHANGED_EVENT = NativeZk.ZOO_CHANGED_EVENT;

/** @returns {number} 4 */
module.exports.ZOO_CHILD_EVENT = NativeZk.ZOO_CHILD_EVENT;

/** @returns {number} -1 */
module.exports.ZOO_SESSION_EVENT = NativeZk.ZOO_SESSION_EVENT;

/** @returns {number} -2 */
module.exports.ZOO_NOTWATCHING_EVENT = NativeZk.ZOO_NOTWATCHING_EVENT;

/** @returns {number} 1 */
module.exports.ZOOKEEPER_WRITE = NativeZk.ZOOKEEPER_WRITE;

/** @returns {number} 2 */
module.exports.ZOOKEEPER_READ = NativeZk.ZOOKEEPER_READ;

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
