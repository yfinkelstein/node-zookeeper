const test = require('tape');
const ZooKeeper = require('../../../lib/index.js');

test('inject config', (t) => {
    t.plan(1);

    const expected = '127.0.0.1:2181';

    const zk = new ZooKeeper({ connect: expected });

    t.equal(zk.config.connect, expected);
});

test('inject connection config as a string', (t) => {
    t.plan(2);

    const expected = '127.0.0.1:2181';

    const zk = new ZooKeeper(expected);

    t.equal(zk.config.connect, expected);
    t.equal(Object.keys(zk.config).length, 1);
});
