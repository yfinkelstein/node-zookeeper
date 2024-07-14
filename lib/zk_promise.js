// needed to not break the interface
/* eslint-disable camelcase */
const ZkPromise = require('./promise');
const ZooKeeper = require('./zookeeper');
const zkConstants = require('./constants');
const { findZkConstantByCode } = require('./helper');

function isTruthy(data) {
    if (data) {
        return true;
    }

    return false;
}

/**
 * A promisified version of the ZooKeeper class
 * @class
 * @extends {ZooKeeper}
 */
class ZooKeeperPromise extends ZooKeeper {
    /**
     * @deprecated
     * returns {ZkPromise}
     */
    on_connected() {
        return new ZkPromise((resolve) => {
            this.once('connect', () => resolve(this));
        });
    }

    /**
     * @param {string} path
     * @param {(string|Buffer)} data
     * @param {number} flags
     * @param {number|undefined} [ttl=undefined] ttl - positive integer, use only with a TTL flag
     * @fulfill {string}
     * @returns {Promise.<string>}
     */
    create(path, data, flags, ttl = undefined) {
        if (ttl) {
            return this.promisify(super.a_createTtl, [path, data, flags, ttl]);
        }

        return this.promisify(super.a_create, [path, data, flags]);
    }

    /**
     * @param {string} path
     * @param {boolean} watch
     * @fulfill {stat}
     * @returns {Promise.<stat>}
     */
    exists(path, watch) {
        return this.promisify(super.a_exists, [path, watch]);
    }

    /**
     * @param {string} path
     * @param {boolean} watch
     * @fulfill {boolean}
     * @returns {Promise.<boolean>}
     */
    async pathExists(path, watch) {
        try {
            const stat = await this.exists(path, watch);

            return isTruthy(stat);
        } catch (e) {
            return false;
        }
    }

    /**
     * @param {string} path
     * @param {function} watchCb
     * @fulfill {stat}
     * @returns {Promise.<stat>}
     */
    w_exists(path, watchCb) {
        return this.promisify(super.aw_exists, [path, watchCb]);
    }

    /**
     * @param {string} path
     * @param {function} watchCb
     * @fulfill {boolean}
     * @returns {Promise.<boolean>}
     */
    async w_pathExists(path, watchCb) {
        try {
            const stat = await this.w_exists(path, watchCb);

            return isTruthy(stat);
        } catch (e) {
            return false;
        }
    }

    /**
     * @param {string} path
     * @param {boolean} watch
     * @fulfill {Array} [stat, data] - stat: object, data: string|Buffer
     * @returns {Promise.<Array>} [stat, data] - stat: object, data: string|Buffer
     */
    get(path, watch) {
        return this.promisify(super.a_get, [path, watch]);
    }

    /**
     * @param {string} path
     * @param {function} watchCb
     * @fulfill {Array} [stat, data] - stat: object, data: string|Buffer
     * @returns {Promise.<Array>} [stat, data] - stat: object, data: string|Buffer
     */
    w_get(path, watchCb) {
        return this.promisify(super.aw_get, [path, watchCb]);
    }

    /**
     * @param {string} path
     * @param {boolean} watch
     * @fulfill {Array.<string>}
     * @returns {Promise.<Array.<string>>}
     */
    get_children(path, watch) {
        return this.promisify(super.a_get_children, [path, watch]);
    }

    /**
     * @param {string} path
     * @param {function} watchCb
     * @fulfill {Array.<string>}
     * @returns {Promise.<Array.<string>>}
     */
    w_get_children(path, watchCb) {
        return this.promisify(super.aw_get_children, [path, watchCb]);
    }

    /**
     * @param {string} path
     * @param {boolean} watch
     * @fulfill {Array} [children, stat] - children: an array of strings, stat: object
     * @returns {Promise.<Array>} [children, stat] - children: an array of strings, stat: object
     */
    get_children2(path, watch) {
        return this.promisify(super.a_get_children2, [path, watch]);
    }

    /**
     * @param {string} path
     * @param {function} watchCb
     * @fulfill {Array} [children, stat] - children: an array of strings, stat: object
     * @returns {Promise.<Array>} [children, stat] - children: an array of strings, stat: object
     */
    w_get_children2(path, watchCb) {
        return this.promisify(super.aw_get_children2, [path, watchCb]);
    }

    /**
     * @param {string} path
     * @param {(string|Buffer)} data
     * @param {number} version - an int32 value
     * @fulfill {stat}
     * @returns {Promise.<stat>}
     */
    set(path, data, version) {
        return this.promisify(super.a_set, [path, data, version]);
    }

    /**
     * @param {string} path
     * @param {number} version - an int32 value
     * @returns {Promise}
     */
    // eslint-disable-next-line no-underscore-dangle
    delete_(path, version) {
        // eslint-disable-next-line no-underscore-dangle
        return this.promisify(super.a_delete_, [path, version]);
    }

    /**
     * @param {string} path
     * @fulfill {acl}
     * @returns {Promise.<acl>}
     */
    get_acl(path) {
        return this.promisify(super.a_get_acl, [path]);
    }

    /**
     * @param {string} path
     * @param {number} version - an int32 value
     * @param {acl} acl
     * @returns {Promise}
     */
    set_acl(path, version, acl) {
        return this.promisify(super.a_set_acl, [path, version, acl]);
    }

    /**
     * @param {string} path
     * @returns {Promise}
     */
    sync(path) {
        return this.promisify(super.a_sync, [path]);
    }

    /**
     * @param {boolean} watch
     * @fulfill {string|Buffer}
     * @returns {Promise.<string|Buffer>}
     */
    getconfig(watch) {
        return this.promisify(super.a_getconfig, [watch]);
    }

    /**
     * @param {function} watchCb
     * @fulfill {string|Buffer}
     * @returns {Promise.<string|Buffer>}
     */
    w_getconfig(watchCb) {
        return this.promisify(super.aw_getconfig, [watchCb]);
    }

    /**
     * @param {string|null} joining
     * @param {string|null} leaving
     * @param {string|null} members
     * @param {number} config_version
     * @returns {*}
     */
    reconfig(joining, leaving, members, config_version) {
        return this.promisify(super.a_reconfig, [joining, leaving, members, config_version]);
    }

    /**
     * @private
     * @param {function} fn
     * @param {Array} args
     * @returns {ZkPromise}
     */
    promisify(fn, args) {
        return new ZkPromise((resolve, reject) => {
            const callback = (rc, error, ...result) => {
                if (rc !== 0) {
                    reject(new Error(`${rc} ${error}`));
                } else {
                    const toReturn = result.length === 1 ? result[0] : result;
                    resolve(toReturn);
                }
            };

            const res = fn.bind(this)(...args, callback);

            if (res < 0) {
                const [key, value] = findZkConstantByCode(res, zkConstants);

                reject(new Error(`fn: "${fn.name}" args: "${args}" result: "${key} ${value}"`));
            }
        });
    }

    /** @deprecated */
    static get ZK() {
        return ZooKeeperPromise;
    }

    static get constants() {
        return zkConstants;
    }

    /** @deprecated */
    static get ZooKeeper() {
        return ZooKeeper;
    }

    static get Promise() {
        return ZooKeeperPromise;
    }
}

/** @type {ZooKeeperPromise} */
module.exports = ZooKeeperPromise;
