const test = require('tape');
const NativeZk = require('./../../build/zookeeper.node').ZooKeeper;
const constants = require('../../lib/constants.js');

const keys = Object.keys(NativeZk);

test('native static constants are exported', (t) => {
    t.plan(keys.length);

    keys.forEach((key) => {
        t.equal(constants[key], NativeZk[key]);
    });
});

test('legacy event constants are exported', (t) => {
    t.plan(8);

    t.equal(constants.on_closed, 'close');
    t.equal(constants.on_connected, 'connect');
    t.equal(constants.on_connecting, 'connecting');
    t.equal(constants.on_event_created, 'created');

    t.equal(constants.on_event_deleted, 'deleted');
    t.equal(constants.on_event_changed, 'changed');
    t.equal(constants.on_event_child, 'child');
    t.equal(constants.on_event_notwatching, 'notwatching');
});
