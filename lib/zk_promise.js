// needed to not break the interface
/* eslint-disable camelcase */
const ZooKeeper = require('./zookeeper');

class ZooKeeperPromise extends ZooKeeper {
    on_connected() {
        return new Promise((resolve) => {
            this.once('connect', () => resolve(this));
        });
    }

    create(...args) {
        return this.promisify(super.a_create, args);
    }

    exists(...args) {
        return this.promisify(super.a_exists, args);
    }

    w_exists(...args) {
        return this.promisify(super.aw_exists, args);
    }

    get(...args) {
        return this.promisify(super.a_get, args);
    }

    w_get(...args) {
        return this.promisify(super.aw_get, args);
    }

    get_children(...args) {
        return this.promisify(super.a_get_children, args);
    }

    w_get_children(...args) {
        return this.promisify(super.aw_get_children, args);
    }

    get_children2(...args) {
        return this.promisify(super.a_get_children2, args);
    }

    w_get_children2(...args) {
        return this.promisify(super.aw_get_children2, args);
    }

    set(...args) {
        return this.promisify(super.a_set, args);
    }

    // eslint-disable-next-line no-underscore-dangle
    delete_(...args) {
        // eslint-disable-next-line no-underscore-dangle
        return this.promisify(super.delete_, args);
    }

    get_acl(...args) {
        return this.promisify(super.a_get_acl, args);
    }

    set_acl(...args) {
        return this.promisify(super.a_set_acl, args);
    }

    sync(...args) {
        return this.promisify(super.a_sync, args);
    }

    promisify(fn, args) {
        return new Promise((resolve, reject) => {
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
