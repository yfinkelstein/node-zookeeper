const test = require('tape');
const ZooKeeper = require('../../../lib/index.js');

test('inject encoding will set data as buffer to false', (t) => {
    t.plan(2);

    const expected = 'utf-8';

    const zk = new ZooKeeper();
    zk.setEncoding(expected);

    t.equal(zk.encoding, expected);
    t.equal(zk.data_as_buffer, false);
});
