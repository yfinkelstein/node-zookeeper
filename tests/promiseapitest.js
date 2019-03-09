const test = require('tape');
const ZooKeeper = require('../lib/index.js').Promise;

test('ZooKeeper Promise public API', (assert) => {
    assert.plan(24);

    const fakeConfig = { hello: 'world' };
    const zk = new ZooKeeper(fakeConfig);

    assert.equal(typeof zk.a_create, 'function');
    assert.equal(typeof zk.a_exists, 'function');
    assert.equal(typeof zk.a_get, 'function');
    assert.equal(typeof zk.a_get_acl, 'function');
    assert.equal(typeof zk.a_get_children, 'function');

    assert.equal(typeof zk.a_get_children2, 'function');
    assert.equal(typeof zk.a_set, 'function');
    assert.equal(typeof zk.a_set_acl, 'function');
    assert.equal(typeof zk.a_sync, 'function');
    assert.equal(typeof zk.add_auth, 'function');

    assert.equal(typeof zk.aw_exists, 'function');
    assert.equal(typeof zk.aw_get, 'function');
    assert.equal(typeof zk.aw_get_children, 'function');
    assert.equal(typeof zk.aw_get_children2, 'function');
    assert.equal(typeof zk.close, 'function');

    assert.equal(zk.config.hello, 'world');
    assert.equal(typeof zk.connect, 'function');
    assert.equal(typeof zk.data_as_buffer, 'boolean');
    assert.equal(zk.encoding, null);
    assert.equal(typeof zk.init, 'function');

    assert.equal(zk.logger, undefined);
    assert.equal(typeof zk.mkdirp, 'function');
    assert.equal(typeof zk.setEncoding, 'function');
    assert.equal(typeof zk.setLogger, 'function');
});