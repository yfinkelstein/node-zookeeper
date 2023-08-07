const { join } = require('path');
const test = require('ava');
const NativeZk = require('node-gyp-build')(join(__dirname, '../../../')).ZooKeeper;
const ZooKeeper = require('../../../lib/zookeeper');

test('ZooKeeper instance creates an instance of the native object', (t) => {
    const zk = new ZooKeeper({});

    t.true(zk.native instanceof NativeZk);
});

test('native object is extended with an emit function', (t) => {
    const zk = new ZooKeeper({});

    t.is(typeof zk.native.emit, 'function');
});

test('native object emit triggers a ZooKeeper emit', (t) => {
    const zk = new ZooKeeper({});

    zk.on('helloworld', (a, b, c) => {
        t.is(a, 1);
        t.is(b, 2);
        t.is(c, 3);
    });

    zk.native.emit('helloworld', 1, 2, 3);
});

test('native object emits connect and pass an instance of the current ZooKeeper', (t) => {
    const zk = new ZooKeeper({});

    zk.on('connect', (a, b, c) => {
        t.true(a instanceof ZooKeeper);
        t.is(b, 2);
        t.is(c, 3);
    });

    zk.native.emit('connect', 1, 2, 3);
});

test('native object emits close and pass an instance of the current ZooKeeper', (t) => {
    const zk = new ZooKeeper({});

    zk.on('close', (a, b, c) => {
        t.true(a instanceof ZooKeeper);
        t.is(b, 2);
        t.is(c, 3);
    });

    zk.native.emit('close', 1, 2, 3);
});

test('native zookeeper add_auth', (t) => {
    const zk = new ZooKeeper({});

    t.throws(() => zk.native.add_auth('digest'), undefined, 'expected 3 arguments');
    t.throws(() => zk.native.add_auth('digest', 'user:'), undefined, 'expected 3 arguments');
    t.notThrows(() => zk.native.add_auth('digest', 'user:', () => {}), undefined, 'expected 3 arguments');
});
