const ZooKeeper = require('../lib/index.js').Promise;

const host = process.argv[2] || '127.0.0.1:2181';

/**
 * @param timeoutMs {number}
 * @returns {ZooKeeperPromise}
 */
function createClient(timeoutMs = 5000) {
    const config = {
        connect: host,
        timeout: timeoutMs,
        debug_level: ZooKeeper.ZOO_LOG_LEVEL_WARN,
        host_order_deterministic: false,
    };

    return new ZooKeeper(config);
}

module.exports = {
    createClient,
    ZooKeeper,
};
