// needed to not break the interface
/* eslint-disable camelcase */
const ZkPromise = require('./promise');
const ZooKeeper = require('./zookeeper');

/**
 * A promisified version of the ZooKeeper class
 * @extends ZooKeeper
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
     * @param path {string}
     * @param data {(string|Buffer)}
     * @param flags {number}
     * @fulfill {string}
     * @returns {Promise.<string>}
     */
    create(path, data, flags) {
        return this.promisify(super.a_create, [path, data, flags]);
    }

    /**
     * @param path {string}
     * @param watch {function}
     * @fulfill {stat}
     * @returns {Promise.<stat>}
     */
    exists(path, watch) {
        return this.promisify(super.a_exists, [path, watch]);
    }

    /**
     * @param path {string}
     * @param watchCb {function}
     * @fulfill {stat}
     * @returns {Promise.<stat>}
     */
    w_exists(path, watchCb) {
        return this.promisify(super.aw_exists, [path, watchCb]);
    }

    /**
     * @param path {string}
     * @param watch {boolean}
     * @fulfill {string|Buffer}
     * @returns {Promise.<string|Buffer>}
     */
    get(path, watch) {
        return this.promisify(super.a_get, [path, watch]);
    }

    /**
     * @param path {string}
     * @param watchCb {function}
     * @fulfill {string|Buffer}
     * @returns {Promise.<string|Buffer>}
     */
    w_get(path, watchCb) {
        return this.promisify(super.aw_get, [path, watchCb]);
    }

    /**
     * @param path {string}
     * @param watch {boolean}
     * @fulfill {Array.<string>}
     * @returns {Promise.<Array.<string>>}
     */
    get_children(path, watch) {
        return this.promisify(super.a_get_children, [path, watch]);
    }

    /**
     * @param path {string}
     * @param watchCb {function}
     * @fulfill {Array.<string>}
     * @returns {Promise.<Array.<string>>}
     */
    w_get_children(path, watchCb) {
        return this.promisify(super.aw_get_children, [path, watchCb]);
    }

    /**
     * @param path {string}
     * @param watch {boolean}
     * @fulfill {Array} [children, stat] - children: an array of strings, stat: object
     * @returns {Promise.<Array>} [children, stat] - children: an array of strings, stat: object
     */
    get_children2(path, watch) {
        return this.promisify(super.a_get_children2, [path, watch]);
    }

    /**
     * @param path {string}
     * @param watchCb {function}
     * @fulfill {Array} [children, stat] - children: an array of strings, stat: object
     * @returns {Promise.<Array>} [children, stat] - children: an array of strings, stat: object
     */
    w_get_children2(path, watchCb) {
        return this.promisify(super.aw_get_children2, [path, watchCb]);
    }

    /**
     * @param path {string}
     * @param data {(string|Buffer)}
     * @param version {number} an int32 value
     * @fulfill {stat}
     * @returns {Promise.<stat>}
     */
    set(path, data, version) {
        return this.promisify(super.a_set, [path, data, version]);
    }

    /**
     * @param path {string}
     * @param version {number} an int32 value
     * @returns {Promise}
     */
    // eslint-disable-next-line no-underscore-dangle
    delete_(path, version) {
        // eslint-disable-next-line no-underscore-dangle
        return this.promisify(super.a_delete_, [path, version]);
    }

    /**
     * @param path {string}
     * @fulfill {acl}
     * @returns {Promise.<acl>}
     */
    get_acl(path) {
        return this.promisify(super.a_get_acl, [path]);
    }

    /**
     * @param path {string}
     * @param version {number} an int32 value
     * @param acl {acl}
     * @returns {Promise}
     */
    set_acl(path, version, acl) {
        return this.promisify(super.a_set_acl, [path, version, acl]);
    }

    /**
     * @param path {string}
     * @returns {Promise}
     */
    sync(path) {
        return this.promisify(super.a_sync, [path]);
    }

    /**
     * @private
     * @param fn {function}
     * @param args {Array}
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
            fn.bind(this)(...args, callback);
        });
    }
}

/** @type {ZooKeeperPromise} */
exports = module.exports = ZooKeeperPromise;

/**
 * @deprecated
 * @type {ZooKeeperPromise}
 */
exports.ZK = ZooKeeperPromise;
