module.exports = require('./zookeeper');
module.exports.ZooKeeper = module.exports;  // for backwards compatibility
module.exports.Promise = require('./zk_promise');
module.exports.NativeZk = require(__dirname + '/../build/zookeeper.node').ZooKeeper;
