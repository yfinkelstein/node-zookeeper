/* eslint-disable no-param-reassign */
/* eslint-disable no-return-assign */

const { deprecationLog } = require('./helper');

/**
 * @extends Promise
 */
class ZkPromise extends Promise {
    /**
     * @deprecated
     */
    get(propertyName) {
        deprecationLog(ZkPromise.name, 'get');
        return this.then(object => object[propertyName]);
    }

    /**
     * @deprecated
     */
    put(propertyName, value) {
        deprecationLog(ZkPromise.name, 'put');
        return this.then(object => object[propertyName] = value);
    }

    /**
     * @deprecated
     */
    call(functionName, ...args) {
        deprecationLog(ZkPromise.name, 'call');
        return this.then(object => object[functionName](...args));
    }

    /**
     * @deprecated
     */
    addCallback(callback) {
        deprecationLog(ZkPromise.name, 'addCallback');
        return this.then(callback);
    }

    /**
     * @deprecated
     */
    addErrback(callback) {
        deprecationLog(ZkPromise.name, 'addErrback');
        return this.catch(callback);
    }

    /**
     * @deprecated
     */
    addBoth(callback) {
        deprecationLog(ZkPromise.name, 'addBoth');
        return this.then(callback, callback);
    }

    /**
     * @deprecated
     */
    addCallbacks(callback, errback) {
        deprecationLog(ZkPromise.name, 'addCallbacks');
        return this.then(callback, errback);
    }
}

exports = module.exports = ZkPromise;
