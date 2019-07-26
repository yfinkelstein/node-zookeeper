const test = require('tape');
const NativeZk = require('./../../build/zookeeper.node').ZooKeeper;
const ZooKeeper = require('../../lib/zookeeper.js');

const keys = Object.keys(NativeZk);

test('native static constants are exported', (t) => {
    t.plan(keys.length);

    keys.forEach((key) => {
        t.equal(ZooKeeper[key], NativeZk[key]);
    });
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
