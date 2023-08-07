const { join } = require('path');
const test = require('ava');
const NativeZk = require('node-gyp-build')(join(__dirname, '../../../')).ZooKeeper;
const constants = require('../../../lib/constants');
const ZooKeeper = require('../../../lib/zookeeper');

const keys = Object.keys(NativeZk);

test('native static constants are exported', (t) => {
    keys.forEach((key) => {
        t.is(constants[key], NativeZk[key]);
    });
});

test('deprecated legacy event constants are exported', (t) => {
    t.is(ZooKeeper.on_closed, 'close');
    t.is(ZooKeeper.on_connected, 'connect');
    t.is(ZooKeeper.on_connecting, 'connecting');
    t.is(ZooKeeper.on_event_created, 'created');

    t.is(ZooKeeper.on_event_deleted, 'deleted');
    t.is(ZooKeeper.on_event_changed, 'changed');
    t.is(ZooKeeper.on_event_child, 'child');
    t.is(ZooKeeper.on_event_notwatching, 'notwatching');
});

test('legacy event constants are exported', (t) => {
    t.is(constants.on_closed, 'close');
    t.is(constants.on_connected, 'connect');
    t.is(constants.on_connecting, 'connecting');
    t.is(constants.on_event_created, 'created');

    t.is(constants.on_event_deleted, 'deleted');
    t.is(constants.on_event_changed, 'changed');
    t.is(constants.on_event_child, 'child');
    t.is(constants.on_event_notwatching, 'notwatching');
});
