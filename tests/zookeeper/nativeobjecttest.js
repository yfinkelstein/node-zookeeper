const test = require('tape');
const proxyquire = require('proxyquire');
const { FakeNativeZooKeeper, path } = require('../helpers/fakes.js');

FakeNativeZooKeeper.hello = 'world';

const ZooKeeper = proxyquire('../../lib/zookeeper.js', {
    [path]: { ZooKeeper: FakeNativeZooKeeper }
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