const { EventEmitter } = require('events');
const test = require('ava');
const ZooKeeper = require('../../../lib/index');

function assertPublicApi(zk, t) {
    t.is(typeof zk.a_create, 'function');
    t.is(typeof zk.a_createTtl, 'function');
    t.is(typeof zk.a_exists, 'function');
    t.is(typeof zk.a_get, 'function');
    t.is(typeof zk.a_get_acl, 'function');
    t.is(typeof zk.a_get_children, 'function');

    t.is(typeof zk.a_get_children2, 'function');
    t.is(typeof zk.a_set, 'function');
    t.is(typeof zk.a_set_acl, 'function');
    t.is(typeof zk.a_sync, 'function');
    t.is(typeof zk.add_auth, 'function');

    t.is(typeof zk.aw_exists, 'function');
    t.is(typeof zk.aw_get, 'function');
    t.is(typeof zk.aw_get_children, 'function');
    t.is(typeof zk.aw_get_children2, 'function');
    t.is(typeof zk.close, 'function');

    t.is(zk.config, undefined);
    t.is(typeof zk.connect, 'function');
    t.is(zk.data_as_buffer, true);
    t.is(zk.encoding, null);
    t.is(typeof zk.init, 'function');

    t.is(zk.logger, undefined);
    t.is(typeof zk.mkdirp, 'function');
    t.is(typeof zk.setEncoding, 'function');
    t.is(typeof zk.setLogger, 'function');

    t.true(zk instanceof EventEmitter);
}

test('public API', (t) => {
    assertPublicApi(new ZooKeeper(), t);
});

test('Promise public API', (t) => {
    assertPublicApi(new ZooKeeper.Promise(), t);
});

test('Legacy public API', (t) => {
    assertPublicApi(new ZooKeeper.ZooKeeper(), t);
});
