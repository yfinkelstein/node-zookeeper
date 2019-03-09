const test = require('tape');
const ZooKeeper = require('../../lib/index.js');

test('inject config', (t) => {
    t.plan(1);

    const expected = '127.0.0.1:2181';

    const zk = new ZooKeeper({ connect: expected });

    t.equal(zk.config.connect, expected);
});