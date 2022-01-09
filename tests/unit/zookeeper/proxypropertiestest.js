const test = require('ava');

const ZooKeeper = require('../../../lib/zookeeper');

test('native zookeeper proxy properties are added to the ZooKeeper instance', (t) => {
    const zk = new ZooKeeper({});

    t.is(zk.state, 0);
    t.is(zk.timeout, -1);
    t.is(zk.client_id, '0');
    t.is(zk.client_password, '00000000000000000000000000000000');
    t.is(zk.is_unrecoverable, 0);
});
