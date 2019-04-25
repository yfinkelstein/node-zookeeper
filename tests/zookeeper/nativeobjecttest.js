/* eslint-disable no-underscore-dangle */
const test = require('tape');
const proxyquire = require('proxyquire');
const { FakeNativeZooKeeper, path } = require('../helpers/fakes.js');

const ZooKeeper = proxyquire('../../lib/zookeeper.js', {
    [path]: { ZooKeeper: FakeNativeZooKeeper },
});

test('ZooKeeper instance creates an instance of the native object', (t) => {
    t.plan(1);

    const zk = new ZooKeeper();

    t.true(zk._native instanceof FakeNativeZooKeeper);
});

test('native object is extended with an emit function', (t) => {
    t.plan(1);

    const zk = new ZooKeeper();

    t.equal(typeof zk._native.emit, 'function');
});

test('native object emit triggers a ZooKeeper emit', (t) => {
    const zk = new ZooKeeper();

    zk.on('helloworld', (a, b, c) => {
        t.equal(a, 1);
        t.equal(b, 2);
        t.equal(c, 3);
        t.end();
    });

    zk._native.emit('helloworld', 1, 2, 3);
});

test('native object emits connect and pass an instance of the current ZooKeeper', (t) => {
    const zk = new ZooKeeper();

    zk.on('connect', (a, b, c) => {
        t.true(a instanceof ZooKeeper);
        t.equal(b, 2);
        t.equal(c, 3);
        t.end();
    });

    zk._native.emit('connect', 1, 2, 3);
});

test('native object emits close and pass an instance of the current ZooKeeper', (t) => {
    const zk = new ZooKeeper();

    zk.on('close', (a, b, c) => {
        t.true(a instanceof ZooKeeper);
        t.equal(b, 2);
        t.equal(c, 3);
        t.end();
    });

    zk._native.emit('close', 1, 2, 3);
});
