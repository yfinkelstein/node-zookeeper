const test = require('tape');
const ZooKeeper = require('../lib/index.js');

function assertPublicApi(zk, t) {
    t.plan(24);

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

    t.equal(typeof zk.config, 'object');
    t.equal(typeof zk.connect, 'function');
    t.equal(typeof zk.data_as_buffer, 'boolean');
    t.equal(zk.encoding, null);
    t.equal(typeof zk.init, 'function');

    t.equal(zk.logger, undefined);
    t.equal(typeof zk.mkdirp, 'function');
    t.equal(typeof zk.setEncoding, 'function');
    t.equal(typeof zk.setLogger, 'function');
}

const fakeConfig = { hello: 'world' };

test('ZooKeeper public API', (t) => {
    const zk = new ZooKeeper(fakeConfig);

    assertPublicApi(zk, t);
});

test('ZooKeeper Promise public API', (t) => {
    const zk = new ZooKeeper.Promise(fakeConfig);

    assertPublicApi(zk, t);
});

test('ZooKeeper Legacy public API', (t) => {
    const zk = new ZooKeeper.ZooKeeper(fakeConfig);

    assertPublicApi(zk, t);
});