const test = require('tape');

const ZooKeeper = require('../../lib/zookeeper.js');

test('native zookeeper object is extended with an emit function', (t) => {
    t.plan(1);

    const zk = new ZooKeeper();

    t.equal(typeof zk._native.emit, 'function');
});