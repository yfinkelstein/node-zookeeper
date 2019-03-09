const path = require('path');

class FakeNativeZooKeeper {}

module.exports = {
    path: `${path.join(__dirname, '../../lib/')}/../build/zookeeper.node`,
    FakeNativeZooKeeper,
};
