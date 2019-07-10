const ZooKeeper = require("./zookeeper");

class ZooKeeperPromise extends ZooKeeper {
  on_connected() {
    return new Promise((resolve) => {
      this.once('connect', () => {
        return resolve(this);
      });
    })
  }

  create() {
    return this._promisify(super.a_create, arguments);
  }

  exists() {
    return this._promisify(super.a_exists, arguments);
  }

  w_exists() {
    return this._promisify(super.aw_exists, arguments);
  }

  get() {
    return this._promisify(super.a_get, arguments);
  }

  w_get() {
    return this._promisify(super.aw_get, arguments);
  }

  get_children() {
    return this._promisify(super.a_get_children, arguments);
  }

  w_get_children() {
    return this._promisify(super.aw_get_children, arguments);
  }

  get_children2() {
    return this._promisify(super.a_get_children2, arguments);
  }

  w_get_children2() {
    return this._promisify(super.aw_get_children2, arguments);
  }

  set() {
    return this._promisify(super.a_set, arguments);
  }

  delete_() {
    return this._promisify(super.delete_, arguments);
  }

  get_acl() {
    return this._promisify(super.a_get_acl, arguments);
  }

  set_acl() {
    return this._promisify(super.a_set_acl, arguments);
  }

  sync() {
    return this._promisify(super.a_sync, arguments);
  }

  _promisify(fn, args) {
    return new Promise((resolve, reject) => {
      const callback = (rc, error, result) => {
        if (rc) {
          reject(rc);
        } else {
          if (args.length > 3) {
            // if there are multiple success values, we return an array
            Array.prototype.shift.call(args, 1);
            Array.prototype.shift.call(args, 1);
            resolve(args);
          } else {
            resolve(result);
          }
        }
      };
      fn.apply(this, [...args, callback])
    });
  }
}

exports = module.exports = ZooKeeperPromise;
exports.ZK = ZooKeeperPromise; // backwards compatibility
