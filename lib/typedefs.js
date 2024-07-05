/**
 * ACL object
 * @typedef {Object} aclObject
 * @property {number} perms
 * @property {string} scheme
 * @property {string} auth
 */

/**
 * ACL object
 * @typedef {Object} aclObject2
 * @property {number} perm
 * @property {string} scheme
 * @property {string} auth
 */

/**
 * ACL
 * @typedef {Array.<aclObject | aclObject2>} acl
 */

/**
 * stat
 * @typedef {Object} stat
 * @property {number} czxid
 * @property {number} mzxid
 * @property {number} ctime
 * @property {number} mtime
 * @property {number} version
 * @property {number} cversion
 * @property {number} aversion
 * @property {string} ephemeralOwner
 * @property {number} dataLength
 * @property {number} numChildren
 * @property {number} pzxid
 */

/**
 * Mkdir callback
 * @callback mkdirCb
 * @param {Error} error
 * @param {boolean} [success]
 */

/**
 * Connect callback
 * @callback connectCb
 * @param {Error} error
 * @param {ZooKeeper} client
 */

/**
 * Path callback
 * @callback pathCb
 * @param {number} rc
 * @param {number} error
 * @param {string} path
 */

/**
 * Stat callback
 * @callback statCb
 * @param {number} rc
 * @param {number} error
 * @param {stat} stat
 */

/**
 * Data callback
 * @callback dataCb
 * @param {number} rc
 * @param {number} error
 * @param {stat} stat
 * @param {string|Buffer} data
 */

/**
 * Child callback
 * @callback childCb
 * @param {number} rc
 * @param {number} error
 * @param {Array.<string>} children
 */

/**
 * Child2 callback
 * @callback child2Cb
 * @param {number} rc
 * @param {number} error
 * @param {Array.<string>} children
 * @param {stat} stat
 */

/**
 * Value callback
 * @callback valueCb
 * @param {number} rc
 * @param {number} error
 * @param {*} value
 */

/**
 * Void callback
 * @callback voidCb
 * @param {number} rc
 * @param {number} error
 */

/**
 * Watch callback
 * @callback watchCb
 * @param {number} type
 * @param {number} state
 * @param {string} path
 */

/**
 * ACL callback
 * @callback aclCb
 * @param {number} rc
 * @param {number} error
 * @param {acl} acl
 * @param {stat} stat
 */
