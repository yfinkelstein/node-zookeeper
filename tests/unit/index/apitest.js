const { EventEmitter } = require('events');
const test = require('tape');
const ZooKeeper = require('../../../lib/index.js');

function assertPublicApi(zk, t) {
    t.plan(25);

    t.equal(typeof zk.a_create, 'function');
    t.equal(typeof zk.a_exists, 'function');
    t.equal(typeof zk.a_get, 'function');
    t.equal(typeof zk.a_get_acl, 'function');
    t.equal(typeof zk.a_get_children, 'function');

    t.equal(typeof zk.a_get_children2, 'function');
    t.equal(typeof zk.a_set, 'function');
    t.equal(typeof zk.a_set_acl, 'function');
    t.equal(typeof zk.a_sync, 'function');
    t.equal(typeof zk.add_auth, 'function');

    t.equal(typeof zk.aw_exists, 'function');
    t.equal(typeof zk.aw_get, 'function');
    t.equal(typeof zk.aw_get_children, 'function');
    t.equal(typeof zk.aw_get_children2, 'function');
    t.equal(typeof zk.close, 'function');

    t.equal(zk.config, undefined);
    t.equal(typeof zk.connect, 'function');
    t.equal(zk.data_as_buffer, true);
    t.equal(zk.encoding, null);
    t.equal(typeof zk.init, 'function');

    t.equal(zk.logger, undefined);
    t.equal(typeof zk.mkdirp, 'function');
    t.equal(typeof zk.setEncoding, 'function');
    t.equal(typeof zk.setLogger, 'function');

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
