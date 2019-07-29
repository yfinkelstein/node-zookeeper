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
 * Children with stat
 * @typedef {Object} childrenWithStat
 * @property {Array.<string>} children
 * @property {stat} stat
 */
