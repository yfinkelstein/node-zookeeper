const test = require('tape');
const NativeZk = require('../../../build/zookeeper.node').ZooKeeper;
const ZooKeeper = require('../../../lib/zookeeper');


test('ZooKeeper instance creates an instance of the native object', (t) => {
    t.plan(1);

    const zk = new ZooKeeper({});

    t.true(zk.native instanceof NativeZk);
});

test('native object is extended with an emit function', (t) => {
    t.plan(1);

    const zk = new ZooKeeper({});

    t.equal(typeof zk.native.emit, 'function');
});

test('native object emit triggers a ZooKeeper emit', (t) => {
    const zk = new ZooKeeper({});

    zk.on('helloworld', (a, b, c) => {
        t.equal(a, 1);
        t.equal(b, 2);
        t.equal(c, 3);
        t.end();
    });

    zk.native.emit('helloworld', 1, 2, 3);
});

test('native object emits connect and pass an instance of the current ZooKeeper', (t) => {
    const zk = new ZooKeeper({});

    zk.on('connect', (a, b, c) => {
        t.true(a instanceof ZooKeeper);
        t.equal(b, 2);
        t.equal(c, 3);
        t.end();
    });

    zk.native.emit('connect', 1, 2, 3);
});

test('native object emits close and pass an instance of the current ZooKeeper', (t) => {
    const zk = new ZooKeeper({});

    zk.on('close', (a, b, c) => {
        t.true(a instanceof ZooKeeper);
        t.equal(b, 2);
        t.equal(c, 3);
        t.end();
    });

    zk.native.emit('close', 1, 2, 3);
});
