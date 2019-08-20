const test = require('tape');

const ZooKeeper = require('../../../lib/zookeeper.js');

test('native zookeeper proxy properties are added to the ZooKeeper instance', (t) => {
    t.plan(5);

    const zk = new ZooKeeper({});

    t.equal(zk.state, 0);
    t.equal(zk.timeout, -1);
    t.equal(zk.client_id, '0');
    t.equal(zk.client_password, '00000000000000000000000000000000');
    t.equal(zk.is_unrecoverable, 0);
});
