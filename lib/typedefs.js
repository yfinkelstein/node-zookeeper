/**
 * ACL
 * @typedef {Object} acl
 * @property {number} perms
 * @property {string} scheme
 * @property {string} auth
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
 * @typedef {callback} mkdirCb
 * @param {Error} error
 * @param {boolean} [success]
 */

/**
 * Connect callback
 * @typedef {callback} connectCb
 * @param {Error} error
 * @param {ZooKeeper} client
 */

/**
 * Path callback
 * @typedef {callback} pathCb
 * @param {number} rc
 * @param {number} error
 * @param {string} path
 */

/**
 * Stat callback
 * @typedef {callback} statCb
 * @param {number} rc
 * @param {number} error
 * @param {stat} stat
 */

/**
 * Data callback
 * @typedef {callback} dataCb
 * @param {number} rc
 * @param {number} error
 * @param {stat} stat
 * @param {string|Buffer} data
 */

/**
 * Child callback
 * @typedef {callback} childCb
 * @param {number} rc
 * @param {number} error
 * @param {Array.<string>} children
 */

/**
 * Child2 callback
 * @typedef {callback} child2Cb
 * @param {number} rc
 * @param {number} error
 * @param {Array.<string>} children
 * @param {stat} stat
 */

/**
 * Value callback
 * @typedef {callback} valueCb
 * @param {number} rc
 * @param {number} error
 * @param {*} value
 */

/**
 * Void callback
 * @typedef {callback} voidCb
 * @param {number} rc
 * @param {number} error
 */

/**
 * Watch callback
 * @typedef {callback} watchCb
 * @param {number} type
 * @param {number} state
 * @param {string} path
 */

/**
 * ACL callback
 * @typedef {callback} aclCb
 * @param {number} rc
 * @param {number} error
 * @param {acl} acl
 * @param {stat} stat
 */
