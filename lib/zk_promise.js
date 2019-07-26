// needed to not break the interface
/* eslint-disable camelcase */
const ZkPromise = require('./promise');
const ZooKeeper = require('./zookeeper');

/**
 * A promisified version of the {ZooKeeper} class
 */
class ZooKeeperPromise extends ZooKeeper {
    /** returns {ZkPromise} */
    on_connected() {
        return new ZkPromise((resolve) => {
            this.once('connect', () => resolve(this));
        });
    }

    /**
     * @param path {string}
     * @param data {(string|Buffer)}
     * @param flags {number}
     * @returns {ZkPromise}
     */
    create(path, data, flags) {
        return this.promisify(super.a_create, [path, data, flags]);
    }

    /**
     *
     * @param path {string}
     * @param watch {function}
     * @returns {ZkPromise}
     */
    exists(path, watch) {
        return this.promisify(super.a_exists, [path, watch]);
    }

    /**
     * @param path {string}
     * @param watchCb {function}
     * @returns {ZkPromise}
     */
    w_exists(path, watchCb) {
        return this.promisify(super.aw_exists, [path, watchCb]);
    }

    /**
     * @param path {string}
     * @param watch {boolean}
     * @returns {ZkPromise}
     */
    get(path, watch) {
        return this.promisify(super.a_get, [path, watch]);
    }

    /**
     * @param path {string}
     * @param watchCb {function}
     * @returns {ZkPromise}
     */
    w_get(path, watchCb) {
        return this.promisify(super.aw_get, [path, watchCb]);
    }

    /**
     * @param path {string}
     * @param watch {boolean}
     * @returns {ZkPromise}
     */
    get_children(path, watch) {
        return this.promisify(super.a_get_children, [path, watch]);
    }

    /**
     * @param path {string}
     * @param watchCb {function}
     * @returns {ZkPromise}
     */
    w_get_children(path, watchCb) {
        return this.promisify(super.aw_get_children, [path, watchCb]);
    }

    /**
     * @param path {string}
     * @param watch {boolean}
     * @returns {ZkPromise}
     */
    get_children2(path, watch) {
        return this.promisify(super.a_get_children2, [path, watch]);
    }

    /**
     * @param path {string}
     * @param watchCb {function}
     * @returns {ZkPromise}
     */
    w_get_children2(path, watchCb) {
        return this.promisify(super.aw_get_children2, [path, watchCb]);
    }

    /**
     * @param path {string}
     * @param data {(string|Buffer)}
     * @param version {number} an int32 value
     * @returns {ZkPromise}
     */
    set(path, data, version) {
        return this.promisify(super.a_set, [path, data, version]);
    }

    /**
     * @param path {string}
     * @param version {number} an int32 value
     * @returns {ZkPromise}
     */
    // eslint-disable-next-line no-underscore-dangle
    delete_(path, version) {
        // eslint-disable-next-line no-underscore-dangle
        return this.promisify(super.a_delete_, [path, version]);
    }

    /**
     * @param path {string}
     * @returns {ZkPromise}
     */
    get_acl(path) {
        return this.promisify(super.a_get_acl, [path]);
    }

    /**
     * @param path {string}
     * @param version {number} an int32 value
     * @param acl {acl}
     * @returns {ZkPromise}
     */
    set_acl(path, version, acl) {
        return this.promisify(super.a_set_acl, [path, version, acl]);
    }

    /**
     * @param path {string}
     * @returns {ZkPromise}
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
            const callback = (rc, error, result) => {
                if (rc) {
                    reject(rc);
                } else if (args.length > 3) {
                    // if there are multiple success values, we return an array
                    Array.prototype.shift.call(args, 1);
                    Array.prototype.shift.call(args, 1);
                    resolve(args);
                } else {
                    resolve(result);
                }
            };
            fn.bind(this)(...args, callback);
        });
    }
}

exports = module.exports = ZooKeeperPromise;
exports.ZK = ZooKeeperPromise; // backwards compatibility
