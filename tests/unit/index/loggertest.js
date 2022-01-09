/* eslint-disable no-console */
const test = require('ava');
const ZooKeeper = require('../../../lib/index');

test('Inject custom logger', (t) => {
    const zk = new ZooKeeper();
    zk.setLogger(console.log);

    t.is(zk.logger, console.log);
});

test('Use default logger', (t) => {
    const zk = new ZooKeeper();
    zk.setLogger(true);

    t.is(typeof zk.logger, 'function');
});

test('Explicit set use no logger', (t) => {
    const zk = new ZooKeeper();
    zk.setLogger(false);

    t.is(zk.logger, undefined);
});
