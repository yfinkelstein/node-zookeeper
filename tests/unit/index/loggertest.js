/* eslint-disable no-console */
const test = require('tape');
const ZooKeeper = require('../../../lib/index.js');

test('Inject custom logger', (t) => {
    t.plan(1);

    const zk = new ZooKeeper();
    zk.setLogger(console.log);

    t.equal(zk.logger, console.log);
});

test('Use default logger', (t) => {
    t.plan(1);

    const zk = new ZooKeeper();
    zk.setLogger(true);

    t.equal(typeof zk.logger, 'function');
});

test('Explicit set use no logger', (t) => {
    t.plan(1);

    const zk = new ZooKeeper();
    zk.setLogger(false);

    t.equal(zk.logger, undefined);
});
