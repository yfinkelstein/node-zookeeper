const ZooKeeper = require('zookeeper');

const host = process.argv[2] || '127.0.0.1:2181';

/** @returns {ZooKeeper} */
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
