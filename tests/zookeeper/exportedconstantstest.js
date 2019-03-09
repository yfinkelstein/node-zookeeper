const test = require('tape');
const proxyquire = require('proxyquire');
const { FakeNativeZooKeeper, path } = require('../helpers/fakes.js');

FakeNativeZooKeeper.hello = 'world';

const ZooKeeper = proxyquire('../../lib/zookeeper.js', {
    [path]: { ZooKeeper: FakeNativeZooKeeper }
});

test('native static constants are exported', (t) => {
    t.plan(1);

    t.equal(ZooKeeper.hello, FakeNativeZooKeeper.hello);
});

test('legacy event constants are exported', (t) => {
    t.plan(8);

    t.equal(ZooKeeper.on_closed, 'close');
    t.equal(ZooKeeper.on_connected, 'connect');
    t.equal(ZooKeeper.on_connecting, 'connecting');
    t.equal(ZooKeeper.on_event_created, 'created');

    t.equal(ZooKeeper.on_event_deleted, 'deleted');
    t.equal(ZooKeeper.on_event_changed, 'changed');
    t.equal(ZooKeeper.on_event_child, 'child');
    t.equal(ZooKeeper.on_event_notwatching, 'notwatching');
});
