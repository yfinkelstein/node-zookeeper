// needed to not break the interface
/* eslint-disable camelcase */
const ZkPromise = require('./promise');
const ZooKeeper = require('./zookeeper');

class ZooKeeperPromise extends ZooKeeper {
    on_connected() {
        return new ZkPromise((resolve) => {
            this.once('connect', () => resolve(this));
        });
    }

    create(path, data, flags) {
        return this.promisify(super.a_create, [path, data, flags]);
    }

    exists(path, watch) {
        return this.promisify(super.a_exists, [path, watch]);
    }

    w_exists(path, watchCb) {
        return this.promisify(super.aw_exists, [path, watchCb]);
    }

    get(path, watch) {
        return this.promisify(super.a_get, [path, watch]);
    }

    w_get(path, watchCb) {
        return this.promisify(super.aw_get, [path, watchCb]);
    }

    get_children(path, watch) {
        return this.promisify(super.a_get_children, [path, watch]);
    }

    w_get_children(path, watchCb) {
        return this.promisify(super.aw_get_children, [path, watchCb]);
    }

    get_children2(path, watch) {
        return this.promisify(super.a_get_children2, [path, watch]);
    }

    w_get_children2(path, watchCb) {
        return this.promisify(super.aw_get_children2, [path, watchCb]);
    }

    set(path, data, version) {
        return this.promisify(super.a_set, [path, data, version]);
    }

    // eslint-disable-next-line no-underscore-dangle
    delete_(path, version) {
        // eslint-disable-next-line no-underscore-dangle
        return this.promisify(super.a_delete_, [path, version]);
    }

    get_acl(path) {
        return this.promisify(super.a_get_acl, [path]);
    }

    set_acl(path, version, acl) {
        return this.promisify(super.a_set_acl, [path, version, acl]);
    }

    sync(path) {
        return this.promisify(super.a_sync, [path]);
    }

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
