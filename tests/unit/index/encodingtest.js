const test = require('ava');
const ZooKeeper = require('../../../lib/index');

test('inject encoding will set data as buffer to false', (t) => {
    const expected = 'utf-8';

    const zk = new ZooKeeper();
    zk.setEncoding(expected);

    t.is(zk.encoding, expected);
    t.is(zk.data_as_buffer, false);
});
